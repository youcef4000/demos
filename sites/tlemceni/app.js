// Tlemceni — orchestration : chargement, basket démontée au scroll, langues et animations des sections.
import { DICT } from './i18n.js';

const { gsap, ScrollTrigger, SplitText, Lenis } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const mobile = coarse || innerWidth < 900;
const narrow = () => innerWidth < 900;
const rtl = () => document.documentElement.dir === 'rtl';

const PARTS = ['laces', 'tongue', 'heel', 'toe', 'badge', 'upper', 'insole', 'midsole', 'outsole'];
const TAU = Math.PI * 2;

// Vues de la caméra : chaussure (ry, rx, rz, lift) et caméra (azim, elev, dist, tx, ty, sx, sy).
const HERO = { ry: -0.55, rx: 0.04, rz: 0.05, lift: 0.5, azim: 0.22, elev: 0.2, dist: 6.6, tx: 0, ty: 0.45, sx: 0.15, sy: 0.05, shadow: 1, spin: 1 };
const V = (o) => ({ rx: 0, rz: 0, lift: 0.5, azim: 0.2, tx: 0, sx: 0.17, sy: 0, shadow: 0, spin: 0, ...o });

// Étapes de la vue éclatée. `ex` : pièces écartées (cumulatif), `focus` : pièces mises en avant.
const STEPS = [
  { id: 'laces', ex: { laces: 1 }, focus: ['laces'], anchor: 'laces', view: V({ ry: -0.45, elev: 0.4, dist: 8.2, ty: 0.95 }) },
  { id: 'tongue', ex: { tongue: 1 }, focus: ['tongue'], anchor: 'tongue', view: V({ ry: -0.8, elev: 0.34, dist: 8.0, ty: 0.85 }) },
  { id: 'renforts', ex: { heel: 1, toe: 1 }, focus: ['heel', 'toe'], anchor: 'heel', view: V({ ry: -0.14, elev: 0.18, dist: 9.0, ty: 0.7, mob: 1.42 }) },
  { id: 'tige', ex: { badge: 1 }, focus: ['upper', 'badge'], anchor: 'badge', view: V({ ry: -0.06, elev: 0.12, dist: 8.2, ty: 0.75, mob: 1.38 }) },
  { id: 'doublure', xray: 1, focus: ['upper'], anchor: 'lining', view: V({ ry: -0.9, elev: 0.52, dist: 8.8, ty: 0.6, mob: 1.2 }) },
  { id: 'semelle', ex: { insole: 1, midsole: 1, outsole: 0.68 }, focus: ['insole'], anchor: 'insole', view: V({ ry: -0.42, elev: 0.36, dist: 10.2, ty: 0.3 }) },
  { id: 'amorti', ex: { outsole: 1 }, focus: ['midsole'], anchor: 'midsole', view: V({ ry: -0.26, elev: 0.2, dist: 10.6, ty: 0.25 }) },
  { id: 'adherence', flip: 1, focus: ['outsole'], anchor: 'outsole', view: V({ ry: -0.12, elev: 0.1, dist: 10.8, ty: 0.2 }) },
  { id: 'ensemble', flip: 0.5, focus: PARTS, tags: 1, view: V({ ry: -0.5, elev: 0.26, dist: 11.6, ty: 0.3, sx: 0.1, sy: 0.06 }) },
  { id: 'final', reset: true, focus: PARTS, view: { ...HERO, ry: HERO.ry + TAU, sx: 0.17, sy: 0.02 } },
];
const LOCAL_LINING = { x: -0.95, y: 0.52, z: 0 };
const TAGS = [
  ['01', 'laces'], ['02', 'tongue'], ['03', 'heel'], ['03', 'toe'], ['04', 'badge'],
  ['05', 'upper', LOCAL_LINING], ['06', 'insole'], ['07', 'midsole'], ['08', 'outsole'],
];

const FR_EXTRA = { 'e.live': "L'expo a commencé : on vous attend !" };
const TITLES = {
  fr: document.title,
  ar: 'التلمساني — أحذية وأقمصة وعطور صُنعت في الجزائر',
  en: 'Tlemceni — Shoes, qamis and fragrances made in Algeria',
};

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

let lang = 'fr';
const FR = {};
const splits = [];
let lenis = null;
let scene = null;

main().catch((err) => {
  console.error(err);
  document.body.classList.remove('is-loading');
  $('#loader')?.remove();
});

async function main() {
  captureFR();
  const wanted = pickLang();
  if (wanted !== 'fr') setLang(wanted, { initial: true });

  const loaderEl = $('#loader');
  if (!gsap || !ScrollTrigger) {
    document.body.classList.remove('is-loading');
    loaderEl?.remove();
    bindLang();
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (!location.hash) scrollTo(0, 0);

  // --- chargement
  const pct = $('#pct'), bar = $('#loader-bar');
  const load = { v: 0 };
  const paint = () => {
    pct.textContent = Math.round(load.v);
    bar.style.transform = `scaleX(${load.v / 100})`;
  };
  const fake = gsap.to(load, { v: 88, duration: 2.8, ease: 'power2.out', onUpdate: paint });

  // --- défilement doux (ordinateur ; le tactile garde le défilement natif)
  if (!reduce && Lenis && !coarse) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  } else {
    // sans Lenis : on relaie aussi le scroll natif (évite un premier défilement ignoré pendant le chargement)
    addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });
  }

  // --- 3D : les polices doivent être prêtes (elles sont dessinées dans les textures)
  await Promise.race([Promise.all([document.fonts.load('800 40px Archivo', 'TLEMCENI 13'), document.fonts.load('400 40px "Aref Ruqaa"', 'التلمساني')]), wait(3500)]);
  try {
    const { createScene } = await import('./scene.js');
    scene = createScene($('#scene'), { mobile, reducedMotion: reduce });
    await Promise.race([scene.warm(), wait(6000)]);
  } catch (err) {
    console.warn('3D indisponible, images fixes à la place.', err);
    scene = null;
    document.documentElement.classList.add('no-webgl');
  }

  buildExplode();
  buildSections();
  buildNav();
  bindLinks();
  bindLang();
  studioCredit();

  await Promise.race([document.fonts ? document.fonts.ready : null, wait(2000)]);
  fake.kill();
  gsap.to(load, { v: 100, duration: 0.4, ease: 'power1.out', onUpdate: paint });
  gsap.to(loaderEl, {
    yPercent: -100, duration: 1.1, ease: 'expo.inOut', delay: 0.45,
    onComplete: () => loaderEl.remove(),
  });
  document.body.classList.remove('is-loading');
  lenis?.start();
  ScrollTrigger.refresh();
  if (location.hash && $(location.hash)) setTimeout(() => scrollToTarget($(location.hash), true), 900);
  intro();
}

/* ------------------------------------------------------------------ */
/* Langues                                                             */
/* ------------------------------------------------------------------ */
function captureFR() {
  $$('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    if (!(k in FR)) FR[k] = el.innerHTML;
  });
  Object.assign(FR, FR_EXTRA);
}
function pickLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && (q === 'fr' || DICT[q])) return q;
  try {
    const s = localStorage.getItem('tlemceni-lang');
    if (s && (s === 'fr' || DICT[s])) return s;
  } catch (e) { /* stockage indisponible */ }
  return 'fr';
}
function t(k) {
  return (lang === 'fr' ? FR[k] : DICT[lang][k] ?? FR[k]) ?? k;
}

function setLang(next, { initial = false } = {}) {
  if (next === lang && !initial) return;
  lang = next;
  const html = document.documentElement;
  html.lang = next;
  html.dir = next === 'ar' ? 'rtl' : 'ltr';
  if (next === 'ar' && !$('#font-ar')) {
    const l = document.createElement('link');
    l.id = 'font-ar';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300..700&display=swap';
    document.head.append(l);
  }
  revertSplits();
  $$('[data-i18n]').forEach((el) => {
    const v = t(el.dataset.i18n);
    if (v != null && el.innerHTML !== v) el.innerHTML = v;
  });
  $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === next)));
  document.title = TITLES[next] || TITLES.fr;
  try {
    localStorage.setItem('tlemceni-lang', next);
  } catch (e) { /* stockage indisponible */ }
  if (!initial) {
    const u = new URL(location.href);
    if (next === 'fr') u.searchParams.delete('lang');
    else u.searchParams.set('lang', next);
    history.replaceState(null, '', u);
    document.dispatchEvent(new CustomEvent('langchange'));
  }
}
function bindLang() {
  $$('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
}

/* ------------------------------------------------------------------ */
/* La basket, pièce par pièce : un timeline GSAP lié au scroll          */
/* ------------------------------------------------------------------ */
function buildExplode() {
  const section = $('#eclate');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const S = scene?.state, VW = scene?.view;
  const tagState = { a: 0 };
  const labels = { hero: 0 };
  const MOVE = 1.1, HOLD = 0.95;
  const dir = () => (rtl() ? -1 : 1);
  const viewFor = (v) => {
    const o = { ...v };
    delete o.mob;
    if (narrow()) {
      o.sx = 0;
      o.sy = v === HERO ? 0.12 : 0.17;
      if (!v.spin) o.dist = v.dist * (v.mob || 1.1); // pièces écartées : plus de recul sur écran étroit
    } else o.sx = (v.sx || 0) * dir();
    return o;
  };
  if (VW) Object.assign(VW, viewFor(HERO));

  // hero -> première étape
  tl.to('.hero', { autoAlpha: 0, y: -40, duration: 0.45, ease: 'power2.in' }, 0.15);
  tl.to('.scroll-hint', { autoAlpha: 0, duration: 0.2 }, 0.05);
  tl.to('.x__ar', { autoAlpha: 0, duration: 0.5 }, 0.15);
  tl.to('.x__word', { opacity: 0.45, duration: 0.6 }, 0.3);

  const fallback = !scene;
  const imgA = $('#fallback img[data-v="assembled"]'), imgB = $('#fallback img[data-v="exploded"]');
  if (fallback) tl.set(imgA, { autoAlpha: 1 }, 0);

  let t0 = 0.6;
  let prev = null;
  const ex = Object.fromEntries(PARTS.map((p) => [p, 0]));
  const viewTweens = [];
  for (const step of STEPS) {
    const el = $(`.step[data-step="${step.id}"]`);
    if (prev) tl.to(prev, { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power1.in' }, t0);
    if (step.reset) PARTS.forEach((p) => (ex[p] = 0));
    Object.assign(ex, step.ex || {});
    if (S) {
      const dim = Object.fromEntries(PARTS.map((p) => [p, step.focus.includes(p) ? 0 : 1]));
      tl.to(S.explode, { ...ex, duration: MOVE, ease: step.reset ? 'power3.inOut' : 'power2.inOut' }, t0);
      tl.to(S.dim, { ...dim, duration: MOVE * 0.6, ease: 'power1.inOut' }, t0 + (step.reset ? 0.3 : 0));
      tl.to(S, { xray: step.xray || 0, flip: step.flip || 0, duration: MOVE, ease: 'power2.inOut' }, t0);
      const vt = gsap.to(VW, { ...viewFor(step.view), duration: MOVE + 0.25, ease: 'power2.inOut' });
      viewTweens.push([vt, step.view]);
      tl.add(vt, t0);
    } else {
      const toB = !step.reset;
      tl.to(toB ? imgA : imgB, { autoAlpha: 0, duration: MOVE * 0.5 }, t0);
      tl.to(toB ? imgB : imgA, { autoAlpha: 1, duration: MOVE * 0.6 }, t0 + MOVE * 0.3);
    }
    tl.to(tagState, { a: step.tags || 0, duration: 0.4 }, t0 + (step.tags ? MOVE * 0.6 : 0));
    t0 += MOVE;
    labels[step.id] = t0;
    tl.set(el, { autoAlpha: 1, y: 0 }, t0 - 0.36);
    tl.fromTo(el.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.05, ease: 'power2.out', immediateRender: false }, t0 - 0.36);
    t0 += step.id === 'final' ? 0.6 : HOLD;
    prev = el;
  }
  tl.fromTo('.x__word span', { xPercent: 0 }, { xPercent: -22, duration: t0, ease: 'none' }, 0);
  tl.to({}, { duration: 0.2 }, t0);

  const unit = mobile ? 54 : 60; // hauteur de scroll (vh) par seconde de timeline
  section.style.height = `${Math.round(tl.duration() * unit + 100)}vh`;

  // les vues changent selon la largeur et le sens de lecture : on les recalcule
  const refreshViews = () => {
    for (const [vt, v] of viewTweens) {
      const o = viewFor(v);
      vt.vars.sx = o.sx;
      vt.vars.sy = o.sy;
      vt.vars.dist = o.dist;
      vt.invalidate();
    }
    tl.invalidate();
    const tt = tl.time();
    tl.time(0).time(tt);
    if (VW && tt < 0.6) Object.assign(VW, viewFor(HERO), { spin: VW.spin });
  };
  document.addEventListener('langchange', refreshViews);

  // progression, étape courante
  const barEl = $('#progress');
  const railBtns = $$('.rail button');
  const order = STEPS.map((s) => s.id);
  let current = '';
  const sync = () => {
    barEl.style.transform = `scaleX(${tl.progress().toFixed(4)})`;
    const time = tl.time();
    let id = 'hero';
    for (const s of order) if (time >= labels[s] - 0.4) id = s;
    if (id === 'ensemble') id = 'adherence';
    if (id !== current) {
      current = id;
      railBtns.forEach((b) => (b.dataset.go === id ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    }
  };
  tl.eventCallback('onUpdate', sync);

  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    animation: reduce ? undefined : tl,
    scrub: reduce ? false : mobile ? 0.6 : 1,
    onUpdate(self) {
      if (!reduce) return;
      // mouvement réduit : on passe d'une étape à l'autre sans mouvement continu
      const target = self.progress * tl.duration();
      let lt = 0;
      for (const s of order) if (target >= labels[s] - 0.5) lt = labels[s];
      if (Math.abs(tl.time() - lt) > 0.01) tl.time(lt);
    },
  });
  if (location.search.includes('debug')) window.tlemceni = { tl, labels, st, scene };

  railBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const y = st.start + (labels[b.dataset.go] / tl.duration()) * (st.end - st.start) + 2;
      if (lenis) lenis.scrollTo(y, { duration: 2.2 });
      else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }),
  );

  // coloris
  $$('.swatches button').forEach((b) =>
    b.addEventListener('click', () => {
      $$('.swatches button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      if (scene) {
        scene.setColorway(b.dataset.cw);
        needsRender = true;
      }
    }),
  );

  if (!scene) return;

  // --- repère : trait entre la carte et la pièce, pastilles numérotées sur la vue d'ensemble
  const svg = $('#lines'), line = $('#line'), dot = $('#dot'), ring = $('#ring');
  const tagsBox = $('#tags');
  const tagEls = TAGS.map(([n]) => {
    const s = document.createElement('span');
    s.textContent = n;
    tagsBox.append(s);
    return s;
  });
  const stepEls = STEPS.map((s) => [s, $(`.step[data-step="${s.id}"]`)]);
  const local = (o) => (o ? new scene.sneaker.root.position.constructor(o.x, o.y, o.z) : null);
  const liningLocal = local(LOCAL_LINING);
  function overlay() {
    let active = null, alpha = 0;
    for (const [s, el] of stepEls) {
      const a = parseFloat(getComputedStyle(el).opacity) || 0;
      if (a > alpha && s.anchor) {
        alpha = a;
        active = [s, el];
      }
    }
    if (active && alpha > 0.02) {
      const [s, el] = active;
      const p = scene.project(s.anchor === 'lining' ? 'upper' : s.anchor, s.anchor === 'lining' ? liningLocal : null);
      const title = el.querySelector('.step__t');
      const r = title.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      let d;
      if (narrow()) {
        const x0 = clamp(p.x, box.left + 28, box.right - 28), y0 = box.top - 6;
        d = `M${x0.toFixed(1)} ${y0.toFixed(1)} V${((p.y + y0) / 2).toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      } else {
        const x0 = rtl() ? r.left - 22 : r.right + 22, y0 = r.top + r.height / 2;
        const xm = x0 + (p.x - x0) * 0.45;
        d = `M${x0.toFixed(1)} ${y0.toFixed(1)} H${xm.toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }
      line.setAttribute('d', d);
      dot.setAttribute('cx', p.x.toFixed(1));
      dot.setAttribute('cy', p.y.toFixed(1));
      ring.setAttribute('cx', p.x.toFixed(1));
      ring.setAttribute('cy', p.y.toFixed(1));
      svg.style.opacity = alpha.toFixed(3);
    } else svg.style.opacity = 0;
    const ta = tagState.a;
    tagsBox.style.opacity = ta.toFixed(3);
    if (ta > 0.01) {
      TAGS.forEach(([, part, loc], i) => {
        const p = scene.project(part, loc ? liningLocal : null);
        tagEls[i].style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
        tagEls[i].style.opacity = 1;
      });
    }
  }

  // --- rendu : seulement quand la section est à l'écran et que quelque chose bouge
  let active = true;
  ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: (s) => (active = s.isActive) });
  let sig = '';
  let needsRender = true;
  gsap.ticker.add((time, dt) => {
    if (!active || document.hidden) return;
    const v = scene.view;
    const now = [tl.time().toFixed(4), v.ilift.toFixed(3), v.iry.toFixed(3), scene.pointer.x.toFixed(3), scene.pointer.y.toFixed(3)].join('|');
    const moving = v.spin > 0.01 && !reduce;
    if (now === sig && !moving && !needsRender) return;
    sig = now;
    needsRender = false;
    const t1 = performance.now();
    scene.render(Math.min(dt, 80) / 1000);
    overlay();
    scene.adapt(performance.now() - t1 + (dt > 40 ? dt - 16 : 0));
  });
  if (!coarse) {
    addEventListener('pointermove', (e) => scene.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
  }
  let w = innerWidth, h = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === w && Math.abs(innerHeight - h) < 160) return;
    const crossed = (w < 900) !== (innerWidth < 900);
    w = innerWidth;
    h = innerHeight;
    scene.resize();
    if (crossed) refreshViews();
    needsRender = true;
  });
  // rendu forcé après changement de langue (les cartes bougent)
  document.addEventListener('langchange', () => (needsRender = true));
}

function intro() {
  const heroKids = $$('.hero > *');
  if (reduce) {
    gsap.set(heroKids, { autoAlpha: 1 });
    return;
  }
  gsap.from(heroKids, { autoAlpha: 0, y: 30, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.75 });
  gsap.from('.x__word span', { yPercent: 40, autoAlpha: 0, duration: 1.4, ease: 'expo.out', delay: 0.55 });
  gsap.from('.x__glow', { autoAlpha: 0, duration: 1.4, delay: 0.4 });
  if (scene) {
    gsap.fromTo(scene.view, { ilift: 2.4, iry: -2.6 }, { ilift: 0, iry: 0, duration: 1.8, ease: 'power3.out', delay: 0.5 });
  }
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */
function makeSplits(animate) {
  $$('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
    splits.push(split);
    if (!animate || reduce) return;
    const tw = gsap.from(split.lines, {
      yPercent: 110, duration: 1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
    split._tw = tw;
  });
}
function revertSplits() {
  while (splits.length) {
    const s = splits.pop();
    s._tw?.scrollTrigger?.kill();
    s._tw?.kill();
    s.revert();
  }
}

function buildSections() {
  makeSplits(true);

  // apparitions
  if (!reduce) {
    gsap.set('[data-reveal]', { autoAlpha: 0, y: 34 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
    // le 13 monte et grandit
    gsap.fromTo('.manifeste__num span', { yPercent: 25, scale: 0.82 }, {
      yPercent: -8, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.manifeste', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    // étapes de fabrication : les dessins se tracent
    $$('.proc').forEach((li) => {
      const paths = $$('.d', li).filter((p) => !p.hasAttribute('stroke-dasharray'));
      paths.forEach((p) => {
        p.setAttribute('pathLength', '1');
        p.style.strokeDasharray = '1';
        p.style.strokeDashoffset = '1';
      });
      gsap.to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: li, start: 'top 85%', once: true } });
    });
  }

  buildUnivers();
  document.addEventListener('langchange', () => {
    makeSplits(false);
    buildUnivers();
    ScrollTrigger.refresh();
  });

  // chiffres
  $$('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
    const fmt = (v) => v.toFixed(dec).replace('.', lang === 'en' ? '.' : ',');
    if (reduce) return;
    const o = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(o, {
      v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
    document.addEventListener('langchange', () => (el.textContent = fmt(o.v || to)));
  });

  sizeGuide();
  countdown();
  form();
}

// Univers : défilement horizontal épinglé sur ordinateur, cartes empilées sur mobile.
let universST = null;
function buildUnivers() {
  if (universST) {
    universST.kill(true);
    universST = null;
    gsap.set('.univers__track', { clearProps: 'transform' });
  }
  if (narrow() || reduce) return;
  const track = $('.univers__track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const tw = gsap.to(track, { x: () => (rtl() ? dist() : -dist()), ease: 'none' });
  universST = ScrollTrigger.create({
    trigger: '.univers',
    start: 'top top',
    end: () => `+=${dist()}`,
    pin: '.univers__pin',
    scrub: 0.8,
    animation: tw,
    invalidateOnRefresh: true,
  });
}

function sizeGuide() {
  const range = $('#size-range'), cm = $('#size-cm'), eu = $('#size-eu'), g = $('#foot-g'), measure = $('#measure');
  const PX = 10.5, HEEL = 336;
  const ruler = $('.size__fig .ruler');
  let html = '';
  for (let c = 0; c <= 31; c++) {
    const y = HEEL - c * PX;
    const big = c % 5 === 0;
    html += `<line x1="${big ? 178 : 186}" x2="194" y1="${y}" y2="${y}"/>`;
    if (big) html += `<text x="172" y="${y + 3}" text-anchor="end">${c}</text>`;
  }
  ruler.innerHTML = html;
  const update = () => {
    const L = parseFloat(range.value);
    const size = Math.round(1.5 * (L + 1.5) - 0.25);
    cm.textContent = `${L.toFixed(1).replace('.', lang === 'en' ? '.' : ',')} ${lang === 'ar' ? 'سم' : 'cm'}`;
    eu.textContent = size;
    g.style.transform = `scale(${(L / 32).toFixed(3)})`;
    measure.setAttribute('d', `M200 ${HEEL} V ${(HEEL - L * PX).toFixed(1)}`);
  };
  range.addEventListener('input', update);
  document.addEventListener('langchange', update);
  update();
}

function countdown() {
  const start = Date.UTC(2026, 9, 7, 8, 0); // 7 octobre 2026, 9 h à Alger
  const end = Date.UTC(2026, 9, 10, 18, 0);
  const d = $('#cd-d'), h = $('#cd-h'), m = $('#cd-m'), box = $('#count'), done = $('#count-done');
  const tick = () => {
    const now = Date.now();
    if (now >= start) {
      box.hidden = true;
      done.hidden = false;
      done.dataset.i18n = now < end ? 'e.live' : 'e.done';
      done.innerHTML = t(done.dataset.i18n);
      return;
    }
    let s = Math.floor((start - now) / 1000);
    const dd = Math.floor(s / 86400);
    s -= dd * 86400;
    const hh = Math.floor(s / 3600);
    s -= hh * 3600;
    const mm = Math.floor(s / 60);
    d.textContent = String(dd).padStart(2, '0');
    h.textContent = String(hh).padStart(2, '0');
    m.textContent = String(mm).padStart(2, '0');
  };
  tick();
  setInterval(tick, 20000);
}

function form() {
  const f = $('#form'), ok = $('#form-ok');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = null;
    for (const name of ['nom', 'tel']) {
      const input = f.elements[name];
      const invalid = !input.value.trim() || (name === 'tel' && input.value.replace(/\D/g, '').length < 8);
      input.setAttribute('aria-invalid', String(invalid));
      if (invalid && !bad) bad = input;
    }
    if (bad) {
      bad.focus();
      return;
    }
    // démo : rien n'est envoyé
    ok.hidden = false;
    f.reset();
    if (!reduce) gsap.from(ok, { autoAlpha: 0, y: 10, duration: 0.5 });
  });
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
function buildNav() {
  const nav = $('#nav');
  let last = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 40);
      const down = y > last + 4, up = y < last - 4;
      if (down && y > innerHeight * 1.2) nav.classList.add('is-hidden');
      else if (up) nav.classList.remove('is-hidden');
      last = y;
    },
  });
  const links = $$('.nav__links a');
  links.forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (s) => (s.isActive ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')),
    });
  });
}

function scrollToTarget(target, instant = false) {
  const y = target.id === 'eclate' ? 0 : target;
  if (lenis) lenis.scrollTo(y, { offset: 0, duration: instant ? 0 : 1.6, immediate: instant });
  else if (typeof y === 'number') scrollTo({ top: y, behavior: instant || reduce ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: instant || reduce ? 'auto' : 'smooth' });
}
function bindLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    const target = hash === '#top' ? $('#eclate') : hash.length > 1 && $(hash);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
  });
}

function studioCredit() {
  fetch('../demos.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const s = d && d.studio;
      if (!s) return;
      const link = $('#studio-link'), wa = $('#studio-wa');
      if (s.name) link.textContent = s.name;
      if (s.portfolio) {
        link.href = s.portfolio;
        link.target = '_blank';
        link.rel = 'noopener';
      }
      if (s.whatsapp) {
        const text = encodeURIComponent("Bonjour, j'ai vu la démo Tlemceni. Je voudrais un site comme celui-ci pour ma marque.");
        wa.href = `https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}?text=${text}`;
      }
    })
    .catch(() => {});
}
