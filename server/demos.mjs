// Toutes les démos sur le VPS (demos.bornzstudio.com) : un seul processus Node, sans dépendance.
//  - sert le dossier SITE_DIR (sites/) tel quel : /<slug>/ → sites/<slug>/index.html, galerie à la racine,
//    page 404 (sites/404.html), compression, lectures partielles pour l'audio et la vidéo ;
//  - applique les en-têtes de sites/_headers (même format qu'avant : un chemin, puis ses en-têtes en retrait) ;
//  - /sarraf/api/* : transcription et lecture des mémos du cambiste (server/sarraf.js, sans stockage) ;
//  - /hooked-academy/* : renvoie vers le site de la formation (ACADEMY_URL), servi par server/index.mjs.
// Sur le VPS, le dossier sites/ est celui du dépôt (mis à jour depuis GitHub) : une démo poussée sur main
// est en ligne sans redémarrage.
//
// Variables : PORT (3000), SITE_DIR (../sites), TRUST_PROXY (1 derrière Caddy), ACADEMY_URL
// (https://hooked-academy.tech), et celles de Sarraf (voir server/sarraf.js).
// Tester sur son ordinateur : node server/demos.mjs, puis http://localhost:3000/<slug>/

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { brotliCompressSync, gzipSync, constants as Z } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sarraf } from './sarraf.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const SITE = path.resolve(process.env.SITE_DIR || path.join(HERE, '../sites'));
const PROXY = process.env.TRUST_PROXY === '1';
const ACADEMY = (process.env.ACADEMY_URL || 'https://hooked-academy.tech').replace(/\/$/, '');
const CORPS_MAX = 30 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* En-têtes de sites/_headers                                          */
/* ------------------------------------------------------------------ */

let regles = { lu: 0, mtime: -1, liste: [] };

/** Relit sites/_headers quand il a changé (au plus toutes les 5 secondes). */
async function reglesEntetes() {
  if (Date.now() - regles.lu < 5000) return regles.liste;
  regles.lu = Date.now();
  try {
    const st = await stat(path.join(SITE, '_headers'));
    if (st.mtimeMs === regles.mtime) return regles.liste;
    const liste = [];
    let courante = null;
    for (const ligne of (await readFile(path.join(SITE, '_headers'), 'utf8')).split(/\r?\n/)) {
      if (!ligne.trim() || ligne.trim().startsWith('#')) continue;
      if (!/^\s/.test(ligne)) {
        const motif = ligne.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        liste.push((courante = { re: new RegExp(`^${motif}$`), entetes: {} }));
      } else if (courante) {
        const i = ligne.indexOf(':');
        if (i > 0) courante.entetes[ligne.slice(0, i).trim().toLowerCase()] = ligne.slice(i + 1).trim();
      }
    }
    regles = { lu: Date.now(), mtime: st.mtimeMs, liste };
  } catch {
    regles = { lu: Date.now(), mtime: -1, liste: [] };
  }
  return regles.liste;
}

async function entetesPour(chemin) {
  const h = {};
  for (const r of await reglesEntetes()) if (r.re.test(chemin)) Object.assign(h, r.entetes);
  return h;
}

/* ------------------------------------------------------------------ */
/* Fichiers                                                            */
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
  avif: 'image/avif',
  gif: 'image/gif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  pdf: 'application/pdf',
  xml: 'application/xml; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  vtt: 'text/vtt; charset=utf-8',
  srt: 'text/plain; charset=utf-8',
};
const TEXTE = /^(text\/|application\/(json|manifest\+json|xml)|image\/svg|model\/gltf\+json)/;
const compresses = new Map(); // fichier texte compressé, gardé en mémoire tant qu'il ne change pas

async function introuvable(req, res, base) {
  let page = '<!doctype html><meta charset="utf-8"><title>Page introuvable</title><h1>Page introuvable</h1><p><a href="/">Toutes les démos</a></p>';
  try {
    page = await readFile(path.join(SITE, '404.html'), 'utf8');
  } catch {}
  res.writeHead(404, { ...base, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
  res.end(req.method === 'HEAD' ? undefined : page);
}

async function servirFichier(req, res, url, base) {
  let rel;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    return introuvable(req, res, base);
  }
  // Ni fichiers cachés, ni remontée hors du dossier, ni le fichier des règles d'en-têtes
  if (rel.includes('\0') || rel.split('/').some((p) => p === '..' || p.startsWith('.')) || rel === '/_headers') return introuvable(req, res, base);
  if (rel.endsWith('/')) rel += 'index.html';
  const fichier = path.join(SITE, rel);
  if (!fichier.startsWith(SITE + path.sep)) return introuvable(req, res, base);
  let st;
  try {
    st = await stat(fichier);
    if (st.isDirectory()) {
      res.writeHead(301, { ...base, location: `${url.pathname}/${url.search}` });
      return res.end();
    }
  } catch {
    return introuvable(req, res, base);
  }
  const ext = path.extname(fichier).slice(1).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  const etag = `W/"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
  const h = {
    ...base,
    ...(await entetesPour(url.pathname)),
    'content-type': type,
    etag,
    'last-modified': st.mtime.toUTCString(),
    // Pages et code : toujours vérifiés (une démo poussée est visible tout de suite) ; images et médias : une heure
    'cache-control': TEXTE.test(type) || ext === 'js' ? 'no-cache' : 'public, max-age=3600',
    vary: 'Accept-Encoding',
  };
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, h);
    return res.end();
  }
  // Textes : compressés (brotli, sinon gzip)
  const ae = String(req.headers['accept-encoding'] || '');
  if (TEXTE.test(type) && st.size < 8e6 && (ae.includes('br') || ae.includes('gzip'))) {
    const enc = ae.includes('br') ? 'br' : 'gzip';
    const cle = `${fichier}|${enc}`;
    let c = compresses.get(cle);
    if (!c || c.etag !== etag) {
      const brut = await readFile(fichier);
      c = { etag, buf: enc === 'br' ? brotliCompressSync(brut, { params: { [Z.BROTLI_PARAM_QUALITY]: 6 } }) : gzipSync(brut, { level: 6 }) };
      compresses.set(cle, c);
    }
    res.writeHead(200, { ...h, 'content-encoding': enc, 'content-length': c.buf.length });
    return res.end(req.method === 'HEAD' ? undefined : c.buf);
  }
  // Médias : lectures partielles (audio, vidéo)
  let debut = 0;
  let fin = st.size - 1;
  let statut = 200;
  const plage = req.headers.range;
  if (plage) {
    const m = String(plage).match(/^bytes=(\d*)-(\d*)$/);
    if (!m || (!m[1] && !m[2])) {
      res.writeHead(416, { ...h, 'content-range': `bytes */${st.size}` });
      return res.end();
    }
    if (m[1]) {
      debut = Number(m[1]);
      fin = m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
    } else debut = Math.max(0, st.size - Number(m[2]));
    if (debut > fin || debut >= st.size) {
      res.writeHead(416, { ...h, 'content-range': `bytes */${st.size}` });
      return res.end();
    }
    statut = 206;
    h['content-range'] = `bytes ${debut}-${fin}/${st.size}`;
  }
  res.writeHead(statut, { ...h, 'accept-ranges': 'bytes', 'content-length': fin - debut + 1 });
  if (req.method === 'HEAD') return res.end();
  createReadStream(fichier, { start: debut, end: fin }).pipe(res);
}

/* ------------------------------------------------------------------ */
/* Sarraf : requête standard pour server/sarraf.js                     */
/* ------------------------------------------------------------------ */

async function api(req, res, url, base) {
  if (Number(req.headers['content-length'] || 0) > CORPS_MAX) {
    res.writeHead(413, { ...base, 'content-type': 'application/json; charset=utf-8' });
    return res.end('{"error":"audio_trop_long"}');
  }
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
  const avecCorps = req.method !== 'GET' && req.method !== 'HEAD';
  const r = await sarraf(new Request(url, { method: req.method, headers, body: avecCorps ? Readable.toWeb(req) : undefined, duplex: 'half' }), process.env);
  const sortie = { ...base };
  r.headers.forEach((v, k) => (sortie[k] = v));
  res.writeHead(r.status, sortie);
  res.end(req.method === 'HEAD' ? undefined : Buffer.from(await r.arrayBuffer()));
}

/* ------------------------------------------------------------------ */
/* Serveur HTTP                                                        */
/* ------------------------------------------------------------------ */

const serveur = createServer(async (req, res) => {
  const https = PROXY ? String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' : false;
  const hote = (PROXY && req.headers['x-forwarded-host']) || req.headers.host || 'localhost';
  let url;
  try {
    url = new URL(req.url, `${https ? 'https' : 'http'}://${hote}`);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  const base = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    ...(https ? { 'strict-transport-security': 'max-age=31536000' } : {}),
  };
  try {
    if (url.pathname === '/sante') {
      res.writeHead(200, { ...base, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
      return res.end('ok');
    }
    if (url.pathname.startsWith('/sarraf/api/')) return await api(req, res, url, base);
    // Hooked Academy a son propre site sur le VPS (comptes, inscriptions) : les anciens liens y mènent
    if (url.pathname === '/hooked-academy' || url.pathname.startsWith('/hooked-academy/')) {
      res.writeHead(301, { ...base, location: `${ACADEMY}${url.pathname.slice('/hooked-academy'.length) || '/'}${url.search}` });
      return res.end();
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...base, allow: 'GET, HEAD' });
      return res.end();
    }
    return await servirFichier(req, res, url, base);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Erreur du serveur');
  }
});
serveur.requestTimeout = 5 * 60e3;
serveur.headersTimeout = 30e3;
serveur.listen(PORT, () => console.log(`Démos : http://localhost:${PORT}/ (dossier ${SITE})`));

const arreter = () => {
  serveur.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
};
process.on('SIGTERM', arreter);
process.on('SIGINT', arreter);
