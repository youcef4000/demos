// Algerian Product — données partagées entre le site et l'espace admin.
// Démo sans serveur : contenu publié, brouillon, demandes reçues et statistiques de visite sont
// enregistrés dans ce navigateur (localStorage). En production, ces mêmes fonctions passeraient par
// une API (Worker Cloudflare + base D1 + stockage R2 pour les images, par exemple).

const KEY = 'ap:content:v1';
const DRAFT = 'ap:draft:v1';
const INBOX = 'ap:inbox:v1';
const EVENTS = 'ap:events:v1';
const BASKET = 'ap:basket:v1';
const LANG = 'ap:lang';

const read = (k, store = localStorage) => {
  try {
    const raw = store.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const write = (k, v, store = localStorage) => {
  try {
    store.setItem(k, JSON.stringify(v));
    return true;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

/* Contenu ------------------------------------------------------------- */
export async function loadDefault(base = './') {
  const r = await fetch(`${base}content.json`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`content.json : ${r.status}`);
  return r.json();
}
// { content, source } — 'draft' (aperçu depuis l'admin), 'local' (publié dans ce navigateur) ou 'default'
// Un contenu enregistré avec une version plus ancienne que content.json est ignoré (nouvelle maquette)
export async function loadContent({ base = './', preview = false } = {}) {
  const def = await loadDefault(base);
  const fresh = (c) => c && (c.version || 1) >= (def.version || 1);
  const draft = preview ? read(DRAFT) : null;
  if (fresh(draft)) return { content: draft, source: 'draft' };
  const local = read(KEY);
  if (fresh(local)) return { content: local, source: 'local' };
  return { content: def, source: 'default' };
}
export const isFresh = (c, def) => c && (c.version || 1) >= (def.version || 1);
export const readPublished = () => read(KEY);
export const readDraft = () => read(DRAFT);
export const saveDraft = (c) => write(DRAFT, c);
export const publish = (c) => write(KEY, c) && write(DRAFT, c);
export function resetContent() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(DRAFT);
  } catch {}
}
export function usageKB() {
  let n = 0;
  try {
    for (const k of [KEY, DRAFT, INBOX, EVENTS]) n += (localStorage.getItem(k) || '').length;
  } catch {}
  return Math.round(n / 1024);
}

/* Boîte de réception : devis, candidatures producteurs, messages ------- */
export const readInbox = () => read(INBOX) || [];
export const writeInbox = (list) => write(INBOX, list);
export function addToInbox(item) {
  const list = readInbox();
  const year = new Date().getFullYear();
  const prefix = { quote: 'DV', producer: 'PR', contact: 'MS' }[item.type] || 'AP';
  const count = list.filter((x) => x.type === item.type).length + 1;
  const ref = `${prefix}-${year}-${String(count).padStart(4, '0')}`;
  const entry = { id: uid('in'), ref, at: new Date().toISOString(), status: 'new', notes: '', ...item };
  list.unshift(entry);
  writeInbox(list);
  return entry;
}

/* Liste de devis (panier B2B) ------------------------------------------ */
export const readBasket = () => read(BASKET) || [];
export function toggleBasket(id) {
  const b = readBasket();
  const i = b.indexOf(id);
  if (i >= 0) b.splice(i, 1);
  else b.push(id);
  write(BASKET, b);
  dispatchEvent(new CustomEvent('ap:basket', { detail: b }));
  return b;
}
export function clearBasket() {
  write(BASKET, []);
  dispatchEvent(new CustomEvent('ap:basket', { detail: [] }));
}

/* Langue choisie ------------------------------------------------------- */
export const readLang = () => {
  try {
    return localStorage.getItem(LANG);
  } catch {
    return null;
  }
};
export const saveLang = (code) => {
  try {
    localStorage.setItem(LANG, code);
  } catch {}
};

/* Statistiques de visite ----------------------------------------------- */
// Chaque visite enregistre quelques évènements anonymes (page, langue, provenance, appareil, pays
// déduit du fuseau horaire). L'admin les affiche à côté des statistiques d'exemple.
const SESSION = 'ap:session';
function session() {
  try {
    let s = sessionStorage.getItem(SESSION);
    if (!s) {
      s = uid('s');
      sessionStorage.setItem(SESSION, s);
    }
    return s;
  } catch {
    return 'nosession';
  }
}
export const readEvents = () => read(EVENTS) || [];
export function clearEvents() {
  try {
    localStorage.removeItem(EVENTS);
  } catch {}
}
export function track(type, data = {}) {
  if (/[?&]preview=1/.test(location.search)) return;
  const list = readEvents();
  list.push({ t: Date.now(), s: session(), type, ...data });
  if (list.length > 3000) list.splice(0, list.length - 3000);
  write(EVENTS, list);
}
export function visitContext() {
  const ref = document.referrer || '';
  const q = new URLSearchParams(location.search);
  const utm = (q.get('utm_source') || '').toLowerCase();
  const host = (() => {
    try {
      return ref ? new URL(ref).hostname : '';
    } catch {
      return '';
    }
  })();
  const internal = host && host === location.hostname;
  const src = utm || host;
  let source = 'direct';
  if (/linkedin|lnkd/.test(src)) source = 'linkedin';
  else if (/instagram/.test(src)) source = 'instagram';
  else if (/facebook|fb\./.test(src)) source = 'facebook';
  else if (/whatsapp|wa\.me/.test(src)) source = 'whatsapp';
  else if (/google|bing|duckduckgo|yahoo|qwant|ecosia/.test(src)) source = 'search';
  else if (/mail|newsletter/.test(src)) source = 'email';
  else if (src && !internal) source = 'other';
  const w = Math.min(screen.width, screen.height);
  const device = w < 600 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  return { source: internal ? 'internal' : source, device, country: countryFromTimezone() };
}
// Pays approximatif d'après le fuseau horaire du navigateur (aucune donnée envoyée ailleurs)
const TZ = {
  'Africa/Algiers': 'DZ', 'Europe/Paris': 'FR', 'Europe/Brussels': 'BE', 'Europe/Madrid': 'ES', 'Europe/London': 'GB',
  'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Zurich': 'CH', 'Europe/Istanbul': 'TR',
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Shanghai': 'CN',
  'Africa/Tunis': 'TN', 'Africa/Casablanca': 'MA', 'Africa/Dakar': 'SN', 'Africa/Abidjan': 'CI', 'Africa/Cairo': 'EG',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Toronto': 'CA', 'America/Montreal': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/Regina': 'CA',
};
export function countryFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return TZ[tz] || (tz.startsWith('America/') ? 'US' : tz.startsWith('Europe/') ? 'EU' : '');
  } catch {
    return '';
  }
}

/* Outils --------------------------------------------------------------- */
export const uid = (p = 'x') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Texte saisi dans l'admin -> HTML : *mot* = mot mis en valeur, retour à la ligne = <br>
export const rich = (text) =>
  esc(text)
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
export const plain = (text) => String(text ?? '').replace(/\*/g, '');
