// Contenu du site : content.json par défaut, remplacé par ce que l'espace admin a publié.
// Démo sans serveur : la publication reste dans ce navigateur (localStorage). En production,
// les mêmes fonctions liraient et écriraient le contenu via une API (Worker + KV, par exemple).

const KEY = 'tlemceni:content:v1';
const DRAFT = 'tlemceni:draft:v1';

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

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Texte saisi dans l'admin -> HTML : retour à la ligne = <br>, *mot* = mot en rouge.
// Hors version arabe, les mots arabes sont isolés pour ne pas bouleverser l'ordre de la phrase.
const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+(?:[\s ]+[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+)*/g;
export function rich(text, lang = 'fr') {
  let h = esc(text).replace(/\*([^*\n]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  if (lang !== 'ar') h = h.replace(ARABIC, (m) => `<bdi lang="ar">${m}</bdi>`);
  return h;
}

// Chiffres lisibles dans chaque langue, sans « K » ni « M » :
// 236 200 · 1,8 million · ٢٣٦ ألف (en chiffres occidentaux, comme en Algérie).
const UNITS = {
  fr: { m: ['million', 'millions'], k: null, sep: ',', group: ' ' },
  en: { m: ['million', 'million'], k: null, sep: '.', group: ',' },
  ar: { m: ['مليون', 'مليون'], k: ['ألف', 'ألف'], sep: ',', group: ' ' },
};
export function formatStat(value, lang = 'fr') {
  const u = UNITS[lang] || UNITS.fr;
  const v = Number(value) || 0;
  const dec = (x) => {
    const r = Math.round(x * 10) / 10;
    return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace('.', u.sep);
  };
  if (v >= 1e6) {
    const x = v / 1e6;
    return { num: dec(x), unit: x >= 2 ? u.m[1] : u.m[0] };
  }
  if (v >= 1e4 && u.k) return { num: dec(v / 1e3), unit: u.k[0] };
  return { num: String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, u.group), unit: '' };
}

// Heure de l'événement : saisie en heure d'Alger (UTC+1, sans heure d'été)
export const algiersTime = (local) => (local ? Date.parse(`${local}:00+01:00`) : NaN);
