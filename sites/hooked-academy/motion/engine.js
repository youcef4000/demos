// Moteur des vidéos Hooked Academy : assemble les scènes d'une leçon en une seule timeline GSAP.
// La même composition sert au lecteur de la plateforme, au studio voix off de l'équipe
// et au rendu MP4 (tools/hooked-academy/render.mjs), image par image.

import * as S from './scenes.js';
import * as SC from './scenes-cours.js';
import { G, fmt, autoDuration, esc, isAr, setAr } from './kit.js';
import { markSVG } from '../assets/js/brand.js';
import { lang, t as tr } from '../assets/js/i18n.js';
import '../assets/js/i18n/motion.js';
import { modCode } from '../data/programme.js';

/** Durée de base de chaque type de scène (sans voix enregistrée). */
const BASE = {
  title: 4.2, big: 4.6, quote: 5, stat: 4.6, cards: 6, grid: 6, steps: 7, checklist: 6.5, compare: 7,
  formula: 6, flow: 7, funnel: 6, curve: 7, timeline: 8, prompt: 9, chat: 8, wave: 6, storyboard: 8,
  camera: 10, ratio: 8, layers: 8, scan: 9, price: 7, phone: 7, anatomy: 10, acronym: 8, table: 9, hooks: 8, outro: 4.2,
};

export const sceneDuration = (sc) => +(sc.d ?? autoDuration(sc, BASE[sc.type] ?? 5)).toFixed(2);

/** Scènes de la leçon, avec leur début et leur durée. */
export function plan(lesson) {
  let t = 0;
  return (lesson.scenes || []).map((sc, i) => {
    const d = sceneDuration(sc);
    const p = { i, sc, t, d };
    t += d;
    return p;
  });
}

export const lessonDuration = (lesson) => plan(lesson).reduce((s, p) => s + p.d, 0);

/* ------------------------------------------------------------------ */
/* Arabe : la composition reste de gauche à droite (positions, minutage), */
/* chaque bloc de texte en arabe s'écrit de droite à gauche.           */
/* ------------------------------------------------------------------ */

/** Lignes et cartes « pictogramme + texte » : en arabe, le pictogramme passe à droite du texte. */
const ROWS = '.kick, .mx-code, .ph-btn, .an-btn, .ch-top, .an-panel h3, .fx-chip, .sn-card, .sn-card h4, .wv-lab, .tlx-lab, .sp.is-h > li, .gr-i, .cd, .pc-t';
const isInline = (el) => !(el instanceof SVGElement) && /^inline/.test(getComputedStyle(el).display);

/**
 * Marque dir="rtl" lang="ar" (police arabe, sens de lecture) sur :
 *  - les listes qui contiennent de l'arabe (sauf les étapes horizontales, dont l'ordre est la mise en page) ;
 *  - les lignes pictogramme + texte (ROWS) ;
 *  - tout bloc qui porte directement du texte en arabe (texte ou éléments en ligne, comme les mots animés).
 * Textes SVG en arabe : sens de droite à gauche, ancrage inversé (le libellé garde sa place).
 * Textes écrits pendant la lecture (sous-titres, libellés) : dir="auto", d'après leur première lettre.
 */
export function markRTL(box) {
  const hasAr = (el) => isAr(el.textContent);
  box.querySelectorAll('svg text').forEach((tx) => {
    if (!hasAr(tx)) return;
    const a = getComputedStyle(tx).textAnchor;
    tx.style.direction = 'rtl';
    if (a === 'start' || a === 'end') tx.style.textAnchor = a === 'start' ? 'end' : 'start';
  });
  box.querySelectorAll('.ph-subs, .an-subs, .ra-u').forEach((el) => el.setAttribute('dir', 'auto'));
  box.querySelectorAll('ul, ol').forEach((l) => {
    if (!l.matches('.sp.is-h') && hasAr(l)) setAr(l);
  });
  box.querySelectorAll(ROWS).forEach((el) => hasAr(el) && setAr(el));
  box.querySelectorAll('*').forEach((el) => {
    if (el.classList.contains('ar-t') || el instanceof SVGElement || el.hasAttribute('lang') || isInline(el)) return;
    const holds = [...el.childNodes].some((n) => (n.nodeType === 3 ? n.nodeValue.trim() !== '' : n.nodeType === 1 && isInline(n)));
    if (holds && hasAr(el)) setAr(el);
  });
}

/**
 * Hors français : une traduction plus longue peut rendre une scène si haute qu'elle toucherait l'en-tête
 * ou le pied (zone utile 1080 − marges, plus 40 px de chaque côté que certaines scènes occupent déjà en
 * français, comme le téléphone). Ses blocs sont alors réduits ensemble (zoom, 75 % au plus) pour tenir.
 * Mesures de mise en page (offsetTop/offsetHeight) : les transformations GSAP n'y entrent pas.
 */
export function fitScene(sec) {
  const cs = getComputedStyle(sec);
  const avail = sec.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) + 80;
  const kids = [...sec.children].filter((c) => !/absolute|fixed/.test(getComputedStyle(c).position));
  if (!kids.length || !avail) return;
  const m = (c, side) => parseFloat(getComputedStyle(c)[side]) || 0;
  const top = Math.min(...kids.map((c) => c.offsetTop - m(c, 'marginTop')));
  const bottom = Math.max(...kids.map((c) => c.offsetTop + c.offsetHeight + m(c, 'marginBottom')));
  const h = bottom - top;
  if (h > avail + 2) {
    const k = Math.max(0.75, avail / h).toFixed(3);
    kids.forEach((c) => (c.style.zoom = k));
  }
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Construit la composition dans `mount` (le lecteur met l'échelle).
 * Renvoie { tl, duration, root, scenes }.
 */
export function compose(lesson, mount, { module, next, chrome = true } = {}) {
  const gsap = G();
  const steps = plan(lesson);
  const duration = steps.reduce((s, p) => s + p.d, 0);
  const root = document.createElement('div');
  root.className = 'mx';
  root.dataset.lang = lang;
  root.style.setProperty('--accent', module?.color || 'var(--gold-400)');
  const code = tr('mo.code', { mod: modCode(module || { n: 0 }), n: String(lesson.n ?? 0).padStart(2, '0') });
  // Hors français, le titre de l'en-tête se coupe proprement (…) s'il est trop long
  const headTitle = lang === 'fr' ? esc(lesson.title) : `<span class="mx-tt">${esc(lesson.title)}</span>`;
  root.innerHTML = `
    <div class="mx-bg" aria-hidden="true">
      <i class="mx-glow"></i><i class="mx-glow mx-glow2"></i>
      <div class="mx-lines"><i></i><i></i><i></i><i></i></div>
      <i class="mx-grain" style="background-image:${GRAIN}"></i>
      <i class="mx-vig"></i>
    </div>
    <div class="mx-scenes"></div>
    ${
      chrome
        ? `<header class="mx-top"><span class="mx-logo">${markSVG()}<b>HOOKED</b><em>ACADEMY</em></span>
      <span class="mx-code">${esc(code)}<i></i>${headTitle}</span></header>
    <footer class="mx-bot"><span class="mx-tc">00:00</span><div class="mx-prog"><i></i>${steps.map((p) => `<b style="left:${((p.t / duration) * 100).toFixed(2)}%"></b>`).join('')}</div><span class="mx-tc mx-tot">${fmt(duration)}</span></footer>`
        : ''
    }
    <div class="mx-wipe" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;
  mount.appendChild(root);
  const AR = lang === 'ar';
  if (AR && chrome) markRTL(root.querySelector('.mx-top'));

  const sceneBox = root.querySelector('.mx-scenes');
  const tl = gsap.timeline({ paused: true });
  const ctx = { lesson, module: module || { n: 0 }, next };

  steps.forEach(({ i, sc, t, d }) => {
    const sec = document.createElement('section');
    sec.className = `sc sc-${sc.type}`;
    sec.dataset.i = i;
    sceneBox.appendChild(sec);
    const make = SC[sc.type] || S[sc.type] || S.big;
    let sub;
    try {
      sub = make(sec, sc, d, ctx);
      if (AR) markRTL(sec);
      if (lang !== 'fr') fitScene(sec);
    } catch (err) {
      console.error(`Scène ${i} (${sc.type}) de ${lesson.id}`, err);
      sec.innerHTML = `<p class="sc-err">${esc(tr('mo.err', { type: sc.type }))}</p>`;
      sub = gsap.timeline();
    }
    gsap.set(sec, { autoAlpha: 0 });
    tl.fromTo(sec, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, t);
    tl.add(sub, t);
    const last = i === steps.length - 1;
    if (!last) {
      tl.fromTo(
        sec,
        { scale: 1, filter: 'blur(0px)', autoAlpha: 1 },
        { scale: 0.96, filter: 'blur(10px)', autoAlpha: 0, duration: 0.42, ease: 'power2.in', immediateRender: false },
        t + d - 0.42,
      );
    }
    // Volet de barres dorées (le geste « coupe » de la marque) après le titre et avant la fin
    const next = steps[i + 1];
    if (next && (sc.type === 'title' || next.sc.type === 'outro' || next.sc.wipe)) {
      const bars = root.querySelectorAll('.mx-wipe i');
      tl.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.32, ease: 'power3.in', stagger: 0.05, immediateRender: false }, t + d - 0.42);
      tl.fromTo(bars, { scaleY: 1, transformOrigin: '50% 0%' }, { scaleY: 0, duration: 0.42, ease: 'power3.out', stagger: 0.05, immediateRender: false }, t + d + 0.02);
    }
  });

  // Habillage : barre de progression, minuteur, lumière qui dérive lentement
  const fill = root.querySelector('.mx-prog i');
  const tc = root.querySelector('.mx-tc');
  const glows = root.querySelectorAll('.mx-glow');
  const proxy = { t: 0 };
  tl.fromTo(
    proxy,
    { t: 0 },
    {
      t: duration,
      duration,
      ease: 'none',
      onUpdate: () => {
        const t = proxy.t;
        if (fill) fill.style.transform = `scaleX(${(t / duration).toFixed(4)})`;
        if (tc) tc.textContent = fmt(t);
        glows.forEach((g, k) => {
          const a = t * (k ? 0.13 : 0.09) + k * 2;
          g.style.transform = `translate(${(Math.cos(a) * 260).toFixed(1)}px, ${(Math.sin(a * 1.3) * 160).toFixed(1)}px)`;
        });
      },
    },
    0,
  );
  return { tl, duration, root, steps };
}
