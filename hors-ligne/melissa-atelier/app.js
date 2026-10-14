// Melissa Atelier — animations et interactions du site.
// GSAP (ScrollTrigger, SplitText, Flip) + Lenis pour le défilement doux, un fond satin en WebGL.
// Sans animation (prefers-reduced-motion) ou si les librairies manquent, tout reste lisible et utilisable.
import { loadData, addRequest, slotsFor, iso, addDays, today, fmtDate, fmtHour, dayName, RDV_TYPES, SITE_TYPES, esc, uid } from './store.js';
import { createSilk } from './silk.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const PHONE = '213551698984';
const wa = (text) => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

const { gsap, ScrollTrigger, SplitText, Flip, Lenis } = window;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOTION = !REDUCE && !!(gsap && ScrollTrigger);
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
html.classList.toggle('motion', MOTION);
html.classList.toggle('is-static', !MOTION);
html.classList.add('booted');

const data = loadData();
let lenis = null;
let silk = null;
let menuOpen = false;
let paletteST = null;

// Les couleurs de la saison, tirées des photos de la boutique
const PALETTE = [
  { name: 'Sauge', hex: '#a8ae95', sw: '#c4c9b2', fg: '#2b1c17', img: 'img/sauge.webp', alt: 'Tunique longue sauge portée avec un voile', text: 'Un vert doux et poudré, pour les tuniques longues et les ensembles fluides.' },
  { name: 'Chocolat', hex: '#5b3a29', sw: '#7b5543', fg: '#f6efe7', img: 'img/marron-ceinture.webp', alt: 'Ensemble chocolat à manches évasées et ceinture', text: 'Profond et chaleureux : kimonos, vestes ceinturées et manches évasées.' },
  { name: 'Ivoire', hex: '#ebe1d2', sw: '#f8f2e8', fg: '#2b1c17', img: 'img/creme.webp', alt: 'Ensemble crème à boutons', text: "La couleur de l'atelier : boutons nacrés, lin clair et satin." },
  { name: 'Rose poudré', hex: '#e0bcb8', sw: '#eed3d0', fg: '#2b1c17', img: 'img/rose-ordi.webp', alt: 'Ensemble rose poudré, blouse et pantalon', text: 'Le rose du logo, en blouses amples et pantalons assortis.' },
  { name: 'Bleu ciel', hex: '#bccee1', sw: '#d6e2ee', fg: '#2b1c17', img: 'img/ciel.webp', alt: 'Ensemble bleu ciel, gilet et pantalon large', text: "Léger comme un matin d'été : gilet sans manches et pantalon large." },
  { name: 'Jaune beurre', hex: '#ead690', sw: '#f4e6b3', fg: '#2b1c17', img: 'img/jaune.webp', alt: 'Robes jaune beurre à bretelles', text: 'Lumineux sans en faire trop : robes à bretelles et tailles marquées.' },
  { name: 'Bleu nuit', hex: '#25304a', sw: '#36435f', fg: '#f6efe7', img: 'img/brodes.webp', alt: 'Ensembles brodés bleu nuit et chocolat', text: 'Brodé de fleurs claires, pour les soirs et les grandes occasions.' },
];

async function init() {
  renderPalette();
  renderCollection();
  setupBooking();
  setupMenu();
  setupQuick();
  setupAnchors();
  studioCredit();
  silk = setupSilk();

  if (MOTION) {
    gsap.registerPlugin(ScrollTrigger, ...[SplitText, Flip].filter(Boolean));
    ScrollTrigger.config({ ignoreMobileResize: true });
    setupLenis();
    prepareIntro();
    prepareRibbons();
    buildTape();
  }

  await loading();

  if (MOTION) {
    intro();
    setupScroll();
    if (FINE) {
      setupCursor();
      setupMagnetic();
      heroPointer();
    }
  } else {
    hideLoader();
    staticExtras();
  }
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */
function loading() {
  return new Promise((resolve) => {
    const imgs = $$('.hero img');
    let loaded = 0;
    const total = imgs.length + 1;
    const done = () => loaded++;
    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(done, done);

    if (MOTION) gsap.from('.loader__word > span', { yPercent: 110, duration: 1, stagger: 0.05, ease: 'expo.out' });
    const seam = $('#loader-seam');
    const pct = $('#pct');
    const MIN = MOTION ? 1600 : 0;
    const t0 = performance.now();
    let shown = 0;
    const step = (now) => {
      const elapsed = now - t0;
      const real = elapsed > 6000 ? 1 : loaded / total;
      const target = Math.min(real, MIN ? elapsed / MIN : 1);
      shown += (target - shown) * 0.12;
      if (target >= 1 && shown > 0.995) shown = 1;
      pct.textContent = Math.round(shown * 100);
      seam.setAttribute('d', `M2 6H${(2 + 316 * shown).toFixed(1)}`);
      if (shown >= 1) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function hideLoader() {
  const loader = $('#loader');
  loader.classList.add('is-done');
  loader.hidden = true;
  document.body.classList.remove('is-loading');
}

function prepareIntro() {
  gsap.set('.hero__word > span', { yPercent: 115, rotate: 7, transformOrigin: '0% 100%' });
  gsap.set('.hero__i svg', { scale: 0, transformOrigin: '50% 90%' });
  gsap.set('.frame', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.frame img', { scale: 1.4 });
  gsap.set(['.hero__kicker', '.hero__sub', '.hero__lead', '.hero__cta', '.badge', '.hero__scroll'], { autoAlpha: 0, y: 26 });
  gsap.set('.nav', { yPercent: -100, autoAlpha: 0 });
}

function intro() {
  const loader = $('#loader');
  silk?.start();
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .to('.loader__word > span', { yPercent: -115, duration: 0.7, stagger: 0.035, ease: 'power3.in' })
    .to('.loader__seam, .loader__meta', { autoAlpha: 0, duration: 0.4 }, '<')
    .to(loader, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, '-=0.1')
    .to('#loader-curve', { attr: { d: 'M0 0H100V0Q50 22 0 0Z' }, duration: 0.55, ease: 'power2.in' }, '<')
    .to('#loader-curve', { attr: { d: 'M0 0H100V0Q50 0 0 0Z' }, duration: 0.6, ease: 'power2.out' })
    .add(() => {
      hideLoader();
      lenis?.start();
    })
    .to('.hero__word > span', { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.075 }, 0.95)
    .to('.hero__i svg', { scale: 1, duration: 1, ease: 'elastic.out(1, 0.45)' }, 1.7)
    .to('.frame', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, stagger: 0.12, ease: 'expo.inOut' }, 1.05)
    .to('.frame img', { scale: 1, duration: 2, stagger: 0.12 }, 1.05)
    .to(['.hero__kicker', '.hero__sub', '.hero__lead', '.hero__cta'], { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09 }, 1.45)
    .to(['.badge', '.hero__scroll'], { autoAlpha: 1, y: 0, duration: 1 }, 2)
    .to('.nav', { yPercent: 0, autoAlpha: 1, duration: 1.1 }, 1.8);
}

/* ------------------------------------------------------------------ */
/* Défilement doux et ancres                                          */
/* ------------------------------------------------------------------ */
function setupLenis() {
  if (!Lenis) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

function scrollToTarget(target) {
  // force : la fiche modèle ou le menu ont pu mettre le défilement en pause juste avant
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: REDUCE ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
}

function setupAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    const target = hash === '#top' ? 0 : document.getElementById(hash.slice(1));
    if (target == null) return;
    e.preventDefault();
    if (menuOpen) closeMenu();
    if (!$('#quick').hidden) closeQuick();
    // Le menu ou la fiche relancent le défilement : on attend la fin de leur fermeture
    requestAnimationFrame(() => scrollToTarget(target));
    if (target !== 0) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Satin WebGL                                                         */
/* ------------------------------------------------------------------ */
function setupSilk() {
  const canvas = $('#silk');
  const s = createSilk(canvas, { colors: ['#d7bfb0', '#f4eadf', '#fffaf4'], scale: FINE ? 0.5 : 0.38 });
  if (!s) return null;
  s.render();
  canvas.classList.add('is-ready');
  if (!MOTION) {
    window.addEventListener('resize', () => s.render());
    return s;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) s.stop();
    else if (window.scrollY < window.innerHeight) s.start();
  });
  return s;
}

function heroPointer() {
  const frames = $$('.frame').map((f) => ({
    d: Number(f.dataset.depth) || 1,
    x: gsap.quickTo(f.firstElementChild, 'x', { duration: 1.4, ease: 'power3' }),
    y: gsap.quickTo(f.firstElementChild, 'y', { duration: 1.4, ease: 'power3' }),
  }));
  const wx = gsap.quickTo('.hero__word', 'x', { duration: 1.6, ease: 'power3' });
  const wy = gsap.quickTo('.hero__word', 'y', { duration: 1.6, ease: 'power3' });
  $('.hero').addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    frames.forEach((f) => {
      f.x(-nx * 34 * f.d);
      f.y(-ny * 30 * f.d);
    });
    wx(nx * 16);
    wy(ny * 10);
    silk?.setMouse(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  });
}

/* ------------------------------------------------------------------ */
/* Animations au défilement                                            */
/* ------------------------------------------------------------------ */
function setupScroll() {
  heroScroll();
  ribbons();
  manifeste();
  zoom();
  processH();
  palette();
  collectionMotion();
  gros();
  insta();
  reveals();
  footer();
  navState();
  seam();
  ScrollTrigger.refresh();
}

function heroScroll() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (s) => silk?.setScroll(s.progress),
        onToggle: (s) => (s.isActive ? silk?.start() : silk?.stop()),
      },
    })
    .to('.hero__content', { yPercent: 22, ease: 'none' }, 0)
    .to('.hero__title', { scale: 0.9, letterSpacing: '0.01em', ease: 'none' }, 0)
    .to('.hero__lead, .hero__cta, .hero__kicker', { autoAlpha: 0, ease: 'none', duration: 0.5 }, 0)
    .to('.frame', { y: (i, el) => -window.innerHeight * 0.42 * (Number(el.dataset.depth) || 1), rotate: (i) => [-10, 12, -8, 9][i] || 0, ease: 'none' }, 0)
    .to('.badge', { rotate: 120, y: -120, ease: 'none' }, 0)
    .to('.hero__veil', { opacity: 0, ease: 'none' }, 0);
}

function prepareRibbons() {
  $$('.ribbon__track').forEach((t) => {
    const one = t.innerHTML;
    t.innerHTML = one.repeat(4);
  });
}

function ribbons() {
  const tracks = $$('.ribbon__track').map((el) => ({ el, dir: Number(el.dataset.dir) || -1, x: 0, w: 0 }));
  const measure = () =>
    tracks.forEach((t) => {
      t.w = t.el.scrollWidth / 4;
      t.x = t.dir > 0 ? -t.w : 0;
    });
  measure();
  window.addEventListener('resize', measure);
  let vel = 0;
  let sign = 1;
  let skew = 0;
  let on = true;
  lenis?.on('scroll', (e) => {
    vel = e.velocity || 0;
    if (vel > 0.2) sign = 1;
    else if (vel < -0.2) sign = -1;
  });
  ScrollTrigger.create({ trigger: '.ribbons', start: 'top bottom', end: 'bottom top', onToggle: (s) => (on = s.isActive) });
  gsap.ticker.add((time, dt) => {
    vel *= 0.94;
    if (!on) return;
    const f = Math.min(3, dt / 16.67);
    const speed = (0.7 + Math.min(Math.abs(vel) * 0.45, 16)) * f;
    skew += (gsap.utils.clamp(-7, 7, -vel * 0.3) - skew) * 0.12;
    for (const t of tracks) {
      t.x += speed * t.dir * sign;
      if (t.x <= -t.w) t.x += t.w;
      if (t.x > 0) t.x -= t.w;
      t.el.style.transform = `translate3d(${t.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }
  });
}

// Trace un contour SVG (chemins pleins uniquement)
function drawIn(els, vars) {
  els.forEach((el) => {
    const len = el.getTotalLength ? el.getTotalLength() : 200;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  });
  return gsap.to(els, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.12, ...vars });
}

function manifeste() {
  const el = $('#manifeste-text');
  let words = [el];
  if (SplitText) words = SplitText.create(el, { type: 'words', wordsClass: 'w' }).words;
  gsap.fromTo(words, { opacity: 0.13 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  $$('.pill', el).forEach((p) => {
    gsap.fromTo(p, { width: 0 }, { width: '2.1em', ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 55%', scrub: true } });
    gsap.fromTo(p.firstElementChild, { scale: 1.8 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 45%', scrub: true } });
  });
  $$('.pillar').forEach((pl) => {
    const st = { trigger: pl, start: 'top 85%' };
    drawIn($$('.pillar__icon > *', pl), { scrollTrigger: st, duration: 1.8 });
    gsap.from($$('.pillar__num, .pillar__title, .pillar__ar, .pillar__text', pl), { autoAlpha: 0, y: 30, duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: st });
  });
}

function zoom() {
  const pin = $('.zoom__pin');
  const media = $('#zoom-media');
  const title = $('.zoom__title');
  const [l, r] = $$('.zoom__w', title);
  const gutter = () => parseFloat(getComputedStyle($('.wrap')).paddingLeft) || 16;
  const startClip = () => {
    const fs = parseFloat(getComputedStyle(title).fontSize);
    const W = media.offsetWidth;
    const H = media.offsetHeight;
    const pw = fs * 1.8;
    const ph = fs * 0.8;
    const x = Math.max(0, ((W - pw) / 2 / W) * 100);
    const y = Math.max(0, ((H - ph) / 2 / H) * 100);
    return `inset(${y.toFixed(2)}% ${x.toFixed(2)}% ${y.toFixed(2)}% ${x.toFixed(2)}% round ${(ph / 2).toFixed(1)}px)`;
  };
  gsap
    .timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      scrollTrigger: { trigger: '.zoom', start: 'top top', end: '+=170%', pin, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
    })
    .fromTo(media, { clipPath: startClip }, { clipPath: 'inset(0% 0% 0% 0% round 22px)' }, 0)
    .fromTo($('img', media), { scale: 1.7 }, { scale: 1 }, 0)
    .fromTo(l, { x: 0, y: 0 }, { x: () => gutter() - l.offsetLeft, y: () => $('.nav').offsetHeight + 4 - l.offsetTop }, 0)
    .fromTo(r, { x: 0, y: 0 }, { x: () => title.clientWidth - gutter() - (r.offsetLeft + r.offsetWidth), y: () => title.clientHeight - 18 - (r.offsetTop + r.offsetHeight) }, 0)
    .fromTo('.zoom__cap', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.35, ease: 'power2.out' }, 0.75)
    .to({}, { duration: 0.3 });
}

function buildTape() {
  const band = $('#tape-band');
  const CM = 40;
  const N = 160;
  band.style.width = `${N * CM}px`;
  let h = '';
  for (let i = 0; i <= N; i += 1) h += `<span style="left:${i * CM}px">${i}</span>`;
  band.innerHTML = h;
}

function processH() {
  const track = $('#process-track');
  const band = $('#tape-band');
  const cm = $('#tape-cm');
  const MAX = 150;
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tween = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.process',
      start: 'top top',
      end: () => `+=${Math.round(dist() * 1.15)}`,
      pin: '.process__pin',
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (s) => {
        band.style.transform = `translate3d(${(-s.progress * MAX * 40).toFixed(1)}px,0,0)`;
        cm.textContent = Math.round(s.progress * MAX);
      },
    },
  });
  const inTrack = (el, vars) => ({ trigger: el, containerAnimation: tween, ...vars });
  $$('.step', track).forEach((step) => {
    const img = $('.step__media img', step);
    if (img) gsap.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: inTrack(step, { start: 'left right', end: 'right left', scrub: true }) });
    gsap.fromTo($('.step__num', step), { xPercent: 70, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: 'none', scrollTrigger: inTrack(step, { start: 'left 100%', end: 'left 60%', scrub: true }) });
    gsap.fromTo($('.step__body', step), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'none', scrollTrigger: inTrack(step, { start: 'left 95%', end: 'left 65%', scrub: true }) });
  });
  // Le patron se dessine, les ciseaux suivent la ligne de coupe
  $$('.step--draw', track).forEach((step) => {
    const solid = $$('.draw > path:not(.draw__grid):not(.draw__dash), .draw > circle, .scissors > *', step);
    const st = inTrack(step, { start: 'left 90%', end: 'left 30%', scrub: true });
    drawIn(solid, { ease: 'none', duration: 1, stagger: 0.05, scrollTrigger: st });
    gsap.fromTo($$('.draw__dash, .draw text', step), { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: inTrack(step, { start: 'left 70%', end: 'left 40%', scrub: true }) });
    const cut = $('.draw--cut .draw__dash', step);
    const sc = $('.scissors', step);
    if (cut && sc) {
      const L = cut.getTotalLength();
      const o = { t: 0 };
      const place = () => {
        const a = cut.getPointAtLength(o.t * L);
        const b = cut.getPointAtLength(Math.min(L, o.t * L + 2));
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        sc.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      };
      place();
      gsap.to(o, { t: 0.98, ease: 'none', onUpdate: place, scrollTrigger: inTrack(step, { start: 'left 80%', end: 'right 20%', scrub: true }) });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */
let paletteIndex = -1;
function renderPalette() {
  $('#palette-names').innerHTML = PALETTE.map((c, i) => `<p class="palette__name"${i ? ' aria-hidden="true"' : ''}>${esc(c.name)}</p>`).join('');
  $('#palette-photos').innerHTML = PALETTE.map((c, i) => `<figure class="palette__photo${i ? '' : ' is-on'}"><img src="${c.img}" alt="${esc(c.alt)}" loading="lazy" width="554" height="660"></figure>`).join('');
  $('#palette-dots').innerHTML = PALETTE.map((c, i) => `<li${i ? '' : ' class="is-on"'}><button type="button" aria-label="${esc(c.name)}" tabindex="-1"></button></li>`).join('');
  $('#palette-dots').removeAttribute('aria-hidden');
  const pin = $('.palette__pin');
  pin.style.setProperty('--pc', PALETTE[0].hex);
  pin.style.setProperty('--pf', PALETTE[0].fg);
  $('#palette-swatch').style.setProperty('--sw', PALETTE[0].sw);
  setPaletteIndex(0, !MOTION);
  $('#palette-dots').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const i = [...li.parentNode.children].indexOf(li);
    if (MOTION && paletteST) scrollToTarget(paletteST.start + ((paletteST.end - paletteST.start) * i) / (PALETTE.length - 1));
    else setPaletteIndex(i, true);
  });
}

function setPaletteIndex(i, applyStatic = false) {
  if (i === paletteIndex && !applyStatic) return;
  const first = paletteIndex === -1;
  paletteIndex = i;
  const c = PALETTE[i];
  const desc = $('#palette-desc');
  desc.textContent = c.text;
  if (MOTION && !first) gsap.fromTo(desc, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
  $$('#palette-dots li').forEach((li, k) => li.classList.toggle('is-on', k === i));
  $$('.palette__name').forEach((n, k) => (k === i ? n.removeAttribute('aria-hidden') : n.setAttribute('aria-hidden', 'true')));
  if (applyStatic) {
    const pin = $('.palette__pin');
    pin.style.setProperty('--pc', c.hex);
    pin.style.setProperty('--pf', c.fg);
    $('#palette-swatch').style.setProperty('--sw', c.sw);
    $$('.palette__name').forEach((n, k) => (n.hidden = k !== i));
    $$('.palette__photo').forEach((p, k) => p.classList.toggle('is-on', k === i));
  }
}

function palette() {
  const pin = $('.palette__pin');
  const names = $$('.palette__name');
  const photos = $$('.palette__photo');
  const sw = $('#palette-swatch');
  const n = PALETTE.length;
  $$('#palette-dots button').forEach((b) => b.removeAttribute('tabindex'));
  gsap.set(names.slice(1), { yPercent: 110 });
  gsap.set(photos.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      trigger: '.palette',
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (n - 1) * 0.75)}`,
      pin,
      scrub: 0.6,
      anticipatePin: 1,
      snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.7 }, delay: 0.1, ease: 'power1.inOut' },
      onUpdate: (s) => setPaletteIndex(Math.round(s.progress * (n - 1))),
    },
  });
  paletteST = tl.scrollTrigger;
  for (let i = 1; i < n; i += 1) {
    const at = i - 1;
    const c = PALETTE[i];
    tl.to(pin, { '--pc': c.hex, '--pf': c.fg }, at)
      .to(sw, { '--sw': c.sw, rotate: i * 38, scale: i % 2 ? 0.9 : 1 }, at)
      .to(names[i - 1], { yPercent: -110 }, at)
      .fromTo(names[i], { yPercent: 110 }, { yPercent: 0 }, at)
      .fromTo(photos[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, at)
      .fromTo($('img', photos[i]), { scale: 1.4 }, { scale: 1 }, at)
      .to($('img', photos[i - 1]), { scale: 0.9, yPercent: -8 }, at);
  }
}

/* ------------------------------------------------------------------ */
/* Collection (réalisations mises en vitrine dans l'espace atelier)    */
/* ------------------------------------------------------------------ */
const showcase = () => (data.realisations || []).filter((r) => r.vitrine && r.img).slice(0, 12);
let colCount = 0;
let colTriggers = [];

function renderCollection() {
  const grid = $('#collection-grid');
  const mq = matchMedia('(min-width: 900px)');
  const draw = () => {
    colCount = mq.matches ? 3 : 2;
    const items = showcase();
    const cols = Array.from({ length: colCount }, () => []);
    items.forEach((it, i) => cols[i % colCount].push(card(it)));
    cols[(items.length) % colCount].push(`<a class="card card--cta" href="https://www.instagram.com/melissa_.mode/" target="_blank" rel="noopener"><span class="card__media card__media--cta"><span class="card__cta-text">Toutes les nouveautés<br><em>sur Instagram</em></span><svg aria-hidden="true"><use href="#ig"/></svg></span></a>`);
    grid.innerHTML = cols.map((c) => `<div class="collection__col">${c.join('')}</div>`).join('');
  };
  draw();
  mq.addEventListener('change', () => {
    draw();
    if (MOTION) {
      collectionMotion();
      ScrollTrigger.refresh();
    }
  });
}

function card(r) {
  const dots = (r.colors || []).slice(0, 5).map((c) => `<i style="--c:${esc(c.hex)}" title="${esc(c.name)}"></i>`).join('');
  return `<button class="card" type="button" data-id="${esc(r.id)}" data-cursor="view" aria-label="${esc(r.name)} — voir le modèle">
    <span class="card__media"><img src="${esc(r.img)}" alt="" loading="lazy">${r.collection ? `<span class="card__tag">${esc(r.collection)}</span>` : ''}</span>
    <span class="card__cap"><span><span class="card__name">${esc(r.name)}</span><span class="card__more">Demander ce modèle</span></span><span class="dots">${dots}</span></span>
  </button>`;
}

function collectionMotion() {
  colTriggers.forEach((t) => t.kill());
  colTriggers = [];
  const speeds = colCount === 3 ? [0.05, -0.09, 0.02] : [0, -0.06];
  $$('.collection__col').forEach((col, i) => {
    if (!speeds[i]) return;
    colTriggers.push(gsap.fromTo(col, { yPercent: speeds[i] * 100 }, { yPercent: -speeds[i] * 100, ease: 'none', scrollTrigger: { trigger: '#collection-grid', start: 'top bottom', end: 'bottom top', scrub: true } }).scrollTrigger);
  });
  $$('#collection-grid .card').forEach((c) => {
    const m = $('.card__media', c);
    const img = $('img', m);
    const cap = $('.card__cap', c);
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 92%', once: true } });
    tl.fromTo(m, { clipPath: 'inset(100% 0% 0% 0% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.4, ease: 'expo.inOut' });
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1.06, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, 0.1);
    if (cap) tl.fromTo(cap, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.6);
    colTriggers.push(tl.scrollTrigger);
  });
}

/* Fiche d'un modèle */
let quick = null;
function setupQuick() {
  const q = $('#quick');
  $('#collection-grid').addEventListener('click', (e) => {
    const c = e.target.closest('.card[data-id]');
    if (c) openQuick(c);
  });
  q.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') && !e.target.closest('a[href^="#"]')) closeQuick();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !q.hidden) closeQuick();
    if (e.key === 'Tab' && !q.hidden) trapFocus(e, $('.quick__card', q));
  });
}

function trapFocus(e, box) {
  const f = $$('a[href], button:not([disabled])', box);
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openQuick(cardEl) {
  const r = data.realisations.find((x) => x.id === cardEl.dataset.id);
  if (!r) return;
  const q = $('#quick');
  $('#quick-coll').textContent = r.collection || 'Melissa Mode';
  $('#quick-title').textContent = r.name;
  $('#quick-desc').textContent = r.desc || '';
  $('#quick-colors').innerHTML = (r.colors || []).map((c) => `<span><i style="--c:${esc(c.hex)}"></i>${esc(c.name)}</span>`).join('');
  $('#quick-wa').href = wa(`Bonjour Melissa, je suis intéressée par le modèle « ${r.name} ». Quelles tailles et couleurs sont disponibles ?`);
  const media = $('#quick-media');
  const img = $('img', cardEl);
  quick = { img, origin: img.parentNode, ret: cardEl };
  q.hidden = false;
  lenis?.stop();
  img.alt = r.name;
  if (MOTION && Flip) {
    const state = Flip.getState(img);
    gsap.set(img, { clearProps: 'transform' });
    q.classList.add('is-flipping');
    media.append(img);
    Flip.from(state, { duration: 0.9, ease: 'expo.inOut', absolute: true, onComplete: () => q.classList.remove('is-flipping') });
    gsap.fromTo('.quick__backdrop', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
    gsap.fromTo('.quick__card', { backgroundColor: 'rgba(251,247,242,0)' }, { backgroundColor: 'rgba(251,247,242,1)', duration: 0.5, delay: 0.25 });
    gsap.fromTo('.quick__body > *, .quick__close', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05, delay: 0.45, ease: 'expo.out' });
  } else {
    media.append(img);
  }
  $('.quick__close').focus({ preventScroll: true });
}

function closeQuick() {
  const q = $('#quick');
  if (q.hidden || !quick) return;
  const { img, origin, ret } = quick;
  quick = null;
  const finish = () => {
    origin.prepend(img);
    img.alt = '';
    q.hidden = true;
    if (MOTION) gsap.set(['.quick__backdrop', '.quick__card', '.quick__body > *', '.quick__close'], { clearProps: 'all' });
    lenis?.start();
    ret.focus({ preventScroll: true });
  };
  if (MOTION) {
    gsap.to('.quick__card', { autoAlpha: 0, y: 40, duration: 0.45, ease: 'power2.in' });
    gsap.to('.quick__backdrop', { autoAlpha: 0, duration: 0.5, delay: 0.1, onComplete: finish });
  } else finish();
}

/* ------------------------------------------------------------------ */
/* En gros, communauté, révélations                                    */
/* ------------------------------------------------------------------ */
function gros() {
  gsap.fromTo('.gros__outline span', { xPercent: 0 }, { xPercent: -38, ease: 'none', scrollTrigger: { trigger: '.gros', start: 'top bottom', end: 'bottom top', scrub: true } });
  const svg = $('.gros__route');
  const path = $('#route');
  const parcel = $('#parcel');
  const L = path.getTotalLength();
  const o = { t: 0 };
  const place = () => {
    const sx = svg.clientWidth / 1200 || 1;
    const sy = svg.clientHeight / 160 || 1;
    const a = path.getPointAtLength(o.t * L);
    const b = path.getPointAtLength(Math.min(L, o.t * L + 4));
    const ang = (Math.atan2((b.y - a.y) * sy, (b.x - a.x) * sx) * 180) / Math.PI;
    parcel.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) scale(${(1 / sx).toFixed(3)} ${(1 / sy).toFixed(3)}) rotate(${(ang * 0.4).toFixed(1)})`);
  };
  place();
  gsap.to(o, { t: 1, ease: 'none', onUpdate: place, scrollTrigger: { trigger: '.gros', start: 'top 70%', end: 'bottom 20%', scrub: 0.6, onRefresh: place } });
  gsap.from('.gros__list li', { autoAlpha: 0, x: 40, duration: 1.1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.gros__list', start: 'top 80%' } });
}

function insta() {
  $$('[data-count]').forEach((b) => {
    const to = parseFloat(b.dataset.count);
    const dec = Number(b.dataset.dec || 0);
    const o = { v: 0 };
    const out = () => (b.textContent = `${o.v.toFixed(dec).replace('.', ',')} k`);
    out();
    gsap.to(o, { v: to, duration: 2.4, ease: 'power3.out', onUpdate: out, scrollTrigger: { trigger: b, start: 'top 88%' } });
  });
  gsap.fromTo('#wall', { rotationX: 16, rotationZ: -13, yPercent: 8 }, { rotationX: 10, rotationZ: -6, yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.insta__wall', start: 'top bottom', end: 'bottom top', scrub: true } });
}

function reveals() {
  if (SplitText) {
    $$('.reveal-lines').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 86%', once: true } }),
      });
    });
  }
  $$('.kicker').forEach((k) => {
    if (k.closest('.process__pin, .palette__pin, .quick')) return;
    gsap.from(k.children, { scale: 0, rotate: -90, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: k, start: 'top 90%' } });
  });
  const fade = '.collection__lead, .gros__lead, .gros .btn, .rdv__lead, .book, .infos > div, .boutique__cta, .insta__stats .stat, .insta__note, .footer__line, .footer__links li';
  gsap.set(fade, { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch(fade, {
    start: 'top 92%',
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', overwrite: true }),
  });
  $$('.rdv__photo, .boutique__photo').forEach((f) => {
    gsap.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: f, start: 'top 85%' } });
    gsap.fromTo($('img', f), { yPercent: -10, scale: 1.2 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.insta__wall', { autoAlpha: 0, scale: 0.9, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.insta__wall', start: 'top 85%' } });
}

function footer() {
  gsap.fromTo('.footer__inner', { yPercent: -18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.fromTo('.footer__word > span', { yPercent: 110 }, { yPercent: 0, duration: 1.5, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: '.footer__word', start: 'top 98%' } });
  gsap.fromTo('.footer__i svg', { scale: 0 }, { scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)', delay: 0.6, scrollTrigger: { trigger: '.footer__word', start: 'top 98%' } });
}

function navState() {
  const nav = $('#nav');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (s) => {
      const y = s.scroll();
      nav.classList.toggle('is-scrolled', y > 30);
      nav.classList.toggle('is-hidden', s.direction === 1 && y > window.innerHeight * 0.7 && !menuOpen);
    },
  });
  $$('[data-link]').forEach((a) => {
    const sec = document.getElementById(a.getAttribute('href').slice(1));
    if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', toggleClass: { targets: a, className: 'is-active' } });
  });
}

function seam() {
  const fill = $('#seam-fill');
  const needle = $('#seam-needle');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (s) => {
      fill.style.transform = `scaleY(${s.progress.toFixed(4)})`;
      needle.style.top = `${(s.progress * 100).toFixed(2)}%`;
    },
  });
}

/* ------------------------------------------------------------------ */
/* Curseur et boutons aimantés                                         */
/* ------------------------------------------------------------------ */
function setupCursor() {
  html.classList.add('has-cursor');
  const c = $('#cursor');
  const dot = $('.cursor__dot', c);
  const ring = $('.cursor__ring', c);
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  c.classList.add('is-hidden');
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const t = e.target instanceof Element ? e.target : document.body;
      const view = t.closest('[data-cursor="view"]');
      c.classList.toggle('is-view', !!view);
      c.classList.toggle('is-link', !view && !!t.closest('a, button, label, .chip, .day, .slot'));
      c.classList.toggle('is-dark', !!t.closest('.gros, .footer, .ribbon--a'));
      c.classList.remove('is-hidden');
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => c.classList.add('is-hidden'));
}

function setupMagnetic() {
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Menu mobile                                                          */
/* ------------------------------------------------------------------ */
function setupMenu() {
  const btn = $('#burger');
  btn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
      btn.focus();
    }
  });
}

function openMenu() {
  const menu = $('#menu');
  menuOpen = true;
  menu.hidden = false;
  $('#burger').setAttribute('aria-expanded', 'true');
  $('#nav').classList.remove('is-hidden');
  lenis?.stop();
  if (MOTION) {
    gsap.set(menu, { autoAlpha: 1 });
    gsap.fromTo('.menu__bg i', { scaleY: 0 }, { scaleY: 1, duration: 0.8, stagger: 0.07, ease: 'expo.inOut' });
    gsap.fromTo('.menu__links a', { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.05, delay: 0.25, ease: 'expo.out' });
    gsap.fromTo('.menu__foot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, delay: 0.55 });
  }
  $('.menu__links a').focus({ preventScroll: true });
}

function closeMenu() {
  if (!menuOpen) return;
  const menu = $('#menu');
  menuOpen = false;
  $('#burger').setAttribute('aria-expanded', 'false');
  lenis?.start();
  if (MOTION) gsap.to(menu, { autoAlpha: 0, duration: 0.4, onComplete: () => (menu.hidden = true) });
  else menu.hidden = true;
}

/* ------------------------------------------------------------------ */
/* Prise de rendez-vous (arrive dans le planning de l'espace atelier)  */
/* ------------------------------------------------------------------ */
const bk = { type: 'essayage', date: '', time: '' };

function openDays() {
  const out = [];
  const t = today();
  for (let i = 0; out.length < 12 && i < 40; i += 1) {
    const d = addDays(t, i);
    if (data.settings.openDays.includes(d.getDay())) out.push(d);
  }
  return out;
}

function setupBooking() {
  const types = $('#book-types');
  const days = $('#book-days');
  const slots = $('#book-slots');
  types.innerHTML = SITE_TYPES.map((k) => `<button type="button" class="chip" data-type="${k}" aria-pressed="${k === bk.type}">${esc(RDV_TYPES[k].site)}</button>`).join('');
  types.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    bk.type = b.dataset.type;
    $$('.chip', types).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    summary();
  });
  days.addEventListener('click', (e) => {
    const b = e.target.closest('.day');
    if (!b || b.disabled) return;
    bk.date = b.dataset.date;
    bk.time = '';
    renderDays();
    renderSlots(true);
    summary();
  });
  slots.addEventListener('click', (e) => {
    const b = e.target.closest('.slot');
    if (!b || b.disabled) return;
    bk.time = b.dataset.time;
    $$('.slot', slots).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    summary();
  });
  const first = openDays().find((d) => slotsFor(data, iso(d)).some((s) => s.free));
  bk.date = first ? iso(first) : '';
  renderDays();
  renderSlots();
  summary();

  $('#book').addEventListener('submit', submitBooking);
  $('#book-again').addEventListener('click', () => {
    bk.time = '';
    $('#book-note').value = '';
    $('#book-done').hidden = true;
    renderDays();
    renderSlots();
    summary();
    $('#book-types .chip[aria-pressed="true"]')?.focus();
  });
  ['#book-name', '#book-phone'].forEach((s) => $(s).addEventListener('input', (e) => e.target.removeAttribute('aria-invalid')));
}

function renderDays() {
  $('#book-days').innerHTML = openDays()
    .map((d) => {
      const id = iso(d);
      const free = slotsFor(data, id).some((s) => s.free);
      const month = d.toLocaleDateString('fr-FR', { month: 'short' });
      return `<button type="button" class="day" data-date="${id}" aria-pressed="${bk.date === id}" ${free ? '' : 'disabled'} aria-label="${esc(fmtDate(d, { weekday: true }))}${free ? '' : ', complet'}"><small>${dayName(d, true)}</small><b>${d.getDate()}</b><small>${esc(month)}</small></button>`;
    })
    .join('');
}

function renderSlots(animate = false) {
  const box = $('#book-slots');
  const list = bk.date ? slotsFor(data, bk.date) : [];
  box.innerHTML = list.some((s) => s.free)
    ? list.map((s) => `<button type="button" class="slot" data-time="${s.time}" aria-pressed="${bk.time === s.time}" ${s.free ? '' : 'disabled aria-label="' + fmtHour(s.time) + ', déjà pris"'}>${fmtHour(s.time)}</button>`).join('')
    : '<p class="slots__empty">Plus de créneau libre ce jour-là : choisissez un autre jour.</p>';
  if (animate && MOTION) gsap.from($$('.slot', box), { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.03, ease: 'power2.out' });
}

function summary() {
  const t = RDV_TYPES[bk.type]?.site || '';
  const s = $('#book-sum');
  if (bk.date && bk.time) s.innerHTML = `<b>${esc(t)}</b><br>${esc(fmtDate(bk.date, { weekday: true }))} à ${esc(fmtHour(bk.time))}`;
  else if (bk.date) s.innerHTML = `<b>${esc(t)}</b><br>${esc(fmtDate(bk.date, { weekday: true }))} — choisissez l'heure.`;
  else s.textContent = 'Choisissez un jour et une heure.';
}

function submitBooking(e) {
  e.preventDefault();
  const err = $('#book-err');
  const name = $('#book-name');
  const phone = $('#book-phone');
  const digits = phone.value.replace(/\D/g, '');
  const okPhone = /^0[567]\d{8}$/.test(digits) || /^213[567]\d{8}$/.test(digits);
  let msg = '';
  if (!bk.date || !bk.time) msg = 'Choisissez un jour et une heure.';
  else if (name.value.trim().length < 2) {
    msg = 'Indiquez votre prénom et votre nom.';
    name.setAttribute('aria-invalid', 'true');
    name.focus();
  } else if (!okPhone) {
    msg = 'Indiquez un numéro de mobile valide (ex. 05 51 23 45 67).';
    phone.setAttribute('aria-invalid', 'true');
    phone.focus();
  }
  err.textContent = msg;
  if (msg) {
    if (MOTION) gsap.fromTo(err, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    return;
  }
  const label = RDV_TYPES[bk.type].site;
  const req = { id: uid('dm'), created: Date.now(), type: bk.type, date: bk.date, start: bk.time, name: name.value.trim(), phone: phone.value.trim(), note: $('#book-note').value.trim() };
  addRequest(req);
  const when = `${fmtDate(req.date, { weekday: true })} à ${fmtHour(req.start)}`;
  $('#book-done-text').textContent = `${label}, ${when}. L'atelier vous rappelle au ${req.phone} pour confirmer.`;
  $('#book-wa').href = wa(`Bonjour Melissa, je viens de demander un rendez-vous sur le site : ${label.toLowerCase()}, ${when}. ${req.name}.`);
  const done = $('#book-done');
  done.hidden = false;
  done.focus({ preventScroll: true });
  if (MOTION) {
    drawIn($$('.book__check path'), { duration: 0.9, delay: 0.25 });
    gsap.fromTo('.book__check circle', { rotate: -90, scale: 0.6, transformOrigin: '50% 50%' }, { rotate: 0, scale: 1, duration: 1, ease: 'expo.out' });
    gsap.from($$('h3, p, .book__done-actions', done), { autoAlpha: 0, y: 20, stagger: 0.07, duration: 0.8, delay: 0.2, ease: 'expo.out' });
  }
}

/* ------------------------------------------------------------------ */
/* Sans animation                                                       */
/* ------------------------------------------------------------------ */
function staticExtras() {
  $$('.palette__dots button').forEach((b) => b.removeAttribute('tabindex'));
  const cut = $('.draw--cut .draw__dash');
  const sc = $('.scissors');
  if (cut && sc) {
    const p = cut.getPointAtLength(cut.getTotalLength() * 0.55);
    sc.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(-30)`);
  }
}

/* Crédit du studio, lu dans ../demos.json */
function studioCredit() {
  fetch('../demos.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const s = d && d.studio;
      if (!s) return;
      const link = $('#studio-link');
      const w = $('#studio-wa');
      if (s.name) link.textContent = s.name;
      if (s.portfolio) {
        link.href = s.portfolio;
        link.target = '_blank';
        link.rel = 'noopener';
      }
      if (s.whatsapp) {
        const text = encodeURIComponent("Bonjour, j'ai vu la démo Melissa Atelier. Je voudrais un site comme celui-ci pour mon activité.");
        w.href = `https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}?text=${text}`;
      }
    })
    .catch(() => {});
}

init();
