// Langues de la plateforme Hooked Academy : français (par défaut), anglais, arabe (de droite à gauche).
// La langue vient de ?lang=fr|en|ar, sinon du dernier choix (localStorage), sinon le français.
// Elle est fixée au chargement : changer de langue recharge la page, chaque module lit `lang` une fois.
//
//   import { lang, t, add, pick } from './i18n.js';
//   add({ fr: { 'nav.join': 'Réserver' }, en: { 'nav.join': 'Book a seat' }, ar: { 'nav.join': 'احجز مقعدك' } });
//   t('nav.join')                      → selon la langue, repli sur le français
//   t('hello', { name: 'Yasmine' })    → remplace {name}
//   pick({ fr: '…', en: '…', ar: '…' }) → la valeur de la langue courante (repli sur fr)

export const LANGS = [
  { code: 'fr', label: 'Français', short: 'FR', dir: 'ltr', locale: 'fr-FR' },
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr', locale: 'en-GB' },
  { code: 'ar', label: 'العربية', short: 'ع', dir: 'rtl', locale: 'ar-DZ-u-nu-latn' },
];
const KEY = 'hooked-academy:lang';
const valid = (l) => LANGS.some((x) => x.code === l);

function detect() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (valid(q)) {
      try {
        localStorage.setItem(KEY, q);
      } catch {}
      return q;
    }
  } catch {}
  try {
    const s = localStorage.getItem(KEY);
    if (valid(s)) return s;
  } catch {}
  return 'fr';
}

export const lang = detect();
export const LANG = LANGS.find((x) => x.code === lang);
export const isRTL = LANG.dir === 'rtl';
export const dir = LANG.dir;
export const locale = LANG.locale;

if (typeof document !== 'undefined') {
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.documentElement.dataset.lang = lang;
}

const DICT = { fr: {}, en: {}, ar: {} };

/** Ajoute des traductions : { fr: {clé: texte}, en: {…}, ar: {…} }. */
export function add(dicts) {
  for (const l of Object.keys(dicts)) Object.assign((DICT[l] ||= {}), dicts[l]);
}

const fill = (s, vars) => (vars ? String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m)) : s);

/** La clé existe-t-elle dans la langue donnée (par défaut la langue courante) ? */
export const has = (key, l = lang) => DICT[l]?.[key] != null;

/** Texte traduit d'une clé (repli : français, puis la clé elle-même). */
export function t(key, vars) {
  const s = DICT[lang]?.[key] ?? DICT.fr[key];
  if (s == null) {
    if (typeof console !== 'undefined') console.warn(`[i18n] clé manquante : ${key}`);
    return key;
  }
  return typeof s === 'function' ? s(vars || {}) : fill(s, vars);
}

/** Valeur d'un objet { fr, en, ar } dans la langue courante. */
export const pick = (o) => (o && typeof o === 'object' && !Array.isArray(o) && ('fr' in o || 'en' in o || 'ar' in o) ? o[lang] ?? o.fr : o);

/** Change de langue : mémorise le choix et recharge (l'adresse garde ?lang= à jour si présent). */
export function setLang(l) {
  if (!valid(l) || l === lang) return;
  try {
    localStorage.setItem(KEY, l);
  } catch {}
  const u = new URL(location.href);
  if (u.searchParams.has('lang')) u.searchParams.set('lang', l);
  if (u.href === location.href) location.reload();
  else location.replace(u.href);
}

/** Traduit le DOM : data-i18n (texte), data-i18n-html (HTML de confiance), data-i18n-attr="aria-label:clé;placeholder:clé". */
export function applyDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}

/** Sélecteur de langue (boutons). `cls` : classe du conteneur. */
export function switcher(cls = 'lang-sw') {
  return `<div class="${cls}" role="group" aria-label="${t('i18n.choose')}">${LANGS.map(
    (l) => `<button type="button" data-lang="${l.code}" lang="${l.code}" aria-pressed="${l.code === lang}" title="${l.label}"${l.code === lang ? ' aria-current="true"' : ''}>${l.short}</button>`,
  ).join('')}</div>`;
}

/** Branche les boutons [data-lang] d'un conteneur (délégation). */
export function bindSwitchers(root = document) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b && root.contains(b)) setLang(b.dataset.lang);
  });
}

/** Nombres et dates au format de la langue (chiffres latins en arabe, comme en Algérie). */
export const fmtNum = (n, o) => new Intl.NumberFormat(locale, o).format(n);
export const fmtDate = (d, o = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat(locale, o).format(d instanceof Date ? d : new Date(d));

/** Le texte de secours d'une langue : utile pour les e-mails/WhatsApp envoyés par l'équipe. */
export const tIn = (l, key, vars) => {
  const v = DICT[l]?.[key] ?? DICT.fr[key] ?? key;
  return typeof v === 'function' ? v(vars || {}) : fill(v, vars);
};

/**
 * Accord en nombre selon les règles de la langue (CLDR : zero, one, two, few, many, other).
 * pl('ar', { one: 'درس واحد', two: 'درسان', few: '{n} دروس', many: '{n} درسًا', other: '{n} درس' })
 */
export function pl(l, forms) {
  const rules = new Intl.PluralRules(l);
  const nf = new Intl.NumberFormat(LANGS.find((x) => x.code === l)?.locale || l);
  return (vars = {}) => {
    const n = Number(vars.n);
    const k = Number.isFinite(n) ? rules.select(n) : 'other';
    return fill(forms[k] ?? forms.other, { ...vars, n: Number.isFinite(n) ? nf.format(n) : vars.n });
  };
}

add({
  fr: { 'i18n.choose': 'Choisir la langue' },
  en: { 'i18n.choose': 'Choose language' },
  ar: { 'i18n.choose': 'اختر اللغة' },
});
