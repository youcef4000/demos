// Hooked Academy sur un VPS (Hostinger + Coolify) : un seul processus Node, sans dépendance.
//  - sert le site (dossier SITE_DIR) avec ses en-têtes de sécurité, la compression et les lectures partielles ;
//  - confie /api/* et /media/* au cœur du serveur (plateforme.js), avec une base SQLite dans DATA_DIR ;
//  - protège les voix off des leçons payantes (video/voix/<leçon>.m4a) : bienvenue et démo pour tous,
//    le reste pour l'équipe et les étudiants qui ont la formation ;
//  - sauvegarde la base chaque jour (DATA_DIR/sauvegardes, 14 jours gardés).
//
// Variables : PORT (3000), SITE_DIR (../sites/hooked-academy), DATA_DIR (./data), BASE (« » : site à la racine
// du domaine), TRUST_PROXY (1 derrière Coolify/Traefik : adresse IP et https lus dans X-Forwarded-*),
// SETUP_HASH (empreinte d'un nouveau code d'installation, sinon celle de plateforme.js).

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile, mkdir, readdir, rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { brotliCompressSync, gzipSync, constants as Z } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { Plateforme } from './plateforme.js';
import { headersFor } from './entetes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const SITE = path.resolve(process.env.SITE_DIR || path.join(HERE, '../sites/hooked-academy'));
const DATA = path.resolve(process.env.DATA_DIR || path.join(HERE, '../data'));
const BASE = (process.env.BASE || '').replace(/\/$/, '');
const PROXY = process.env.TRUST_PROXY === '1';

/* ------------------------------------------------------------------ */
/* Base SQLite (même interface que le stockage d'un Durable Object)    */
/* ------------------------------------------------------------------ */

await mkdir(path.join(DATA, 'sauvegardes'), { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'academy.sqlite'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000;');
const stmts = new Map();
const bind = (v) => (v instanceof ArrayBuffer ? new Uint8Array(v) : v);
const sql = {
  exec(q, ...params) {
    if (!params.length && q.trim().split(';').filter((x) => x.trim()).length > 1) {
      db.exec(q);
      return { toArray: () => [] };
    }
    let st = stmts.get(q);
    if (!st) stmts.set(q, (st = db.prepare(q)));
    if (/^\s*(SELECT|WITH)\b/i.test(q)) {
      const rows = st.all(...params.map(bind));
      return { toArray: () => rows };
    }
    st.run(...params.map(bind));
    return { toArray: () => [] };
  },
};
function transactionSync(fn) {
  db.exec('BEGIN');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

const clientIp = (req) => {
  if (PROXY) {
    const real = req.headers['x-real-ip'];
    if (real) return String(real).trim();
    const xff = String(req.headers['x-forwarded-for'] || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (xff.length) return xff[xff.length - 1];
  }
  return req.socket.remoteAddress || '';
};
const app = new Plateforme({ sql, transactionSync }, { base: BASE, ip: (r) => r.headers.get('x-ha-ip') || '' });

// Premier démarrage : la FAQ du site (publique) et les questions pro (server/faq-pro.json, réservées aux membres)
if (!app.kv('faq')) {
  try {
    const pub = JSON.parse(await readFile(path.join(SITE, 'data/faq.json'), 'utf8')).map((x) => ({ aud: 'public', ...x }));
    const pro = JSON.parse(await readFile(path.join(HERE, 'faq-pro.json'), 'utf8')).map((x) => ({ ...x, aud: 'pro', landing: false }));
    app.seedFaq([...pub, ...pro]);
    console.log(`FAQ initiale : ${pub.length} publiques, ${pro.length} pro`);
  } catch (e) {
    console.error('FAQ initiale impossible', e);
  }
}

/* ------------------------------------------------------------------ */
/* Sauvegarde quotidienne                                              */
/* ------------------------------------------------------------------ */

async function backup() {
  const day = new Date().toISOString().slice(0, 10);
  const dir = path.join(DATA, 'sauvegardes');
  const file = path.join(dir, `academy-${day}.sqlite`);
  try {
    await stat(file);
    return;
  } catch {}
  try {
    db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
    const old = (await readdir(dir)).filter((f) => /^academy-\d{4}-\d{2}-\d{2}\.sqlite$/.test(f)).sort();
    for (const f of old.slice(0, Math.max(0, old.length - 14))) await rm(path.join(dir, f));
    console.log(`sauvegarde ${file}`);
  } catch (e) {
    console.error('sauvegarde impossible', e);
  }
}
setTimeout(backup, 60e3);
setInterval(backup, 3600e3);

/* ------------------------------------------------------------------ */
/* Fichiers du site                                                    */
/* ------------------------------------------------------------------ */

const TYPES = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  webmanifest: 'application/manifest+json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  woff2: 'font/woff2',
  mp4: 'video/mp4',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  srt: 'text/plain; charset=utf-8',
};
const TEXT = /^(text\/|application\/(json|manifest\+json)|image\/svg)/;
const packed = new Map(); // fichier texte compressé, gardé en mémoire tant qu'il ne change pas

const notFound = (res, h) => {
  res.writeHead(404, { ...h, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
  res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page introuvable</title><body style="font-family:system-ui;background:#07060a;color:#f2efe8;display:grid;place-items:center;min-height:90vh;text-align:center"><div><h1>Page introuvable</h1><p><a style="color:#e0be55" href="/">Retour à l’accueil</a></p></div>');
};

async function serveFile(req, res, url, base) {
  let rel;
  try {
    rel = decodeURIComponent(url.pathname.slice(BASE.length));
  } catch {
    return notFound(res, base);
  }
  if (rel.includes('\0') || rel.split('/').some((p) => p === '..' || p.startsWith('.'))) return notFound(res, base);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(SITE, rel);
  if (!file.startsWith(SITE + path.sep)) return notFound(res, base);
  let st;
  try {
    st = await stat(file);
    if (st.isDirectory()) {
      res.writeHead(301, { ...base, location: `${url.pathname}/${url.search}` });
      return res.end();
    }
  } catch {
    return notFound(res, base);
  }
  // Voix off d'une leçon payante : seulement pour l'équipe et les étudiants de la formation
  const voix = rel.match(/^\/video\/voix\/((?:m|ia)\d{1,2}-l\d{1,2})\.m4a$/);
  if (voix) {
    const request = new Request(url, { headers: { cookie: req.headers.cookie || '' } });
    if (!(await app.lessonAllowed(request, voix[1]))) {
      res.writeHead(403, { ...base, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
      return res.end('Leçon réservée aux membres.');
    }
  }
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  const etag = `W/"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
  const h = {
    ...base,
    ...headersFor(rel),
    'content-type': type,
    etag,
    'last-modified': st.mtime.toUTCString(),
    // Pages et code : toujours vérifiés (mises à jour immédiates) ; images et médias : une heure
    'cache-control': /^(text\/|application\/(json|manifest))/.test(type) || ext === 'js' ? 'no-cache' : voix ? 'private, max-age=3600' : 'public, max-age=3600',
    vary: 'Accept-Encoding',
  };
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, h);
    return res.end();
  }
  // Textes : compressés (brotli, sinon gzip)
  const ae = String(req.headers['accept-encoding'] || '');
  if (TEXT.test(type) && st.size < 8e6 && (ae.includes('br') || ae.includes('gzip'))) {
    const enc = ae.includes('br') ? 'br' : 'gzip';
    const key = `${file}|${enc}`;
    let hit = packed.get(key);
    if (!hit || hit.etag !== etag) {
      const raw = await readFile(file);
      hit = { etag, buf: enc === 'br' ? brotliCompressSync(raw, { params: { [Z.BROTLI_PARAM_QUALITY]: 6 } }) : gzipSync(raw, { level: 6 }) };
      packed.set(key, hit);
    }
    res.writeHead(200, { ...h, 'content-encoding': enc, 'content-length': hit.buf.length });
    return res.end(req.method === 'HEAD' ? undefined : hit.buf);
  }
  // Médias : lectures partielles (audio, vidéo)
  let start = 0;
  let end = st.size - 1;
  let status = 200;
  const range = req.headers.range;
  if (range) {
    const m = String(range).match(/^bytes=(\d*)-(\d*)$/);
    if (!m || (!m[1] && !m[2])) {
      res.writeHead(416, { ...h, 'content-range': `bytes */${st.size}` });
      return res.end();
    }
    if (m[1]) {
      start = Number(m[1]);
      end = m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
    } else start = Math.max(0, st.size - Number(m[2]));
    if (start > end || start >= st.size) {
      res.writeHead(416, { ...h, 'content-range': `bytes */${st.size}` });
      return res.end();
    }
    status = 206;
    h['content-range'] = `bytes ${start}-${end}/${st.size}`;
  }
  res.writeHead(status, { ...h, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file, { start, end }).pipe(res);
}

/* ------------------------------------------------------------------ */
/* Serveur HTTP                                                        */
/* ------------------------------------------------------------------ */

const server = createServer(async (req, res) => {
  const https = PROXY ? String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' : false;
  const host = (PROXY && req.headers['x-forwarded-host']) || req.headers.host || 'localhost';
  let url;
  try {
    url = new URL(req.url, `${https ? 'https' : 'http'}://${host}`);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  const base = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'SAMEORIGIN',
    'cross-origin-opener-policy': 'same-origin',
    ...(https ? { 'strict-transport-security': 'max-age=31536000; includeSubDomains' } : {}),
  };
  try {
    if (BASE && url.pathname === BASE) {
      res.writeHead(301, { ...base, location: `${BASE}/${url.search}` });
      return res.end();
    }
    if (!url.pathname.startsWith(`${BASE}/`)) return notFound(res, base);
    const sub = url.pathname.slice(BASE.length);
    if (sub.startsWith('/api/') || sub.startsWith('/media/')) {
      // Requête standard pour le cœur du serveur ; l'adresse du visiteur vient du proxy, jamais du visiteur
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (v != null && k !== 'x-ha-ip') headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
      headers.set('x-ha-ip', clientIp(req));
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      const r = await app.fetch(new Request(url, { method: req.method, headers, body: hasBody ? Readable.toWeb(req) : undefined, duplex: 'half' }));
      const out = {};
      r.headers.forEach((v, k) => k !== 'set-cookie' && (out[k] = v));
      const cookies = r.headers.getSetCookie();
      if (cookies.length) out['set-cookie'] = cookies;
      if (base['strict-transport-security']) out['strict-transport-security'] = base['strict-transport-security'];
      res.writeHead(r.status, out);
      if (!r.body || req.method === 'HEAD') return res.end();
      return Readable.fromWeb(r.body).on('error', () => res.destroy()).pipe(res);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...base, allow: 'GET, HEAD' });
      return res.end();
    }
    return await serveFile(req, res, url, base);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Erreur du serveur');
  }
});
server.requestTimeout = 5 * 60e3;
server.headersTimeout = 30e3;
server.listen(PORT, () => console.log(`Hooked Academy : http://localhost:${PORT}${BASE}/ (site ${SITE}, données ${DATA})`));

const stop = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
