// Le Passe — tour de contrôle (démo). Toute la logique métier vient de ./noyau/ (partagé avec le moteur Node).
import { PRODUITS } from './data/catalogue.js';
import { SOURCES, CHAMPS_SOURCE, MARKETPLACES } from './data/sources.js';
import { REGLES_DEFAUT, FOURNISSEURS_NOMS, FAMILLES, ARRONDIS } from './data/regles.js';
import { EXEMPLE } from './data/atelier.js';
import { decisionPrix, prixPlancher, margeNette, strategieBuyBox, arrondir } from './noyau/prix.js';
import { lireXlsx, choisirTableau, estXlsx } from './noyau/xlsx.js';
import { CUISTANCE_EN_LIGNE } from './data/cuistance-en-ligne.js';
import { lireCSV, detecterColonnes, lignesVersOffres, CHAMPS } from './noyau/csv.js';
import { eanValide, normaliserRef } from './noyau/rapprochement.js';
import { evaluerFiche, bilanCatalogue } from './noyau/qualite.js';
import { CONSIGNE_FICHE, SCHEMA_FICHE, messageFiche, chiffresOrphelins, controlerLongueurs } from './noyau/prompt-fiche.js';
import { preparerEvenement, prixParRegle } from './ui/simulation.js';
import { accrocher, euro, heure, echapper as e, memoire, reduitMouvement } from './ui/tickets.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pct = (x, d = 1) => `${(x * 100).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })} %`;
const nb = (n) => n.toLocaleString('fr-FR');
const coefFr = (c) => c.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const vue = $('#vue');
const ARRONDI_COURT = { x90: 'arrondi à ,90', x9: 'arrondi à 9', euro: "arrondi à l'euro", centime: 'au centime', aucun: 'sans arrondi' };

/* =========================================================
   État
   ========================================================= */
function fusionRegles(base, sauvees) {
  if (!sauvees) return structuredClone(base);
  return {
    ...structuredClone(base),
    ...sauvees,
    fournisseurs: { ...base.fournisseurs, ...(sauvees.fournisseurs || {}) },
    categories: { ...(sauvees.categories || base.categories) },
    exclusions: { ...base.exclusions, ...(sauvees.exclusions || {}) },
  };
}

const etat = {
  produits: PRODUITS.map((p) => ({ ...p, statut: 'publie' })),
  regles: fusionRegles(REGLES_DEFAUT, memoire.lire('passe-regles', null)),
  journal: [],
  file: [],
  auto: false,
  csv: null,
  atelier: 'fiche',
};
const produit = (id) => etat.produits.find((p) => p.id === id);
let routeActuelle = '';
let minuterie = null;

function sauverRegles() {
  memoire.ecrire('passe-regles', etat.regles);
}

function proposerCategorie(p) {
  const base = p.titre.split(/\s+[-—–]\s+/)[0];
  const mots = [];
  for (const m of base.split(/\s+/)) {
    if (/\d/.test(m) || mots.length >= 5) break;
    mots.push(m);
  }
  const type = mots.join(' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
  return `${FAMILLES[p.famille] || 'Matériel'} > ${type || 'À classer'}`;
}

/* ---------- Journal + file du passe ---------- */
let idEvt = 0;
function noter(evt, { appliquer = true } = {}) {
  evt.id = ++idEvt;
  evt.date = evt.date || new Date();
  if (appliquer && evt.produit && evt.changement) Object.assign(evt.produit, evt.changement);
  if (evt.etat === 'passe' && evt.produit && evt.proposition) {
    ajouterAuPasse({
      type: 'prix',
      produitId: evt.produit.id,
      titre: evt.titre,
      avant: evt.produit.prixVenteHT,
      apres: evt.proposition.prixVenteHT,
      raison: evt.decision?.raison || 'variation au-delà du seuil',
    });
  }
  etat.journal.unshift(evt);
  majCompteur();
  if (routeActuelle === 'tableau') {
    const rail = $('#rail');
    if (rail) accrocher(rail, evt, { max: 9, anime: !reduitMouvement() });
    majTuiles();
  }
  return evt;
}

let idFile = 0;
function ajouterAuPasse(item) {
  item.id = ++idFile;
  item.date = new Date();
  item.statut = 'attente';
  etat.file.unshift(item);
  majCompteur();
}
const enAttente = () => etat.file.filter((i) => i.statut === 'attente');
function majCompteur() {
  const c = $('#compteur-passe');
  const n = enAttente().length;
  c.textContent = n;
  c.dataset.zero = String(n === 0);
}

/* ---------- Données de départ ---------- */
(function amorcer() {
  ajouterAuPasse({ type: 'fiche', produitId: 'ba30s-3-15844', titre: EXEMPLE.fiche.titre, raison: 'Nouvelle fiche rédigée par Claude : 4 mots-clés intégrés, 2 écartés, 0 chiffre non sourcé.' });
  etat.produits.filter((p) => !p.ean && eanValide(p.ref)).forEach((p) => {
    ajouterAuPasse({ type: 'ean', produitId: p.id, titre: p.titre, apres: p.ref, raison: `La référence ${p.ref} est un EAN-13 valide (clé de contrôle vérifiée). On le copie dans le champ code-barres.` });
  });
  const sansCategorie = etat.produits.filter((p) => p.categorie === p.ref);
  if (sansCategorie.length) {
    ajouterAuPasse({ type: 'categories', ids: sansCategorie.map((p) => p.id), titre: `${sansCategorie.length} fiches ont leur référence comme type de produit`, raison: 'Claude propose une vraie catégorie à partir du titre. Sur la boutique entière, 1 456 fiches sont concernées.' });
  }
  const combi = etat.produits.find((p) => p.id.startsWith('table-refrigeree-6-drawers'));
  if (combi) noter(preparerEvenement(etat.produits, etat.regles, { cas: 'grosse', produit: combi }));
  for (let i = 0; i < 6; i++) noter(preparerEvenement(etat.produits, etat.regles));
})();

/* =========================================================
   Routeur
   ========================================================= */
const ROUTES = { '': 'tableau', fournisseurs: 'fournisseurs', catalogue: 'catalogue', passe: 'passe', regles: 'regles', marketplaces: 'marketplaces', journal: 'journal' };
const TITRES = { tableau: 'Service', fournisseurs: 'Fournisseurs', catalogue: 'Catalogue', passe: 'Au passe', regles: 'Règles', marketplaces: 'Marketplaces', journal: 'Journal' };

function router() {
  const cle = location.hash.replace(/^#\/?/, '').split('?')[0];
  const nom = ROUTES[cle] || 'tableau';
  routeActuelle = nom;
  clearInterval(minuterie);
  etat.auto = false;
  $$('.nav a').forEach((a) => (a.dataset.vue === nom ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.title = `${TITRES[nom]} — Le Passe · Maxi Gastro`;
  VUES[nom]();
  vue.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', router);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('visible'), 2600);
}

/* =========================================================
   Calculs partagés
   ========================================================= */
function marge(p) {
  return p.prixVenteHT > 0 ? (p.prixVenteHT - p.prixAchatHT) / p.prixVenteHT : 0;
}
function eligible(p, exige) {
  const tests = {
    ean: () => eanValide(p.ean),
    stock: () => p.stock > 0,
    poids: () => p.poidsKg > 0,
    categorie: () => Boolean(p.categorie) && p.categorie !== p.ref,
  };
  return exige.filter((x) => !tests[x]());
}
const LIBELLE_EXIGE = { ean: 'EAN', stock: 'stock', poids: 'poids', categorie: 'catégorie' };

/* =========================================================
   Vue : Service (tableau de bord)
   ========================================================= */
function tuilesHTML() {
  const ps = etat.produits;
  const ruptures = ps.filter((p) => p.stock === 0).length;
  const margeMoy = ps.reduce((s, p) => s + marge(p), 0) / ps.length;
  const metro = MARKETPLACES[0];
  const publiables = ps.filter((p) => eligible(p, metro.exige).length === 0).length;
  const qualite = bilanCatalogue(ps).moyenne;
  return `
    <div class="tuile"><div class="tuile-label">Références suivies</div><div class="tuile-valeur">${ps.length}</div><div class="tuile-pied">démo · 2 131 en boutique</div></div>
    <div class="tuile"><div class="tuile-label">Mises à jour</div><div class="tuile-valeur">${etat.journal.length}</div><div class="tuile-pied">depuis l'ouverture</div></div>
    <div class="tuile chaude"><div class="tuile-label">Au passe</div><div class="tuile-valeur">${enAttente().length}</div><div class="tuile-pied">décisions pour vous</div></div>
    <div class="tuile"><div class="tuile-label">Ruptures</div><div class="tuile-valeur">${ruptures}</div><div class="tuile-pied">masquées sur METRO</div></div>
    <div class="tuile"><div class="tuile-label">Marge moyenne</div><div class="tuile-valeur">${pct(margeMoy, 1)}</div><div class="tuile-pied">sur prix d'achat simulés</div></div>
    <div class="tuile ${publiables ? '' : 'alerte'}"><div class="tuile-label">Publiables METRO</div><div class="tuile-valeur">${publiables}<small style="font-size:.9rem;color:var(--encre-3)"> / ${ps.length}</small></div><div class="tuile-pied">${publiables ? 'EAN + stock + poids OK' : 'bloqué : pas d\'EAN'}</div></div>
    <div class="tuile"><div class="tuile-label">Fiches complètes</div><div class="tuile-valeur">${qualite} %</div><div class="tuile-pied">score qualité moyen</div></div>`;
}
function majTuiles() {
  const t = $('#tuiles');
  if (t) t.innerHTML = tuilesHTML();
  const b = $('#blocages');
  if (b) b.innerHTML = blocagesHTML();
}
function blocagesHTML() {
  const total = etat.produits.length;
  const { manques } = bilanCatalogue(etat.produits);
  return manques.filter((m) => m.nb > 0).slice(0, 7).map((m) => {
    const r = m.nb / total;
    return `<div class="barre-ligne ${r > 0.6 ? '' : r > 0.3 ? 'moyen' : 'leger'}"><span>${e(m.label)}</span><span class="compte">${m.nb} / ${total}</span><div class="piste" aria-hidden="true"><div class="rempli" style="width:${Math.round(r * 100)}%"></div></div></div>`;
  }).join('');
}

function vueTableau() {
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Le service en direct</h1><p>Chaque bon est un changement venu d'un fournisseur, décidé par vos règles, puis envoyé à Shopify et METRO. Déclenchez-en un, ou laissez tourner.</p></div></div>
    <div class="tuiles" id="tuiles">${tuilesHTML()}</div>
    <div class="grille grille-2">
      <section class="panneau" aria-labelledby="t-poste">
        <h2 id="t-poste">Le poste</h2>
        <p class="sous">Le trajet d'une mise à jour, étape par étape.</p>
        <ol class="poste-stations" id="stations">
          <li>Fournisseur<small>API · XML · CSV</small></li>
          <li>Le Passe<small>rapprochement</small></li>
          <li>Règles<small>marge · verrou</small></li>
          <li>Shopify<small>maxigastro.fr</small></li>
          <li>METRO<small>stock · prix</small></li>
        </ol>
        <div class="actions">
          <button class="btn btn-petit" data-sim="stock">Tefcold : un stock bouge</button>
          <button class="btn btn-petit" data-sim="grosse">Combisteel : achat +9 %</button>
          <button class="btn btn-petit" data-sim="rupture">Rupture fournisseur</button>
          <a class="btn btn-petit" href="#/fournisseurs">Cuistance : le CSV arrive</a>
          <button class="btn btn-petit btn-chaud" id="auto" aria-pressed="false">▶ Laisser tourner</button>
        </div>
        <p class="explication" id="explication" aria-live="polite"></p>
        <div class="rail-cadre inox"><div class="rail" id="rail" aria-label="Derniers bons"></div></div>
      </section>
      <div class="grille">
        <section class="panneau" aria-labelledby="t-bloc">
          <h2 id="t-bloc">Ce qui bloque la publication</h2>
          <p class="sous">Champs manquants sur les ${etat.produits.length} fiches de la démo (vraies données de la boutique).</p>
          <div class="barres" id="blocages">${blocagesHTML()}</div>
        </section>
        <section class="panneau" aria-labelledby="t-passe">
          <h2 id="t-passe">À trancher au passe <span class="badge b-chaud sans-point">${enAttente().length}</span></h2>
          <div class="file" id="apercu-passe">${enAttente().slice(0, 3).map(itemPasseHTML).join('') || '<p class="vide">Rien en attente.</p>'}</div>
          <p style="margin:12px 0 0"><a class="btn btn-petit" href="#/passe">Ouvrir le passe</a></p>
        </section>
      </div>
    </div>`;
  const rail = $('#rail');
  etat.journal.slice(0, 9).reverse().forEach((evt) => accrocher(rail, evt, { anime: false, max: 9 }));
  brancherPasse($('#apercu-passe'));
  $$('[data-sim]').forEach((b) => b.addEventListener('click', () => {
    const cas = b.dataset.sim;
    const filtre = cas === 'stock' ? (p) => p.fournisseur === 'tefcold' : cas === 'grosse' ? (p) => p.fournisseur === 'combisteel' && !p.verrouille : () => true;
    const candidats = etat.produits.filter(filtre);
    const p = candidats[Math.floor(Math.random() * candidats.length)];
    lancer(preparerEvenement(etat.produits, etat.regles, { cas, produit: p }));
  }));
  $('#auto').addEventListener('click', (ev) => {
    etat.auto = !etat.auto;
    ev.currentTarget.setAttribute('aria-pressed', String(etat.auto));
    ev.currentTarget.textContent = etat.auto ? '❚❚ Pause' : '▶ Laisser tourner';
    clearInterval(minuterie);
    if (etat.auto) {
      lancer(preparerEvenement(etat.produits, etat.regles));
      minuterie = setInterval(() => !document.hidden && lancer(preparerEvenement(etat.produits, etat.regles)), 4200);
    }
  });
}

let enCours = false;
function lancer(evt) {
  if (enCours) return;
  enCours = true;
  const lis = $$('#stations li');
  const stop = evt.etat === 'ok' ? 4 : 2;
  const pas = reduitMouvement() ? 0 : 380;
  let i = 0;
  const avancer = () => {
    lis.forEach((li, j) => {
      li.classList.toggle('actif', j === i);
      li.classList.remove('arret');
    });
    if (i < stop) {
      i++;
      setTimeout(avancer, pas);
    } else {
      if (evt.etat !== 'ok') lis[stop].classList.replace('actif', 'arret');
      noter(evt);
      const x = $('#explication');
      if (x) x.textContent = `${evt.titre} — ${evt.explication}`;
      const ap = $('#apercu-passe');
      if (ap) {
        ap.innerHTML = enAttente().slice(0, 3).map(itemPasseHTML).join('') || '<p class="vide">Rien en attente.</p>';
        brancherPasse(ap);
        const badge = $('#t-passe .badge');
        if (badge) badge.textContent = enAttente().length;
      }
      setTimeout(() => {
        lis.forEach((li) => li.classList.remove('actif', 'arret'));
        enCours = false;
      }, pas * 2 || 10);
    }
  };
  avancer();
}

/* =========================================================
   Vue : Fournisseurs + import CSV
   ========================================================= */
const ETAT_SOURCE = { 'attente-cle': ['b-attente', 'En attente de la clé'], 'a-demander': ['b-neutre', 'Documentation à obtenir'], pret: ['b-ok', 'Prêt'] };
const PUCE = { oui: 'oui', annonce: 'annonce', non: 'non', inconnu: '' };

function vueFournisseurs() {
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Fournisseurs</h1><p>Un connecteur par fournisseur, qui traduit ses données vers un format unique. En vert, ce qui est vérifié dans la documentation ; en jaune, annoncé ; en gris, à demander.</p></div></div>
    <div class="sources">${SOURCES.map((s) => {
      const [cls, txt] = ETAT_SOURCE[s.statut];
      return `<article class="panneau source-carte">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><h3>${e(s.nom)}</h3><span class="badge ${cls}">${txt}</span></div>
        <p class="mode">${e(s.mode)} · ${e(s.detail)}</p>
        <div class="puces">${CHAMPS_SOURCE.map(([k, l]) => `<span class="puce ${PUCE[s.champs[k]]}" title="${e(s.notes?.[k] || '')}">${e(l)}</span>`).join('')}</div>
        <dl><dt>Rythme</dt><dd>${e(s.rythme)}</dd><dt>Prochaine étape</dt><dd>${e(s.statutTexte)}</dd></dl>
        ${Object.values(s.notes || {}).length ? `<p class="petit">${Object.values(s.notes).map(e).join(' ')}</p>` : ''}
        ${s.endpoints ? `<details class="endpoints"><summary>Points d'accès vérifiés (${s.endpoints.length})</summary><ul>${s.endpoints.map(([v, p, d]) => `<li><span class="verbe ${v === 'POST' ? 'post' : ''}">${v}</span><code>${e(p)}</code><br><span class="petit">${e(d)}</span></li>`).join('')}</ul></details>` : ''}
      </article>`;
    }).join('')}</div>

    <section class="panneau" style="margin-top:14px" aria-labelledby="t-csv">
      <h2 id="t-csv">Lecteur de fichiers — Cuistance et tous les fournisseurs sans API</h2>
      <p class="sous">Le fichier est lu dans votre navigateur, rien n'est envoyé. En production, la même lecture se déclenche quand le mail de Cuistance arrive.</p>
      <div class="depot" id="depot">
        <strong>Glissez ici un fichier Cuistance : stock (.csv) ou liste de prix (.xlsx)</strong>
        <span class="petit">Excel ou CSV — feuille, ligne d'en-tête, séparateur et encodage devinés</span>
        <div class="actions" style="justify-content:center">
          <label class="btn btn-petit">Choisir un fichier<input type="file" id="fichier" accept=".csv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="sr"></label>
          <button class="btn btn-petit btn-chaud" id="exemple-csv">Essayer avec un fichier d'exemple</button>
        </div>
        <span class="petit">Le fichier d'exemple est fabriqué pour la démo (vraies références Cuistance, quantités et prix inventés). Votre propre fichier est lu dans ce navigateur : rien n'est envoyé ni enregistré.</span>
      </div>
      <div id="resultat-csv"></div>
    </section>`;

  const depot = $('#depot');
  ['dragenter', 'dragover'].forEach((t) => depot.addEventListener(t, (ev) => { ev.preventDefault(); depot.classList.add('survol'); }));
  ['dragleave', 'drop'].forEach((t) => depot.addEventListener(t, (ev) => { ev.preventDefault(); depot.classList.remove('survol'); }));
  depot.addEventListener('drop', (ev) => ev.dataTransfer.files[0] && lireFichier(ev.dataTransfer.files[0]));
  $('#fichier').addEventListener('change', (ev) => ev.target.files[0] && lireFichier(ev.target.files[0]));
  $('#exemple-csv').addEventListener('click', async () => {
    try {
      const r = await fetch('./data/exemple-cuistance.csv');
      analyserCSV(decoder(await r.arrayBuffer()), 'exemple-cuistance.csv');
    } catch {
      toast('Impossible de charger le fichier d\'exemple.');
    }
  });
  if (etat.csv) afficherCSV();
}

function decoder(buffer) {
  try {
    return { texte: new TextDecoder('utf-8', { fatal: true }).decode(buffer), encodage: 'UTF-8' };
  } catch {
    return { texte: new TextDecoder('windows-1252').decode(buffer), encodage: 'Windows-1252 (export Excel)' };
  }
}
const inflateNavigateur = async (u8) => new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());

async function lireFichier(f) {
  if (f.size > 15 * 1024 * 1024) return toast('Fichier trop lourd pour la démo (15 Mo maximum).');
  const octets = new Uint8Array(await f.arrayBuffer());
  if (!estXlsx(octets)) return analyserCSV(decoder(octets), f.name);
  try {
    const t = choisirTableau(await lireXlsx(octets, inflateNavigateur));
    etat.csv = { nom: f.name, encodage: `Excel · feuille « ${t.feuille} », en-tête ligne ${t.ligneEntete}`, lu: { separateur: null, entetes: t.entetes, lignes: t.lignes }, mapping: t.mapping, confiance: t.confiance };
    afficherCSV();
  } catch (err) {
    toast(`Classeur illisible : ${err.message}`);
  }
}

function analyserCSV({ texte, encodage }, nom) {
  const lu = lireCSV(texte);
  const det = detecterColonnes(lu.entetes);
  etat.csv = { nom, encodage, lu, mapping: det.mapping, confiance: det.confiance };
  afficherCSV();
}

function calculerDiff() {
  const { lu, mapping } = etat.csv;
  const { offres, erreurs } = lignesVersOffres(lu, mapping, { fournisseur: 'cuistance', marqueParDefaut: 'Cuistance' });
  const parRef = new Map(etat.produits.map((p) => [normaliserRef(p.ref), p]));
  const lignes = offres.map((o) => {
    const p = parRef.get(normaliserRef(o.ref));
    if (!p) return { o, type: 'nouveau' };
    const changements = [];
    if (o.statutStock !== 'inconnu' && o.statutStock !== 'en-stock' && p.stock !== 0) changements.push({ quoi: 'stock', avant: p.stock, apres: 0, libelle: o.statutStock === 'sur-commande' ? 'sur commande' : 'rupture' });
    else if (o.stock !== null && o.stock !== p.stock) changements.push({ quoi: 'stock', avant: p.stock, apres: o.stock });
    if (o.prixAchatHT && Math.abs(o.prixAchatHT - p.prixAchatHT) >= 0.01) {
      const calc = prixParRegle(p, etat.regles, o.prixAchatHT);
      const d = decisionPrix({ ancienHT: p.prixVenteHT, nouveauHT: calc.prixHT, verrouille: p.verrouille, seuilAutoPct: etat.regles.seuilAutoPct });
      changements.push({ quoi: 'prix', avant: p.prixAchatHT, apres: o.prixAchatHT, vente: calc.prixHT, decision: d });
    }
    return { o, p, type: changements.length ? 'change' : 'identique', changements };
  });
  return { lignes, erreurs };
}

function afficherCSV() {
  const { nom, encodage, lu, mapping, confiance } = etat.csv;
  const choix = ['', ...Object.keys(CHAMPS)];
  const libelles = { '': '— ignorer —', ref: 'Référence', ean: 'EAN', codeFournisseur: 'Code fournisseur', designation: 'Désignation', marque: 'Marque', prixAchat: "Prix d'achat", prixConseille: 'Prix conseillé', prixAchatPrecedent: "Ancien prix d'achat", refPrecedente: 'Ancienne référence', stock: 'Stock', disponibilite: 'Disponibilité', delai: 'Délai', poids: 'Poids', dimensions: 'Dimensions', categorie: 'Catégorie', image: 'Image', notice: 'Notice', observation: 'Observation' };
  for (const c of ['prixAchatPrecedent', 'refPrecedente']) if (!choix.includes(c)) choix.push(c);
  const champDe = (i) => Object.entries(mapping).find(([, idx]) => idx === i)?.[0] || '';
  const tarif = 'prixAchat' in mapping && !('stock' in mapping) && !('disponibilite' in mapping);
  const colonnesVisibles = lu.entetes.map((h, i) => [h, i]).filter(([h, i]) => h || champDe(i));
  const lecture = `
    <div class="etape-import">
      <h3>1. Lecture</h3>
      <div class="resume">
        <span class="badge b-neutre">${e(nom)}</span>
        ${lu.separateur ? `<span class="badge b-neutre">séparateur « ${lu.separateur === '\t' ? 'tabulation' : e(lu.separateur)} »</span>` : ''}
        <span class="badge b-neutre">${e(encodage)}</span>
        <span class="badge b-neutre">${lu.lignes.length} lignes</span>
        <span class="badge ${tarif ? 'b-info' : confiance === 1 ? 'b-ok' : 'b-attente'}">${tarif ? 'liste de prix (sans stock)' : `colonnes essentielles reconnues : ${Math.round(confiance * 100)} %`}</span>
      </div>
    </div>
    <div class="etape-import">
      <h3>2. Colonnes reconnues (modifiables)</h3>
      <div class="cadre-defile"><table class="donnees"><thead><tr><th>Colonne du fichier</th><th>Devient</th><th>Exemples</th></tr></thead><tbody>
        ${colonnesVisibles.map(([h, i]) => `<tr><td><strong>${e(h || '(sans titre)')}</strong></td><td><select data-col="${i}" aria-label="Champ pour la colonne ${e(h)}">${choix.map((c) => `<option value="${c}" ${champDe(i) === c ? 'selected' : ''}>${libelles[c] || c}</option>`).join('')}</select></td><td class="petit">${lu.lignes.slice(0, 3).map((l) => e(l[i] || '∅')).join(' · ')}</td></tr>`).join('')}
      </tbody></table></div>
    </div>`;
  const brancherColonnes = () => $$('#resultat-csv select[data-col]').forEach((s) => s.addEventListener('change', () => {
    const col = Number(s.dataset.col);
    for (const [k, v] of Object.entries(mapping)) if (v === col) delete mapping[k];
    if (s.value) mapping[s.value] = col;
    afficherCSV();
  }));
  if (tarif) {
    $('#resultat-csv').innerHTML = lecture + '<div id="tarif"></div>';
    brancherColonnes();
    afficherTarif();
    return;
  }
  const { lignes, erreurs } = calculerDiff();
  const n = { nouveau: 0, change: 0, identique: 0 };
  lignes.forEach((l) => n[l.type]++);
  const auPasse = lignes.flatMap((l) => l.changements || []).filter((c) => c.decision?.action === 'valider').length;

  $('#resultat-csv').innerHTML = lecture + `
    <div class="etape-import">
      <h3>3. Ce qui change dans le catalogue</h3>
      <div class="resume">
        <span class="badge b-chaud">${n.change} produits modifiés</span>
        <span class="badge b-info">${n.nouveau} nouveaux</span>
        <span class="badge b-neutre">${n.identique} identiques</span>
        ${auPasse ? `<span class="badge b-attente">${auPasse} prix au passe</span>` : ''}
        ${erreurs.length ? `<span class="badge b-alerte">${erreurs.length} ligne(s) en erreur</span>` : ''}
      </div>
      <div class="cadre-defile"><table class="donnees"><thead><tr><th>Réf.</th><th>Produit</th><th>Changement</th><th>Décision</th></tr></thead><tbody>
        ${lignes.map((l) => `<tr><td class="mono">${e(l.o.ref)}</td><td>${e(l.p ? court(l.p.titre) : l.o.designation || '')}</td><td>${
          l.type === 'nouveau' ? 'Référence inconnue du catalogue' : l.type === 'identique' ? '—' : l.changements.map((c) => c.quoi === 'stock' ? `Stock ${c.avant} → ${c.libelle || c.apres}` : `Achat ${euro(c.avant)} → ${euro(c.apres)}, vente → ${euro(c.vente)}`).join('<br>')
        }</td><td>${
          l.type === 'nouveau' ? '<span class="badge b-info">Fiche à créer (au passe)</span>' : l.type === 'identique' ? '<span class="badge b-neutre">rien</span>' : l.changements.map((c) => c.quoi === 'stock' ? '<span class="badge b-ok">auto</span>' : c.decision.action === 'valider' ? '<span class="badge b-attente">au passe</span>' : c.decision.action === 'ignorer-verrou' ? '<span class="badge b-info">verrouillé</span>' : '<span class="badge b-ok">auto</span>').join(' ')
        }</td></tr>`).join('')}
        ${erreurs.map((er) => `<tr><td>—</td><td colspan="2">Ligne ${er.ligne} : ${e(er.message)}</td><td><span class="badge b-alerte">ignorée</span></td></tr>`).join('')}
      </tbody></table></div>
      <div class="actions" style="margin-top:12px"><button class="btn btn-chaud" id="appliquer-csv">Appliquer : ${n.change + n.nouveau} lignes</button><button class="btn" id="oublier-csv">Annuler</button></div>
    </div>`;

  brancherColonnes();
  $('#oublier-csv').addEventListener('click', () => { etat.csv = null; $('#resultat-csv').innerHTML = ''; });
  $('#appliquer-csv').addEventListener('click', () => {
    let auto = 0;
    let passe = 0;
    let nouveaux = 0;
    for (const l of lignes) {
      if (l.type === 'nouveau') {
        nouveaux++;
        ajouterAuPasse({ type: 'nouveau', titre: l.o.designation || l.o.ref, offre: l.o, raison: `Référence ${l.o.ref} absente du catalogue. Prix d'achat ${euro(l.o.prixAchatHT)}, stock ${l.o.stock ?? '?'}. Il faudra photos, EAN et caractéristiques avant publication.` });
        continue;
      }
      for (const c of l.changements || []) {
        if (c.quoi === 'stock') {
          auto++;
          noter({ type: c.apres === 0 ? 'Rupture' : 'Stock', etat: 'ok', produit: l.p, titre: court(l.p.titre), fournisseur: 'Cuistance · CSV mail', changement: { stock: c.apres, statutStock: c.apres ? 'en-stock' : 'rupture' }, lignes: [['Stock', `${c.avant} → ${c.libelle || c.apres}`]], etapes: 'CSV → Shopify → METRO', explication: 'Stock lu dans le fichier Cuistance.' });
        } else {
          const etatPrix = c.decision.action === 'valider' ? 'passe' : c.decision.action === 'ignorer-verrou' ? 'verrou' : 'ok';
          if (etatPrix === 'passe') passe++;
          else auto++;
          noter({ type: 'Prix', etat: etatPrix, produit: l.p, titre: court(l.p.titre), fournisseur: 'Cuistance · CSV mail', decision: c.decision, changement: { prixAchatHT: c.apres, ...(etatPrix === 'ok' ? { prixVenteHT: c.vente } : {}) }, proposition: { prixVenteHT: c.vente }, lignes: [['Achat', `${euro(c.avant)} → ${euro(c.apres)}`], ['Vente', `${euro(l.p.prixVenteHT)} → ${euro(c.vente)}`]], etapes: 'CSV → règles → ' + (etatPrix === 'ok' ? 'Shopify' : 'au passe'), explication: 'Prix lu dans le fichier Cuistance.' });
        }
      }
    }
    etat.csv = null;
    $('#resultat-csv').innerHTML = `<div class="suggestion" style="margin-top:14px"><span>Fichier appliqué : ${auto} changements automatiques, ${passe} prix et ${nouveaux} nouveau(x) produit(s) au passe.</span><a class="btn btn-petit" href="#/passe">Voir le passe</a></div>`;
    toast('Fichier Cuistance appliqué');
  });
}
const court = (t) => t.split(/\s+[-—–]\s+/)[0].slice(0, 60);

/* ---------- Liste de prix fournisseur : rapprochement avec les fiches en ligne ---------- */
const mediane = (xs) => {
  const t = [...xs].sort((a, b) => a - b);
  return t.length ? (t.length % 2 ? t[(t.length - 1) / 2] : (t[t.length / 2 - 1] + t[t.length / 2]) / 2) : NaN;
};
const tarifReglages = { coef: null, seuil: 0.05 };

function analyserTarif() {
  const { lu, mapping } = etat.csv;
  const { offres, erreurs } = lignesVersOffres(lu, mapping, { fournisseur: 'cuistance', marqueParDefaut: 'Cuistance' });
  const parRef = new Map();
  let doublons = 0;
  for (const o of offres) {
    const k = normaliserRef(o.ref);
    if (parRef.has(k)) doublons++;
    else parRef.set(k, o);
  }
  const enLigne = new Map(CUISTANCE_EN_LIGNE.map((p) => [normaliserRef(p.ref), p]));
  const rapproches = [];
  const aAjouter = [];
  for (const [k, o] of parRef) {
    const p = enLigne.get(k);
    if (p && o.prixAchatHT > 0) rapproches.push({ o, p, coef: p.prix / o.prixAchatHT });
    else if (!p) aAjouter.push(o);
  }
  const horsListe = CUISTANCE_EN_LIGNE.filter((p) => !parRef.has(normaliserRef(p.ref)));
  const variations = [...parRef.values()].filter((o) => o.prixAchatHT > 0 && o.prixAchatPrecedentHT > 0 && Math.abs(o.prixAchatHT - o.prixAchatPrecedentHT) >= 0.005)
    .map((o) => ({ o, v: (o.prixAchatHT - o.prixAchatPrecedentHT) / o.prixAchatPrecedentHT }));
  return { offres, erreurs, doublons, parRef, rapproches, aAjouter, horsListe, variations, avecAncien: [...parRef.values()].filter((o) => o.prixAchatPrecedentHT > 0).length, observations: [...parRef.values()].filter((o) => o.observation) };
}

function afficherTarif() {
  const a = analyserTarif();
  const coefConstate = mediane(a.rapproches.map((r) => r.coef));
  if (!tarifReglages.coef && Number.isFinite(coefConstate)) tarifReglages.coef = Math.round(coefConstate * 100) / 100;
  const coef = tarifReglages.coef || 2;
  const lignes = a.rapproches.map((r) => {
    const calcule = arrondir(r.o.prixAchatHT * coef, 'centime');
    return { ...r, calcule, ecart: (r.p.prix - calcule) / calcule };
  });
  const sous = lignes.filter((l) => l.ecart < -tarifReglages.seuil).sort((x, y) => x.ecart - y.ecart);
  const dessus = lignes.filter((l) => l.ecart > tarifReglages.seuil);
  const conformes = lignes.length - sous.length - dessus.length;
  const hausses = a.variations.filter((x) => x.v > 0);
  const baisses = a.variations.filter((x) => x.v < 0);
  const touchesEnLigne = lignes.filter((l) => l.o.prixAchatPrecedentHT > 0 && Math.abs(l.o.prixAchatHT - l.o.prixAchatPrecedentHT) >= 0.005);
  const fmtPct = (x) => `${x > 0 ? '+' : ''}${pct(x)}`;
  const liste = (items, rendu, max = 12) => `${items.slice(0, max).map(rendu).join('')}${items.length > max ? `<li class="petit">… et ${items.length - max} autres (dans le fichier téléchargé)</li>` : ''}`;
  $('#tarif').innerHTML = `
    <div class="etape-import">
      <h3>3. Ce qui a changé depuis l'ancien tarif</h3>
      ${a.avecAncien ? `<div class="resume">
        <span class="badge b-chaud">${a.variations.length} prix d'achat changés sur ${a.avecAncien}</span>
        <span class="badge b-alerte">${hausses.length} hausses</span>
        <span class="badge b-ok">${baisses.length} baisses</span>
        <span class="badge b-neutre">variation médiane ${a.variations.length ? fmtPct(mediane(a.variations.map((x) => x.v))) : '—'}</span>
        ${a.parRef.size - a.avecAncien > 0 ? `<span class="badge b-info">${a.parRef.size - a.avecAncien} références sans ancien prix (nouveautés ?)</span>` : ''}
      </div>
      ${hausses.length ? `<p class="petit">Plus fortes hausses : ${hausses.sort((x, y) => y.v - x.v).slice(0, 5).map((x) => `<span class="mono">${e(x.o.ref)}</span> ${fmtPct(x.v)}`).join(' · ')}</p>` : ''}` : '<p class="petit">Pas de colonne « ancien prix » reconnue : choisissez-la à l\'étape 2 pour voir les variations.</p>'}
      ${a.observations.length ? `<p class="petit">${a.observations.length} observations dans le fichier (ex. <em>${e(a.observations[0].ref)} : ${e(a.observations[0].observation)}</em>) : paliers de quantité à garder pour les achats, pas pour le prix de vente.</p>` : ''}
    </div>
    <div class="etape-import">
      <h3>4. Rapprochement avec maxigastro.fr <span class="petit">(${CUISTANCE_EN_LIGNE.length} fiches Cuistance en ligne, relevé public du 3 novembre 2026)</span></h3>
      <div class="impact-chiffres" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
        <div><strong>${a.rapproches.length}</strong><span>références du fichier déjà en ligne</span></div>
        <div><strong>${a.aAjouter.length}</strong><span>pas encore sur le site</span></div>
        <div><strong>${a.horsListe.length}</strong><span>fiches en ligne absentes du fichier</span></div>
        <div><strong>${touchesEnLigne.length}</strong><span>fiches en ligne dont le prix d'achat a bougé</span></div>
      </div>
      <details class="endpoints"><summary>Fiches en ligne absentes du fichier (${a.horsListe.length}) : arrêtées, renommées, ou d'une autre liste ?</summary><ul>${liste(a.horsListe, (p) => `<li><span class="mono">${e(p.ref)}</span> · <a href="${e(p.url)}" target="_blank" rel="noopener">${e(court(p.titre))}</a></li>`, 30)}</ul></details>
      <details class="endpoints"><summary>Références à ajouter au site (${a.aAjouter.length})</summary><ul>${liste(a.aAjouter, (o) => `<li><span class="mono">${e(o.ref)}</span> · ${euro(o.prixAchatHT)} HT${o.observation ? ` · ${e(o.observation)}` : ''}</li>`, 30)}</ul></details>
    </div>
    <div class="etape-import">
      <h3>5. Vos prix en ligne face au nouveau tarif</h3>
      <p class="petit">Coefficient constaté aujourd'hui (médiane prix affiché ÷ nouveau prix d'achat) : <strong>× ${Number.isFinite(coefConstate) ? coefFr(coefConstate) : '—'}</strong>. Mettez votre vraie règle pour voir les fiches qui s'en écartent.</p>
      <div class="formulaire-bb">
        <div class="champ"><label for="t-coef">Coefficient de vente</label><input type="number" id="t-coef" min="1" max="5" step="0.01" value="${coef}"></div>
        <div class="champ"><label for="t-seuil">Tolérance (%)</label><input type="number" id="t-seuil" min="0" max="50" step="1" value="${Math.round(tarifReglages.seuil * 100)}"></div>
      </div>
      <div class="resume">
        <span class="badge b-alerte">${sous.length} sous la règle (marge rognée)</span>
        <span class="badge b-attente">${dessus.length} au-dessus</span>
        <span class="badge b-ok">${conformes} conformes</span>
      </div>
      ${sous.length ? `<div class="cadre-defile"><table class="donnees"><thead><tr><th>Réf.</th><th>Fiche</th><th>Achat HT</th><th>Prix en ligne</th><th>Avec la règle</th><th>Écart</th></tr></thead><tbody>
        ${sous.slice(0, 12).map((l) => `<tr><td class="mono">${e(l.p.ref)}</td><td><a href="${e(l.p.url)}" target="_blank" rel="noopener">${e(court(l.p.titre))}</a></td><td class="n">${euro(l.o.prixAchatHT)}</td><td class="n">${euro(l.p.prix)}</td><td class="n">${euro(l.calcule)}</td><td class="n">${fmtPct(l.ecart)}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
      <div class="actions" style="margin-top:12px">
        <button class="btn btn-chaud" id="t-exporter">Télécharger le rapprochement (.csv)</button>
        <button class="btn" id="t-passe">Envoyer au passe</button>
        <button class="btn" id="oublier-csv">Fermer</button>
      </div>
      <p class="petit">Calculé dans ce navigateur. Le fichier n'est ni envoyé, ni enregistré, ni publié.</p>
    </div>`;

  $('#t-coef').addEventListener('change', (ev) => { tarifReglages.coef = Math.max(1, Number(ev.target.value) || coef); afficherTarif(); });
  $('#t-seuil').addEventListener('change', (ev) => { tarifReglages.seuil = Math.max(0, Number(ev.target.value) || 0) / 100; afficherTarif(); });
  $('#oublier-csv').addEventListener('click', () => { etat.csv = null; tarifReglages.coef = null; $('#resultat-csv').innerHTML = ''; });
  $('#t-passe').addEventListener('click', () => {
    ajouterAuPasse({ type: 'lot', titre: `Liste de prix ${etat.csv.nom}`, raison: `${touchesEnLigne.length} fiches en ligne à repricer, ${sous.length} sous la règle × ${coefFr(coef)}, ${a.aAjouter.length} références à créer, ${a.horsListe.length} fiches en ligne absentes du tarif à vérifier.` });
    toast('Envoyé au passe');
  });
  $('#t-exporter').addEventListener('click', () => {
    const csv = [['Référence', 'Code fournisseur', 'Statut', 'Ancien achat HT', 'Nouvel achat HT', 'Variation', 'Prix en ligne', `Prix avec × ${coefFr(coef)}`, 'Écart', 'Fiche', 'Observation']];
    const num = (x) => (Number.isFinite(x) ? x.toFixed(2).replace('.', ',') : '');
    const enLigneParRef = new Map(lignes.map((l) => [normaliserRef(l.o.ref), l]));
    for (const [k, o] of a.parRef) {
      const l = enLigneParRef.get(k);
      const v = o.prixAchatPrecedentHT > 0 && o.prixAchatHT > 0 ? (o.prixAchatHT - o.prixAchatPrecedentHT) / o.prixAchatPrecedentHT : null;
      const statut = !l ? 'à ajouter au site' : l.ecart < -tarifReglages.seuil ? 'sous la règle' : l.ecart > tarifReglages.seuil ? 'au-dessus de la règle' : 'conforme';
      csv.push([o.ref, o.codeFournisseur || '', statut, num(o.prixAchatPrecedentHT), num(o.prixAchatHT), v === null ? '' : `${(v * 100).toFixed(1).replace('.', ',')} %`, l ? num(l.p.prix) : '', l ? num(l.calcule) : '', l ? `${(l.ecart * 100).toFixed(1).replace('.', ',')} %` : '', l ? l.p.url : '', o.observation || '']);
    }
    for (const p of a.horsListe) csv.push([p.ref, '', 'en ligne, absente du fichier', '', '', '', num(p.prix), '', '', p.url, '']);
    const texte = '﻿' + csv.map((r) => r.map((c) => (/[;"\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([texte], { type: 'text/csv;charset=utf-8' }));
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `rapprochement-${etat.csv.nom.replace(/\.[^.]+$/, '')}.csv`;
    document.body.append(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
}

/* =========================================================
   Vue : Catalogue + fiche produit
   ========================================================= */
const filtresCat = { q: '', fournisseur: '', vue: '' };
function vueCatalogue() {
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Catalogue</h1><p>Les ${etat.produits.length} produits de la démo sont de vrais produits de maxigastro.fr (titre, référence, prix de vente, poids, photos). Prix d'achat et stocks sont simulés.</p></div></div>
    <div class="outils">
      <input type="search" id="q" placeholder="Rechercher un titre, une référence, une marque" value="${e(filtresCat.q)}" aria-label="Rechercher">
      <select id="f-fournisseur" aria-label="Fournisseur"><option value="">Tous les fournisseurs</option>${Object.entries(FOURNISSEURS_NOMS).filter(([k]) => etat.produits.some((p) => p.fournisseur === k)).map(([k, v]) => `<option value="${k}" ${filtresCat.fournisseur === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <select id="f-vue" aria-label="Filtre"><option value="">Toutes les fiches</option><option value="incomplet">À compléter (score &lt; 60 %)</option><option value="verrou">Prix verrouillés</option><option value="rupture">Ruptures</option><option value="ecart">Prix ≠ règle</option><option value="brouillon">Brouillons</option></select>
    </div>
    <p class="petit" id="nb-resultats"></p>
    <div class="liste" id="liste"></div>`;
  $('#f-vue').value = filtresCat.vue;
  const rendre = () => {
    const q = filtresCat.q.toLowerCase();
    const res = etat.produits.filter((p) => {
      if (filtresCat.fournisseur && p.fournisseur !== filtresCat.fournisseur) return false;
      if (q && !`${p.titre} ${p.ref} ${p.marque}`.toLowerCase().includes(q)) return false;
      if (filtresCat.vue === 'incomplet' && evaluerFiche(p).pct >= 60) return false;
      if (filtresCat.vue === 'verrou' && !p.verrouille) return false;
      if (filtresCat.vue === 'rupture' && p.stock !== 0) return false;
      if (filtresCat.vue === 'brouillon' && p.statut !== 'brouillon') return false;
      if (filtresCat.vue === 'ecart' && Math.abs(prixParRegle(p, etat.regles).prixHT - p.prixVenteHT) < 0.01) return false;
      return true;
    });
    $('#nb-resultats').textContent = `${res.length} produit${res.length > 1 ? 's' : ''}`;
    $('#liste').innerHTML = res.map(ligneProduitHTML).join('') || '<p class="vide">Aucun produit ne correspond.</p>';
    $$('#liste .ligne-produit').forEach((b) => b.addEventListener('click', () => ouvrirFiche(b.dataset.id)));
  };
  $('#q').addEventListener('input', (ev) => { filtresCat.q = ev.target.value; rendre(); });
  $('#f-fournisseur').addEventListener('change', (ev) => { filtresCat.fournisseur = ev.target.value; rendre(); });
  $('#f-vue').addEventListener('change', (ev) => { filtresCat.vue = ev.target.value; rendre(); });
  rendre();
}

function anneau(score) {
  const c = score >= 75 ? 'var(--ok)' : score >= 50 ? 'var(--attente)' : 'var(--alerte)';
  return `<span class="anneau" style="--p:${score};--c:${c}" title="Score qualité ${score} %" aria-label="Score qualité ${score} %">${score}</span>`;
}
function ligneProduitHTML(p) {
  const q = evaluerFiche(p);
  const regle = prixParRegle(p, etat.regles);
  const ecart = Math.abs(regle.prixHT - p.prixVenteHT) >= 0.01;
  return `<button class="ligne-produit" data-id="${e(p.id)}">
    ${p.image ? `<img src="${e(p.image)}" alt="" loading="lazy" width="56" height="56">` : '<img alt="" width="56" height="56">'}
    <span class="lp-titre">${e(p.titre)}</span>
    <span class="lp-infos"><span>${e(p.marque)}</span><span class="mono">${e(p.ref)}</span>${p.statut === 'brouillon' ? '<span class="badge b-info">brouillon</span>' : ''}${p.verrouille ? '<span class="badge b-info sans-point">verrouillé</span>' : ''}</span>
    <span class="lp-prix">${euro(p.prixVenteHT)}${ecart && !p.verrouille ? `<br><small class="petit">règle : ${euro(regle.prixHT)}</small>` : ''}</span>
    <span class="lp-stock">${p.stock === 0 ? '<span class="badge b-alerte">rupture</span>' : `${p.stock} en stock`}<br><small class="petit">${p.delaiJours} j</small></span>
    <span class="lp-etat">${anneau(q.pct)}</span>
  </button>`;
}

const fiche = $('#fiche');
fiche.addEventListener('click', (ev) => { if (ev.target === fiche) fiche.close(); });
function ouvrirFiche(id) {
  const p = produit(id);
  if (!p) return;
  const q = evaluerFiche(p);
  const r = prixParRegle(p, etat.regles);
  const histo = etat.journal.filter((j) => j.produit?.id === id).slice(0, 6);
  const eanCache = !p.ean && eanValide(p.ref);
  const refPropre = normaliserRef(p.ref);
  $('#fiche-corps').innerHTML = `
    <div class="tiroir-tete">
      ${p.image ? `<img src="${e(p.image)}" alt="">` : '<span></span>'}
      <div><h2 id="fiche-titre">${e(p.titre)}</h2><p class="petit" style="margin:0">${e(p.marque)} · <span class="mono">${e(p.ref)}</span>${refPropre !== p.ref.toUpperCase().replace(/\s+/g, '') ? ` → <span class="mono">${e(refPropre)}</span>` : ''}</p>
      ${p.url ? `<p style="margin:6px 0 0"><a class="petit" href="${e(p.url)}" target="_blank" rel="noopener">Voir sur maxigastro.fr ↗</a></p>` : ''}</div>
      <button class="fermer" id="fermer" aria-label="Fermer">✕</button>
    </div>
    <div class="bloc-fiche">
      <h3>Prix</h3>
      <div class="calcul">
        <span>Prix d'achat HT <span class="origine simule">simulé</span></span><span class="num">${euro(p.prixAchatHT)}</span>
        <span>Règle « ${e(r.regle.niveau)} » : × ${coefFr(r.regle.valeur)}, ${e(ARRONDI_COURT[r.regle.arrondi] || r.regle.arrondi)}</span><span class="num">${euro(r.prixHT)}</span>
        <span>Prix actuel sur la boutique <span class="origine reel">réel</span></span><span class="num">${euro(p.prixVenteHT)}</span>
        <span class="total">Marge actuelle</span><span class="total num">${pct(marge(p))}</span>
      </div>
      <label class="interrupteur"><input type="checkbox" id="verrou" ${p.verrouille ? 'checked' : ''}> Prix verrouillé à la main (les synchros ne le changent plus)</label>
    </div>
    <div class="bloc-fiche">
      <h3>Qualité de la fiche · ${q.pct} %</h3>
      ${q.manquants.length ? `<ul class="manques">${q.manquants.map((m) => `<li><span>${e(m.label)}</span></li>`).join('')}</ul>` : '<p>Fiche complète.</p>'}
      ${q.bloque.length ? `<p class="petit" style="margin:10px 0 0">Bloque : ${q.bloque.map((b) => `<span class="badge b-alerte sans-point">${e({ metro: 'METRO', amazon: 'Amazon', google: 'Google Shopping', livraison: 'frais de port', buybox: 'Buy Box', prix: 'calcul du prix' }[b] || b)}</span>`).join(' ')}</p>` : ''}
      ${eanCache ? `<div class="suggestion"><span>La référence ${e(p.ref)} est un EAN valide.</span><button class="btn btn-petit" id="copier-ean">Copier dans le code-barres</button></div>` : ''}
    </div>
    <div class="bloc-fiche">
      <h3>Données</h3>
      <dl class="tableau-cle">
        <dt>Fournisseur</dt><dd>${e(FOURNISSEURS_NOMS[p.fournisseur] || p.marque)}</dd>
        <dt>Type produit</dt><dd>${e(p.categorie)} ${p.categorie === p.ref ? '<span class="badge b-alerte sans-point">= référence</span>' : ''} <span class="origine reel">réel</span></dd>
        <dt>EAN</dt><dd>${p.ean ? `<span class="mono">${e(p.ean)}</span>` : '—'} <span class="origine reel">réel</span></dd>
        <dt>Poids</dt><dd>${p.poidsKg ? `${nb(p.poidsKg)} kg` : '0 g sur la boutique'} <span class="origine reel">réel</span></dd>
        <dt>Dimensions</dt><dd>${e(p.dimensions || '—')}</dd>
        <dt>Photos</dt><dd>${p.nbImages} <span class="origine reel">réel</span></dd>
        <dt>Stock</dt><dd>${p.stock} · délai ${p.delaiJours} j <span class="origine simule">simulé</span></dd>
      </dl>
    </div>
    <div class="bloc-fiche">
      <h3>Historique</h3>
      ${histo.length ? `<ul class="manques">${histo.map((h) => `<li><span>${heure(h.date)} · ${e(h.type)} : ${e(h.lignes?.[0]?.[1] || '')}</span><span class="badge ${h.etat === 'ok' ? 'b-ok' : h.etat === 'passe' ? 'b-chaud' : 'b-info'}">${h.etat === 'ok' ? 'envoyé' : h.etat === 'passe' ? 'au passe' : 'verrou'}</span></li>`).join('')}</ul>` : '<p class="petit">Aucun changement depuis l\'ouverture.</p>'}
    </div>`;
  $('#fermer').addEventListener('click', () => fiche.close());
  $('#verrou').addEventListener('change', (ev) => {
    p.verrouille = ev.target.checked;
    toast(p.verrouille ? 'Prix verrouillé : les fournisseurs ne le changeront plus' : 'Verrou retiré : les règles s\'appliquent à nouveau');
    if (routeActuelle === 'catalogue') vueCatalogue();
  });
  $('#copier-ean')?.addEventListener('click', () => {
    p.ean = p.ref;
    const item = etat.file.find((i) => i.type === 'ean' && i.produitId === p.id && i.statut === 'attente');
    if (item) item.statut = 'envoye';
    majCompteur();
    toast('EAN enregistré');
    ouvrirFiche(id);
  });
  if (!fiche.open) fiche.showModal();
}

/* =========================================================
   Vue : Au passe (validation) + atelier IA
   ========================================================= */
const TYPES_PASSE = { prix: ['b-chaud', 'Prix'], fiche: ['b-info', 'Fiche Claude'], ean: ['b-ok', 'EAN trouvé'], categories: ['b-attente', 'Catégories'], nouveau: ['b-info', 'Nouveau produit'], lot: ['b-attente', 'Liste de prix'] };
function itemPasseHTML(i) {
  const [cls, lib] = TYPES_PASSE[i.type];
  let corps = '';
  if (i.type === 'prix') corps = `<div class="ip-avant-apres"><del>${euro(i.avant)}</del> → <ins>${euro(i.apres)}</ins> <span class="petit">(${i.apres > i.avant ? '+' : ''}${pct((i.apres - i.avant) / i.avant)})</span></div>`;
  if (i.type === 'ean') corps = `<div class="ip-avant-apres"><del>aucun EAN</del> → <ins class="mono">${e(i.apres)}</ins></div>`;
  if (i.type === 'categories') corps = `<div class="ip-avant-apres">${i.ids.slice(0, 3).map((id) => { const p = produit(id); return `<span><del class="mono">${e(p.categorie)}</del> → <ins>${e(proposerCategorie(p))}</ins></span>`; }).join('<br>')}${i.ids.length > 3 ? `<br><span class="petit">… et ${i.ids.length - 3} autres</span>` : ''}</div>`;
  if (i.type === 'fiche') corps = `<div class="ip-avant-apres"><del>${e(EXEMPLE.produit.titreActuel)}</del><br><ins>${e(EXEMPLE.fiche.titre)}</ins></div>`;
  return `<article class="item-passe ${i.statut !== 'attente' ? 'sort' : ''}" data-item="${i.id}">
    <div class="ip-tete"><span class="ip-titre">${e(court(i.titre))}</span><span class="badge ${cls}">${lib}</span></div>
    ${corps}
    <p class="ip-raison">${e(i.raison)}</p>
    ${i.statut === 'attente' ? `<div class="actions"><button class="btn btn-petit btn-chaud" data-ok="${i.id}">Envoyer</button><button class="btn btn-petit" data-non="${i.id}">Renvoyer en cuisine</button>${i.type === 'fiche' ? '<a class="btn btn-petit btn-discret" href="#/passe" data-atelier>Lire la fiche ↓</a>' : ''}</div>` : `<span class="badge ${i.statut === 'envoye' ? 'b-ok' : 'b-neutre'}">${i.statut === 'envoye' ? 'envoyé' : 'renvoyé'}</span>`}
  </article>`;
}
function brancherPasse(racine) {
  if (!racine) return;
  $$('[data-ok]', racine).forEach((b) => b.addEventListener('click', () => trancher(Number(b.dataset.ok), true)));
  $$('[data-non]', racine).forEach((b) => b.addEventListener('click', () => trancher(Number(b.dataset.non), false)));
  $$('[data-atelier]', racine).forEach((a) => a.addEventListener('click', (ev) => { if (routeActuelle === 'passe') { ev.preventDefault(); $('#atelier')?.scrollIntoView({ behavior: reduitMouvement() ? 'auto' : 'smooth' }); } }));
}
function trancher(id, accepte) {
  const i = etat.file.find((x) => x.id === id);
  if (!i || i.statut !== 'attente') return;
  i.statut = accepte ? 'envoye' : 'renvoye';
  if (accepte) {
    if (i.type === 'prix') {
      const p = produit(i.produitId);
      noter({ type: 'Prix', etat: 'ok', produit: p, titre: court(p.titre), fournisseur: 'Validé au passe', changement: { prixVenteHT: i.apres }, lignes: [['Vente', `${euro(i.avant)} → ${euro(i.apres)}`]], etapes: 'Passe → Shopify → METRO', explication: 'Prix validé par vous.' });
    }
    if (i.type === 'ean') produit(i.produitId).ean = i.apres;
    if (i.type === 'categories') i.ids.forEach((pid) => { const p = produit(pid); p.categorie = proposerCategorie(p); });
    if (i.type === 'fiche') {
      const p = produit(i.produitId);
      Object.assign(p, { titre: EXEMPLE.fiche.titre, lgDescription: EXEMPLE.fiche.description_html.length, poidsKg: 113, ref: '15844', dimensions: '1355 × 515 × 900 mm' });
      noter({ type: 'Fiche', etat: 'ok', produit: p, titre: court(p.titre), fournisseur: 'Claude · validé au passe', lignes: [['Titre', 'réécrit'], ['Poids', '0 g → 113 kg']], etapes: 'Passe → Shopify', explication: 'Fiche publiée.' }, { appliquer: false });
    }
    if (i.type === 'nouveau') {
      const o = i.offre;
      const calc = prixParRegle({ fournisseur: 'cuistance', famille: 'froid', id: o.ref }, etat.regles, o.prixAchatHT || 0);
      etat.produits.push({ id: `nouveau-${o.ref}`, titre: o.designation || o.ref, marque: 'Cuistance', fournisseur: 'cuistance', ref: o.ref, ean: o.ean, prixVenteHT: calc?.prixHT || 0, prixBarreHT: null, prixAchatHT: o.prixAchatHT || 0, stock: o.stock ?? 0, statutStock: o.statutStock, delaiJours: 10, poidsKg: null, dimensions: null, categorie: null, famille: 'froid', nbImages: 0, lgDescription: 0, notice: null, image: null, url: null, verrouille: false, statut: 'brouillon' });
    }
  }
  majCompteur();
  toast(accepte ? 'Envoyé ✓' : 'Renvoyé en cuisine : rien n\'est publié');
  if (routeActuelle === 'passe') vuePasse();
  else if (routeActuelle === 'tableau') vueTableau();
}

function vuePasse() {
  const attente = enAttente();
  const traites = etat.file.filter((i) => i.statut !== 'attente');
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Au passe</h1><p>Comme le chef au passe : rien ne part sans contrôle. Les petits changements passent seuls (seuil réglable dans Règles) ; le reste attend votre feu vert, d'un clic, depuis le téléphone.</p></div></div>
    <div class="grille grille-2">
      <section class="panneau" aria-labelledby="t-file">
        <h2 id="t-file">En attente <span class="badge b-chaud sans-point">${attente.length}</span></h2>
        <div class="file" id="file">${attente.map(itemPasseHTML).join('') || '<p class="vide">Tout est envoyé. Bon service !</p>'}</div>
        ${traites.length ? `<h2 style="margin-top:18px;font-size:1rem">Traités</h2><div class="file">${traites.map(itemPasseHTML).join('')}</div>` : ''}
      </section>
      <section class="panneau" id="atelier" aria-labelledby="t-atelier">
        <h2 id="t-atelier">Atelier Claude · Tefcold BA30S-3</h2>
        <p class="sous">Une vraie fiche de la boutique, réécrite selon la consigne ci-dessous. Format imposé, sources obligatoires, chiffres vérifiés.</p>
        <div class="onglets" role="tablist">
          ${[['fiche', 'Fiche proposée'], ['controles', 'Contrôles'], ['donnees', 'Données fournisseur'], ['consigne', 'Consigne']].map(([k, l]) => `<button role="tab" aria-selected="${etat.atelier === k}" data-onglet="${k}">${l}</button>`).join('')}
        </div>
        <div id="atelier-corps" role="tabpanel"></div>
      </section>
    </div>`;
  brancherPasse(vue);
  $$('[data-onglet]').forEach((b) => b.addEventListener('click', () => { etat.atelier = b.dataset.onglet; $$('[data-onglet]').forEach((x) => x.setAttribute('aria-selected', String(x === b))); rendreAtelier(); }));
  rendreAtelier();
}

function rendreAtelier() {
  const f = EXEMPLE.fiche;
  const corps = $('#atelier-corps');
  if (etat.atelier === 'fiche') {
    corps.innerHTML = `
      <div class="serp" aria-label="Aperçu dans Google">
        <div class="serp-site">Maxi Gastro</div><div class="serp-url">maxigastro.fr › products › ba30s-3-15844</div>
        <div class="serp-titre">${e(f.meta_title)}</div><div class="serp-desc">${e(f.meta_description)}</div>
      </div>
      <p class="compte-car">meta_title ${f.meta_title.length}/60 · meta_description ${f.meta_description.length}/155 · titre ${f.titre.length}/70</p>
      <div class="rendu-fiche">
        <h2>${e(f.titre)}</h2>
        <p><strong>${e(f.accroche)}</strong></p>
        ${f.description_html}
        <h3>Points forts</h3><ul>${f.points_forts.map((x) => `<li>${e(x)}</li>`).join('')}</ul>
        <h3>Caractéristiques (avec leur source)</h3>
        <div class="cadre-defile"><table class="carac"><tbody>${f.caracteristiques.map((c) => `<tr><th>${e(c.nom)}</th><td>${e(c.valeur)}</td><td><span class="src">${e(c.source)}</span></td></tr>`).join('')}</tbody></table></div>
        <h3>FAQ</h3>${f.faq.map((q) => `<p><strong>${e(q.question)}</strong><br>${e(q.reponse)} <span class="src">${e(q.source)}</span></p>`).join('')}
        <p class="petit">Catégorie proposée : <strong>${e(f.categorie_proposee)}</strong></p>
      </div>`;
  } else if (etat.atelier === 'controles') {
    const orph = chiffresOrphelins(f, EXEMPLE.donnees);
    const long = controlerLongueurs(f);
    corps.innerHTML = `
      <ul class="controles">
        <li><span class="badge ${orph.length ? 'b-alerte' : 'b-ok'}">${orph.length ? orph.length : '0'}</span><span><strong>Chiffres sans source</strong><br><span class="petit">${orph.length ? `À vérifier : ${orph.map(e).join(', ')}` : 'Chaque nombre de la fiche existe dans les données Tefcold. Ce contrôle est refait par le moteur à chaque fiche.'}</span></span></li>
        <li><span class="badge ${long.length ? 'b-alerte' : 'b-ok'}">${long.length ? '!' : 'OK'}</span><span><strong>Longueurs SEO</strong><br><span class="petit">${long.length ? long.map(e).join(', ') : `titre ${f.titre.length}/70, meta_title ${f.meta_title.length}/60, meta_description ${f.meta_description.length}/155`}</span></span></li>
        <li><span class="badge b-ok">${f.mots_cles_utilises.length}</span><span><strong>Mots-clés intégrés</strong><br><span class="petit">${f.mots_cles_utilises.map(e).join(' · ')}</span></span></li>
        ${f.mots_cles_ecartes.map((m) => `<li><span class="badge b-attente">écarté</span><span><strong>${e(m.mot_cle)}</strong><br><span class="petit">${e(m.raison)}</span></span></li>`).join('')}
        ${f.champs_manquants.map((m) => `<li><span class="badge b-alerte">manque</span><span><strong>${e(m.champ)}</strong><br><span class="petit">${e(m.impact)}</span></span></li>`).join('')}
        ${f.incoherences.map((x) => `<li><span class="badge b-info">écart</span><span class="petit">${e(x)}</span></li>`).join('')}
      </ul>
      <p class="petit" style="margin-top:12px">Les mots-clés de cet exemple sont illustratifs. En production, ce sont les requêtes réelles de la Search Console de maxigastro.fr.</p>`;
  } else if (etat.atelier === 'donnees') {
    corps.innerHTML = `<p class="petit">Ce que Claude reçoit (message utilisateur), construit par le moteur à partir des données Tefcold :</p><pre class="code">${e(messageFiche({ donnees: EXEMPLE.donnees, motsCles: EXEMPLE.motsCles, ficheActuelle: '(texte actuel de la fiche, 5 545 caractères)' }))}</pre>`;
  } else {
    corps.innerHTML = `<p class="petit">Consigne système envoyée à Claude (identique pour toutes les fiches, donc mise en cache par l'API : elle n'est facturée pleinement qu'une fois). La réponse doit respecter un schéma JSON imposé de ${Object.keys(SCHEMA_FICHE.properties).length} champs.</p><pre class="code">${e(CONSIGNE_FICHE)}</pre>`;
  }
}

/* =========================================================
   Vue : Règles
   ========================================================= */
function impactRegles() {
  const r = etat.regles;
  const res = { hausse: 0, baisse: 0, identique: 0, verrou: 0, passe: 0, margeAvant: 0, margeApres: 0, details: [] };
  for (const p of etat.produits) {
    const calc = prixParRegle(p, r);
    const d = decisionPrix({ ancienHT: p.prixVenteHT, nouveauHT: calc.prixHT, verrouille: p.verrouille, seuilAutoPct: r.seuilAutoPct });
    const apres = d.action === 'ignorer-verrou' ? p.prixVenteHT : calc.prixHT;
    res.margeAvant += marge(p);
    res.margeApres += (apres - p.prixAchatHT) / apres;
    if (d.action === 'ignorer-verrou') res.verrou++;
    else if (d.action === 'rien') res.identique++;
    else if (apres > p.prixVenteHT) res.hausse++;
    else res.baisse++;
    if (d.action === 'valider') res.passe++;
    if (d.action !== 'rien' && d.action !== 'ignorer-verrou') res.details.push({ p, apres, d });
  }
  res.margeAvant /= etat.produits.length;
  res.margeApres /= etat.produits.length;
  res.details.sort((a, b) => Math.abs(b.d.variationPct) - Math.abs(a.d.variationPct));
  return res;
}

function ligneRegle(cle, libelle, regle, groupe) {
  const v = regle.valeur;
  return `<div class="regle-ligne"><label for="r-${groupe}-${cle}">${e(libelle)}</label><input type="range" id="r-${groupe}-${cle}" min="1.10" max="2.00" step="0.01" value="${v}" data-groupe="${groupe}" data-cle="${cle}"><output for="r-${groupe}-${cle}" id="o-${groupe}-${cle}">× ${coefFr(v)}<small>marge ${pct(1 - 1 / v, 0)}</small></output></div>`;
}

function vueRegles() {
  const r = etat.regles;
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Règles commerciales</h1><p>Vos marges, appliquées à chaque prix d'achat qui arrive. Ordre de priorité : produit, puis fournisseur + catégorie, puis catégorie, puis fournisseur. Les valeurs ici sont des exemples.</p></div><button class="btn btn-petit" id="reinit">Réinitialiser</button></div>
    <div class="grille grille-2">
      <div class="grille">
        <section class="panneau"><h2>Coefficient par fournisseur</h2><p class="sous">Prix de vente HT = prix d'achat HT × coefficient (marge = taux de marque).</p>
          ${Object.entries(r.fournisseurs).map(([k, reg]) => ligneRegle(k, FOURNISSEURS_NOMS[k] || k, reg, 'fournisseurs')).join('')}
        </section>
        <section class="panneau"><h2>Exceptions par catégorie</h2><p class="sous">Prioritaires sur le fournisseur. Cochez une famille pour lui donner sa propre marge.</p>
          ${['froid', 'cuisson', 'laverie', 'inox', 'ventilation', 'preparation'].map((k) => {
            const actif = Boolean(r.categories[k]);
            return `<label class="coche"><input type="checkbox" data-cat="${k}" ${actif ? 'checked' : ''}> ${FAMILLES[k]}</label>${actif ? ligneRegle(k, `↳ ${FAMILLES[k]}`, r.categories[k], 'categories') : ''}`;
          }).join('')}
        </section>
        <section class="panneau"><h2>Garde-fous</h2>
          <div class="champ"><label for="arrondi">Arrondi des prix</label><select id="arrondi">${Object.entries(ARRONDIS).map(([k, l]) => `<option value="${k}" ${r.defaut.arrondi === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="regle-ligne"><label for="seuil">Validation au-delà de</label><input type="range" id="seuil" min="0.01" max="0.20" step="0.01" value="${r.seuilAutoPct}"><output id="o-seuil">${pct(r.seuilAutoPct, 0)}<small>de variation</small></output></div>
          <div class="regle-ligne"><label for="mmin">Marge plancher marketplaces</label><input type="range" id="mmin" min="0.03" max="0.30" step="0.01" value="${r.margeMinMarketplace}"><output id="o-mmin">${pct(r.margeMinMarketplace, 0)}<small>nette, après commission</small></output></div>
          <h3 style="font-size:.95rem;margin:14px 0 4px">Familles jamais importées</h3>
          ${Object.entries(r.exclusions).map(([k, v]) => `<label class="coche"><input type="checkbox" data-excl="${k}" ${v ? 'checked' : ''}> ${FAMILLES[k] || k}</label>`).join('')}
          <p class="petit">Chez equip.me, les pièces détachées sont écartées à la source (<code>catalog_type=2</code>). Aucun produit de la démo n'est dans ces familles.</p>
        </section>
      </div>
      <section class="panneau collant" aria-live="polite" id="impact"></section>
    </div>`;
  const majImpact = () => {
    const i = impactRegles();
    $('#impact').innerHTML = `
      <h2>Impact sur les ${etat.produits.length} produits</h2>
      <p class="sous">Recalculé à chaque réglage, avec le code du moteur.</p>
      <div class="impact-chiffres">
        <div><strong>${i.hausse}</strong><span>prix montent</span></div>
        <div><strong>${i.baisse}</strong><span>prix baissent</span></div>
        <div><strong>${i.passe}</strong><span>iraient au passe</span></div>
        <div><strong>${i.verrou}</strong><span>verrouillés, intacts</span></div>
      </div>
      <p>Marge moyenne : <strong>${pct(i.margeAvant)}</strong> → <strong>${pct(i.margeApres)}</strong></p>
      ${i.details.length ? `<div class="cadre-defile"><table class="donnees"><thead><tr><th>Produit</th><th>Actuel</th><th>Règle</th></tr></thead><tbody>${i.details.slice(0, 8).map((x) => `<tr><td>${e(court(x.p.titre))}</td><td class="n">${euro(x.p.prixVenteHT)}</td><td class="n">${euro(x.apres)} ${x.d.action === 'valider' ? '<span class="badge b-attente sans-point">passe</span>' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="vide">Aucun prix ne change.</p>'}
      <div class="actions" style="margin-top:12px"><button class="btn btn-chaud" id="appliquer-regles" ${i.details.length ? '' : 'disabled'}>Appliquer ces règles</button></div>`;
    $('#appliquer-regles')?.addEventListener('click', () => {
      let auto = 0;
      let passe = 0;
      for (const x of i.details) {
        const etatPrix = x.d.action === 'valider' ? 'passe' : 'ok';
        etatPrix === 'ok' ? auto++ : passe++;
        noter({ type: 'Prix', etat: etatPrix, produit: x.p, titre: court(x.p.titre), fournisseur: 'Règles modifiées', decision: x.d, changement: etatPrix === 'ok' ? { prixVenteHT: x.apres } : {}, proposition: { prixVenteHT: x.apres }, lignes: [['Vente', `${euro(x.p.prixVenteHT)} → ${euro(x.apres)}`]], etapes: etatPrix === 'ok' ? 'Règles → Shopify → METRO' : 'Règles → au passe', explication: 'Nouvelle règle de marge.' });
      }
      toast(`${auto} prix appliqués, ${passe} au passe`);
      majImpact();
    });
  };
  const sur = (sel, ev, fn) => $$(sel).forEach((x) => x.addEventListener(ev, fn));
  sur('input[type="range"][data-groupe]', 'input', (ev) => {
    const { groupe, cle } = ev.target.dataset;
    const v = Number(ev.target.value);
    r[groupe][cle] = { ...(r[groupe][cle] || { type: 'coef', arrondi: r.defaut.arrondi }), valeur: v };
    $(`#o-${groupe}-${cle}`).innerHTML = `× ${coefFr(v)}<small>marge ${pct(1 - 1 / v, 0)}</small>`;
    sauverRegles();
    majImpact();
  });
  sur('[data-cat]', 'change', (ev) => {
    const k = ev.target.dataset.cat;
    if (ev.target.checked) r.categories[k] = { type: 'coef', valeur: r.fournisseurs.tefcold?.valeur || 1.4, arrondi: r.defaut.arrondi };
    else delete r.categories[k];
    sauverRegles();
    vueRegles();
  });
  sur('[data-excl]', 'change', (ev) => { r.exclusions[ev.target.dataset.excl] = ev.target.checked; sauverRegles(); });
  $('#arrondi').addEventListener('change', (ev) => {
    const a = ev.target.value;
    r.defaut.arrondi = a;
    for (const g of ['fournisseurs', 'categories']) for (const k of Object.keys(r[g])) r[g][k].arrondi = a;
    sauverRegles();
    majImpact();
  });
  $('#seuil').addEventListener('input', (ev) => { r.seuilAutoPct = Number(ev.target.value); $('#o-seuil').innerHTML = `${pct(r.seuilAutoPct, 0)}<small>de variation</small>`; sauverRegles(); majImpact(); });
  $('#mmin').addEventListener('input', (ev) => { r.margeMinMarketplace = Number(ev.target.value); $('#o-mmin').innerHTML = `${pct(r.margeMinMarketplace, 0)}<small>nette, après commission</small>`; sauverRegles(); });
  $('#reinit').addEventListener('click', () => { etat.regles = structuredClone(REGLES_DEFAUT); sauverRegles(); vueRegles(); toast('Règles d\'exemple rétablies'); });
  majImpact();
}

/* =========================================================
   Vue : Marketplaces + simulateur de Buy Box
   ========================================================= */
const bb = { id: '', commission: 0.12, port: 35, fixes: 0, concurrent: null, delaiConc: 7 };
function vueMarketplaces() {
  const ps = etat.produits;
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Marketplaces</h1><p>Vous choisissez ce qui est publié. Un produit ne part que s'il remplit les exigences du canal — sinon, le passe vous dit ce qui manque.</p></div></div>
    <div class="canaux">${MARKETPLACES.map((m) => {
      const ok = ps.filter((p) => eligible(p, m.exige).length === 0).length;
      const raisons = {};
      ps.forEach((p) => eligible(p, m.exige).forEach((x) => { raisons[x] = (raisons[x] || 0) + 1; }));
      return `<article class="panneau canal">
        <h3>${e(m.nom)}</h3><p class="petit" style="margin:0">${e(m.connexion)}</p>
        <p class="eligibles">${ok}<small style="font-size:.95rem;color:var(--encre-3)"> / ${ps.length} publiables</small></p>
        ${Object.keys(raisons).length ? `<p class="petit" style="margin:4px 0 0">Bloqués par : ${Object.entries(raisons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span class="badge b-alerte sans-point">${LIBELLE_EXIGE[k]} ×${v}</span>`).join(' ')}</p>` : ''}
        <ul>${m.faits.map((f) => `<li>${e(f)}</li>`).join('')}</ul>
      </article>`;
    }).join('')}</div>
    ${ps.filter((p) => eligible(p, MARKETPLACES[0].exige).length === 0).length === 0 && enAttente().some((i) => i.type === 'ean') ? '<div class="suggestion" style="margin-bottom:14px"><span>Deux EAN cachés dans des références Bartscher attendent au passe : validez-les et deux produits deviennent publiables sur METRO.</span><a class="btn btn-petit" href="#/passe">Aller au passe</a></div>' : ''}
    <section class="panneau" aria-labelledby="t-bb">
      <h2 id="t-bb">Simulateur de Buy Box</h2>
      <p class="sous">Le prix plancher garantit votre marge minimale (${pct(etat.regles.margeMinMarketplace, 0)} nette, réglable dans Règles) après commission et port. On ne descend jamais en dessous. Commissions et port : valeurs d'exemple, à remplacer par celles de votre contrat.</p>
      <div class="formulaire-bb">
        <div class="champ"><label for="bb-produit">Produit</label><select id="bb-produit">${ps.map((p) => `<option value="${e(p.id)}">${e(court(p.titre))}</option>`).join('')}</select></div>
        <div class="champ"><label for="bb-com">Commission (% du TTC)</label><input type="number" id="bb-com" min="0" max="40" step="0.5" value="${bb.commission * 100}"></div>
        <div class="champ"><label for="bb-port">Port à votre charge (€ HT)</label><input type="number" id="bb-port" min="0" step="1" value="${bb.port}"></div>
        <div class="champ"><label for="bb-conc">Prix du concurrent (€ HT)</label><input type="number" id="bb-conc" min="0" step="1"></div>
        <div class="champ"><label for="bb-dc">Délai du concurrent (jours)</label><input type="number" id="bb-dc" min="0" step="1" value="${bb.delaiConc}"></div>
      </div>
      <div id="bb-resultat"></div>
    </section>`;
  if (!bb.id) bb.id = (ps.find((p) => p.id.startsWith('plancha-gdp-650e')) || ps[0]).id;
  $('#bb-produit').value = bb.id;
  const calculer = () => {
    const p = produit(bb.id);
    if (bb.concurrent === null) bb.concurrent = Math.round(p.prixVenteHT * 0.96);
    $('#bb-conc').value = bb.concurrent;
    const plancher = prixPlancher({ prixAchatHT: p.prixAchatHT, commissionPct: bb.commission, fraisPortHT: bb.port, fraisFixesHT: bb.fixes, margeMinPct: etat.regles.margeMinMarketplace });
    const s = strategieBuyBox({ plancherHT: plancher, prixConcurrentHT: bb.concurrent, prixActuelHT: p.prixVenteHT, pasHT: 1, delaiJours: p.delaiJours, delaiConcurrentJours: bb.delaiConc });
    const net = margeNette({ prixHT: s.prixHT, prixAchatHT: p.prixAchatHT, commissionPct: bb.commission, fraisPortHT: bb.port });
    const vals = [plancher, bb.concurrent, s.prixHT, p.prixVenteHT].filter(Number.isFinite);
    const min = Math.min(...vals) * 0.94;
    const max = Math.max(...vals) * 1.04;
    const pos = (v) => `${((v - min) / (max - min)) * 100}%`;
    const titres = { gagnable: 'Buy Box gagnable', plancher: 'On ne suit pas : marge protégée', delai: 'On joue le délai', seul: 'Seul vendeur' };
    $('#bb-resultat').innerHTML = `
      <div class="echelle" aria-hidden="true">
        <div class="axe"></div><div class="zone-perte" style="width:${pos(plancher)}"></div>
        ${Math.abs(s.prixHT - plancher) < (max - min) * 0.12
          ? `<div class="repere reco" style="left:${pos(s.prixHT)}">${s.prixHT === plancher ? 'conseillé = plancher' : 'conseillé · plancher'}<br>${euro(s.prixHT)}</div>`
          : `<div class="repere plancher" style="left:${pos(plancher)}">plancher<br>${euro(plancher)}</div><div class="repere reco" style="left:${pos(s.prixHT)}">conseillé<br>${euro(s.prixHT)}</div>`}
        <div class="repere bas concurrent" style="left:${pos(bb.concurrent)}">concurrent ${euro(bb.concurrent)}</div>
      </div>
      <div class="verdict-bb ${s.statut}"><strong>${titres[s.statut]}</strong><p>${e(s.message)}</p></div>
      <div class="calcul" style="margin-top:12px">
        <span>Prix d'achat HT <span class="origine simule">simulé</span></span><span class="num">${euro(p.prixAchatHT)}</span>
        <span>Prix boutique HT <span class="origine reel">réel</span></span><span class="num">${euro(p.prixVenteHT)}</span>
        <span>Commission au prix conseillé</span><span class="num">${euro(net.commission)}</span>
        <span>Port</span><span class="num">${euro(bb.port)}</span>
        <span class="total">Reste en poche (HT)</span><span class="total num">${euro(net.net)} · ${pct(net.pct)}</span>
      </div>
      <p class="petit" style="margin-top:10px">Notre délai : ${p.delaiJours} jours (simulé). La Buy Box ne dépend pas que du prix : délai, stock disponible et note vendeur comptent aussi.</p>`;
  };
  $('#bb-produit').addEventListener('change', (ev) => { bb.id = ev.target.value; bb.concurrent = null; calculer(); });
  $('#bb-com').addEventListener('input', (ev) => { bb.commission = Math.max(0, Number(ev.target.value) / 100 || 0); calculer(); });
  $('#bb-port').addEventListener('input', (ev) => { bb.port = Math.max(0, Number(ev.target.value) || 0); calculer(); });
  $('#bb-conc').addEventListener('change', (ev) => { bb.concurrent = Math.max(0, Number(ev.target.value) || 0); calculer(); });
  $('#bb-dc').addEventListener('input', (ev) => { bb.delaiConc = Math.max(0, Number(ev.target.value) || 0); calculer(); });
  calculer();
}

/* =========================================================
   Vue : Journal
   ========================================================= */
function vueJournal() {
  vue.innerHTML = `
    <div class="vue-tete"><div><h1>Journal</h1><p>Tout ce qui a été reçu, décidé et envoyé. En production, cet historique est gardé dans la base : on peut toujours savoir pourquoi un prix a bougé.</p></div></div>
    <section class="panneau"><div class="journal">${etat.journal.map((j) => `
      <div class="journal-ligne"><time>${heure(j.date)}</time><span><strong>${e(j.type)}</strong> · ${e(j.titre)}</span>
      <span class="badge ${j.etat === 'ok' ? 'b-ok' : j.etat === 'passe' ? 'b-chaud' : 'b-info'}">${j.etat === 'ok' ? 'envoyé' : j.etat === 'passe' ? 'au passe' : 'verrou'}</span>
      <span class="jl-detail">${e(j.fournisseur)} — ${(j.lignes || []).map(([a, b]) => `${e(a)} ${e(b)}`).join(' · ')}</span></div>`).join('') || '<p class="vide">Rien pour l\'instant.</p>'}</div></section>`;
}

const VUES = { tableau: vueTableau, fournisseurs: vueFournisseurs, catalogue: vueCatalogue, passe: vuePasse, regles: vueRegles, marketplaces: vueMarketplaces, journal: vueJournal };
router();
