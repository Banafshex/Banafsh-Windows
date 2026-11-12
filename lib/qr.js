'use strict';

const crypto = require('crypto');
const qrcode = require('../renderer/vendor/qrcode.js');

const SECRET = 'Banafsh-sstp/qr/v1/7f3a9c1e5b';
const AAD = Buffer.from('BNF1', 'utf8');
const IV_SIZE = 12;
const TAG_SIZE = 16;
const KEY = crypto.createHash('sha256').update(SECRET, 'utf8').digest();
const HOST_RE = /^[A-Za-z0-9.:_\-[\]]{1,253}$/;

/**
 * Encrypts a server into a scrambled Banafsh QR payload string.
 * 100% cross-compatible with Banafsh-sstp on Android (QrShare.kt).
 */
function encodeServer(server) {
  if (!server || !server.host || !HOST_RE.test(String(server.host).trim())) {
    throw new Error('Invalid server host');
  }
  const host = String(server.host).trim();
  const port = Math.min(65535, Math.max(1, Number(server.port) || 443));
  const user = String(server.user ?? 'vpn').slice(0, 128);
  const pass = String(server.pass ?? 'vpn').slice(0, 128);
  const cc = String(server.cc || server.countryCode || '').trim().toUpperCase().slice(0, 2);
  const verify = server.verify === false ? 0 : 1;

  const payloadObj = {
    h: host,
    p: port,
    u: user,
    w: pass,
    c: /^[A-Z]{2}$/.test(cc) ? cc : '',
    v: verify
  };
  if (server.protocol === 'l2tp' || server.protocol === 'sstp') {
    payloadObj.t = server.protocol;
  }
  if (server.psk && server.psk !== 'vpn') {
    payloadObj.k = String(server.psk).slice(0, 128);
  }

  const iv = crypto.randomBytes(IV_SIZE);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  cipher.setAAD(AAD);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payloadObj), 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, tag]).toString('base64url');
}

/**
 * Decrypts and validates a Banafsh QR payload string.
 * Returns normalized server object or null if invalid/tampered.
 */
function decodeServer(text) {
  try {
    if (!text || typeof text !== 'string') return null;
    const cleaned = text.trim();
    if (!cleaned) return null;
    const raw = Buffer.from(cleaned, 'base64url');
    if (raw.length <= IV_SIZE + TAG_SIZE) return null;

    const iv = raw.subarray(0, IV_SIZE);
    const tag = raw.subarray(raw.length - TAG_SIZE);
    const ciphertext = raw.subarray(IV_SIZE, raw.length - TAG_SIZE);

    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAAD(AAD);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    const json = JSON.parse(plain);

    const host = String(json.h || '').trim();
    const port = Number(json.p);
    const user = String(json.u ?? '');
    const pass = String(json.w ?? '');
    const cc = String(json.c ?? '').trim().toUpperCase();
    const verify = Number(json.v ?? 1) !== 0;

    const isValid =
      HOST_RE.test(host) &&
      Number.isInteger(port) &&
      port >= 1 &&
      port <= 65535 &&
      user.length <= 128 &&
      pass.length <= 128 &&
      (cc === '' || /^[A-Z]{2}$/.test(cc));

    if (!isValid) return null;

    return {
      host,
      port,
      user: user || 'vpn',
      pass: pass || 'vpn',
      psk: json.k ? String(json.k).slice(0, 128) : 'vpn',
      cc,
      verify,
      protocol: json.t === 'l2tp' || json.t === 'sstp' ? json.t : null
    };
  } catch {
    return null;
  }
}

/**
 * Renders a crisp SVG QR code matching Banafsh-sstp QrSendActivity colors (#2A1D4A on #FFFFFF).
 */
function makeQrSvg(text, dark = '#2A1D4A', light = '#FFFFFF') {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  let pathData = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        pathData += `M${c},${r}h1v1h-1z`;
      }
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" shape-rendering="crispEdges">` +
    `<rect width="${count}" height="${count}" fill="${light}"/>` +
    `<path d="${pathData}" fill="${dark}"/>` +
    `</svg>`
  );
}

/**
 * Serializes a server/settings profile in a format compatible with both
 * Banafsh-Windows and Banafsh-sstp Android import/export.
 */
function serializeProfileJson(server, settings = {}) {
  const host = String(server?.host || '').trim();
  const port = Math.min(65535, Math.max(1, Number(server?.port) || 443));
  const user = String(server?.user ?? 'vpn');
  const pass = String(server?.pass ?? 'vpn');
  const psk = String(server?.psk ?? 'vpn');
  const cc = String(server?.cc || '').slice(0, 2).toUpperCase();
  const protocol = server?.protocol || settings?.protocol || 'l2tp';
  const verify = server?.verify !== false;

  return JSON.stringify({
    banafshProfileVersion: 1,
    protocol,
    countryCode: cc,
    psk,
    sites: Array.isArray(settings.sites) ? settings.sites : undefined,
    booleanSetting: {
      SSL_DO_VERIFY: verify,
      RECONNECTION_ENABLED: settings.autoReconnect !== false,
      PROXY_DO_USE_PROXY: !!settings.proxyEnabled
    },
    intSetting: {
      SSL_PORT: port,
      RECONNECTION_COUNT: Number(settings.reconnectAttempts) || 3,
      RECONNECTION_INTERVAL: Number(settings.reconnectDelay) || 10,
      PROXY_PORT: Number(settings.proxyPort) || 8080
    },
    stringSetting: {
      HOME_HOSTNAME: host,
      HOME_USERNAME: user,
      HOME_PASSWORD: pass,
      PROXY_HOSTNAME: String(settings.proxyHost || ''),
      PROXY_USERNAME: String(settings.proxyUser || ''),
      PROXY_PASSWORD: String(settings.proxyPass || '')
    }
  }, null, 2);
}

/**
 * Parses an imported profile JSON file (supports both Android Banafsh-sstp profiles
 * and Banafsh-Windows profiles).
 */
function parseProfileJson(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (!data || typeof data !== 'object') return null;

    const strings = data.stringSetting || {};
    const ints = data.intSetting || {};
    const bools = data.booleanSetting || {};

    const host = String(strings.HOME_HOSTNAME || data.host || '').trim();
    if (!host || !HOST_RE.test(host)) return null;

    const port = Math.min(65535, Math.max(1, Number(ints.SSL_PORT ?? data.port ?? 443) || 443));
    const user = String(strings.HOME_USERNAME ?? data.user ?? '');
    const pass = String(strings.HOME_PASSWORD ?? data.pass ?? '');
    const psk = String(data.psk ?? 'vpn');
    const cc = String(data.countryCode || data.cc || '').trim().toUpperCase().slice(0, 2);
    const verify = bools.SSL_DO_VERIFY !== undefined ? !!bools.SSL_DO_VERIFY : (data.verify !== false);
    const protocol = data.protocol === 'l2tp' || data.protocol === 'sstp' ? data.protocol : null;

    return {
      host,
      port,
      user,
      pass,
      psk,
      cc: /^[A-Z]{2}$/.test(cc) ? cc : '',
      verify,
      protocol,
      sites: Array.isArray(data.sites) ? data.sites : undefined,
      proxyEnabled: bools.PROXY_DO_USE_PROXY,
      proxyHost: strings.PROXY_HOSTNAME,
      proxyPort: ints.PROXY_PORT,
      proxyUser: strings.PROXY_USERNAME,
      proxyPass: strings.PROXY_PASSWORD
    };
  } catch {
    return null;
  }
}

module.exports = {
  encodeServer,
  decodeServer,
  makeQrSvg,
  serializeProfileJson,
  parseProfileJson
};
