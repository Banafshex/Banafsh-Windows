'use strict';

const net = require('net');
const dns = require('dns').promises;

const DEFAULT_SITES = ['aparat.com', 'digikala.com', 'divar.ir', 'snapp.ir', 'bmi.ir'];
const SUBS = ['', 'www', 'pay', 'api', 'panel', 'my', 'app', 'm', 'login'];
const MAX_ROUTES = 5000;

function ipv4ToUint32(ip) {
  const parts = String(ip || '').trim().split('.');
  if (parts.length !== 4) return null;
  let out = 0;
  for (let i = 0; i < 4; i++) {
    if (!/^\d{1,3}$/.test(parts[i])) return null;
    const n = Number(parts[i]);
    if (n < 0 || n > 255) return null;
    out = ((out << 8) | n) >>> 0;
  }
  return out >>> 0;
}

function uint32ToIpv4(num) {
  const u = num >>> 0;
  return `${(u >>> 24) & 255}.${(u >>> 16) & 255}.${(u >>> 8) & 255}.${u & 255}`;
}

function maskForPrefix(len) {
  if (len <= 0) return 0;
  if (len >= 32) return 0xFFFFFFFF >>> 0;
  return (0xFFFFFFFF << (32 - len)) >>> 0;
}

function parseRanges(text, minPrefix = 8) {
  const raw = [];
  const lines = String(text || '').split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    let ipPart = line;
    let len = 32;
    if (line.includes('/')) {
      const parts = line.split('/');
      if (parts.length !== 2 || !/^\d{1,2}$/.test(parts[1])) continue;
      ipPart = parts[0];
      len = Number(parts[1]);
    }
    if (len < minPrefix || len > 32) continue;

    const addr = ipv4ToUint32(ipPart);
    if (addr === null) continue;

    const size = len === 32 ? 1 : (2 ** (32 - len));
    const mask = maskForPrefix(len);
    const start = (addr & mask) >>> 0;
    const end = start + size - 1;
    raw.push([start, end]);
  }

  return mergeIntervals(raw);
}

function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [sorted[0].slice()];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    if (cur[0] <= last[1] + 1) {
      if (cur[1] > last[1]) last[1] = cur[1];
    } else {
      merged.push([cur[0], cur[1]]);
    }
  }
  return merged;
}

function subtractIpFromIntervals(intervals, ipUint32) {
  if (ipUint32 === null || ipUint32 === undefined) return intervals;
  const out = [];
  for (const [s, e] of intervals) {
    if (ipUint32 < s || ipUint32 > e) {
      out.push([s, e]);
    } else {
      if (ipUint32 > s) out.push([s, ipUint32 - 1]);
      if (ipUint32 < e) out.push([ipUint32 + 1, e]);
    }
  }
  return out;
}

function intervalsToCidrs(intervals) {
  const out = [];
  for (const [start, end] of intervals) {
    let cur = start;
    while (cur <= end) {
      let maxBits = 0;
      while (maxBits < 32) {
        const nextSize = 2 ** (maxBits + 1);
        if (cur % nextSize !== 0) break;
        if (cur + nextSize - 1 > end) break;
        maxBits++;
      }
      const prefix = 32 - maxBits;
      out.push(`${uint32ToIpv4(cur)}/${prefix}`);
      cur += 2 ** maxBits;
      if (out.length >= MAX_ROUTES) return out;
    }
  }
  return out;
}

/**
 * Normalizes a user-entered domain, IPv4, or IPv4/CIDR entry for the "No VPN" list.
 */
function normBypassEntry(value) {
  let v = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^\*\./, '')
    .replace(/^www\./, '');

  const slashIdx = v.indexOf('/');
  if (slashIdx !== -1) {
    const maybeIp = v.slice(0, slashIdx);
    const maybePrefix = v.slice(slashIdx + 1).split(/[/?#:]/)[0];
    const addr = ipv4ToUint32(maybeIp);
    if (addr !== null && /^\d{1,2}$/.test(maybePrefix)) {
      const len = Number(maybePrefix);
      if (len >= 8 && len <= 32) {
        const netAddr = (addr & maskForPrefix(len)) >>> 0;
        return len === 32 ? uint32ToIpv4(netAddr) : `${uint32ToIpv4(netAddr)}/${len}`;
      }
      return null;
    }
  }

  v = v.split(/[/?#:]/)[0];
  if (net.isIPv4(v)) return v;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v) && v.length <= 253) return v;
  return null;
}

async function resolveOneHost(hostname, timeoutMs = 3000) {
  try {
    const res = await Promise.race([
      dns.resolve4(hostname),
      new Promise((_, rej) => setTimeout(() => rej(new Error('dns timeout')), timeoutMs))
    ]);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

async function resolveCustomSiteIntervals(entries) {
  const intervals = [];
  const hostQueries = [];

  for (const raw of Array.isArray(entries) ? entries : []) {
    const clean = normBypassEntry(raw);
    if (!clean) continue;

    if (clean.includes('/') || net.isIPv4(clean)) {
      const parsed = parseRanges(clean, 8);
      intervals.push(...parsed);
    } else {
      for (const sub of SUBS) {
        hostQueries.push(sub ? `${sub}.${clean}` : clean);
      }
    }
  }

  let idx = 0;
  const worker = async () => {
    while (idx < hostQueries.length) {
      const q = hostQueries[idx++];
      const ips = await resolveOneHost(q, 2800);
      for (const ip of ips) {
        const u = ipv4ToUint32(ip);
        if (u !== null) intervals.push([u, u]);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(16, hostQueries.length) }, worker));

  return mergeIntervals(intervals);
}

async function buildBypassCidrs({
  customSitesEnabled = true,
  sites = [],
  excludeHost = ''
}) {
  if (!customSitesEnabled || !Array.isArray(sites) || sites.length === 0) {
    return [];
  }

  let merged = await resolveCustomSiteIntervals(sites);
  if (!merged.length) return [];

  if (excludeHost) {
    const directIp = ipv4ToUint32(excludeHost);
    if (directIp !== null) {
      merged = subtractIpFromIntervals(merged, directIp);
    } else {
      const serverIps = await resolveOneHost(excludeHost, 2500);
      for (const sip of serverIps) {
        const u = ipv4ToUint32(sip);
        if (u !== null) merged = subtractIpFromIntervals(merged, u);
      }
    }
  }

  return intervalsToCidrs(merged);
}

module.exports = {
  DEFAULT_SITES,
  SUBS,
  ipv4ToUint32,
  uint32ToIpv4,
  parseRanges,
  mergeIntervals,
  intervalsToCidrs,
  normBypassEntry,
  resolveCustomSiteIntervals,
  buildBypassCidrs
};
