// Point d'entrée : navigation par l'adresse (#/…), affichage des vues, écoute des gestes de l'utilisateur.

import { etat, sauver, calculerDroits } from './etat.js';
import { t, lang, dir } from './i18n.js';
import { ico, esc, fermerFeuille, toast } from './ui.js';
import { CONFIG } from './config.js';
import * as decouvrir from './vues/decouvrir.js';
import * as recette from './vues/recette.js';
import * as outils from './vues/outils.js';
import * as apprendre from './vues/apprendre.js';
import * as moi from './vues/moi.js';
import * as pro from './vues/pro.js';

const modules = [decouvrir, recette, outils, apprendre, moi, pro];
const actions = Object.assign({}, ...modules.map((m) => m.actions || {}));
const saisies = Object.assign({}, ...modules.map((m) => m.saisies || {}));
const changements = Object.assign({}, ...modules.map((m) => m.changements || {}));

const ROUTES = {
  '': () => decouvrir.accueil(),
  explorer: (a) => decouvrir.explorer(a),
  r: (id) => recette.recette(id),
  cuisine: (id) => recette.cuisine(id),
  favoris: () => recette.favoris(),
  carnet: () => recette.carnet(),
  cesoir: () => outils.cesoir(),
  frigo: () => outils.frigo(),
  courses: () => outils.courses(),
  plan: (type) => outils.plan(type),
  apprendre: (o) => apprendre.apprendre(o),
  parcours: (id) => apprendre.parcours(id),
  moi: () => moi.moi(),
  offres: () => moi.offres(),
  partenaires: () => moi.partenaires(),
  apropos: () => moi.apropos(),
  prix: () => moi.carnetPrix(),
  pro: (s) => pro.pro(s),
  'mes-recettes': (s) => pro.mesRecettes(s),
};

// Onglet du bas allumé pour chaque vue.
const ONGLET = {
  '': 'accueil', explorer: 'explorer', r: 'explorer',
  cesoir: 'cesoir', frigo: 'cesoir', courses: 'cesoir', plan: 'cesoir',
  apprendre: 'apprendre', parcours: 'apprendre',
};
const ONGLETS = [['accueil', '#/', 'accueil'], ['explorer', '#/explorer', 'chercher'], ['cesoir', '#/cesoir', 'idee'], ['apprendre', '#/apprendre', 'livre'], ['moi', '#/moi', 'moi']];

const vue = document.getElementById('vue');
const nav = document.getElementById('nav');
let installation = null; // invite d'installation retenue

function route() {
  let brut = location.hash.replace(/^#\/?/, '');
  try {
    brut = decodeURIComponent(brut);
  } catch {
    /* adresse mal formée : on la garde telle quelle */
  }
  const [nom = '', ...reste] = brut.split('/');
  return { nom, arg: reste.join('/') };
}

function afficher(garderDefilement = false) {
  const { nom, arg } = route();
  if (nom === 'activer') {
    history.replaceState(null, '', '#/offres');
    moi.activer(arg, app).then(() => afficher());
    return;
  }
  if (nom !== 'cuisine') recette.quitterCuisine();
  const y = window.scrollY;
  const rendre = ROUTES[nom] || ROUTES[''];
  vue.innerHTML = rendre(arg);
  document.body.dataset.vue = ROUTES[nom] ? nom || 'accueil' : 'accueil';
  const actif = ONGLET[nom] ?? (ROUTES[nom] ? 'moi' : 'accueil');
  nav.querySelectorAll('a').forEach((a) => {
    const oui = a.dataset.o === actif;
    a.classList.toggle('actif', oui);
    if (oui) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, garderDefilement ? y : 0);
  if (nom === 'cuisine') recette.apresCuisine();
  const bouton = document.getElementById('bouton-installer');
  if (bouton) bouton.hidden = !installation;
  const h1 = vue.querySelector('h1');
  document.title = h1 && nom ? `${h1.textContent} · ${CONFIG.nom}` : `${CONFIG.nom} · ${t('ceSoirTitre')}`;
}

function dessinerNav() {
  nav.innerHTML = ONGLETS.map(([o, lien, icone]) => `<a href="${lien}" data-o="${o}" class="${o === 'cesoir' ? 'central' : ''}">${ico(icone)}<span>${esc(t(`nav.${o}`))}</span></a>`).join('');
}

function appliquerLangue() {
  document.documentElement.lang = lang();
  document.documentElement.dir = dir();
  dessinerNav();
  afficher();
}

function appliquerTheme() {
  document.documentElement.dataset.theme = etat.theme;
  const sombre = etat.theme === 'sombre' || (etat.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', sombre ? '#17120f' : '#fbf6ee');
}

const app = {
  rafraichir: () => afficher(true),
  aller(adresse) {
    if (location.hash === adresse) afficher();
    else location.hash = adresse;
  },
  langue: appliquerLangue,
  theme: appliquerTheme,
  async installer() {
    if (!installation) return;
    installation.prompt();
    await installation.userChoice;
    installation = null;
    afficher(true);
  },
};

/* ---------- Écoutes ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  const nom = el.dataset.a;
  if (nom === 'retour') {
    if (history.length > 1) history.back();
    else app.aller('#/');
    return;
  }
  if (nom === 'fermerFeuille') {
    fermerFeuille();
    return; // un lien continue vers sa destination
  }
  if (actions[nom]) {
    if (el.tagName !== 'A') e.preventDefault();
    actions[nom](el, e, app);
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-s]');
  if (el && saisies[el.dataset.s]) saisies[el.dataset.s](el, e, app);
});

document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-c]');
  if (el && changements[el.dataset.c]) changements[el.dataset.c](el, e, app);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fermerFeuille();
  if (e.key === 'Enter' && e.target.dataset?.entree && actions[e.target.dataset.entree]) {
    e.preventDefault();
    actions[e.target.dataset.entree](e.target, e, app);
  }
  if (document.body.dataset.vue === 'cuisine' && !e.target.closest('input, textarea') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const avance = (e.key === 'ArrowRight') !== (dir() === 'rtl');
    actions[avance ? 'pasSuivant' : 'pasPrecedent'](null, e, app);
  }
});

// En mode cuisine, on passe d'une étape à l'autre en glissant le doigt.
let departX = null;
document.addEventListener('touchstart', (e) => {
  departX = document.body.dataset.vue === 'cuisine' && !e.target.closest('button, a, input, textarea, video') ? e.touches[0].clientX : null;
}, { passive: true });
document.addEventListener('touchend', (e) => {
  if (departX == null) return;
  const dx = e.changedTouches[0].clientX - departX;
  departX = null;
  if (Math.abs(dx) < 70) return;
  const avance = dx < 0 !== (dir() === 'rtl');
  actions[avance ? 'pasSuivant' : 'pasPrecedent'](null, e, app);
}, { passive: true });

window.addEventListener('hashchange', () => {
  fermerFeuille();
  afficher();
});
window.addEventListener('offline', () => toast(t('horsLigne')));
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installation = e;
  const bouton = document.getElementById('bouton-installer');
  if (bouton) bouton.hidden = false;
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', appliquerTheme);

/* ---------- Démarrage ---------- */

if (!['fr', 'ar', 'en'].includes(etat.lang)) etat.lang = 'fr';
sauver();
appliquerTheme();
calculerDroits().then(appliquerLangue);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
