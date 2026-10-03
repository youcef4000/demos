// Langues : chaque texte du contenu est un objet { fr, en, ar, es, … }. Ajouter une langue dans
// l'admin ajoute simplement une clé ; tant qu'un texte n'est pas traduit, on affiche la langue par
// défaut, puis l'anglais. Rien à reconstruire.
import { readLang, saveLang, rich, esc } from './store.js';

export function resolveLang(content) {
  const enabled = (content.languages || []).filter((l) => l.enabled).map((l) => l.code);
  const pick = (c) => (c && enabled.includes(c) ? c : null);
  const q = new URLSearchParams(location.search).get('lang');
  const nav = (navigator.languages || [navigator.language || '']).map((l) => String(l).slice(0, 2).toLowerCase());
  return pick(q) || pick(readLang()) || nav.map(pick).find(Boolean) || pick(content.defaultLang) || enabled[0] || 'fr';
}

export function createI18n(content, lang) {
  const def = content.defaultLang || 'fr';
  const meta = (content.languages || []).find((l) => l.code === lang) || { code: lang, dir: 'ltr' };
  const t = (field) => {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field[def] || field.en || Object.values(field).find(Boolean) || '';
  };
  const ui = (key, vars) => {
    let s = t(content.text?.[key]) || key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  };
  let regionNames;
  try {
    regionNames = new Intl.DisplayNames([lang, def, 'en'], { type: 'region' });
  } catch {
    regionNames = null;
  }
  const country = (code) => {
    try {
      return regionNames?.of(code) || code;
    } catch {
      return code;
    }
  };
  const nf = new Intl.NumberFormat(lang === 'ar' ? 'ar-DZ-u-nu-latn' : lang);
  return {
    lang,
    dir: meta.dir || 'ltr',
    meta,
    languages: (content.languages || []).filter((l) => l.enabled),
    t,
    ui,
    rich: (field) => rich(t(field)),
    uiRich: (key, vars) => rich(ui(key, vars)),
    country,
    num: (n) => nf.format(n),
  };
}

// Applique les traductions aux éléments marqués :
// data-t="clé" (texte), data-t-rich="clé" (*mise en valeur*), data-t-attr="placeholder:clé;aria-label:clé"
export function applyDom(i18n, root = document) {
  root.querySelectorAll('[data-t]').forEach((el) => (el.textContent = i18n.ui(el.dataset.t)));
  root.querySelectorAll('[data-t-rich]').forEach((el) => (el.innerHTML = i18n.uiRich(el.dataset.tRich)));
  root.querySelectorAll('[data-t-attr]').forEach((el) => {
    for (const pair of el.dataset.tAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, i18n.ui(key));
    }
  });
}

export function setDocumentLang(i18n) {
  const h = document.documentElement;
  h.lang = i18n.lang;
  h.dir = i18n.dir;
}

// Changer de langue : on garde la page, on recharge avec ?lang=xx (adresse partageable)
export function switchLang(code) {
  saveLang(code);
  const u = new URL(location.href);
  u.searchParams.set('lang', code);
  location.href = u.toString();
}

export const langLabel = (l) => esc(l.name || l.code);
