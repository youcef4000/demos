// Outils communs aux scènes des vidéos : texte riche, mots animables, frappe au clavier, compteurs.
// Toutes les animations passent par des timelines GSAP : la vidéo peut être lue, mise en pause,
// déplacée ou rendue image par image, avec exactement le même résultat.

export const G = () => window.gsap;

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * Texte riche : *or*, ~jade (body)~, ^cuivre (CTA)^, _souligné_.
 * Renvoie une liste de jetons { t: texte, c: classe }.
 */
export function tokens(text) {
  const out = [];
  const re = /(\*[^*]+\*|~[^~]+~|\^[^^]+\^|_[^_]+_)/g;
  let last = 0;
  let m;
  const s = String(text ?? '');
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index), c: '' });
    const k = m[0][0];
    out.push({ t: m[0].slice(1, -1), c: { '*': 'hl', '~': 'hl-body', '^': 'hl-cta', _: 'hl-u' }[k] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last), c: '' });
  return out;
}

/** Texte riche sans découpage (pour les petits libellés). */
export const rich = (text) =>
  tokens(text)
    .map((k) => (k.c ? `<span class="${k.c}">${esc(k.t)}</span>` : esc(k.t)))
    .join('');

/** Chaque mot dans un masque : <span class="w"><span class="wi">mot</span></span>. */
export function words(text) {
  return tokens(text)
    .map((k) =>
      k.t
        .split(/(\s+)/)
        .map((w) => (/^\s+$/.test(w) ? ' ' : w ? `<span class="w"><span class="wi ${k.c}">${esc(w)}</span></span>` : ''))
        .join(''),
    )
    .join('');
}

export function h(tag, cls = '', html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

export const $ = (root, sel) => root.querySelector(sel);
export const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));

/** Mots qui montent de leur masque, un par un. */
export function riseWords(tl, root, at = 0, { stagger = 0.06, duration = 0.7, sel = '.wi' } = {}) {
  const ws = $$(root, sel);
  if (!ws.length) return tl;
  tl.fromTo(ws, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration, ease: 'expo.out', stagger }, at);
  return tl;
}

/** Frappe au clavier déterministe : le texte affiché dépend seulement du temps. */
export function type(tl, node, text, at = 0, { cps = 38, caret = true } = {}) {
  const s = String(text);
  const p = { n: 0 };
  const dur = Math.max(0.2, s.length / cps);
  node.textContent = '';
  if (caret) node.classList.add('caret');
  tl.fromTo(
    p,
    { n: 0 },
    {
      n: s.length,
      duration: dur,
      ease: 'none',
      onUpdate: () => {
        node.textContent = s.slice(0, Math.round(p.n));
      },
    },
    at,
  );
  return dur;
}

/** Compteur : de `from` à `to`. */
export function count(tl, node, to, at = 0, { from = 0, duration = 1.2, decimals = 0, prefix = '', suffix = '' } = {}) {
  const p = { v: from };
  const show = () => {
    node.textContent = `${prefix}${p.v.toFixed(decimals).replace('.', ',')}${suffix}`;
  };
  show();
  tl.fromTo(p, { v: from }, { v: to, duration, ease: 'power3.out', onUpdate: show }, at);
}

/** Trace d'un chemin SVG (sans plugin) : dasharray = longueur, puis dashoffset vers 0. */
export function draw(tl, paths, at = 0, { duration = 1, ease = 'power2.inOut', stagger = 0 } = {}) {
  const list = Array.isArray(paths) || paths instanceof NodeList ? Array.from(paths) : [paths];
  list.forEach((p, i) => {
    const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 1000) + 2;
    p.style.strokeDasharray = `${len} ${len}`;
    tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration, ease }, at + i * stagger);
  });
}

export const fmt = (t) => {
  const s = Math.max(0, Math.floor(t));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Petit libellé de section (mono, trait doré). */
export const kicker = (text, cls = '') => (text ? `<p class="kick ${cls}"><i></i>${rich(text)}</p>` : '');

/** Durée d'une scène sans voix enregistrée : d'après la longueur du texte à dire. */
export function autoDuration(sc, base = 4) {
  const n = String(sc.say || '').split(/\s+/).filter(Boolean).length;
  return Math.min(24, Math.max(base, n / 2.1 + 2));
}

/** Appelle fn(t) à chaque image de la scène (t = temps local). Pour les états qui dépendent du temps. */
export function track(tl, d, fn) {
  const p = { t: 0 };
  tl.fromTo(p, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => fn(p.t) }, 0);
}
