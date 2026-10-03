// Outils de l'espace admin : état partagé, champs liés au brouillon, tiroir, notifications.
import { esc } from '../store.js';

export { esc };
export const S = {
  draft: null, // contenu en cours d'édition
  lang: 'fr', // langue d'édition des textes
  onChange: () => {},
};

/* Chemins dans le brouillon : "products.3.name" ------------------------- */
// Un « ~ » dans un segment représente un point dans la clé (ex. text.film~rec.fr)
const segs = (path) => path.split('.').map((k) => k.replaceAll('~', '.'));
export function getPath(obj, path) {
  return segs(path).reduce((o, k) => (o == null ? o : o[k]), obj);
}
export function setPath(obj, path, value) {
  const keys = segs(path);
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null || typeof o[keys[i]] !== 'object') o[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    o = o[keys[i]];
  }
  o[keys.at(-1)] = value;
}

export const langMeta = (code) => S.draft.languages.find((l) => l.code === code) || { code, dir: 'ltr', name: code };
const defLang = () => S.draft.defaultLang || 'fr';

/* Champs ------------------------------------------------------------------ */
// Champ simple lié au brouillon
export function field(path, label, { type = 'text', help = '', attrs = '', options = null, wide = false } = {}) {
  const v = getPath(S.draft, path);
  let input;
  if (options) input = `<select data-path="${path}" ${attrs}>${options.map(([val, l]) => `<option value="${esc(val)}"${String(val) === String(v ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  else if (type === 'textarea') input = `<textarea data-path="${path}" rows="4" ${attrs}>${esc(v ?? '')}</textarea>`;
  else if (type === 'checkbox') return `<label class="sw"><input type="checkbox" data-path="${path}" ${v ? 'checked' : ''} ${attrs}><span class="sw__ui"></span><span>${esc(label)}</span></label>`;
  else input = `<input type="${type}" data-path="${path}" value="${esc(v ?? '')}" ${attrs}>`;
  return `<label class="f${wide ? ' f--wide' : ''}"><span>${esc(label)}</span>${input}${help ? `<small>${help}</small>` : ''}</label>`;
}

// Champ multilingue : affiche la langue d'édition, la langue par défaut en référence
export function ml(path, label, { textarea = false, rows = 3, wide = false, max = 0 } = {}) {
  const obj = getPath(S.draft, path) || {};
  const L = S.lang;
  const meta = langMeta(L);
  const val = obj[L] ?? '';
  const ref = L !== defLang() ? obj[defLang()] || '' : '';
  const dots = S.draft.languages.map((l) => `<i class="${obj[l.code] ? 'is-ok' : ''}" title="${esc(l.name)}">${esc(l.code)}</i>`).join('');
  const attrs = `data-path="${path}.${L}" dir="${meta.dir}" lang="${esc(L)}" placeholder="${esc(ref)}"${max ? ` data-max="${max}"` : ''}`;
  const input = textarea ? `<textarea ${attrs} rows="${rows}">${esc(val)}</textarea>` : `<input type="text" ${attrs} value="${esc(val)}">`;
  return `<label class="f f--ml${wide ? ' f--wide' : ''}"><span>${esc(label)} <em class="mlbadge">${esc(L.toUpperCase())}</em><b class="mldots">${dots}</b></span>${input}${ref ? `<small class="ref"><b>${esc(defLang().toUpperCase())}</b> ${esc(ref)}</small>` : ''}${max ? `<small class="count"></small>` : ''}</label>`;
}

// Lie tous les [data-path] d'une zone au brouillon
export function bind(root, after = () => {}) {
  const handler = (e) => {
    const el = e.target.closest('[data-path]');
    if (!el || !root.contains(el)) return;
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if (el.type === 'number' || el.dataset.num) v = el.value === '' ? null : Number(el.value);
    else v = el.value;
    setPath(S.draft, el.dataset.path, v);
    counter(el);
    S.onChange();
    after(el, v);
  };
  root.addEventListener('input', handler);
  root.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') handler(e);
  });
  root.querySelectorAll('[data-max]').forEach(counter);
}
function counter(el) {
  const max = Number(el.dataset.max);
  if (!max) return;
  const c = el.parentElement.querySelector('.count');
  const n = (el.value || '').length;
  if (c) {
    c.textContent = `${n} / ${max} caractères`;
    c.classList.toggle('is-over', n > max);
  }
}

/* Tiroir latéral --------------------------------------------------------------- */
const drawer = () => document.getElementById('drawer');
let onDrawerClose = null;
export function openDrawer(title, html, { onClose, wide = false } = {}) {
  const d = drawer();
  document.getElementById('drawer-title').textContent = title;
  const body = document.getElementById('drawer-body');
  body.innerHTML = html;
  d.classList.toggle('drawer--wide', wide);
  d.hidden = false;
  requestAnimationFrame(() => d.classList.add('is-open'));
  onDrawerClose = onClose || null;
  body.scrollTop = 0;
  return body;
}
export function closeDrawer() {
  const d = drawer();
  if (d.hidden) return;
  d.classList.remove('is-open');
  setTimeout(() => (d.hidden = true), 280);
  const fn = onDrawerClose;
  onDrawerClose = null;
  fn?.();
}
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeDrawer();
});
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeDrawer());

/* Notifications ------------------------------------------------------------------- */
export function toast(msg, kind = '') {
  const t = document.createElement('div');
  t.className = `toast ${kind ? 'toast--' + kind : ''}`;
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.classList.add('is-out'), 2600);
  setTimeout(() => t.remove(), 3100);
}
export const confirmDo = (msg) => window.confirm(msg);

/* Images : compressées dans le navigateur avant enregistrement --------------------- */
export function compressImage(file, max = 1200, q = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/webp', q));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/* Divers ------------------------------------------------------------------------------ */
export const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'element';
export const t = (field) => (field && typeof field === 'object' ? field[S.lang] || field[S.draft.defaultLang || 'fr'] || field.en || Object.values(field).find(Boolean) || '' : field || '');
export const tf = (field) => (field && typeof field === 'object' ? field.fr || field[S.draft.defaultLang] || field.en || Object.values(field).find(Boolean) || '' : field || '');
export const emptyML = () => Object.fromEntries(S.draft.languages.map((l) => [l.code, '']));
export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) => new Date(iso).toLocaleString('fr-FR', opts);
export const countryName = (() => {
  let dn;
  try {
    dn = new Intl.DisplayNames(['fr'], { type: 'region' });
  } catch {}
  return (c) => {
    try {
      return (c && dn?.of(c)) || c || '—';
    } catch {
      return c || '—';
    }
  };
})();
export const ISO = 'AE AF AL AM AO AR AT AU AZ BA BD BE BF BG BH BJ BR BY CA CD CF CG CH CI CL CM CN CO CR CY CZ DE DJ DK DO DZ EC EE EG ES ET FI FR GA GB GE GH GM GN GQ GR GT GW HK HR HU ID IE IL IN IQ IR IS IT JO JP KE KG KR KW KZ LB LK LR LT LU LV LY MA MD ME MG MK ML MR MT MU MX MY MZ NE NG NL NO NZ OM PA PE PH PK PL PT QA RO RS RU RW SA SD SE SG SI SK SL SN SO SY TD TG TH TN TR TW TZ UA UG US UY UZ VE VN YE ZA ZM ZW'.split(' ');
export function move(arr, i, d) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return false;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  arr.forEach((x, k) => 'order' in x && (x.order = k));
  return true;
}
