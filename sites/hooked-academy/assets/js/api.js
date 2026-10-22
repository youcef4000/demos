// Hooked Academy — appels au serveur de la plateforme (worker/academy.js, sous /hooked-academy/api/).
// Sans serveur (miroir GitHub Pages, hors ligne), les appels échouent avec ApiError(0, 'network') :
// chaque page garde alors son contenu de base.

// Le serveur répond sur la même adresse quand la page est servie par le Worker Cloudflare. Quand le domaine
// principal est servi par GitHub Pages, il répond sur un sous-domaine Cloudflare du même site (cookies acceptés :
// même site). data/serveur.js essaie ce sous-domaine puis la même adresse, et retient celle qui répond.
export const SITE_ROOT = new URL('../../', import.meta.url);
const API_HOSTS = { 'demos.bornzstudio.com': 'https://api.bornzstudio.com/hooked-academy/' };
export const ALT_ROOT = API_HOSTS[location.hostname] ? new URL(API_HOSTS[location.hostname]) : null;
let ROOT = SITE_ROOT;
export const setRoot = (u) => (ROOT = new URL(u));
const creds = () => (ROOT.origin === location.origin ? 'same-origin' : 'include');
export const apiUrl = (path) => new URL(`api/${path}`, ROOT).href;
/** Adresse d'un fichier du serveur à partir de son chemin publié (« media/f….m4a ») ; une adresse complète reste telle quelle. */
export const siteUrl = (path) => (/^https:\/\//.test(path) ? path : new URL(path, ROOT).href);

export class ApiError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

/** Appel JSON. Les écritures portent l'en-tête x-ha (le serveur refuse les requêtes venues d'autres sites). */
export async function api(method, path, body, { timeout = 20000 } = {}) {
  const headers = {};
  if (method !== 'GET') headers['x-ha'] = '1';
  if (body !== undefined) headers['content-type'] = 'application/json';
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), timeout);
  let r;
  try {
    r = await fetch(apiUrl(path), { method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: creds(), cache: 'no-store', signal: ctl.signal });
  } catch {
    throw new ApiError(0, 'network');
  } finally {
    clearTimeout(tm);
  }
  let data = null;
  try {
    data = await r.json();
  } catch {}
  if (!r.ok) throw new ApiError(r.status, data?.error || (r.status === 404 ? 'no_server' : 'http'));
  return data;
}

/** Envoi d'un fichier (corps brut), avec la progression (0 → 1). */
export function upload(path, blob, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', apiUrl(path));
    x.withCredentials = true;
    x.setRequestHeader('x-ha', '1');
    x.setRequestHeader('content-type', 'application/octet-stream');
    x.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    x.onload = () => {
      let data = null;
      try {
        data = JSON.parse(x.responseText);
      } catch {}
      if (x.status >= 200 && x.status < 300) resolve(data);
      else reject(new ApiError(x.status, data?.error || 'http'));
    };
    x.onerror = () => reject(new ApiError(0, 'network'));
    x.send(blob);
  });
}

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
export const randomSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));

/**
 * Le mot de passe ne quitte jamais le navigateur : on envoie sa dérivation PBKDF2 (SHA-256, sel du compte),
 * que le serveur scelle à son tour avec une clé secrète.
 */
export async function derive(password, saltHex, iter = 310000) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations: iter }, key, 256));
}

/** Connexion avec le compte de l'équipe : sel, dérivation, puis la route demandée (admin/login ou login). */
export async function proofLogin(route, ident, password) {
  const s = await api('POST', 'salt', { ident });
  if (s?.setup) throw new ApiError(409, 'setup');
  const proof = await derive(password, s.salt, s.iter);
  return api('POST', route, { ident, proof });
}
