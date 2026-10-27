// Tlemceni — espace admin. Modifie tout le contenu du site (textes en français, arabe et anglais,
// coloris de la basket 3D, photos, chiffres, boutiques, événement, liens), l'enregistre en brouillon
// à chaque frappe et le publie d'un clic. Aperçu du vrai site en direct.
// Démo sans serveur : brouillon et publication restent dans ce navigateur (voir ../store.js).
import { loadDefault, readDraft, readPublished, saveDraft, publish, resetLocal, usageKB, esc, formatStat } from '../store.js';

const PASS = 'tlemceni';
const SESSION = 'tlemceni:admin';
const QUOTA_KB = 4800;
const LANGS = { fr: 'FR', ar: 'AR', en: 'EN' };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clone = (o) => JSON.parse(JSON.stringify(o));
const pad = (n) => String(n).padStart(2, '0');

let C = null; // contenu en cours d'édition
let original = null; // content.json
let publishedJSON = '';
let view = 'textes';
let lang = 'fr';
let previewReady = false;
let pending = [];

const VIEWS = {
  textes: { title: 'Textes du site', crumb: 'Contenu', target: '#eclate' },
  basket: { title: 'La basket 3D', crumb: 'Contenu', target: 'step:laces' },
  coloris: { title: 'Coloris de la basket', crumb: 'Basket 3D', target: 'step:final' },
  photos: { title: 'Photos', crumb: 'Visuels', target: '#univers' },
  communaute: { title: 'Chiffres & communauté', crumb: 'Contenu', target: '#communaute' },
  boutiques: { title: 'Boutiques', crumb: 'Informations', target: '#boutiques' },
  evenement: { title: 'Événement', crumb: 'Informations', target: '#ecsel' },
  liens: { title: 'Liens & WhatsApp', crumb: 'Réglages', target: '#pro' },
  sauvegarde: { title: 'Sauvegarde', crumb: 'Réglages' },
};

// Textes regroupés par section du site : [clé, libellé, 'area' pour un texte long, aide]
const TEXT_SECTIONS = [
  { title: 'Accueil', hint: 'Le premier écran, avec la basket.', target: '#eclate', fields: [
    ['hero.eyebrow', 'Surtitre'], ['hero.title', 'Grand titre', 'area', 'Retour à la ligne pour couper la phrase ; *entre étoiles* = en rouge.'], ['hero.lead', "Texte d'introduction", 'area'],
    ['hero.chip1', 'Pastille 1'], ['hero.chip2', 'Pastille 2'], ['hero.chip3', 'Pastille 3'], ['hero.scroll', 'Invitation à faire défiler'],
  ] },
  { title: 'Le 13', target: '#manifeste', fields: [
    ['m.eyebrow', 'Surtitre'], ['m.text', 'Phrase principale', 'area'],
    ['m.f1t', 'Point 1 — titre'], ['m.f1d', 'Point 1 — texte', 'area'], ['m.f2t', 'Point 2 — titre'], ['m.f2d', 'Point 2 — texte', 'area'], ['m.f3t', 'Point 3 — titre'], ['m.f3d', 'Point 3 — texte', 'area'],
  ] },
  { title: 'Nos univers', target: '#univers', fields: [
    ['u.eyebrow', 'Surtitre'], ['u.title', 'Titre'],
    ['u1.t', 'Chaussures — nom'], ['u1.d', 'Chaussures — texte', 'area'], ['u1.l1', 'Chaussures — étiquette 1'], ['u1.l2', 'Chaussures — étiquette 2'], ['u1.l3', 'Chaussures — étiquette 3'], ['u1.l4', 'Chaussures — étiquette 4'], ['u.cta', 'Chaussures — lien'],
    ['u2.t', 'Qamis — nom'], ['u2.d', 'Qamis — texte', 'area'], ['u2.l1', 'Qamis — étiquette 1'], ['u2.l2', 'Qamis — étiquette 2'], ['u2.l3', 'Qamis — étiquette 3'], ['u2.cta', 'Qamis et parfums — lien'],
    ['u3.t', 'Parfums — nom'], ['u3.d', 'Parfums — texte', 'area'], ['u3.l1', 'Parfums — étiquette 1'], ['u3.l2', 'Parfums — étiquette 2'], ['u3.l3', 'Parfums — étiquette 3'],
  ] },
  { title: "L'usine", target: '#usine', fields: [
    ['f.eyebrow', 'Surtitre'], ['f.title', 'Titre'], ['f.lead', 'Introduction', 'area'],
    ['f.1t', 'Étape 1 — nom'], ['f.1d', 'Étape 1 — texte', 'area'], ['f.2t', 'Étape 2 — nom'], ['f.2d', 'Étape 2 — texte', 'area'], ['f.3t', 'Étape 3 — nom'], ['f.3d', 'Étape 3 — texte', 'area'],
    ['f.4t', 'Étape 4 — nom'], ['f.4d', 'Étape 4 — texte', 'area'], ['f.5t', 'Étape 5 — nom'], ['f.5d', 'Étape 5 — texte', 'area'], ['f.6t', 'Étape 6 — nom'], ['f.6d', 'Étape 6 — texte', 'area'],
  ] },
  { title: 'Guide des pointures', target: '#pointure', fields: [
    ['p.eyebrow', 'Surtitre'], ['p.title', 'Titre'], ['p.lead', 'Texte', 'area'], ['p.label', 'Libellé du curseur'], ['p.out', 'Libellé du résultat'], ['p.note', 'Note'],
  ] },
  { title: 'Revendeurs & export', target: '#pro', fields: [
    ['r.eyebrow', 'Surtitre'], ['r.title', 'Titre'], ['r.lead', 'Texte', 'area'], ['r.l1', 'Argument 1'], ['r.l2', 'Argument 2'], ['r.l3', 'Argument 3'],
    ['r.f1', 'Champ : nom'], ['r.f2', 'Champ : téléphone'], ['r.f3', 'Champ : ville'], ['r.f4', 'Question : profil'], ['r.p1', 'Profil 1'], ['r.p2', 'Profil 2'], ['r.p3', 'Profil 3'], ['r.p4', 'Profil 4'],
    ['r.f5', 'Question : univers'], ['r.submit', "Bouton d'envoi"], ['r.ok', 'Message de confirmation', 'area'],
  ] },
  { title: 'Menu, boutons et bas de page', target: '#eclate', fields: [
    ['nav.eclate', 'Menu : la basket'], ['nav.univers', 'Menu : univers'], ['nav.usine', "Menu : l'usine"], ['nav.pro', 'Menu : revendeurs'], ['nav.boutiques', 'Menu : boutiques'],
    ['cta.order', 'Bouton « Commander »'], ['cta.shop', 'Bouton boutique en ligne'], ['cta.univers', 'Lien vers les univers'], ['loader', 'Texte du chargement'], ['skip', "Lien d'accessibilité"],
    ['foot.note', 'Mention du bas de page', 'area'], ['foot.by', 'Crédit'], ['foot.wa', 'Lien du crédit'], ['meta.title', "Titre de l'onglet (Google, partage)"],
  ] },
];

// Étapes de la basket, dans l'ordre du scroll : [id, clé, nom, nombre de points forts]
const STEPS = [
  ['laces', 's1', 'Les lacets', 2], ['tige', 's4', 'La tige', 3], ['tongue', 's2', 'La languette', 2], ['renforts', 's3', 'Les renforts', 2],
  ['doublure', 's5', 'La doublure', 2], ['semelle', 's6', 'La semelle anatomique', 2], ['amorti', 's7', "L'amorti", 2], ['adherence', 's8', "L'adhérence", 2],
];

const PALETTE = [
  ['mesh', 'Mesh (fentes, avant-pied)'], ['skin', 'Tige (renforts lisses)'], ['line', 'Talon, bout, col, lignes'], ['accent', 'Bande du talon'],
  ['midsole', 'Semelle intermédiaire'], ['outsole', 'Semelle et crampons'], ['laces', 'Lacets'], ['lining', 'Doublure et semelle intérieure'],
];

const IMAGES = [
  ['u1.hero', 'Chaussures — grande image'], ['u1.m1', 'Chaussures — vignette 1'], ['u1.m2', 'Chaussures — vignette 2'], ['u1.m3', 'Chaussures — vignette 3'],
  ['u2.hero', 'Qamis — grande image'], ['u2.m1', 'Qamis — vignette'],
  ['u3.hero', 'Parfums — grande image'], ['u3.m1', 'Parfums — vignette 1'], ['u3.m2', 'Parfums — vignette 2'],
  ['wall.1', "L'usine — photo 1"], ['wall.2', "L'usine — photo 2"], ['wall.3', "L'usine — photo 3"], ['wall.4', "L'usine — photo 4"],
];

const LINKS = [
  ['shop', 'Boutique en ligne', 'Tous les boutons « Commander » et « Voir la collection ».'],
  ['tiktok', 'TikTok principal', 'Les vignettes de la communauté y renvoient.'],
  ['tiktokQamis', 'TikTok qamis & parfums'],
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
];

const ICON = {
  up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  up2: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
};

init();

/* ------------------------------------------------------------------ */
/* Connexion                                                           */
/* ------------------------------------------------------------------ */
function init() {
  let ok = false;
  try {
    ok = sessionStorage.getItem(SESSION) === '1';
  } catch {}
  if (ok) return start();
  const login = $('#login');
  login.hidden = false;
  $('#login-pass').focus();
  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#login-pass').value.trim().toLowerCase() === PASS) {
      try {
        sessionStorage.setItem(SESSION, '1');
      } catch {}
      login.hidden = true;
      start();
    } else {
      const card = $('.login__card');
      $('#login-err').textContent = 'Mot de passe incorrect.';
      card.classList.remove('is-shake');
      void card.offsetWidth;
      card.classList.add('is-shake');
    }
  });
}

async function start() {
  try {
    original = await loadDefault('../');
  } catch (err) {
    console.error(err);
    toast('Impossible de lire content.json.', true);
    return;
  }
  const pub = readPublished();
  C = readDraft() || pub || clone(original);
  publishedJSON = JSON.stringify(pub || original);
  $('#app').hidden = false;

  const h = location.hash.slice(1);
  if (VIEWS[h]) view = h;

  $('#side-nav').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (b) go(b.dataset.view);
  });
  $$('.langtabs button').forEach((b) =>
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      $$('.langtabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
      sendPreview({ type: 'lang', lang });
    }),
  );
  $('#logout').addEventListener('click', () => {
    try {
      sessionStorage.removeItem(SESSION);
    } catch {}
    location.reload();
  });
  $('#publish').addEventListener('click', publishNow);
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      publishNow();
    }
  });
  addEventListener('beforeunload', (e) => {
    if (isDirty()) e.preventDefault();
  });

  setupPreview();
  render();
  status();
}

function go(v) {
  view = v;
  history.replaceState(null, '', `#${v}`);
  render();
  $('.main').scrollTo?.({ top: 0 });
  scrollTo({ top: 0 });
  const target = VIEWS[v].target;
  if (target) sendPreview({ type: 'goto', target });
}

/* ------------------------------------------------------------------ */
/* Enregistrement, publication                                          */
/* ------------------------------------------------------------------ */
const isDirty = () => JSON.stringify(C) !== publishedJSON;

let saveError = false;
function changed({ preview = true } = {}) {
  saveError = !saveDraft(C);
  if (saveError) toast("L'espace du navigateur est plein : remplacez des photos importées par des liens, ou exportez le contenu.", true);
  status();
  counts();
  if (preview) refreshPreview();
}

function status() {
  const el = $('#status');
  const dirty = isDirty();
  el.classList.toggle('is-dirty', dirty && !saveError);
  el.classList.toggle('is-error', saveError);
  $('span', el).textContent = saveError ? 'Brouillon non enregistré' : dirty ? 'Brouillon enregistré · non publié' : 'Publié · à jour';
  $('#publish').disabled = !dirty;
}

function publishNow() {
  if (!isDirty()) return toast('Rien de nouveau à publier.');
  if (!publish(C)) return toast("Publication impossible : l'espace du navigateur est plein.", true);
  publishedJSON = JSON.stringify(C);
  saveError = false;
  status();
  toast('Publié. Le site affiche maintenant cette version.');
}

function counts() {
  const cw = C.colorways || [];
  const vis = cw.filter((c) => c.visible !== false).length;
  $('#count-cw').textContent = vis === cw.length ? cw.length : `${vis}/${cw.length}`;
  $('#count-stores').textContent = (C.stores || []).length;
}

/* ------------------------------------------------------------------ */
/* Aperçu                                                              */
/* ------------------------------------------------------------------ */
function setupPreview() {
  const box = $('#preview-frame');
  const stage = $('#preview-stage');
  let device = 'mobile';

  const fit = () => {
    const w = device === 'mobile' ? 390 : 1440;
    const h = device === 'mobile' ? 844 : 900;
    const r = stage.getBoundingClientRect();
    const s = Math.min(1, (r.width - 32) / w, (r.height - 32) / h);
    box.style.transform = `scale(${Math.max(0.1, s)})`;
    box.style.margin = `${(-(h * (1 - s)) / 2).toFixed(1)}px ${(-(w * (1 - s)) / 2).toFixed(1)}px`;
  };
  new ResizeObserver(fit).observe(stage);

  $$('.seg button').forEach((b) =>
    b.addEventListener('click', () => {
      device = b.dataset.device;
      $$('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      box.classList.toggle('is-desktop', device === 'desktop');
      fit();
      reloadFrame();
    }),
  );
  $('#toggle-preview').addEventListener('click', () => {
    $('#preview').classList.add('is-open');
    requestAnimationFrame(fit);
    reloadFrame(); // l'iframe masquée n'a pas pu mesurer son écran
  });
  $('#close-preview').addEventListener('click', () => $('#preview').classList.remove('is-open'));

  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.type === 'preview-ready') {
      previewReady = true;
      box.classList.remove('is-loading');
      const msgs = pending;
      pending = [];
      msgs.forEach(sendPreview);
    }
  });
  saveDraft(C);
  reloadFrame(true);
}

function reloadFrame(first = false) {
  const frame = $('#frame');
  previewReady = false;
  $('#preview-frame').classList.add('is-loading');
  const src = `../?preview=1&lang=${lang}`;
  if (first || frame.src === 'about:blank') frame.src = src;
  else frame.contentWindow.location.replace(src);
}

let previewTimer = 0;
function refreshPreview(msg) {
  clearTimeout(previewTimer);
  if (msg) pending = pending.filter((m) => m.type !== msg.type).concat(msg);
  previewTimer = setTimeout(() => reloadFrame(), 700);
}

function sendPreview(msg) {
  const w = $('#frame').contentWindow;
  if (previewReady && w) w.postMessage(msg, location.origin);
  else pending = pending.filter((m) => m.type !== msg.type).concat(msg);
}

/* ------------------------------------------------------------------ */
/* Champs                                                              */
/* ------------------------------------------------------------------ */
function getPath(path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
}
function setPath(path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const obj = keys.reduce((o, k) => (o[k] ??= {}), C);
  obj[last] = value;
}
const dirAttr = () => (lang === 'ar' ? ' dir="rtl" lang="ar"' : '');
const langBadge = (obj) => {
  const empty = !obj || !String(obj[lang] ?? '').trim();
  return `<em class="f__lang${empty ? ' is-empty' : ''}">${LANGS[lang]}${empty ? ' · vide' : ''}</em>`;
};

// Texte traduit : C.texts[key][lang]
function tfield(key, label, area = false, hint = '') {
  const obj = C.texts[key] || (C.texts[key] = { fr: '', ar: '', en: '' });
  const v = obj[lang] ?? '';
  const ph = lang === 'fr' ? '' : obj.fr || '';
  const attrs = `data-tkey="${key}" placeholder="${esc(ph)}"${dirAttr()}`;
  const input = area ? `<textarea ${attrs} rows="3">${esc(v)}</textarea>` : `<input type="text" ${attrs} value="${esc(v)}">`;
  return `<label class="f"><span class="f__label">${esc(label)}${langBadge(obj)}</span>${input}${hint ? `<p class="f__hint">${esc(hint)}</p>` : ''}</label>`;
}
// Texte traduit rangé dans une liste : getPath(path)[lang]
function lfield(path, label, area = false) {
  const obj = getPath(path) || {};
  const v = obj[lang] ?? '';
  const attrs = `data-lpath="${path}" placeholder="${esc(lang === 'fr' ? '' : obj.fr || '')}"${dirAttr()}`;
  const input = area ? `<textarea ${attrs} rows="2">${esc(v)}</textarea>` : `<input type="text" ${attrs} value="${esc(v)}">`;
  return `<label class="f"><span class="f__label">${esc(label)}${langBadge(obj)}</span>${input}</label>`;
}
function field({ label, path, type = 'text', hint = '', placeholder = '' }) {
  const v = getPath(path) ?? '';
  return `<label class="f"><span class="f__label">${esc(label)}</span><input type="${type}" data-path="${path}" placeholder="${esc(placeholder)}" value="${esc(v)}">${hint ? `<p class="f__hint">${hint}</p>` : ''}</label>`;
}
function toggle({ label, path, checked }) {
  return `<label class="switch"><input type="checkbox" data-path="${path}"${checked ? ' checked' : ''}><i></i><span>${esc(label)}</span></label>`;
}

function bindFields(root) {
  root.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.tkey) {
      (C.texts[el.dataset.tkey] ??= {})[lang] = el.value;
    } else if (el.dataset.lpath) {
      const obj = getPath(el.dataset.lpath) || {};
      obj[lang] = el.value;
      setPath(el.dataset.lpath, obj);
    } else if (el.dataset.path) {
      const v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value;
      setPath(el.dataset.path, v);
    } else return;
    const badge = el.closest('.f')?.querySelector('.f__lang');
    if (badge) {
      const empty = !el.value.trim();
      badge.classList.toggle('is-empty', empty);
      badge.textContent = `${LANGS[lang]}${empty ? ' · vide' : ''}`;
    }
    root.dispatchEvent(new CustomEvent('field', { detail: el }));
    changed();
  });
}

/* ------------------------------------------------------------------ */
/* Vues                                                                */
/* ------------------------------------------------------------------ */
function render() {
  $$('#side-nav [data-view]').forEach((b) => (b.dataset.view === view ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
  $('#view-title').textContent = VIEWS[view].title;
  $('#crumb').textContent = VIEWS[view].crumb;
  const old = $('#view');
  const el = old.cloneNode(false); // repart d'un conteneur neuf, sans anciens écouteurs
  old.replaceWith(el);
  ({ textes: viewTexts, basket: viewBasket, coloris: viewColorways, photos: viewPhotos, communaute: viewCommunity, boutiques: viewStores, evenement: viewEvent, liens: viewLinks, sauvegarde: viewBackup })[view](el);
  counts();
}

const langIntro = () =>
  `<p class="intro">Vous modifiez la version <b>${{ fr: 'française', ar: 'arabe', en: 'anglaise' }[lang]}</b>. Changez de langue avec les boutons en haut ; un champ vide reprend le texte français.</p>`;

function card(title, hint, body, target) {
  return `<section class="card"><div class="card__head"><h2>${esc(title)}</h2>${hint ? `<p>${esc(hint)}</p>` : ''}${target ? `<button class="b b--ghost b--small" type="button" data-goto="${target}">${ICON.eye}Voir</button>` : ''}</div>${body}</section>`;
}
function bindGoto(el) {
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-goto]');
    if (!b) return;
    sendPreview({ type: 'goto', target: b.dataset.goto });
    if (innerWidth < 1360) $('#toggle-preview').click();
  });
}

// ---------- textes
function viewTexts(el) {
  el.innerHTML =
    langIntro() +
    TEXT_SECTIONS.map((s) => card(s.title, s.hint, `<div class="grid grid--2">${s.fields.map(([k, label, area, hint]) => tfield(k, label, area === 'area', hint)).join('')}</div>`, s.target)).join('');
  bindFields(el);
  bindGoto(el);
}

// ---------- la basket : les 8 étapes, la vue d'ensemble et la fin
function viewBasket(el) {
  const steps = STEPS.map(
    ([id, k, name, chips], i) => `<article class="stepcard">
      <div class="stepcard__head"><span class="stepcard__n">${pad(i + 1)}</span><h3>${esc(name)}</h3><button class="b b--ghost b--small" type="button" data-goto="step:${id}">${ICON.eye}Voir</button></div>
      <div class="grid">${tfield(`${k}.t`, 'Titre')}${tfield(`${k}.d`, 'Texte', true)}
      <div class="grid grid--3">${Array.from({ length: chips }, (_, c) => tfield(`${k}.c${c + 1}`, `Point fort ${c + 1}`)).join('')}</div></div>
    </article>`,
  ).join('');
  el.innerHTML =
    langIntro() +
    `<p class="intro">La basket se démonte en huit étapes au fil du scroll. Chaque étape a un titre, un texte et des points forts.</p>
    <div class="stepcards">${steps}</div>` +
    card('Vue d’ensemble', 'Toutes les pièces écartées, numérotées.', `<div class="grid">${tfield('s9.n', 'Surtitre')}${tfield('s9.t', 'Titre')}${tfield('s9.d', 'Texte', true)}</div>`, 'step:ensemble') +
    card('Fin : la paire remontée', 'Avec le choix des coloris.', `<div class="grid">${tfield('s10.n', 'Nom du modèle')}${tfield('s10.t', 'Titre', true, 'Retour à la ligne pour couper la phrase.')}${tfield('s10.note', 'Petite mention')}</div>`, 'step:final');
  bindFields(el);
  bindGoto(el);
}

// ---------- coloris de la basket 3D
function viewColorways(el) {
  const list = C.colorways || (C.colorways = []);
  el.innerHTML = `
    <p class="intro">Chaque coloris apparaît sous la basket remontée, à la fin de l'animation. Les couleurs s'appliquent directement au modèle 3D : <b>ouvrez l'aperçu</b> pour les voir.</p>
    <div class="cw-list">${list
      .map(
        (cw, i) => `<article class="cw${cw.visible === false ? ' is-hidden-cw' : ''}" data-i="${i}">
        <div class="cw__head">
          <span class="cw__dot" style="--a:${esc(cw.colors.skin)};--b:${esc(cw.colors.accent)}"></span>
          <span class="mono">Coloris ${pad(i + 1)}</span>
          ${toggle({ label: 'Affiché', path: `colorways.${i}.visible`, checked: cw.visible !== false })}
          <button class="icon-b" type="button" data-show aria-label="Voir dans l'aperçu">${ICON.eye}</button>
          <button class="icon-b" type="button" data-mv="-1" aria-label="Monter"${i === 0 ? ' disabled' : ''}>${ICON.up}</button>
          <button class="icon-b" type="button" data-mv="1" aria-label="Descendre"${i === list.length - 1 ? ' disabled' : ''}>${ICON.down}</button>
          <button class="icon-b" type="button" data-dup aria-label="Dupliquer"${list.length >= 8 ? ' disabled' : ''}>${ICON.copy}</button>
          <button class="icon-b icon-b--danger" type="button" data-rm aria-label="Supprimer"${list.length <= 1 ? ' disabled' : ''}>${ICON.trash}</button>
        </div>
        ${lfield(`colorways.${i}.name`, 'Nom du coloris')}
        <div class="cw__photo">${toggle({ label: 'Habillé avec les photos du vrai modèle', path: `colorways.${i}.photo`, checked: !!cw.photo })}
          <p class="f__hint">${cw.photo ? 'Tige, talon, bout et semelles viennent des photos : les couleurs ci-dessous servent aux lacets, à la languette, à la doublure et aux zones que les photos ne montrent pas.' : 'Modèle dessiné : toutes les pièces prennent les couleurs ci-dessous.'}</p></div>
        <div class="colors">${PALETTE.map(
          ([k, label]) => `<label class="color"><input type="color" data-cw="${i}" data-key="${k}" value="${esc(cw.colors[k])}"><span>${esc(label)}<small>${esc(cw.colors[k])}</small></span></label>`,
        ).join('')}</div>
      </article>`,
      )
      .join('')}
    ${list.length < 8 ? `<button class="add-row" type="button" data-add>${ICON.plus}Ajouter un coloris</button>` : ''}</div>`;
  bindFields(el);
  // reload : la couleur a changé, l'aperçu doit relire le brouillon ; sinon on se contente de le piloter
  const showIn = (i, reload = false) => {
    if (list[i]?.visible === false) return;
    const msg = { type: 'colorway', index: list.slice(0, i + 1).filter((c) => c.visible !== false).length - 1 };
    if (reload) refreshPreview(msg);
    else sendPreview(msg);
  };
  el.addEventListener('input', (e) => {
    const c = e.target.closest('input[type="color"]');
    if (!c) return;
    const i = +c.dataset.cw;
    list[i].colors[c.dataset.key] = c.value;
    c.nextElementSibling.querySelector('small').textContent = c.value;
    const dot = c.closest('.cw').querySelector('.cw__dot');
    dot.style.setProperty('--a', list[i].colors.skin);
    dot.style.setProperty('--b', list[i].colors.accent);
    saveDraft(C);
    status();
    showIn(i, true);
  });
  el.addEventListener('field', (e) => {
    const path = e.detail.dataset.path || '';
    if (path.endsWith('.visible')) render();
    if (path.endsWith('.photo')) {
      saveDraft(C);
      render();
      showIn(+path.split('.')[1], true);
    }
  });
  el.addEventListener('click', async (e) => {
    const box = e.target.closest('.cw');
    const i = box ? +box.dataset.i : -1;
    if (e.target.closest('[data-show]')) {
      sendPreview({ type: 'goto', target: 'step:final' });
      showIn(i);
      if (innerWidth < 1360) $('#toggle-preview').click();
      return;
    }
    const mv = e.target.closest('[data-mv]');
    if (mv) return move(list, i, +mv.dataset.mv, render);
    if (e.target.closest('[data-dup]')) {
      const copy = clone(list[i]);
      copy.id = `cw-${Date.now().toString(36)}`;
      Object.keys(copy.name).forEach((k) => (copy.name[k] = copy.name[k] ? `${copy.name[k]} 2` : ''));
      list.splice(i + 1, 0, copy);
      changed();
      return render();
    }
    if (e.target.closest('[data-rm]') && (await confirmBox('Supprimer ce coloris ?', 'Supprimer'))) {
      list.splice(i, 1);
      changed();
      return render();
    }
    if (e.target.closest('[data-add]')) {
      list.push({ id: `cw-${Date.now().toString(36)}`, visible: true, photo: false, name: { fr: 'Nouveau coloris', ar: '', en: '' }, colors: clone(list[0]?.colors || original.colorways[0].colors) });
      changed();
      render();
    }
  });
}

// ---------- photos
function viewPhotos(el) {
  const imgs = C.images || (C.images = {});
  el.innerHTML =
    card(
      'Univers et usine',
      'Collez le lien d’une photo en ligne, ou importez-en une depuis le téléphone ou l’ordinateur.',
      `<div class="pics">${IMAGES.map(
        ([k, label]) => `<div class="pic" data-k="${k}">
          <div class="pic__img"><img src="${esc(src(imgs[k]))}" alt=""></div>
          <p class="pic__label">${esc(label)}</p>
          ${field({ label: 'Lien de la photo', path: `images.${k}`, type: 'text', placeholder: 'https://…' })}
          <div class="pic__actions">
            <label class="b b--ghost b--small">${ICON.up2}Importer<input type="file" accept="image/*" data-img="${k}" hidden></label>
            ${imgs[k] !== original.images?.[k] ? `<button class="b b--ghost b--small" type="button" data-reset="${k}">${ICON.undo}Photo d'origine</button>` : ''}
          </div>
        </div>`,
      ).join('')}</div>`,
      '#univers',
    ) +
    `<div class="card__head"><h2>Vignettes TikTok</h2><p>Le bandeau qui défile sous les chiffres. Elles renvoient vers le TikTok principal.</p></div>`;
  bindFields(el);
  listEditor(el, {
    path: 'reel',
    label: 'Vignette',
    max: 12,
    image: true,
    empty: { image: '', alt: '' },
    fields: (b) => `<div class="grid">${field({ label: 'Description de la photo', path: `${b}.alt`, placeholder: 'Ex. : ouverture de la boutique de Douéra' })}</div>`,
  });
  el.addEventListener('field', (e) => {
    const p = e.detail.dataset.path || '';
    if (!p.startsWith('images.')) return;
    const k = p.slice(7);
    const img = $(`.pic[data-k="${CSS.escape(k)}"] img`, el);
    if (img) img.src = src(imgs[k]);
  });
  el.addEventListener('change', async (e) => {
    const f = e.target.closest('input[type="file"][data-img]');
    if (!f || !f.files[0] || !(f.dataset.img in Object.fromEntries(IMAGES))) return;
    try {
      imgs[f.dataset.img] = await compress(f.files[0], 1400);
      changed();
      render();
    } catch {
      toast("Cette image n'a pas pu être lue.", true);
    }
  });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-reset]');
    if (!b) return;
    imgs[b.dataset.reset] = original.images[b.dataset.reset];
    changed();
    render();
  });
  bindGoto(el);
}
// les chemins relatifs du site (img/…) sont vus depuis /admin/
const src = (s) => (!s ? '' : /^(data:|https?:|\/)/.test(s) ? s : `../${s}`);

// ---------- chiffres & communauté
function viewCommunity(el) {
  const fmt = (v) => ['fr', 'ar', 'en'].map((l) => {
    const f = formatStat(v, l);
    return `${f.num}${f.unit ? ` ${f.unit}` : ''}`;
  }).join('  ·  ');
  el.innerHTML =
    langIntro() +
    card('En-tête', '', `<div class="grid">${tfield('c.eyebrow', 'Surtitre')}${tfield('c.title', 'Titre')}${tfield('c.src', 'Source des chiffres', false, 'Pensez à la date : « Chiffres affichés sur TikTok le … ».')}</div>`, '#communaute') +
    `<div class="card__head"><h2>Chiffres</h2><p>Saisissez le nombre complet (236200, 1800000…) : il s'écrit tout seul dans chaque langue, sans « K » ni « M ».</p></div>`;
  bindFields(el);
  listEditor(el, {
    path: 'stats',
    label: 'Chiffre',
    max: 6,
    empty: { value: 0, label: { fr: '', ar: '', en: '' } },
    fields: (b, it) => `<div class="grid grid--2">
      ${field({ label: 'Nombre', path: `${b}.value`, type: 'number', hint: `<span data-fmt="${b}">${esc(fmt(it.value))}</span>` })}
      ${lfield(`${b}.label`, 'Légende')}
    </div>`,
  });
  el.addEventListener('field', (e) => {
    const p = e.detail.dataset.path || '';
    if (!p.endsWith('.value')) return;
    const b = p.slice(0, -6);
    const out = $(`[data-fmt="${b}"]`, el);
    if (out) out.textContent = fmt(getPath(p));
  });
}

// ---------- boutiques
function viewStores(el) {
  el.innerHTML =
    langIntro() +
    card('En-tête et boutique en ligne', '', `<div class="grid grid--2">${tfield('b.eyebrow', 'Surtitre')}${tfield('b.title', 'Titre')}${tfield('b.go', 'Lien « Itinéraire »')}${tfield('b.soon', 'Étiquette « Bientôt »')}${tfield('b.4t', 'Carte en ligne — titre')}${tfield('b.4', 'Carte en ligne — texte')}</div>`, '#boutiques') +
    `<div class="card__head"><h2>Magasins</h2><p>Dans l'ordre d'affichage. « Ouverture prochaine » remplace le lien d'itinéraire par l'étiquette « Bientôt ».</p></div>`;
  bindFields(el);
  listEditor(el, {
    path: 'stores',
    label: 'Magasin',
    max: 8,
    empty: { name: '', nameAr: '', soon: false, maps: '', text: { fr: '', ar: '', en: '' } },
    fields: (b, it) => `<div class="grid">
      <div class="grid grid--2">${field({ label: 'Nom (lettres latines)', path: `${b}.name`, placeholder: 'Chevalley' })}${field({ label: 'Nom en arabe', path: `${b}.nameAr`, placeholder: 'شوفالي' })}</div>
      ${lfield(`${b}.text`, 'Description', true)}
      ${field({ label: 'Lien Google Maps', path: `${b}.maps`, type: 'url', placeholder: 'https://maps.app.goo.gl/…', hint: 'Dans Google Maps : Partager → Copier le lien.' })}
      ${toggle({ label: 'Ouverture prochaine', path: `${b}.soon`, checked: !!it.soon })}
    </div>`,
  });
}

// ---------- événement
function viewEvent(el) {
  const ev = C.event || (C.event = { show: true, start: '', end: '' });
  el.innerHTML =
    card('Affichage', 'Le compte à rebours s’arrête tout seul à l’ouverture, puis affiche le message de fin.', `<div class="grid">
      ${toggle({ label: 'Afficher la section événement', path: 'event.show', checked: ev.show !== false })}
      <div class="grid grid--2">
        ${field({ label: 'Début (heure d’Alger)', path: 'event.start', type: 'datetime-local' })}
        ${field({ label: 'Fin (heure d’Alger)', path: 'event.end', type: 'datetime-local' })}
      </div></div>`, '#ecsel') +
    langIntro() +
    card('Textes', '', `<div class="grid grid--2">${tfield('e.eyebrow', 'Surtitre')}${tfield('e.month', 'Mois et année')}${tfield('e.title', 'Titre', true)}${tfield('e.lead', 'Texte', true)}${tfield('e.place', 'Lieu')}${tfield('e.d', 'Mot « jours »')}${tfield('e.h', 'Mot « heures »')}${tfield('e.m', 'Mot « minutes »')}${tfield('e.live', 'Pendant l’événement', true)}${tfield('e.done', 'Après l’événement', true)}</div>`, '#ecsel');
  bindFields(el);
  bindGoto(el);
}

// ---------- liens
function viewLinks(el) {
  el.innerHTML =
    card('Réseaux et boutique', 'Utilisés partout sur le site.', `<div class="grid">${LINKS.map(([k, label, hint]) => field({ label, path: `links.${k}`, type: 'url', hint: hint || '', placeholder: 'https://…' })).join('')}</div>`) +
    card(
      'WhatsApp de l’équipe commerciale',
      '',
      `<div class="grid">${field({ label: 'Numéro WhatsApp (format international)', path: 'links.whatsapp', type: 'tel', placeholder: '213 5xx xx xx xx', hint: 'Renseigné : le formulaire « Revendeurs » ouvre WhatsApp avec la demande déjà écrite. Vide : le site affiche seulement le message de confirmation.' })}</div>`,
      '#pro',
    );
  bindFields(el);
  bindGoto(el);
}

// ---------- sauvegarde
function viewBackup(el) {
  const kb = usageKB();
  const pct = Math.min(100, (kb / QUOTA_KB) * 100);
  el.innerHTML = `
    <section class="card">
      <div class="card__head"><h2>État</h2><p>${isDirty() ? 'Des modifications attendent d’être publiées.' : 'Tout est publié.'}</p></div>
      <div class="grid">
        <div class="f"><span class="f__label">Espace utilisé dans ce navigateur <small>${kb} Ko / ~${QUOTA_KB} Ko</small></span>
          <div class="meter${pct > 75 ? ' is-warn' : ''}" style="--v:${pct.toFixed(1)}%"><i></i></div>
          <p class="f__hint">Les photos importées occupent le plus de place. Les liens vers des photos en ligne n'en prennent presque pas.</p>
        </div>
        <div class="row-actions">
          <button class="b b--accent" type="button" id="bk-publish"${isDirty() ? '' : ' disabled'}>Publier maintenant</button>
          <button class="b b--ghost" type="button" id="bk-revert"${isDirty() ? '' : ' disabled'}>Annuler les modifications non publiées</button>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h2>Copie de sécurité</h2><p>Un fichier qui contient tout le site : textes dans les trois langues, coloris, photos importées.</p></div>
      <div class="row-actions">
        <button class="b" type="button" id="bk-export">Télécharger la copie (.json)</button>
        <label class="b b--ghost">Restaurer une copie<input type="file" accept="application/json,.json" id="bk-import" hidden></label>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h2>Repartir de zéro</h2></div>
      <p class="note">Revient au contenu livré avec le site et efface ce qui a été publié depuis cet espace.</p>
      <div class="row-actions"><button class="b b--danger" type="button" id="bk-reset">Revenir au contenu d'origine</button></div>
    </section>
    <p class="note"><b>Démo :</b> les publications sont gardées dans ce navigateur, donc visibles seulement ici. Sur le site livré, le bouton « Publier » envoie le contenu au serveur et tous les visiteurs voient la nouvelle version, sans toucher au code.</p>`;

  $('#bk-publish', el).addEventListener('click', () => {
    publishNow();
    render();
  });
  $('#bk-revert', el).addEventListener('click', async () => {
    if (!(await confirmBox('Annuler toutes les modifications faites depuis la dernière publication ?', 'Annuler les modifications'))) return;
    C = JSON.parse(publishedJSON);
    changed();
    render();
    toast('Modifications annulées.');
  });
  $('#bk-export', el).addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(C, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `tlemceni-contenu-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('#bk-import', el).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.texts || !Array.isArray(data.colorways)) throw new Error('format');
      C = data;
      changed();
      render();
      toast('Copie restaurée. Publiez pour la mettre en ligne.');
    } catch {
      toast("Ce fichier n'est pas une copie du site.", true);
    }
  });
  $('#bk-reset', el).addEventListener('click', async () => {
    if (!(await confirmBox('Revenir au contenu d’origine ? Les modifications faites ici seront perdues (pensez à télécharger une copie).', 'Revenir à l’origine'))) return;
    resetLocal();
    C = clone(original);
    publishedJSON = JSON.stringify(original);
    saveDraft(C);
    status();
    render();
    reloadFrame();
    toast('Contenu d’origine rétabli.');
  });
}

/* ------------------------------------------------------------------ */
/* Listes réutilisables                                                */
/* ------------------------------------------------------------------ */
function listEditor(el, { path, label, fields, empty, max = 12, image = false }) {
  const arr = getPath(path) || (setPath(path, []), getPath(path));
  const box = document.createElement('div');
  box.className = 'items';
  box.innerHTML =
    arr
      .map(
        (it, k) => `<div class="item" data-k="${k}">
        <div class="item__head">
          <span class="mono">${label} ${pad(k + 1)}</span>
          <button class="icon-b" type="button" data-mv="-1" aria-label="Monter"${k === 0 ? ' disabled' : ''}>${ICON.up}</button>
          <button class="icon-b" type="button" data-mv="1" aria-label="Descendre"${k === arr.length - 1 ? ' disabled' : ''}>${ICON.down}</button>
          <button class="icon-b icon-b--danger" type="button" data-rm aria-label="Supprimer">${ICON.trash}</button>
        </div>
        ${fields(`${path}.${k}`, it)}
        ${
          image
            ? `<div class="item__img"><img src="${esc(src(it.image))}" alt=""><div class="grid">
                ${field({ label: 'Photo (lien)', path: `${path}.${k}.image`, type: 'text', placeholder: 'https://…' })}
                <label class="b b--ghost b--small" style="justify-self:start">${ICON.up2}Importer<input type="file" accept="image/*" data-li="${k}" hidden></label>
              </div></div>`
            : ''
        }
      </div>`,
      )
      .join('') + (arr.length < max ? `<button class="add-row" type="button" data-add>${ICON.plus}Ajouter</button>` : '');
  el.append(box);
  box.addEventListener('click', async (e) => {
    const it = e.target.closest('.item');
    const k = it ? +it.dataset.k : -1;
    const mv = e.target.closest('[data-mv]');
    if (mv) return move(arr, k, +mv.dataset.mv, render);
    if (e.target.closest('[data-rm]') && (await confirmBox('Supprimer cet élément ?', 'Supprimer'))) {
      arr.splice(k, 1);
      changed();
      return render();
    }
    if (e.target.closest('[data-add]')) {
      arr.push(clone(empty));
      changed();
      render();
      $$('.item', $('#view')).at(-1)?.querySelector('input, textarea')?.focus();
    }
  });
  box.addEventListener('change', async (e) => {
    const f = e.target.closest('[data-li]');
    if (!f || !f.files[0]) return;
    try {
      arr[+f.dataset.li].image = await compress(f.files[0], 900);
      changed();
      render();
    } catch {
      toast("Cette image n'a pas pu être lue.", true);
    }
  });
  el.addEventListener('field', (e) => {
    const p = e.detail.dataset.path || '';
    if (!p.startsWith(`${path}.`) || !p.endsWith('.image')) return;
    const k = +p.split('.').at(-2);
    const img = $(`.item[data-k="${k}"] .item__img img`, box);
    if (img) img.src = src(arr[k].image);
  });
}

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */
function move(arr, i, dir, then) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  changed();
  then?.();
}

// photo importée → WebP (ou JPEG) redimensionnée, en data URL (la transparence est gardée en WebP)
async function compress(file, max = 1400) {
  const srcImg = await (window.createImageBitmap
    ? createImageBitmap(file)
    : new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = URL.createObjectURL(file);
      }));
  const s = Math.min(1, max / Math.max(srcImg.width, srcImg.height));
  const c = document.createElement('canvas');
  c.width = Math.round(srcImg.width * s);
  c.height = Math.round(srcImg.height * s);
  c.getContext('2d').drawImage(srcImg, 0, 0, c.width, c.height);
  let url = c.toDataURL('image/webp', 0.82);
  if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.86);
  return url;
}

let toastTimer = 0;
function toast(msg, error = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('is-error', error);
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), error ? 5200 : 2800);
}

function confirmBox(text, okLabel = 'Confirmer') {
  const d = $('#confirm');
  $('#confirm-text').textContent = text;
  $('#confirm-ok').textContent = okLabel;
  d.returnValue = '';
  d.showModal();
  return new Promise((res) => d.addEventListener('close', () => res(d.returnValue === 'ok'), { once: true }));
}
