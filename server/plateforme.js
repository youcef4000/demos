// Hooked Academy — cœur du serveur de la plateforme, indépendant de l'hébergeur :
//  - sur un VPS : server/index.mjs (Node) le fait tourner avec une base SQLite dans un fichier ;
//  - sur Cloudflare : worker/academy.js l'enveloppe dans un Durable Object.
// Il reçoit des requêtes standard (Request) et renvoie des réponses standard (Response).
//
// Ce qu'il garde : inscriptions, étudiants (codes d'accès en empreinte), progression, sessions, compte de l'équipe,
// contenus modifiés depuis l'espace équipe (leçons, modules), voix off et ressources déposées, FAQ, réglages.
//
// Sécurité :
//  - équipe : mot de passe dérivé dans le navigateur (PBKDF2-SHA256, 310 000 tours, sel par compte), puis HMAC
//    côté serveur avec une clé tirée au hasard et jamais publiée ; création du compte par un code d'installation
//    à usage unique (100 bits ; seule son empreinte SHA-256 est publiée) ; appareils de l'équipe reconnus ;
//  - sessions : jeton aléatoire de 256 bits en cookie HttpOnly, Secure, SameSite=Strict ; seule son empreinte est stockée ;
//  - écritures : en-tête « x-ha: 1 » obligatoire et origine vérifiée (pas de requête forgée depuis un autre site) ;
//  - tentatives comptées avant toute vérification (pas de course), par adresse IP (IPv6 : par /64) et par identifiant ;
//  - corps de requête lus en flux et coupés au-delà de la taille permise ; fichiers servis en flux ;
//  - fichiers : types autorisés seulement, signature vérifiée, jamais servis comme page web (nosniff, sandbox),
//    fichiers des membres réservés aux étudiants de la formation concernée.

// Empreinte du code d'installation de l'espace équipe (remplaçable par la variable SETUP_HASH du serveur).
// Changer cette valeur (nouveau code) désactive le compte existant et permet d'en recréer un : c'est la
// procédure « mot de passe perdu ».
export const SETUP = '0e043b3c5ba67e65105de26109ed6434830abe9e3160ff22ea8d8b832aaa09cd';
const ITER = 310000;
const CHUNK = 1000000;
const MAX_FILE = 25 * 1024 * 1024;
const ADMIN_TTL = 12 * 3600e3;
const STUDENT_TTL = 30 * 864e5;
const YEAR = 365 * 864e5;
const LANGS = ['fr', 'en', 'ar'];
const TRACKS = ['creative', 'ia'];
const FREE_OPEN = ['m0-l1', 'm0-l2', 'ia0-l1', 'ia0-l4'];
// Leçons ouvertes au compte démo (landing, « essayer la plateforme ») : leur voix off reste publique
const DEMO_OPEN = ['m1-l1', 'ia1-l1'];
const STATUS = ['nouvelle', 'contactee', 'paiement', 'validee', 'refusee'];
const PROFILS = ['debutant', 'ecommercant', 'freelance', 'createur', 'agence'];
const PACKS = ['creative', 'ia', 'both'];
const CATS = ['inscription', 'formation', 'plateforme', 'ia', 'creation', 'business'];
const AUD = ['public', 'pro', 'both'];
const KINDS = ['pdf', 'prompt', 'link', 'image', 'file', 'audio', 'video'];
const DEFAULTS = { whatsapp: '213558678038', cohort: 'Prochaine session' };
const TRAINER = { id: 'st-trainer', name: 'Youcef N.', firstName: 'Youcef', cohort: 'Équipe Hooked', role: 'formateur', protected: true, active: true, access: TRACKS };

// Types de fichiers acceptés (par extension) et signature attendue en tête de fichier
const TYPES = {
  pdf: ['application/pdf', (b) => str4(b, 0) === '%PDF'],
  png: ['image/png', (b) => b[0] === 0x89 && str4(b, 1).startsWith('PNG')],
  jpg: ['image/jpeg', (b) => b[0] === 0xff && b[1] === 0xd8],
  jpeg: ['image/jpeg', (b) => b[0] === 0xff && b[1] === 0xd8],
  webp: ['image/webp', (b) => str4(b, 0) === 'RIFF' && str4(b, 8) === 'WEBP'],
  gif: ['image/gif', (b) => str4(b, 0) === 'GIF8'],
  m4a: ['audio/mp4', (b) => str4(b, 4) === 'ftyp'],
  mp4: ['video/mp4', (b) => str4(b, 4) === 'ftyp'],
  mov: ['video/quicktime', (b) => str4(b, 4) === 'ftyp' || str4(b, 4) === 'moov' || str4(b, 4) === 'wide'],
  mp3: ['audio/mpeg', (b) => str4(b, 0).startsWith('ID3') || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)],
  aac: ['audio/aac', (b) => b[0] === 0xff && (b[1] & 0xf0) === 0xf0],
  wav: ['audio/wav', (b) => str4(b, 0) === 'RIFF' && str4(b, 8) === 'WAVE'],
  ogg: ['audio/ogg', (b) => str4(b, 0) === 'OggS'],
  opus: ['audio/ogg', (b) => str4(b, 0) === 'OggS'],
  webm: ['audio/webm', (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3],
  txt: ['text/plain; charset=utf-8'],
  md: ['text/plain; charset=utf-8'],
  srt: ['text/plain; charset=utf-8'],
  csv: ['text/csv; charset=utf-8'],
  json: ['application/json'],
  zip: ['application/zip', (b) => b[0] === 0x50 && b[1] === 0x4b],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', (b) => b[0] === 0x50 && b[1] === 0x4b],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', (b) => b[0] === 0x50 && b[1] === 0x4b],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation', (b) => b[0] === 0x50 && b[1] === 0x4b],
};
// Affichés dans le navigateur (le reste est toujours téléchargé)
const INLINE = /^(application\/pdf|image\/(png|jpeg|webp|gif)|audio\/|video\/)/;

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

class Http extends Error {
  constructor(status, code, extra = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}
const fail = (status, code, extra) => {
  throw new Http(status, code, extra);
};

const enc = new TextEncoder();
const dec = new TextDecoder();
const str4 = (b, at) => String.fromCharCode(...b.subarray(at, at + 4));
const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', typeof s === 'string' ? enc.encode(s) : s));
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
const B32 = 'abcdefghijklmnopqrstuvwxyz234567';
const rid = (prefix, n = 20) => prefix + Array.from(rand(n), (b) => B32[b & 31]).join('');
const b64u = (u8) => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
/** Empreinte courte et synchrone (clés des limites : prête avant la première attente). */
function fnv(str) {
  let h = 0x811c9dc5;
  for (const c of String(str)) h = Math.imul(h ^ c.codePointAt(0), 0x01000193) >>> 0;
  return h.toString(36);
}
/** Clé de limitation d'une adresse : l'adresse IPv4, ou le réseau /64 d'une adresse IPv6. */
function netOf(ip) {
  ip = String(ip || '').trim().toLowerCase();
  if (!ip) return 'local';
  if (ip.startsWith('::ffff:') && ip.includes('.')) return ip.slice(7);
  if (!ip.includes(':')) return ip;
  const [h, t = ''] = ip.split('::');
  const a = h ? h.split(':') : [];
  const b = t ? t.split(':') : [];
  const full = [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill('0'), ...b];
  return `${full.slice(0, 4).map((x) => x.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}
/** Comparaison à temps constant de deux chaînes hexadécimales. */
function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const CODE_A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function accessCode() {
  const part = () => Array.from(rand(4), (b) => CODE_A[b & 31]).join('');
  return `HA-${part()}-${part()}`;
}
/** Code d'accès tapé par l'étudiant : majuscules, tirets remis à leur place. */
function normCode(s) {
  const c = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^HA[A-Z0-9]{8}$/.test(c) ? `HA-${c.slice(2, 6)}-${c.slice(6)}` : '';
}

const S = (v, max = 200) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max) : '');
const isLesson = (s) => typeof s === 'string' && /^(m|ia)\d{1,2}-l\d{1,2}$/.test(s);
const isModule = (s) => typeof s === 'string' && /^(m|ia)\d{1,2}$/.test(s);
const isFileId = (s) => typeof s === 'string' && /^f[a-z2-7]{20}$/.test(s);
const trackOfLesson = (id) => (String(id).startsWith('ia') ? 'ia' : 'creative');
const normEmail = (s) => {
  const e = S(s, 120).toLowerCase();
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(e) ? e : '';
};
const normPhone = (s) => {
  let d = S(s, 40).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `213${d.slice(1)}`;
  return d.length >= 8 && d.length <= 15 ? d : '';
};
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const iso = (t = Date.now()) => new Date(t).toISOString();
const ymd = (s) => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '');

const SEC = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'same-origin', 'x-frame-options': 'DENY' };
function json(data, status = 200, headers = {}) {
  const h = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': "default-src 'none'; frame-ancestors 'none'", ...SEC });
  for (const [k, v] of Object.entries(headers)) for (const x of [].concat(v)) h.append(k, x);
  return new Response(JSON.stringify(data), { status, headers: h });
}
const cookieOf = (req) =>
  Object.fromEntries(
    (req.headers.get('cookie') || '')
      .split(/;\s*/)
      .filter((c) => c.includes('='))
      .map((c) => [c.slice(0, c.indexOf('=')), c.slice(c.indexOf('=') + 1)]),
  );
const COOKIE = { admin: 'ha_admin', student: 'ha_student', device: 'ha_dev' };
const DEVICE_TTL = 400 * 864e5;

/** Corps de la requête, lu en flux : coupé dès qu'il dépasse `max` (même sans Content-Length). */
async function readBody(req, max) {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > max) fail(413, 'too_large');
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const parts = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.byteLength;
    if (n > max) {
      reader.cancel().catch(() => {});
      fail(413, 'too_large');
    }
    parts.push(value);
  }
  const out = new Uint8Array(n);
  let o = 0;
  for (const part of parts) {
    out.set(part, o);
    o += part.byteLength;
  }
  return out;
}
async function readJSON(req, max = 128 * 1024) {
  if (!(req.headers.get('content-type') || '').startsWith('application/json')) fail(415, 'json_only');
  let v;
  try {
    v = JSON.parse(dec.decode(await readBody(req, max)));
  } catch (e) {
    if (e instanceof Http) throw e;
    fail(400, 'bad_json');
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail(400, 'bad_json');
  return v;
}

/** Copie sûre d'une valeur JSON (scènes) : textes, nombres, booléens, listes et objets simples, profondeur limitée. */
function deep(v, depth = 0) {
  if (typeof v === 'string') return v.slice(0, 4000);
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'boolean' || v === null) return v;
  if (depth > 5) return undefined;
  if (Array.isArray(v)) return v.slice(0, 60).map((x) => deep(x, depth + 1) ?? null);
  if (typeof v === 'object') {
    const o = {};
    let n = 0;
    for (const [k, x] of Object.entries(v)) {
      if (n++ >= 40 || !/^[A-Za-z_][\w-]{0,30}$/.test(k) || k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      const c = deep(x, depth + 1);
      if (c !== undefined) o[k] = c;
    }
    return o;
  }
  return undefined;
}

/** Modification d'une leçon (une langue) : seuls les champs de texte prévus. */
function lessonPatch(v) {
  const o = {};
  for (const k of ['title', 'ar']) if (typeof v[k] === 'string') o[k] = S(v[k], 300);
  if (Array.isArray(v.scenes))
    o.scenes = v.scenes.slice(0, 40).map((sc) => {
      if (!sc || typeof sc !== 'object' || Array.isArray(sc)) return {};
      const c = deep(sc, 1);
      // Le type et le minutage d'une scène ne se modifient pas (animation et voix off calées dessus)
      for (const k of ['type', 'd', 'at', 'id']) delete c[k];
      return c;
    });
  for (const k of ['key', 'todo']) if (Array.isArray(v[k])) o[k] = v[k].map((x) => S(x, 600)).filter(Boolean).slice(0, 30);
  if (Array.isArray(v.quiz))
    o.quiz = v.quiz
      .slice(0, 30)
      .map((q) => {
        const a = Array.isArray(q?.a) ? q.a.map((x) => S(x, 300)).filter(Boolean).slice(0, 6) : [];
        const ok = Number.isInteger(q?.ok) && q.ok >= 0 && q.ok < a.length ? q.ok : 0;
        return { q: S(q?.q, 400), a, ok, why: S(q?.why, 800) };
      })
      .filter((q) => q.q && q.a.length >= 2);
  if (Array.isArray(v.res))
    o.res = v.res
      .slice(0, 30)
      .map((r) => ({ title: S(r?.title, 200), text: S(r?.text, 8000) }))
      .filter((r) => r.title && r.text);
  return o;
}
function modulePatch(v) {
  const o = {};
  for (const [k, max] of [
    ['title', 160],
    ['pitch', 600],
    ['ar', 160],
  ])
    if (typeof v[k] === 'string') o[k] = S(v[k], max);
  return o;
}
function faqItem(x, i) {
  if (!x || typeof x !== 'object') return null;
  const t = (o, max) => Object.fromEntries(LANGS.map((l) => [l, S(o?.[l], max)]));
  const it = {
    id: S(x.id, 40).replace(/[^\w-]/g, '') || `q${i}`,
    cat: CATS.includes(x.cat) ? x.cat : 'formation',
    aud: AUD.includes(x.aud) ? x.aud : 'public',
    landing: !!x.landing,
    kw: S(x.kw, 600),
    q: t(x.q, 200),
    a: t(x.a, 3000),
  };
  return it.q.fr && it.a.fr ? it : null;
}
function cleanProgress(p) {
  const o = { lessons: {}, last: null, days: [], xp: 0, badges: [] };
  if (!p || typeof p !== 'object') return o;
  if (p.lessons && typeof p.lessons === 'object')
    for (const [k, v] of Object.entries(p.lessons).slice(0, 400)) {
      if (!isLesson(k) || !v || typeof v !== 'object') continue;
      const L = {};
      if (v.done) L.done = true;
      if (Number.isFinite(v.watched)) L.watched = clamp(Math.round(v.watched), 0, 36000);
      if (Number.isFinite(v.quiz)) L.quiz = clamp(v.quiz, 0, 1);
      if (Array.isArray(v.todo)) L.todo = [...new Set(v.todo.filter((n) => Number.isInteger(n) && n >= 0 && n < 40))];
      if (v.todoDone) L.todoDone = true;
      if (typeof v.at === 'string' && !Number.isNaN(Date.parse(v.at))) L.at = iso(Date.parse(v.at));
      o.lessons[k] = L;
    }
  if (isLesson(p.last)) o.last = p.last;
  if (Array.isArray(p.days)) o.days = [...new Set(p.days.filter(ymd))].sort().slice(-1000);
  if (Number.isFinite(p.xp)) o.xp = clamp(Math.round(p.xp), 0, 1e6);
  if (Array.isArray(p.badges)) o.badges = [...new Set(p.badges.map((b) => S(b, 30)).filter(Boolean))].slice(0, 60);
  return o;
}
/** Deux appareils, une progression : on garde le meilleur de chacun. */
function mergeProgress(a, b) {
  const o = {
    lessons: { ...a.lessons },
    last: b.last || a.last,
    days: [...new Set([...a.days, ...b.days])].sort().slice(-1000),
    xp: Math.max(a.xp, b.xp),
    badges: [...new Set([...a.badges, ...b.badges])].slice(0, 60),
  };
  for (const [k, v] of Object.entries(b.lessons)) {
    const x = o.lessons[k] || {};
    const m = { ...x, ...v };
    if (x.done || v.done) m.done = true;
    if (x.todoDone || v.todoDone) m.todoDone = true;
    if (x.watched || v.watched) m.watched = Math.max(x.watched || 0, v.watched || 0);
    if (x.quiz != null || v.quiz != null) m.quiz = Math.max(x.quiz ?? 0, v.quiz ?? 0);
    if (x.at && v.at) m.at = x.at < v.at ? x.at : v.at;
    o.lessons[k] = m;
  }
  return o;
}
const emptyProgress = () => ({ lessons: {}, last: null, days: [], xp: 0, badges: [] });

/* ------------------------------------------------------------------ */
/* L'objet                                                             */
/* ------------------------------------------------------------------ */

export class Plateforme {
  /**
   * store : { sql: { exec(requête, ...valeurs) → { toArray() } }, transactionSync(fn) }
   * options : base (« /hooked-academy » ou « » à la racine d'un domaine), origins (autres pages autorisées),
   *           setupHash (empreinte du code d'installation), ip(req) (adresse du visiteur, donnée par l'hébergeur)
   */
  constructor(store, { base = '', origins = [], setupHash = SETUP, ip = () => '' } = {}) {
    this.store = store;
    this.sql = store.sql;
    this.P = base.replace(/\/$/, '');
    this.origins = origins;
    this.setupHash = setupHash;
    this.ipOf = ip;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL, at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (h TEXT PRIMARY KEY, role TEXT NOT NULL, sub TEXT NOT NULL, exp INTEGER NOT NULL, at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS apps (id TEXT PRIMARY KEY, at INTEGER NOT NULL, v TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, email TEXT, phone TEXT, code TEXT, at INTEGER NOT NULL, v TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS students_email ON students (email);
      CREATE INDEX IF NOT EXISTS students_phone ON students (phone);
      CREATE TABLE IF NOT EXISTS docs (kind TEXT NOT NULL, id TEXT NOT NULL, lang TEXT NOT NULL, v TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (kind, id, lang));
      CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, size INTEGER NOT NULL, scope TEXT NOT NULL, n INTEGER NOT NULL, at INTEGER NOT NULL, lesson TEXT);
      CREATE TABLE IF NOT EXISTS chunks (id TEXT NOT NULL, i INTEGER NOT NULL, b BLOB NOT NULL, PRIMARY KEY (id, i));
      CREATE TABLE IF NOT EXISTS hits (k TEXT PRIMARY KEY, n INTEGER NOT NULL, until INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS audit (at INTEGER NOT NULL, who TEXT NOT NULL, act TEXT NOT NULL, info TEXT);
    `);
  }
  cookie(role, value, maxAge) {
    const path = role === 'device' ? `${this.P}/api/admin/` : `${this.P}/`;
    return `${COOKIE[role]}=${value}; Path=${path}; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(maxAge / 1000)}`;
  }
  get setupOk() {
    const ad = this.kv('admin');
    return !!ad && ad.setup === this.setupHash;
  }

  /* --------------------------- stockage ---------------------------- */

  kv(k, fallback = null) {
    const r = this.sql.exec('SELECT v FROM kv WHERE k = ?', k).toArray()[0];
    if (!r) return fallback;
    try {
      return JSON.parse(r.v);
    } catch {
      return fallback;
    }
  }
  setKv(k, v) {
    this.sql.exec('INSERT INTO kv (k, v, at) VALUES (?, ?, ?) ON CONFLICT (k) DO UPDATE SET v = excluded.v, at = excluded.at', k, JSON.stringify(v), Date.now());
  }
  /** Contenu public modifié : nouvelle révision (les navigateurs rechargent /api/public). */
  bump() {
    this.setKv('rev', (this.kv('rev', 0) || 0) + 1);
  }
  docs(kind) {
    return this.sql.exec('SELECT id, lang, v FROM docs WHERE kind = ?', kind).toArray();
  }
  setDoc(kind, id, lang, v) {
    if (v == null) this.sql.exec('DELETE FROM docs WHERE kind = ? AND id = ? AND lang = ?', kind, id, lang);
    else this.sql.exec('INSERT INTO docs (kind, id, lang, v, at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (kind, id, lang) DO UPDATE SET v = excluded.v, at = excluded.at', kind, id, lang, JSON.stringify(v), Date.now());
  }
  log(act, info = '', who = 'équipe') {
    this.sql.exec('INSERT INTO audit (at, who, act, info) VALUES (?, ?, ?, ?)', Date.now(), who, act, String(info).slice(0, 300));
  }

  async key() {
    if (!this._key) {
      let s = this.kv('secret');
      if (!s) {
        s = hex(rand(32));
        this.setKv('secret', s);
      }
      this._key = await crypto.subtle.importKey('raw', unhex(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    }
    return this._key;
  }
  async mac(msg) {
    return hex(await crypto.subtle.sign('HMAC', await this.key(), enc.encode(msg)));
  }

  /* --------------------------- limites ----------------------------- */

  /**
   * Compte un essai AVANT toute vérification (synchrone : deux requêtes simultanées ne passent pas toutes les deux) ;
   * faux si la limite est dépassée sur la fenêtre. Un essai réussi est rendu avec give().
   */
  take(k, max, win) {
    const now = Date.now();
    const r = this.sql.exec('SELECT n, until FROM hits WHERE k = ?', k).toArray()[0];
    const live = r && r.until > now;
    const n = live ? r.n + 1 : 1;
    this.sql.exec('INSERT INTO hits (k, n, until) VALUES (?, ?, ?) ON CONFLICT (k) DO UPDATE SET n = excluded.n, until = excluded.until', k, n, live ? r.until : now + win);
    if (Math.random() < 0.02) this.sql.exec('DELETE FROM hits WHERE until < ?', now);
    return n <= max;
  }
  give(k) {
    this.sql.exec('UPDATE hits SET n = MAX(0, n - 1) WHERE k = ?', k);
  }
  /** Essais en cours sur une clé (sans compter). */
  peek(k) {
    const r = this.sql.exec('SELECT n, until FROM hits WHERE k = ?', k).toArray()[0];
    return r && r.until > Date.now() ? r.n : 0;
  }
  ipKey(req) {
    return fnv(`ip:${netOf(this.ipOf(req))}`);
  }

  /* --------------------------- sessions ---------------------------- */

  async session(req, role) {
    const tok = cookieOf(req)[COOKIE[role]];
    if (!tok || !/^[A-Za-z0-9_-]{43}$/.test(tok)) return null;
    const h = await sha(tok);
    const r = this.sql.exec('SELECT role, sub, exp FROM sessions WHERE h = ?', h).toArray()[0];
    if (!r || r.role !== role || r.exp < Date.now()) return null;
    return { h, sub: r.sub, exp: r.exp };
  }
  async openSession(role, sub) {
    const tok = b64u(rand(32));
    const ttl = role === 'admin' ? ADMIN_TTL : STUDENT_TTL;
    const now = Date.now();
    this.sql.exec('DELETE FROM sessions WHERE exp < ?', now);
    this.sql.exec('INSERT INTO sessions (h, role, sub, exp, at) VALUES (?, ?, ?, ?, ?)', await sha(tok), role, sub, now + ttl, now);
    return this.cookie(role, tok, ttl);
  }
  async needAdmin(req) {
    const s = await this.session(req, 'admin');
    if (!s || !this.setupOk) fail(401, 'auth');
    return s;
  }
  /** Appareil de l'équipe déjà connecté une fois : il ne subit pas le blocage global des connexions. */
  async knownDevice(req) {
    const tok = cookieOf(req)[COOKIE.device];
    if (!tok || !/^[A-Za-z0-9_-]{43}$/.test(tok)) return false;
    const h = await sha(`dev:${tok}`);
    return this.kv('devices', []).some((d) => same(d.h, h) && d.exp > Date.now());
  }
  async addDevice() {
    const tok = b64u(rand(32));
    const now = Date.now();
    const list = this.kv('devices', []).filter((d) => d.exp > now).slice(-19);
    list.push({ h: await sha(`dev:${tok}`), exp: now + DEVICE_TTL });
    this.setKv('devices', list);
    return this.cookie('device', tok, DEVICE_TTL);
  }
  /** Ferme toutes les portes du compte de l'équipe (nouveau mot de passe, nouvelle installation). */
  closeTeam(keepH = '') {
    this.sql.exec("DELETE FROM sessions WHERE (role = 'admin' AND h != ?) OR (role = 'student' AND sub = ?)", keepH, TRAINER.id);
    this.setKv('devices', []);
  }

  /* --------------------------- étudiants --------------------------- */

  student(id) {
    if (id === TRAINER.id) return { ...TRAINER, email: '', phone: '', progress: this.kv('trainer:progress', emptyProgress()) };
    const r = this.sql.exec('SELECT v FROM students WHERE id = ?', id).toArray()[0];
    return r ? JSON.parse(r.v) : null;
  }
  saveStudent(st, codeHash) {
    if (st.id === TRAINER.id) return this.setKv('trainer:progress', st.progress);
    const v = JSON.stringify(st);
    if (codeHash !== undefined)
      this.sql.exec(
        'INSERT INTO students (id, email, phone, code, at, v) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET email = excluded.email, phone = excluded.phone, code = excluded.code, v = excluded.v',
        st.id,
        st.email || null,
        st.phone || null,
        codeHash,
        Date.parse(st.createdAt) || Date.now(),
        v,
      );
    else this.sql.exec('UPDATE students SET email = ?, phone = ?, v = ? WHERE id = ?', st.email || null, st.phone || null, v, st.id);
  }
  /** Accès en cours d'un étudiant (formations ouvertes, non expiré, actif). */
  tracksOf(st) {
    if (!st || !st.active) return [];
    if (st.protected) return TRACKS;
    if (st.expiresAt && Date.now() > Date.parse(st.expiresAt)) return [];
    return (st.access || []).filter((x) => TRACKS.includes(x));
  }
  /** Ce que reçoit l'étudiant connecté : son profil, la FAQ pro, les ressources de ses formations. */
  member(st) {
    const tracks = this.tracksOf(st);
    const open = (id) => FREE_OPEN.includes(id) || tracks.includes(trackOfLesson(id));
    const res = {};
    for (const r of this.docs('res')) if (open(r.id)) res[r.id] = JSON.parse(r.v);
    const faq = this.kv('faq');
    // Accès terminé ou sans formation : plus de questions pro
    return { student: st, faq: tracks.length && Array.isArray(faq) ? faq.filter((x) => x.aud !== 'public') : null, res };
  }
  /** Session étudiante en cours et ses formations ouvertes (null : pas de session valable). */
  async studentAccess(req) {
    const s = await this.session(req, 'student');
    const st = s && this.student(s.sub);
    return st && st.active ? this.tracksOf(st) : null;
  }
  /**
   * Une leçon peut-elle être écoutée ? Bienvenue et leçons de démo : tout le monde ; sinon l'équipe,
   * ou un étudiant qui a la formation. Sert à protéger les voix off des leçons payantes (fichiers du site).
   */
  async lessonAllowed(req, lessonId) {
    if (FREE_OPEN.includes(lessonId) || DEMO_OPEN.includes(lessonId)) return true;
    if (await this.session(req, 'admin')) return true;
    return !!(await this.studentAccess(req))?.includes(trackOfLesson(lessonId));
  }

  /* --------------------------- fichiers ---------------------------- */

  fileRow(id) {
    return isFileId(id) ? this.sql.exec('SELECT id, name, type, size, scope, n, at, lesson FROM files WHERE id = ?', id).toArray()[0] || null : null;
  }
  fileUrl(f) {
    const ext = (f.name.match(/\.([a-z0-9]{1,5})$/i)?.[1] || 'bin').toLowerCase();
    return `media/${f.id}.${ext}`;
  }

  /* --------------------------- contenu public ---------------------- */

  publicData() {
    const edits = { lessons: {}, modules: {} };
    for (const r of this.docs('lesson')) (edits.lessons[r.id] ||= {})[r.lang] = JSON.parse(r.v);
    for (const r of this.docs('module')) (edits.modules[r.id] ||= {})[r.lang] = JSON.parse(r.v);
    const voix = {};
    for (const r of this.docs('voix')) {
      const v = JSON.parse(r.v);
      const f = this.fileRow(v.file);
      if (f) voix[r.id] = { audio: this.fileUrl(f), d: v.d, at: v.at };
    }
    const faq = this.kv('faq');
    const s = { ...DEFAULTS, ...this.kv('settings', {}) };
    return {
      rev: this.kv('rev', 0),
      settings: { whatsapp: s.whatsapp, cohort: s.cohort, ...(s.offres ? { offres: s.offres } : {}) },
      edits,
      voix,
      faq: Array.isArray(faq) ? faq.filter((x) => x.aud !== 'pro') : null,
    };
  }

  /* --------------------------- routeur ----------------------------- */

  async fetch(req) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin');
    const cors = origin && origin !== url.origin && this.origins.includes(origin);
    if (req.method === 'OPTIONS') {
      if (!cors) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE',
          'access-control-allow-headers': 'content-type, x-ha',
          'access-control-max-age': '600',
          vary: 'Origin',
        },
      });
    }
    let res;
    try {
      res = await this.route(req, url);
    } catch (e) {
      if (e instanceof Http) res = json({ error: e.code, ...e.extra }, e.status, e.status === 429 ? { 'retry-after': '900' } : {});
      else {
        console.error(e);
        res = json({ error: 'server' }, 500);
      }
    }
    if (!cors) return res;
    const h = new Headers(res.headers);
    h.set('access-control-allow-origin', origin);
    h.set('access-control-allow-credentials', 'true');
    h.set('access-control-expose-headers', 'content-range, content-length, etag');
    h.append('vary', 'Origin');
    return new Response(res.body, { status: res.status, headers: h });
  }

  async route(req, url) {
    if (!url.pathname.startsWith(`${this.P}/`)) fail(404, 'not_found');
    const path = url.pathname.slice(this.P.length);
    const M = req.method;
    if (path.startsWith('/media/')) {
      if (M !== 'GET' && M !== 'HEAD') fail(405, 'method');
      return this.media(req, path);
    }
    // Écritures : uniquement depuis les pages du site (en-tête maison + origine)
    if (M !== 'GET' && M !== 'HEAD') {
      if (req.headers.get('x-ha') !== '1') fail(403, 'csrf');
      const o = req.headers.get('origin');
      if (o && o !== url.origin && !this.origins.includes(o)) fail(403, 'origin');
      if (req.headers.get('sec-fetch-site') === 'cross-site') fail(403, 'origin');
    }
    let seg;
    try {
      seg = path.split('/').filter(Boolean).map(decodeURIComponent); // ['api', ...]
    } catch {
      fail(400, 'path');
    }
    if (seg[0] !== 'api') fail(404, 'not_found');
    const [, a, b, c, d] = seg;
    const is = (m, ...parts) => M === m && parts.every((p, i) => p === undefined || p === seg[i + 1]) && seg.length === parts.length + 1;

    // Public
    if (is('GET', 'health')) {
      return json({ ok: true, setup: !this.setupOk });
    }
    if (is('GET', 'public')) {
      const rev = this.kv('rev', 0);
      const etag = `W/"r${rev}"`;
      const h = { etag, 'cache-control': 'no-cache' };
      if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: h });
      return json(this.publicData(), 200, h);
    }
    if (is('POST', 'apply')) return this.apply(req);
    if (is('POST', 'salt')) return this.salt(req);
    if (is('POST', 'login')) return this.loginStudent(req);
    if (is('POST', 'logout')) return this.logout(req, 'student');
    if (is('GET', 'me')) {
      const s = await this.session(req, 'student');
      const st = s && this.student(s.sub);
      if (!st) fail(401, 'auth');
      if (!st.active) {
        this.sql.exec('DELETE FROM sessions WHERE h = ?', s.h);
        fail(403, 'suspended');
      }
      return json(this.member(st));
    }
    if (is('PUT', 'me', 'progress')) {
      const s = await this.session(req, 'student');
      const st = s && this.student(s.sub);
      if (!st) fail(401, 'auth');
      const body = await readJSON(req, 160 * 1024);
      st.progress = mergeProgress(cleanProgress(st.progress), cleanProgress(body.progress));
      this.saveStudent(st);
      return json({ progress: st.progress });
    }

    // Espace équipe
    if (a !== 'admin') fail(404, 'not_found');
    if (is('POST', 'admin', 'setup')) return this.setup(req);
    if (is('POST', 'admin', 'login')) return this.loginAdmin(req);
    if (is('POST', 'admin', 'logout')) return this.logout(req, 'admin');
    if (is('PUT', 'admin', 'faq')) return this.putFaq(req);
    await this.needAdmin(req);
    if (is('GET', 'admin', 'me')) return json({ ok: true });
    if (is('POST', 'admin', 'password')) return this.password(req);
    if (is('GET', 'admin', 'state')) return json(this.state());
    if (is('GET', 'admin', 'export')) return json({ exported: iso(), ...this.state(true) }, 200, { 'content-disposition': 'attachment; filename="hooked-academy-export.json"' });
    if (is('PUT', 'admin', 'settings')) return this.putSettings(req);
    // Inscriptions
    if (M === 'PATCH' && b === 'apps' && c && !d) return this.patchApp(req, c);
    if (M === 'POST' && b === 'apps' && c && d === 'validate') return this.validate(req, c);
    if (M === 'DELETE' && b === 'apps' && c && !d) return this.deleteApp(c);
    // Étudiants
    if (is('POST', 'admin', 'students')) return this.addStudent(req);
    if (M === 'PATCH' && b === 'students' && c && !d) return this.patchStudent(req, c);
    if (M === 'POST' && b === 'students' && c && d === 'code') return this.newCode(c);
    if (M === 'DELETE' && b === 'students' && c && !d) return this.deleteStudent(c);
    // Contenus modifiés (leçons, modules), une langue à la fois
    if ((M === 'PUT' || M === 'DELETE') && b === 'edit' && (c === 'lesson' || c === 'module') && d && seg[5] && seg.length === 6) return this.edit(req, c, d, seg[5]);
    // Fichiers, ressources, voix off
    if (is('POST', 'admin', 'files')) return this.upload(req, url);
    if (M === 'DELETE' && b === 'files' && c && !d) return this.deleteFile(c);
    if ((M === 'PUT' || M === 'DELETE') && b === 'res' && c && !d) return this.putRes(req, c);
    if ((M === 'PUT' || M === 'DELETE') && b === 'voix' && c && !d) return this.putVoix(req, c);
    fail(404, 'not_found');
  }

  /* --------------------------- inscriptions ------------------------ */

  async apply(req) {
    const ipk = this.ipKey(req);
    if (!this.take(`apply:${ipk}`, 6, 3600e3)) fail(429, 'rate');
    // Plafond du jour : seules les inscriptions valables comptent (des envois ratés ne bloquent personne)
    if (this.peek('apply:all') >= 1500) fail(429, 'rate');
    const v = await readJSON(req, 16 * 1024);
    // Champ piège invisible : un robot le remplit, on fait semblant d'accepter
    if (S(v.website, 200)) return json({ ok: true, id: rid('ins-', 12) });
    const name = S(v.name, 80);
    const phone = S(v.phone, 30);
    if (name.length < 2 || !normPhone(phone)) fail(400, 'fields');
    const app = {
      id: rid('ins-', 12),
      createdAt: iso(),
      name,
      phone,
      email: normEmail(v.email),
      city: S(v.city, 60),
      profil: PROFILS.includes(v.profil) ? v.profil : 'debutant',
      formation: PACKS.includes(v.formation) ? v.formation : 'both',
      lang: LANGS.includes(v.lang) ? v.lang : 'fr',
      niveau: S(v.niveau, 200),
      objectif: S(v.objectif, 500),
      source: S(v.source, 40) || 'Landing',
      status: 'nouvelle',
      notes: [],
      history: [{ at: iso(), status: 'nouvelle', by: 'Formulaire' }],
    };
    this.sql.exec('INSERT INTO apps (id, at, v) VALUES (?, ?, ?)', app.id, Date.now(), JSON.stringify(app));
    this.take('apply:all', 1500, 864e5);
    return json({ ok: true, id: app.id });
  }
  app(id) {
    const r = this.sql.exec('SELECT v FROM apps WHERE id = ?', String(id)).toArray()[0];
    return r ? JSON.parse(r.v) : null;
  }
  saveApp(a) {
    this.sql.exec('UPDATE apps SET v = ? WHERE id = ?', JSON.stringify(a), a.id);
  }
  async patchApp(req, id) {
    const a = this.app(id);
    if (!a) fail(404, 'not_found');
    const v = await readJSON(req);
    if (v.status !== undefined) {
      if (!STATUS.includes(v.status) || v.status === 'validee') fail(400, 'status');
      if (v.status !== a.status) a.history.push({ at: iso(), status: v.status, by: S(v.by, 40) || 'Équipe' });
      a.status = v.status;
    }
    const note = S(v.note, 1000);
    if (note) a.notes.push({ at: iso(), by: 'Équipe', text: note });
    this.saveApp(a);
    this.log('inscription', `${a.id} ${a.status}${note ? ' + note' : ''}`);
    return json({ app: a });
  }
  /**
   * Valide une inscription. Si un étudiant existe déjà avec le même e-mail ou téléphone, rien n'est fusionné
   * en silence (l'e-mail d'une inscription n'est pas vérifié : n'importe qui peut saisir celui d'un autre) :
   * le serveur renvoie 409 avec l'étudiant trouvé, et l'équipe choisit. « renew » = prolonger CE compte :
   * formations ajoutées, un an de plus, son code ne change pas et rien n'est envoyé au nouveau numéro.
   */
  async validate(req, id) {
    const a = this.app(id);
    if (!a) fail(404, 'not_found');
    const v = (req.headers.get('content-type') || '').startsWith('application/json') ? await readJSON(req, 4096) : {};
    const email = normEmail(a.email);
    const phone = normPhone(a.phone);
    let row = this.sql.exec('SELECT id FROM students WHERE id = ?', a.studentId || '').toArray()[0];
    if (!row && email) row = this.sql.exec('SELECT id FROM students WHERE email = ?', email).toArray()[0];
    if (!row && phone) row = this.sql.exec('SELECT id FROM students WHERE phone = ?', phone).toArray()[0];
    const tracks = a.formation === 'creative' ? ['creative'] : a.formation === 'ia' ? ['ia'] : TRACKS;
    const settings = this.kv('settings', {});
    const done = (st, code) => {
      if (a.status !== 'validee') a.history.push({ at: iso(), status: 'validee', by: 'Équipe' });
      a.status = 'validee';
      a.studentId = st.id;
      this.saveApp(a);
      return json({ app: a, student: st, code, renewed: !code });
    };
    if (row) {
      const st = this.student(row.id);
      if (v.renew !== st.id) fail(409, 'exists', { student: { id: st.id, name: st.name, email: st.email, phone: st.phone, access: st.access, expiresAt: st.expiresAt, active: st.active } });
      st.active = true;
      st.access = TRACKS.filter((x) => (st.access || []).includes(x) || tracks.includes(x));
      st.expiresAt = iso(Math.max(Date.now(), Date.parse(st.expiresAt || 0) || 0) + YEAR);
      this.saveStudent(st);
      this.log('réinscription', `${a.id} → ${st.id}`);
      return done(st, null);
    }
    const st = {
      id: rid('st-', 12),
      appId: a.id,
      name: a.name,
      firstName: a.name.split(/\s+/)[0] || 'Créateur',
      email,
      phone,
      createdAt: iso(),
      active: true,
      cohort: S(settings.cohort, 80) || DEFAULTS.cohort,
      access: tracks,
      expiresAt: iso(Date.now() + YEAR),
      progress: emptyProgress(),
    };
    const code = accessCode();
    this.saveStudent(st, await this.mac(`code:${code}`));
    this.log('validation', `${a.id} → ${st.id}`);
    return done(st, code);
  }
  deleteApp(id) {
    if (!this.app(id)) fail(404, 'not_found');
    this.sql.exec('DELETE FROM apps WHERE id = ?', id);
    this.log('inscription supprimée', id);
    return json({ ok: true });
  }

  /* --------------------------- comptes étudiants ------------------- */

  async addStudent(req) {
    const v = await readJSON(req);
    const name = S(v.name, 80);
    const email = normEmail(v.email);
    const phone = normPhone(v.phone);
    if (name.length < 2 || (!email && !phone)) fail(400, 'fields');
    if (email && this.sql.exec('SELECT id FROM students WHERE email = ?', email).toArray().length) fail(409, 'exists');
    if (phone && this.sql.exec('SELECT id FROM students WHERE phone = ?', phone).toArray().length) fail(409, 'exists');
    const s = this.kv('settings', {});
    const tracks = v.formation === 'creative' ? ['creative'] : v.formation === 'ia' ? ['ia'] : TRACKS;
    const st = {
      id: rid('st-', 12),
      appId: null,
      name,
      firstName: S(v.firstName, 40) || name.split(/\s+/)[0],
      email,
      phone,
      createdAt: iso(),
      active: true,
      cohort: S(s.cohort, 80) || DEFAULTS.cohort,
      access: tracks,
      expiresAt: iso(Date.now() + YEAR),
      progress: emptyProgress(),
    };
    const code = accessCode();
    this.saveStudent(st, await this.mac(`code:${code}`));
    this.log('étudiant ajouté', st.id);
    return json({ student: st, code });
  }
  async patchStudent(req, id) {
    const st = id === TRAINER.id ? null : this.student(id);
    if (!st) fail(404, 'not_found');
    const v = await readJSON(req);
    if (typeof v.active === 'boolean') st.active = v.active;
    if (Array.isArray(v.access)) st.access = TRACKS.filter((x) => v.access.includes(x));
    if (v.expiresAt !== undefined) {
      const day = ymd(v.expiresAt);
      if (!day) fail(400, 'date');
      st.expiresAt = new Date(`${day}T23:59:59Z`).toISOString();
    }
    if (typeof v.name === 'string' && S(v.name, 80).length >= 2) st.name = S(v.name, 80);
    if (typeof v.firstName === 'string' && S(v.firstName, 40)) st.firstName = S(v.firstName, 40);
    if (typeof v.cohort === 'string') st.cohort = S(v.cohort, 80);
    if (v.email !== undefined) st.email = normEmail(v.email);
    if (v.phone !== undefined) st.phone = normPhone(v.phone);
    this.saveStudent(st);
    // Accès coupé : les sessions ouvertes tombent tout de suite
    if (!st.active) this.sql.exec("DELETE FROM sessions WHERE role = 'student' AND sub = ?", st.id);
    this.log('étudiant modifié', st.id);
    return json({ student: st });
  }
  async newCode(id) {
    const st = id === TRAINER.id ? null : this.student(id);
    if (!st) fail(404, 'not_found');
    const code = accessCode();
    this.sql.exec('UPDATE students SET code = ? WHERE id = ?', await this.mac(`code:${code}`), id);
    // Quelqu'un qui aurait volé l'ancien code est déconnecté tout de suite
    this.sql.exec("DELETE FROM sessions WHERE role = 'student' AND sub = ?", id);
    this.log('nouveau code', id);
    return json({ student: st, code });
  }
  deleteStudent(id) {
    if (id === TRAINER.id || !this.student(id)) fail(404, 'not_found');
    this.sql.exec('DELETE FROM students WHERE id = ?', id);
    this.sql.exec("DELETE FROM sessions WHERE role = 'student' AND sub = ?", id);
    this.log('étudiant supprimé', id);
    return json({ ok: true });
  }

  /* --------------------------- connexions -------------------------- */

  /** Sel du compte de l'équipe. Pour un identifiant inconnu : un faux sel stable (on ne révèle pas qui existe). */
  async salt(req) {
    if (!this.take(`salt:${this.ipKey(req)}`, 60, 900e3)) fail(429, 'rate');
    const v = await readJSON(req, 4096);
    const ad = this.kv('admin');
    if (!this.setupOk) return json({ setup: true });
    const id = S(v.ident, 120).toLowerCase();
    const real = same(await this.mac(`ident:${id}`), ad.ident);
    return json({ salt: real ? ad.salt : (await this.mac(`salt:${id}`)).slice(0, 32), iter: ITER });
  }
  /** Vérifie identifiant + preuve (mot de passe dérivé) de l'équipe. */
  async checkAdmin(ident, proof) {
    const ad = this.kv('admin');
    if (!this.setupOk || typeof proof !== 'string' || !/^[0-9a-f]{64}$/.test(proof)) return false;
    const okId = same(await this.mac(`ident:${S(ident, 120).toLowerCase()}`), ad.ident);
    const okPw = same(await this.mac(`pw:${proof}`), ad.ver);
    return okId && okPw;
  }
  async loginAdmin(req) {
    const ipk = this.ipKey(req);
    const ipFails = this.peek(`af:${ipk}`);
    // Compté avant toute vérification, rendu si la connexion réussit
    if (!this.take(`af:${ipk}`, 10, 900e3)) fail(429, 'rate');
    // Frein global (attaque répartie sur beaucoup d'adresses) : jamais pour un appareil de l'équipe,
    // ni pour une adresse qui n'a encore rien raté
    if (ipFails > 0 && this.peek('af:all') >= 100 && !(await this.knownDevice(req))) fail(429, 'rate');
    const v = await readJSON(req, 4096);
    if (!(await this.checkAdmin(v.ident, v.proof))) {
      this.take('af:all', 1e9, 3600e3);
      this.log('connexion refusée', `réseau ${ipk}`, 'inconnu');
      fail(401, 'bad');
    }
    this.give(`af:${ipk}`);
    this.log('connexion', `réseau ${ipk}`);
    this.sql.exec('DELETE FROM audit WHERE rowid NOT IN (SELECT rowid FROM audit ORDER BY at DESC LIMIT 2000)');
    return json({ ok: true }, 200, { 'set-cookie': [await this.openSession('admin', 'admin'), await this.addDevice()] });
  }
  /** Le code d'installation (création du compte de l'équipe, FAQ initiale) ; compté avant la vérification. */
  async setupCode(req, code) {
    const ipk = this.ipKey(req);
    const ipFails = this.peek(`setup:${ipk}`);
    if (!this.take(`setup:${ipk}`, 8, 3600e3)) fail(429, 'rate');
    if (ipFails > 0 && this.peek('setup:all') >= 200) fail(429, 'rate');
    const ok = same(await sha(String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '')), this.setupHash);
    if (!ok) {
      this.take('setup:all', 1e9, 3600e3);
      this.log('code d’installation refusé', `réseau ${ipk}`, 'inconnu');
    }
    return ok;
  }
  async setup(req) {
    if (this.setupOk) fail(409, 'done');
    const v = await readJSON(req, 4096);
    if (!(await this.setupCode(req, v.code))) fail(401, 'bad_code');
    if (this.setupOk) fail(409, 'done');
    const ident = S(v.ident, 120).toLowerCase();
    if (ident.length < 3 || !/^[0-9a-f]{32}$/.test(v.salt || '') || !/^[0-9a-f]{64}$/.test(v.proof || '')) fail(400, 'fields');
    this.setKv('admin', { ident: await this.mac(`ident:${ident}`), salt: v.salt, ver: await this.mac(`pw:${v.proof}`), setup: this.setupHash, at: iso() });
    this.closeTeam();
    this.log('compte équipe créé', `réseau ${this.ipKey(req)}`);
    return json({ ok: true }, 200, { 'set-cookie': [await this.openSession('admin', 'admin'), await this.addDevice()] });
  }
  async password(req) {
    const ipk = this.ipKey(req);
    if (!this.take(`af:${ipk}`, 10, 900e3)) fail(429, 'rate');
    const v = await readJSON(req, 4096);
    const ad = this.kv('admin');
    if (!(await this.checkAdmin(v.ident, v.proof))) fail(401, 'bad');
    this.give(`af:${ipk}`);
    const ident = S(v.newIdent || v.ident, 120).toLowerCase();
    if (ident.length < 3 || !/^[0-9a-f]{32}$/.test(v.salt || '') || !/^[0-9a-f]{64}$/.test(v.newProof || '')) fail(400, 'fields');
    this.setKv('admin', { ...ad, ident: await this.mac(`ident:${ident}`), salt: v.salt, ver: await this.mac(`pw:${v.newProof}`), at: iso() });
    // Toutes les autres portes se ferment : sessions de l'équipe, du formateur dans l'espace étudiant, appareils
    const cur = await this.session(req, 'admin');
    this.closeTeam(cur?.h || '');
    this.log('mot de passe changé');
    return json({ ok: true }, 200, { 'set-cookie': await this.addDevice() });
  }
  async loginStudent(req) {
    const ipk = this.ipKey(req);
    if (!this.take(`lf:${ipk}`, 12, 900e3)) fail(429, 'rate');
    const v = await readJSON(req, 4096);
    const ident = S(v.ident, 120);
    const email = normEmail(ident);
    const phone = email ? '' : normPhone(ident);
    // Même identifiant sous toutes ses écritures (+213…, 00213…, 0…, espaces) : une seule limite
    const idk = `lfid:${fnv(email || phone || ident.toLowerCase().replace(/\s+/g, ''))}`;
    if (!this.take(idk, 15, 3600e3)) fail(429, 'rate');
    let st = null;
    if (v.proof) {
      // Le formateur entre dans l'espace étudiant avec le compte de l'équipe
      if (!(await this.checkAdmin(ident, v.proof))) fail(401, 'bad');
      st = this.student(TRAINER.id);
    } else {
      const code = normCode(v.code);
      if (!code || (!email && !phone)) fail(401, 'bad');
      const h = await this.mac(`code:${code}`);
      const rows = this.sql.exec('SELECT id, code FROM students WHERE ' + (email ? 'email = ?' : 'phone = ?'), email || phone).toArray();
      const row = rows.find((r) => same(r.code || '', h));
      if (!row) fail(401, 'bad');
      st = this.student(row.id);
    }
    if (!st.active) fail(403, 'suspended');
    // Réussi : cet essai est rendu (les échecs précédents, eux, restent comptés)
    this.give(`lf:${ipk}`);
    this.give(idk);
    return json(this.member(st), 200, { 'set-cookie': await this.openSession('student', st.id) });
  }
  async logout(req, role) {
    const s = await this.session(req, role);
    if (s) this.sql.exec('DELETE FROM sessions WHERE h = ?', s.h);
    return json({ ok: true }, 200, { 'set-cookie': this.cookie(role, '', 0) });
  }

  /* --------------------------- espace équipe ----------------------- */

  state(full = false) {
    const apps = this.sql.exec('SELECT v FROM apps ORDER BY at DESC LIMIT 5000').toArray().map((r) => JSON.parse(r.v));
    const students = this.sql.exec('SELECT v FROM students ORDER BY at DESC LIMIT 5000').toArray().map((r) => JSON.parse(r.v));
    students.unshift(this.student(TRAINER.id));
    const res = {};
    for (const r of this.docs('res')) res[r.id] = JSON.parse(r.v);
    const files = this.sql.exec('SELECT id, name, type, size, scope, at, lesson FROM files ORDER BY at DESC').toArray();
    const audit = this.sql.exec(`SELECT at, who, act, info FROM audit ORDER BY at DESC LIMIT ${full ? 2000 : 60}`).toArray();
    return { ...this.publicData(), settings: { ...DEFAULTS, ...this.kv('settings', {}) }, faqAll: this.kv('faq'), applications: apps, students, res, files, audit };
  }
  async putSettings(req) {
    const v = await readJSON(req);
    const o = { ...this.kv('settings', {}) };
    if (v.whatsapp !== undefined) o.whatsapp = S(String(v.whatsapp), 24).replace(/\D/g, '');
    if (v.cohort !== undefined) o.cohort = S(String(v.cohort), 80);
    if (v.offres && typeof v.offres === 'object') {
      const of = {};
      for (const k of PACKS) {
        const n = Math.round(Number(v.offres[k]));
        if (Number.isFinite(n) && n > 0 && n <= 1e7) of[k] = n;
      }
      o.offres = of;
    }
    this.setKv('settings', o);
    this.bump();
    this.log('réglages');
    return json({ settings: { ...DEFAULTS, ...o } });
  }
  /** FAQ initiale (premier démarrage du serveur). */
  seedFaq(list) {
    const seen = new Set();
    this.setKv('faq', list.map(faqItem).filter((x) => x && !seen.has(x.id) && seen.add(x.id)));
    this.bump();
  }
  async putFaq(req) {
    // L'équipe, ou (avant la création du compte) le code d'installation : sert à déposer la FAQ pro initiale
    const s = await this.session(req, 'admin');
    if (!s || !this.setupOk) {
      if (this.setupOk || !(await this.setupCode(req, req.headers.get('x-ha-setup')))) fail(401, 'auth');
    }
    const v = await readJSON(req, 900 * 1024);
    if (!Array.isArray(v.items) || v.items.length > 400) fail(400, 'items');
    const seen = new Set();
    const items = v.items.map(faqItem).filter((x) => x && !seen.has(x.id) && seen.add(x.id));
    this.setKv('faq', items);
    this.bump();
    this.log('FAQ', `${items.length} questions`);
    return json({ items });
  }
  async edit(req, kind, id, lang) {
    if (!(kind === 'lesson' ? isLesson(id) : isModule(id)) || !LANGS.includes(lang)) fail(400, 'id');
    if (req.method === 'DELETE') {
      this.setDoc(kind, id, lang, null);
      this.bump();
      this.log('contenu rétabli', `${id} ${lang}`);
      return json({ ok: true });
    }
    const v = await readJSON(req, 200 * 1024);
    const patch = kind === 'lesson' ? lessonPatch(v.patch || {}) : modulePatch(v.patch || {});
    this.setDoc(kind, id, lang, Object.keys(patch).length ? patch : null);
    this.bump();
    this.log('contenu modifié', `${id} ${lang}`);
    return json({ patch });
  }

  /* --------------------------- fichiers, ressources, voix ---------- */

  async upload(req, url) {
    const name = S(url.searchParams.get('name') || '', 120).replace(/[\\/:*?"<>|]/g, '_');
    const ext = (name.match(/\.([a-z0-9]{1,5})$/i)?.[1] || '').toLowerCase();
    if (!name || !TYPES[ext]) fail(415, 'type');
    const scope = url.searchParams.get('scope') === 'public' ? 'public' : 'members';
    const lesson = isLesson(url.searchParams.get('lesson')) ? url.searchParams.get('lesson') : null;
    const buf = await readBody(req, MAX_FILE);
    if (!buf.byteLength) fail(400, 'empty');
    const [type, sig] = TYPES[ext];
    // Signature absente ou fausse : le fichier sera seulement téléchargeable, jamais affiché
    const okSig = !sig || sig(buf);
    if (!okSig && INLINE.test(type)) fail(415, 'signature');
    const id = rid('f');
    const n = Math.ceil(buf.byteLength / CHUNK);
    this.store.transactionSync(() => {
      for (let i = 0; i < n; i++) this.sql.exec('INSERT INTO chunks (id, i, b) VALUES (?, ?, ?)', id, i, buf.slice(i * CHUNK, (i + 1) * CHUNK).buffer);
      this.sql.exec('INSERT INTO files (id, name, type, size, scope, n, at, lesson) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', id, name, type, buf.byteLength, scope, n, Date.now(), lesson);
    });
    this.log('fichier déposé', `${name} (${Math.round(buf.byteLength / 1024)} ko)`);
    const f = this.fileRow(id);
    return json({ file: { ...f, url: this.fileUrl(f) } });
  }
  deleteFile(id) {
    const f = this.fileRow(id);
    if (!f) fail(404, 'not_found');
    this.store.transactionSync(() => {
      this.sql.exec('DELETE FROM chunks WHERE id = ?', id);
      this.sql.exec('DELETE FROM files WHERE id = ?', id);
    });
    this.log('fichier supprimé', f.name);
    return json({ ok: true });
  }
  async putRes(req, lesson) {
    if (!isLesson(lesson)) fail(400, 'id');
    if (req.method === 'DELETE') {
      this.setDoc('res', lesson, '', null);
      return json({ items: [] });
    }
    const v = await readJSON(req, 300 * 1024);
    if (!Array.isArray(v.items) || v.items.length > 60) fail(400, 'items');
    const items = [];
    for (const x of v.items) {
      if (!x || typeof x !== 'object') continue;
      const kind = KINDS.includes(x.kind) ? x.kind : 'file';
      const it = { id: S(x.id, 30).replace(/[^\w-]/g, '') || rid('r', 10), kind, title: S(x.title, 200), lang: LANGS.includes(x.lang) ? x.lang : null };
      if (kind === 'prompt') {
        it.text = S(x.text, 8000);
        if (!it.text) continue;
      } else if (kind === 'link') {
        const u = S(x.url, 1000);
        if (!/^https:\/\/[^\s"'<>]+$/i.test(u)) continue;
        it.url = u;
      } else {
        const f = this.fileRow(x.file);
        if (!f) continue;
        Object.assign(it, { file: f.id, name: f.name, size: f.size, type: f.type, url: this.fileUrl(f) });
      }
      if (!it.title) it.title = it.name || kind;
      items.push(it);
    }
    this.setDoc('res', lesson, '', items.length ? items : null);
    this.log('ressources', `${lesson} : ${items.length}`);
    return json({ items });
  }
  async putVoix(req, lesson) {
    if (!isLesson(lesson)) fail(400, 'id');
    if (req.method === 'DELETE') {
      this.setDoc('voix', lesson, '', null);
      this.bump();
      this.log('voix off retirée', lesson);
      return json({ ok: true });
    }
    const v = await readJSON(req, 16 * 1024);
    const f = this.fileRow(v.file);
    if (!f || !f.type.startsWith('audio/')) fail(400, 'file');
    if (!Array.isArray(v.d) || !v.d.length || v.d.length > 40 || !v.d.every((x) => Number.isFinite(x) && x >= 0.5 && x <= 300)) fail(400, 'd');
    // Les voix off de leçon sont publiques, comme les animations
    this.sql.exec("UPDATE files SET scope = 'public', lesson = ? WHERE id = ?", lesson, f.id);
    const doc = { file: f.id, d: v.d.map((x) => Math.round(x * 100) / 100), at: iso() };
    this.setDoc('voix', lesson, '', doc);
    this.bump();
    this.log('voix off publiée', lesson);
    return json({ voix: { ...doc, audio: this.fileUrl(f) } });
  }

  /** Lecture d'un fichier, par morceaux (Range) pour l'audio et la vidéo. */
  async media(req, path) {
    const m = path.match(/^\/media\/(f[a-z2-7]{20})(?:\.[a-z0-9]{1,5})?$/);
    const f = m && this.fileRow(m[1]);
    if (!f) fail(404, 'not_found');
    // Fichier des membres : l'équipe, ou un étudiant dont la formation contient la leçon du fichier
    if (f.scope !== 'public' && !(await this.session(req, 'admin'))) {
      const tracks = await this.studentAccess(req);
      if (!tracks) fail(401, 'auth');
      if (f.lesson ? !(FREE_OPEN.includes(f.lesson) || tracks.includes(trackOfLesson(f.lesson))) : !tracks.length) fail(403, 'forbidden');
    }
    const etag = `"${f.id}"`;
    const inline = INLINE.test(f.type);
    const h = {
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
      'content-type': f.type,
      'accept-ranges': 'bytes',
      etag,
      'cache-control': f.scope === 'public' ? 'public, max-age=31536000, immutable' : 'private, max-age=3600',
      'content-disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(f.name)}`,
      'cross-origin-resource-policy': 'same-site',
    };
    // Affichable dans un cadre seulement par les pages du site (aperçu des PDF et des images)
    const ancestors = `frame-ancestors 'self'${this.origins.map((o) => ` ${o}`).join('')}`;
    // Jamais exécuté comme une page (le lecteur PDF du navigateur ne supporte pas le bac à sable)
    h['content-security-policy'] = f.type === 'application/pdf' ? ancestors : `default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox; ${ancestors}`;
    if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: h });
    let start = 0;
    let end = f.size - 1;
    let status = 200;
    const range = req.headers.get('range');
    if (range) {
      const r = range.match(/^bytes=(\d*)-(\d*)$/);
      if (!r || (!r[1] && !r[2])) return new Response(null, { status: 416, headers: { ...h, 'content-range': `bytes */${f.size}` } });
      if (r[1]) {
        start = Number(r[1]);
        end = r[2] ? Math.min(Number(r[2]), f.size - 1) : f.size - 1;
      } else {
        start = Math.max(0, f.size - Number(r[2]));
      }
      if (start > end || start >= f.size) return new Response(null, { status: 416, headers: { ...h, 'content-range': `bytes */${f.size}` } });
      status = 206;
      h['content-range'] = `bytes ${start}-${end}/${f.size}`;
    }
    h['content-length'] = String(end - start + 1);
    if (req.method === 'HEAD') return new Response(null, { status, headers: h });
    // En flux : un morceau (1 Mo) à la fois, jamais tout le fichier en mémoire
    let i = Math.floor(start / CHUNK);
    const last = Math.floor(end / CHUNK);
    const body = new ReadableStream({
      pull: (ctl) => {
        const r = i <= last && this.sql.exec('SELECT b FROM chunks WHERE id = ? AND i = ?', f.id, i).toArray()[0];
        if (!r) return ctl.close();
        const b = new Uint8Array(r.b);
        const off = i * CHUNK;
        ctl.enqueue(b.slice(Math.max(start - off, 0), Math.min(end - off + 1, b.length)));
        i++;
      },
    });
    return new Response(body, { status, headers: h });
  }
}
