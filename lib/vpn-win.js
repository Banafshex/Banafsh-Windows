'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { execFile, spawn } = require('child_process');
const { HOST_RE } = require('./probes');
const { buildBypassCidrs } = require('./bypass');

// Dedicated connection names per TunnelType so Windows RasMan never has to mutate
// a single phonebook entry between WAN Miniport (SSTP) and WAN Miniport (L2TP).
const CONN_SSTP = 'Banafsh-SSTP';
const CONN_L2TP = 'Banafsh-L2TP';
const CONN_LEGACY = 'Banafsh';
const ALL_CONNS = [CONN_SSTP, CONN_L2TP, CONN_LEGACY];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const psQuote = (s) => "'" + String(s ?? '').replace(/'/g, "''") + "'";
const connNameFor = (proto) => (proto === 'sstp' ? CONN_SSTP : CONN_L2TP);

let activeDialProc = null;

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

function matchConnectedName(rasdialOutput) {
  const txt = String(rasdialOutput || '');
  for (const name of ALL_CONNS) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|\\r?\\n)\\s*' + escaped + '(\\s|$)', 'i');
    if (re.test(txt)) return name;
  }
  return null;
}

async function isConnected() {
  if (process.platform !== 'win32') return false;
  const r = await run('rasdial', [], 10000);
  return r.code === 0 && Boolean(matchConnectedName(r.out));
}

/**
 * Terminates any in-progress rasdial.exe process immediately so Windows RasMan
 * never stays locked in "busy connecting" state after Cancel, Switch, or Quit.
 */
async function abortActiveDial() {
  if (process.platform !== 'win32') return false;
  let killed = false;
  if (activeDialProc) {
    killed = true;
    try { activeDialProc.kill(); } catch {}
    activeDialProc = null;
  }
  const tk = await run('taskkill', ['/F', '/IM', 'rasdial.exe', '/T'], 6000);
  if (tk.code === 0) killed = true;
  if (killed) {
    await sleep(400);
  }
  return killed;
}

/**
 * Dials `rasdial.exe` as a tracked child process so Cancel or Disconnect can abort
 * it within 200ms rather than leaving rasdial.exe hanging in the background.
 */
function dialRas(connName, user, pass, timeoutMs = 42000, isCancelled = () => false) {
  return new Promise((resolve) => {
    let finished = false;
    let out = '';
    let err = '';

    const proc = spawn('rasdial.exe', [connName, String(user || 'vpn'), String(pass || 'vpn')], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    activeDialProc = proc;

    const finish = (result) => {
      if (finished) return;
      finished = true;
      clearInterval(cancelPoll);
      clearTimeout(timer);
      if (activeDialProc === proc) activeDialProc = null;
      resolve(result);
    };

    if (proc.stdout) {
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (d) => { out += d; });
    }
    if (proc.stderr) {
      proc.stderr.setEncoding('utf8');
      proc.stderr.on('data', (d) => { err += d; });
    }

    const cancelPoll = setInterval(() => {
      if (isCancelled()) {
        try { proc.kill(); } catch {}
        run('taskkill', ['/F', '/IM', 'rasdial.exe', '/T'], 5000).finally(() => {
          finish({ code: -2, cancelled: true, out, err });
        });
      }
    }, 200);

    const timer = setTimeout(() => {
      try { proc.kill(); } catch {}
      run('taskkill', ['/F', '/IM', 'rasdial.exe', '/T'], 5000).finally(() => {
        finish({ code: 1, timedOut: true, out, err: err || 'Connection timed out' });
      });
    }, timeoutMs);

    proc.on('error', (e) => {
      finish({ code: 1, out, err: e.message || String(e) });
    });

    proc.on('close', (code) => {
      finish({ code: typeof code === 'number' ? code : 1, out, err });
    });
  });
}

/**
 * Cleanly removes Banafsh VPN connection entries from Windows after disconnect/exit
 * (retrying briefly if RasMan is still completing port teardown).
 */
async function removeVpnEntries(names = ALL_CONNS) {
  if (process.platform !== 'win32' || !Array.isArray(names) || !names.length) return;
  const listLiteral = names.map(psQuote).join(', ');
  const script = `
    $names = @(${listLiteral})
    $pbk = Join-Path $env:APPDATA 'Microsoft\\Network\\Connections\\Pbk\\rasphone.pbk'
    foreach ($n in $names) {
      $removed = $false
      for ($try = 0; $try -lt 4; $try++) {
        $v = Get-VpnConnection -Name $n -ErrorAction SilentlyContinue
        if (-not $v) { $removed = $true; break }
        try {
          Remove-VpnConnection -Name $n -Force -ErrorAction Stop | Out-Null
          $removed = $true
          break
        } catch {
          Start-Sleep -Milliseconds 300
        }
      }
      if (-not $removed -and (Test-Path $pbk)) {
        try {
          $lines = Get-Content -LiteralPath $pbk -Encoding UTF8
          $out = New-Object System.Collections.Generic.List[string]
          $skip = $false
          foreach ($line in $lines) {
            if ($line -match '^\\[(.+)\\]\\s*$') {
              $skip = ($Matches[1] -ieq $n)
            }
            if (-not $skip) { $out.Add($line) }
          }
          Set-Content -LiteralPath $pbk -Value $out -Encoding UTF8 -Force
        } catch {}
      }
    }
  `;
  await ps(script, 15000);
}

/**
 * Finds the physical default IPv4 gateway (excluding Banafsh VPN tunnels)
 * so bypass routes go directly through the user's ISP adapter.
 */
async function getPhysicalGateway() {
  if (process.platform !== 'win32') return null;
  const excludeList = ALL_CONNS.map(psQuote).join(', ');
  const cmd = `
    $rt = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.NextHop -ne '0.0.0.0' -and ($_.InterfaceAlias -notin @(${excludeList})) } |
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
    await run('netsh', ['-f', tmpScript], 30000);
  } catch {} finally {
    try { fs.unlinkSync(tmpScript); } catch {}
  }
}

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
    await run('netsh', ['-f', tmpScript], 30000);
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

/**
 * Aborts any in-flight dial, disconnects all Banafsh VPN tunnels, clears routes/proxy,
 * and removes the Windows VPN connection entries cleanly.
 */
async function disconnectAll(routeStateFile, { removeEntries = true } = {}) {
  if (process.platform === 'win32') {
    await abortActiveDial();
    const status = await run('rasdial', [], 8000);
    for (const name of ALL_CONNS) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('(^|\\r?\\n)\\s*' + escaped + '(\\s|$)', 'i').test(status.out)) {
        await run('rasdial', [name, '/disconnect'], 15000);
      }
    }
    await clearWinHttpProxyIfNeeded();
    if (removeEntries) {
      await removeVpnEntries(ALL_CONNS);
    }
  }
  await clearBypassRoutes(routeStateFile);
}

/**
 * Ensures Windows IPsec NAT-Traversal registry value and required services are running
 * WITHOUT force-restarting IKEEXT/PolicyAgent underneath RasMan (which wedges WAN Miniports).
 */
async function ensureL2tpReady(enableNatT = true) {
  if (process.platform !== 'win32') return { natTUpdated: false };
  const script = `
    $updated = $false
    if (${enableNatT ? '$true' : '$false'}) {
      $regPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\PolicyAgent'
      if (Test-Path $regPath) {
        $cur = (Get-ItemProperty -Path $regPath -Name 'AssumeUDPEncapsulationContextOnSendRule' -ErrorAction SilentlyContinue).AssumeUDPEncapsulationContextOnSendRule
        if ($cur -ne 2) {
          New-ItemProperty -Path $regPath -Name 'AssumeUDPEncapsulationContextOnSendRule' -PropertyType DWord -Value 2 -Force | Out-Null
          $updated = $true
        }
      }
    }
    Start-Service RasMan -ErrorAction SilentlyContinue
    Start-Service PolicyAgent -ErrorAction SilentlyContinue
    Start-Service IKEEXT -ErrorAction SilentlyContinue
    Write-Output $(if ($updated) { 'UPDATED' } else { 'OK' })
  `;
  const r = await ps(script, 15000);
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
    Start-Service RasMan -ErrorAction SilentlyContinue
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
 * Configures and dials the protocol-dedicated Windows VPN connection
 * ('Banafsh-SSTP' or 'Banafsh-L2TP'), and applies direct custom-site routes.
 */
async function configureAndDial({
  protocol = 'l2tp',
  host,
  port = 443,
  user = 'vpn',
  pass = 'vpn',
  psk = 'vpn',
  settings = {},
  routeStateFile = '',
  isCancelled = () => false
}) {
  const proto = protocol === 'sstp' ? 'sstp' : 'l2tp';
  const connName = connNameFor(proto);
  host = String(host || '').trim();
  port = Math.min(65535, Math.max(1, Number(port) || 443));

  if (!host || !HOST_RE.test(host)) {
    return { ok: false, error: 'Invalid host', errorCode: 'BAD_HOST' };
  }

  // Disconnect & remove any prior Banafsh-SSTP / Banafsh-L2TP / legacy Banafsh entry cleanly
  await disconnectAll(routeStateFile, { removeEntries: true });
  if (isCancelled()) return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };

  // Resolve physical gateway & custom bypass domains before dialing VPN so CDN geo-IPs resolve locally
  const wantBypass = Boolean(
    settings.customSitesEnabled !== false && Array.isArray(settings.sites) && settings.sites.length > 0
  );
  let gw = null;
  let bypassCidrs = [];
  if (wantBypass) {
    [gw, bypassCidrs] = await Promise.all([
      getPhysicalGateway(),
      buildBypassCidrs({
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
  const commonArgs = proto === 'sstp'
    ? `-Name ${psQuote(connName)} -ServerAddress ${psQuote(serverAddr)} -TunnelType Sstp -EncryptionLevel Required -AuthenticationMethod MSChapv2 -SplitTunneling:$false -Force`
    : `-Name ${psQuote(connName)} -ServerAddress ${psQuote(serverAddr)} -TunnelType L2tp -L2tpPsk ${psQuote(psk || 'vpn')} -EncryptionLevel Optional -AuthenticationMethod MSChapv2,Chap,Pap -SplitTunneling:$false -Force`;

  const setupCmd = `
    $ErrorActionPreference = 'Stop'
    if (Get-VpnConnection -Name ${psQuote(connName)} -ErrorAction SilentlyContinue) {
      Set-VpnConnection ${commonArgs} | Out-Null
    } else {
      Add-VpnConnection ${commonArgs} | Out-Null
    }
  `;

  const setupRes = await ps(setupCmd, 25000);
  if (setupRes.code) {
    await disconnectAll(routeStateFile, { removeEntries: true });
    return { ok: false, error: (setupRes.err || setupRes.out).trim(), errorCode: 'VPN_SETUP_FAILED' };
  }

  if (isCancelled()) {
    await disconnectAll(routeStateFile, { removeEntries: true });
    return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };
  }

  const dialRes = await dialRas(connName, user, pass, 42000, isCancelled);
  if (dialRes.cancelled || isCancelled()) {
    await disconnectAll(routeStateFile, { removeEntries: true });
    return { ok: false, error: 'cancelled', errorCode: 'CANCELLED' };
  }

  if (dialRes.code !== 0) {
    await disconnectAll(routeStateFile, { removeEntries: true });
    const diag = classifyRasError(dialRes.out + '\n' + dialRes.err, proto);
    return {
      ok: false,
      error: diag.raw || 'rasdial failed',
      rasCode: diag.rasCode,
      natTUpdated,
      errorCode: proto === 'l2tp' && (diag.rasCode === 809 || diag.rasCode === 789) ? 'L2TP_NO_RESPONSE' : 'DIAL_FAILED'
    };
  }

  // Apply direct bypass routes for custom sites
  let routesApplied = 0;
  if (gw && bypassCidrs.length > 0) {
    routesApplied = await applyBypassRoutes(bypassCidrs, gw, routeStateFile);
  }

  // Apply optional custom DNS on the active VPN interface if configured in Advanced settings
  if (settings.customDnsEnabled && settings.customDns && net.isIPv4(String(settings.customDns).trim())) {
    const dnsIp = String(settings.customDns).trim();
    await run('netsh', ['interface', 'ipv4', 'set', 'dnsservers', `name=${connName}`, 'static', dnsIp, 'primary', 'validate=no'], 10000);
  }

  return { ok: true, protocol: proto, host, port, connName, routesApplied };
}

/**
 * Rebuilds and updates direct bypass routes live while the VPN is already connected.
 */
async function syncBypassRoutesLive({
  settings = {},
  routeStateFile = '',
  currentServerHost = ''
}) {
  const active = await isConnected();
  if (!active) {
    await clearBypassRoutes(routeStateFile);
    return { ok: true, active: false, routesApplied: 0 };
  }

  const wantBypass = Boolean(
    settings.customSitesEnabled !== false && Array.isArray(settings.sites) && settings.sites.length > 0
  );
  if (!wantBypass) {
    await clearBypassRoutes(routeStateFile);
    return { ok: true, active: true, routesApplied: 0 };
  }

  const [gw, cidrs] = await Promise.all([
    getPhysicalGateway(),
    buildBypassCidrs({
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
 * Starts a lightweight single-process traffic & IP sampler for the active Banafsh PPP interface.
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

    const namesLiteral = ALL_CONNS.map(psQuote).join(', ');
    const script = [
      "while ($true) {",
      `  $nic = [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() | Where-Object { $_.Name -in @(${namesLiteral}) -and $_.OperationalStatus -eq 'Up' } | Select-Object -First 1;`,
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
  CONN_SSTP,
  CONN_L2TP,
  CONN_LEGACY,
  ALL_CONNS,
  psQuote,
  run,
  ps,
  isAdmin,
  isConnected,
  abortActiveDial,
  removeVpnEntries,
  getPhysicalGateway,
  applyBypassRoutes,
  clearBypassRoutes,
  syncBypassRoutesLive,
  disconnectAll,
  ensureL2tpReady,
  configureAndDial,
  createStatsSampler
};
