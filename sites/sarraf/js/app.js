// Sarraf — le carnet vocal du cambiste.
// Après chaque appel : un mémo, vocal ou écrit, gardé dans le téléphone et présenté comme une fiche à vérifier :
// sommes, taux, par qui, à qui, bénéfice net, reste à régler. Tout se passe dans le téléphone, sans serveur :
// un mémo écrit est décortiqué tout seul (lecture.js), un mémo vocal donne une fiche à remplir en l'écoutant.
// Il travaille dans plusieurs pays : chaque mémo a son pays et la monnaie de ses prix.
// Les calculs (caisse, prix moyen, soldes, par monnaie) sont dans calcul.js.

import { calculer, bilan, cle, compte, complete, ordre, dette, jourLocal, normaliser, normaliserPaiement, MONNAIES, PAYS } from './calcul.js';
import { lireTexte } from './lecture.js';
import * as db from './base.js';

/* =============================== réglages =============================== */

const CLE_REGLAGES = 'sarraf.reglages';
// pays : pays principal (ses totaux en premier) ; paysMemo : pays des nouveaux mémos (le dernier choisi)
const DEFAUT = { theme: 'auto', millions: true, devise: 'EUR', pays: 'DZ', paysMemo: null, pin: null, secours: null, sel: null, sauvegarde: null, discret: false };
let reglages = { ...DEFAUT };
try {
  reglages = { ...DEFAUT, ...JSON.parse(localStorage.getItem(CLE_REGLAGES) || '{}') };
} catch {}
function garderReglages() {
  try {
    localStorage.setItem(CLE_REGLAGES, JSON.stringify(reglages));
  } catch {}
}

/* =============================== état =============================== */

const etat = {
  memos: [],
  paiements: [],
  calcul: calculer([], []),
  vue: 'journal',
  periode: '7j',
  paysBilan: null, // null : tous les pays
  recherche: '',
  feuille: null, // { type: 'memo' | 'contact', id }
};

/* =============================== format =============================== */

// Espace insécable ordinaire plutôt que l'espace fine (U+202F), absente de certaines polices : « 1 290 000 »
const format = (options) => {
  const f = new Intl.NumberFormat('fr-FR', options);
  return { format: (n) => f.format(n).replace(/\u202f/g, '\u00a0') };
};
const nf0 = format({ maximumFractionDigits: 0 });
const nf2 = format({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfx = format({ maximumFractionDigits: 2 });
const sym = (code) => MONNAIES[code]?.sym || code;
/** Montant dans une monnaie : « 1 290 000 DA » (le dinar algérien sans centimes), « 3 400,5 DT », « 5 000 € ». */
const argent = (n, code = 'DZD') => `${code === 'DZD' ? nf0.format(Math.round(n || 0)) : nfx.format(n || 0)} ${sym(code)}`;
const signe = (n, code = 'DZD') => `${n > 0.005 ? '+' : n < -0.005 ? '−' : ''}${argent(Math.abs(n || 0), code)}`;
const taux = (n) => nf2.format(n || 0);
const classeSigne = (n) => (n > 0.005 ? 'plus' : n < -0.005 ? 'moins' : '');
/** Monnaie du pays principal : celle des grands totaux. */
const monnaiePrincipale = () => PAYS[reglages.pays]?.monnaie || 'DZD';
const paysDuMemo = () => (PAYS[reglages.paysMemo] ? reglages.paysMemo : PAYS[reglages.pays] ? reglages.pays : 'DZ');
/** Devise échangée par défaut : la devise principale, sauf si c'est la monnaie des prix (en France, le dinar). */
const deviseParDefaut = (monnaie) => (reglages.devise !== monnaie ? reglages.devise || 'EUR' : monnaie === 'EUR' ? 'DZD' : 'EUR');
const nomPays = (code) => (PAYS[code] ? `${PAYS[code].drapeau} ${PAYS[code].nom}` : code);

/** Les Algériens comptent en centimes : 1 290 000 DA = « 129 millions ». Rien pour les autres monnaies. */
function millions(montantDa, monnaie = 'DZD') {
  if (!reglages.millions || monnaie !== 'DZD') return '';
  const m = Math.abs(montantDa) / 10000;
  if (m < 1) return '';
  const ent = Math.floor(m / 1000);
  const reste = Math.round((m - ent * 1000) * 100) / 100;
  const txtM = reste ? `${nfx.format(reste)} million${reste >= 2 ? 's' : ''}` : '';
  if (!ent) return `${txtM}`;
  return `${nf0.format(ent)} milliard${ent >= 2 ? 's' : ''}${txtM ? ` ${txtM}` : ''}`;
}

/** « 1 290 000 », « 258,5 », « 258.5 » → nombre ; vide → null. */
function nombre(s) {
  const t = String(s ?? '').replace(/[\s  ]/g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
const saisieNombre = (n) => (n == null || n === '' ? '' : String(n).replace('.', ','));

const aujourdhui = () => jourLocal(new Date().toISOString());
const decaler = (j, n) => {
  const d = new Date(`${j}T12:00:00`);
  d.setDate(d.getDate() + n);
  return jourLocal(d.toISOString());
};
const heure = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const jourCourt = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
function jourTitre(j) {
  if (j === aujourdhui()) return 'Aujourd’hui';
  if (j === decaler(aujourdhui(), -1)) return 'Hier';
  return new Date(`${j}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function ilya(iso) {
  if (!iso) return '';
  const j = Math.round((new Date(`${aujourdhui()}T12:00:00`) - new Date(`${jourLocal(iso)}T12:00:00`)) / 86400000);
  return j <= 0 ? 'aujourd’hui' : j === 1 ? 'hier' : `il y a ${j} j`;
}
const duree = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const initiales = (nom) =>
  String(nom)
    .split(/\s+/)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
const capitale = (s) => String(s || '').replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

/* =============================== DOM =============================== */

const $ = (s) => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';

function h(tag, props, ...enfants) {
  const el = document.createElement(tag);
  let valeur;
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'value') valeur = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat(Infinity)) if (e != null && e !== false && e !== '') el.append(e instanceof Node ? e : String(e));
  if (valeur !== undefined) el.value = valeur;
  return el;
}
function icone(nom) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('aria-hidden', 'true');
  const u = document.createElementNS(NS, 'use');
  u.setAttribute('href', `#i-${nom}`);
  s.append(u);
  return s;
}
/** Remplace le contenu d'un élément ; null, false et '' sont ignorés. */
const remplir = (el, ...enfants) => el.replaceChildren(...enfants.flat(Infinity).filter((e) => e != null && e !== false && e !== ''));
const pluriel = (n, un, plusieurs = `${un}s`) => `${n} ${n > 1 ? plusieurs : un}`;

/** Montant (flouté en mode discret). */
const mt = (texte, cls = '') => h('span', { class: `mt ${cls}`.trim() }, texte);

let toastMinuteur;
function toast(texte, ms = 2600) {
  const t = $('#toast');
  t.textContent = texte;
  t.classList.add('vu');
  clearTimeout(toastMinuteur);
  toastMinuteur = setTimeout(() => t.classList.remove('vu'), ms);
}

/* =============================== données =============================== */

async function charger() {
  const [memos, paiements] = await Promise.all([db.tous('memos'), db.tous('paiements')]);
  // Les mémos d'avant les pays sont en Algérie, en dinars
  etat.memos = memos.map(normaliser);
  etat.paiements = paiements.map(normaliserPaiement);
  recalculer();
}
function recalculer() {
  etat.calcul = calculer(etat.memos, etat.paiements);
}
async function garderMemo(m) {
  m.modifie = new Date().toISOString();
  await db.ecrire('memos', m);
  const i = etat.memos.findIndex((x) => x.id === m.id);
  if (i >= 0) etat.memos[i] = m;
  else etat.memos.push(m);
  recalculer();
}
async function supprimerMemo(id) {
  await Promise.all([db.effacer('memos', id), db.effacer('audios', id)]);
  etat.memos = etat.memos.filter((m) => m.id !== id);
  recalculer();
}
const nomsContacts = () =>
  [...etat.calcul.contacts.values()].sort((a, b) => (a.dernier < b.dernier ? 1 : -1)).map((c) => c.nom);

async function demanderPersistance() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {}
}

/* =============================== analyse d'un mémo =============================== */

function appliquer(m, a, doutesEnPlus = []) {
  const doutes = [...(a.a_verifier || []), ...doutesEnPlus];
  // Pays et monnaie : ceux que le mémo dit, sinon ceux choisis à l'enregistrement
  if (PAYS[a.pays]) m.pays = a.pays;
  if (MONNAIES[a.monnaie]) m.monnaie = a.monnaie;
  const mon = m.monnaie;
  m.operations = (a.operations || []).map((op) => {
    const o = {
      id: db.nouvelId('o'),
      sens: op.sens === 'vente' ? 'vente' : 'achat',
      devise: MONNAIES[op.devise] && op.devise !== mon ? op.devise : deviseParDefaut(mon),
      montant: op.montant ?? null,
      taux: op.taux ?? null,
      contact: op.contact ? capitale(op.contact.trim()) : null,
      reste: op.reste > 0 ? op.reste : null,
      reste_unite: op.reste > 0 ? (op.reste_unite === 'DEVISE' ? 'DEVISE' : 'MONNAIE') : null,
      entendu: op.entendu || '',
      remarque: op.remarque || null,
    };
    // Garde-fous en dinars algériens : un taux pour 100 unités est ramené à l'unité ; un taux hors normes est signalé
    if (mon === 'DZD' && o.taux >= 5000 && o.taux <= 100000) {
      doutes.push(`Taux ${nf0.format(o.taux)} ramené à ${taux(o.taux / 100)} DA pour 1 ${sym(o.devise)} (prix des 100).`);
      o.taux /= 100;
    } else if (mon === 'DZD' && o.devise !== 'DZD' && o.taux != null && (o.taux < 50 || o.taux > 1000)) {
      doutes.push(`Taux de ${taux(o.taux)} DA inhabituel : vérifie-le.`);
    }
    return o;
  });
  m.frais = a.frais ?? a.frais_da ?? null;
  m.frais_note = a.frais_note || null;
  m.echeance = a.echeance || null;
  m.resume = a.resume || '';
  m.texte_fr = a.texte_fr || '';
  m.a_verifier = [...new Set(doutes)];
}

/** Lecture du mémo, dans le téléphone : un mémo écrit est décortiqué, un mémo vocal donne une fiche à remplir en l'écoutant. */
async function analyser(m, { ouvrir = true } = {}) {
  if (m.transcription) appliquer(m, lireTexte(m.transcription, nomsContacts(), m.monnaie));
  else m.a_verifier = ['Écoute le mémo et remplis la fiche : combien, à quel prix, avec qui, payé ou ce qui reste.'];
  m.statut = 'a_verifier';
  await garderMemo(m);
  rendre();
  if (ouvrir && !rafraichirFiche(m.id)) proposerFiche(m);
}

/** Ouvre la fiche juste après le mémo, quand rien d'autre n'est ouvert : c'est le moment où il se souvient. */
function proposerFiche(m) {
  if (etat.feuille || !$('#enreg').hidden || document.visibilityState !== 'visible') return;
  ouvrirFiche(m.id);
}

/** Mémos laissés en attente par l'ancienne version (avec serveur) : lus maintenant, dans le téléphone. */
async function reprendreAnalyses() {
  for (const m of etat.memos.filter((x) => ['attente', 'analyse', 'erreur'].includes(x.statut)).sort(ordre)) await analyser(m, { ouvrir: false });
}

/* =============================== rendu général =============================== */

function rendre() {
  rendreCaisse();
  rendreAlertes();
  rendreJournal();
  if (etat.vue === 'carnet') rendreCarnet();
  if (etat.vue === 'bilan') rendreBilan();
  if (etat.vue === 'reglages') rendreReglages();
}

function route() {
  const v = (location.hash || '#journal').slice(1);
  etat.vue = ['journal', 'carnet', 'bilan', 'reglages'].includes(v) ? v : 'journal';
  for (const s of document.querySelectorAll('.vue')) s.hidden = s.dataset.vue !== etat.vue;
  for (const a of document.querySelectorAll('[data-lien]')) {
    if (a.dataset.lien === etat.vue) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  rendre();
  window.scrollTo(0, 0);
}

/* ------------------------------- caisse ------------------------------- */

function totauxSoldes() {
  const mon = monnaiePrincipale();
  const t = { doit: 0, dois: 0, nDoit: 0, nDois: 0, autres: {} };
  for (const c of etat.calcul.contacts.values()) {
    for (const [u, v] of Object.entries(c.soldes)) {
      if (Math.abs(v) < 0.005) continue;
      if (u === mon) {
        if (v > 0) (t.doit += v), t.nDoit++;
        else (t.dois -= v), t.nDois++;
      } else {
        const x = (t.autres[u] ||= { doit: 0, dois: 0 });
        if (v > 0) x.doit += v;
        else x.dois -= v;
      }
    }
  }
  return t;
}

/** Chiffre signé sans son unité (l'unité est écrite à côté, en petit). */
const sansUnite = (n, code) => signe(n, code).slice(0, -(sym(code).length + 1));

function rendreCaisse() {
  const j = aujourdhui();
  const mon = monnaiePrincipale();
  const b = bilan(etat.memos, etat.calcul, j, decaler(j, 1));
  const profit = b.profits[mon] || 0;
  const autresProfits = Object.entries(b.profits).filter(([u, v]) => u !== mon && Math.abs(v) >= 0.005);
  const t = totauxSoldes();
  const pos = Object.values(etat.calcul.positions).filter((p) => Math.abs(p.q) >= 0.01);
  const principale =
    pos.find((p) => p.monnaie === mon && p.devise === reglages.devise) || pos.find((p) => p.monnaie === mon) || pos[0];
  const sous = b.memos
    ? `${pluriel(b.ops, 'opération')} aujourd’hui${b.nonVerifies ? ` · ${pluriel(b.nonVerifies, 'fiche')} à vérifier` : ''}`
    : 'Aucune opération aujourd’hui pour l’instant.';
  const caisse = principale
    ? h(
        'div',
        { class: 'tuile' },
        h('span', { class: 'tuile-l', text: principale.q < 0 ? 'À couvrir' : 'En caisse' }),
        h('span', { class: 'tuile-v' }, mt(argent(Math.abs(principale.q), principale.devise))),
        h('span', { class: 'tuile-s' }, 'moy. ', mt(taux(principale.p)), principale.monnaie !== mon ? ` ${sym(principale.monnaie)}` : ''),
      )
    : h('div', { class: 'tuile' }, h('span', { class: 'tuile-l', text: 'En caisse' }), h('span', { class: 'tuile-v', text: '—' }), h('span', { class: 'tuile-s', text: 'aucune devise' }));
  const versCarnet = () => (location.hash = '#carnet');
  const autres = Object.entries(t.autres);
  remplir(
    $('#caisse'),
    h('p', { class: 'caisse-titre', text: 'Bénéfice net · aujourd’hui' }),
    h('p', { class: `caisse-chiffre ${classeSigne(profit)}` }, mt(sansUnite(profit, mon)), h('small', { text: sym(mon) })),
    h('p', { class: 'caisse-sous', text: sous }),
    autresProfits.length
      ? h('p', { class: 'caisse-autres' }, 'Aussi : ', autresProfits.map(([u, v], i) => [i ? ' · ' : '', mt(signe(v, u), classeSigne(v))]))
      : null,
    h(
      'div',
      { class: 'tuiles' },
      caisse,
      h(
        'button',
        { class: 'tuile', type: 'button', onclick: versCarnet },
        h('span', { class: 'tuile-l', text: `On te doit · ${sym(mon)}` }),
        h('span', { class: `tuile-v ${t.doit ? 'plus' : ''}` }, mt(argent(t.doit, mon).slice(0, -(sym(mon).length + 1)))),
        h('span', { class: 'tuile-s', text: t.nDoit ? pluriel(t.nDoit, 'personne') : autres.length ? 'autres monnaies ↓' : 'personne' }),
      ),
      h(
        'button',
        { class: 'tuile', type: 'button', onclick: versCarnet },
        h('span', { class: 'tuile-l', text: `Tu dois · ${sym(mon)}` }),
        h('span', { class: `tuile-v ${t.dois ? 'moins' : ''}` }, mt(argent(t.dois, mon).slice(0, -(sym(mon).length + 1)))),
        h('span', { class: 'tuile-s', text: t.nDois ? `à ${pluriel(t.nDois, 'personne')}` : 'rien' }),
      ),
    ),
    autres.length
      ? h(
          'p',
          { class: 'note' },
          'Autres monnaies : ',
          autres.map(([u, x], i) => [
            i ? ' · ' : '',
            x.doit ? ['on te doit ', mt(argent(x.doit, u))] : '',
            x.doit && x.dois ? ', ' : '',
            x.dois ? ['tu dois ', mt(argent(x.dois, u))] : '',
          ]),
        )
      : null,
  );
}

/* ------------------------------- alertes ------------------------------- */

function rendreAlertes() {
  const el = $('#alertes');
  const a = [];
  const parStatut = (s) => etat.memos.filter((m) => m.statut === s);
  const exemples = etat.memos.some((m) => m.exemple);
  if (exemples)
    a.push(
      h(
        'button',
        { class: 'alerte alerte-info', type: 'button', onclick: () => (location.hash = '#reglages') },
        icone('alerte'),
        h('span', {}, h('b', { text: 'Données d’exemple. ' }), 'Rien de réel : à retirer avant de commencer.'),
        h('span', { class: 'fl' }, icone('fleche')),
      ),
    );
  const aVerifier = parStatut('a_verifier').sort(ordre);
  if (aVerifier.length)
    a.push(
      h(
        'button',
        { class: 'alerte', type: 'button', onclick: () => ouvrirFiche(aVerifier[0].id) },
        icone('alerte'),
        h('span', {}, h('b', { text: `${aVerifier.length} fiche${aVerifier.length > 1 ? 's' : ''} à vérifier` }), ' — tant que c’est frais.'),
        h('span', { class: 'fl' }, icone('fleche')),
      ),
    );
  for (const e of echeances().slice(0, 3)) {
    a.push(
      h(
        'button',
        { class: 'alerte alerte-rouge', type: 'button', onclick: () => ouvrirContact(e.cle) },
        icone('horloge'),
        h('span', {}, h('b', { text: e.nom }), e.montant > 0 ? ' te doit ' : ', tu lui dois ', mt(argent(Math.abs(e.montant), e.unite)), ` — échéance ${e.jour === aujourdhui() ? 'aujourd’hui' : `du ${jourCourt(e.jour)}`}`),
        h('span', { class: 'fl' }, icone('fleche')),
      ),
    );
  }
  if (etat.memos.some((m) => !m.exemple) && (!reglages.sauvegarde || Date.now() - new Date(reglages.sauvegarde) > 7 * 86400000))
    a.push(
      h(
        'button',
        { class: 'alerte alerte-info', type: 'button', onclick: () => (location.hash = '#reglages') },
        icone('partage'),
        h('span', {}, h('b', { text: 'Sauvegarde ' }), reglages.sauvegarde ? `faite ${ilya(reglages.sauvegarde)} : refais-en une.` : 'jamais faite : envoie-toi une copie.'),
      ),
    );
  remplir(el, a);
}

/** Restes à régler dont l'échéance est passée ou tombe aujourd'hui (et pas encore soldés). */
function echeances() {
  const j = aujourdhui();
  const out = [];
  const vus = new Set();
  for (const m of etat.memos.filter(compte)) {
    if (!m.echeance || m.echeance > j) continue;
    for (const op of m.operations || []) {
      const d = dette(op, m.monnaie);
      if (!d || !op.contact) continue;
      const c = etat.calcul.contacts.get(cle(op.contact));
      const solde = c?.soldes[d.unite] || 0;
      if (!c || Math.sign(solde) !== Math.sign(d.montant) || Math.abs(solde) < 0.005 || vus.has(c.cle + d.unite)) continue;
      vus.add(c.cle + d.unite);
      out.push({ cle: c.cle, nom: c.nom, unite: d.unite, montant: solde, jour: m.echeance });
    }
  }
  return out.sort((a, b) => (a.jour < b.jour ? -1 : 1));
}

/* ------------------------------- journal ------------------------------- */

function rendreJournal() {
  const el = $('#journal');
  if (!etat.memos.length) {
    el.replaceChildren(
      h(
        'div',
        { class: 'vide-etat' },
        h('span', { class: 'vide-micro' }, icone('micro')),
        h('h2', { text: 'Après chaque appel, un mémo' }),
        h('p', { text: 'Appuie sur le micro et raconte ce qui a été conclu, puis remplis la fiche tant que c’est frais. Ou écris-le : la fiche se remplit toute seule.' }),
        h('p', { class: 'exemple-phrase', text: '« J’ai acheté 5 000 euros à Karim à 258, revendu à Samir à 261. Samir me doit encore 30 millions, il paie demain. »' }),
        h('button', { class: 'btn btn-or', type: 'button', onclick: () => ouvrirEnreg() }, icone('micro'), 'Premier mémo'),
      ),
    );
    return;
  }
  const jours = new Map();
  for (const m of [...etat.memos].sort(ordre).reverse()) {
    const j = jourLocal(m.date);
    if (!jours.has(j)) jours.set(j, []);
    jours.get(j).push(m);
  }
  const blocs = [];
  for (const [j, liste] of jours) {
    // Total du jour, monnaie par monnaie (dinars et dirhams ne s'additionnent pas)
    const totaux = {};
    for (const m of liste) {
      const r = etat.calcul.memos.get(m.id);
      if (r) totaux[r.monnaie] = (totaux[r.monnaie] || 0) + r.profit;
    }
    const mon = monnaiePrincipale();
    const lignes = Object.entries(totaux)
      .filter(([, v], _, t) => Math.abs(v) >= 0.005 || t.length === 1)
      .sort(([a], [b]) => (a === mon ? -1 : b === mon ? 1 : 0))
      .map(([u, v], i) => [i ? ' · ' : '', mt(signe(v, u), classeSigne(v))]);
    blocs.push(h('h2', { class: 'jour' }, h('span', { text: jourTitre(j) }), lignes.length ? h('span', {}, lignes) : null));
    for (const m of liste) blocs.push(bordereau(m));
  }
  remplir(el, blocs);
}

const STATUTS = { attente: 'En attente', analyse: 'Analyse…', a_verifier: 'À vérifier', verifie: 'Vérifié', erreur: 'Erreur' };

function bordereau(m) {
  const r = etat.calcul.memos.get(m.id);
  const tete = h(
    'div',
    { class: 'b-tete' },
    h('span', { class: 'b-heure', text: heure(m.date) }),
    m.source === 'voix' ? lecteur(m, true) : h('span', { class: 'b-resume', text: m.resume || m.transcription || 'Mémo écrit' }),
    m.pays !== reglages.pays ? h('span', { class: 'drapeau', title: PAYS[m.pays]?.nom, text: PAYS[m.pays]?.drapeau || m.pays }) : null,
    m.exemple ? h('span', { class: 'exemple-badge', text: 'EXEMPLE' }) : null,
    m.statut !== 'verifie' ? h('span', { class: `statut s-${m.statut}`, text: STATUTS[m.statut] }) : h('span', { class: 'tampon', text: 'VÉRIFIÉ' }),
  );
  const corps = [];
  corps.push(h('div', { class: 'perfo' }));
  const ops = m.operations || [];
  corps.push(
    h(
      'div',
      { class: 'b-lignes' },
      ops.length
        ? ops.map((op) => ligneOp(op, m.monnaie))
        : h('p', { class: 'note', text: m.source === 'voix' ? 'Fiche vide : touche pour la remplir en écoutant le mémo.' : 'Aucune opération reconnue : touche pour remplir.' }),
    ),
  );
  corps.push(h('div', { class: 'perfo' }));
  const puces = [];
  for (const op of ops) {
    const d = dette(op, m.monnaie);
    if (!d) continue;
    const qui = op.contact || 'Quelqu’un';
    const montant = argent(Math.abs(d.montant), d.unite);
    puces.push(h('span', { class: `puce ${d.montant > 0 ? 'puce-doit' : 'puce-dois'}` }, d.montant > 0 ? `${qui} te doit ` : `Tu dois à ${qui} `, mt(montant)));
  }
  if (m.echeance) puces.push(h('span', { class: 'puce' }, icone('horloge'), `Échéance ${m.echeance === aujourdhui() ? 'aujourd’hui' : jourCourt(`${m.echeance}T12:00:00`)}`));
  corps.push(
    h(
      'div',
      { class: 'b-pied' },
      h('div', { class: 'b-benef' }, h('span', { text: 'Bénéfice net' }), mt(r ? signe(r.profit, r.monnaie) : '—', r ? classeSigne(r.profit) : '')),
      puces,
    ),
  );
  return h(
    'article',
    { class: 'bordereau', tabindex: '0', role: 'button', 'aria-label': `Mémo de ${heure(m.date)}, ${STATUTS[m.statut]}`, onclick: () => ouvrirFiche(m.id), onkeydown: (e) => e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), ouvrirFiche(m.id)) },
    tete,
    corps,
  );
}

function ligneOp(op, monnaie) {
  const total = op.montant > 0 && op.taux > 0 ? op.montant * op.taux : null;
  return h(
    'div',
    { class: 'ligne' },
    h('span', { class: `tag tag-${op.sens}` }, icone(op.sens === 'achat' ? 'entree' : 'sortie'), op.sens === 'achat' ? 'Achat' : 'Vente'),
    h('span', { class: `qui ${op.contact ? '' : 'vide'}`, text: op.contact || (op.sens === 'achat' ? 'acheté à ?' : 'vendu à ?') }),
    h('span', { class: 'calc' }, mt(`${op.montant ? argent(op.montant, op.devise) : '? ' + sym(op.devise)} × ${op.taux ? taux(op.taux) : '?'}`)),
    h('span', { class: 'total' }, mt(total != null ? argent(total, monnaie) : '—')),
    h('span', { class: 'mil' }, total != null ? mt(millions(total, monnaie)) : null),
  );
}

/* ------------------------------- lecteur audio ------------------------------- */

const lecture = { audio: null, id: null, url: null };

function lecteur(m, petit = false) {
  const ondes = (m.ondes && m.ondes.length ? m.ondes : Array(32).fill(0.3)).slice(0, petit ? 28 : 48);
  const onde = h('span', { class: 'onde', 'data-onde': m.id });
  for (const v of ondes) {
    const i = document.createElement('i');
    i.style.height = `${Math.max(12, Math.round(v * 100))}%`;
    onde.append(i);
  }
  const btn = h('button', { class: 'lecteur-btn', type: 'button', 'aria-label': 'Écouter le mémo', 'data-lire': m.id }, icone(lecture.id === m.id && !lecture.audio?.paused ? 'pause' : 'lecture'));
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    basculerLecture(m.id);
  });
  return h('span', { class: 'lecteur', onclick: (e) => e.stopPropagation() }, btn, onde, h('span', { class: 'duree', text: duree(m.duree || 0) }));
}

async function basculerLecture(id) {
  if (lecture.id === id && lecture.audio) {
    if (lecture.audio.paused) lecture.audio.play();
    else lecture.audio.pause();
    return;
  }
  arreterLecture();
  const blob = await db.lire('audios', id);
  if (!blob) return toast('Audio introuvable sur ce téléphone.');
  lecture.url = URL.createObjectURL(blob);
  lecture.audio = new Audio(lecture.url);
  lecture.id = id;
  const maj = () => {
    const a = lecture.audio;
    if (!a) return;
    const p = a.duration && Number.isFinite(a.duration) ? a.currentTime / a.duration : 0;
    for (const o of document.querySelectorAll(`[data-onde="${id}"]`)) {
      const barres = o.children;
      const n = Math.round(p * barres.length);
      for (let i = 0; i < barres.length; i++) barres[i].classList.toggle('lu', i < n);
    }
    for (const b of document.querySelectorAll(`[data-lire="${id}"]`)) b.replaceChildren(icone(a.paused ? 'lecture' : 'pause'));
  };
  lecture.audio.addEventListener('timeupdate', maj);
  lecture.audio.addEventListener('play', maj);
  lecture.audio.addEventListener('pause', maj);
  lecture.audio.addEventListener('ended', () => {
    maj();
    arreterLecture();
  });
  lecture.audio.play().catch(() => toast('Lecture impossible.'));
}
function arreterLecture() {
  if (lecture.audio) {
    lecture.audio.pause();
    for (const o of document.querySelectorAll(`[data-onde="${lecture.id}"] i`)) o.classList.remove('lu');
    for (const b of document.querySelectorAll(`[data-lire="${lecture.id}"]`)) b.replaceChildren(icone('lecture'));
  }
  if (lecture.url) URL.revokeObjectURL(lecture.url);
  lecture.audio = lecture.url = lecture.id = null;
}

/* =============================== enregistrement =============================== */

const enr = { flux: null, rec: null, morceaux: [], debut: 0, minuteur: 0, ctx: null, analyseur: null, image: 0, pics: [], texte: false, mime: '' };
const MAX_SECONDES = 5 * 60;

function choisirFormat() {
  if (!window.MediaRecorder) return null;
  for (const t of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) if (MediaRecorder.isTypeSupported?.(t)) return t;
  return '';
}

/** Liste des pays (drapeau + nom) pour un <select> ; la valeur choisie est le code du pays. */
function optionsPays(select, valeur) {
  remplir(select, Object.entries(PAYS).map(([code, p]) => h('option', { value: code, text: `${p.drapeau} ${p.nom} · ${sym(p.monnaie)}` })));
  select.value = valeur;
  return select;
}

async function ouvrirEnreg(texte = false) {
  arreterLecture();
  optionsPays($('#enreg-pays'), paysDuMemo());
  const ecran = $('#enreg');
  ecran.hidden = false;
  pousserCouche('enreg');
  $('#enreg-temps').textContent = '0:00';
  $('#memo-texte').value = '';
  enr.pics = [];
  enr.morceaux = [];
  if (texte || choisirFormat() === null || !navigator.mediaDevices?.getUserMedia) return modeTexte(texte ? '' : 'Ce navigateur n’enregistre pas le son : écris le mémo.');
  modeVoix();
  try {
    enr.flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch {
    return modeTexte('Micro refusé : autorise le micro pour Sarraf, ou écris le mémo.');
  }
  if (ecran.hidden) return couperMicro(); // fermé pendant la demande d'autorisation
  enr.mime = choisirFormat();
  enr.rec = new MediaRecorder(enr.flux, enr.mime ? { mimeType: enr.mime, audioBitsPerSecond: 32000 } : undefined);
  enr.rec.ondataavailable = (e) => e.data.size && enr.morceaux.push(e.data);
  enr.rec.start(1000);
  enr.debut = Date.now();
  enr.minuteur = setInterval(() => {
    const s = (Date.now() - enr.debut) / 1000;
    $('#enreg-temps').textContent = duree(s);
    if (s >= MAX_SECONDES) envoyerMemo();
  }, 250);
  dessinerOnde();
}

function modeVoix() {
  enr.texte = false;
  $('.enreg').classList.remove('texte');
  $('#enreg-texte').hidden = true;
  $('#t-enreg').textContent = 'Je t’écoute…';
  $('#enreg-clavier').hidden = false;
}
function modeTexte(raison) {
  couperMicro();
  enr.texte = true;
  $('.enreg').classList.add('texte');
  $('#enreg-texte').hidden = false;
  $('#t-enreg').textContent = raison || 'Mémo écrit';
  $('#enreg-clavier').hidden = true;
  setTimeout(() => $('#memo-texte').focus(), 50);
}

function dessinerOnde() {
  try {
    enr.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = enr.ctx.createMediaStreamSource(enr.flux);
    enr.analyseur = enr.ctx.createAnalyser();
    enr.analyseur.fftSize = 1024;
    src.connect(enr.analyseur);
  } catch {
    return;
  }
  const canvas = $('#enreg-onde');
  const c = canvas.getContext('2d');
  const couleur = getComputedStyle(document.documentElement).getPropertyValue('--or').trim() || '#e8bd4f';
  const donnees = new Uint8Array(enr.analyseur.fftSize);
  const recents = [];
  let dernier = 0;
  const pas = (t) => {
    enr.image = requestAnimationFrame(pas);
    if (t - dernier < 70) return;
    dernier = t;
    enr.analyseur.getByteTimeDomainData(donnees);
    let somme = 0;
    for (const v of donnees) somme += ((v - 128) / 128) ** 2;
    const niveau = Math.min(1, Math.sqrt(somme / donnees.length) * 4);
    enr.pics.push(niveau);
    recents.push(niveau);
    if (recents.length > 60) recents.shift();
    const W = canvas.width;
    const H = canvas.height;
    c.clearRect(0, 0, W, H);
    c.fillStyle = couleur;
    const l = W / 60;
    recents.forEach((v, i) => {
      const hh = Math.max(4, v * H * 0.9);
      c.globalAlpha = 0.35 + (0.65 * i) / recents.length;
      c.fillRect(i * l + l * 0.2, (H - hh) / 2, l * 0.6, hh);
    });
    c.globalAlpha = 1;
  };
  enr.image = requestAnimationFrame(pas);
}

function couperMicro() {
  clearInterval(enr.minuteur);
  cancelAnimationFrame(enr.image);
  if (enr.rec && enr.rec.state !== 'inactive') {
    enr.rec.onstop = null;
    try {
      enr.rec.stop();
    } catch {}
  }
  enr.flux?.getTracks().forEach((t) => t.stop());
  enr.ctx?.close().catch(() => {});
  enr.flux = enr.rec = enr.ctx = enr.analyseur = null;
}

function arreterEnregistreur() {
  return new Promise((ok) => {
    const rec = enr.rec;
    if (!rec || rec.state === 'inactive') return ok(null);
    rec.onstop = () => ok(new Blob(enr.morceaux, { type: rec.mimeType || enr.mime || 'audio/webm' }));
    rec.stop();
  });
}

/** Moyenne des niveaux enregistrés, ramenée à n barres pour la petite onde du bordereau. */
function resumerOnde(pics, n = 48) {
  if (!pics.length) return [];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = Math.floor((i * pics.length) / n);
    const b = Math.max(a + 1, Math.floor(((i + 1) * pics.length) / n));
    const tranche = pics.slice(a, b);
    out.push(tranche.reduce((s, v) => s + v, 0) / tranche.length);
  }
  const max = Math.max(...out, 0.01);
  return out.map((v) => Math.round((v / max) * 100) / 100);
}

async function envoyerMemo() {
  const maintenant = new Date().toISOString();
  const pays = paysDuMemo();
  const m = {
    id: db.nouvelId('m'),
    cree: maintenant,
    date: maintenant,
    pays,
    monnaie: PAYS[pays].monnaie,
    statut: 'attente',
    source: enr.texte ? 'texte' : 'voix',
    duree: 0,
    mime: null,
    ondes: [],
    transcription: null,
    operations: [],
    a_verifier: [],
    note: '',
  };
  if (enr.texte) {
    const t = $('#memo-texte').value.trim();
    if (!t) return toast('Écris le mémo d’abord.');
    m.transcription = t;
  } else {
    if (!enr.rec) return toast('Le micro n’est pas encore prêt.');
    const secondes = (Date.now() - enr.debut) / 1000;
    clearInterval(enr.minuteur);
    const blob = await arreterEnregistreur();
    const pics = enr.pics;
    couperMicro();
    if (!blob || secondes < 1 || blob.size < 500) {
      fermerEnreg();
      return toast('Mémo trop court : parle au moins une seconde.');
    }
    m.duree = Math.round(secondes);
    m.mime = blob.type;
    m.ondes = resumerOnde(pics);
    await db.ecrire('audios', blob, m.id);
  }
  await garderMemo(m);
  fermerEnreg(false, () => {
    if (location.hash !== '#journal' && location.hash) location.hash = '#journal';
  });
  rendre();
  toast(m.source === 'voix' ? 'Mémo gardé ✓' : 'Mémo écrit gardé ✓');
  demanderPersistance();
  analyser(m);
}

function fermerEnreg(depuisHistorique = false, ensuite) {
  couperMicro();
  $('#enreg').hidden = true;
  if (!depuisHistorique) retirerCouche('enreg', ensuite);
  else ensuite?.();
}

async function annulerEnreg() {
  const s = enr.rec ? (Date.now() - enr.debut) / 1000 : 0;
  const t = $('#memo-texte').value.trim();
  if ((s > 4 || t) && !confirm('Abandonner ce mémo ? Il ne sera pas gardé.')) return;
  fermerEnreg();
}

/* =============================== couches (retour arrière Android) =============================== */

function pousserCouche(nom) {
  if (history.state?.couche) history.replaceState({ couche: nom }, '');
  else history.pushState({ couche: nom }, '');
}
let apresRetour = null;
/** Ferme l'entrée d'historique de la couche ; `ensuite` s'exécute une fois le retour arrière terminé. */
function retirerCouche(nom, ensuite) {
  if (history.state?.couche === nom) {
    apresRetour = ensuite || null;
    history.back();
  } else ensuite?.();
}
window.addEventListener('popstate', () => {
  const f = apresRetour;
  apresRetour = null;
  if (!$('#enreg').hidden) {
    // Retour pendant un mémo : on le garde plutôt que de perdre ce qui a été dit
    const parle = enr.rec && (Date.now() - enr.debut) / 1000 > 2;
    if (parle || (enr.texte && $('#memo-texte').value.trim())) envoyerMemo();
    else fermerEnreg(true);
  }
  if (etat.feuille) fermerFeuille(true);
  f?.();
});

/* =============================== feuilles =============================== */

let sauvegardeFiche = null; // { garder, annuler } de la fiche ouverte

/** Enregistre la fiche ouverte (modifications en attente) avant d'afficher autre chose. */
function viderFiche() {
  const f = sauvegardeFiche;
  sauvegardeFiche = null;
  return f?.garder();
}

function ouvrirFeuille(contenu, info) {
  const voile = $('#feuille');
  const corps = $('#feuille-corps');
  const deja = Boolean(etat.feuille);
  etat.feuille = info;
  remplir(corps, contenu);
  voile.hidden = false;
  if (!deja) {
    corps.scrollTop = 0;
    pousserCouche('feuille');
    corps.focus({ preventScroll: true });
  }
}
async function fermerFeuille(depuisHistorique = false) {
  await viderFiche();
  etat.feuille = null;
  $('#feuille').hidden = true;
  $('#feuille-corps').replaceChildren();
  if (!depuisHistorique) retirerCouche('feuille');
  rendre();
}
$('#feuille').addEventListener('click', (e) => e.target === e.currentTarget && fermerFeuille());

function teteFeuille(titre, sousTitre, ...extra) {
  return h(
    'div',
    { class: 'f-tete' },
    h('h2', {}, titre, sousTitre ? h('small', { text: sousTitre }) : null),
    extra,
    h('button', { class: 'icone-btn', type: 'button', 'aria-label': 'Fermer', onclick: () => fermerFeuille() }, icone('x')),
  );
}

/** Rouvre la fiche d'un mémo si elle est affichée (après une analyse). */
function rafraichirFiche(id) {
  if (etat.feuille?.type !== 'memo' || etat.feuille.id !== id) return false;
  // La version affichée est périmée : ses modifications en attente ne doivent pas écraser l'analyse
  sauvegardeFiche?.annuler();
  sauvegardeFiche = null;
  ouvrirFiche(id);
  return true;
}

/* ------------------------------- fiche d'un mémo ------------------------------- */

async function ouvrirFiche(id) {
  await viderFiche();
  const memo = etat.memos.find((m) => m.id === id);
  if (!memo) return;
  const b = structuredClone(memo);
  b.operations ||= [];
  let modifie = false;
  let actif = true;
  let minuteur;
  const garder = async () => {
    clearTimeout(minuteur);
    if (!modifie || !actif) return;
    modifie = false;
    await garderMemo(structuredClone(b));
    rendre();
  };
  sauvegardeFiche = {
    garder,
    annuler: () => {
      actif = false;
      clearTimeout(minuteur);
    },
  };
  const changer = () => {
    modifie = true;
    clearTimeout(minuteur);
    minuteur = setTimeout(garder, 500);
    majResultat();
  };

  const contacts = nomsContacts();
  const liste = h('datalist', { id: 'liste-contacts' }, contacts.map((n) => h('option', { value: n })));
  const zoneOps = h('div', {});
  const resultat = h('div', { class: 'resultat', 'aria-live': 'polite' });

  function carteOp(op, i) {
    const vente = op.sens === 'vente';
    const totalEl = mt('—');
    const milEl = h('small', { class: 'mt' });
    const resteNote = h('p', { class: 'note' });
    const majTotal = () => {
      const t = op.montant > 0 && op.taux > 0 ? op.montant * op.taux : null;
      totalEl.textContent = t != null ? argent(t, b.monnaie) : '—';
      milEl.textContent = t != null ? millions(t, b.monnaie) : '';
      const d = dette(op, b.monnaie);
      const qui = op.contact || (vente ? 'l’acheteur' : 'le vendeur');
      resteNote.textContent = d
        ? d.montant > 0
          ? `${qui} te doit encore ${argent(d.montant, d.unite)}.`
          : `Tu dois encore ${argent(-d.montant, d.unite)} à ${qui}.`
        : '';
    };
    const champNombre = (cleChamp, placeholder, unite) =>
      h(
        'span',
        { class: 'saisie' },
        h('input', {
          class: 'mono',
          inputmode: 'decimal',
          autocomplete: 'off',
          placeholder,
          value: saisieNombre(op[cleChamp]),
          'aria-label': placeholder,
          oninput: (e) => {
            op[cleChamp] = nombre(e.target.value);
            majTotal();
            changer();
          },
        }),
        unite,
      );
    const choixDevise = h(
      'select',
      {
        class: 'unite-choix',
        'aria-label': 'Devise',
        onchange: (e) => {
          op.devise = e.target.value;
          dessinerOps();
          changer();
        },
      },
      // La devise échangée n'est jamais la monnaie des prix
      Object.keys(MONNAIES)
        .filter((d) => d !== b.monnaie || d === op.devise)
        .map((d) => h('option', { value: d, text: sym(d) })),
    );
    choixDevise.value = op.devise || deviseParDefaut(b.monnaie);
    const aReste = op.reste > 0 || op._reste;
    const carte = h(
      'div',
      { class: `op ${op.sens}` },
      h(
        'div',
        { class: 'op-haut' },
        h(
          'div',
          { class: 'seg', role: 'group', 'aria-label': 'Sens' },
          ['achat', 'vente'].map((s) =>
            h('button', {
              type: 'button',
              'data-v': s,
              'aria-pressed': String(op.sens === s),
              text: s === 'achat' ? 'Achat' : 'Vente',
              onclick: () => {
                op.sens = s;
                dessinerOps();
                changer();
              },
            }),
          ),
        ),
        h('button', { class: 'icone-btn op-suppr', type: 'button', 'aria-label': 'Supprimer la ligne', onclick: () => {
          b.operations.splice(i, 1);
          dessinerOps();
          changer();
        } }, icone('poubelle')),
      ),
      h(
        'div',
        { class: 'grille' },
        h('label', { class: 'champ' }, h('span', { text: 'Somme' }), h('span', { class: 'saisie' }, champNombre('montant', '0', null).firstChild, choixDevise)),
        h('label', { class: 'champ' }, h('span', { text: vente ? 'Prix de vente' : 'Prix d’achat' }), champNombre('taux', '0,00', h('span', { class: 'unite', text: `${sym(b.monnaie)}/${sym(op.devise)}` }))),
        h(
          'label',
          { class: 'champ large' },
          h('span', { text: vente ? 'À qui ?' : 'Par qui ?' }),
          h('span', { class: 'saisie' }, h('input', {
            list: 'liste-contacts',
            autocomplete: 'off',
            autocapitalize: 'words',
            placeholder: vente ? 'Nom de l’acheteur' : 'Nom du vendeur',
            value: op.contact || '',
            oninput: (e) => {
              op.contact = e.target.value.trim() || null;
              majTotal();
              changer();
            },
          })),
        ),
      ),
      h('div', { class: 'op-total' }, h('span', { text: vente ? 'Il te paie' : 'Tu paies' }), h('span', {}, totalEl, milEl)),
      h(
        'div',
        { class: 'reglement' },
        h('span', { class: 'champ' }, h('span', { text: 'Réglé ?' })),
        h(
          'div',
          { class: 'seg', role: 'group', 'aria-label': 'Règlement' },
          h('button', { type: 'button', 'aria-pressed': String(!aReste), text: 'Tout réglé', onclick: () => {
            op.reste = null;
            op.reste_unite = null;
            op._reste = false;
            dessinerOps();
            changer();
          } }),
          h('button', { type: 'button', 'aria-pressed': String(Boolean(aReste)), text: 'Il reste', onclick: () => {
            op._reste = true;
            op.reste_unite ||= 'MONNAIE';
            dessinerOps();
          } }),
        ),
        aReste
          ? h(
              'span',
              { class: 'saisie' },
              h('input', {
                class: 'mono',
                inputmode: 'decimal',
                placeholder: 'Montant restant',
                'aria-label': 'Montant restant',
                value: saisieNombre(op.reste),
                oninput: (e) => {
                  op.reste = nombre(e.target.value);
                  majTotal();
                  changer();
                },
              }),
              (() => {
                const s = h('select', { class: 'unite-choix', 'aria-label': 'Unité du reste', onchange: (e) => {
                  op.reste_unite = e.target.value;
                  majTotal();
                  changer();
                } }, h('option', { value: 'MONNAIE', text: sym(b.monnaie) }), h('option', { value: 'DEVISE', text: sym(op.devise) }));
                s.value = op.reste_unite === 'DEVISE' ? 'DEVISE' : 'MONNAIE';
                return s;
              })(),
            )
          : null,
      ),
      resteNote,
      op.entendu ? h('p', { class: 'entendu' }, 'Entendu : ', h('q', { dir: 'auto', text: op.entendu })) : null,
      h('button', { class: 'btn btn-petit', type: 'button', onclick: () => partager(texteConfirmation(op, b)) }, icone('partage'), op.contact ? `Confirmer à ${op.contact}` : 'Envoyer une confirmation'),
    );
    majTotal();
    return carte;
  }

  function dessinerOps() {
    remplir(zoneOps, b.operations.map(carteOp));
    majResultat();
  }

  function majResultat() {
    const autres = etat.memos.filter((m) => m.id !== b.id);
    const essai = { ...b, statut: compte(b) ? b.statut : 'a_verifier' };
    const r = calculer([...autres, essai], etat.paiements).memos.get(b.id);
    const lignes = [];
    for (const l of r?.lignes || []) {
      const u = `${sym(b.monnaie)}/${sym(l.devise)}`;
      if (l.type === 'adosse') lignes.push(`${argent(l.qte, l.devise)} achetés à ${taux(l.achat)} et vendus à ${taux(l.vente)} ${u} : ${signe(l.profit, b.monnaie)}`);
      if (l.type === 'stock') lignes.push(`${argent(l.qte, l.devise)} sortis de ta caisse (prix moyen ${taux(l.pmp)}) vendus à ${taux(l.vente)} ${u} : ${signe(l.profit, b.monnaie)}`);
      if (l.type === 'caisse') lignes.push(`${argent(l.qte, l.devise)} entrent en caisse à ${taux(l.achat)} ${u} : le bénéfice viendra à la vente.`);
      if (l.type === 'decouvert') lignes.push(`${argent(l.qte, l.devise)} vendus sans stock : le bénéfice sera compté au rachat.`);
      if (l.type === 'rachat') lignes.push(`${argent(l.qte, l.devise)} rachetés à ${taux(l.achat)} ${u} pour couvrir une vente faite avant : ${signe(l.profit, b.monnaie)}`);
    }
    if (r?.frais) lignes.push(`Frais : ${signe(-r.frais, b.monnaie)}`);
    if (r?.incomplet) lignes.push('Une ligne sans somme ou sans prix n’est pas comptée.');
    if (!b.operations.length) lignes.push('Ajoute au moins une ligne.');
    remplir(
      resultat,
      h('div', { class: 'resultat-ligne' }, h('b', { text: 'Bénéfice net' }), mt(r ? signe(r.profit, b.monnaie) : '—', r ? classeSigne(r.profit) : '')),
      h('ul', {}, lignes.map((t) => h('li', { text: t }))),
    );
  }

  const date = new Date(b.date);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const texteMemo = h('textarea', { rows: '4', dir: 'auto', value: b.transcription || '', 'aria-label': 'Texte du mémo' });
  const zoneTexte = h(
    'div',
    { hidden: true },
    texteMemo,
    h('div', { class: 'actions deux' },
      h('button', { class: 'btn btn-petit', type: 'button', onclick: () => {
        zoneTexte.hidden = true;
        texteMemo.value = b.transcription || '';
      } }, 'Annuler'),
      h('button', { class: 'btn btn-petit btn-or', type: 'button', onclick: async () => {
        b.transcription = texteMemo.value.trim();
        if (!b.transcription) return toast('Le texte est vide.');
        modifie = true;
        await garder();
        analyser(etat.memos.find((x) => x.id === b.id));
      } }, 'Relire ce texte'),
    ),
  );

  const blocMemo = h(
    'div',
    { class: 'bloc' },
    h('p', { class: 'bloc-titre', text: b.source === 'voix' ? 'Le mémo' : 'Le mémo écrit' }),
    b.source === 'voix' ? h('div', { class: 'lecteur-grand' }, lecteur(b)) : null,
    b.transcription
      ? h(
          'details',
          { open: b.source !== 'voix' || !b.texte_fr },
          h('summary', { text: b.source === 'voix' ? 'Ce que tu as dit' : 'Texte' }),
          h('p', { class: 'memo-texte', dir: 'auto', lang: b.langue && b.langue.startsWith('ar') ? 'ar' : null, text: b.transcription }),
        )
      : null,
    b.texte_fr && b.texte_fr !== b.transcription ? h('p', { class: 'memo-texte fr', text: b.texte_fr }) : null,
    zoneTexte,
    // Mémo vocal : il peut écrire (ou dicter avec le micro du clavier) ce qu'il a dit, la fiche se remplit toute seule
    h(
      'div',
      { class: 'actions' },
      h('button', { class: 'btn btn-petit', type: 'button', onclick: () => {
        zoneTexte.hidden = false;
        texteMemo.focus();
      } }, icone('clavier'), b.transcription ? 'Corriger le texte' : 'Écrire le mémo pour remplir la fiche'),
    ),
    h(
      'label',
      { class: 'champ', style: null },
      h('span', { text: 'Date et heure de l’opération' }),
      h('input', { class: 'seul', type: 'datetime-local', value: local, onchange: (e) => {
        const d = new Date(e.target.value);
        if (!Number.isNaN(d.getTime())) {
          b.date = d.toISOString();
          changer();
        }
      } }),
    ),
  );

  const doutes = (b.a_verifier || []).length
    ? h('div', { class: 'doutes' }, h('p', {}, icone('alerte'), 'À vérifier'), h('ul', {}, b.a_verifier.map((t) => h('li', { text: t }))))
    : null;

  // Pays et monnaie des prix : changer de pays prend sa monnaie (modifiable : en France, il peut compter en dinars)
  const fraisUnite = h('span', { class: 'unite', text: sym(b.monnaie) });
  const changerMonnaie = (mon) => {
    b.monnaie = mon;
    for (const op of b.operations) if (op.devise === mon) op.devise = deviseParDefaut(mon);
    fraisUnite.textContent = sym(mon);
    dessinerOps();
    changer();
  };
  const choixMonnaie = h('select', { class: 'seul', 'aria-label': 'Monnaie des prix', onchange: (e) => changerMonnaie(e.target.value) },
    Object.entries(MONNAIES).map(([code, x]) => h('option', { value: code, text: `${x.sym} · ${x.nom}` })));
  choixMonnaie.value = b.monnaie;
  const choixPays = optionsPays(h('select', { class: 'seul', 'aria-label': 'Pays de l’opération', onchange: (e) => {
    b.pays = e.target.value;
    choixMonnaie.value = PAYS[b.pays].monnaie;
    changerMonnaie(PAYS[b.pays].monnaie);
  } }), b.pays);
  const blocPays = h(
    'div',
    { class: 'bloc' },
    h('p', { class: 'bloc-titre', text: 'Pays et monnaie' }),
    h('div', { class: 'grille' }, h('label', { class: 'champ' }, h('span', { text: 'Pays' }), choixPays), h('label', { class: 'champ' }, h('span', { text: 'Prix en' }), choixMonnaie)),
  );

  const frais = h(
    'div',
    { class: 'bloc' },
    h('p', { class: 'bloc-titre', text: 'Frais, échéance, note' }),
    h(
      'div',
      { class: 'grille' },
      h('label', { class: 'champ' }, h('span', { text: 'Frais (samsar, transport)' }), h('span', { class: 'saisie' }, h('input', { class: 'mono', inputmode: 'decimal', placeholder: '0', value: saisieNombre(b.frais), oninput: (e) => {
        b.frais = nombre(e.target.value);
        changer();
      } }), fraisUnite)),
      h('label', { class: 'champ' }, h('span', { text: 'Échéance' }), h('input', { class: 'seul', type: 'date', value: b.echeance || '', onchange: (e) => {
        b.echeance = e.target.value || null;
        changer();
      } })),
      h('label', { class: 'champ large' }, h('span', { text: 'Note' }), h('textarea', { rows: '2', dir: 'auto', placeholder: 'Rendez-vous, lieu, détail…', value: b.note || '', oninput: (e) => {
        b.note = e.target.value;
        changer();
      } })),
    ),
  );

  const valider = h(
    'button',
    {
      class: 'btn btn-or',
      type: 'button',
      onclick: async () => {
        if (!b.operations.length) return toast('Ajoute au moins une ligne.');
        if (b.operations.some((op) => !complete(op))) return toast('Il manque une somme ou un prix sur une ligne.');
        b.statut = 'verifie';
        b.verifie_le = new Date().toISOString();
        modifie = true;
        await garder();
        const r = etat.calcul.memos.get(b.id);
        await fermerFeuille();
        toast(`Fiche validée ✓  Bénéfice ${signe(r?.profit || 0, b.monnaie)}`);
      },
    },
    icone('envoyer'),
    b.statut === 'verifie' ? 'Fiche vérifiée — enregistrer' : 'Valider la fiche',
  );

  const contenu = [
    liste,
    teteFeuille(
      `Fiche du ${new Date(b.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}`,
      `${heure(b.date)} · ${b.source === 'voix' ? `mémo vocal ${duree(b.duree || 0)}` : 'mémo écrit'}${b.exemple ? ' · exemple' : ''}`,
      h('span', { class: `statut s-${b.statut}`, text: STATUTS[b.statut] }),
    ),
    blocMemo,
    doutes,
    blocPays,
    h('p', { class: 'bloc-titre', text: 'Opérations' }),
    zoneOps,
    h(
      'button',
      {
        class: 'btn ajouter',
        type: 'button',
          onclick: () => {
          const der = b.operations.at(-1);
          b.operations.push({ id: db.nouvelId('o'), sens: der ? (der.sens === 'achat' ? 'vente' : 'achat') : 'achat', devise: der?.devise || deviseParDefaut(b.monnaie), montant: der?.montant ?? null, taux: null, contact: null, reste: null, reste_unite: null, entendu: '' });
          dessinerOps();
          changer();
        },
      },
      icone('plus'),
      'Ajouter une ligne',
    ),
    frais,
    resultat,
    h(
      'div',
      { class: 'actions' },
      valider,
      h('div', { class: 'actions deux' },
        h('button', { class: 'btn', type: 'button', onclick: () => partager(texteFiche(b)) }, icone('partage'), 'Partager la fiche'),
        h('button', { class: 'btn btn-rouge', type: 'button', onclick: async () => {
          if (!confirm('Supprimer ce mémo et sa fiche ? Ce sera définitif.')) return;
          sauvegardeFiche?.annuler();
          sauvegardeFiche = null;
          arreterLecture();
          await supprimerMemo(b.id);
          await fermerFeuille();
          toast('Mémo supprimé.');
        } }, icone('poubelle'), 'Supprimer'),
      ),
    ),
  ];
  dessinerOps();
  ouvrirFeuille(contenu, { type: 'memo', id });
}

function texteOp(op, mon) {
  const t = op.montant > 0 && op.taux > 0 ? op.montant * op.taux : null;
  const mil = t != null ? millions(t, mon) : '';
  return `${op.sens === 'achat' ? 'Achat' : 'Vente'} de ${op.montant ? argent(op.montant, op.devise) : '?'} à ${op.taux ? taux(op.taux) : '?'} ${sym(mon)}${t != null ? ` = ${argent(t, mon)}${mil ? ` (${mil})` : ''}` : ''}`;
}
function texteReste(op, mon) {
  const d = dette(op, mon);
  if (!d) return 'Tout est réglé.';
  return `Reste à régler : ${argent(Math.abs(d.montant), d.unite)}.`;
}
/** Message pour la personne en face : la confirmation écrite qui évite les « je n'ai jamais dit ça ». Jamais le bénéfice. */
function texteConfirmation(op, m) {
  const quand = `${new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${heure(m.date)}`;
  const quoi = op.sens === 'achat' ? 'tu me vends' : 'je te vends';
  const t = op.montant > 0 && op.taux > 0 ? op.montant * op.taux : null;
  const mil = t != null ? millions(t, m.monnaie) : '';
  return [
    `Salam${op.contact ? ` ${op.contact}` : ''}, je confirme notre accord du ${quand}${m.pays !== reglages.pays ? ` (${PAYS[m.pays]?.nom || m.pays})` : ''} :`,
    `${quoi} ${op.montant ? argent(op.montant, op.devise) : '?'} à ${op.taux ? taux(op.taux) : '?'} ${sym(m.monnaie)}${t != null ? `, soit ${argent(t, m.monnaie)}${mil ? ` (${mil})` : ''}` : ''}.`,
    texteReste(op, m.monnaie),
    m.echeance ? `Échéance : ${new Date(`${m.echeance}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.` : '',
    'Merci de confirmer 👍',
  ]
    .filter(Boolean)
    .join('\n');
}
function texteFiche(m) {
  const r = etat.calcul.memos.get(m.id);
  return [
    `Fiche Sarraf · ${new Date(m.date).toLocaleDateString('fr-FR')} ${heure(m.date)} · ${PAYS[m.pays]?.nom || m.pays}`,
    ...(m.operations || []).map((op) => `• ${texteOp(op, m.monnaie)}${op.contact ? ` — ${op.contact}` : ''}${dette(op, m.monnaie) ? ` (${texteReste(op, m.monnaie).replace('.', '')})` : ''}`),
    m.frais ? `Frais : ${argent(m.frais, m.monnaie)}` : '',
    r ? `Bénéfice net : ${signe(r.profit, m.monnaie)}` : '',
    m.note ? `Note : ${m.note}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function partager(texte) {
  try {
    if (navigator.share) return await navigator.share({ text: texte });
  } catch (e) {
    if (e.name === 'AbortError') return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank', 'noopener');
}

/* =============================== carnet =============================== */

function rendreCarnet() {
  const q = cle(etat.recherche);
  const liste = [...etat.calcul.contacts.values()]
    .filter((c) => !q || c.cle.includes(q))
    .sort((a, b) => {
      const da_ = Object.values(a.soldes).some((v) => Math.abs(v) >= 0.005);
      const db_ = Object.values(b.soldes).some((v) => Math.abs(v) >= 0.005);
      if (da_ !== db_) return da_ ? -1 : 1;
      return a.dernier < b.dernier ? 1 : -1;
    });
  const el = $('#carnet');
  if (!liste.length) {
    el.replaceChildren(h('div', { class: 'vide-etat' }, h('h2', { text: q ? 'Personne à ce nom' : 'Carnet vide' }), h('p', { text: q ? 'Vérifie l’orthographe.' : 'Les personnes apparaissent ici dès qu’un mémo les cite.' })));
    return;
  }
  el.replaceChildren(
    ...liste.map((c) => {
      // Solde mis en avant : celui de la monnaie principale, sinon le premier qui n'est pas soldé
      const mon = monnaiePrincipale();
      const s = c.soldes[mon] || 0;
      const autres = Object.entries(c.soldes).filter(([u, v]) => u !== mon && Math.abs(v) >= 0.005);
      return h(
        'button',
        { class: 'personne', type: 'button', onclick: () => ouvrirContact(c.cle) },
        h('span', { class: 'initiales', text: initiales(c.nom) }),
        h('span', { class: 'personne-corps' }, h('span', { class: 'personne-nom', text: c.nom }), h('span', { class: 'personne-info', text: `${c.ops.length} opération${c.ops.length > 1 ? 's' : ''} · ${ilya(c.dernier)}` })),
        h(
          'span',
          { class: 'personne-solde' },
          Math.abs(s) >= 0.005 ? mt(argent(Math.abs(s), mon), s > 0 ? 'plus' : 'moins') : autres.length ? mt(argent(Math.abs(autres[0][1]), autres[0][0]), autres[0][1] > 0 ? 'plus' : 'moins') : h('span', { text: '—' }),
          h('small', { text: Math.abs(s) >= 0.005 ? (s > 0 ? 'te doit' : 'tu lui dois') : autres.length ? (autres[0][1] > 0 ? 'te doit' : 'tu lui dois') : 'à jour' }),
        ),
      );
    }),
  );
}
$('#cherche-contact').addEventListener('input', (e) => {
  etat.recherche = e.target.value;
  rendreCarnet();
});

async function ouvrirContact(k) {
  await viderFiche();
  const c = etat.calcul.contacts.get(k);
  if (!c) return;
  const soldes = Object.entries(c.soldes).filter(([, v]) => Math.abs(v) >= 0.005);
  const fmt = (u, v) => argent(Math.abs(v), u);

  const formulaire = h('div', { class: 'bloc', hidden: true });
  const paiement = { sens: soldes[0]?.[1] < 0 ? 'donne' : 'recu', unite: soldes[0]?.[0] || monnaiePrincipale(), montant: soldes[0] ? Math.abs(soldes[0][1]) : null, date: aujourdhui(), note: '' };
  function dessinerFormulaire() {
    remplir(
      formulaire,
      h('p', { class: 'bloc-titre', text: 'Nouveau règlement' }),
      h('div', { class: 'seg', role: 'group', 'aria-label': 'Sens du règlement' },
        h('button', { type: 'button', 'aria-pressed': String(paiement.sens === 'recu'), text: 'Il m’a payé', onclick: () => ((paiement.sens = 'recu'), dessinerFormulaire()) }),
        h('button', { type: 'button', 'aria-pressed': String(paiement.sens === 'donne'), text: 'Je lui ai payé', onclick: () => ((paiement.sens = 'donne'), dessinerFormulaire()) }),
      ),
      h('div', { class: 'grille', style: null },
        h('label', { class: 'champ large' }, h('span', { text: 'Montant' }), h('span', { class: 'saisie' },
          h('input', { class: 'mono', inputmode: 'decimal', value: saisieNombre(paiement.montant), oninput: (e) => (paiement.montant = nombre(e.target.value)) }),
          (() => {
            const s = h('select', { class: 'unite-choix', 'aria-label': 'Unité', onchange: (e) => (paiement.unite = e.target.value) }, Object.keys(MONNAIES).map((u) => h('option', { value: u, text: sym(u) })));
            s.value = paiement.unite;
            return s;
          })(),
        )),
        h('label', { class: 'champ' }, h('span', { text: 'Date' }), h('input', { class: 'seul', type: 'date', value: paiement.date, onchange: (e) => (paiement.date = e.target.value) })),
        h('label', { class: 'champ' }, h('span', { text: 'Note' }), h('input', { class: 'seul', type: 'text', value: paiement.note, oninput: (e) => (paiement.note = e.target.value) })),
      ),
      h('div', { class: 'actions' }, h('button', { class: 'btn btn-or', type: 'button', onclick: async () => {
        if (!(paiement.montant > 0)) return toast('Indique le montant.');
        await ajouterPaiement({ contact: c.nom, sens: paiement.sens, unite: paiement.unite, montant: paiement.montant, date: new Date(`${paiement.date}T${new Date().toTimeString().slice(0, 8)}`).toISOString(), note: paiement.note });
        toast('Règlement enregistré ✓');
        ouvrirContact(k);
      } }, 'Enregistrer le règlement')),
    );
  }
  dessinerFormulaire();

  // Volumes par caisse (« EUR/DZD » : euros achetés ou vendus contre des dinars)
  const resume = (t, sens) =>
    Object.entries(t).map(([k, x]) => {
      const [d, mon] = k.split('/');
      return h('div', { class: 'reg-ligne' }, h('p', {}, sens, h('small', { text: `${pluriel(x.n, 'opération')} · prix moyen ${taux(x.total / x.qte)} ${sym(mon)}` })), mt(argent(x.qte, d)));
    });

  const histo = [
    ...c.ops.map(({ memo, op }) => ({ date: memo.date, memo, op })),
    ...c.paiements.map((p) => ({ date: p.date, p })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const contenu = [
    teteFeuille(c.nom, `${c.ops.length} opération${c.ops.length > 1 ? 's' : ''} · dernière ${ilya(c.dernier)}`, h('button', { class: 'icone-btn', type: 'button', 'aria-label': 'Renommer', onclick: () => renommer(c) }, icone('crayon'))),
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Solde' }),
      soldes.length
        ? soldes.map(([u, v]) => h('div', { class: 'resultat-ligne' }, h('b', { text: v > 0 ? `${c.nom} te doit` : `Tu dois à ${c.nom}` }), mt(fmt(u, v), v > 0 ? 'plus' : 'moins')))
        : h('p', { class: 'ok', text: 'Rien à régler entre vous.' }),
      h(
        'div',
        { class: 'actions deux', style: null },
        h('button', { class: 'btn btn-petit', type: 'button', onclick: () => ((formulaire.hidden = !formulaire.hidden), formulaire.hidden || formulaire.querySelector('input')?.focus()) }, icone('plus'), 'Règlement'),
        soldes.length
          ? h('button', { class: 'btn btn-petit', type: 'button', onclick: async () => {
              if (!confirm(`Tout est réglé avec ${c.nom} ?`)) return;
              for (const [u, v] of soldes) await ajouterPaiement({ contact: c.nom, sens: v > 0 ? 'recu' : 'donne', unite: u, montant: Math.abs(v), date: new Date().toISOString(), note: 'Tout réglé' });
              toast('Compte soldé ✓');
              ouvrirContact(k);
            } }, icone('envoyer'), 'Tout réglé')
          : null,
      ),
      soldes.length
        ? h('button', { class: 'btn btn-petit', type: 'button', style: null, onclick: () => partager([`Salam ${c.nom}, le point entre nous :`, ...soldes.map(([u, v]) => (v > 0 ? `tu me dois ${fmt(u, v)}` : `je te dois ${fmt(u, v)}`)), 'Merci de confirmer 👍'].join('\n')) }, icone('partage'), `Envoyer le point à ${c.nom}`)
        : null,
    ),
    formulaire,
    Object.keys(c.achete).length || Object.keys(c.vendu).length ? h('div', { class: 'bloc' }, h('p', { class: 'bloc-titre', text: 'Volume' }), resume(c.achete, 'Acheté chez lui'), resume(c.vendu, 'Vendu à lui')) : null,
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Historique' }),
      h(
        'div',
        { class: 'histo' },
        histo.map((x) =>
          x.op
            ? h(
                'button',
                { class: 'histo-ligne', type: 'button', style: null, onclick: () => ouvrirFiche(x.memo.id) },
                h('span', { class: 'd', text: jourCourt(x.date) }),
                h('span', { class: 'q' }, h('span', { class: `tag tag-${x.op.sens}` }, x.op.sens === 'achat' ? 'Achat' : 'Vente'), mt(`${x.op.montant ? argent(x.op.montant, x.op.devise) : '?'} × ${x.op.taux ? taux(x.op.taux) : '?'}`)),
                h('span', { class: 'v' }, mt(x.op.montant > 0 && x.op.taux > 0 ? argent(x.op.montant * x.op.taux, x.memo.monnaie) : '—')),
              )
            : h(
                'div',
                { class: 'histo-ligne' },
                h('span', { class: 'd', text: jourCourt(x.date) }),
                h('span', { class: 'q', text: `${x.p.sens === 'recu' ? 'Il t’a payé' : 'Tu lui as payé'}${x.p.note ? ` · ${x.p.note}` : ''}` }),
                h('span', { class: 'v' }, mt(argent(x.p.montant, x.p.unite))),
                h('button', { class: 'icone-btn', type: 'button', 'aria-label': 'Supprimer ce règlement', onclick: async () => {
                  if (!confirm('Supprimer ce règlement ?')) return;
                  await db.effacer('paiements', x.p.id);
                  etat.paiements = etat.paiements.filter((p) => p.id !== x.p.id);
                  recalculer();
                  ouvrirContact(k);
                } }, icone('poubelle')),
              ),
        ),
      ),
    ),
  ];
  ouvrirFeuille(contenu.filter(Boolean), { type: 'contact', id: k });
}

async function ajouterPaiement(p) {
  const r = { id: db.nouvelId('p'), ...p };
  await db.ecrire('paiements', r);
  etat.paiements.push(r);
  recalculer();
  rendre();
}

async function renommer(c) {
  const nom = prompt('Nouveau nom', c.nom);
  if (!nom || !nom.trim() || nom.trim() === c.nom) return;
  const neuf = capitale(nom.trim());
  for (const m of etat.memos) {
    let change = false;
    for (const op of m.operations || []) if (op.contact && cle(op.contact) === c.cle) (op.contact = neuf), (change = true);
    if (change) await db.ecrire('memos', m);
  }
  for (const p of etat.paiements) if (cle(p.contact) === c.cle) (p.contact = neuf), await db.ecrire('paiements', p);
  recalculer();
  rendre();
  ouvrirContact(cle(neuf));
}

/* =============================== bilan =============================== */

const PERIODES = [
  ['jour', 'Aujourd’hui'],
  ['7j', '7 jours'],
  ['30j', '30 jours'],
  ['mois', 'Ce mois'],
  ['tout', 'Tout'],
];
function bornes(p) {
  const j = aujourdhui();
  const fin = decaler(j, 1);
  if (p === 'jour') return [j, fin];
  if (p === '7j') return [decaler(j, -6), fin];
  if (p === '30j') return [decaler(j, -29), fin];
  if (p === 'mois') return [`${j.slice(0, 8)}01`, fin];
  const premiers = etat.memos.filter(compte).map((m) => jourLocal(m.date)).sort();
  return [premiers[0] || j, fin];
}

function rendrePeriodes(paysUtilises) {
  remplir(
    $('#periodes'),
    PERIODES.map(([k, t]) =>
      h('button', { type: 'button', role: 'radio', 'aria-checked': String(etat.periode === k), text: t, onclick: () => ((etat.periode = k), rendreBilan()) }),
    ),
  );
  // Choix du pays : seulement s'il a travaillé dans plusieurs pays
  const el = $('#pays-bilan');
  el.hidden = paysUtilises.length < 2;
  remplir(
    el,
    [null, ...paysUtilises].map((code) =>
      h('button', {
        type: 'button',
        role: 'radio',
        'aria-checked': String(etat.paysBilan === code),
        text: code ? nomPays(code) : 'Tous les pays',
        onclick: () => ((etat.paysBilan = code), rendreBilan()),
      }),
    ),
  );
}

function rendreBilan() {
  const paysUtilises = [...new Set(etat.memos.filter(compte).map((m) => m.pays))].sort((a, b) => (a === reglages.pays ? -1 : b === reglages.pays ? 1 : 0));
  if (!paysUtilises.includes(etat.paysBilan)) etat.paysBilan = null;
  rendrePeriodes(paysUtilises);
  const [debut, fin] = bornes(etat.periode);
  const b = bilan(etat.memos, etat.calcul, debut, fin, etat.paysBilan);
  // Monnaie mise en avant : celle du pays choisi (ou du pays principal), si elle a servi sur la période
  const voulue = etat.paysBilan ? PAYS[etat.paysBilan].monnaie : monnaiePrincipale();
  const mon = b.profits[voulue] != null || !Object.keys(b.profits).length ? voulue : Object.keys(b.profits)[0];
  const profit = b.profits[mon] || 0;
  const autresProfits = Object.entries(b.profits).filter(([u, v]) => u !== mon && Math.abs(v) >= 0.005);
  const plusieurs = new Set([...Object.keys(b.achats), ...Object.keys(b.ventes)].map((k) => k.split('/')[1])).size > 1;
  const blocs = [];
  blocs.push(
    h(
      'div',
      { class: 'caisse' },
      h('p', { class: 'caisse-titre', text: `Bénéfice net · ${PERIODES.find(([k]) => k === etat.periode)[1].toLowerCase()}${etat.paysBilan ? ` · ${PAYS[etat.paysBilan].nom}` : ''}` }),
      h('p', { class: `caisse-chiffre ${classeSigne(profit)}` }, mt(sansUnite(profit, mon)), h('small', { text: sym(mon) })),
      h('p', { class: 'caisse-sous', text: b.memos ? `${pluriel(b.ops, 'opération')} sur ${pluriel(b.memos, 'mémo')}${b.nonVerifies ? ` · dont ${pluriel(b.nonVerifies, 'non vérifié', 'non vérifiés')}` : ''}` : 'Aucune opération sur la période.' }),
      autresProfits.length ? h('p', { class: 'caisse-autres' }, 'Aussi : ', autresProfits.map(([u, v], i) => [i ? ' · ' : '', mt(signe(v, u), classeSigne(v))])) : null,
    ),
  );
  const caisses = [...new Set([...Object.keys(b.achats), ...Object.keys(b.ventes)])];
  const stats = [];
  for (const k of caisses) {
    const [d, m] = k.split('/');
    const a = b.achats[k];
    const v = b.ventes[k];
    const contre = plusieurs ? ` · en ${sym(m)}` : '';
    stats.push(
      h('div', { class: 'stat' }, h('span', { class: 'tuile-l', text: `Acheté ${sym(d)}${contre}` }), h('span', { class: 'tuile-v' }, mt(a ? argent(a.qte, d) : '—')), h('span', { class: 'tuile-s' }, a ? ['prix moyen ', mt(`${taux(a.total / a.qte)} ${sym(m)}`)] : 'aucun achat')),
      h('div', { class: 'stat' }, h('span', { class: 'tuile-l', text: `Vendu ${sym(d)}${contre}` }), h('span', { class: 'tuile-v' }, mt(v ? argent(v.qte, d) : '—')), h('span', { class: 'tuile-s' }, v ? ['prix moyen ', mt(`${taux(v.total / v.qte)} ${sym(m)}`)] : 'aucune vente')),
    );
    if (a && v) stats.push(h('div', { class: 'stat' }, h('span', { class: 'tuile-l', text: `Écart moyen ${sym(d)}${contre}` }), h('span', { class: 'tuile-v' }, mt(`${taux(v.total / v.qte - a.total / a.qte)} ${sym(m)}`)), h('span', { class: 'tuile-s', text: `par ${sym(d)}, vente − achat` })));
  }
  for (const [u, f] of Object.entries(b.frais)) stats.push(h('div', { class: 'stat' }, h('span', { class: 'tuile-l', text: 'Frais' }), h('span', { class: 'tuile-v moins' }, mt(argent(f, u))), h('span', { class: 'tuile-s', text: 'samsar, transport…' })));
  if (stats.length) blocs.push(h('div', { class: 'stats' }, stats));

  if (etat.periode !== 'jour') {
    const nJours = Math.min(31, Math.round((new Date(`${fin}T12:00:00`) - new Date(`${debut}T12:00:00`)) / 86400000));
    const jours = [];
    for (let i = nJours - 1; i >= 0; i--) {
      const j = decaler(fin, -1 - i);
      jours.push({ j, v: (b.jours.get(j) || {})[mon] || 0 });
    }
    blocs.push(h('div', { class: 'bloc' }, h('p', { class: 'bloc-titre', text: `Bénéfice net par jour (${sym(mon)})` }), graphe(jours, mon), tableJours(jours, mon)));
  }

  const pos = Object.values(etat.calcul.positions).filter((p) => Math.abs(p.q) >= 0.01);
  const plusieursCaisses = new Set(pos.map((p) => p.monnaie)).size > 1;
  blocs.push(
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Ta caisse maintenant' }),
      pos.length
        ? pos.map((p) =>
            h(
              'div',
              { class: 'reg-ligne' },
              h('p', {}, `${p.q < 0 ? 'Vendu à découvert' : 'En caisse'} (${sym(p.devise)}${plusieursCaisses ? ` contre ${sym(p.monnaie)}` : ''})`, h('small', {}, 'prix moyen ', mt(`${taux(p.p)} ${sym(p.monnaie)}`), ' · valeur ', mt(argent(Math.abs(p.q) * p.p, p.monnaie)))),
              mt(argent(Math.abs(p.q), p.devise), p.q < 0 ? 'moins' : ''),
            ),
          )
        : h('p', { class: 'note', text: 'Aucune devise en caisse.' }),
    ),
  );

  const devise = reglages.devise || 'EUR';
  const volumes = [];
  for (const c of etat.calcul.contacts.values()) {
    let qte = 0;
    for (const { memo, op } of c.ops) {
      const j = jourLocal(memo.date);
      if (j >= debut && j < fin && complete(op) && op.devise === devise && (!etat.paysBilan || memo.pays === etat.paysBilan)) qte += op.montant;
    }
    if (qte) volumes.push([c, qte]);
  }
  volumes.sort((a, b) => b[1] - a[1]);
  if (volumes.length)
    blocs.push(
      h(
        'div',
        { class: 'bloc' },
        h('p', { class: 'bloc-titre', text: `Avec qui tu travailles le plus (${sym(devise)})` }),
        h('table', { class: 'tableau' }, h('thead', {}, h('tr', {}, h('th', { text: 'Nom' }), h('th', { text: 'Volume' }))), h('tbody', {}, volumes.slice(0, 8).map(([c, q]) => h('tr', {}, h('td', { text: c.nom }), h('td', {}, mt(argent(q, devise))))))),
      ),
    );
  blocs.push(h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => exporterCsv(debut, fin, etat.paysBilan) }, icone('partage'), 'Exporter la période pour Excel')));
  remplir($('#bilan'), blocs);
}

const compact = (v) => {
  const a = Math.abs(v);
  const s = v < 0 ? '−' : '';
  if (a >= 1e6) return `${s}${nfx.format(Math.round(a / 1e5) / 10)} M`;
  if (a >= 1e3) return `${s}${nf0.format(Math.round(a / 1e3))} k`;
  return `${s}${nf0.format(a)}`;
};

/** Barres du bénéfice par jour : une seule série, vert au-dessus de zéro, rouge en dessous ; bulle au survol et au clavier. */
function graphe(jours, mon) {
  const W = 340;
  const H = 168;
  const haut = 14;
  const bas = 24;
  const gauche = 36;
  const vals = jours.map((x) => x.v);
  const max = Math.max(0, ...vals);
  const min = Math.min(0, ...vals);
  const conteneur = h('div', { class: 'graph' });
  if (max === 0 && min === 0) {
    conteneur.append(h('p', { class: 'note', text: 'Pas encore de bénéfice sur la période.' }));
    return conteneur;
  }
  const y = (v) => haut + ((max - v) / (max - min)) * (H - haut - bas);
  const slot = (W - gauche) / jours.length;
  const l = Math.max(3, Math.min(24, slot - 2));
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Bénéfice net par jour');
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };
  for (const v of [max, min].filter((v, i, t) => v !== 0 && t.indexOf(v) === i)) {
    svg.append(el('line', { x1: gauche, x2: W, y1: y(v), y2: y(v), stroke: 'var(--trait)', 'stroke-width': 1 }));
    const t = el('text', { x: 0, y: y(v) + 4 });
    t.textContent = compact(v);
    svg.append(t);
  }
  const t0 = el('text', { x: 0, y: y(0) + 4 });
  t0.textContent = '0';
  svg.append(t0);
  const bulle = h('div', { class: 'bulle', hidden: true });
  jours.forEach((d, i) => {
    const x = gauche + i * slot + (slot - l) / 2;
    const y0 = y(0);
    const y1 = y(d.v);
    const g = el('g', { class: 'barre-j', tabindex: '0', role: 'img', 'aria-label': `${jourCourt(`${d.j}T12:00:00`)} : ${signe(d.v, mon)}` });
    g.append(el('rect', { x: gauche + i * slot, y: haut, width: slot, height: H - haut - bas, fill: 'transparent' }));
    if (Math.abs(y1 - y0) >= 0.5) {
      const r = Math.min(4, l / 2, Math.abs(y1 - y0));
      const p =
        d.v > 0
          ? `M${x},${y0}V${y1 + r}Q${x},${y1} ${x + r},${y1}H${x + l - r}Q${x + l},${y1} ${x + l},${y1 + r}V${y0}Z`
          : `M${x},${y0}V${y1 - r}Q${x},${y1} ${x + r},${y1}H${x + l - r}Q${x + l},${y1} ${x + l},${y1 - r}V${y0}Z`;
      g.append(el('path', { d: p, fill: d.v > 0 ? 'var(--graphe-gain)' : 'var(--graphe-perte)', class: 'm' }));
    }
    const montrer = () => {
      bulle.replaceChildren(h('b', { text: signe(d.v, mon) }), jourTitre(d.j));
      bulle.hidden = false;
      bulle.style.left = `${((x + l / 2) / W) * 100}%`;
      bulle.style.top = `${(Math.min(y0, y1) / H) * 100}%`;
    };
    g.addEventListener('pointerenter', montrer);
    g.addEventListener('focus', montrer);
    g.addEventListener('pointerleave', () => (bulle.hidden = true));
    g.addEventListener('blur', () => (bulle.hidden = true));
    svg.append(g);
  });
  svg.append(el('line', { x1: gauche, x2: W, y1: y(0), y2: y(0), stroke: 'var(--trait-fort)', 'stroke-width': 1 }));
  for (const i of [...new Set([0, Math.floor((jours.length - 1) / 2), jours.length - 1])]) {
    const t = el('text', { x: gauche + i * slot + slot / 2, y: H - 6, 'text-anchor': 'middle' });
    t.textContent = jourCourt(`${jours[i].j}T12:00:00`);
    svg.append(t);
  }
  conteneur.append(svg, bulle);
  return conteneur;
}

function tableJours(jours, mon) {
  const avec = jours.filter((x) => x.v);
  if (!avec.length) return null;
  return h(
    'details',
    {},
    h('summary', { text: 'Voir le détail par jour' }),
    h('table', { class: 'tableau' }, h('thead', {}, h('tr', {}, h('th', { text: 'Jour' }), h('th', { text: 'Bénéfice net' }))), h('tbody', {}, [...avec].reverse().map((x) => h('tr', {}, h('td', { text: jourTitre(x.j) }), h('td', {}, mt(signe(x.v, mon), classeSigne(x.v))))))),
  );
}

/* =============================== réglages =============================== */

function interrupteur(actif, libelle, onclick) {
  return h('button', { class: 'interrupteur', type: 'button', role: 'switch', 'aria-checked': String(Boolean(actif)), 'aria-label': libelle, onclick });
}

function rendreReglages() {
  const nbAudios = etat.memos.filter((m) => m.source === 'voix').length;
  const compteMemos = `${pluriel(etat.memos.length, 'mémo')}, dont ${pluriel(nbAudios, 'vocal', 'vocaux')}`;
  const stockage = h('p', { class: 'note', text: `${compteMemos}.` });
  if (navigator.storage?.estimate)
    Promise.all([navigator.storage.estimate(), navigator.storage.persisted?.() ?? false]).then(([e, p]) => {
      stockage.textContent = `${compteMemos} · ${nfx.format(Math.round((e.usage || 0) / 1e5) / 10)} Mo utilisés · ${p ? 'protégés contre l’effacement automatique' : 'pas encore protégés contre l’effacement automatique'}.`;
    });

  const fichier = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: (e) => e.target.files[0] && restaurer(e.target.files[0]) });
  const exemples = etat.memos.some((m) => m.exemple);
  const blocs = [
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Comment ça marche' }),
      h('p', { class: 'note', text: 'Tout reste dans ce téléphone : rien n’est envoyé sur Internet.' }),
      h('p', { class: 'note', text: 'Mémo vocal : il est gardé, et la fiche s’ouvre pour que tu la remplisses en l’écoutant.' }),
      h('p', { class: 'note', text: 'Mémo écrit : la fiche se remplit toute seule (sommes, prix, noms), il reste à vérifier. Astuce : appuie sur le micro du clavier pour dicter au lieu d’écrire.' }),
    ),
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Sécurité' }),
      h('div', { class: 'reg-ligne' }, h('p', {}, 'Code à l’ouverture', h('small', { text: reglages.pin ? 'Demandé à l’ouverture et après 1 min en arrière-plan.' : 'Personne ne voit tes comptes si on prend ton téléphone.' })), interrupteur(reglages.pin, 'Code à l’ouverture', () => (reglages.pin ? retirerPin() : definirPin()))),
      h('div', { class: 'reg-ligne' }, h('p', {}, 'Montants masqués', h('small', { text: 'Pour montrer l’écran sans montrer les chiffres (aussi via l’œil en haut).' })), interrupteur(reglages.discret, 'Montants masqués', () => basculerDiscret())),
    ),
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Pays et monnaies' }),
      h('div', { class: 'reg-ligne' }, h('p', {}, 'Pays principal', h('small', { text: 'Ses totaux passent en premier. Le pays de chaque mémo se choisit en l’enregistrant.' })), (() => {
        const sel = optionsPays(h('select', { class: 'seul', 'aria-label': 'Pays principal', onchange: (e) => ((reglages.pays = e.target.value), garderReglages(), rendre()) }), reglages.pays);
        sel.style.width = 'auto';
        sel.style.maxWidth = '55%';
        return sel;
      })()),
      h('div', { class: 'reg-ligne' }, h('p', {}, 'Devise principale', h('small', { text: 'Celle qu’il achète et vend le plus.' })), (() => {
        const sel = h('select', { class: 'seul', 'aria-label': 'Devise principale', onchange: (e) => ((reglages.devise = e.target.value), garderReglages(), rendre()) }, Object.entries(MONNAIES).map(([d, x]) => h('option', { value: d, text: `${x.sym} · ${x.nom}` })));
        sel.value = reglages.devise || 'EUR';
        sel.style.width = 'auto';
        sel.style.maxWidth = '55%';
        return sel;
      })()),
      h('div', { class: 'reg-ligne' }, h('p', {}, 'Dinars aussi en millions', h('small', { text: '1 290 000 DA = 129 millions (en centimes).' })), interrupteur(reglages.millions, 'Dinars aussi en millions', () => ((reglages.millions = !reglages.millions), garderReglages(), rendre()))),
    ),
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Affichage' }),
      h('div', { class: 'reg-ligne' }, h('p', {}, 'Thème'), h('div', { class: 'seg', role: 'group', 'aria-label': 'Thème' }, [['auto', 'Auto'], ['light', 'Papier'], ['dark', 'Nuit']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(reglages.theme === v), text: t, onclick: () => ((reglages.theme = v), garderReglages(), appliquerTheme(), rendreReglages()) })))),
    ),
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Sauvegarde' }),
      h('p', { class: 'note', text: reglages.sauvegarde ? `Dernière sauvegarde : ${ilya(reglages.sauvegarde)} (${new Date(reglages.sauvegarde).toLocaleDateString('fr-FR')}).` : 'Aucune sauvegarde pour l’instant. Si le téléphone est perdu, tout est perdu : envoie-toi une copie (WhatsApp, Drive, e-mail).' }),
      h('div', { class: 'actions' },
        h('button', { class: 'btn btn-or', type: 'button', onclick: sauvegarder }, icone('partage'), 'Sauvegarder tout (avec l’audio)'),
        h('button', { class: 'btn', type: 'button', onclick: () => exporterCsv() }, 'Exporter pour Excel (CSV)'),
        h('button', { class: 'btn', type: 'button', onclick: () => fichier.click() }, icone('retour'), 'Restaurer une sauvegarde'),
        fichier,
      ),
      stockage,
    ),
    h(
      'div',
      { class: 'bloc' },
      h('p', { class: 'bloc-titre', text: 'Exemple' }),
      h('p', { class: 'note', text: 'Pour découvrir l’application avec quelques opérations inventées, clairement marquées « exemple ».' }),
      h('div', { class: 'actions' }, exemples ? h('button', { class: 'btn', type: 'button', onclick: retirerExemples }, 'Retirer l’exemple') : h('button', { class: 'btn', type: 'button', onclick: chargerExemples }, 'Charger l’exemple')),
    ),
    h('div', { class: 'bloc' }, h('p', { class: 'bloc-titre', text: 'Effacer' }), h('div', { class: 'actions' }, h('button', { class: 'btn btn-rouge', type: 'button', onclick: toutEffacer }, icone('poubelle'), 'Tout effacer de ce téléphone'))),
    h('p', { class: 'note', style: null, text: 'Sarraf · carnet vocal du cambiste · Bornz Studio' }),
  ];
  remplir($('#reglages'), blocs);
}

function appliquerTheme() {
  const t = reglages.theme || 'auto';
  document.documentElement.dataset.theme = t;
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) {
    m.dataset.defaut ||= m.content;
    m.content = t === 'dark' ? '#0b0f0d' : t === 'light' ? '#f2efe7' : m.dataset.defaut;
  }
}
function basculerDiscret() {
  reglages.discret = !reglages.discret;
  garderReglages();
  appliquerDiscret();
  if (etat.vue === 'reglages') rendreReglages();
}
function appliquerDiscret() {
  document.body.classList.toggle('discret', Boolean(reglages.discret));
  const b = $('#btn-discret');
  b.setAttribute('aria-pressed', String(Boolean(reglages.discret)));
  b.setAttribute('aria-label', reglages.discret ? 'Afficher les montants' : 'Masquer les montants');
  b.replaceChildren(icone(reglages.discret ? 'oeil-barre' : 'oeil'));
}

/* ------------------------------- sauvegarde ------------------------------- */

const enBase64 = (blob) =>
  new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1] || '');
    r.onerror = () => ko(r.error);
    r.readAsDataURL(blob);
  });
function depuisBase64(b64, type) {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type });
}

async function donnerFichier(nom, contenu, type) {
  const f = new File([contenu], nom, { type });
  try {
    if (navigator.canShare?.({ files: [f] })) {
      await navigator.share({ files: [f], title: nom });
      return true;
    }
  } catch (e) {
    if (e.name === 'AbortError') return false;
  }
  const url = URL.createObjectURL(f);
  const a = h('a', { href: url, download: nom });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return true;
}

async function sauvegarder() {
  toast('Préparation de la sauvegarde…');
  const audios = {};
  for (const m of etat.memos) {
    if (m.source !== 'voix') continue;
    const b = await db.lire('audios', m.id);
    if (b) audios[m.id] = { type: b.type, data: await enBase64(b) };
  }
  const contenu = JSON.stringify({ app: 'sarraf', version: 1, exporte: new Date().toISOString(), memos: etat.memos, paiements: etat.paiements, audios });
  const ok = await donnerFichier(`sarraf-sauvegarde-${aujourdhui()}.json`, contenu, 'application/json');
  if (ok) {
    reglages.sauvegarde = new Date().toISOString();
    garderReglages();
    rendre();
    toast('Sauvegarde prête ✓ Garde-la en lieu sûr.');
  }
}

async function restaurer(fichier) {
  let d;
  try {
    d = JSON.parse(await fichier.text());
  } catch {
    return toast('Fichier illisible.');
  }
  if (d?.app !== 'sarraf' || !Array.isArray(d.memos)) return toast('Ce n’est pas une sauvegarde de Sarraf.');
  if (!confirm(`Restaurer ${d.memos.length} mémo(s) et ${d.paiements?.length || 0} règlement(s) ? Les mémos déjà présents sont gardés.`)) return;
  for (const m of d.memos) if (m?.id) await db.ecrire('memos', m);
  for (const p of d.paiements || []) if (p?.id) await db.ecrire('paiements', p);
  for (const [id, a] of Object.entries(d.audios || {})) await db.ecrire('audios', depuisBase64(a.data, a.type), id);
  await charger();
  rendre();
  toast('Sauvegarde restaurée ✓');
}

function exporterCsv(debut, fin, pays = null) {
  const nb = (n) => (n == null || n === '' ? '' : String(Math.round(n * 100) / 100).replace('.', ','));
  const champ = (t) => `"${String(t ?? '').replace(/"/g, '""')}"`;
  const lignes = [['Date', 'Heure', 'Pays', 'Monnaie', 'Statut', 'Sens', 'Devise', 'Somme', 'Prix', 'Total', 'Par qui / à qui', 'Reste', 'Unité du reste', 'Bénéfice net du mémo', 'Frais', 'Échéance', 'Note', 'Mémo'].map(champ).join(';')];
  for (const m of [...etat.memos].filter(compte).sort(ordre)) {
    const j = jourLocal(m.date);
    if ((debut && j < debut) || (fin && j >= fin) || (pays && m.pays !== pays)) continue;
    const r = etat.calcul.memos.get(m.id);
    (m.operations || []).forEach((op, i) => {
      lignes.push(
        [
          champ(new Date(m.date).toLocaleDateString('fr-FR')),
          champ(heure(m.date)),
          champ(PAYS[m.pays]?.nom || m.pays),
          champ(m.monnaie),
          champ(STATUTS[m.statut]),
          champ(op.sens),
          champ(op.devise),
          nb(op.montant),
          nb(op.taux),
          nb(complete(op) ? op.montant * op.taux : ''),
          champ(op.contact),
          nb(op.reste),
          champ(op.reste ? (op.reste_unite === 'DEVISE' ? op.devise : m.monnaie) : ''),
          i === 0 ? nb(r?.profit) : '',
          i === 0 ? nb(m.frais) : '',
          champ(m.echeance),
          champ(m.note),
          i === 0 ? champ(m.transcription) : '""',
        ].join(';'),
      );
    });
  }
  donnerFichier(`sarraf-operations-${aujourdhui()}.csv`, `﻿${lignes.join('\r\n')}`, 'text/csv');
}

/* ------------------------------- exemple et effacement ------------------------------- */

async function chargerExemples() {
  const j = aujourdhui();
  const a = (jour, h_) => new Date(`${decaler(j, jour)}T${h_}:00`).toISOString();
  const op = (sens, montant, taux_, contact, extra = {}) => ({ id: db.nouvelId('o'), sens, devise: 'EUR', montant, taux: taux_, contact, reste: null, reste_unite: null, entendu: '', ...extra });
  const base = (date, texte, ops, extra = {}) => ({ id: db.nouvelId('m'), cree: date, date, pays: 'DZ', monnaie: 'DZD', statut: 'verifie', source: 'texte', duree: 0, ondes: [], transcription: texte, operations: ops, a_verifier: [], note: '', exemple: true, ...extra });
  const memos = [
    base(a(-2, '10:12'), 'Exemple : acheté 4 000 euros à Nadia à 257,50, tout payé.', [op('achat', 4000, 257.5, 'Nadia')]),
    base(a(-2, '16:40'), 'Exemple : vendu 2 500 euros à Rachid à 260, payé cash.', [op('vente', 2500, 260, 'Rachid')]),
    base(a(-1, '11:05'), 'Exemple : acheté 5 000 euros à Karim à 258 et revendu à Samir à 261. Samir me doit encore 30 millions, il paie demain.', [op('achat', 5000, 258, 'Karim'), op('vente', 5000, 261, 'Samir', { reste: 300000, reste_unite: 'MONNAIE' })], { echeance: j, frais: 2000, frais_note: 'samsar' }),
    base(a(-1, '17:20'), 'Exemple : à Tunis, vendu 1 500 euros à Sami à 3,42 dinars tunisiens, payé.', [op('vente', 1500, 3.42, 'Sami')], { pays: 'TN', monnaie: 'TND' }),
    base(a(-1, '17:45'), 'Exemple : à Tunis, acheté 1 500 euros à Walid à 3,38 dinars tunisiens.', [op('achat', 1500, 3.38, 'Walid')], { pays: 'TN', monnaie: 'TND' }),
    base(a(0, '09:30'), 'Exemple : vendu 1 000 euros à Hocine à 261,50.', [op('vente', 1000, 261.5, 'Hocine')]),
    base(a(0, '12:15'), 'Exemple : acheté 3 000 euros à Karim à 258,50, il reste 1 000 euros qu’il me donne ce soir.', [op('achat', 3000, 258.5, 'Karim', { reste: 1000, reste_unite: 'DEVISE' })], { statut: 'a_verifier', a_verifier: ['Exemple de doute : « ce soir » — échéance non datée.'] }),
  ];
  for (const m of memos) await db.ecrire('memos', m);
  await charger();
  rendre();
  toast('Exemple chargé : tout est marqué « exemple ».');
  location.hash = '#journal';
}
async function retirerExemples() {
  for (const m of etat.memos.filter((x) => x.exemple)) await supprimerMemo(m.id);
  for (const p of etat.paiements.filter((x) => x.exemple)) await db.effacer('paiements', p.id);
  await charger();
  rendre();
  toast('Exemple retiré.');
}
async function toutEffacer() {
  const mot = prompt('Tout effacer : mémos, audios, fiches et règlements. Écris EFFACER pour confirmer.');
  if (mot?.trim().toUpperCase() !== 'EFFACER') return;
  arreterLecture();
  await Promise.all(['memos', 'audios', 'paiements'].map(db.vider));
  await charger();
  rendre();
  toast('Tout est effacé.');
}

/* =============================== verrou =============================== */

const verrou = { saisie: '', mode: 'ouvrir', premier: '', essais: 0, bloqueJusqua: 0, cache: 0 };

async function empreinte(pin) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${reglages.sel}:${pin}`));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
function dessinerPave() {
  const touches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', verrou.mode === 'ouvrir' ? '' : 'Annuler', '0', '⌫'];
  $('#pave').replaceChildren(
    ...touches.map((t) =>
      h('button', {
        type: 'button',
        class: t === '' ? 'vide' : /\d/.test(t) ? '' : 'effacer',
        text: t,
        'aria-label': t === '⌫' ? 'Effacer' : t || null,
        onclick: () => touche(t),
      }),
    ),
  );
  dessinerPoints();
}
function dessinerPoints(faux = false) {
  const p = $('#verrou-points');
  p.replaceChildren(...[0, 1, 2, 3].map((i) => h('i', { class: i < verrou.saisie.length ? 'plein' : '' })));
  p.classList.toggle('faux', faux);
}
async function touche(t) {
  if (t === '⌫') verrou.saisie = verrou.saisie.slice(0, -1);
  else if (t === 'Annuler') return fermerVerrou();
  else if (/\d/.test(t) && verrou.saisie.length < 4) verrou.saisie += t;
  dessinerPoints();
  if (verrou.saisie.length < 4) return;
  const pin = verrou.saisie;
  verrou.saisie = '';
  if (verrou.mode === 'ouvrir') {
    if (Date.now() < verrou.bloqueJusqua) return ($('#verrou-titre').textContent = 'Trop d’essais : attends 30 secondes'), dessinerPoints(true);
    if ((await empreinte(pin)) === reglages.pin) {
      verrou.essais = 0;
      return fermerVerrou();
    }
    verrou.essais += 1;
    if (verrou.essais >= 5) (verrou.bloqueJusqua = Date.now() + 30000), (verrou.essais = 0);
    $('#verrou-titre').textContent = 'Code faux';
    return dessinerPoints(true);
  }
  if (verrou.mode === 'definir') {
    verrou.premier = pin;
    verrou.mode = 'confirmer';
    $('#verrou-titre').textContent = 'Retape le même code';
    return dessinerPave();
  }
  if (pin !== verrou.premier) {
    verrou.mode = 'definir';
    $('#verrou-titre').textContent = 'Pas le même code : recommence';
    return dessinerPave();
  }
  reglages.sel = crypto.getRandomValues(new Uint32Array(2)).join('-');
  reglages.pin = await empreinte(pin);
  // Code de secours : le seul moyen de retirer le verrou si le code est oublié (rien n'est sur un serveur)
  const lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const secours = [...crypto.getRandomValues(new Uint8Array(8))].map((x, i) => (i === 4 ? '-' : '') + lettres[x % lettres.length]).join('');
  reglages.secours = await empreinte(secours.replace('-', ''));
  garderReglages();
  fermerVerrou();
  alert(`Code activé.\n\nCode de secours (à noter sur papier, il ne sera plus affiché) :\n\n${secours}\n\nIl sert à retirer le verrou si tu oublies ton code.`);
  rendreReglages();
}
function ouvrirVerrou(mode = 'ouvrir') {
  verrou.mode = mode;
  verrou.saisie = '';
  $('#verrou-titre').textContent = mode === 'ouvrir' ? 'Code de Sarraf' : 'Choisis un code à 4 chiffres';
  $('#verrou-oubli').hidden = mode !== 'ouvrir';
  $('#verrou').hidden = false;
  dessinerPave();
}
function fermerVerrou() {
  $('#verrou').hidden = true;
}
const definirPin = () => ouvrirVerrou('definir');
function retirerPin() {
  if (!confirm('Retirer le code à l’ouverture ?')) return;
  reglages.pin = reglages.secours = reglages.sel = null;
  garderReglages();
  rendreReglages();
}
$('#verrou-oubli').addEventListener('click', async () => {
  if (!reglages.secours) return toast('Pas de code de secours sur ce téléphone.', 4000);
  const c = prompt('Code de secours (noté à l’activation du verrou) :');
  if (c == null) return;
  if ((await empreinte(c.replace(/[^a-z0-9]/gi, '').toUpperCase())) !== reglages.secours) return toast('Ce n’est pas le code de secours.');
  reglages.pin = reglages.secours = reglages.sel = null;
  garderReglages();
  fermerVerrou();
  toast('Verrou retiré. Tu peux choisir un nouveau code dans Réglages.', 4000);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') verrou.cache = Date.now();
  else {
    if (reglages.pin && verrou.cache && Date.now() - verrou.cache > 60000) ouvrirVerrou('ouvrir');
  }
});

/* =============================== démarrage =============================== */

async function demarrer() {
  appliquerTheme();
  appliquerDiscret();
  if (reglages.pin) ouvrirVerrou('ouvrir');
  window.addEventListener('hashchange', route);
  $('#btn-micro').addEventListener('click', () => ouvrirEnreg());
  $('#btn-discret').addEventListener('click', basculerDiscret);
  // Pays du mémo : gardé pour les suivants (il change rarement de pays dans la journée)
  $('#enreg-pays').addEventListener('change', (e) => {
    reglages.paysMemo = e.target.value;
    garderReglages();
  });
  $('#enreg-envoyer').addEventListener('click', envoyerMemo);
  $('#enreg-annuler').addEventListener('click', annulerEnreg);
  $('#enreg-clavier').addEventListener('click', () => {
    if (enr.rec && (Date.now() - enr.debut) / 1000 > 4 && !confirm('Passer à l’écrit ? L’enregistrement en cours sera abandonné.')) return;
    modeTexte('');
  });
  try {
    await charger();
  } catch {
    toast('Stockage du téléphone indisponible (navigation privée ?) : rien ne sera gardé.', 6000);
  }
  route();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (new URLSearchParams(location.search).has('memo')) ouvrirEnreg();
  reprendreAnalyses();
}

demarrer();
