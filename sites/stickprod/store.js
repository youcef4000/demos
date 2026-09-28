// Contenu du site : content.json par défaut, remplacé par ce que l'espace admin a publié.
// Démo sans serveur : la publication reste dans ce navigateur (localStorage). En production,
// les mêmes fonctions liraient et écriraient le contenu via une API (Worker + KV, par exemple).

const KEY = 'stickprod:content:v1';
const DRAFT = 'stickprod:draft:v1';

const read = (k) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (k, value) => {
  try {
    localStorage.setItem(k, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export async function loadDefault(base = './') {
  const r = await fetch(`${base}content.json`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`content.json : ${r.status}`);
  return r.json();
}

// { content, source } — source vaut 'draft' (aperçu admin), 'local' (publié ici) ou 'default'
export async function loadContent({ base = './', preview = false } = {}) {
  const draft = preview ? read(DRAFT) : null;
  if (draft) return { content: draft, source: 'draft' };
  const local = read(KEY);
  if (local) return { content: local, source: 'local' };
  return { content: await loadDefault(base), source: 'default' };
}

export const readPublished = () => read(KEY);
export const readDraft = () => read(DRAFT);
export const saveDraft = (c) => write(DRAFT, c);
export const publish = (c) => write(KEY, c) && write(DRAFT, c);

export function resetLocal() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(DRAFT);
  } catch {}
}

// Taille approximative occupée (Ko), pour avertir avant d'atteindre le quota du navigateur
export function usageKB() {
  try {
    return Math.round(((localStorage.getItem(KEY) || '').length + (localStorage.getItem(DRAFT) || '').length) / 1024);
  } catch {
    return 0;
  }
}

// Photos Pexels : on demande la largeur utile au CDN plutôt que l'original
export function sized(url, w) {
  if (!url || !/images\.pexels\.com/.test(url)) return url;
  const u = url.replace(/([?&])w=\d+/, `$1w=${w}`);
  return u === url && !/[?&]w=/.test(url) ? `${url}${url.includes('?') ? '&' : '?'}auto=compress&cs=tinysrgb&w=${w}` : u;
}

export function videoEmbed(url) {
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1`;
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1&title=0&byline=0`;
  if (/\.(mp4|webm)(\?|$)/i.test(url)) return url;
  return null;
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
