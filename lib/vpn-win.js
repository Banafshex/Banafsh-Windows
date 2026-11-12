'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { execFile, spawn } = require('child_process');
const { HOST_RE } = require('./probes');
const { buildBypassCidrs } = require('./bypass');

const CONN = 'Banafsh';

const psQuote = (s) => "'" + String(s ?? '').replace(/'/g, "''") + "'";

function run(file, args, timeout = 60000) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true, timeout }, (err, stdout, stderr) => {
      resolve({
        code: err ? (typeof err.code === 'number' ? err.code : 1) : 0,
        out: String(stdout || ''),
        err: String(stderr || '')
      });
    });
  });
}

function ps(cmd, timeout = 60000) {
  return run(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', cmd],
    timeout
  );
}

async function isAdmin() {
  if (process.platform !== 'win32') return true;
  const r = await run('whoami', ['/groups'], 10000);
  return r.out.includes('S-1-16-12288');
}

async function isConnected() {
  if (process.platform !== 'win32') return false;
  const r = await run('rasdial', [], 10000);
  const re = new RegExp('(^|\\r?\\n)\\s*' + CONN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)', 'i');
  return r.code === 0 && re.test(r.out);
}

/**
 * Finds the physical default IPv4 gateway (excluding the 'Banafsh' VPN tunnel)
 * so bypass routes go directly through the user's ISP adapter.
 */
async function getPhysicalGateway() {
  if (process.platform !== 'win32') return null;
  const cmd = `
    $rt = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.NextHop -ne '0.0.0.0' -and $_.InterfaceAlias -ne ${psQuote(CONN)} } |
      Sort-Object { $_.RouteMetric + $_.InterfaceMetric } |
      Select-Object -First 1 NextHop, InterfaceIndex
    if ($rt) { $rt | ConvertTo-Json -Compress }
  `;
  const r = await ps(cmd, 12000);
  try {
    const j = JSON.parse(r.out.trim());
    const hop = String(j.NextHop || '').trim();
    const idx = Number(j.InterfaceIndex);
    if (net.isIPv4(hop) && Number.isInteger(idx) && idx > 0) {
      return { hop, idx };
    }
  } catch {}
  return null;
}

/**
 * Removes all active-store bypass routes previously added by Banafsh in a single netsh batch.
 */
async function clearBypassRoutes(routeStateFile) {
  if (!routeStateFile || !fs.existsSync(routeStateFile)) return;
  let saved = null;
  try {
    saved = JSON.parse(fs.readFileSync(routeStateFile, 'utf8'));
  } catch {}
  try { fs.unlinkSync(routeStateFile); } catch {}

  if (process.platform !== 'win32' || !saved || !Array.isArray(saved.cidrs) || !saved.cidrs.length) {
    return;
  }
  const hop = String(saved.hop || '').trim();
  const idx = Number(saved.idx);
  if (!net.isIPv4(hop) || !Number.isInteger(idx) || idx <= 0) return;

  const tmpScript = path.join(os.tmpdir(), `banafsh-routes-del-${process.pid}-${Date.now()}.txt`);
  try {
    const lines = ['interface ipv4'];
    for (const cidr of saved.cidrs) {
      if (/^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(cidr)) {
        lines.push(`delete route prefix=${cidr} interface=${idx} nexthop=${hop} store=active`);
      }
    }
    fs.writeFileSync(tmpScript, lines.join('\r\n') + '\r\n', 'ascii');
    await run('netsh', ['-f', tmpScript], 45000);
  } catch {} finally {
    try { fs.unlinkSync(tmpScript); } catch {}
  }
}

/**
 * Applies all CIDR bypass routes (Iranian IP blocks + custom sites) in a single
 * RAM-only (`store=active`) netsh batch so thousands of routes apply in ~0.3s.
 */
async function applyBypassRoutes(cidrs, gw, routeStateFile) {
  await clearBypassRoutes(routeStateFile);
  if (process.platform !== 'win32') return 0;
  if (!Array.isArray(cidrs) || !cidrs.length || !gw || !net.isIPv4(gw.hop) || !Number.isInteger(gw.idx)) {
    return 0;
  }

  const validCidrs = cidrs.filter((c) => /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(c));
  if (!validCidrs.length) return 0;

  try {
    if (routeStateFile) {
      fs.mkdirSync(path.dirname(routeStateFile), { recursive: true });
      fs.writeFileSync(routeStateFile, JSON.stringify({ hop: gw.hop, idx: gw.idx, cidrs: validCidrs }), 'utf8');
    }
  } catch {}

  const tmpScript = path.join(os.tmpdir(), `banafsh-routes-add-${process.pid}-${Date.now()}.txt`);
  try {
    const lines = ['interface ipv4'];
    for (const cidr of validCidrs) {
      lines.push(`add route prefix=${cidr} interface=${gw.idx} nexthop=${gw.hop} metric=5 store=active`);
    }
    fs.writeFileSync(tmpScript, lines.join('\r\n') + '\r\n', 'ascii');
    await run('netsh', ['-f', tmpScript], 45000);
    return validCidrs.length;
  } catch {
    return 0;
  } finally {
    try { fs.unlinkSync(tmpScript); } catch {}
  }
}

let proxyWasSetByApp = false;

async function applyWinHttpProxy(settings) {
  if (process.platform !== 'win32') return;
  if (!settings || !settings.proxyEnabled || !settings.proxyHost) return;
  const host = String(settings.proxyHost).trim();
  const port = Math.min(65535, Math.max(1, Number(settings.proxyPort) || 8080));
  if (!HOST_RE.test(host)) return;
  await run('netsh', ['winhttp', 'set', 'proxy', `${host}:${port}`], 10000);
  proxyWasSetByApp = true;
}

async function clearWinHttpProxyIfNeeded() {
  if (process.platform !== 'win32' || !proxyWasSetByApp) return;
  proxyWasSetByApp = false;
  await run('netsh', ['winhttp', 'reset', 'proxy'], 10000);
}

async function disconnectAll(routeStateFile) {
  if (process.platform === 'win32') {
    await run('rasdial', [CONN, '/disconnect'], 20000);
    await clearWinHttpProxyIfNeeded();
  }
  await clearBypassRoutes(routeStateFile);
}

/**
 * Ensures Windows IPsec NAT-Traversal rule (KB926179) and required services are active
 * so L2TP/IPsec servers behind NAT (such as VPN Gate servers) can establish tunnels.
 */
async function ensureL2tpReady(enableNatT = true) {
  if (process.platform !== 'win32') return { natTUpdated: false };
  const script = `
    $updated = $false
    if (${enableNatT ? '$true' : '$false'}) {
      $regPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\PolicyAgent'
      $cur = (Get-ItemProperty -Path $regPath -Name 'AssumeUDPEncapsulationContextOnSendRule' -ErrorAction SilentlyContinue).AssumeUDPEncapsulationContextOnSendRule
      if ($cur -ne 2) {
        New-ItemProperty -Path $regPath -Name 'AssumeUDPEncapsulationContextOnSendRule' -PropertyType DWord -Value 2 -Force | Out-Null
        $updated = $true
      }
    }
    Start-Service PolicyAgent -ErrorAction SilentlyContinue
    Start-Service IKEEXT -ErrorAction SilentlyContinue
    if ($updated) {
      Restart-Service IKEEXT -Force -ErrorAction SilentlyContinue
      Restart-Service PolicyAgent -Force -ErrorAction SilentlyContinue
    }
    Write-Output $(if ($updated) { 'UPDATED' } else { 'OK' })
  `;
  const r = await ps(script, 20000);
  return { natTUpdated: r.out.includes('UPDATED') };
}

async function ensureSstpReady() {
  if (process.platform !== 'win32') return;
  const script = `
    $regPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\SstpSvc\\Parameters'
    if (Test-Path $regPath) {
      $cur = (Get-ItemProperty -Path $regPath -Name 'NoCertRevocationCheck' -ErrorAction SilentlyContinue).NoCertRevocationCheck
      if ($cur -ne 1) {
        New-ItemProperty -Path $regPath -Name 'NoCertRevocationCheck' -PropertyType DWord -Value 1 -Force | Out-Null
      }
    }
    Start-Service SstpSvc -ErrorAction SilentlyContinue
  `;
  await ps(script, 12000);
}

function classifyRasError(rawText, protocol) {
  const txt = String(rawText || '').trim();
  const codeMatch = txt.match(/\b(691|720|789|800|809|868)\b/);
  const rasCode = codeMatch ? Number(codeMatch[1]) : 0;
  return {
    rasCode,
    protocol,
    raw: txt
  };
}

/**
 * Configures and dials the Windows VPN connection ('Banafsh') using either L2TP/IPsec or SSTP,
 * and applies direct "No VPN" routes (Iranian IP ranges + custom sites).
 */
async function configureAndDial({
  protocol = 'l2tp',
  host,
  port = 443,
  user = 'vpn',
  pass = 'vpn',
  psk = 'vpn',
  settings = {},
  dataDir = '',
  bundledIranRangesPath = '',
  routeStateFile = '',
  isCancelled = () => false
}) {
  const proto = protocol === 'sstp' ? 'sstp' : 'l2tp';
  host = String(host || '').trim();
  port = Math.min(65535, Math.max(1, Number(port) || 443));

  if (!host || !HOST_RE.test(host)) {
    return { ok: false, error: 'Invalid host', errorCode: 'BAD_HOST' };
  }

  await disconnectAll(routeStateFile);
  if (isCancelled()) return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };

  // Resolve physical gateway & domestic DNS before dialing VPN so CDN geo-IPs resolve locally
  const wantBypass = Boolean(
    settings.iranSitesEnabled ||
    (settings.customSitesEnabled !== false && Array.isArray(settings.sites) && settings.sites.length > 0)
  );
  let gw = null;
  let bypassCidrs = [];
  if (wantBypass) {
    [gw, bypassCidrs] = await Promise.all([
      getPhysicalGateway(),
      buildBypassCidrs({
        dataDir,
        bundledPath: bundledIranRangesPath,
        iranSitesEnabled: !!settings.iranSitesEnabled,
        customSitesEnabled: settings.customSitesEnabled !== false,
        sites: Array.isArray(settings.sites) ? settings.sites : [],
        excludeHost: host
      })
    ]);
  }

  if (isCancelled()) return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };

  let natTUpdated = false;
  if (proto === 'l2tp') {
    const prep = await ensureL2tpReady(settings.l2tpNatT !== false);
    natTUpdated = prep.natTUpdated;
  } else {
    await ensureSstpReady();
    if (settings.proxyEnabled) {
      await applyWinHttpProxy(settings);
    }
  }

  if (isCancelled()) {
    await clearWinHttpProxyIfNeeded();
    return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };
  }

  const serverAddr = proto === 'sstp' && port !== 443 ? `${host}:${port}` : host;
  const addArgs = proto === 'sstp'
    ? `-Name ${psQuote(CONN)} -ServerAddress ${psQuote(serverAddr)} -TunnelType Sstp -EncryptionLevel Required -AuthenticationMethod MSChapv2 -SplitTunneling:$false -Force`
    : `-Name ${psQuote(CONN)} -ServerAddress ${psQuote(serverAddr)} -TunnelType L2tp -L2tpPsk ${psQuote(psk || 'vpn')} -EncryptionLevel Optional -AuthenticationMethod MSChapv2,Chap,Pap -SplitTunneling:$false -Force`;

  const setupCmd = `
    $ErrorActionPreference = 'Stop'
    $ex = Get-VpnConnection -Name ${psQuote(CONN)} -ErrorAction SilentlyContinue
    if ($ex) {
      Remove-VpnConnection -Name ${psQuote(CONN)} -Force -ErrorAction SilentlyContinue
    }
    Add-VpnConnection ${addArgs} | Out-Null
  `;

  let r = await ps(setupCmd, 25000);
  if (r.code) {
    await clearWinHttpProxyIfNeeded();
    return { ok: false, error: (r.err || r.out).trim(), errorCode: 'VPN_SETUP_FAILED' };
  }

  if (isCancelled()) {
    await disconnectAll(routeStateFile);
    return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };
  }

  r = await run('rasdial', [CONN, String(user || 'vpn'), String(pass || 'vpn')], 45000);
  if (r.code) {
    await clearWinHttpProxyIfNeeded();
    const diag = classifyRasError(r.out + '\n' + r.err, proto);
    return {
      ok: false,
      error: diag.raw || 'rasdial failed',
      rasCode: diag.rasCode,
      natTUpdated,
      errorCode: proto === 'l2tp' && (diag.rasCode === 809 || diag.rasCode === 789) ? 'L2TP_NO_RESPONSE' : 'DIAL_FAILED'
    };
  }

  if (isCancelled()) {
    await disconnectAll(routeStateFile);
    return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };
  }

  // Apply direct bypass routes (Iranian IP ranges + custom sites)
  let routesApplied = 0;
  if (gw && bypassCidrs.length > 0) {
    routesApplied = await applyBypassRoutes(bypassCidrs, gw, routeStateFile);
  }

  // Apply optional custom DNS on the active VPN interface if configured in Advanced settings
  if (settings.customDnsEnabled && settings.customDns && net.isIPv4(String(settings.customDns).trim())) {
    const dnsIp = String(settings.customDns).trim();
    await run('netsh', ['interface', 'ipv4', 'set', 'dnsservers', `name=${CONN}`, 'static', dnsIp, 'primary', 'validate=no'], 10000);
  }

  return { ok: true, protocol: proto, host, port, routesApplied };
}

/**
 * Rebuilds and updates direct bypass routes live while the VPN is already connected.
 */
async function syncBypassRoutesLive({
  settings = {},
  dataDir = '',
  bundledIranRangesPath = '',
  routeStateFile = '',
  currentServerHost = ''
}) {
  const active = await isConnected();
  if (!active) {
    await clearBypassRoutes(routeStateFile);
    return { ok: true, active: false, routesApplied: 0 };
  }

  const wantBypass = Boolean(
    settings.iranSitesEnabled ||
    (settings.customSitesEnabled !== false && Array.isArray(settings.sites) && settings.sites.length > 0)
  );
  if (!wantBypass) {
    await clearBypassRoutes(routeStateFile);
    return { ok: true, active: true, routesApplied: 0 };
  }

  const [gw, cidrs] = await Promise.all([
    getPhysicalGateway(),
    buildBypassCidrs({
      dataDir,
      bundledPath: bundledIranRangesPath,
      iranSitesEnabled: !!settings.iranSitesEnabled,
      customSitesEnabled: settings.customSitesEnabled !== false,
      sites: Array.isArray(settings.sites) ? settings.sites : [],
      excludeHost: currentServerHost
    })
  ]);

  if (!gw) return { ok: false, active: true, routesApplied: 0 };
  const routesApplied = await applyBypassRoutes(cidrs, gw, routeStateFile);
  return { ok: true, active: true, routesApplied };
}

/**
 * Starts a lightweight single-process traffic & IP sampler for the 'Banafsh' PPP interface.
 * Calls onSample({ downBps, upBps, ip }) once per second while connected.
 */
function createStatsSampler(onSample) {
  let proc = null;
  let lastRx = null;
  let lastTx = null;
  let lastAt = 0;
  let buffer = '';

  function stop() {
    if (proc) {
      try { proc.kill(); } catch {}
      proc = null;
    }
    lastRx = null;
    lastTx = null;
    lastAt = 0;
    buffer = '';
  }

  function start() {
    stop();
    if (process.platform !== 'win32') return;

    const script = [
      "while ($true) {",
      `  $nic = [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() | Where-Object { $_.Name -eq '${CONN}' } | Select-Object -First 1;`,
      "  if ($nic) {",
      "    $st = $nic.GetIPv4Statistics();",
      "    $ip = ($nic.GetIPProperties().UnicastAddresses | Where-Object { $_.Address.AddressFamily -eq 'InterNetwork' } | Select-Object -First 1).Address.IPAddressToString;",
      "    [Console]::Out.WriteLine(\"$($st.BytesReceived)|$($st.BytesSent)|$ip\");",
      "    [Console]::Out.Flush();",
      "  }",
      "  Start-Sleep -Milliseconds 1000;",
      "}"
    ].join(' ');

    try {
      proc = spawn(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
        { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }
      );

      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';
        for (const line of lines) {
          const parts = line.trim().split('|');
          if (parts.length < 2) continue;
          const rx = Number(parts[0]);
          const tx = Number(parts[1]);
          const ip = (parts[2] || '').trim();
          const now = Date.now();
          if (!Number.isFinite(rx) || !Number.isFinite(tx)) continue;

          if (lastRx !== null && lastTx !== null && now > lastAt) {
            const dt = (now - lastAt) / 1000;
            const downBps = Math.max(0, (rx - lastRx) / dt);
            const upBps = Math.max(0, (tx - lastTx) / dt);
            onSample({ downBps, upBps, ip });
          } else {
            onSample({ downBps: 0, upBps: 0, ip });
          }
          lastRx = rx;
          lastTx = tx;
          lastAt = now;
        }
      });

      proc.on('error', () => stop());
      proc.on('exit', () => { proc = null; });
    } catch {
      stop();
    }
  }

  return { start, stop };
}

module.exports = {
  CONN,
  psQuote,
  run,
  ps,
  isAdmin,
  isConnected,
  getPhysicalGateway,
  applyBypassRoutes,
  clearBypassRoutes,
  syncBypassRoutesLive,
  disconnectAll,
  ensureL2tpReady,
  configureAndDial,
  createStatsSampler
};
