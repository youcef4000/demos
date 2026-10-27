// Stickprod — espace admin. Modifie le contenu du site (réalisations, textes, contact, couleurs),
// l'enregistre en brouillon à chaque frappe et le publie d'un clic. Aperçu du vrai site en direct.
// Démo sans serveur : brouillon et publication restent dans ce navigateur (voir ../store.js).
import { loadDefault, readDraft, readPublished, saveDraft, publish, resetLocal, usageKB, sized, videoEmbed, esc } from '../store.js';

const PASS = 'stickprod';
const SESSION = 'stickprod:admin';
const QUOTA_KB = 4800;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clone = (o) => JSON.parse(JSON.stringify(o));
const pad = (n) => String(n).padStart(2, '0');

let C = null; // contenu en cours d'édition
let original = null; // content.json
let publishedJSON = '';
let view = 'projects';
let editing = null; // index de la réalisation ouverte
let previewReady = false;
let pendingGoto = null;

const VIEWS = {
  projects: { title: 'Réalisations', crumb: 'Contenu' },
  texts: { title: "Textes d'accueil", crumb: 'Contenu' },
  services: { title: 'Savoir-faire', crumb: 'Contenu' },
  process: { title: 'Méthode', crumb: 'Contenu' },
  studio: { title: 'Studio', crumb: 'Contenu' },
  contact: { title: 'Contact', crumb: 'Informations' },
  look: { title: 'Apparence', crumb: 'Réglages' },
  backup: { title: 'Sauvegarde', crumb: 'Réglages' },
};

const ICON = {
  up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  up2: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
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
  const m = h.match(/^project-(\d+)$/);
  if (m && C.projects[+m[1]]) {
    view = 'projects';
    editing = +m[1];
  } else if (VIEWS[h]) view = h;

  $('#side-nav').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (b) go(b.dataset.view);
  });
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

function go(v, idx = null) {
  view = v;
  editing = idx;
  history.replaceState(null, '', idx != null ? `#project-${idx}` : `#${v}`);
  render();
  $('.main').scrollTo?.({ top: 0 });
  scrollTo({ top: 0 });
  const target = { services: '#savoir-faire', process: '#methode', studio: '#studio', contact: '#contact', texts: '#top' }[v];
  if (target) sendPreview({ type: 'goto', target });
  if (v === 'projects' && idx != null) gotoProject(idx);
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
  const n = C.projects.length;
  const vis = C.projects.filter((p) => p.visible !== false).length;
  $('#count-projects').textContent = vis === n ? n : `${vis}/${n}`;
  $('#side-name').textContent = C.brand?.name || 'Stickprod';
}

/* ------------------------------------------------------------------ */
/* Aperçu                                                              */
/* ------------------------------------------------------------------ */
function setupPreview() {
  const frame = $('#frame');
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
      if (pendingGoto != null) {
        sendPreview({ type: 'goto-project', index: pendingGoto });
        pendingGoto = null;
      }
    }
  });
  saveDraft(C);
  reloadFrame(true);
}

function reloadFrame(first = false) {
  const frame = $('#frame');
  previewReady = false;
  $('#preview-frame').classList.add('is-loading');
  if (first || frame.src === 'about:blank') frame.src = '../?preview=1';
  else frame.contentWindow.location.reload();
}

let previewTimer = 0;
function refreshPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => reloadFrame(), 650);
}

function sendPreview(msg) {
  const w = $('#frame').contentWindow;
  if (previewReady && w) w.postMessage(msg, location.origin);
  else if (msg.type === 'goto-project') pendingGoto = msg.index;
}

// l'aperçu ne connaît que les réalisations visibles
function gotoProject(i) {
  const p = C.projects[i];
  if (!p || p.visible === false) return;
  const vi = C.projects.slice(0, i).filter((x) => x.visible !== false).length;
  pendingGoto = vi;
  sendPreview({ type: 'goto-project', index: vi });
}

/* ------------------------------------------------------------------ */
/* Champs génériques                                                    */
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

function field({ label, path, type = 'text', rows = 3, max, hint = '', placeholder = '', list = '' }) {
  const v = getPath(path) ?? '';
  const count = max ? `<small data-count="${max}">${String(v).length}/${max}</small>` : '';
  const attrs = `data-path="${path}" placeholder="${esc(placeholder)}"${list ? ` list="${list}"` : ''}`;
  const input = type === 'textarea' ? `<textarea ${attrs} rows="${rows}">${esc(v)}</textarea>` : `<input type="${type}" ${attrs} value="${esc(v)}">`;
  return `<label class="f"><span class="f__label">${esc(label)}${count}</span>${input}${hint ? `<p class="f__hint" data-hint-for="${path}">${hint}</p>` : ''}</label>`;
}

function toggle({ label, path, checked }) {
  return `<label class="switch"><input type="checkbox" data-path="${path}"${checked ? ' checked' : ''}><i></i><span>${esc(label)}</span></label>`;
}

function bindFields(root) {
  root.addEventListener('input', (e) => {
    const el = e.target.closest('[data-path]');
    if (!el) return;
    setPath(el.dataset.path, el.type === 'checkbox' ? el.checked : el.value);
    const c = el.closest('.f')?.querySelector('[data-count]');
    if (c) {
      c.textContent = `${el.value.length}/${c.dataset.count}`;
      c.classList.toggle('is-over', el.value.length > +c.dataset.count);
    }
    root.dispatchEvent(new CustomEvent('field', { detail: el.dataset.path }));
    changed();
  });
}

/* ------------------------------------------------------------------ */
/* Vues                                                                */
/* ------------------------------------------------------------------ */
function render() {
  $$('#side-nav [data-view]').forEach((b) => (b.dataset.view === view ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
  const meta = VIEWS[view];
  $('#view-title').textContent = view === 'projects' && editing != null ? C.projects[editing]?.title || 'Réalisation' : meta.title;
  $('#crumb').textContent = view === 'projects' && editing != null ? `Réalisations · ${pad(editing + 1)}` : meta.crumb;
  const old = $('#view');
  const el = old.cloneNode(false); // repart d'un conteneur neuf, sans anciens écouteurs
  old.replaceWith(el);
  const fn = { projects: editing != null ? viewProject : viewProjects, texts: viewTexts, services: viewServices, process: viewProcess, studio: viewStudio, contact: viewContact, look: viewLook, backup: viewBackup }[view];
  fn(el);
  counts();
}

// ---------- réalisations : liste
function viewProjects(el) {
  el.innerHTML = `
    <p class="intro">Chaque réalisation sort de la spirale dans cet ordre. <b>Glissez une ligne</b> ou utilisez les flèches pour changer l'ordre, et masquez un projet sans le supprimer.</p>
    <ul class="plist" id="plist">${C.projects.map(prowHTML).join('')}</ul>
    <button class="add-row" type="button" id="add-project">${ICON.plus}Ajouter une réalisation</button>`;

  const list = $('#plist', el);
  list.addEventListener('click', async (e) => {
    const row = e.target.closest('.prow');
    if (!row) return;
    const i = +row.dataset.i;
    if (e.target.closest('[data-edit]')) return go('projects', i);
    if (e.target.closest('[data-up]')) return move(C.projects, i, -1, () => render());
    if (e.target.closest('[data-down]')) return move(C.projects, i, 1, () => render());
    if (e.target.closest('[data-dup]')) {
      const copy = { ...clone(C.projects[i]), id: uid(), title: `${C.projects[i].title} (copie)` };
      C.projects.splice(i + 1, 0, copy);
      changed();
      return render();
    }
    if (e.target.closest('[data-del]')) {
      if (await confirmBox(`Supprimer « ${C.projects[i].title} » ? Vous pourrez encore annuler tant que ce n'est pas publié.`, 'Supprimer')) {
        C.projects.splice(i, 1);
        changed();
        render();
        toast('Réalisation supprimée.');
      }
    }
  });
  list.addEventListener('change', (e) => {
    const t = e.target.closest('[data-vis]');
    if (!t) return;
    const i = +t.closest('.prow').dataset.i;
    C.projects[i].visible = t.checked;
    t.closest('.prow').classList.toggle('is-hidden-p', !t.checked);
    changed();
  });

  // glisser-déposer
  let from = null;
  list.addEventListener('dragstart', (e) => {
    const row = e.target.closest('.prow');
    from = +row.dataset.i;
    row.classList.add('is-drag');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(from));
  });
  list.addEventListener('dragover', (e) => {
    const row = e.target.closest('.prow');
    if (from == null || !row) return;
    e.preventDefault();
    $$('.prow', list).forEach((r) => r.classList.toggle('is-over', r === row && +r.dataset.i !== from));
  });
  list.addEventListener('drop', (e) => {
    const row = e.target.closest('.prow');
    if (from == null || !row) return;
    e.preventDefault();
    const to = +row.dataset.i;
    if (to !== from) {
      const [p] = C.projects.splice(from, 1);
      C.projects.splice(to, 0, p);
      changed();
    }
    from = null;
    render();
  });
  list.addEventListener('dragend', () => {
    from = null;
    $$('.prow', list).forEach((r) => r.classList.remove('is-drag', 'is-over'));
  });

  $('#add-project', el).addEventListener('click', () => {
    C.projects.unshift({
      id: uid(),
      visible: true,
      example: false,
      title: 'Nouvelle réalisation',
      client: '',
      year: String(new Date().getFullYear()),
      category: '',
      format: '',
      cover: '',
      alt: '',
      video: '',
      brief: '',
      approach: '',
      delivered: [],
      results: [{ value: '', label: '' }],
      credits: `${C.brand?.name || 'Stickprod'}`,
    });
    changed();
    go('projects', 0);
    toast('Nouvelle réalisation ajoutée en tête de la spirale.');
  });
}

function prowHTML(p, i) {
  const meta = [p.category, p.year, p.client].filter(Boolean).join(' · ') || 'À compléter';
  return `<li class="prow${p.visible === false ? ' is-hidden-p' : ''}" data-i="${i}" draggable="true">
    <div class="prow__handle">
      <button class="icon-b" type="button" data-up aria-label="Monter"${i === 0 ? ' disabled' : ''}>${ICON.up}</button>
      <button class="icon-b" type="button" data-down aria-label="Descendre"${i === C.projects.length - 1 ? ' disabled' : ''}>${ICON.down}</button>
    </div>
    ${p.cover ? `<img class="prow__thumb" src="${esc(sized(p.cover, 240))}" alt="" draggable="false">` : '<span class="prow__thumb"></span>'}
    <div class="prow__txt" data-edit><b>${esc(p.title || 'Sans titre')}${p.example ? '<span class="badge">Exemple</span>' : ''}</b><span>${esc(meta)}</span></div>
    <div class="prow__tools">
      <label class="switch" title="Visible sur le site"><input type="checkbox" data-vis${p.visible !== false ? ' checked' : ''}><i></i><span>Visible</span></label>
      <button class="icon-b" type="button" data-edit aria-label="Modifier">${ICON.edit}</button>
      <button class="icon-b" type="button" data-dup aria-label="Dupliquer">${ICON.copy}</button>
      <button class="icon-b icon-b--danger" type="button" data-del aria-label="Supprimer">${ICON.trash}</button>
    </div>
  </li>`;
}

// ---------- réalisations : fiche
function viewProject(el) {
  const i = editing;
  const p = C.projects[i];
  if (!p) return go('projects');
  const base = `projects.${i}`;
  const cats = [...new Set(C.projects.map((x) => x.category).filter(Boolean))];
  p.results ||= [];
  p.delivered ||= [];

  el.innerHTML = `
    <button class="b b--ghost b--small editor__back" type="button" id="back">${ICON.back}Toutes les réalisations</button>
    <div class="editor">
      <section class="card">
        <div class="card__head"><h2>Image de couverture</h2><p>C'est elle qui tourne dans la spirale. Format paysage conseillé.</p></div>
        <div class="cover" id="cover">
          <div class="cover__img${p.cover ? '' : ' is-empty'}" id="cover-img">${p.cover ? `<img src="${esc(sized(p.cover, 800))}" alt="">` : 'Aucune image'}<div class="cover__drop">Déposer la photo ici</div></div>
          <div class="grid">
            <div class="cover__actions">
              <label class="b b--accent">${ICON.up2}Importer une photo<input type="file" accept="image/*" id="cover-file" hidden></label>
              <button class="b b--ghost" type="button" id="cover-url-btn">${ICON.link}Utiliser un lien</button>
            </div>
            <div id="cover-url" hidden>${field({ label: "Lien de l'image", path: `${base}.cover`, type: 'url', placeholder: 'https://…' })}</div>
            ${field({ label: "Description de l'image (accessibilité)", path: `${base}.alt`, placeholder: 'ex. Flacon de parfum noir sur fond sombre' })}
            <p class="f__hint">La photo importée est redimensionnée automatiquement (1600 px) pour rester légère.</p>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>L'essentiel</h2></div>
        <div class="grid">
          ${field({ label: 'Titre du projet', path: `${base}.title`, max: 32 })}
          <div class="grid grid--2">
            ${field({ label: 'Client', path: `${base}.client`, placeholder: 'ex. Maison de parfum' })}
            ${field({ label: 'Catégorie', path: `${base}.category`, list: 'cats', placeholder: 'ex. Spot TV' })}
          </div>
          <div class="grid grid--2">
            ${field({ label: 'Année', path: `${base}.year`, placeholder: '2025' })}
            ${field({ label: 'Format', path: `${base}.format`, placeholder: 'ex. 30 s · 16:9 · 4K' })}
          </div>
          <datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>Le film</h2><p>YouTube, Vimeo ou fichier .mp4 : il se lance depuis la fiche du projet.</p></div>
        ${field({ label: 'Lien de la vidéo', path: `${base}.video`, type: 'url', placeholder: 'https://youtu.be/…', hint: videoHint(p.video) })}
      </section>

      <section class="card">
        <div class="card__head"><h2>Le récit</h2><p>Deux ou trois phrases suffisent.</p></div>
        <div class="grid">
          ${field({ label: 'Le brief : ce que le client voulait', path: `${base}.brief`, type: 'textarea', max: 180 })}
          ${field({ label: 'Notre réponse : comment on l’a fait', path: `${base}.approach`, type: 'textarea', rows: 4, max: 320 })}
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>Ce que le projet a livré</h2><p>Affiché à côté de l'image et dans la fiche.</p></div>
        <div class="grid">
          <div class="f"><span class="f__label">Livrables <small>Entrée pour ajouter</small></span>
            <div class="tags" id="tags">${p.delivered.map((d, k) => `<span class="tag">${esc(d)}<button type="button" data-rm-tag="${k}" aria-label="Retirer">×</button></span>`).join('')}<input id="tag-input" placeholder="ex. Spot TV 30 s"></div>
          </div>
          <div class="f"><span class="f__label">En chiffres <small>3 au maximum conseillés</small></span>
            <div class="results-ed" id="results-ed">
              ${p.results
                .map(
                  (r, k) => `<div class="results-ed__row">
                    <div class="f"><input data-path="${base}.results.${k}.value" value="${esc(r.value)}" placeholder="12" aria-label="Valeur"></div>
                    <div class="f"><input data-path="${base}.results.${k}.label" value="${esc(r.label)}" placeholder="jours de tournage" aria-label="Libellé"></div>
                    <button class="icon-b icon-b--danger" type="button" data-rm-res="${k}" aria-label="Retirer">${ICON.trash}</button>
                  </div>`,
                )
                .join('')}
            </div>
            ${p.results.length < 4 ? `<button class="b b--ghost b--small" type="button" id="add-res" style="justify-self:start">${ICON.plus}Ajouter un chiffre</button>` : ''}
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h2>Crédits et publication</h2></div>
        <div class="grid">
          ${field({ label: 'Crédits', path: `${base}.credits`, placeholder: 'Réalisation, image, montage : Stickprod' })}
          <div class="row-actions" style="gap:22px">
            ${toggle({ label: 'Visible sur le site', path: `${base}.visible`, checked: p.visible !== false })}
            ${toggle({ label: "Marquer « projet d'exemple »", path: `${base}.example`, checked: !!p.example })}
          </div>
        </div>
      </section>

      <div class="row-actions">
        <button class="b b--ghost" type="button" id="back2">${ICON.back}Terminé</button>
        <button class="b b--danger" type="button" id="del">${ICON.trash}Supprimer cette réalisation</button>
      </div>
    </div>`;

  bindFields(el);
  el.addEventListener('field', (e) => {
    if (e.detail.endsWith('.title')) $('#view-title').textContent = p.title || 'Réalisation';
    if (e.detail.endsWith('.video')) {
      const h = $(`[data-hint-for="${base}.video"]`, el);
      h.innerHTML = videoHint(p.video);
      h.className = `f__hint${p.video ? (videoEmbed(p.video) ? ' is-ok' : ' is-warn') : ''}`;
    }
    if (e.detail.endsWith('.cover')) paintCover();
    if (e.detail.endsWith('.visible') && p.visible !== false) gotoProject(i);
  });
  const h = $(`[data-hint-for="${base}.video"]`, el);
  if (p.video) h.classList.add(videoEmbed(p.video) ? 'is-ok' : 'is-warn');

  $('#back', el).addEventListener('click', () => go('projects'));
  $('#back2', el).addEventListener('click', () => go('projects'));
  $('#del', el).addEventListener('click', async () => {
    if (await confirmBox(`Supprimer « ${p.title} » ?`, 'Supprimer')) {
      C.projects.splice(i, 1);
      changed();
      go('projects');
      toast('Réalisation supprimée.');
    }
  });

  // couverture
  const paintCover = () => {
    const box = $('#cover-img', el);
    box.classList.toggle('is-empty', !p.cover);
    box.innerHTML = (p.cover ? `<img src="${esc(sized(p.cover, 800))}" alt="">` : 'Aucune image') + '<div class="cover__drop">Déposer la photo ici</div>';
  };
  const useFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return toast('Choisissez un fichier image (JPG, PNG, WebP…).', true);
    const box = $('#cover-img', el);
    box.insertAdjacentHTML('beforeend', '<div class="cover__busy">Préparation de la photo…</div>');
    try {
      p.cover = await compress(file);
      if (!p.alt) p.alt = p.title;
      const url = $(`[data-path="${base}.cover"]`, el);
      if (url) url.value = '';
      paintCover();
      changed();
      toast('Photo importée.');
    } catch (err) {
      console.error(err);
      paintCover();
      toast("Cette image n'a pas pu être lue.", true);
    }
  };
  $('#cover-file', el).addEventListener('change', (e) => useFile(e.target.files[0]));
  $('#cover-url-btn', el).addEventListener('click', () => {
    const box = $('#cover-url', el);
    box.hidden = !box.hidden;
    const input = $('input', box);
    if ((p.cover || '').startsWith('data:')) input.value = '';
    if (!box.hidden) input.focus();
  });
  const cover = $('#cover', el);
  cover.addEventListener('dragover', (e) => {
    e.preventDefault();
    cover.classList.add('is-drop');
  });
  cover.addEventListener('dragleave', () => cover.classList.remove('is-drop'));
  cover.addEventListener('drop', (e) => {
    e.preventDefault();
    cover.classList.remove('is-drop');
    useFile(e.dataTransfer.files[0]);
  });
  // le champ lien n'affiche pas une image importée (trop longue)
  const urlInput = $(`[data-path="${base}.cover"]`, el);
  if ((p.cover || '').startsWith('data:')) urlInput.value = '';

  // livrables
  const tags = $('#tags', el);
  const tagInput = $('#tag-input', el);
  const addTag = () => {
    const v = tagInput.value.trim().replace(/,$/, '');
    if (!v) return;
    p.delivered.push(v);
    tagInput.value = '';
    tagInput.insertAdjacentHTML('beforebegin', `<span class="tag">${esc(v)}<button type="button" data-rm-tag="${p.delivered.length - 1}" aria-label="Retirer">×</button></span>`);
    changed();
  };
  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput.value && p.delivered.length) {
      p.delivered.pop();
      tagInput.previousElementSibling?.remove();
      changed();
    }
  });
  tagInput.addEventListener('blur', addTag);
  tags.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rm-tag]');
    if (b) {
      p.delivered.splice(+b.dataset.rmTag, 1);
      changed();
      render();
    } else tagInput.focus();
  });

  // chiffres
  $('#results-ed', el).addEventListener('click', (e) => {
    const b = e.target.closest('[data-rm-res]');
    if (!b) return;
    p.results.splice(+b.dataset.rmRes, 1);
    changed();
    render();
  });
  $('#add-res', el)?.addEventListener('click', () => {
    p.results.push({ value: '', label: '' });
    changed({ preview: false });
    render();
    $$('#results-ed input', $('#view')).at(-2)?.focus();
  });

  gotoProject(i);
}

function videoHint(url) {
  if (!url) return 'Laissez vide si le film n’est pas en ligne : la fiche montrera la photo.';
  const e = videoEmbed(url);
  if (!e) return 'Lien non reconnu : utilisez un lien YouTube, Vimeo ou .mp4.';
  if (e.includes('youtube')) return '✓ Vidéo YouTube reconnue.';
  if (e.includes('vimeo')) return '✓ Vidéo Vimeo reconnue.';
  return '✓ Fichier vidéo reconnu.';
}

// ---------- textes
function viewTexts(el) {
  el.innerHTML = `
    <section class="card">
      <div class="card__head"><h2>Accueil</h2><p>Le premier écran, au-dessus de la spirale.</p></div>
      <div class="grid">
        ${field({ label: 'Surtitre', path: 'hero.kicker', max: 60 })}
        <div class="grid grid--2">
          ${field({ label: 'Titre — première ligne', path: 'hero.title', max: 28 })}
          ${field({ label: 'Titre — suite en italique', path: 'hero.titleEnd', max: 34 })}
        </div>
        ${field({ label: 'Texte de présentation', path: 'hero.lead', type: 'textarea', max: 220 })}
        ${field({ label: 'Bouton', path: 'hero.cta', max: 30 })}
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h2>Réalisations</h2><p>La légende de la spirale (visible sur ordinateur).</p></div>
      <div class="grid grid--2">
        ${field({ label: 'Surtitre', path: 'work.kicker', max: 30 })}
        ${field({ label: 'Phrase', path: 'work.title', max: 60 })}
      </div>
    </section>`;
  bindFields(el);
}

// ---------- listes réutilisables
function listEditor(el, { path, label, fields, empty, max = 12, image = false }) {
  const arr = getPath(path) || [];
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
            ? `<div class="item__img">${it.image ? `<img src="${esc(sized(it.image, 200))}" alt="">` : '<img alt="">'}<div class="grid">
                ${field({ label: 'Photo (lien)', path: `${path}.${k}.image`, type: 'url', placeholder: 'https://…' })}
                <label class="b b--ghost b--small" style="justify-self:start">${ICON.up2}Importer<input type="file" accept="image/*" data-img="${k}" hidden></label>
              </div></div>`
            : ''
        }
      </div>`,
      )
      .join('') +
    (arr.length < max ? `<button class="add-row" type="button" data-add>${ICON.plus}Ajouter</button>` : '');
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
    const f = e.target.closest('[data-img]');
    if (!f || !f.files[0]) return;
    try {
      arr[+f.dataset.img].image = await compress(f.files[0], 900);
      changed();
      render();
    } catch {
      toast("Cette image n'a pas pu être lue.", true);
    }
  });
  el.addEventListener('field', (e) => {
    if (!e.detail.endsWith('.image')) return;
    const k = +e.detail.split('.').at(-2);
    const img = $(`.item[data-k="${k}"] .item__img img`, box);
    if (img) img.src = sized(arr[k].image, 200) || '';
  });
}

function viewServices(el) {
  el.innerHTML = `<section class="card"><div class="card__head"><h2>En-tête</h2></div><div class="grid grid--2">
    ${field({ label: 'Surtitre', path: 'services.kicker' })}${field({ label: 'Titre', path: 'services.title', max: 48 })}</div></section>
    <div class="card__head"><h2>Métiers</h2><p>Sur ordinateur, la photo apparaît au survol.</p></div>`;
  bindFields(el);
  listEditor(el, {
    path: 'services.items',
    label: 'Métier',
    image: true,
    empty: { title: '', text: '', image: '' },
    fields: (b) => `<div class="grid">${field({ label: 'Nom', path: `${b}.title`, max: 40 })}${field({ label: 'Description', path: `${b}.text`, type: 'textarea', rows: 2, max: 140 })}</div>`,
  });
}

function viewProcess(el) {
  el.innerHTML = `<section class="card"><div class="card__head"><h2>En-tête</h2></div><div class="grid grid--2">
    ${field({ label: 'Surtitre', path: 'process.kicker' })}${field({ label: 'Titre', path: 'process.title', max: 48 })}</div></section>
    <div class="card__head"><h2>Étapes</h2><p>Elles se posent sur la spirale d'or, dans l'ordre.</p></div>`;
  bindFields(el);
  listEditor(el, {
    path: 'process.steps',
    label: 'Étape',
    max: 7,
    empty: { title: '', text: '', deliverable: '' },
    fields: (b) => `<div class="grid">${field({ label: 'Nom', path: `${b}.title`, max: 20 })}${field({ label: 'Description', path: `${b}.text`, type: 'textarea', rows: 2, max: 140 })}${field({ label: 'Ce que le client reçoit', path: `${b}.deliverable`, max: 30 })}</div>`,
  });
}

function viewStudio(el) {
  el.innerHTML = `<section class="card"><div class="card__head"><h2>Le manifeste</h2><p>Les mots s'allument un à un au scroll.</p></div><div class="grid">
    ${field({ label: 'Surtitre', path: 'studio.kicker' })}${field({ label: 'Phrase', path: 'studio.statement', type: 'textarea', rows: 4, max: 200 })}</div></section>
    <div class="card__head"><h2>Repères</h2><p>Des faits vérifiables : année, lieu, nombre de films…</p></div>`;
  bindFields(el);
  listEditor(el, {
    path: 'studio.facts',
    label: 'Repère',
    max: 4,
    empty: { value: '', label: '' },
    fields: (b) => `<div class="grid grid--2">${field({ label: 'Valeur', path: `${b}.value`, max: 8 })}${field({ label: 'Légende', path: `${b}.label`, max: 40 })}</div>`,
  });
}

function viewContact(el) {
  el.innerHTML = `
    <section class="card">
      <div class="card__head"><h2>Bloc contact</h2></div>
      <div class="grid">
        ${field({ label: 'Surtitre', path: 'contact.kicker' })}
        ${field({ label: 'Titre', path: 'contact.title', max: 60 })}
        ${field({ label: 'Texte', path: 'contact.text', type: 'textarea', max: 200 })}
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h2>Coordonnées</h2><p>Le formulaire envoie vers WhatsApp si un numéro est renseigné, sinon vers l'e-mail.</p></div>
      <div class="grid">
        <div class="grid grid--2">
          ${field({ label: 'E-mail', path: 'contact.email', type: 'email', placeholder: 'contact@…' })}
          ${field({ label: 'Téléphone', path: 'contact.phone', type: 'tel', placeholder: '+213 …' })}
        </div>
        <div class="grid grid--2">
          ${field({ label: 'WhatsApp (numéro international)', path: 'contact.whatsapp', type: 'tel', placeholder: '213 5xx xx xx xx' })}
          ${field({ label: 'Instagram (lien)', path: 'contact.instagram', type: 'url' })}
        </div>
        ${field({ label: 'Adresse du studio', path: 'contact.address' })}
      </div>
    </section>`;
  bindFields(el);
}

function viewLook(el) {
  const colors = ['#ff4a1c', '#e8b84a', '#e5e0d6', '#39d4c4', '#6f7dff', '#d83a6b'];
  const cur = (C.brand?.accent || '#ff4a1c').toLowerCase();
  el.innerHTML = `
    <section class="card">
      <div class="card__head"><h2>Marque</h2></div>
      ${field({ label: 'Nom affiché', path: 'brand.name', max: 18, hint: 'Utilisé dans le menu, le chargement et le grand mot du pied de page.' })}
    </section>
    <section class="card">
      <div class="card__head"><h2>Couleur d'accent</h2><p>Le point REC, le fil de la spirale, les chiffres, les boutons au survol.</p></div>
      <div class="swatches" id="swatches">
        ${colors.map((c) => `<button class="swatch" type="button" style="--c:${c}" data-c="${c}" aria-label="${c}" aria-pressed="${c === cur}"></button>`).join('')}
        <label class="swatch swatch--custom" title="Autre couleur" aria-pressed="${!colors.includes(cur)}"><input type="color" value="${esc(cur)}" id="custom-color" aria-label="Autre couleur"></label>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h2>Texture</h2></div>
      ${toggle({ label: 'Grain de pellicule sur tout le site', path: 'brand.grain', checked: C.brand?.grain !== false })}
    </section>`;
  bindFields(el);
  const setColor = (c) => {
    C.brand.accent = c;
    $$('.swatch', el).forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.c === c)));
    document.documentElement.style.setProperty('--accent', c);
    changed();
  };
  $('#swatches', el).addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (b) setColor(b.dataset.c);
  });
  $('#custom-color', el).addEventListener('change', (e) => setColor(e.target.value));
}

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
      <div class="card__head"><h2>Copie de sécurité</h2><p>Un fichier qui contient tout le site : textes, réalisations et photos importées.</p></div>
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
    <p class="note"><b>Démo :</b> les publications sont gardées dans ce navigateur, donc visibles seulement ici. Sur le site en ligne, le bouton « Publier » envoie le contenu au serveur et tous les visiteurs voient la nouvelle version, sans toucher au code.</p>`;

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
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `stickprod-contenu-${new Date().toISOString().slice(0, 10)}.json` });
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
      if (!Array.isArray(data.projects) || !data.hero) throw new Error('format');
      C = data;
      changed();
      render();
      toast('Copie restaurée. Publiez pour la mettre en ligne.');
    } catch {
      toast("Ce fichier n'est pas une copie du site.", true);
    }
  });
  $('#bk-reset', el).addEventListener('click', async () => {
    if (!(await confirmBox('Revenir au contenu d’origine ? Les réalisations ajoutées ici seront perdues (pensez à télécharger une copie).', 'Revenir à l’origine'))) return;
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
/* Outils                                                              */
/* ------------------------------------------------------------------ */
function move(arr, i, dir, then) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  changed();
  then?.();
}

const uid = () => `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// photo importée → WebP (ou JPEG) de 1600 px maximum, en data URL
async function compress(file, max = 1600) {
  const src = await (window.createImageBitmap
    ? createImageBitmap(file)
    : new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = URL.createObjectURL(file);
      }));
  const s = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.round(src.width * s);
  c.height = Math.round(src.height * s);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  let url = c.toDataURL('image/webp', 0.8);
  if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.84);
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
