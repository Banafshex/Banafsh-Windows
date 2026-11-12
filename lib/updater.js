'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { httpGetText } = require('./servers');

const RELEASES_LATEST_API = 'https://api.github.com/repos/Banafshex/Banafsh-Windows/releases/latest';
const RELEASES_LIST_API = 'https://api.github.com/repos/Banafshex/Banafsh-Windows/releases?per_page=5';
const RELEASES_PAGE = 'https://github.com/Banafshex/Banafsh-Windows/releases';

const NEWS_URLS = [
  'https://raw.githubusercontent.com/Banafshex/Banafsh-Windows/main/news.json',
  'https://cdn.jsdelivr.net/gh/Banafshex/Banafsh-Windows@main/news.json',
  'https://raw.githubusercontent.com/Banafshex/Banafsh-sstp/main/news.json',
  'https://cdn.jsdelivr.net/gh/Banafshex/Banafsh-sstp@main/news.json'
];

const SEMVER_RE = /(\d+\.\d+(?:\.\d+)?(?:-[A-Za-z0-9.]+)?)/;

function parseVersion(version) {
  const clean = String(version || '').trim().replace(/^v/i, '');
  const [core, pre] = clean.split('-');
  const nums = core.split('.').map((n) => {
    const parsed = parseInt(n, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  return { nums, isPre: Boolean(pre) };
}

function isNewer(remote, local) {
  if (!remote || !SEMVER_RE.test(String(remote))) return false;
  const r = parseVersion(remote);
  const l = parseVersion(local);
  const len = Math.max(r.nums.length, l.nums.length);
  for (let i = 0; i < len; i++) {
    const a = r.nums[i] || 0;
    const b = l.nums[i] || 0;
    if (a !== b) return a > b;
  }
  return l.isPre && !r.isPre;
}

function pickNotes(notes, lang = 'fa') {
  const body = String(notes || '').split('\n---')[0].trim();
  if (!body) return '';
  const faIdx = body.indexOf('<!--fa-->');
  const enIdx = body.indexOf('<!--en-->');

  let chosen = body;
  if (faIdx >= 0 && enIdx >= 0) {
    const fa = faIdx < enIdx ? body.slice(faIdx + 9, enIdx) : body.slice(faIdx + 9);
    const en = enIdx < faIdx ? body.slice(enIdx + 9, faIdx) : body.slice(enIdx + 9);
    chosen = (lang === 'fa' ? fa : en).trim();
  } else {
    chosen = body.replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  return chosen
    .split(/\r?\n/)
    .map((line) => {
      let s = line.trim().replace(/^#+\s*/, '');
      if (s.startsWith('- ')) s = '• ' + s.slice(2);
      return s;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1500);
}

function extractReleaseInfo(releaseJson, isPortable = false) {
  if (!releaseJson || releaseJson.draft) return null;
  const assets = Array.isArray(releaseJson.assets) ? releaseJson.assets : [];
  const exeAssets = assets.filter((a) => a && typeof a.name === 'string' && a.name.toLowerCase().endsWith('.exe'));
  if (!exeAssets.length) return null;

  const preferred = exeAssets.find((a) =>
    isPortable ? /portable\.exe$/i.test(a.name) : /setup\.exe$/i.test(a.name)
  ) || exeAssets[0];

  const tag = String(releaseJson.tag_name || '').trim();
  let version = '';
  const tagMatch = tag.match(/^v?(\d+\.\d+(?:\.\d+)?(?:-[A-Za-z0-9.]+)?)$/i);
  if (tagMatch) {
    version = tagMatch[1];
  } else {
    const assetMatch = preferred.name.match(/Banafsh-(\d+\.\d+(?:\.\d+)?(?:-[A-Za-z0-9.]+)?)/i) ||
      preferred.name.match(SEMVER_RE);
    if (assetMatch) version = assetMatch[1];
  }

  if (!version || ! preferred.browser_download_url) return null;

  return {
    version,
    notes: String(releaseJson.body || ''),
    exeName: preferred.name,
    exeUrl: preferred.browser_download_url,
    exeSize: Number(preferred.size) || 0,
    pageUrl: String(releaseJson.html_url || RELEASES_PAGE),
    prerelease: !!releaseJson.prerelease
  };
}

async function fetchLatestRelease({ isPortable = false } = {}) {
  try {
    const text = await httpGetText(RELEASES_LATEST_API, 12000, {
      Accept: 'application/vnd.github+json'
    });
    const parsed = JSON.parse(text);
    const info = extractReleaseInfo(parsed, isPortable);
    if (info && !info.prerelease) return { ok: true, info };
  } catch {
    // Fallback to releases list below
  }

  try {
    const text = await httpGetText(RELEASES_LIST_API, 12000, {
      Accept: 'application/vnd.github+json'
    });
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return { ok: false, info: null };
    for (const item of arr) {
      if (item.draft || item.prerelease) continue;
      const info = extractReleaseInfo(item, isPortable);
      if (info) return { ok: true, info };
    }
    return { ok: true, info: null };
  } catch {
    return { ok: false, info: null };
  }
}

function downloadReleaseAsset(info, destDir, onProgress, isCancelled) {
  return new Promise((resolve) => {
    try {
      fs.mkdirSync(destDir, { recursive: true });
    } catch {}

    const safeName = path.basename(info.exeName || `Banafsh-${info.version}.exe`);
    const filePath = path.join(destDir, safeName);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

    const fetchUrl = (url, redirects = 0) => {
      if (redirects > 6) {
        resolve(null);
        return;
      }
      const req = https.get(
        url,
        {
          timeout: 25000,
          headers: { 'User-Agent': 'Banafsh-Windows' }
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            fetchUrl(res.headers.location, redirects + 1);
            return;
          }
          if (res.statusCode !== 200) {
            res.resume();
            resolve(null);
            return;
          }

          const total = Number(res.headers['content-length']) || info.exeSize || 0;
          let done = 0;
          const out = fs.createWriteStream(filePath);
          let aborted = false;

          const cleanupFail = () => {
            if (aborted) return;
            aborted = true;
            try { req.destroy(); } catch {}
            try { out.close(); } catch {}
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
            resolve(null);
          };

          res.on('data', (chunk) => {
            if (isCancelled && isCancelled()) {
              cleanupFail();
              return;
            }
            done += chunk.length;
            if (onProgress) onProgress(done, total);
          });

          res.on('error', cleanupFail);
          out.on('error', cleanupFail);

          out.on('finish', () => {
            if (aborted) return;
            out.close(() => {
              if (isCancelled && isCancelled()) {
                try { fs.unlinkSync(filePath); } catch {}
                resolve(null);
                return;
              }
              try {
                const stat = fs.statSync(filePath);
                if (info.exeSize > 0 && stat.size !== info.exeSize) {
                  fs.unlinkSync(filePath);
                  resolve(null);
                  return;
                }
              } catch {
                resolve(null);
                return;
              }
              resolve(filePath);
            });
          });

          res.pipe(out);
        }
      );
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(new Error('timeout')); });
    };

    fetchUrl(info.exeUrl);
  });
}

function parseNews(rawText, lang = 'fa') {
  if (!rawText || typeof rawText !== 'string') return null;
  try {
    const json = JSON.parse(rawText);
    if (!json || !json.active) return null;
    const id = String(json.id || '').trim();
    if (!id) return null;

    const expires = String(json.expires || '').trim();
    if (expires && /^\d{4}-\d{2}-\d{2}$/.test(expires)) {
      const endMs = Date.parse(expires + 'T23:59:59Z');
      if (Number.isFinite(endMs) && Date.now() > endMs) return null;
    }

    const part = (lang === 'fa' ? json.fa : json.en) || json.en || json.fa;
    if (!part || typeof part !== 'object') return null;
    const title = String(part.title || '').trim();
    const text = String(part.text || '').trim();
    if (!title && !text) return null;

    const rawUrl = String(json.url || '').trim();
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : '';

    return { id, title, text, url };
  } catch {
    return null;
  }
}

async function fetchNews(lang = 'fa') {
  for (const url of NEWS_URLS) {
    try {
      const raw = await httpGetText(url, 10000);
      // Verify it's valid JSON before returning
      JSON.parse(raw);
      return { ok: true, raw, item: parseNews(raw, lang) };
    } catch {
      // Try next URL
    }
  }
  return { ok: false, raw: null, item: null };
}

module.exports = {
  RELEASES_PAGE,
  parseVersion,
  isNewer,
  pickNotes,
  fetchLatestRelease,
  downloadReleaseAsset,
  parseNews,
  fetchNews
};
