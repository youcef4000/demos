// Scènes ajoutées pour les leçons montées sur la voix (formules de vente, tableaux…).
// Même contrat que scenes.js : export function nom(root, sc, d, ctx) → timeline GSAP qui démarre à 0.
// Le moteur (engine.js) réunit ces scènes avec celles de scenes.js.

import { G, esc, rich, words, kicker, $, $$, riseWords, track } from './kit.js';
import { icon } from '../assets/js/icons.js';

const C = { hook: 'var(--hook)', body: 'var(--body)', cta: 'var(--cta)', gold: 'var(--gold-400)', ia: 'var(--ia)', danger: 'var(--danger)', mist: 'var(--mist-300)' };
const col = (c) => C[c] || c || 'var(--gold-400)';
const isAr = (s) => /[؀-ۿ]/.test(String(s || ''));
const txt = (s) => (isAr(s) ? `<span lang="ar" dir="rtl">${esc(s)}</span>` : rich(s));

function head(root, sc) {
  return sc.title || sc.kicker ? `<header class="s-head">${kicker(sc.kicker)}${sc.title ? `<h2 class="s-title">${words(sc.title)}</h2>` : ''}</header>` : '';
}
function enterHead(tl, root) {
  const k = $(root, '.s-head .kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0);
  const h2 = $(root, '.s-title');
  if (h2) riseWords(tl, h2, 0.08, { stagger: 0.04, duration: 0.6 });
}

/* ------------------------------------------------------------------ */
/* Acronyme : AIDA, PAS, CAP, SONCAS… lettre par lettre                */
/* ------------------------------------------------------------------ */

/**
 * { type: 'acronym', kicker, title, letters: [{ k: 'A', word: 'Attention', sub: 'Le hook', c: 'hook', at: 1.2 }], note, noteAt }
 * Chaque lettre est une colonne : d'abord la lettre seule, puis à son `at` elle se déplie (mot + explication).
 * La lettre active brille, les précédentes restent visibles.
 */
export function acronym(root, sc, d) {
  const L = sc.letters || [];
  root.innerHTML = `${head(root, sc)}
    <div class="acr acr-n${L.length}">
      ${L.map((l, i) => `<div class="acr-col" style="--c:${col(l.c)}" data-i="${i}">
          <b class="acr-k">${esc(l.k)}</b>
          <div class="acr-t"><p class="acr-w">${rich(l.word || '')}</p>${l.sub ? `<p class="acr-s">${txt(l.sub)}</p>` : ''}</div>
          <i class="acr-bar"></i>
        </div>`).join('')}
    </div>
    ${sc.note ? `<p class="acr-note">${rich(sc.note)}</p>` : ''}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const cols = $$(root, '.acr-col');
  const base = sc.title ? 0.4 : 0.15;
  // Les lettres arrivent ensemble, comme un mot
  tl.fromTo($$(root, '.acr-k'), { autoAlpha: 0, yPercent: 60, scale: 0.6 }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.07 }, base);
  tl.fromTo(cols, { '--fill': 0 }, { '--fill': 0.08, duration: 0.6, stagger: 0.07 }, base);
  const times = L.map((l, i) => (typeof l.at === 'number' ? l.at : base + 1 + i * Math.max(0.6, (d - base - 2.5) / L.length)));
  cols.forEach((c, i) => {
    const t = times[i];
    tl.to(c, { '--fill': 1, duration: 0.5, ease: 'power2.out' }, t);
    tl.fromTo($(c, '.acr-k'), { scale: 1 }, { scale: 0.78, duration: 0.6, ease: 'expo.out' }, t);
    tl.fromTo($(c, '.acr-w'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, t + 0.1);
    const s = $(c, '.acr-s');
    if (s) tl.fromTo(s, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, t + 0.35);
    tl.fromTo($(c, '.acr-bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'expo.out' }, t);
  });
  // Lettre active (la dernière dépliée)
  track(tl, d, (t) => {
    let k = -1;
    times.forEach((x, i) => {
      if (t >= x) k = i;
    });
    cols.forEach((c, i) => c.classList.toggle('is-on', i === k));
  });
  const n = $(root, '.acr-note');
  if (n) tl.fromTo(n, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, sc.noteAt ?? d - 2.2);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Tableau : quelle méthode, quand, et comment le dire                 */
/* ------------------------------------------------------------------ */

/**
 * { type: 'table', kicker, title, cols: ['Méthode', 'Quand ?', 'En darija'], rows: [{ cells: ['AIDA', '…', 'الطريق…'], c: 'hook', at: 2 }], note, noteAt }
 * Les lignes entrent à leur `at` ; la dernière entrée est surlignée. Une cellule en arabe s'aligne à droite.
 */
export function table(root, sc, d) {
  const cols = sc.cols || [];
  const rows = sc.rows || [];
  root.innerHTML = `${head(root, sc)}
    <div class="tb" style="--n:${cols.length}">
      <div class="tb-h">${cols.map((c) => `<span>${txt(c)}</span>`).join('')}</div>
      ${rows.map((r) => `<div class="tb-r" style="--c:${col(r.c)}">${r.cells.map((c, j) => `<span class="${j === 0 ? 'tb-k' : ''} ${isAr(c) ? 'is-ar' : ''}">${txt(c)}</span>`).join('')}</div>`).join('')}
    </div>
    ${sc.note ? `<p class="tb-note">${rich(sc.note)}</p>` : ''}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.tb-h'), { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, base);
  const R = $$(root, '.tb-r');
  const times = rows.map((r, i) => (typeof r.at === 'number' ? r.at : base + 0.6 + i * Math.max(0.5, (d - base - 2.5) / rows.length)));
  R.forEach((r, i) => {
    tl.fromTo(r, { autoAlpha: 0, x: -60, '--fill': 1 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, times[i]);
    tl.fromTo($$(r, 'span'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.12 }, times[i] + 0.1);
  });
  track(tl, d, (t) => {
    let k = -1;
    times.forEach((x, i) => {
      if (t >= x) k = i;
    });
    R.forEach((r, i) => r.classList.toggle('is-on', i === k));
  });
  const n = $(root, '.tb-note');
  if (n) tl.fromTo(n, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, sc.noteAt ?? d - 2.4);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Exemples de hooks : un téléphone par exemple, le texte du hook à l'écran */
/* ------------------------------------------------------------------ */

/**
 * { type: 'hooks', kicker, title, family: 'Positif', c: 'body', items: [{ text: 'Choufe m3aya résultat hada !', fr: 'Regarde ce résultat !', at: 1.5 }], note, noteAt }
 * Chaque exemple apparaît dans un téléphone (le hook en gros, comme à l'écran), avec sa traduction dessous.
 */
export function hooks(root, sc, d, ctx) {
  const items = sc.items || [];
  root.innerHTML = `${head(root, sc)}
    <div class="hk-row hk-n${items.length}">
      ${items.map((it, i) => `<figure class="hk" style="--c:${col(it.c || sc.c)}">
          <div class="hk-ph"><div class="hk-scr" style="background:${it.bgc || 'var(--ink-800)'}"><span class="hk-tag">${esc(sc.family || '')}</span><p class="hk-t" lang="${isAr(it.text) ? 'ar' : 'fr'}">${esc(it.text)}</p><i class="hk-prog"></i></div></div>
          ${it.fr ? `<figcaption>${rich(it.fr)}</figcaption>` : ''}
        </figure>`).join('')}
    </div>
    ${sc.note ? `<p class="hk-note">${rich(sc.note)}</p>` : ''}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const F = $$(root, '.hk');
  const base = sc.title ? 0.6 : 0.2;
  F.forEach((f, i) => {
    const t = typeof items[i].at === 'number' ? items[i].at : base + i * 1.2;
    tl.fromTo(f, { autoAlpha: 0, y: 140, rotate: i % 2 ? 4 : -4 }, { autoAlpha: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5, duration: 0.9, ease: 'expo.out' }, t);
    tl.fromTo($(f, '.hk-t'), { autoAlpha: 0, scale: 1.5 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, t + 0.35);
    tl.fromTo($(f, '.hk-prog'), { scaleX: 0 }, { scaleX: 1, duration: 3, ease: 'none' }, t + 0.35);
    const cap = $(f, 'figcaption');
    if (cap) tl.fromTo(cap, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, t + 0.8);
  });
  const n = $(root, '.hk-note');
  if (n) tl.fromTo(n, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, sc.noteAt ?? d - 2.4);
  return tl;
}
