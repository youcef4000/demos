// Bibliothèque de scènes des vidéos Hooked Academy.
// Chaque scène reçoit sa section (1920 × 1080), ses données et sa durée, remplit le DOM et renvoie
// une timeline GSAP qui démarre à 0. La sortie (fondu) est gérée par le moteur.

import { G, esc, rich, words, kicker, $, $$, riseWords, type, count, draw, track, isAr, setAr } from './kit.js';
import { icon } from '../assets/js/icons.js';
import { markSVG } from '../assets/js/brand.js';
import { product, person, BG, rng } from './art.js';
import { lang, t as tr } from '../assets/js/i18n.js';
import { PRICE_K } from '../assets/js/i18n/motion.js';
import { modCode } from '../data/programme.js';

const pad2 = (n) => String(n).padStart(2, '0');
const C = { hook: 'var(--hook)', body: 'var(--body)', cta: 'var(--cta)', gold: 'var(--gold-400)', ia: 'var(--ia)', danger: 'var(--danger)', mist: 'var(--mist-300)' };
const col = (c) => C[c] || c || 'var(--gold-400)';
const at = (item, i, base, step) => (typeof item?.at === 'number' ? item.at : base + i * step);
/** Ligne secondaire en arabe sous un texte français. En arabe, le texte principal l'est déjà : on ne la répète pas. */
const arP = (ar, cls = 'ar-line') => (ar && lang !== 'ar' ? `<p class="${cls}" lang="ar" dir="rtl">${esc(ar)}</p>` : '');
const head = (sc) =>
  sc.title || sc.kicker ? `<header class="s-head">${kicker(sc.kicker)}${sc.title ? `<h2 class="s-title">${words(sc.title)}</h2>` : ''}${arP(sc.ar, 's-ar')}</header>` : '';

function enterHead(tl, root, t0 = 0) {
  const k = $(root, '.s-head .kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, t0);
  const h2 = $(root, '.s-title');
  if (h2) riseWords(tl, h2, t0 + 0.08, { stagger: 0.04, duration: 0.6 });
  const ar = $(root, '.s-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0, clipPath: 'inset(0 0 0 100%)' }, { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'power3.out' }, t0 + 0.35);
}

/* ------------------------------------------------------------------ */
/* Titres et texte                                                     */
/* ------------------------------------------------------------------ */

export function title(root, sc, d, ctx) {
  const L = ctx.lesson;
  const M = ctx.module;
  root.innerHTML = `
    <div class="t-num" aria-hidden="true">${pad2(L.n)}</div>
    <div class="t-wrap">
      ${kicker(sc.kicker || tr('mo.title.kicker', { mod: modCode(M).replace(/^M(?=\d)/, ''), n: pad2(L.n) }))}
      <h1 class="t-fr">${words(sc.fr || L.title)}</h1>
      ${arP(sc.ar || L.ar, 't-ar')}
      <div class="t-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      ${sc.sub ? `<p class="t-sub">${rich(sc.sub)}</p>` : ''}
    </div>`;
  const tl = G().timeline();
  tl.fromTo($(root, '.t-num'), { autoAlpha: 0, scale: 0.7, yPercent: 10 }, { autoAlpha: 1, scale: 1, yPercent: 0, duration: 1.6, ease: 'expo.out' }, 0);
  tl.to($(root, '.t-num'), { yPercent: -6, duration: Math.max(1, d - 1.6), ease: 'none' }, 1.6);
  tl.fromTo($(root, '.kick'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.1);
  riseWords(tl, $(root, '.t-fr'), 0.2, { stagger: 0.07, duration: 0.9 });
  const ar = $(root, '.t-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0, clipPath: 'inset(0 0 0 100%)' }, { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'power3.inOut' }, 0.7);
  tl.fromTo($$(root, '.t-bars i'), { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.08 }, 0.5);
  const sub = $(root, '.t-sub');
  if (sub) tl.fromTo(sub, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.1);
  return tl;
}

export function big(root, sc, d) {
  root.innerHTML = `<div class="b-wrap ${sc.align === 'left' ? 'is-left' : ''}">
      ${kicker(sc.kicker)}
      <p class="b-text ${sc.size ? `is-${sc.size}` : ''}">${words(sc.text)}</p>
      ${arP(sc.ar, 'b-ar')}
      ${sc.sub ? `<p class="b-sub">${rich(sc.sub)}</p>` : ''}
    </div>`;
  const tl = G().timeline();
  const k = $(root, '.kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
  const n = $$(root, '.b-text .wi').length;
  const st = Math.min(0.09, 1.6 / Math.max(1, n));
  riseWords(tl, $(root, '.b-text'), 0.1, { stagger: st, duration: 0.8 });
  const hls = $$(root, '.b-text .hl, .b-text .hl-body, .b-text .hl-cta');
  if (hls.length) tl.fromTo(hls, { '--u': 0 }, { '--u': 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.12 }, 0.4 + n * st);
  const ar = $(root, '.b-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0, clipPath: 'inset(0 0 0 100%)' }, { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.9 }, 0.6 + n * st);
  const sub = $(root, '.b-sub');
  if (sub) tl.fromTo(sub, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, sc.subAt ?? 0.9 + n * st);
  tl.fromTo($(root, '.b-wrap'), { scale: 1 }, { scale: 1.03, duration: d, ease: 'none' }, 0);
  return tl;
}

export function quote(root, sc, d) {
  root.innerHTML = `<div class="q-card">
      <span class="q-mark" aria-hidden="true">“</span>
      ${kicker(sc.kicker || tr('mo.quote.kicker'))}
      <p class="q-text">${words(sc.text)}</p>
      ${arP(sc.ar, 'q-ar')}
      <i class="q-sweep" aria-hidden="true"></i>
    </div>`;
  const tl = G().timeline();
  tl.fromTo($(root, '.q-card'), { autoAlpha: 0, scale: 0.92, rotateX: 18 }, { autoAlpha: 1, scale: 1, rotateX: 0, duration: 1, ease: 'expo.out' }, 0);
  tl.fromTo($(root, '.q-mark'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(2)' }, 0.2);
  tl.fromTo($(root, '.kick'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.3);
  riseWords(tl, $(root, '.q-text'), 0.4, { stagger: 0.05 });
  const ar = $(root, '.q-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.4);
  tl.fromTo($(root, '.q-sweep'), { xPercent: -120 }, { xPercent: 260, duration: 1.6, ease: 'power2.inOut' }, 1.2);
  return tl;
}

export function stat(root, sc, d) {
  const num = Number(sc.value);
  root.innerHTML = `<div class="st-wrap">
      ${kicker(sc.kicker)}
      <div class="st-row">
        ${sc.ring ? `<svg class="st-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="90" class="st-ring-bg"/><circle cx="100" cy="100" r="90" class="st-ring-fg"/></svg>` : ''}
        <span class="st-val">${esc(sc.value)}</span><span class="st-suf">${esc(sc.suffix || '')}</span>
      </div>
      <p class="st-label">${words(sc.label || '')}</p>
      ${arP(sc.ar, 'st-ar')}
      ${sc.sub ? `<p class="st-sub">${rich(sc.sub)}</p>` : ''}
    </div>`;
  const tl = G().timeline();
  const k = $(root, '.kick');
  if (k) tl.fromTo(k, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0);
  tl.fromTo($(root, '.st-row'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'expo.out' }, 0.1);
  if (!Number.isNaN(num) && sc.count !== false) count(tl, $(root, '.st-val'), num, 0.15, { from: sc.from ?? 0, duration: sc.countDur ?? 1.4, decimals: sc.decimals || 0 });
  if (sc.ring) {
    const fg = $(root, '.st-ring-fg');
    const len = 2 * Math.PI * 90;
    fg.style.strokeDasharray = `${len} ${len}`;
    tl.fromTo(fg, { strokeDashoffset: sc.ringReverse ? 0 : len }, { strokeDashoffset: sc.ringReverse ? len : 0, duration: sc.ringDur ?? Math.min(d - 1, 3), ease: 'none' }, 0.3);
  }
  riseWords(tl, $(root, '.st-label'), 0.6, { stagger: 0.05 });
  const ar = $(root, '.st-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.1);
  const sub = $(root, '.st-sub');
  if (sub) tl.fromTo(sub, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, sc.subAt ?? 1.5);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Cartes, grilles, étapes                                             */
/* ------------------------------------------------------------------ */

export function cards(root, sc, d) {
  const items = sc.items || [];
  root.innerHTML = `${head(sc)}
    <div class="cd-row cols-${sc.cols || items.length} ${items.some((it) => it.sub) ? '' : 'is-big'} ${sc.stamp ? 'has-stamp' : ''}">
      ${items
        .map(
          (it, i) => `<article class="cd" style="--c:${col(it.c)}">
            <span class="cd-n">${pad2(i + 1)}</span>
            <div class="cd-ico">${it.art ? product(it.art) : icon(it.icon || 'spark', { size: 64, stroke: 1.6 })}</div>
            <h3 class="cd-t">${rich(it.label)}</h3>
            ${arP(it.ar, 'cd-ar')}
            ${it.sub ? `<p class="cd-s">${rich(it.sub)}</p>` : ''}
          </article>`,
        )
        .join('')}
    </div>
    ${sc.stamp ? `<div class="cd-stamp"><b>${esc(sc.stamp)}</b>${sc.stampSub ? `<span>${esc(sc.stampSub)}</span>` : ''}</div>` : ''}`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.15;
  $$(root, '.cd').forEach((c, i) => {
    const t = at(items[i], i, base, sc.step ?? 0.22);
    tl.fromTo(c, { autoAlpha: 0, y: 120, rotateX: -55, scale: 0.9 }, { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, t);
    tl.fromTo($(c, '.cd-ico'), { scale: 0.4, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(2.2)' }, t + 0.1);
    tl.fromTo(c, { '--glow': 1 }, { '--glow': 0, duration: 1.4, ease: 'power2.out' }, t + 0.2);
  });
  const s = $(root, '.cd-stamp');
  if (s) tl.fromTo(s, { autoAlpha: 0, scale: 2.6, rotate: -28 }, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.55, ease: 'back.out(1.6)' }, sc.stampAt ?? d - 2.4);
  return tl;
}

export function grid(root, sc, d) {
  const items = sc.items || [];
  const hub = sc.hub;
  root.innerHTML = `${head(sc)}
    <div class="gr ${hub ? 'is-hub' : ''} cols-${sc.cols || Math.min(4, items.length)}">
      ${hub ? `<div class="gr-hub" style="--c:${col(hub.c)}">${icon(hub.icon || 'trophy', { size: 56 })}<b>${rich(hub.label)}</b>${hub.sub ? `<span>${rich(hub.sub)}</span>` : ''}</div>` : ''}
      ${items
        .map(
          (it, i) => `<div class="gr-i" style="--c:${col(it.c)};${hub ? `--a:${(360 / items.length) * i - 90}deg` : ''}">
            ${it.swatch ? `<span class="gr-sw" style="background:${it.swatch}"></span>` : `<span class="gr-ico">${icon(it.icon || 'spark', { size: 40 })}</span>`}
            <b>${rich(it.label)}</b>${it.sub ? `<span>${rich(it.sub)}</span>` : ''}
          </div>`,
        )
        .join('')}
      ${hub ? `<svg class="gr-spokes" viewBox="-600 -300 1200 600" aria-hidden="true">${items
        .map((_, i) => {
          const a = (((360 / items.length) * i - 90) * Math.PI) / 180;
          return `<path d="M${Math.cos(a) * 130} ${Math.sin(a) * 130 * 0.62} L${Math.cos(a) * 420} ${Math.sin(a) * 420 * 0.62}"/>`;
        })
        .join('')}</svg>` : ''}
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const hb = $(root, '.gr-hub');
  if (hb) tl.fromTo(hb, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' }, base);
  if (hub) draw(tl, $$(root, '.gr-spokes path'), base + 0.4, { duration: 0.6, stagger: 0.12 });
  $$(root, '.gr-i').forEach((g, i) => {
    tl.fromTo(g, { autoAlpha: 0, rotateY: -90, z: -200 }, { autoAlpha: 1, rotateY: 0, z: 0, duration: 0.8, ease: 'expo.out' }, at(items[i], i, base + (hub ? 0.6 : 0.1), sc.step ?? 0.18));
  });
  if (typeof sc.highlight === 'number') {
    const g = $$(root, '.gr-i')[sc.highlight];
    if (g) tl.to(g, { scale: 1.08, '--glow': 1, duration: 0.6, ease: 'back.out(2)' }, sc.highlightAt ?? d - 2.5);
  }
  return tl;
}

export function steps(root, sc, d) {
  const items = sc.items || [];
  const hz = sc.dir === 'h';
  root.innerHTML = `${head(sc)}
    <ol class="sp ${hz ? 'is-h' : 'is-v'} ${!hz && items.length >= 5 ? 'is-many' : ''}">
      <i class="sp-line" aria-hidden="true"></i>
      ${items
        .map(
          (it, i) => `<li class="sp-i" style="--c:${col(it.c)}">
            <span class="sp-k ${String(it.k ?? i + 1).length > 1 ? 'is-long' : ''}">${esc(it.k ?? i + 1)}</span>
            <div class="sp-b"><b>${rich(it.label)}</b>${arP(it.ar, 'sp-ar')}${it.sub ? `<span>${rich(it.sub)}</span>` : ''}</div>
          </li>`,
        )
        .join('')}
    </ol>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const step = sc.step ?? Math.min(1.2, Math.max(0.35, (d - base - 2) / Math.max(1, items.length)));
  tl.fromTo($(root, '.sp-line'), { [hz ? 'scaleX' : 'scaleY']: 0 }, { [hz ? 'scaleX' : 'scaleY']: 1, duration: Math.max(0.8, step * items.length), ease: 'none' }, base);
  $$(root, '.sp-i').forEach((li, i) => {
    const t = at(items[i], i, base, step);
    tl.fromTo($(li, '.sp-k'), { autoAlpha: 0, scale: 0.3, rotate: -25 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(2.4)' }, t);
    tl.fromTo($(li, '.sp-b'), { autoAlpha: 0, x: hz ? 0 : 60, y: hz ? 40 : 0 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.7, ease: 'expo.out' }, t + 0.12);
  });
  return tl;
}

export function checklist(root, sc, d) {
  const items = sc.items || [];
  root.innerHTML = `${head(sc)}
    <ul class="ck">
      ${items
        .map((it) => {
          const o = typeof it === 'string' ? { t: it } : it;
          return `<li class="ck-i ${o.bad ? 'is-bad' : ''}"><span class="ck-box"><svg viewBox="0 0 24 24" aria-hidden="true">${o.bad ? '<path d="M7 7l10 10M17 7 7 17"/>' : '<path d="m5 12.5 4.5 4.5L19 7"/>'}</svg></span><span class="ck-t">${rich(o.t)}</span></li>`;
        })
        .join('')}
    </ul>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.6 : 0.2;
  const step = sc.step ?? Math.min(1.4, Math.max(0.45, (d - base - 1.5) / Math.max(1, items.length)));
  $$(root, '.ck-i').forEach((li, i) => {
    const t = at(items[i], i, base, step);
    tl.fromTo(li, { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, t);
    draw(tl, $(li, 'path'), t + 0.3, { duration: 0.4 });
    tl.fromTo($(li, '.ck-box'), { scale: 0.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, t + 0.25);
  });
  return tl;
}

export function compare(root, sc, d) {
  const L = sc.left || {};
  const R = sc.right || {};
  const list = (side, tone) =>
    (side.items || [])
      .map((t) => `<li><span class="cp-ic">${icon(tone === 'bad' ? 'x' : 'check', { size: 30, stroke: 2.4 })}</span><span>${rich(t)}</span></li>`)
      .join('');
  root.innerHTML = `${head(sc)}
    <div class="cp">
      <section class="cp-s is-${L.tone || 'bad'}"><h3>${rich(L.title || tr('mo.cp.before'))}</h3>${L.text ? `<p class="cp-txt">${rich(L.text)}</p>` : ''}<ul>${list(L, L.tone || 'bad')}</ul></section>
      <div class="cp-vs" aria-hidden="true">VS</div>
      <section class="cp-s is-${R.tone || 'good'}"><h3>${rich(R.title || tr('mo.cp.after'))}</h3>${R.text ? `<p class="cp-txt">${rich(R.text)}</p>` : ''}<ul>${list(R, R.tone || 'good')}</ul></section>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.15;
  const [a, b] = $$(root, '.cp-s');
  tl.fromTo(a, { autoAlpha: 0, x: -120, rotateY: 25 }, { autoAlpha: 1, x: 0, rotateY: 0, duration: 0.9, ease: 'expo.out' }, base);
  tl.fromTo($$(a, 'li, .cp-txt'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.25 }, base + 0.5);
  const tb = sc.rightAt ?? base + Math.min(d * 0.42, 1.2 + (L.items || []).length * 0.4);
  tl.fromTo($(root, '.cp-vs'), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' }, tb - 0.2);
  tl.fromTo(b, { autoAlpha: 0, x: 120, rotateY: -25 }, { autoAlpha: 1, x: 0, rotateY: 0, duration: 0.9, ease: 'expo.out' }, tb);
  tl.fromTo($$(b, 'li, .cp-txt'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.25 }, tb + 0.5);
  tl.to(a, { opacity: 0.55, filter: 'saturate(0.4)', duration: 0.8 }, tb + 0.4);
  return tl;
}

export function formula(root, sc, d) {
  const parts = sc.parts || [];
  const chips = sc.chips || [];
  root.innerHTML = `${head(sc)}
    ${chips.length ? `<div class="fx-chips">${chips.map((c) => `<span class="fx-chip" style="--c:${col(c.c)}">${icon(c.icon || 'spark', { size: 34 })}${esc(c.label)}</span>`).join('')}</div>` : ''}
    <div class="fx">
      ${parts
        .map((p, i) => {
          const tok = `<div class="fx-t" style="--c:${col(p.c)}"><b>${rich(p.t)}</b>${p.sub ? `<span>${rich(p.sub)}</span>` : ''}</div>`;
          return (i ? `<span class="fx-op">+</span>` : '') + tok;
        })
        .join('')}
      ${sc.result ? `<span class="fx-op fx-eq">=</span><div class="fx-t fx-r" style="--c:${col(sc.result.c || 'gold')}"><b>${rich(sc.result.t)}</b>${sc.result.sub ? `<span>${rich(sc.result.sub)}</span>` : ''}</div>` : ''}
    </div>
    ${sc.note ? `<p class="fx-note">${rich(sc.note)}</p>` : ''}`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const toks = $$(root, '.fx-t:not(.fx-r)');
  const step = sc.step ?? Math.min(1.1, (d - base - 2.2) / Math.max(1, toks.length));
  const ops = $$(root, '.fx-op:not(.fx-eq)');
  toks.forEach((t, i) => {
    const tt = at(parts[i], i, base, step);
    if (i && ops[i - 1]) tl.fromTo(ops[i - 1], { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, tt - 0.12);
    tl.fromTo(t, { autoAlpha: 0, y: 80, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }, tt);
  });
  const r = $(root, '.fx-r');
  if (r) {
    const tr = sc.resultAt ?? base + toks.length * step + 0.2;
    tl.fromTo($(root, '.fx-eq'), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' }, tr - 0.15);
    tl.fromTo(r, { autoAlpha: 0, scale: 1.8, filter: 'blur(14px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out' }, tr);
    tl.fromTo(r, { '--glow': 1 }, { '--glow': 0.35, duration: 1.4 }, tr + 0.3);
  }
  $$(root, '.fx-chip').forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, y: 40, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, chips[i].at ?? base + 0.4 + i * 0.3));
  const n = $(root, '.fx-note');
  if (n) tl.fromTo(n, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, sc.noteAt ?? d - 2.2);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Schémas                                                             */
/* ------------------------------------------------------------------ */

export function flow(root, sc, d) {
  const nodes = sc.nodes || [];
  const W = 1600;
  const n = nodes.length;
  const gap = W / n;
  const xs = nodes.map((_, i) => gap * (i + 0.5));
  const Y = 210;
  const R = 92;
  const loop = !!sc.loop;
  root.innerHTML = `${head(sc)}
    <div class="fl ${loop ? 'is-loop' : ''}" style="width:${W}px">
      <svg class="fl-svg" viewBox="0 0 ${W} ${loop ? 640 : 520}" aria-hidden="true">
        <defs><marker id="fl-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--gold-400)"/></marker></defs>
        ${xs
          .slice(0, -1)
          .map((x, i) => `<path class="fl-ln" d="M${x + R + 14} ${Y} L${xs[i + 1] - R - 18} ${Y}" marker-end="url(#fl-arrow)"/>`)
          .join('')}
        ${loop ? `<path class="fl-ln fl-loop" d="M${xs[n - 1]} ${Y + 236} C ${xs[n - 1]} ${Y + 360}, ${xs[0]} ${Y + 360}, ${xs[0]} ${Y + 240}" marker-end="url(#fl-arrow)"/>` : ''}
        <circle class="fl-dot" r="9" cx="${xs[0]}" cy="${Y}"/>
      </svg>
      ${nodes
        .map(
          (nd, i) => `<div class="fl-n" style="left:${xs[i]}px;top:${Y}px;--c:${col(nd.c)}">
            <span class="fl-c">${icon(nd.icon || 'spark', { size: 64, stroke: 1.6 })}</span>
            <b>${rich(nd.label)}</b>${nd.sub ? `<span>${rich(nd.sub)}</span>` : ''}
          </div>`,
        )
        .join('')}
      ${loop && sc.loopLabel ? `<p class="fl-loopl">${rich(sc.loopLabel)}</p>` : ''}
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const step = sc.step ?? Math.min(1.6, Math.max(0.5, (d - base - 1.8) / Math.max(1, n)));
  const lns = $$(root, '.fl-ln:not(.fl-loop)');
  const dot = $(root, '.fl-dot');
  $$(root, '.fl-n').forEach((el, i) => {
    const t = at(nodes[i], i, base, step);
    tl.fromTo(el, { autoAlpha: 0, scale: 0.4, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2)' }, t);
    tl.fromTo($(el, '.fl-c'), { '--glow': 1 }, { '--glow': 0, duration: 1.2 }, t + 0.2);
    if (lns[i]) {
      const t2 = at(nodes[i + 1], i + 1, base, step) - 0.45;
      draw(tl, lns[i], t2, { duration: 0.45, ease: 'power2.out' });
      tl.fromTo(dot, { attr: { cx: xs[i] + R, cy: Y }, autoAlpha: 1 }, { attr: { cx: xs[i + 1] - R, cy: Y }, duration: 0.45, ease: 'power2.inOut' }, t2);
    }
  });
  tl.set(dot, { autoAlpha: 0 }, base + n * step);
  const lp = $(root, '.fl-loop');
  if (lp) {
    const t3 = sc.loopAt ?? base + n * step;
    draw(tl, lp, t3, { duration: 0.9 });
    const ll = $(root, '.fl-loopl');
    if (ll) tl.fromTo(ll, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, t3 + 0.6);
  }
  return tl;
}

export function funnel(root, sc, d) {
  const lv = sc.levels || [];
  root.innerHTML = `${head(sc)}
    <div class="fn">
      ${lv
        .map((l, i) => {
          const w0 = 100 - (i * 46) / lv.length;
          const w1 = 100 - ((i + 1) * 46) / lv.length;
          const a = (100 - w0) / 2;
          const b = (100 - w1) / 2;
          return `<div class="fn-l" style="--c:${col(l.c)};clip-path:polygon(${a}% 0,${100 - a}% 0,${100 - b}% 100%,${b}% 100%)"><b>${rich(l.label)}</b>${l.sub ? `<span>${rich(l.sub)}</span>` : ''}</div>`;
        })
        .join('')}
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const step = sc.step ?? Math.min(1.4, (d - base - 1.5) / Math.max(1, lv.length));
  $$(root, '.fn-l').forEach((l, i) => {
    tl.fromTo(l, { autoAlpha: 0, scaleX: 0.3, y: -40 }, { autoAlpha: 1, scaleX: 1, y: 0, duration: 0.7, ease: 'expo.out' }, at(lv[i], i, base, step));
  });
  return tl;
}

export function curve(root, sc, d) {
  const W = 1400;
  const H = 520;
  const curves = sc.curves || [{ c: 'gold', pts: [100, 62, 48, 42, 38, 35, 33, 31, 30, 29, 28] }];
  const toPath = (pts) =>
    pts
      .map((v, i) => {
        const x = (i / (pts.length - 1)) * W;
        const y = H - (v / 100) * H;
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  const marks = sc.marks || [];
  root.innerHTML = `${head(sc)}
    <div class="cv" style="width:${W}px">
      <svg viewBox="-80 -30 ${W + 120} ${H + 110}" aria-hidden="true">
        <defs><linearGradient id="cv-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a227" stop-opacity=".35"/><stop offset="1" stop-color="#c9a227" stop-opacity="0"/></linearGradient></defs>
        ${[0, 25, 50, 75, 100].map((v) => `<line class="cv-g" x1="0" x2="${W}" y1="${H - (v / 100) * H}" y2="${H - (v / 100) * H}"/><text class="cv-y" x="-20" y="${H - (v / 100) * H + 8}" text-anchor="end">${v}%</text>`).join('')}
        ${marks.map((m) => `<g class="cv-m" style="--c:${col(m.c)}"><line x1="${m.x * W}" x2="${m.x * W}" y1="0" y2="${H}"/><text x="${m.x * W + 14}" y="${(m.y ?? 0.08) * H + 10}">${esc(m.label)}</text></g>`).join('')}
        ${curves.map((c, i) => `<path class="cv-area" d="${toPath(c.pts)} L${W} ${H} L0 ${H}Z" fill="url(#cv-a)" style="opacity:${i ? 0 : 1}"/>`).join('')}
        ${curves.map((c) => `<path class="cv-l ${c.dim ? 'is-dim' : ''}" d="${toPath(c.pts)}" style="--c:${col(c.c)}"/>`).join('')}
        <text class="cv-x" x="0" y="${H + 60}">${esc(sc.xStart || tr('mo.unit.s', { n: 0 }))}</text>
        <text class="cv-x" x="${W}" y="${H + 60}" text-anchor="end">${esc(sc.xEnd || tr('mo.cv.end'))}</text>
      </svg>
      <div class="cv-leg">${curves.filter((c) => c.label).map((c) => `<span style="--c:${col(c.c)}"><i></i>${esc(c.label)}</span>`).join('')}</div>
      ${sc.note !== false ? `<p class="cv-note">${esc(sc.note || tr('mo.cv.note'))}</p>` : ''}
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($$(root, '.cv-g, .cv-y, .cv-x'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.03 }, base);
  $$(root, '.cv-l').forEach((p, i) => draw(tl, p, (curves[i].at ?? base + 0.4 + i * 2.2), { duration: 1.8, ease: 'power2.inOut' }));
  tl.fromTo($$(root, '.cv-area')[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, base + 1.6);
  $$(root, '.cv-m').forEach((m, i) => tl.fromTo(m, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, marks[i].at ?? base + 1.4 + i * 0.6));
  tl.fromTo($$(root, '.cv-leg span, .cv-note'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.2 }, base + 1.8);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Écrans : montage, prompt, conversation                              */
/* ------------------------------------------------------------------ */

export function timeline(root, sc, d) {
  const clips = sc.clips || [
    { label: tr('mo.part.hook'), c: 'hook', w: 2 },
    { label: tr('mo.part.product'), c: 'body', w: 3 },
    { label: tr('mo.part.demo'), c: 'body', w: 3 },
    { label: tr('mo.part.review'), c: 'body', w: 2 },
    { label: tr('mo.part.cta'), c: 'cta', w: 2 },
  ];
  const tracks = sc.tracks || [];
  const total = clips.reduce((s, c) => s + (c.w || 2), 0);
  const r = rng(7);
  let acc = 0;
  const steps = sc.steps || [];
  root.innerHTML = `${head(sc)}
    <div class="tlx">
      <div class="tlx-top">
        <div class="tlx-mon"><div class="tlx-screen"></div><span class="tlx-rec">● ${esc(sc.app || tr('mo.tl.app'))}</span></div>
        <ul class="tlx-steps">${steps.map((s) => `<li><span>${icon(s.icon || 'check', { size: 30 })}</span>${rich(s.label)}</li>`).join('')}</ul>
      </div>
      <div class="tlx-tracks">
        <div class="tlx-ruler">${Array.from({ length: 13 }, (_, i) => `<span>${esc(tr('mo.unit.s.short', { n: String(i * 2).padStart(2, '0') }))}</span>`).join('')}</div>
        <div class="tlx-row tlx-v">${clips
          .map((c) => {
            const left = (acc / total) * 100;
            acc += c.w || 2;
            c._from = { x: (r() - 0.5) * 1100, y: -260 - r() * 260, rotate: (r() - 0.5) * 50 };
            return `<div class="tlx-clip" style="left:${left}%;width:${((c.w || 2) / total) * 100}%;--c:${col(c.c)}"><b>${rich(c.label)}</b></div>`;
          })
          .join('')}</div>
        ${tracks
          .map(
            (t) => `<div class="tlx-row tlx-aux" style="--c:${col(t.c)}"><span class="tlx-lab">${icon(t.icon || 'music', { size: 22 })}${esc(t.label)}</span><i style="left:${(t.from || 0) * 100}%;width:${((t.to ?? 1) - (t.from || 0)) * 100}%"></i></div>`,
          )
          .join('')}
        <i class="tlx-head" aria-hidden="true"></i>
        ${(sc.cuts || []).map((c) => `<span class="tlx-cut" style="left:${c.x * 100}%">${icon('scissors', { size: 34 })}</span>`).join('')}
      </div>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.tlx'), { autoAlpha: 0, y: 80, rotateX: 18 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'expo.out' }, base);
  const cl = $$(root, '.tlx-clip');
  const t0 = sc.clipsAt ?? base + 0.5;
  cl.forEach((c, i) => {
    tl.fromTo(
      c,
      { ...clips[i]._from, autoAlpha: 0, scale: 0.8 },
      { x: 0, y: 0, rotate: 0, autoAlpha: 1, scale: 1, duration: 0.8, ease: 'expo.inOut' },
      t0 + i * (sc.clipStep ?? 0.28),
    );
  });
  const screen = $(root, '.tlx-screen');
  const headEl = $(root, '.tlx-head');
  const tp = t0 + cl.length * (sc.clipStep ?? 0.28) + 0.5;
  const dur = Math.max(1.5, (sc.playEnd ?? d - 0.8) - tp);
  tl.fromTo(headEl, { left: '0%' }, { left: '100%', duration: dur, ease: 'none' }, tp);
  const colors = clips.map((c) => col(c.c));
  const bounds = [];
  let a2 = 0;
  clips.forEach((c) => {
    bounds.push(a2 / total);
    a2 += c.w || 2;
  });
  track(tl, d, (t) => {
    if (t < tp) {
      screen.style.setProperty('--c', 'var(--ink-700)');
      screen.dataset.label = sc.app || tr('mo.tl.app');
      cl.forEach((c) => c.classList.remove('is-on'));
      return;
    }
    const v = Math.min(1, (t - tp) / dur);
    let k = 0;
    for (let i = 0; i < bounds.length; i++) if (v >= bounds[i]) k = i;
    screen.style.setProperty('--c', colors[k]);
    screen.dataset.label = clips[k].label.replace(/[*~^_]/g, '');
    cl.forEach((c, i) => c.classList.toggle('is-on', i === k));
  });
  $$(root, '.tlx-aux').forEach((a, i) => tl.fromTo($(a, 'i'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, (tracks[i].at ?? tp - 0.3)));
  $$(root, '.tlx-cut').forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, scale: 2, rotate: -40 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(2)' }, sc.cuts[i].at ?? tp + i * 0.6));
  $$(root, '.tlx-steps li').forEach((li, i) => tl.fromTo(li, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }, steps[i].at ?? base + 0.8 + i * 0.8));
  return tl;
}

export function prompt(root, sc, d) {
  const segs = sc.segments || [{ text: sc.prompt || '' }];
  const tags = [...new Map(segs.filter((s) => s.tag).map((s) => [s.tag, s.c])).entries()];
  const res = sc.result || { kind: 'text', lines: [] };
  const tiles = res.kind === 'image' ? res.tiles || [{ art: 'parfum', bg: 'studio' }, { art: 'parfum', bg: 'teal' }, { art: 'parfum', bg: 'sable' }, { art: 'parfum', bg: 'rose' }] : [];
  root.innerHTML = `${head(sc)}
    <div class="pr ${res.kind === 'image' || res.kind === 'video' ? 'has-media' : ''}">
      <div class="pr-win">
        <div class="pr-bar"><i></i><i></i><i></i><span>${esc(sc.app || tr('mo.pr.app'))}</span></div>
        ${tags.length ? `<div class="pr-tags">${tags.map(([t, c]) => `<span class="pr-tag" style="--c:${col(c)}">${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="pr-in"><span class="pr-who">${icon('user', { size: 26 })}</span><p class="pr-txt">${segs.map((s) => `<span class="pr-seg" style="--c:${col(s.c || 'mist')}"></span>`).join('')}</p></div>
        <div class="pr-out">
          <span class="pr-who pr-ai">${icon('sparkles', { size: 26 })}</span>
          ${res.kind === 'text' || !res.kind ? `<div class="pr-lines">${(res.lines || []).map(() => '<p class="pr-l"></p>').join('')}</div>` : ''}
          ${res.kind === 'image' ? `<div class="pr-grid">${tiles.map((t, i) => `<div class="pr-tile" style="background:${BG[t.bg] || BG.studio}"><div class="pr-art">${product(t.art || 'parfum')}</div><i class="pr-noise"></i><span>${i + 1}</span></div>`).join('')}</div>` : ''}
          ${res.kind === 'video' ? `<div class="pr-film">${[0, 1, 2, 3].map((i) => `<div class="pr-fr" style="background:${BG[(res.bg || ['studio', 'studio', 'or', 'studio'])[i]] || BG.studio}"><div class="pr-art" style="transform:scale(${1 + i * 0.18}) translateY(${i * 4}%)">${product(res.art || 'parfum')}</div><span>${esc(tr('mo.unit.s.short', { n: `0${i + 1}` }))}</span></div>`).join('')}<i class="pr-play"></i></div>` : ''}
        </div>
      </div>
      ${sc.side ? `<ul class="pr-side">${sc.side.map((s) => `<li style="--c:${col(s.c)}"><b>${rich(s.label)}</b>${s.sub ? `<span>${rich(s.sub)}</span>` : ''}</li>`).join('')}</ul>` : ''}
    </div>`;
  // Arabe : le texte tapé pendant la lecture prend son sens dès le départ (il est vide au montage)
  if (lang === 'ar') {
    if (segs.some((s) => isAr(s.text))) setAr($(root, '.pr-txt'));
    $$(root, '.pr-l').forEach((l, i) => isAr(res.lines?.[i]) && setAr(l));
  }
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.pr-win'), { autoAlpha: 0, y: 60, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, base);
  let t = base + 0.6;
  const cps = sc.cps || 34;
  const segEls = $$(root, '.pr-seg');
  const tagEls = $$(root, '.pr-tag');
  segs.forEach((s, i) => {
    const ti = tags.findIndex(([n]) => n === s.tag);
    if (ti >= 0) tl.fromTo(tagEls[ti], { '--on': 0, scale: 0.9 }, { '--on': 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, t);
    const dt = type(tl, segEls[i], s.text, t, { cps, caret: false });
    t += dt + 0.12;
  });
  const typed = t;
  const out = $(root, '.pr-out');
  tl.fromTo(out, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, typed + 0.2);
  let t2 = typed + 0.5;
  if (res.kind === 'image') {
    $$(root, '.pr-tile').forEach((tile, i) => {
      tl.fromTo(tile, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, t2 + i * 0.15);
      tl.fromTo($(tile, '.pr-noise'), { opacity: 1 }, { opacity: 0, duration: 1.8, ease: 'power2.in' }, t2 + 0.3 + i * 0.25);
      tl.fromTo($(tile, '.pr-art'), { filter: 'blur(26px)', scale: 1.25 }, { filter: 'blur(0px)', scale: 1, duration: 2, ease: 'power3.out' }, t2 + 0.3 + i * 0.25);
    });
    if (typeof res.pick === 'number') tl.to($$(root, '.pr-tile')[res.pick], { '--glow': 1, scale: 1.05, duration: 0.5 }, sc.pickAt ?? t2 + 3.4);
  } else if (res.kind === 'video') {
    tl.fromTo($$(root, '.pr-fr'), { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.2 }, t2);
    tl.fromTo($(root, '.pr-play'), { scaleX: 0 }, { scaleX: 1, duration: Math.max(1, d - t2 - 1), ease: 'none' }, t2 + 0.8);
  } else {
    $$(root, '.pr-l').forEach((l, i) => {
      const dt = type(tl, l, res.lines[i], t2, { cps: res.cps || 60, caret: false });
      t2 += dt + 0.15;
    });
  }
  $$(root, '.pr-side li').forEach((li, i) => tl.fromTo(li, { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }, sc.side[i].at ?? base + 0.8 + i * 0.7));
  return tl;
}

export function chat(root, sc, d) {
  const msgs = sc.msgs || [];
  root.innerHTML = `${head(sc)}
    <div class="ch">
      <div class="ch-top">${icon('message', { size: 28 })}<b>${esc(sc.with || tr('mo.ch.with'))}</b><span>${esc(sc.channel || tr('mo.ch.channel'))}</span></div>
      <div class="ch-list">${msgs
        .map((m) => `<div class="ch-m is-${m.from === 'them' ? 'them' : 'me'}"><p>${rich(m.text)}</p>${m.note ? `<span class="ch-note">${rich(m.note)}</span>` : ''}</div>`)
        .join('')}</div>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.ch'), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, base);
  const step = sc.step ?? Math.min(2.4, (d - base - 1.5) / Math.max(1, msgs.length));
  $$(root, '.ch-m').forEach((m, i) => {
    const t = at(msgs[i], i, base + 0.6, step);
    tl.fromTo(m, { autoAlpha: 0, y: 40, scale: 0.9, transformOrigin: msgs[i].from === 'them' ? '0% 100%' : '100% 100%' }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, t);
    const nt = $(m, '.ch-note');
    if (nt) tl.fromTo(nt, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.5);
  });
  return tl;
}

/* ------------------------------------------------------------------ */
/* Audio, cinéma, analyse                                              */
/* ------------------------------------------------------------------ */

export function wave(root, sc, d) {
  const N = 96;
  const lanes = sc.lanes || [{ label: tr('mo.wv.voice'), c: 'gold', icon: 'mic' }];
  const r = rng(11);
  const seeds = lanes.map(() => Array.from({ length: N }, () => 0.25 + r() * 0.75));
  root.innerHTML = `${head(sc)}
    <div class="wv">
      ${lanes
        .map(
          (l, k) => `<div class="wv-lane" style="--c:${col(l.c)}">
            <span class="wv-lab">${icon(l.icon || 'wave', { size: 30 })}${esc(l.label)}</span>
            <div class="wv-bars">${seeds[k].map(() => '<i></i>').join('')}</div>
            ${(l.marks || []).map((m) => `<span class="wv-mk" style="left:${m.x * 100}%"><b>${esc(m.label)}</b></span>`).join('')}
          </div>`,
        )
        .join('')}
      <i class="wv-head" aria-hidden="true"></i>
    </div>
    ${sc.note ? `<p class="wv-note">${rich(sc.note)}</p>` : ''}`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  $$(root, '.wv-lane').forEach((ln, k) => {
    tl.fromTo(ln, { autoAlpha: 0, x: -60 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, lanes[k].at ?? base + k * 0.5);
    const bars = $$(ln, '.wv-bars i');
    const p = { t: 0 };
    const style = lanes[k].style || 'voice';
    tl.fromTo(
      p,
      { t: 0 },
      {
        t: d,
        duration: d,
        ease: 'none',
        onUpdate: () => {
          bars.forEach((b, i) => {
            const s = seeds[k][i];
            let v;
            if (style === 'music') v = 0.35 + 0.35 * Math.abs(Math.sin(p.t * 3.1 + i * 0.32)) * s + 0.25 * (Math.sin(p.t * 6.2) > 0.7 ? 1 : 0);
            else if (style === 'flat') v = 0.08 + 0.06 * Math.sin(i + p.t * 4);
            else v = s * (0.25 + 0.75 * Math.abs(Math.sin(p.t * 2.4 + i * 0.55) * Math.sin(p.t * 0.9 + i * 0.13)));
            b.style.transform = `scaleY(${v.toFixed(3)})`;
          });
        },
      },
      0,
    );
    $$(ln, '.wv-mk').forEach((m, i) => tl.fromTo(m, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(3)' }, lanes[k].marks[i].at ?? base + 1 + i * 0.6));
  });
  tl.fromTo($(root, '.wv-head'), { left: '12%' }, { left: '100%', duration: d - base, ease: 'none' }, base);
  const n = $(root, '.wv-note');
  if (n) tl.fromTo(n, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, sc.noteAt ?? 1.6);
  return tl;
}

export function storyboard(root, sc, d) {
  const frames = sc.frames || [];
  const shot = (s) =>
    ({
      large: 'scale(.38) translateY(-30%)',
      moyen: 'scale(.82) translateY(6%)',
      gros: 'scale(1.55) translateY(14%)',
      detail: 'scale(.9) translateY(-6%)',
      plongee: 'scale(.6) translateY(-10%) rotateX(22deg)',
    })[s] || 'scale(.82) translateY(6%)';
  root.innerHTML = `${head(sc)}
    <div class="sb">
      <div class="sb-strip">${frames
        .map(
          (f, i) => `<figure class="sb-f">
            <div class="sb-img" style="background:${BG[f.bg] || BG.nuit}"><div class="sb-sub" style="transform:${shot(f.shot)}">${f.shot === 'detail' ? product(f.art || 'parfum') : person({ mood: f.mood || 'smile', top: f.top || '#c9a227', hijab: !!f.hijab })}</div><span class="sb-tc">${esc(f.dur || '0:02')}</span></div>
            <figcaption><b>${pad2(i + 1)} · ${esc(f.label)}</b><span>${esc(f.sub || '')}</span></figcaption>
          </figure>`,
        )
        .join('')}</div>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.sb-strip'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, base);
  const step = sc.step ?? Math.min(1.6, (d - base - 1.5) / Math.max(1, frames.length));
  $$(root, '.sb-f').forEach((f, i) => {
    const t = at(frames[i], i, base + 0.2, step);
    tl.fromTo(f, { autoAlpha: 0, y: -180, rotate: (i % 2 ? 1 : -1) * 8 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.7, ease: 'bounce.out' }, t);
    tl.fromTo($(f, '.sb-sub'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, t + 0.3);
  });
  tl.fromTo($(root, '.sb-strip'), { x: 0 }, { x: sc.pan ?? -40, duration: d, ease: 'none' }, 0);
  return tl;
}

export function camera(root, sc, d) {
  const moves = sc.moves || ['push', 'orbit', 'pan', 'crane'];
  const names = Object.fromEntries(['push', 'pull', 'orbit', 'pan', 'crane', 'static'].map((k) => [k, [tr(`mo.cam.${k}`), tr(`mo.cam.${k}.d`)]]));
  root.innerHTML = `${head(sc)}
    <div class="cm">
      <div class="cm-view"><div class="cm-world">
        <div class="cm-floor"></div>
        <div class="cm-back"></div>
        <div class="cm-prod">${product(sc.art || 'parfum')}</div>
        <div class="cm-prod cm-prod2">${product('creme')}</div>
        <div class="cm-prod cm-prod3">${product('serum')}</div>
      </div><span class="cm-rec">REC ●</span><i class="cm-frame"></i></div>
      <ul class="cm-list">${moves.map((m) => `<li><b>${esc(names[m][0])}</b><span>${esc(names[m][1])}</span></li>`).join('')}</ul>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const w = $(root, '.cm-world');
  tl.fromTo($(root, '.cm-view'), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, base);
  const per = (d - base - 1) / moves.length;
  const pose = { x: 0, y: 0, z: 0, rx: -8, ry: 0 };
  tl.set(w, { x: 0, y: 0, z: 0, rotateX: -8, rotateY: 0 }, 0);
  const li = $$(root, '.cm-list li');
  moves.forEach((m, i) => {
    const t = base + 0.4 + i * per;
    li.forEach((l, k) => tl.to(l, { opacity: k === i ? 1 : 0.3, x: k === i ? 14 : 0, duration: 0.3 }, t));
    const next = { ...pose };
    if (m === 'push') Object.assign(next, { z: 520, y: 30 });
    if (m === 'pull') Object.assign(next, { z: -320 });
    if (m === 'orbit') Object.assign(next, { ry: 55, z: 120 });
    if (m === 'pan') Object.assign(next, { x: -380, ry: 0, z: 80 });
    if (m === 'crane') Object.assign(next, { rx: -38, y: 180, z: 60, x: 0, ry: 0 });
    tl.fromTo(
      w,
      { x: pose.x, y: pose.y, z: pose.z, rotateX: pose.rx, rotateY: pose.ry },
      { x: next.x, y: next.y, z: next.z, rotateX: next.rx, rotateY: next.ry, duration: per - 0.25, ease: 'power2.inOut' },
      t,
    );
    Object.assign(pose, next);
    if (i < moves.length - 1) {
      tl.to(w, { x: 0, y: 0, z: 0, rotateX: -8, rotateY: 0, duration: 0.01 }, t + per - 0.02);
      Object.assign(pose, { x: 0, y: 0, z: 0, rx: -8, ry: 0 });
    }
  });
  return tl;
}

export function ratio(root, sc, d) {
  const items = sc.items || ['9:16', '4:5', '1:1', '16:9'].map((r) => ({ r, use: tr(`mo.ra.${r}`) }));
  const size = (r) => {
    const [a, b] = r.split(':').map(Number);
    const H = 640;
    const W = (H * a) / b;
    return W > 1000 ? { w: 1000, h: (1000 * b) / a } : { w: W, h: H };
  };
  root.innerHTML = `${head(sc)}
    <div class="ra">
      <div class="ra-frame"><div class="ra-in" style="background:${BG.studio}"><div class="ra-art">${product('parfum')}</div></div><b class="ra-r"></b><span class="ra-u"></span>
        <i class="ra-safe ra-safe-t"><em>${esc(tr('mo.ra.safe.t'))}</em></i><i class="ra-safe ra-safe-b"><em>${esc(tr('mo.ra.safe.b'))}</em></i>
      </div>
      <ul class="ra-list">${items.map((it) => `<li><b>${esc(it.r)}</b><span>${esc(it.use)}</span></li>`).join('')}</ul>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const fr = $(root, '.ra-frame');
  const rEl = $(root, '.ra-r');
  const uEl = $(root, '.ra-u');
  const per = (d - base - (sc.safe ? 3 : 0.8)) / items.length;
  const s0 = size(items[0].r);
  tl.fromTo(fr, { autoAlpha: 0, width: s0.w * 0.6, height: s0.h * 0.6 }, { autoAlpha: 1, width: s0.w, height: s0.h, duration: 0.7, ease: 'expo.out' }, base);
  const li = $$(root, '.ra-list li');
  const tSafe = sc.safe ? d - 2.8 : Infinity;
  items.forEach((it, i) => {
    const t = base + 0.2 + i * per;
    const s = size(it.r);
    if (i) tl.to(fr, { width: s.w, height: s.h, duration: 0.7, ease: 'expo.inOut' }, t);
    li.forEach((l, k) => tl.to(l, { opacity: k === i ? 1 : 0.35, x: k === i ? 12 : 0, duration: 0.3 }, t));
  });
  track(tl, d, (t) => {
    let k = 0;
    items.forEach((_, i) => {
      if (t >= base + 0.2 + i * per) k = i;
    });
    const safe = t >= tSafe;
    rEl.textContent = safe ? '9:16' : items[k].r;
    uEl.textContent = safe ? tr('mo.ra.safe') : items[k].use;
  });
  if (sc.safe) {
    const s = size('9:16');
    tl.to(fr, { width: s.w, height: s.h, duration: 0.7, ease: 'expo.inOut' }, tSafe);
    tl.fromTo($$(root, '.ra-safe'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.2 }, tSafe + 0.6);
  }
  return tl;
}

export function layers(root, sc, d) {
  const ls = sc.layers || [
    { label: tr('mo.ly.bg'), kind: 'bg' },
    { label: tr('mo.ly.product'), kind: 'product' },
    { label: tr('mo.ly.title'), kind: 'title' },
    { label: tr('mo.ly.badge'), kind: 'badge' },
    { label: tr('mo.ly.cta'), kind: 'cta' },
  ];
  const art = sc.art || 'parfum';
  const layerHTML = (l) =>
    ({
      bg: `<div class="ly-bg" style="background:${BG[sc.bg || 'teal']}"></div>`,
      product: `<div class="ly-prod">${product(art)}</div>`,
      title: `<div class="ly-title">${rich(sc.headline || tr('mo.ly.headline'))}</div>`,
      badge: `<div class="ly-badge">${rich(sc.badge || tr('mo.delivery'))}</div>`,
      cta: `<div class="ly-cta">${rich(sc.cta || tr('mo.btn'))}</div>`,
      logo: `<div class="ly-logo">${esc(sc.brand || 'NOOR')}</div>`,
      ai: `<div class="ly-ai"><span>${icon('sparkles', { size: 26 })} ${esc(tr('mo.ly.ai'))}</span></div>`,
    })[l.kind] || '';
  root.innerHTML = `${head(sc)}
    <div class="ly">
      <div class="ly-scene"><div class="ly-stack">${ls.map((l, i) => `<div class="ly-l" style="--i:${i}">${layerHTML(l)}</div>`).join('')}</div></div>
      <ol class="ly-list">${ls.map((l, i) => `<li><span>${pad2(i + 1)}</span><b>${rich(l.label)}</b>${l.sub ? `<em>${rich(l.sub)}</em>` : ''}</li>`).join('')}</ol>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  const stack = $(root, '.ly-stack');
  const L = $$(root, '.ly-l');
  const li = $$(root, '.ly-list li');
  const build = sc.explode === false ? (d - base - 1) / ls.length : Math.min(0.9, (d * 0.4) / ls.length);
  L.forEach((l, i) => {
    const t = base + 0.3 + i * build;
    tl.fromTo(l, { autoAlpha: 0, y: -90, scale: 1.08 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, t);
    tl.fromTo(li[i], { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }, t);
  });
  if (sc.explode !== false) {
    const te = base + 0.6 + ls.length * build;
    tl.fromTo(stack, { rotateX: 0, rotateZ: 0, scale: 1 }, { rotateX: 58, rotateZ: -32, scale: 0.86, duration: 1.1, ease: 'expo.inOut' }, te);
    L.forEach((l, i) => tl.fromTo(l, { z: 0 }, { z: i * 95, duration: 1.1, ease: 'expo.inOut' }, te));
    const per = Math.max(0.4, (d - te - 3) / ls.length);
    li.forEach((l, i) => {
      tl.to(L[i], { '--glow': 1, duration: 0.3 }, te + 1.1 + i * per);
      tl.to(L[i], { '--glow': 0, duration: 0.3 }, te + 1.1 + (i + 1) * per);
      tl.to(l, { color: 'var(--gold-300)', x: 12, duration: 0.3 }, te + 1.1 + i * per);
    });
    const tc = d - 1.6;
    tl.to(stack, { rotateX: 0, rotateZ: 0, scale: 1, duration: 1, ease: 'expo.inOut' }, tc);
    L.forEach((l) => tl.to(l, { z: 0, duration: 1, ease: 'expo.inOut' }, tc));
  }
  return tl;
}

export function scan(root, sc, d) {
  const seq = sc.seq || [
    [tr('mo.part.hook'), 'hook'],
    [tr('mo.part.problem'), 'body'],
    [tr('mo.part.solution'), 'body'],
    [tr('mo.part.proof'), 'body'],
    [tr('mo.part.offer'), 'cta'],
    [tr('mo.part.cta'), 'cta'],
  ];
  root.innerHTML = `${head(sc)}
    <div class="sn">
      <div class="sn-phone"><div class="sn-screen" style="background:${BG.teal}"><div class="sn-art">${product('parfum')}</div><i class="sn-line"></i>${[0, 1, 2, 3, 4, 5].map((i) => `<i class="sn-box" style="--i:${i}"></i>`).join('')}</div></div>
      <div class="sn-panel">
        <div class="sn-brand">${markSVG({ lab: true })}<b>Hooked Lab</b><span>${esc(sc.badge || tr('mo.sn.badge'))}</span></div>
        <div class="sn-card sn-script"><h4>${icon('doc', { size: 22 })} ${esc(tr('mo.sn.script'))}</h4><p></p><p></p><p></p></div>
        <div class="sn-card"><h4>${icon('film', { size: 22 })} ${esc(tr('mo.sn.seq'))}</h4><div class="sn-seq">${seq.map(([t, c]) => `<span style="--c:${col(c)}">${esc(t)}</span>`).join('')}</div></div>
        <div class="sn-card"><h4>${icon('hook', { size: 22 })} ${esc(tr('mo.sn.hook'))}</h4><div class="sn-gauge"><i></i></div><span class="sn-g">${esc(tr('mo.sn.gauge'))}</span></div>
        <div class="sn-card"><h4>${icon('target', { size: 22 })} ${esc(tr('mo.sn.angles'))}</h4><div class="sn-ang"><span>${esc(tr('mo.sn.a1'))}</span><span>${esc(tr('mo.sn.a2'))}</span><span>${esc(tr('mo.sn.a3'))}</span></div></div>
      </div>
    </div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.sn-phone'), { autoAlpha: 0, x: -80, rotateY: 30 }, { autoAlpha: 1, x: 0, rotateY: 0, duration: 0.9, ease: 'expo.out' }, base);
  tl.fromTo($(root, '.sn-line'), { top: '0%' }, { top: '100%', duration: 1.6, ease: 'power1.inOut', repeat: Math.max(1, Math.floor((d - 2) / 1.6)), yoyo: true }, base + 0.6);
  tl.fromTo($$(root, '.sn-box'), { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.25 }, base + 1);
  tl.fromTo($(root, '.sn-brand'), { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, base + 0.3);
  const cards = $$(root, '.sn-card');
  const per = Math.min(1.4, (d - base - 2) / cards.length);
  cards.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, base + 0.8 + i * per));
  tl.fromTo($$(root, '.sn-script p'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.18, ease: 'power2.out' }, base + 1);
  tl.fromTo($$(root, '.sn-seq span'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.1 }, base + 0.9 + per);
  tl.fromTo($(root, '.sn-gauge i'), { scaleX: 0 }, { scaleX: 0.72, duration: 1, ease: 'power3.out' }, base + 1 + 2 * per);
  tl.fromTo($$(root, '.sn-ang span'), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12, ease: 'back.out(2)' }, base + 1 + 3 * per);
  return tl;
}

export function price(root, sc, d) {
  const tiers = sc.tiers || [];
  root.innerHTML = `${head(sc)}
    <div class="pc">${tiers
      .map(
        (tier) => `<article class="pc-t ${tier.hl ? 'is-hl' : ''}"><span class="pc-k">${esc(PRICE_K[tier.k] ? tr(PRICE_K[tier.k]) : tier.k || '')}</span><h3>${rich(tier.name)}</h3><ul>${(tier.items || []).map((x) => `<li>${icon('check', { size: 24, stroke: 2.4 })}${rich(x)}</li>`).join('')}</ul><p class="pc-p">${rich(tier.price || tr('mo.pc.price'))}</p></article>`,
      )
      .join('')}</div>`;
  const tl = G().timeline();
  enterHead(tl, root, 0);
  const base = sc.title ? 0.5 : 0.2;
  $$(root, '.pc-t').forEach((c, i) => {
    tl.fromTo(c, { autoAlpha: 0, y: 140, rotateX: -40 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'expo.out' }, at(tiers[i], i, base + 0.2, sc.step ?? 0.35));
    tl.fromTo($$(c, 'li'), { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.12 }, at(tiers[i], i, base + 0.2, sc.step ?? 0.35) + 0.5);
  });
  return tl;
}

/* ------------------------------------------------------------------ */
/* Téléphone : vidéo, image, carrousel, fil, UGC                       */
/* ------------------------------------------------------------------ */

function screenFor(sc) {
  const art = sc.art || 'parfum';
  const bg = BG[sc.bg || 'teal'];
  const ui = `<div class="ph-ui"><span>${icon('heart', { size: 30 })}</span><span>${icon('chat', { size: 30 })}</span><span>${icon('arrow', { size: 30 })}</span></div>
    <div class="ph-cap"><b>@${esc(sc.handle || tr('mo.ph.handle'))}</b><span>${esc(tr('mo.ph.sponsored'))}</span><p>${rich(sc.caption || '')}</p><div class="ph-btn">${rich(sc.btn || tr('mo.btn'))}<i>›</i></div></div>`;
  switch (sc.mode) {
    case 'image':
      return `<div class="ph-img" style="background:${bg}">
        <p class="ph-hl">${rich(sc.headline || tr('mo.ph.headline'))}</p>
        <div class="ph-art">${product(art)}</div>
        <span class="ph-badge">${rich(sc.badge || tr('mo.delivery'))}</span>
      </div>${ui}`;
    case 'carousel': {
      const slides = sc.slides || ['nuit', 'teal', 'sable', 'rose', 'or'].map((bg, i) => ({ t: tr(`mo.ph.s${i + 1}.t`), s: tr(`mo.ph.s${i + 1}.s`), bg }));
      return `<div class="ph-car"><div class="ph-track">${slides
        .map(
          (s, i) => `<div class="ph-slide" style="background:${BG[s.bg] || bg}"><span class="ph-sn">${i + 1}/${slides.length}</span><b>${rich(s.t)}</b><p>${rich(s.s)}</p><div class="ph-art ph-art-s">${product(s.art || art)}</div></div>`,
        )
        .join('')}</div><div class="ph-dots">${slides.map(() => '<i></i>').join('')}</div></div>${ui}`;
    }
    case 'feed': {
      const posts = 9;
      const hk = sc.hookIndex ?? 6;
      const bgs = ['nuit', 'sable', 'rose', 'bain', 'cuisine', 'nuit', 'teal', 'sable', 'rose'];
      return `<div class="ph-feed"><div class="ph-ftrack">${Array.from({ length: posts }, (_, i) =>
        i === hk
          ? `<div class="ph-post is-hook" style="background:${bg}"><p class="ph-hl">${rich(sc.headline || tr('mo.ph.feed'))}</p><div class="ph-art">${product(art)}</div></div>`
          : `<div class="ph-post" style="background:${BG[bgs[i]]}"><i class="ph-blob"></i><i class="ph-blob ph-blob2"></i></div>`,
      ).join('')}</div></div>`;
    }
    case 'ugc':
      return `<div class="ph-ugc" style="background:${BG[sc.bg || 'cuisine']}"><div class="ph-person">${person({ mood: 'talk', top: '#55b894', hijab: !!sc.hijab })}</div><div class="ph-hand">${product(art)}</div></div>
        <div class="ph-subs"></div>${ui}`;
    default:
      return `<div class="ph-vid" style="background:${bg}"><div class="ph-art">${product(art)}</div><div class="ph-prog"><i></i><i></i><i></i></div><span class="ph-play">${icon('play', { size: 28 })}</span></div><div class="ph-subs"></div>${ui}`;
  }
}

export function phone(root, sc, d) {
  const side = sc.side || [];
  root.innerHTML = `
    <div class="ph-wrap ${sc.align === 'right' ? 'is-right' : ''}">
      <div class="ph"><div class="ph-screen">${screenFor(sc)}</div><i class="ph-notch"></i></div>
      <div class="ph-side">
        ${kicker(sc.kicker)}
        ${sc.title ? `<h2 class="s-title">${words(sc.title)}</h2>` : ''}
        ${arP(sc.ar, 's-ar')}
        <ul>${side.map((s) => `<li style="--c:${col(s.c)}"><span>${icon(s.icon || 'check', { size: 30 })}</span><div><b>${rich(s.label)}</b>${s.sub ? `<em>${rich(s.sub)}</em>` : ''}</div></li>`).join('')}</ul>
      </div>
    </div>`;
  const tl = G().timeline();
  const ph = $(root, '.ph');
  tl.fromTo(ph, { autoAlpha: 0, y: 220, rotateY: sc.align === 'right' ? 28 : -28, rotateZ: -4 }, { autoAlpha: 1, y: 0, rotateY: sc.align === 'right' ? -10 : 10, rotateZ: 0, duration: 1.1, ease: 'expo.out' }, 0);
  tl.to(ph, { rotateY: 0, y: -14, duration: Math.max(1, d - 1.1), ease: 'sine.inOut' }, 1.1);
  const k = $(root, '.ph-side .kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.2);
  const h2 = $(root, '.ph-side .s-title');
  if (h2) riseWords(tl, h2, 0.3, { stagger: 0.05 });
  const ar = $(root, '.ph-side .s-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0.7);
  $$(root, '.ph-side li').forEach((li, i) => tl.fromTo(li, { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, at(side[i], i, 1, 0.9)));

  const mode = sc.mode || 'video';
  const capEl = $(root, '.ph-cap');
  if (capEl) tl.fromTo(capEl, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.8);
  if (mode === 'video' || mode === 'ugc') {
    const art = $(root, '.ph-art, .ph-person');
    if (art) tl.fromTo(art, { scale: 1, rotate: -3 }, { scale: 1.22, rotate: 3, duration: d, ease: 'none' }, 0);
    const prog = $$(root, '.ph-prog i');
    prog.forEach((p, i) => tl.fromTo(p, { '--p': 0 }, { '--p': 1, duration: d / prog.length, ease: 'none' }, (i * d) / prog.length));
    const play = $(root, '.ph-play');
    if (play) tl.fromTo(play, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 2.2, duration: 0.6 }, 0.9);
    const subs = $(root, '.ph-subs');
    const caps = (sc.captions || []).map((c, i, a) => (typeof c === 'object' ? c : { t: c, at: 1 + (i * (d - 1.5)) / a.length }));
    if (subs && caps.length) {
      track(tl, d, (t) => {
        let k = -1;
        caps.forEach((c, i) => {
          if (t >= c.at) k = i;
        });
        const txt = k < 0 ? '' : caps[k].t;
        if (subs.textContent !== txt) subs.textContent = txt;
        const since = k < 0 ? 0 : t - caps[k].at;
        const s = since < 0.25 ? 0.7 + (since / 0.25) * 0.3 : 1;
        subs.style.transform = `translateX(-50%) scale(${s.toFixed(3)})`;
        subs.style.opacity = k < 0 ? 0 : 1;
      });
    }
    const mouth = $(root, '.ph-person .mouth');
    if (mouth) {
      const p = { t: 0 };
      tl.fromTo(p, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => mouth.setAttribute('ry', (2 + 6 * Math.abs(Math.sin(p.t * 9) * Math.sin(p.t * 3.3))).toFixed(2)) }, 0);
    }
    const hand = $(root, '.ph-hand');
    if (hand) tl.fromTo(hand, { y: 260, rotate: 20 }, { y: 0, rotate: -6, duration: 0.8, ease: 'back.out(1.4)' }, sc.handAt ?? d * 0.45);
  }
  if (mode === 'image') {
    tl.fromTo($(root, '.ph-hl'), { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6);
    tl.fromTo($(root, '.ph-art'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)' }, 0.7);
    tl.fromTo($(root, '.ph-badge'), { autoAlpha: 0, scale: 1.8, rotate: -20 }, { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.5, ease: 'back.out(2)' }, 1.2);
    tl.fromTo($(root, '.ph-art'), { y: 0 }, { y: -18, duration: d, ease: 'sine.inOut' }, 1.5);
  }
  if (mode === 'carousel') {
    const track = $(root, '.ph-track');
    const n = $$(root, '.ph-slide').length;
    const dots = $$(root, '.ph-dots i');
    const t0 = sc.swipeAt ?? 1.4;
    const per = sc.swipe ?? Math.max(0.9, (d - t0 - 0.8) / n);
    tl.set(dots[0], { '--on': 1 }, 0);
    for (let i = 1; i < n; i++) {
      const t = t0 + i * per;
      tl.to(track, { xPercent: (-100 * i) / n, duration: 0.55, ease: 'expo.inOut' }, t);
      tl.to(dots[i - 1], { '--on': 0, duration: 0.2 }, t);
      tl.to(dots[i], { '--on': 1, duration: 0.2 }, t + 0.2);
    }
  }
  if (mode === 'feed') {
    const track = $(root, '.ph-ftrack');
    const hk = sc.hookIndex ?? 6;
    const posts = $$(root, '.ph-post');
    const s0 = sc.scrollAt ?? 0.5;
    const sd = sc.scrollDur ?? 2.6;
    if (sc.flick) {
      // Défilement « au pouce » : un post après l'autre, comme dans le vrai fil
      const per = sd / hk;
      tl.set(track, { yPercent: 0 }, 0);
      for (let i = 1; i <= hk; i++) {
        const t = s0 + i * per - 0.5;
        tl.to(track, { yPercent: (-100 * i) / posts.length, duration: 0.5, ease: 'expo.inOut' }, t);
        tl.fromTo(track, { filter: 'blur(0px)' }, { filter: 'blur(5px)', duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, t);
      }
    } else {
      tl.fromTo(track, { yPercent: 0, filter: 'blur(0px)' }, { yPercent: (-100 * hk) / posts.length, duration: sd, ease: 'expo.inOut' }, s0);
      tl.fromTo(track, { filter: 'blur(0px)' }, { filter: 'blur(6px)', duration: 0.6, yoyo: true, repeat: 1, ease: 'power1.inOut' }, s0 + 0.4);
    }
    const hp = posts[hk];
    tl.fromTo(hp, { '--glow': 0 }, { '--glow': 1, duration: 0.5 }, s0 + sd);
    tl.fromTo($(hp, '.ph-hl'), { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, s0 + sd - 0.2);
  }
  return tl;
}

/* ------------------------------------------------------------------ */
/* Anatomie : la vidéo d'exemple et sa barre Hook · Body · CTA         */
/* ------------------------------------------------------------------ */

const AN_ICON = { hook: 'hook', body: 'eye', cta: 'cart' };

export function anatomy(root, sc, d) {
  const parts = sc.parts || [];
  const total = sc.total || parts.reduce((m, p) => Math.max(m, p.to || 0), 0) || 15;
  const art = sc.art || 'parfum';
  const screens = {
    hook: `<div class="an-scr" data-k="hook" style="background:${BG[sc.hookBg || 'nuit']}"><p class="ph-hl an-hl">${rich(sc.headline || tr('mo.an.headline'))}</p><div class="ph-art">${product(art)}</div></div>`,
    body: `<div class="an-scr" data-k="body" style="background:${BG[sc.bodyBg || 'teal']}"><div class="ph-art">${product(art)}</div><div class="ph-subs an-subs"></div></div>`,
    cta: `<div class="an-scr" data-k="cta" style="background:${BG[sc.ctaBg || 'or']}"><div class="ph-art an-art-s">${product(art)}</div><span class="ph-badge an-badge">${rich(sc.badge || tr('mo.cod'))}</span><div class="an-btn">${rich(sc.btn || tr('mo.btn'))}<i>›</i></div></div>`,
  };
  const ticks = [];
  for (let s = 0; s <= total; s += total > 20 ? 5 : 3) ticks.push(s);
  root.innerHTML = `
    <div class="an">
      <div class="ph an-ph"><div class="ph-screen">
        <div class="an-scr an-idle" style="background:${BG.nuit}"><span class="ph-play">${icon('play', { size: 28 })}</span></div>
        ${parts.map((p) => screens[p.k] || '').join('')}
        <div class="an-pbar"><i></i></div>
      </div><i class="ph-notch"></i></div>
      <div class="an-side">
        ${kicker(sc.kicker)}
        ${sc.title ? `<h2 class="s-title">${words(sc.title)}</h2>` : ''}
        ${arP(sc.ar, 's-ar')}
        <div class="an-bar">
          <div class="an-segs">${parts
            .map(
              (p) =>
                `<div class="an-seg ${typeof p.at === 'number' ? '' : 'is-off'}" data-k="${p.k}" style="left:${((p.from / total) * 100).toFixed(3)}%;width:${(((p.to - p.from) / total) * 100).toFixed(3)}%;--c:${col(p.c || p.k)}"><b>${esc(p.label || p.k.toUpperCase())}</b></div>`,
            )
            .join('')}<i class="an-head"></i></div>
          <div class="an-ruler">${ticks.map((s) => `<span style="left:${((s / total) * 100).toFixed(3)}%">${esc(tr('mo.unit.s', { n: s }))}</span>`).join('')}</div>
        </div>
        <div class="an-panels">${parts
          .filter((p) => typeof p.at === 'number')
          .map(
            (p) => `<div class="an-panel" data-k="${p.k}" style="--c:${col(p.c || p.k)}">
              <h3><span>${icon(p.icon || AN_ICON[p.k] || 'spark', { size: 40 })}</span>${esc(p.label || p.k.toUpperCase())}${p.when ? `<em>${rich(p.when)}</em>` : ''}</h3>
              ${p.fr ? `<p class="an-fr">${rich(p.fr)}</p>` : ''}
              ${p.ar && lang !== 'ar' ? `<p class="an-ar" lang="ar" dir="rtl">${esc(p.ar)}</p>` : ''}
              ${p.items ? `<ol class="an-items">${p.items.map((it, i) => `<li><i>${i + 1}</i><div><b>${rich(it.label)}</b>${it.sub ? `<span>${rich(it.sub)}</span>` : ''}</div></li>`).join('')}</ol>` : ''}
            </div>`,
          )
          .join('')}</div>
      </div>
    </div>`;
  const tl = G().timeline();
  const ph = $(root, '.an-ph');
  tl.fromTo(ph, { autoAlpha: 0, y: 220, rotateY: -28, rotateZ: -4 }, { autoAlpha: 1, y: 0, rotateY: 10, rotateZ: 0, duration: 1.1, ease: 'expo.out' }, 0);
  tl.to(ph, { rotateY: 0, y: -14, duration: Math.max(1, d - 1.1), ease: 'sine.inOut' }, 1.1);
  const k = $(root, '.an-side .kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.2);
  const h2 = $(root, '.an-side .s-title');
  if (h2) riseWords(tl, h2, 0.3, { stagger: 0.05 });
  const ar = $(root, '.an-side .s-ar');
  if (ar) tl.fromTo(ar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0.7);
  const segs = $$(root, '.an-seg');
  tl.fromTo(segs, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.12 }, sc.barAt ?? 0.6);
  tl.fromTo($$(root, '.an-ruler span'), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.03 }, (sc.barAt ?? 0.6) + 0.3);

  // Parties actives, dans l'ordre de leur apparition
  const live = parts.filter((p) => typeof p.at === 'number').sort((a, b) => a.at - b.at);
  const panels = Object.fromEntries($$(root, '.an-panel').map((el) => [el.dataset.k, el]));
  live.forEach((p, i) => {
    const el = panels[p.k];
    const nx = live[i + 1];
    tl.fromTo(el, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, p.at);
    tl.fromTo($(el, 'h3'), { scale: 1.25, transformOrigin: '0 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, p.at);
    const fr = $(el, '.an-fr');
    if (fr) tl.fromTo(fr, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, p.at + (p.frAt ?? 0.3));
    const arl = $(el, '.an-ar');
    if (arl) tl.fromTo(arl, { autoAlpha: 0, clipPath: 'inset(0 0 0 100%)' }, { autoAlpha: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'power3.out' }, p.at + (p.arAt ?? 0.7));
    $$(el, '.an-items li').forEach((li, j) => tl.fromTo(li, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }, p.items[j].at ?? p.at + 1 + j * 1.2));
    if (nx) tl.to(el, { autoAlpha: 0, y: -40, duration: 0.35, ease: 'power2.in' }, nx.at - 0.3);
  });

  // La vidéo d'exemple : écran, tête de lecture et sous-titres suivent la partie active
  const scr = $$(root, '.an-scr');
  const playhead = $(root, '.an-head');
  const pbar = $(root, '.an-pbar i');
  const subs = $(root, '.an-subs');
  const hl = $(root, '.an-hl');
  const btn = $(root, '.an-btn');
  const caps = parts.find((p) => p.k === 'body')?.captions || [tr('mo.an.c1'), tr('mo.an.c2'), tr('mo.an.c3')];
  track(tl, d, (t) => {
    let cur = null;
    live.forEach((p) => {
      if (t >= p.at) cur = p;
    });
    const key = cur ? cur.k : 'idle';
    scr.forEach((el) => {
      const on = el.dataset.k === key || (key === 'idle' && el.classList.contains('an-idle'));
      el.style.opacity = on ? 1 : 0;
    });
    segs.forEach((el) => el.classList.toggle('is-on', el.dataset.k === key));
    let vt = 0;
    if (cur) {
      const span = Math.max(0.5, cur.to - cur.from);
      const speed = cur.speed ?? 1;
      vt = cur.from + (((t - cur.at) * speed) % span);
      const since = t - cur.at;
      if (cur.k === 'hook' && hl) hl.style.transform = `scale(${(since < 0.35 ? 1.5 - (since / 0.35) * 0.5 : 1).toFixed(3)})`;
      if (cur.k === 'body' && subs) {
        let txt;
        if (cur.items && cur.items.every((it) => typeof it.at === 'number')) {
          // Les sous-titres suivent la voix : la dernière section annoncée
          const it = cur.items.filter((x) => t >= x.at).pop();
          txt = it ? it.cap || it.label.replace(/[*~^_]/g, '') : caps[0];
        } else {
          const n = Math.floor(((vt - cur.from) / span) * caps.length);
          txt = caps[Math.min(caps.length - 1, n)] || '';
        }
        if (subs.textContent !== txt) subs.textContent = txt;
        subs.style.opacity = 1;
      }
      if (cur.k === 'cta' && btn) btn.style.transform = `scale(${(1 + 0.05 * Math.max(0, Math.sin(since * 5))).toFixed(3)})`;
    }
    playhead.style.left = `${((vt / total) * 100).toFixed(3)}%`;
    playhead.style.opacity = cur ? 1 : 0;
    if (pbar) pbar.style.transform = `scaleX(${(vt / total).toFixed(4)})`;
  });
  return tl;
}

/* ------------------------------------------------------------------ */
/* Fin de leçon                                                        */
/* ------------------------------------------------------------------ */

export function outro(root, sc, d, ctx) {
  // Dernière leçon d'une formation : « Fin de la formation » au lieu d'une leçon suivante
  const end = !sc.next && !ctx.next;
  const track = ctx.module?.track === 'ia' ? 'ia' : 'creative';
  const next = sc.next ?? ctx.next?.title ?? tr(`mo.ou.end.${track}`);
  root.innerHTML = `<div class="ou">
      <div class="ou-mark">${markSVG({ lab: true })}</div>
      ${sc.text ? `<p class="ou-t">${words(sc.text)}</p>` : ''}
      <p class="ou-next"><span>${esc(tr(end ? 'mo.ou.end' : 'mo.ou.next'))}</span><b>${esc(next)}</b></p>
    </div>`;
  const tl = G().timeline();
  const mk = $(root, '.ou-mark svg');
  tl.fromTo($(root, '.ou-mark'), { autoAlpha: 0, scale: 0.4, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0);
  const legs = $$(mk, '.ha-leg');
  const from = [
    [19.75, 27, 19.75, 21],
    [28.25, 27, 28.25, 21],
  ];
  const to = [
    [19.4, 29.2, 24, 18.8],
    [28.6, 29.2, 24, 18.8],
  ];
  const p = { t: 0 };
  tl.fromTo(
    p,
    { t: 0 },
    {
      t: 1,
      duration: 0.9,
      ease: 'expo.inOut',
      onUpdate: () =>
        legs.forEach((l, i) => {
          const v = from[i].map((x, k) => x + (to[i][k] - x) * p.t);
          l.setAttribute('d', `M${v[0].toFixed(2)} ${v[1].toFixed(2)} ${v[2].toFixed(2)} ${v[3].toFixed(2)}`);
        }),
    },
    0.6,
  );
  const t = $(root, '.ou-t');
  if (t) riseWords(tl, t, 0.5, { stagger: 0.05 });
  tl.fromTo($(root, '.ou-next'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 1);
  return tl;
}
