// Langues de la boutique (version Premium) : français par défaut, néerlandais et anglais.
// La langue est dans l'adresse : #/… (FR), #/nl/…, #/en/…. Les textes NL/EN et le catalogue traduit
// ne se chargent qu'au changement de langue (i18n-nl.js, catalogue-nl.js…).
import { UNIVERS, FAQ, ETAPES } from './univers.js';
import { definirLocale } from './ui.js';

export const LANGUES = {
  fr: { code: 'FR', nom: 'Français', locale: 'fr-BE', og: 'fr_BE' },
  nl: { code: 'NL', nom: 'Nederlands', locale: 'nl-BE', og: 'nl_BE' },
  en: { code: 'EN', nom: 'English', locale: 'en-IE', og: 'en_GB' },
};
export let LANGUE = 'fr';
let PACK = null;   // textes de la langue (i18n-xx.js)
let CAT = null;    // catalogue traduit (catalogue-xx.js)
export const manquants = new Set();
try { window.__manquants = manquants; } catch { /* hors navigateur */ }

export async function chargerLangue(l) {
  if (!LANGUES[l]) l = 'fr';
  if (l === 'fr') { PACK = null; CAT = null; }
  else {
    const [pack, cat] = await Promise.all([import(`./i18n-${l}.js`), import(`./catalogue-${l}.js`)]);
    PACK = pack; CAT = cat.PRODUITS_TRAD;
  }
  LANGUE = l;
  definirLocale(LANGUES[l].locale);
  return l;
}

/* Texte d'interface : la clé est la phrase française ; {x} = valeur insérée. */
export function t(fr, vars) {
  let s = fr;
  if (LANGUE !== 'fr') {
    const v = PACK?.UI?.[fr];
    if (v === undefined) manquants.add(fr); else s = v;
  }
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '')) : s;
}
/* Lien interne dans la langue courante. */
export const H = (h) => (LANGUE === 'fr' ? h : h.replace(/^#\/?/, `#/${LANGUE}/`));

/* ---------- Catalogue ---------- */
const base = (p) => String(p.id).replace(/-expo$/, '');
const tr = (p) => (LANGUE === 'fr' ? null : CAT?.[base(p)]);
export function nomP(p) { return LANGUE === 'fr' ? p.nom : (p.trad?.[LANGUE]?.nom || tr(p)?.n || p.nom); }
export function pointsP(p) { return LANGUE === 'fr' ? p.points || [] : (tr(p)?.p || p.points || []); }
export function texteP(p) { return LANGUE === 'fr' ? p.texte || [] : (tr(p)?.t || p.texte || []); }
export function specsP(p) { return LANGUE === 'fr' ? p.specs || [] : (tr(p)?.s || p.specs || []); }
/* Fiche affichée en traduction automatique (pas encore relue dans l'admin). */
export function traductionAuto(p) { return LANGUE !== 'fr' && !!tr(p) && !p.trad?.[LANGUE]?.relu; }
export function nomF(f) { return LANGUE === 'fr' ? f.nom : (PACK?.FAMILLES?.[f.slug]?.nom || f.nom); }
export function courtF(f) { return LANGUE === 'fr' ? f.court || f.nom : (PACK?.FAMILLES?.[f.slug]?.court || PACK?.FAMILLES?.[f.slug]?.nom || f.court || f.nom); }
export function descF(f) { return LANGUE === 'fr' ? f.description : (PACK?.FAMILLES?.[f.slug]?.description || f.description); }
export function nomS(s) { return LANGUE === 'fr' ? s.nom : (PACK?.SOUS?.[s.slug] || s.nom); }
export function univers(slug) { return LANGUE === 'fr' ? UNIVERS[slug] : (PACK?.UNIVERS?.[slug] || UNIVERS[slug]); }
export function faq() { return LANGUE === 'fr' ? FAQ : (PACK?.FAQ || FAQ); }
export function etapes() { return LANGUE === 'fr' ? ETAPES : (PACK?.ETAPES || ETAPES); }
