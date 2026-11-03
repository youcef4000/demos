// Page d'explication : rail animé, matrice des sources, labo « si Tefcold change un stock », check-list.
import { PRODUITS } from './app/data/catalogue.js';
import { SOURCES, CHAMPS_SOURCE } from './app/data/sources.js';
import { REGLES_DEFAUT } from './app/data/regles.js';
import { preparerEvenement } from './app/ui/simulation.js';
import { accrocher, reduitMouvement, memoire, echapper, heure } from './app/ui/tickets.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Rail de l'accroche ---------- */
const rail = $('#rail-hero');
const stations = $$('#chaine .station');
const produits = structuredClone(PRODUITS);

function allumer(i) {
  stations.forEach((s, j) => s.classList.toggle('actif', j === i));
}

function cycle(anime = true) {
  const evt = preparerEvenement(produits, REGLES_DEFAUT);
  Object.assign(evt.produit, evt.changement);
  if (!anime) {
    accrocher(rail, evt, { anime: false, max: 7 });
    return Promise.resolve();
  }
  const etapes = evt.etat === 'ok' ? [0, 1, 2, 3] : [0, 1];
  return etapes.reduce((p, i) => p.then(() => new Promise((r) => { allumer(i); setTimeout(r, 520); })), Promise.resolve())
    .then(() => {
      accrocher(rail, evt, { max: 7 });
      setTimeout(() => allumer(-1), 700);
    });
}

if (rail) {
  if (reduitMouvement()) {
    for (let i = 0; i < 5; i++) cycle(false);
  } else {
    for (let i = 0; i < 3; i++) cycle(false);
    let enPause = false;
    document.addEventListener('visibilitychange', () => { enPause = document.hidden; });
    const boucle = () => {
      if (!enPause) cycle().then(() => setTimeout(boucle, 2400));
      else setTimeout(boucle, 1000);
    };
    setTimeout(boucle, 1200);
  }
}

/* ---------- Matrice des sources ---------- */
const SYMBOLE = { oui: ['✓', 'm-oui', 'vérifié'], annonce: ['◐', 'm-annonce', 'annoncé, à confirmer'], non: ['✕', 'm-non', 'absent'], inconnu: ['?', 'm-inconnu', 'à demander'] };
const matrice = $('#matrice');
if (matrice) {
  const tete = `<thead><tr><th scope="col"><span class="sr">Fournisseur</span></th>${CHAMPS_SOURCE.map(([, l]) => `<th scope="col">${l}</th>`).join('')}</tr></thead>`;
  const corps = SOURCES.map((s) => `<tr><th scope="row">${echapper(s.nom)}<small>${echapper(s.mode)}</small></th>${CHAMPS_SOURCE.map(([k, l]) => {
    const [sym, cls, txt] = SYMBOLE[s.champs[k]] || SYMBOLE.inconnu;
    const note = s.notes?.[k] ? ` — ${s.notes[k]}` : '';
    return `<td><span class="m ${cls}" title="${echapper(l + ' : ' + txt + note)}" aria-label="${echapper(l + ' : ' + txt + note)}">${sym}</span></td>`;
  }).join('')}</tr>`).join('');
  matrice.innerHTML = tete + `<tbody>${corps}</tbody>`;
}

/* ---------- Labo ---------- */
const trace = $('#labo-trace');
const base = produits.find((p) => p.id === 'uf400vs-33866') || produits[0];
const verrouille = produits.find((p) => p.verrouille && p.fournisseur === 'tefcold') || produits.find((p) => p.verrouille);

function ligne(t, titre, texte, badge) {
  return `<li><span class="heure">${t}</span><div class="quoi"><strong>${titre}</strong><span>${texte}</span>${badge ? `<div class="verdict">${badge}</div>` : ''}</div></li>`;
}

function jouer(cas) {
  const p = cas === 'verrou' ? { ...PRODUITS.find((x) => x.id === verrouille.id) } : { ...PRODUITS.find((x) => x.id === base.id), stock: 12 };
  const evt = preparerEvenement([p], REGLES_DEFAUT, { cas: cas === 'verrou' ? 'hausse' : cas, produit: p, nouveauStock: cas === 'stock' ? 3 : undefined });
  const t0 = new Date();
  const h = (s) => heure(new Date(t0.getTime() + s * 1000));
  const nom = evt.fournisseur.split(' · ')[0];
  const items = [];
  const quoi = evt.type === 'Prix' ? `prix d'achat ${evt.lignes[0][1]}` : `stock ${evt.lignes[0][1]}`;
  items.push(ligne(h(0), `${nom} : ${echapper(evt.titre)}`, `Le fournisseur annonce : ${echapper(quoi)}.`));
  items.push(ligne(h(2), 'Le Passe compare', `Le moteur retrouve le produit (référence ${echapper(p.ref.replace(/\.0$/, ''))}) et calcule ce qui change.`));
  if (evt.type === 'Prix') {
    items.push(ligne(h(3), 'Vos règles', `Règle « ${echapper(evt.regle.niveau)} » : coefficient ${evt.regle.valeur}, arrondi à ,90. Prix calculé : ${echapper(evt.lignes[1][1])}.`));
  }
  const badge = evt.etat === 'ok' ? '<span class="badge b-ok">Appliqué automatiquement</span>' : evt.etat === 'passe' ? '<span class="badge b-chaud">Envoyé au passe pour validation</span>' : '<span class="badge b-info">Prix verrouillé : vente inchangée</span>';
  items.push(ligne(h(4), 'Décision', echapper(evt.explication), badge));
  if (evt.etat === 'ok') {
    items.push(ligne(h(6), 'Shopify', evt.type === 'Prix' ? 'Prix de vente mis à jour sur maxigastro.fr.' : `Inventaire mis à ${evt.changement.stock}.`));
    items.push(ligne(h(9), 'METRO', evt.changement.stock === 0 ? 'Offre suspendue : pas de vente impossible.' : evt.type === 'Prix' ? 'Prix METRO recalculé, jamais sous le plancher.' : `Stock METRO mis à ${evt.changement.stock}.`));
  } else if (evt.etat === 'passe') {
    items.push(ligne(h(5), 'Vous', 'Une notification arrive (mail ou WhatsApp). D\'un clic : « Envoyer » ou « Renvoyer en cuisine ».'));
  }
  trace.innerHTML = items.join('');
  $$('.labo-choix .btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cas === cas)));
}

if (trace) {
  trace.innerHTML = '<li class="labo-vide">Choisissez ce qui arrive chez le fournisseur.</li>';
  $$('.labo-choix .btn').forEach((b) => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => jouer(b.dataset.cas));
  });
}

/* ---------- Check-list ---------- */
const coches = memoire.lire('passe-checklist', {});
$$('#checklist input').forEach((c) => {
  c.checked = Boolean(coches[c.dataset.cle]);
  c.addEventListener('change', () => {
    coches[c.dataset.cle] = c.checked;
    memoire.ecrire('passe-checklist', coches);
  });
});
