'use strict';

const https = require('https');
const { HOST_RE } = require('./probes');

const BASE_RAW = 'https://raw.githubusercontent.com/Banafshex/Banafsh-sstp/main/';
const BASE_CDN = 'https://cdn.jsdelivr.net/gh/Banafshex/Banafsh-sstp@main/';

const EXCLUDED_COUNTRIES = new Set(['RU']);
const GOOD_SHARE = 8.0;
const MEDIUM_SHARE = 3.0;

function listUrls(protocol) {
  if (protocol === 'l2tp') {
    return [
      BASE_RAW + 'servers_l2tp.json',
      BASE_CDN + 'servers_l2tp.json'
    ];
  }
  return [
    BASE_RAW + 'servers_v2.json',
    BASE_CDN + 'servers_v2.json',
    BASE_RAW + 'servers.json',
    BASE_CDN + 'servers.json'
  ];
}

function httpGetText(url, timeoutMs = 15000, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Banafsh-Windows',
          ...headers
        }
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          httpGetText(res.headers.location, timeoutMs, headers).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve(body));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
  });
}

function shareOf(speedMbps, sessions) {
  return (Number(speedMbps) || 0) / ((Number(sessions) || 0) + 1);
}

function qualityOf(speedMbps, sessions) {
  const sess = Number(sessions) || 0;
  if (sess <= 1) return 'unknown';
  const share = shareOf(speedMbps, sess);
  if (share >= GOOD_SHARE) return 'good';
  if (share >= MEDIUM_SHARE) return 'medium';
  return 'bad';
}

function qualityRank(quality) {
  switch (quality) {
    case 'good': return 0;
    case 'medium': return 1;
    case 'unknown': return 2;
    default: return 3;
  }
}

function normServers(raw, protocol = 'sstp') {
  const arr = Array.isArray(raw) ? raw : (raw && (raw.servers || raw.items)) || [];
  const seen = new Set();
  const out = [];

  for (const s of arr) {
    if (!s || typeof s !== 'object') continue;
    const host = String(s.host || s.hostname || s.address || s.ip || '').trim();
    if (!host || !HOST_RE.test(host) || seen.has(host)) continue;

    const cc = String(
      s.cc || s.country_short || s.countryShort || s.country_code || s.countryCode || s.country || ''
    ).trim().slice(0, 2).toUpperCase();

    if (EXCLUDED_COUNTRIES.has(cc)) continue;

    const rawPort = Number(s.port);
    const port = Number.isInteger(rawPort) && rawPort >= 1 && rawPort <= 65535 ? rawPort : 443;
    seen.add(host);

    const speed = Number(s.speed_mbps ?? s.speedMbps ?? s.speed ?? s.bandwidth_mbps ?? s.bandwidth ?? 0);
    const ping = Number(s.ike_ms ?? s.ping ?? s.latency ?? 0);
    const sessions = Math.max(0, Number(s.sessions) || 0);
    const speedMbps = Number.isFinite(speed) && speed > 0 ? speed : 0;
    const quality = qualityOf(speedMbps, sessions);

    out.push({
      host,
      ip: String(s.ip || '').trim(),
      port,
      udpPort: Number(s.udp_port || s.udpPort) || 0,
      user: String(s.user || s.username || 'vpn'),
      pass: String(s.pass || s.password || 'vpn'),
      psk: String(s.psk || 'vpn'),
      cc: /^[A-Z]{2}$/.test(cc) ? cc : '',
      country: String(s.country_name || s.countryName || (s.country && s.country.length > 2 ? s.country : '') || ''),
      speedMbps,
      ping: Number.isFinite(ping) && ping > 0 ? ping : 0,
      sessions,
      score: Number(s.score) || 0,
      uptimeHours: Number(s.uptime_hours || s.uptimeHours) || 0,
      operator: String(s.operator || ''),
      quality,
      qualityRank: qualityRank(quality),
      share: shareOf(speedMbps, sessions),
      protocol: protocol === 'l2tp' ? 'l2tp' : 'sstp'
    });
  }

  return out;
}

async function fetchServersForProtocol(protocol = 'l2tp') {
  const proto = protocol === 'sstp' ? 'sstp' : 'l2tp';
  let lastErr = new Error('No URLs');
  for (const url of listUrls(proto)) {
    try {
      const text = await httpGetText(url, 15000);
      const parsed = normServers(JSON.parse(text), proto);
      if (parsed.length > 0) return parsed;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function fetchServerHosts(protocol = 'l2tp') {
  try {
    const list = await fetchServersForProtocol(protocol);
    return new Set(list.map((s) => s.host));
  } catch {
    return null;
  }
}

module.exports = {
  EXCLUDED_COUNTRIES,
  listUrls,
  httpGetText,
  qualityOf,
  qualityRank,
  shareOf,
  normServers,
  fetchServersForProtocol,
  fetchServerHosts
};
