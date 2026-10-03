// Espace admin Algerian Product : connexion, navigation, brouillon et publication.
// Démo : tout est enregistré dans ce navigateur. En production : comptes, API et base de données.
import { loadDefault, readDraft, readPublished, saveDraft, publish } from '../store.js';
import { emblem } from '../art.js';
import { S, esc, toast, closeDrawer } from './ui.js';
import { seedInbox } from './sample.js';
import dashboard from './views/dashboard.js';
import inbox from './views/inbox.js';
import products from './views/products.js';
import sectors from './views/sectors.js';
import film from './views/film.js';
import markets from './views/markets.js';
import texts from './views/texts.js';
import languages from './views/languages.js';
import seo from './views/seo.js';
import settings from './views/settings.js';

const PW_KEY = 'ap:admin:pw';
const AUTH = 'ap:admin:auth';
const $ = (s) => document.querySelector(s);

const VIEWS = [
  ['tableau', 'Tableau de bord', '◎', dashboard],
  ['demandes', 'Demandes', '✉', inbox],
  ['produits', 'Produits', '▦', products],
  ['filieres', 'Filières', '◇', sectors],
  ['film', 'Film & régions', '▶', film],
  ['marches', 'Marchés', '◍', markets],
  ['textes', 'Textes du site', '¶', texts],
  ['langues', 'Langues', 'A', languages],
  ['seo', 'SEO & partage', '↗', seo],
  ['reglages', 'Réglages', '⚙', settings],
];

const password = () => {
  try {
    return localStorage.getItem(PW_KEY) || 'algerian';
  } catch {
    return 'algerian';
  }
};

async function start() {
  S.draft = readDraft() || readPublished() || (await loadDefault('../'));
  seedInbox();
  S.lang = S.draft.defaultLang || 'fr';
  let timer;
  S.onChange = () => {
    S.dirty = true;
    updatePubState();
    clearTimeout(timer);
    timer = setTimeout(() => {
      S.draft.updatedAt = new Date().toISOString();
      if (!saveDraft(S.draft)) toast('Stockage du navigateur plein : retirez des photos ou exportez une sauvegarde.', 'err');
    }, 300);
  };
  $('#side-mark').innerHTML = emblem();
  $('#nav').innerHTML = VIEWS.map(([id, label, ico]) => `<a href="#${id}" data-view="${id}"><span class="nav__i">${ico}</span>${label}<b class="nav__n" data-count="${id}"></b></a>`).join('');
  renderLangSwitch();
  updatePubState();
  $('#app').hidden = false;
  addEventListener('hashchange', route);
  route();

  $('#publish').addEventListener('click', () => {
    S.draft.updatedAt = new Date().toISOString();
    if (publish(S.draft)) {
      S.dirty = false;
      updatePubState();
      toast('Publié : le site affiche maintenant ces contenus.', 'ok');
    } else toast('Échec de la publication (stockage plein).', 'err');
  });
  $('#preview').addEventListener('click', () => saveDraft(S.draft));
  $('#logout').addEventListener('click', () => {
    try {
      sessionStorage.removeItem(AUTH);
    } catch {}
    location.reload();
  });
  $('#menu-btn').addEventListener('click', () => document.body.classList.toggle('side-open'));
  $('#nav').addEventListener('click', () => document.body.classList.remove('side-open'));
}

export function renderLangSwitch() {
  $('#edit-lang').innerHTML = S.draft.languages
    .map((l) => `<button type="button" data-lang="${esc(l.code)}" aria-pressed="${l.code === S.lang}" title="Éditer en ${esc(l.name)}">${esc(l.code.toUpperCase())}</button>`)
    .join('');
  $('#edit-lang').onclick = (e) => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    S.lang = b.dataset.lang;
    renderLangSwitch();
    route();
  };
}

function updatePubState() {
  const pub = readPublished();
  const same = pub && JSON.stringify(pub) === JSON.stringify(S.draft);
  const el = $('#pubstate');
  if (!pub && !S.dirty) {
    el.textContent = 'Contenu d’origine';
    el.className = 'pubstate';
  } else if (same) {
    el.textContent = 'Publié';
    el.className = 'pubstate is-ok';
  } else {
    el.textContent = 'Modifications non publiées';
    el.className = 'pubstate is-warn';
  }
}

export function refreshCounts() {
  import('../store.js').then(({ readInbox }) => {
    const n = readInbox().filter((x) => x.status === 'new').length;
    const el = document.querySelector('[data-count="demandes"]');
    if (el) el.textContent = n || '';
  });
}

function route() {
  closeDrawer();
  const id = location.hash.slice(1).split(/[\/?]/)[0] || 'tableau';
  const v = VIEWS.find((x) => x[0] === id) || VIEWS[0];
  document.querySelectorAll('#nav a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.view === v[0])));
  $('#view-title').textContent = v[1];
  document.title = `${v[1]} — Admin Algerian Product`;
  const el = $('#view');
  el.className = `view view--${v[0]}`;
  el.innerHTML = '';
  v[3](el, { refresh: route, refreshCounts, renderLangSwitch });
  refreshCounts();
  scrollTo(0, 0);
}

// Connexion
function authed() {
  try {
    return sessionStorage.getItem(AUTH) === '1';
  } catch {
    return false;
  }
}
if (authed()) start();
else {
  $('#login').hidden = false;
  $('#login-mark').innerHTML = emblem();
  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = new FormData(e.target).get('pw');
    if (pw === password()) {
      try {
        sessionStorage.setItem(AUTH, '1');
      } catch {}
      $('#login').hidden = true;
      start();
    } else $('#login-err').textContent = 'Mot de passe incorrect.';
  });
}
