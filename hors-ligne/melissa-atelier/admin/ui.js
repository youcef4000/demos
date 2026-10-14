// Outils partagés de l'espace atelier : données, icônes, fenêtres, notifications, champs de formulaire.
import { loadData, saveData, esc, parseISO, today, diffDays, iso, money, fmtDate, COLORS } from '../store.js';

export { esc, money, fmtDate };

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// État partagé : les données de l'atelier et la fonction qui redessine la rubrique ouverte
export const S = { data: loadData(), render: () => {}, go: () => {} };

export function commit(msg) {
  const ok = saveData(S.data);
  if (!ok) toast("Enregistrement impossible : la mémoire du navigateur est pleine. Retirez des photos.", true);
  else if (msg) toast(msg);
  S.render();
}
export function log(text) {
  S.data.journal = S.data.journal || [];
  S.data.journal.unshift({ at: Date.now(), text });
  if (S.data.journal.length > 200) S.data.journal.length = 200;
}

// Chemin d'une image enregistrée (relative au site, ou importée en data:)
export const src = (p) => (!p ? '' : /^(data:|https?:|blob:)/.test(p) ? p : `../${p}`);
export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
export const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const num = (v, d = 0) => (Number.isFinite(Number(v)) && String(v).trim() !== '' ? Number(v) : d);
export const fmtNum = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const plural = (n, one, many) => `${fmtNum(n)} ${Math.abs(n) > 1 ? many : one}`;

export function rel(dateISO) {
  if (!dateISO) return '';
  const d = diffDays(iso(today()), dateISO);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return 'demain';
  if (d === -1) return 'hier';
  if (d > 1) return `dans ${d} j`;
  return `il y a ${-d} j`;
}
export const ago = (ts) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
};
export const season = (dateISO = iso(today())) => {
  const d = parseISO(dateISO);
  const m = d.getMonth();
  const y = d.getFullYear();
  if (m >= 2 && m <= 4) return `Printemps ${y}`;
  if (m >= 5 && m <= 7) return `Été ${y}`;
  if (m >= 8 && m <= 10) return `Automne ${y}`;
  return `Hiver ${m === 11 ? y + 1 : y}`;
};
export const phoneDigits = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  if (/^0[5-7]\d{8}$/.test(d)) return `213${d.slice(1)}`;
  if (/^213[5-7]\d{8}$/.test(d)) return d;
  return '';
};
export const waLink = (phone, text) => {
  const d = phoneDigits(phone);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : '';
};

/* Icônes ------------------------------------------------------------- */
const ICONS = {
  home: '<path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  sketch: '<path d="M4 20l4.2-1L19.5 7.7a2 2 0 0 0-2.8-2.8L5.4 16.2z"/><path d="M14.8 6.8l2.8 2.8"/>',
  needle: '<path d="M20 4L6.5 17.5"/><path d="M17.2 4.3l2.5 2.5"/><path d="M6.5 17.5L4 20"/><path d="M18.5 5.5c-5.5 1-8.5 4.5-6.5 7s6 2 4 6"/>',
  hanger: '<path d="M10 6.5a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.9V10"/><path d="M12 10l-8.6 6.7a1 1 0 0 0 .6 1.8h16a1 1 0 0 0 .6-1.8z"/>',
  box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  bag: '<path d="M5 8h14l-1.1 12.1H6.1z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 3.8L2.8 19.8h18.4z"/><path d="M12 10v4.2M12 16.8v.4"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 16V5M7 10l5-5 5 5M4 20h16"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  phone: '<path d="M5 3.5h3.2l1.6 4.2-2.2 1.4a11 11 0 0 0 5.3 5.3l1.4-2.2 4.2 1.6V17a2.5 2.5 0 0 1-2.7 2.5A15.5 15.5 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5z"/>',
  wa: '<path d="M12 2.6a9.4 9.4 0 0 0-8.1 14.1L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.6zm4.3 11.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  heart: '<path d="M12 20.5C5.2 15.6 3 11.4 4.6 8.2c1.4-2.7 5-3 7.4.2 2.4-3.2 6-2.9 7.4-.2 1.6 3.2-.6 7.4-7.4 12.3z"/>',
  scissors: '<circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.5L20 17M8.2 15.5L20 7"/>',
  fabric: '<path d="M4 6.5C4 5 5 4 6.5 4H18v13H6.5A2.5 2.5 0 0 0 4 19.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20V4"/>',
  move: '<path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/>',
};
export const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* Statuts (vert / orange / rouge, toujours accompagnés d'une icône et d'un mot) */
export const PACE = {
  avance: { label: 'En avance', tone: 'good', icon: 'up' },
  ok: { label: 'Dans les temps', tone: 'good', icon: 'check' },
  retard: { label: 'En retard', tone: 'critical', icon: 'alert' },
  fini: { label: 'Terminé', tone: 'good', icon: 'check' },
};
export const chip = (label, tone = '', ic = '') => `<span class="tag${tone ? ` tag--${tone}` : ''}">${ic ? icon(ic) : ''}${esc(label)}</span>`;

// Jauge : remplissage coloré selon l'état, piste du même ton en plus clair
export const meter = (ratio, tone = 'accent', label = '') =>
  `<span class="meter meter--${tone}" role="img" aria-label="${esc(label || `${Math.round(ratio * 100)} %`)}"><i style="--w:${Math.max(0, Math.min(1, ratio)) * 100}%"></i></span>`;

export const ava = (name) => {
  const n = String(name || '?').trim();
  const hue = [...n].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 4;
  return `<span class="ava ava--${hue}" title="${esc(n)}">${esc(n.charAt(0).toUpperCase())}</span>`;
};
export const dots = (colors = [], max = 6) => `<span class="dots">${colors.slice(0, max).map((c) => `<i style="--c:${esc(c.hex)}" title="${esc(c.name)}"></i>`).join('')}</span>`;

// Vignette : photo si disponible, sinon dégradé des couleurs du modèle avec l'initiale
export function thumb(item, cls = '') {
  if (item.img) return `<span class="thumb ${cls}"><img src="${esc(src(item.img))}" alt="" loading="lazy"></span>`;
  const cs = (item.colors || []).map((c) => c.hex);
  const bg = cs.length > 1 ? `linear-gradient(135deg, ${cs.join(', ')})` : cs[0] || '#e8dccf';
  return `<span class="thumb thumb--empty ${cls}" style="background:${esc(bg)}"><b>${esc((item.name || '?').charAt(0))}</b></span>`;
}

/* En-tête de rubrique -------------------------------------------------- */
export function head({ kicker = '', title, sub = '', actions = '' }) {
  return `<header class="vh">
    <div class="vh__text">${kicker ? `<p class="vh__kicker">${kicker}</p>` : ''}<h1 class="vh__title">${title}</h1>${sub ? `<p class="vh__sub">${sub}</p>` : ''}</div>
    ${actions ? `<div class="vh__actions">${actions}</div>` : ''}
  </header>`;
}
export const btn = (label, { act = '', kind = 'dark', ic = '', attrs = '', small = false } = {}) =>
  `<button type="button" class="b b--${kind}${small ? ' b--sm' : ''}" ${act ? `data-act="${act}"` : ''} ${attrs}>${ic ? icon(ic) : ''}<span>${label}</span></button>`;
export const tile = (label, value, sub = '', tone = '') =>
  `<div class="tile${tone ? ` tile--${tone}` : ''}"><p class="tile__label">${label}</p><p class="tile__value">${value}</p>${sub ? `<p class="tile__sub">${sub}</p>` : ''}</div>`;
export const empty = (text, action = '') => `<div class="empty">${icon('heart')}<p>${text}</p>${action}</div>`;

/* Notification ---------------------------------------------------------- */
let toastTimer = 0;
export function toast(msg, warn = false, action = null) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<a href="${esc(action.href)}" ${action.ext ? 'target="_blank" rel="noopener"' : ''}>${esc(action.label)}</a>` : ''}`;
  t.classList.toggle('is-warn', warn);
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), action ? 6000 : 3200);
}

/* Fenêtre (formulaire en bas d'écran sur mobile, au centre sur ordinateur) */
let sheetCfg = null;
let opener = null;
export function openSheet(cfg) {
  const dlg = $('#sheet');
  sheetCfg = cfg;
  opener = document.activeElement;
  $('#sheet-title').textContent = cfg.title;
  // Corps neuf à chaque ouverture : les écouteurs de la fenêtre précédente disparaissent avec lui
  const old = $('#sheet-body');
  const body = old.cloneNode(false);
  old.replaceWith(body);
  body.innerHTML = cfg.body;
  $('#sheet-foot').innerHTML = `${cfg.danger ? `<button type="button" class="b b--ghost b--danger" data-sheet-danger>${icon('trash')}<span>${esc(cfg.danger)}</span></button>` : ''}<span class="sheet__sp"></span>${cfg.cancel === false ? '' : `<button type="button" class="b b--ghost" data-sheet-close>${esc(cfg.cancel || 'Annuler')}</button>`}${cfg.submit === false ? '' : `<button type="submit" class="b b--dark">${esc(cfg.submit || 'Enregistrer')}</button>`}`;
  dlg.classList.toggle('sheet--wide', !!cfg.wide);
  if (!dlg.open) dlg.showModal();
  body.scrollTop = 0;
  cfg.onMount?.(body);
  const first = body.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea');
  if (first && !cfg.noFocus && matchMedia('(pointer: fine)').matches) first.focus();
  else $('#sheet-title').focus?.();
}
export function closeSheet() {
  const dlg = $('#sheet');
  if (dlg.open) dlg.close();
  sheetCfg = null;
  if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
}
export function setupSheet() {
  const dlg = $('#sheet');
  const form = $('#sheet-form');
  $('#sheet-title').tabIndex = -1;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!sheetCfg) return closeSheet();
    const r = sheetCfg.onSubmit?.(readForm(form), form);
    if (r !== false) closeSheet();
  });
  dlg.addEventListener('click', async (e) => {
    if (e.target === dlg || e.target.closest('[data-sheet-close]')) return closeSheet();
    if (e.target.closest('[data-sheet-danger]') && sheetCfg?.onDanger) {
      const ok = await ask(sheetCfg.dangerAsk || 'Supprimer définitivement ?', sheetCfg.danger);
      if (ok && sheetCfg.onDanger() !== false) closeSheet();
    }
  });
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeSheet();
  });
}

// Lecture d'un formulaire : les cases multiples (name[]) deviennent des listes
export function readForm(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    const multi = el.name.endsWith('[]');
    const key = multi ? el.name.slice(0, -2) : el.name;
    if (multi) out[key] = out[key] || [];
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) {
      if (el.type === 'checkbox' && !multi) out[key] = false;
      continue;
    }
    const v = el.type === 'checkbox' && !multi ? true : el.value;
    if (multi) out[key].push(v);
    else out[key] = v;
  }
  return out;
}

/* Confirmation ---------------------------------------------------------- */
export function ask(text, okLabel = 'Confirmer') {
  return new Promise((resolve) => {
    let d = $('#ask');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'ask';
      d.className = 'ask';
      document.body.append(d);
    }
    d.innerHTML = `<p>${esc(text)}</p><div class="ask__actions"><button type="button" class="b b--ghost" value="0">Annuler</button><button type="button" class="b b--danger-fill" value="1">${esc(okLabel)}</button></div>`;
    const done = (v) => {
      d.close();
      resolve(v);
    };
    d.onclick = (e) => {
      const b = e.target.closest('button');
      if (b) done(b.value === '1');
      else if (e.target === d) done(false);
    };
    d.oncancel = (e) => {
      e.preventDefault();
      done(false);
    };
    d.showModal();
    d.querySelector('.b--danger-fill').focus();
  });
}

/* Champs ----------------------------------------------------------------- */
export const field = (label, control, { hint = '', wide = false } = {}) =>
  `<label class="f${wide ? ' f--wide' : ''}"><span class="f__label">${label}</span>${control}${hint ? `<span class="f__hint">${hint}</span>` : ''}</label>`;
export const group = (label, control, { wide = true, hint = '' } = {}) =>
  `<div class="f${wide ? ' f--wide' : ''}" role="group" aria-label="${esc(label)}"><span class="f__label">${label}</span>${control}${hint ? `<span class="f__hint">${hint}</span>` : ''}</div>`;
export const input = (name, value = '', attrs = '') => `<input name="${name}" value="${esc(value ?? '')}" ${attrs}>`;
export const area = (name, value = '', attrs = '') => `<textarea name="${name}" rows="3" ${attrs}>${esc(value ?? '')}</textarea>`;
export const select = (name, options, value, attrs = '') =>
  `<select name="${name}" ${attrs}>${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
export const choice = (name, options, values = [], { multi = false } = {}) => {
  const vs = (Array.isArray(values) ? values : [values]).map(String);
  return `<div class="choice">${options
    .map(([v, l, color]) => `<label class="choice__i"><input type="${multi ? 'checkbox' : 'radio'}" name="${name}${multi ? '[]' : ''}" value="${esc(v)}"${vs.includes(String(v)) ? ' checked' : ''}><span>${color ? `<i style="--c:${esc(color)}"></i>` : ''}${esc(l)}</span></label>`)
    .join('')}</div>`;
};
export const toggle = (name, checked, label) => `<label class="switch"><input type="checkbox" name="${name}"${checked ? ' checked' : ''}><i></i><span>${label}</span></label>`;
export const colorChoice = (name, selected = []) =>
  choice(name, Object.values(COLORS).map((c) => [c.name, c.name, c.hex]), selected.map((c) => c.name), { multi: true });
export const colorsFrom = (names = []) => names.map((n) => Object.values(COLORS).find((c) => c.name === n)).filter(Boolean).map((c) => ({ ...c }));

// Photo : aperçu, choix d'un fichier, compression en WebP avant l'enregistrement
export const photoField = (name, value = '', label = 'Photo') =>
  `<div class="f f--wide"><span class="f__label">${label}</span><div class="photo" data-photo>
    <span class="photo__prev">${value ? `<img src="${esc(src(value))}" alt="">` : icon('image')}</span>
    <span class="photo__btns"><label class="b b--ghost b--sm">${icon('upload')}<span>Choisir une photo</span><input type="file" accept="image/*" hidden></label>${value ? '<button type="button" class="b b--ghost b--sm" data-photo-clear>Retirer</button>' : ''}</span>
    <input type="hidden" name="${name}" value="${esc(value)}">
  </div></div>`;
export function bindPhoto(root) {
  $$('[data-photo]', root).forEach((box) => {
    const hidden = $('input[type=hidden]', box);
    const prev = $('.photo__prev', box);
    $('input[type=file]', box).addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      prev.classList.add('is-busy');
      try {
        hidden.value = await compress(f);
        prev.innerHTML = `<img src="${hidden.value}" alt="">`;
      } catch {
        toast("Cette image n'a pas pu être lue.", true);
      }
      prev.classList.remove('is-busy');
    });
    box.addEventListener('click', (e) => {
      if (!e.target.closest('[data-photo-clear]')) return;
      hidden.value = '';
      prev.innerHTML = icon('image');
    });
  });
}
export function compress(file, max = 720) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let out = c.toDataURL('image/webp', 0.78);
      if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', 0.8);
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}

// Liste déroulante des clientes pour les champs « nom »
export const clientList = () =>
  `<datalist id="dl-clientes">${S.data.clientes.map((c) => `<option value="${esc(c.name)}"></option>`).join('')}</datalist>`;
