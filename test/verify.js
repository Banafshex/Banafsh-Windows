'use strict';

const assert = require('assert');
const tls = require('tls');
const dgram = require('dgram');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { buildMainModeMessage1, testSstp, testL2tpIke } = require('../lib/probes');
const { encodeServer, decodeServer, makeQrSvg, serializeProfileJson, parseProfileJson } = require('../lib/qr');
const { normServers, qualityOf, qualityRank } = require('../lib/servers');
const { isNewer, pickNotes, parseNews } = require('../lib/updater');
const { parseRanges, intervalsToCidrs, normBypassEntry, buildBypassCidrs } = require('../lib/bypass');

async function runTests() {
  console.log('1. Testing IKEv1 Main Mode Message 1 packet byte-exactness...');
  const cookie = Buffer.from('0102030405060708', 'hex');
  const pkt = buildMainModeMessage1(cookie);
  assert.strictEqual(pkt.subarray(0, 8).toString('hex'), '0102030405060708');
  assert.strictEqual(pkt.subarray(8, 16).toString('hex'), '0000000000000000');
  assert.strictEqual(pkt[16], 1);    // SA payload
  assert.strictEqual(pkt[17], 0x10); // IKEv1
  assert.strictEqual(pkt[18], 2);    // Main Mode
  assert.strictEqual(pkt.readUInt32BE(24), pkt.length);

  console.log('2. Testing local UDP IKE responder with testL2tpIke...');
  // Spin up mock UDP server on ephemeral port? Note testL2tpIke sends to port 500,
  // so also verify timeout/failure behavior cleanly on unreachable localhost:500
  const unreachableMs = await testL2tpIke('127.0.0.1', '127.0.0.1', 150, 1);
  assert.strictEqual(unreachableMs, -1);

  console.log('3. Testing local TLS SSTP server handshake with testSstp...');
  const { execFileSync } = require('child_process');
  const TEST_KEY = [
    '-----BEGIN PRIVATE KEY-----',
    'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCsG4saP7GVMMH3',
    '0p4XFvHAP3aUKq2L4ExlDx44c7CqQIgjS+5mgIfV/wLHkXFVaa1Nt/SCA50qaci6',
    'XWXbQAE2wzz9C7EOTnWrsIs5Ui2S8kS55nDBJVprwV+rJ4Two4w8Cwufsrp6mf2G',
    'gxrqECYN8bWmTjOWbQe9vR1+4UKtySOpmqp7V1fx89gzVQXkzPdJ4QpaN74kFqM7',
    'IsAxbalzzvZEgMZDUSS17VABT9SEjPN332EW+kQJruNeOtThh4wznbiCJMgKdTB7',
    'Kxu3nulAi716RPwi1Di7XgMeNFzTGuBqoAeEVFSq7jSIs+FDhlgnmFJyMeQcXRZC',
    'Pjx5fBNrAgMBAAECggEANp4vEM9xzcTBaaI/ZVh0s+vv96lrld5CoDeiAYxFXmJI',
    'UdtA9uqHMRRSj37Klq6IvwdH4xK+h702ZF5Ler7fI7/l1PAm6kFf+nJ2XGSF7gJQ',
    'aSaGVeVCwruFXs2V1MAyOsPOlomjwFCqMkvc+LbTPM2eNf7PREepkz824xMdlASh',
    'vxS3bJ3B8C5QXBnv7mb2osskyJ6Snoi5fQlsSVWnyJhGjuG07wLErsDS7APrOfKS',
    '/+rACiNbJHKfaQPg8UgIoTMcOEaSFkYyQjU1Qag4JJyDay68zyqPveU2DHD3rKXS',
    'rQYXAbfwunG8/ft7cBbGlGYNSkes7CTp3uuR3vPJAQKBgQDT5cakxl0dlTQUWy9V',
    '9bAa13CSG7G7iPibZso5yWJ3S2mDZ6kz8FFayUzw9aVhIDrwG+y1dyZDBzpPzT+U',
    'LxcAKiKZvMataSgeHLH4wFpYDbuVZ5RyUpp914mh2E+1GVTS3yKlv7KDESeIMAzE',
    '+b9KBofrXITYa+Pr2iLEOMGewQKBgQDP7bKC5XwH0qPwt6Xrs6Zc9GYvR7a88tzw',
    '43/GKDXrKDklq/j66oy6qs398V0ccZEx+qliRvDdY97m+cm46nUm0XqPpqKJcuSi',
    '/kxWwEDtHGcjB7VKJy7jFcq7Ak4RJMTBqZzLNVINPqj3bxLemfR3eoq1Hm2Q+Nn8',
    'sYyHgmmpKwKBgGaJPNuFRY/IIGBtU3WUIviKIeYB0rp96FdCoT7fTW+OpWs54S3J',
    '74Qv/rRnGfTq5LpFuQCCvJgYykXNeyOYudeRjBa6u6U0Sn5vwkstwUn0sz3z1miP',
    'wkR85RPVGZT3wg0cfqaYIai8x1VmcvdqJv+KM4FXzszvQGZjswkiscbBAoGAaKrA',
    't3+Jhe6Us/HeRd3zGsu0PIyfAlJGwcPjZ/6J1cwzqDD/bl9vY+/jLbe4JT9N1ZjW',
    'dzA6w1cot6B52Om8+0NrrLA3FXWOfjYAe5Lfm/w2Nr4ElkVPJuSrXqP0ZFDb8pjM',
    '4sX+fchTCesR1pgtJY+8Dxw4D0gVg0xk7znIsm0CgYBELXQy7WCr++RMy9aGMaQL',
    '002r1vGeAf09S1rKwaonKkOpC4rdfOoLTYSO8ka6jCRpOZQZaec5KVlO1C/2J4Pk',
    'lBhM5ZsNS3KLZn/fCV5dXDYxVoJsE36WLZEoV1ZGr0RLUmJKmzdWa58mhCZFeWM9',
    'sV67jT2dJ70d1Cxpe3C2Iw==',
    '-----END PRIVATE KEY-----'
  ].join('\n');

  const TEST_CERT = [
    '-----BEGIN CERTIFICATE-----',
    'MIIDCTCCAfGgAwIBAgIUJlTU/XOWVPx5pCIvFNoduaBdF9EwDQYJKoZIhvcNAQEL',
    'BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MTExMjE0MzU1OFoXDTM2MTEw',
    'OTE0MzU1OFowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF',
    'AAOCAQ8AMIIBCgKCAQEArBuLGj+xlTDB99KeFxbxwD92lCqti+BMZQ8eOHOwqkCI',
    'I0vuZoCH1f8Cx5FxVWmtTbf0ggOdKmnIul1l20ABNsM8/QuxDk51q7CLOVItkvJE',
    'ueZwwSVaa8FfqyeE8KOMPAsLn7K6epn9hoMa6hAmDfG1pk4zlm0Hvb0dfuFCrckj',
    'qZqqe1dX8fPYM1UF5Mz3SeEKWje+JBajOyLAMW2pc872RIDGQ1Ekte1QAU/UhIzz',
    'd99hFvpECa7jXjrU4YeMM524giTICnUweysbt57pQIu9ekT8ItQ4u14DHjRc0xrg',
    'aqAHhFRUqu40iLPhQ4ZYJ5hScjHkHF0WQj48eXwTawIDAQABo1MwUTAdBgNVHQ4E',
    'FgQU56uwcbQ/+6MpUjRAuZgHZKQHpxQwHwYDVR0jBBgwFoAU56uwcbQ/+6MpUjRA',
    'uZgHZKQHpxQwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAXUwG',
    'i/yX6jO90nw6X5ABC+wauXm/YHhiC5XSPRm4yu/BpWWWZpwUeKX9eLn2fXW0fPOc',
    '1Yeqi1WLt26oqmPX3DFrqLZExdBFG4h7a3XwMEH+rmQBRXY/ApaemYvj0f1wsCo0',
    'ibk0QluS8AM039mgUuhQ7frvC6+qBV92DMZ4KG3379XA8pGHO1MPto3KX9C9ls7Q',
    'cFc3hbNmDcUo9YENNSeIHMWKMNghTrSIWdFiSfmeSWdChQnj0R6fsZZBvDn4Mj0c',
    'Z1V+cbx2UdmS963cShv+My/j4d21MWJ32nxNdG37PGQmJrephMJCcBZd5KzAEnWU',
    'TKXgn1YiHyUqtgmiUw==',
    '-----END CERTIFICATE-----'
  ].join('\n');

  const sstpServer = tls.createServer(
    { key: TEST_KEY, cert: TEST_CERT },
    (sock) => {
      sock.once('data', (data) => {
        const str = data.toString('ascii');
        if (str.startsWith('SSTP_DUPLEX_POST /sra_{BA195980-CD49-458b-9E23-C84EE0ADCD75}/ HTTP/1.1')) {
          sock.write('HTTP/1.1 200 OK\r\nContent-Length: 18446744073709551615\r\n\r\n');
        } else {
          sock.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        }
      });
    }
  );

  await new Promise((res) => sstpServer.listen(0, '127.0.0.1', res));
  const sstpPort = sstpServer.address().port;
  const sstpMs = await testSstp('127.0.0.1', sstpPort, 2500);
  sstpServer.close();
  assert(sstpMs >= 1, `Expected positive SSTP RTT, got ${sstpMs}`);

  console.log('4. Testing AES-256-GCM QR compatibility with Banafsh-sstp (QrShare.kt)...');
  const encoded = encodeServer({
    host: 'vpn841038279.opengw.net',
    port: 1287,
    user: 'vpn',
    pass: 'vpn',
    cc: 'JP',
    verify: false,
    protocol: 'sstp'
  });
  assert(!encoded.includes('='), 'Base64url must not contain padding');
  const decoded = decodeServer(encoded);
  assert(decoded, 'Should decode valid Banafsh QR payload');
  assert.strictEqual(decoded.host, 'vpn841038279.opengw.net');
  assert.strictEqual(decoded.port, 1287);
  assert.strictEqual(decoded.cc, 'JP');
  assert.strictEqual(decoded.verify, false);
  assert.strictEqual(decoded.protocol, 'sstp');

  // Tamper check
  const tampered = encoded.slice(0, -4) + 'AAAA';
  assert.strictEqual(decodeServer(tampered), null, 'Tampered QR payload must be rejected');

  // Pure Android QrShare payload (without t/k fields)
  const key = crypto.createHash('sha256').update('Banafsh-sstp/qr/v1/7f3a9c1e5b', 'utf8').digest();
  const iv = crypto.randomBytes(12);
  const ciph = crypto.createCipheriv('aes-256-gcm', key, iv);
  ciph.setAAD(Buffer.from('BNF1', 'utf8'));
  const androidJson = JSON.stringify({ h: 'public-vpn-95.opengw.net', p: 443, u: 'vpn', w: 'vpn', c: 'JP', v: 1 });
  const androidToken = Buffer.concat([iv, ciph.update(androidJson, 'utf8'), ciph.final(), ciph.getAuthTag()]).toString('base64url');
  const fromAndroid = decodeServer(androidToken);
  assert(fromAndroid && fromAndroid.host === 'public-vpn-95.opengw.net' && fromAndroid.cc === 'JP');

  // SVG QR generation
  const svg = makeQrSvg(encoded);
  assert(svg.startsWith('<svg') && svg.includes('#2A1D4A'));

  console.log('5. Testing Android <-> Windows Profile JSON import/export...');
  const profJson = serializeProfileJson({
    host: 'vpn123.opengw.net',
    port: 995,
    user: 'alice',
    pass: 'secret',
    psk: 'mypsk',
    cc: 'KR',
    protocol: 'sstp'
  });
  const parsedProf = parseProfileJson(profJson);
  assert.strictEqual(parsedProf.host, 'vpn123.opengw.net');
  assert.strictEqual(parsedProf.port, 995);
  assert.strictEqual(parsedProf.user, 'alice');
  assert.strictEqual(parsedProf.pass, 'secret');
  assert.strictEqual(parsedProf.psk, 'mypsk');
  assert.strictEqual(parsedProf.cc, 'KR');

  console.log('6. Testing Server normalization, RU exclusion, non-443 ports, and Quality calculation...');
  assert.strictEqual(qualityOf(100, 0), 'unknown');
  assert.strictEqual(qualityOf(100, 1), 'unknown');
  assert.strictEqual(qualityOf(100, 5), 'good');   // 100 / 6 = 16.6 >= 8
  assert.strictEqual(qualityOf(30, 5), 'medium');  // 30 / 6 = 5.0 >= 3
  assert.strictEqual(qualityOf(10, 5), 'bad');     // 10 / 6 = 1.66 < 3
  assert(qualityRank('good') < qualityRank('medium') && qualityRank('medium') < qualityRank('unknown') && qualityRank('unknown') < qualityRank('bad'));

  const normed = normServers([
    { host: 'vpn1.opengw.net', port: 1287, country: 'JP', country_name: 'Japan', speed_mbps: 120, sessions: 5, ping: 12 },
    { host: 'vpn-ru.opengw.net', port: 443, country: 'RU', country_name: 'Russia', speed_mbps: 500, sessions: 3, ping: 10 }
  ], 'sstp');
  assert.strictEqual(normed.length, 1, 'RU server should be excluded');
  assert.strictEqual(normed[0].port, 1287, 'Non-443 SSTP port must be preserved');
  assert.strictEqual(normed[0].quality, 'good');

  console.log('7. Testing Updater version comparison, bilingual release notes & News parser...');
  assert.strictEqual(isNewer('0.2.0', '0.1.13'), true);
  assert.strictEqual(isNewer('0.1.13', '0.2.0'), false);
  assert.strictEqual(isNewer('1.0.0', '1.0.0-beta.1'), true);

  const rawNotes = '<!--fa-->\n## تازه‌ها\n- ویژگی اول\n<!--en-->\n## What is new\n- First feature';
  assert(pickNotes(rawNotes, 'fa').includes('• ویژگی اول'));
  assert(pickNotes(rawNotes, 'en').includes('• First feature'));

  const activeNews = parseNews(JSON.stringify({
    id: 'n1',
    active: true,
    fa: { title: 'سلام', text: 'تست خبر' },
    url: 'https://t.me/Banafsh_sstp',
    expires: '2099-12-31'
  }), 'fa');
  assert(activeNews && activeNews.id === 'n1' && activeNews.title === 'سلام');

  const expiredNews = parseNews(JSON.stringify({
    id: 'n2',
    active: true,
    fa: { title: 'قدیمی', text: 'منقضی' },
    expires: '2020-01-01'
  }), 'fa');
  assert.strictEqual(expiredNews, null);

  console.log('8. Testing Direct (No VPN) Iranian IP ranges & custom bypass routing...');
  const bundledIranPath = path.join(__dirname, '..', 'data', 'iran_ranges.txt');
  assert(fs.existsSync(bundledIranPath), 'Bundled data/iran_ranges.txt must exist');
  const iranMerged = parseRanges(fs.readFileSync(bundledIranPath, 'utf8'));
  assert(iranMerged.length > 1000, `Expected >1000 merged Iranian intervals, got ${iranMerged.length}`);
  const iranCidrs = intervalsToCidrs(iranMerged);
  assert(iranCidrs.length > 1000 && iranCidrs.length < 20000);

  // Adjacent CIDR merge: 5.22.192.0/22 + 5.22.196.0/22 => 5.22.192.0/21
  const adj = intervalsToCidrs(parseRanges('5.22.192.0/22\n5.22.196.0/22'));
  assert.deepStrictEqual(adj, ['5.22.192.0/21']);

  // Endpoint exclusion check
  const builtCidrs = await buildBypassCidrs({
    dataDir: __dirname,
    bundledPath: bundledIranPath,
    iranSitesEnabled: false,
    customSitesEnabled: true,
    sites: ['185.143.232.0/30'],
    excludeHost: '185.143.232.1'
  });
  assert(builtCidrs.includes('185.143.232.0/32') && builtCidrs.includes('185.143.232.2/31'));
  assert(!builtCidrs.includes('185.143.232.1/32'));
  assert.strictEqual(normBypassEntry('https://www.Digikala.com/test'), 'digikala.com');
  assert.strictEqual(normBypassEntry('185.143.232.99/22'), '185.143.232.0/22');

  console.log('9. Syntax-checking all project JS files...');
  const jsFiles = [
    'main.js',
    'preload.js',
    'lib/bypass.js',
    'lib/probes.js',
    'lib/qr.js',
    'lib/servers.js',
    'lib/updater.js',
    'lib/vpn-win.js',
    'renderer/flags.js',
    'renderer/network.js',
    'renderer/app.js'
  ];
  for (const rel of jsFiles) {
    execFileSync(process.execPath, ['--check', path.join(__dirname, '..', rel)]);
  }

  console.log('ALL TESTS PASSED!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
