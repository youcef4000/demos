// Melissa — espace atelier. Planning des rendez-vous, modèles à réaliser, production, réalisations,
// stock, achats, commandes et clientes, pensés pour le téléphone de la créatrice.
// Démo sans serveur : tout reste dans ce navigateur (voir ../store.js).
import { S, $, $$, esc, icon, toast, setupSheet, openSheet, closeSheet, ask, REDUCE } from './ui.js';
import { loadData, resetData, readRequests, stockAlerts, lowMatieres, paceOf } from '../store.js';
import { createSilk } from '../silk.js';
import * as aujourdhui from './views/aujourdhui.js';
import * as planning from './views/planning.js';
import * as modeles from './views/modeles.js';
import * as production from './views/production.js';
import * as realisations from './views/realisations.js';
import * as stock from './views/stock.js';
import * as achats from './views/achats.js';
import * as commandes from './views/commandes.js';
import * as clientes from './views/clientes.js';
import * as reglages from './views/reglages.js';

const PASS = 'melissa';
const SESSION = 'melissa:admin';

const open = (o) => ['nouvelle', 'confirmee', 'preparee'].includes(o.statut);
const VIEWS = [
  { id: 'aujourdhui', label: "Aujourd'hui", icon: 'home', mod: aujourdhui, group: "L'atelier", tab: 1 },
  { id: 'planning', label: 'Planning', icon: 'calendar', mod: planning, group: "L'atelier", tab: 2, badge: () => readRequests().length },
  { id: 'modeles', label: 'Modèles à réaliser', short: 'Modèles', icon: 'sketch', mod: modeles, group: 'Création' },
  { id: 'production', label: 'Production', icon: 'needle', mod: production, group: 'Création', tab: 3, badge: () => S.data.production.filter((p) => paceOf(p) === 'retard').length, warn: true },
  { id: 'realisations', label: 'Réalisations', icon: 'hanger', mod: realisations, group: 'Création' },
  { id: 'stock', label: 'Stock', icon: 'box', mod: stock, group: 'Boutique', tab: 4, badge: () => stockAlerts(S.data).length + lowMatieres(S.data).length, warn: true },
  { id: 'achats', label: 'Achats', icon: 'bag', mod: achats, group: 'Boutique', badge: () => S.data.achats.filter((a) => a.status === 'a-acheter').length },
  { id: 'commandes', label: 'Commandes', icon: 'receipt', mod: commandes, group: 'Boutique', badge: () => S.data.commandes.filter(open).length },
  { id: 'clientes', label: 'Clientes', icon: 'users', mod: clientes, group: 'Boutique' },
  { id: 'reglages', label: 'Réglages', icon: 'gear', mod: reglages, group: '' },
];
let current = null;
let silk = null;

init();

function init() {
  let ok = false;
  try {
    ok = sessionStorage.getItem(SESSION) === '1';
  } catch {}
  if (ok) start();
  else showLogin();
}

function showLogin() {
  const login = $('#login');
  login.hidden = false;
  silk = createSilk($('#silk'), { colors: ['#d7bfb0', '#f4eadf', '#fffaf4'], scale: 0.4 });
  if (silk) {
    $('#silk').classList.add('is-ready');
    if (REDUCE) silk.render();
    else silk.start();
    login.addEventListener('pointermove', (e) => silk.setMouse(e.clientX / innerWidth, e.clientY / innerHeight));
  }
  $('#login-pass').focus();
  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#login-pass').value.trim().toLowerCase();
    if (v !== PASS) {
      $('#login-err').textContent = 'Mot de passe incorrect.';
      $('#login-form').classList.remove('shake');
      void $('#login-form').offsetWidth;
      $('#login-form').classList.add('shake');
      return;
    }
    try {
      sessionStorage.setItem(SESSION, '1');
    } catch {}
    login.classList.add('is-leaving');
    setTimeout(
      () => {
        silk?.stop();
        login.hidden = true;
        start();
      },
      REDUCE ? 0 : 650,
    );
  });
}

function start() {
  $('#app').hidden = false;
  setupSheet();
  buildNav();
  S.render = render;
  S.go = (id) => {
    if (location.hash === `#/${id}`) render();
    else location.hash = `#/${id}`;
  };
  window.addEventListener('hashchange', () => {
    if ($('#sheet').open) closeSheet();
    render(true);
  });
  document.addEventListener('click', onGlobalClick);
  // Une demande prise sur le site (autre onglet) arrive ici en direct
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith('melissa:')) return;
    if (e.key === 'melissa:atelier:v1') S.data = loadData();
    if (e.key === 'melissa:demandes:v1') {
      const before = JSON.parse(e.oldValue || '[]').length;
      if (readRequests().length > before) toast('Nouvelle demande de rendez-vous depuis le site', false, { href: '#/planning', label: 'Voir' });
    }
    render();
  });
  render(true);
}

function buildNav() {
  let last = null;
  let h = '';
  for (const v of VIEWS) {
    if (v.group !== last) {
      h += v.group ? `<p class="side__group">${esc(v.group)}</p>` : '<p class="side__group side__group--sp"></p>';
      last = v.group;
    }
    h += `<a href="#/${v.id}" data-view="${v.id}">${icon(v.icon)}<span>${esc(v.label)}</span><em class="badge" hidden></em></a>`;
  }
  $('#side-nav').innerHTML = h;
  const tabs = VIEWS.filter((v) => v.tab).sort((a, b) => a.tab - b.tab);
  $('#tabs').innerHTML =
    tabs.map((v) => `<a href="#/${v.id}" data-view="${v.id}">${icon(v.icon)}<span>${esc(v.short || v.label)}</span><em class="badge" hidden></em></a>`).join('') +
    `<button type="button" data-more>${icon('menu')}<span>Plus</span><em class="badge" hidden></em></button>`;
}

function updateNav() {
  for (const a of $$('[data-view]')) {
    const v = VIEWS.find((x) => x.id === a.dataset.view);
    a.classList.toggle('is-active', v === current);
    if (v === current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
    const n = v.badge ? v.badge() : 0;
    const b = $('.badge', a);
    b.hidden = !n;
    b.textContent = n;
    b.classList.toggle('badge--warn', !!v.warn);
  }
  const moreCount = VIEWS.filter((v) => !v.tab && v.badge).reduce((a, v) => a + v.badge(), 0);
  const mb = $('[data-more] .badge');
  mb.hidden = !moreCount;
  mb.textContent = moreCount;
  $('[data-more]').classList.toggle('is-active', current && !current.tab);
}

function render(fresh = false) {
  const id = location.hash.replace(/^#\/?/, '').split('?')[0] || 'aujourdhui';
  const v = VIEWS.find((x) => x.id === id) || VIEWS[0];
  const changed = v !== current;
  current = v;
  const view = $('#view');
  const y = window.scrollY;
  const root = document.createElement('div');
  root.className = `v v--${v.id}${changed || fresh ? ' is-entering' : ''}`;
  view.replaceChildren(root);
  try {
    v.mod.render(root);
  } catch (err) {
    console.error(err);
    root.innerHTML = `<p class="empty">Cette rubrique n'a pas pu s'afficher.</p>`;
  }
  document.title = `${v.label} — Melissa Atelier`;
  updateNav();
  if (changed || fresh) {
    window.scrollTo(0, 0);
    if (changed && !fresh) view.focus({ preventScroll: true });
  } else window.scrollTo(0, y);
}

async function onGlobalClick(e) {
  if (e.target.closest('[data-logout]')) {
    try {
      sessionStorage.removeItem(SESSION);
    } catch {}
    location.hash = '';
    location.reload();
    return;
  }
  if (e.target.closest('[data-reset]')) {
    if (!(await ask("Remettre les données d'exemple ? Vos modifications seront effacées.", 'Réinitialiser'))) return;
    resetData();
    S.data = loadData();
    render(true);
    toast("Données d'exemple remises à zéro");
    return;
  }
  if (e.target.closest('[data-more]')) moreSheet();
}

function moreSheet() {
  openSheet({
    title: 'Toutes les rubriques',
    submit: false,
    cancel: 'Fermer',
    noFocus: true,
    body: `<nav class="more">${VIEWS.map((v) => {
      const n = v.badge ? v.badge() : 0;
      return `<a href="#/${v.id}" class="${v === current ? 'is-active' : ''}" data-sheet-close>${icon(v.icon)}<span>${esc(v.label)}</span>${n ? `<em class="badge${v.warn ? ' badge--warn' : ''}">${n}</em>` : ''}</a>`;
    }).join('')}</nav>
    <div class="more__foot"><a href="../" target="_blank" rel="noopener">Voir le site ↗</a><button type="button" data-logout>Se déconnecter</button></div>`,
  });
}
