// Accueil et exploration du catalogue.

import { t, tl, lang } from '../i18n.js';
import { etat, sauver, dejaCuisine } from '../etat.js';
import { RECETTES, ASTUCES, PARCOURS } from '../data/index.js';
import { carte, ico, esc, entete, vide } from '../ui.js';
import { tempsTotal, coutParPart, niveauBudget, chercher } from '../core.js';
import { CONFIG } from '../config.js';

const budget = (r) => niveauBudget(coutParPart(r, etat.devise, etat.prix), etat.devise);

// Les mêmes critères servent aux collections de l'accueil et aux filtres de l'exploration.
const CRITERES = {
  ramadan: (r) => r.tags.includes('ramadan'),
  rapide: (r) => tempsTotal(r) <= 30 && r.cat !== 'base',
  budget: (r) => budget(r) === 1 && r.cat !== 'base',
  fetes: (r) => r.tags.includes('aid') || r.tags.includes('fete'),
  monde: (r) => r.c !== 'dz',
  dz: (r) => r.c === 'dz',
  sansfour: (r) => r.tags.includes('sans-four'),
  vegetarien: (r) => r.tags.includes('vegetarien'),
  sansgluten: (r) => r.tags.includes('sans-gluten'),
  facile: (r) => r.diff === 1,
};
const COLLECTIONS = ['ramadan', 'rapide', 'budget', 'fetes', 'monde', 'sansfour'];
const FILTRES = ['rapide', 'budget', 'facile', 'sansfour', 'vegetarien', 'ramadan', 'fetes', 'dz', 'monde', 'sansgluten'];

function joursAvantRamadan() {
  const debut = new Date(`${CONFIG.ramadan.debut}T00:00:00`);
  return Math.ceil((debut - new Date()) / 86400000);
}

function bandeauRamadan() {
  const j = joursAvantRamadan();
  if (j < -CONFIG.ramadan.jours || j > 120) return '';
  const titre = j > 0 ? t('ramadanDans', { n: j }) : t('ramadanJour', { n: Math.min(CONFIG.ramadan.jours, 1 - j) });
  return `<a class="bandeau ramadan" href="#/plan/ramadan">
    <span class="croissant" aria-hidden="true"></span>
    <span><strong>${esc(titre)}</strong><small>${esc(t('ramadanTexte'))}</small></span>
    ${ico('suivant', 'dir')}
  </a>`;
}

function parcoursEnCours() {
  const fait = (e) => (e[0] === 'r' ? dejaCuisine(e[1]) : etat.gestesVus.includes(e[1]));
  const p = PARCOURS.find((x) => x.etapes.some(fait) && !x.etapes.every(fait)) || PARCOURS[0];
  const n = p.etapes.filter(fait).length;
  return `<a class="bandeau parcours" href="#/parcours/${p.id}">
    <span class="jauge-ronde" style="--p:${Math.round((n / p.etapes.length) * 100)}">${n}/${p.etapes.length}</span>
    <span><strong>${esc(tl(p.t))}</strong><small>${esc(tl(p.d))}</small></span>
    <span class="pastille">${esc(n ? t('continuer') : t('commencer'))}</span>
  </a>`;
}

export function accueil() {
  const h = new Date().getHours();
  const salut = h < 12 ? t('bonjour') : h < 18 ? t('bonApresMidi') : t('bonsoir');
  const astuce = ASTUCES[Math.floor(Date.now() / 86400000) % ASTUCES.length];
  const nCourses = etat.courses.length;
  const rangee = (id) => {
    const liste = RECETTES.filter(CRITERES[id]).slice(0, 8);
    if (!liste.length) return '';
    return `<section class="rangee">
      <div class="rangee-tete"><h2>${esc(t(`col.${id}`))}</h2><a href="#/explorer/${id}">${esc(t('toutVoir'))}</a></div>
      <div class="defile">${liste.map((r) => carte(r)).join('')}</div>
    </section>`;
  };
  return `<div class="page accueil">
    <header class="tete">
      <a class="marque" href="#/" aria-label="${esc(CONFIG.nom)}"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#logo"/></svg><span>${lang() === 'ar' ? 'بنّة' : 'Benna'}</span></a>
      <div class="langues" role="group" aria-label="${esc(t('langue'))}">
        ${['fr', 'ar', 'en'].map((l) => `<button data-a="langue" data-l="${l}" class="${lang() === l ? 'actif' : ''}" aria-pressed="${lang() === l}">${{ fr: 'FR', ar: 'ع', en: 'EN' }[l]}</button>`).join('')}
      </div>
    </header>
    <section class="hero">
      <p class="salut">${esc(salut)}</p>
      <h1>${esc(t('ceSoirTitre'))}</h1>
      <p>${esc(t('ceSoirTexte'))}</p>
      <a class="bouton clair" href="#/cesoir">${ico('idee')}${esc(t('ceSoirBouton'))}</a>
    </section>
    <nav class="outils" aria-label="${esc(t('outils'))}">
      <a href="#/frigo">${ico('frigo')}<span>${esc(t('outilFrigo'))}</span></a>
      <a href="#/courses">${ico('panier')}<span>${esc(t('outilCourses'))}</span>${nCourses ? `<b>${nCourses}</b>` : ''}</a>
      <a href="#/plan/semaine">${ico('calendrier')}<span>${esc(t('outilPlan'))}</span></a>
      <a href="#/apprendre/sos">${ico('sos')}<span>${esc(t('outilSos'))}</span></a>
    </nav>
    ${bandeauRamadan()}
    <aside class="astuce"><h2>${ico('idee')}${esc(t('astuceJour'))}</h2><p>${esc(tl(astuce))}</p></aside>
    ${rangee('ramadan')}
    ${rangee('rapide')}
    ${parcoursEnCours()}
    ${rangee('budget')}
    ${rangee('fetes')}
    <aside class="partenaire">
      <span class="etiquette">${esc(t('exemple'))}</span>
      <h2>${esc(t('partenaireTitre'))}</h2>
      <p>${esc(t('partenaireTexte'))}</p>
      <a class="bouton contour" href="#/partenaires">${esc(t('partenaireBouton'))}</a>
    </aside>
    ${rangee('monde')}
    ${rangee('sansfour')}
  </div>`;
}

/* ---------- Explorer ---------- */

const filtres = { q: '', kind: '', puces: new Set() };

function resultats() {
  let liste = chercher(RECETTES, filtres.q, lang());
  if (filtres.kind) liste = liste.filter((r) => r.kind === filtres.kind);
  for (const p of filtres.puces) liste = liste.filter(CRITERES[p]);
  if (!liste.length) return vide('chercher', t('aucunResultat'), t('aucunResultatTexte'));
  return `<p class="compte">${esc(t('nRecettes', { n: liste.length }))}</p><div class="grille">${liste.map((r) => carte(r)).join('')}</div>`;
}

const puces = () =>
  `${['', 'sale', 'sucre'].map((k) => `<button class="puce ${filtres.kind === k ? 'actif' : ''}" data-a="filtreGenre" data-k="${k}" aria-pressed="${filtres.kind === k}">${esc(t(k || 'tout'))}</button>`).join('')}
   <span class="sep"></span>
   ${FILTRES.map((f) => `<button class="puce ${filtres.puces.has(f) ? 'actif' : ''}" data-a="filtre" data-f="${f}" aria-pressed="${filtres.puces.has(f)}">${esc(t(`f.${f}`))}</button>`).join('')}`;

export function explorer(collection) {
  if (collection && CRITERES[collection]) {
    filtres.puces = new Set([collection]);
    filtres.kind = '';
    filtres.q = '';
    history.replaceState(null, '', '#/explorer');
  }
  return `<div class="page">
    ${entete(t('nav.explorer'), { retour: false })}
    <label class="recherche">${ico('chercher')}<input type="search" data-s="recherche" value="${esc(filtres.q)}" placeholder="${esc(t('rechercher'))}" aria-label="${esc(t('rechercher'))}" autocomplete="off" enterkeyhint="search"></label>
    <div class="puces" id="puces">${puces()}</div>
    <div id="resultats">${resultats()}</div>
  </div>`;
}

const majExplorer = () => {
  const p = document.getElementById('puces');
  const r = document.getElementById('resultats');
  if (p) p.innerHTML = puces();
  if (r) r.innerHTML = resultats();
};

export const actions = {
  filtreGenre(el) {
    filtres.kind = el.dataset.k;
    majExplorer();
  },
  filtre(el) {
    const f = el.dataset.f;
    if (filtres.puces.has(f)) filtres.puces.delete(f);
    else filtres.puces.add(f);
    majExplorer();
  },
  langue(el, e, app) {
    etat.lang = el.dataset.l;
    sauver();
    app.langue();
  },
};

export const saisies = {
  recherche(el) {
    filtres.q = el.value;
    const r = document.getElementById('resultats');
    if (r) r.innerHTML = resultats();
  },
};
