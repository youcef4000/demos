// Questions fréquentes (espace étudiant, landing), gérées par l'équipe dans l'espace équipe (#/faq).
// La liste publiée est data/faq.json (servie avec le site). Les modifications faites dans l'espace
// équipe restent un brouillon dans ce navigateur (aperçu immédiat) jusqu'à ce que l'équipe publie
// le fichier sur GitHub : le site se met alors à jour pour tout le monde.
// Chaque entrée : { id, cat, landing, q: { fr, en, ar }, a: { fr, en, ar } } — seul le français est obligatoire.

const KEY = 'hooked-academy:faq';
const SRC = new URL('../../data/faq.json', import.meta.url);
export const FILE = 'sites/hooked-academy/data/faq.json';
export const CATS = ['inscription', 'formation', 'plateforme', 'ia'];
const LANGS = ['fr', 'en', 'ar'];

const str = (v) => String(v ?? '').trim();
const texts = (o) => Object.fromEntries(LANGS.map((l) => [l, str(o?.[l])]));
function norm(x, i = 0) {
  if (!x || typeof x !== 'object') return null;
  const it = {
    id: str(x.id).replace(/[^\w-]/g, '') || `q${i}`,
    cat: CATS.includes(x.cat) ? x.cat : 'formation',
    landing: !!x.landing,
    q: texts(x.q),
    a: texts(x.a),
  };
  return it.q.fr && it.a.fr ? it : null;
}
const normList = (v) => (Array.isArray(v) ? v.map(norm).filter(Boolean) : []);

let published = null;
let loading = null;
/** Charge la liste publiée (data/faq.json). */
export function ready(force = false) {
  if (force) loading = null;
  if (!loading)
    loading = fetch(SRC, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((j) => (published = normList(j)));
  return loading;
}

function readDraft() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(v)) return normList(v);
  } catch {}
  return null;
}
function writeDraft(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}
const clone = (x) => JSON.parse(JSON.stringify(x));

/** Liste à afficher : le brouillon de ce navigateur s'il existe, sinon la liste publiée (appeler ready() avant). */
export const list = () => readDraft() || clone(published || []);
export const publishedList = () => clone(published || []);
/** Le brouillon diffère-t-il de la version publiée ? */
export function dirty() {
  const d = readDraft();
  return !!d && JSON.stringify(d) !== JSON.stringify(published || []);
}

/** Ajoute (sans id) ou met à jour une question. */
export function save(item) {
  const all = list();
  const clean = norm({ ...item, id: item.id || `q${Date.now().toString(36)}` });
  if (!clean) return null;
  const i = all.findIndex((x) => x.id === clean.id);
  if (i >= 0) all[i] = clean;
  else all.push(clean);
  writeDraft(all);
  return clean;
}
export function remove(id) {
  writeDraft(list().filter((x) => x.id !== id));
}
/** Monte (-1) ou descend (+1) une question. */
export function move(id, dir) {
  const all = list();
  const i = all.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  writeDraft(all);
}
/** Abandonne le brouillon : retour à la version publiée. */
export function discard() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
/** Contenu de data/faq.json pour la publication. */
export const toJSON = () => `${JSON.stringify(list(), null, 2)}\n`;
/** Texte dans la langue demandée, sinon en français. */
export const pickLang = (o, l) => str(o?.[l]) || str(o?.fr);
