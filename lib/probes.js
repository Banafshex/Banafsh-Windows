'use strict';

const net = require('net');
const tls = require('tls');
const dgram = require('dgram');
const crypto = require('crypto');
const dns = require('dns').promises;

const HOST_RE = /^[A-Za-z0-9.:_\-[\]]{1,253}$/;
const FAILED = -1;

/**
 * SSTP handshake probe (mirrors kittoku.osc.ServerTester in Banafsh-sstp).
 * Opens TCP + TLS, sends the MS-SSTP opening HTTP request without logging in,
 * and verifies that the server answers "HTTP/1.1 200".
 * Returns TCP connect latency in ms, or -1 on failure.
 */
function testSstp(host, port = 443, totalTimeoutMs = 4000) {
  port = Number(port) || 443;
  if (!host || !HOST_RE.test(host) || port < 1 || port > 65535) {
    return Promise.resolve(FAILED);
  }

  return new Promise((resolve) => {
    let settled = false;
    let raw = null;
    let ssl = null;
    let connectMs = FAILED;
    const t0 = Date.now();

    const finish = (val) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      try { if (ssl) ssl.destroy(); } catch {}
      try { if (raw) raw.destroy(); } catch {}
      resolve(val);
    };

    const watchdog = setTimeout(() => finish(FAILED), totalTimeoutMs);

    try {
      raw = net.connect({ host, port });
      raw.once('error', () => finish(FAILED));

      raw.once('connect', () => {
        connectMs = Math.max(1, Date.now() - t0);
        try {
          ssl = tls.connect({
            socket: raw,
            servername: net.isIP(host) ? undefined : host,
            rejectUnauthorized: false
          });
        } catch {
          finish(FAILED);
          return;
        }

        ssl.once('error', () => finish(FAILED));

        ssl.once('secureConnect', () => {
          const req =
            'SSTP_DUPLEX_POST /sra_{BA195980-CD49-458b-9E23-C84EE0ADCD75}/ HTTP/1.1\r\n' +
            'Content-Length: 18446744073709551615\r\n' +
            `Host: ${host}\r\n` +
            `SSTPCORRELATIONID: {${crypto.randomUUID()}}\r\n\r\n`;

          let chunks = Buffer.alloc(0);
          ssl.on('data', (chunk) => {
            chunks = Buffer.concat([chunks, chunk]);
            if (chunks.length >= 12) {
              const head = chunks.subarray(0, 12).toString('ascii');
              finish(head.startsWith('HTTP/1.1 200') ? connectMs : FAILED);
            }
          });
          ssl.once('end', () => {
            const head = chunks.subarray(0, 12).toString('ascii');
            finish(head.startsWith('HTTP/1.1 200') ? connectMs : FAILED);
          });

          try {
            ssl.write(req, 'ascii');
          } catch {
            finish(FAILED);
          }
        });
      });
    } catch {
      finish(FAILED);
    }
  });
}

// ---- RFC 2408 / 2409 IKEv1 Main Mode Message 1 builder (mirrors IkeProbe.kt) ----

function u16(val) {
  const b = Buffer.allocUnsafe(2);
  b.writeUInt16BE(val & 0xffff, 0);
  return b;
}

function u32(val) {
  const b = Buffer.allocUnsafe(4);
  b.writeUInt32BE(val >>> 0, 0);
  return b;
}

function ikeAttr(type, value) {
  return Buffer.concat([u16(0x8000 | type), u16(value)]);
}

function ikeTransform(number, encryption, keyLength, hash, group, isLast) {
  const parts = [ikeAttr(1, encryption)];
  if (keyLength != null) parts.push(ikeAttr(14, keyLength));
  parts.push(
    ikeAttr(2, hash),
    ikeAttr(4, group),
    ikeAttr(3, 1),      // pre-shared key
    ikeAttr(11, 1),     // life type: seconds
    ikeAttr(12, 28800)  // life duration
  );
  const attrs = Buffer.concat(parts);
  const head = Buffer.from([
    isLast ? 0 : 3,
    0,
    ((8 + attrs.length) >> 8) & 0xff,
    (8 + attrs.length) & 0xff,
    number & 0xff,
    1, // KEY_IKE
    0,
    0
  ]);
  return Buffer.concat([head, attrs]);
}

function buildMainModeMessage1(initiatorCookie) {
  const transforms = Buffer.concat([
    ikeTransform(1, 7, 256, 2, 2, false),  // AES-256, SHA1, MODP-1024
    ikeTransform(2, 5, null, 2, 2, false), // 3DES, SHA1, MODP-1024
    ikeTransform(3, 7, 256, 4, 14, true)   // AES-256, SHA-256, MODP-2048
  ]);

  const proposalLen = 8 + transforms.length;
  const proposal = Buffer.concat([
    Buffer.from([0, 0, (proposalLen >> 8) & 0xff, proposalLen & 0xff, 1, 1, 0, 3]),
    transforms
  ]);

  const saLen = 4 + 8 + proposal.length;
  const sa = Buffer.concat([
    Buffer.from([0, 0, (saLen >> 8) & 0xff, saLen & 0xff]),
    u32(1), // DOI: IPsec
    u32(1), // Situation: identity only
    proposal
  ]);

  const responderCookie = Buffer.alloc(8, 0);
  const totalLen = 28 + sa.length;
  const hdrMeta = Buffer.concat([
    Buffer.from([
      1,    // Next payload: SA
      0x10, // IKEv1
      2,    // Main Mode (Identity Protection)
      0     // Flags
    ]),
    u32(0), // Message ID
    u32(totalLen)
  ]);

  return Buffer.concat([initiatorCookie, responderCookie, hdrMeta, sa]);
}

/**
 * L2TP/IPsec IKEv1 probe on UDP 500 (mirrors kittoku.osc.IkeProbe in Banafsh-sstp).
 * Sends only Main Mode message 1 (no credentials/keys) and checks for an ISAKMP reply
 * echoing our initiator cookie. Returns RTT in ms, or -1 on failure.
 */
async function testL2tpIke(host, ipHint = '', tryTimeoutMs = 1600, tries = 2) {
  if (!host && !ipHint) return FAILED;
  let targetIp = '';
  if (ipHint && net.isIPv4(ipHint)) {
    targetIp = ipHint;
  } else if (host && net.isIPv4(host)) {
    targetIp = host;
  } else if (host && HOST_RE.test(host)) {
    try {
      const res = await Promise.race([
        dns.lookup(host, { family: 4 }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('dns timeout')), 2000))
      ]);
      targetIp = res.address;
    } catch {
      return FAILED;
    }
  } else {
    return FAILED;
  }

  const cookie = crypto.randomBytes(8);
  const packet = buildMainModeMessage1(cookie);

  return new Promise((resolve) => {
    const sock = dgram.createSocket('udp4');
    let done = false;
    let attemptTimer = null;
    let attempt = 0;
    let startedAt = Date.now();

    const finish = (val) => {
      if (done) return;
      done = true;
      if (attemptTimer) clearTimeout(attemptTimer);
      try { sock.close(); } catch {}
      resolve(val);
    };

    sock.on('error', () => finish(FAILED));
    sock.on('message', (msg) => {
      if (msg && msg.length >= 28 && msg.subarray(0, 8).equals(cookie)) {
        finish(Math.max(1, Date.now() - startedAt));
      }
    });

    const sendNext = () => {
      if (done) return;
      if (attempt >= tries) {
        finish(FAILED);
        return;
      }
      attempt++;
      startedAt = Date.now();
      try {
        sock.send(packet, 500, targetIp, (err) => {
          if (err) finish(FAILED);
        });
      } catch {
        finish(FAILED);
        return;
      }
      attemptTimer = setTimeout(sendNext, tryTimeoutMs);
    };

    sendNext();
  });
}

/**
 * Checks whether the machine currently has basic internet reachability.
 */
async function checkInternet(timeoutMs = 2500) {
  const targets = [
    { host: '1.1.1.1', port: 53 },
    { host: '8.8.8.8', port: 53 },
    { host: '1.0.0.1', port: 443 }
  ];

  const probeOne = ({ host, port }) => new Promise((resolve, reject) => {
    const s = net.connect({ host, port });
    const timer = setTimeout(() => {
      try { s.destroy(); } catch {}
      reject(new Error('timeout'));
    }, timeoutMs);
    s.once('connect', () => {
      clearTimeout(timer);
      try { s.destroy(); } catch {}
      resolve(true);
    });
    s.once('error', (err) => {
      clearTimeout(timer);
      try { s.destroy(); } catch {}
      reject(err);
    });
  });

  try {
    await Promise.any(targets.map(probeOne));
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  FAILED,
  HOST_RE,
  buildMainModeMessage1,
  testSstp,
  testL2tpIke,
  checkInternet
};
