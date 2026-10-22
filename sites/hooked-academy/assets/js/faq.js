// Questions fréquentes (landing, espace étudiant, assistant), gérées par l'équipe dans l'espace équipe (#/faq)
// et gardées par le serveur. Sans serveur (miroir, hors ligne) : data/faq.json, les questions publiques de base.
// Chaque question a son public (aud) :
//   « public » : landing et assistant public · « pro » : membres seulement (espace étudiant, assistant pro) · « both » : partout.
// Entrée : { id, cat, aud, landing, kw, q: { fr, en, ar }, a: { fr, en, ar } } — seul le français est obligatoire.
// kw : mots-clés de l'assistant (toutes langues, séparés par des virgules), en plus de la question et de la réponse.

import { PUB } from '../../data/serveur.js';

const SRC = new URL('../../data/faq.json', import.meta.url);
export const CATS = ['inscription', 'formation', 'plateforme', 'ia', 'creation', 'business'];
export const AUD = ['public', 'pro', 'both'];
const LANGS = ['fr', 'en', 'ar'];

const str = (v) => String(v ?? '').trim();
const texts = (o) => Object.fromEntries(LANGS.map((l) => [l, str(o?.[l])]));
export function norm(x, i = 0) {
  if (!x || typeof x !== 'object') return null;
  const it = {
    id: str(x.id).replace(/[^\w-]/g, '') || `q${i}`,
    cat: CATS.includes(x.cat) ? x.cat : 'formation',
    aud: AUD.includes(x.aud) ? x.aud : 'public',
    landing: !!x.landing,
    kw: str(x.kw).slice(0, 600),
    q: texts(x.q),
    a: texts(x.a),
  };
  return it.q.fr && it.a.fr ? it : null;
}
export const normList = (v) => (Array.isArray(v) ? v.map(norm).filter(Boolean) : []);
const clone = (x) => JSON.parse(JSON.stringify(x));

let published = null;
let loading = null;
/** Liste de base (data/faq.json), pour l'espace équipe tant que le serveur n'a pas de liste. */
export function base() {
  return fetch(SRC, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])
    .then(normList);
}
/** Charge la liste publique : celle du serveur, sinon data/faq.json. */
export function ready(force = false) {
  if (force) loading = null;
  if (!loading) loading = (Array.isArray(PUB?.faq) ? Promise.resolve(normList(PUB.faq)) : base()).then((l) => (published = l.filter((x) => x.aud !== 'pro')));
  return loading;
}
/** Questions publiques (appeler ready() avant). */
export const list = () => clone(published || []);

let pro = [];
/** Questions réservées aux membres, reçues du serveur à la connexion. */
export const setPro = (l) => (pro = normList(l).filter((x) => x.aud !== 'public'));
/** Espace étudiant : questions publiques + questions pro. */
export const memberList = () => {
  const seen = new Set();
  return [...list(), ...clone(pro)].filter((x) => !seen.has(x.id) && seen.add(x.id));
};
export const hasPro = () => pro.length > 0;

/** Texte dans la langue demandée, sinon en français. */
export const pickLang = (o, l) => str(o?.[l]) || str(o?.fr);
