// Accueil : le film d'introduction (survol région par région), puis les sections animées.
import { boot, ready, reduced, href, esc, fillIcons } from './site.js';
import { track } from './store.js';
import { emblem, seal, patternSvg, illustration, productVisual, icon, starPath } from './art.js';
import { productCard, bindAddButtons, sectorOf, regionOf, visibleProducts, productUrl, dms } from './ui.js';
import { createFilm, createFlatFilm, webglAvailable } from './film.js';
import { BOX, LAND, ALGERIA, WORLD } from './geo.js';

const ctx = await boot('home');
const { content: C, i18n, gsap, ST } = ctx;
const $ = (s, r = document) => r.querySelector(s);
const desktop = matchMedia('(min-width: 900px)');
const rtl = i18n.dir === 'rtl';

/* ============================================================== */
/* Film                                                            */
/* ============================================================== */
const regions = C.film
  .filter((f) => f.visible !== false)
  .map((f) => ({ ...f, name: regionOf(C, f.id)?.name || f.id, product: C.products.find((p) => p.id === f.product) }));

$('#intro-seal').innerHTML = emblem();
$('#loader-mark').innerHTML = `${emblem('loader__emblem')}`;

const steps = $('#film-steps');
steps.innerHTML = regions
  .map((r, i) => `<li><button type="button" data-i="${i}"><span class="st__bar"><i></i></span><span class="st__name">${esc(i18n.t(r.name))}</span></button></li>`)
  .join('');

const pinsEl = $('#film-pins');
pinsEl.innerHTML = regions
  .map((r, i) => `<div class="pin" data-i="${i}"><span class="pin__beam"></span><span class="pin__dot"></span><span class="pin__label">${esc(i18n.t(r.name))}</span></div>`)
  .join('');
const pins = [...pinsEl.children];

const stage = $('#film-stage');
const filmEl = $('#film');
const loader = $('#film-loader');
const pct = $('#loader-pct');
let film;
try {
  if (!webglAvailable()) throw new Error('webgl');
  film = await createFilm({ mount: stage, reduced, onProgress: (p) => (pct.textContent = Math.round(p * 100)) });
  filmEl.classList.add('film--3d');
} catch (err) {
  if (err?.message !== 'webgl') console.warn('Film 3D indisponible, carte plate', err);
  film = createFlatFilm({ mount: stage });
  filmEl.classList.add('film--flat');
}
loader.classList.add('is-done');

// Lecture de l'en-tête de données (coordonnées, altitude) et des repères
const hudLat = $('#hud-lat');
const hudLon = $('#hud-lon');
const hudAlt = $('#hud-alt');
let mode = 'opening';
let idx = -1;
film.onFrame(({ lon, lat, alt }) => {
  hudLat.textContent = dms(lat, 'N', 'S');
  hudLon.textContent = dms(lon, 'E', 'W');
  hudAlt.textContent = alt ? `${i18n.num(Math.round(alt / 1000))} km` : '—';
  for (let i = 0; i < pins.length; i++) {
    const r = regions[i];
    const p = film.project(r.lon, r.lat);
    const el = pins[i];
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    el.classList.toggle('is-off', !p.visible || p.y < 120 || (mode === 'region' && i !== idx));
  }
});

function setPins() {
  pins.forEach((el, i) => {
    el.classList.toggle('is-active', mode === 'region' && i === idx);
    el.classList.toggle('is-label', mode === 'overview' || mode === 'finale');
    el.classList.toggle('is-dim', mode === 'region' && i !== idx);
  });
  [...steps.querySelectorAll('button')].forEach((b, i) => {
    b.classList.toggle('is-active', i === idx && mode === 'region');
    b.classList.toggle('is-done', mode === 'finale' || (mode === 'region' && i < idx));
    b.setAttribute('aria-current', i === idx && mode === 'region' ? 'step' : 'false');
  });
}

const intro = $('#film-intro');
const chapter = $('#film-chapter');
const finder = $('#film-finder');

function chapterHtml(r, i) {
  const p = r.product;
  return `<div class="ch">
    <p class="ch__num"><span>${String(i + 1).padStart(2, '0')}</span> / ${String(regions.length).padStart(2, '0')}</p>
    <h2 class="ch__region">${esc(i18n.t(r.name))}</h2>
    <p class="ch__meta">${esc(i18n.t(r.area))} · <span dir="ltr">${dms(r.lat, 'N', 'S')} ${dms(r.lon, 'E', 'W')}</span></p>
    ${p ? `<p class="ch__product">${esc(i18n.t(p.name))}</p>` : ''}
    <p class="ch__line">${esc(i18n.t(r.line))}</p>
    ${p ? `<a class="ch__link" href="${productUrl(p)}">${esc(i18n.ui('film.seeProduct'))}${icon('arrow')}</a>` : ''}
  </div>`;
}
function finderHtml(r) {
  const p = r.product;
  const s = p && sectorOf(C, p.sector);
  const media = r.video
    ? `<video src="${esc(r.video)}" muted loop playsinline autoplay preload="metadata"></video>`
    : p
      ? productVisual(p, s, { cls: 'finder__pv' })
      : '';
  return `<div class="finder">
    <span class="finder__corner finder__corner--tl"></span><span class="finder__corner finder__corner--tr"></span>
    <span class="finder__corner finder__corner--bl"></span><span class="finder__corner finder__corner--br"></span>
    <p class="finder__label"><span class="hud__dot"></span>${esc(i18n.ui(r.video ? 'film.aerial' : 'product.illustration'))} · ${esc(i18n.t(r.name))}</p>
    <div class="finder__media">${media}</div>
  </div>`;
}
function finaleHtml() {
  return `<div class="ch ch--finale">
    <p class="kicker">${esc(i18n.ui('film.finaleKicker'))}</p>
    <h2 class="ch__region">${i18n.uiRich('film.finaleTitle')}</h2>
    <div class="film__ctas">
      <a class="btn btn--light" href="${href('produits.html')}">${esc(i18n.ui('home.ctaProducts'))}${icon('arrow')}</a>
      <a class="btn btn--ghost" href="${href('devis.html')}">${esc(i18n.ui('home.ctaQuote'))}</a>
    </div>
  </div>`;
}

function show(el, html) {
  el.innerHTML = html;
  el.classList.add('is-on');
  if (gsap && !reduced) {
    gsap.fromTo(el.querySelectorAll('.ch > *, .finder'), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07 });
  }
}
function hide(el) {
  el.classList.remove('is-on');
}

let token = 0;
let playing = !reduced;
let timer = null;
let visible = true;
const DWELL = 5600;
const playBtn = $('#film-play');
const setPlayBtn = () => {
  playBtn.innerHTML = icon(playing ? 'pause' : 'play');
  playBtn.setAttribute('aria-label', i18n.ui(playing ? 'film.pause' : 'film.play'));
  filmEl.classList.toggle('is-paused', !playing);
};

function schedule(ms) {
  clearTimeout(timer);
  if (!playing || !visible) return;
  const bar = idx >= 0 && mode === 'region' ? steps.querySelector(`button[data-i="${idx}"] .st__bar i`) : null;
  if (bar) {
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(0)';
    void bar.offsetWidth;
    bar.style.transition = `transform ${ms}ms linear`;
    bar.style.transform = 'scaleX(1)';
  }
  timer = setTimeout(next, ms);
}
function next() {
  if (mode === 'opening') go(0);
  else if (mode === 'region') go(idx + 1 < regions.length ? idx + 1 : 'finale');
  else go('opening');
}

async function go(target, { instant = false } = {}) {
  const my = ++token;
  clearTimeout(timer);
  steps.querySelectorAll('.st__bar i').forEach((b) => {
    b.style.transition = 'none';
    b.style.transform = '';
  });
  if (target === 'opening') {
    mode = 'opening';
    idx = -1;
    hide(chapter);
    hide(finder);
    setPins();
    filmEl.dataset.mode = 'opening';
    intro.classList.remove('is-hidden');
    await film.show('opening', null, { instant });
    if (my !== token) return;
    schedule(7200);
    return;
  }
  if (target === 'finale') {
    mode = 'finale';
    idx = regions.length;
    hide(chapter);
    hide(finder);
    filmEl.dataset.mode = 'finale';
    setPins();
    await film.show('overview', null, { instant });
    if (my !== token) return;
    show(chapter, finaleHtml());
    schedule(7000);
    return;
  }
  mode = 'region';
  idx = target;
  const r = regions[idx];
  intro.classList.add('is-hidden');
  hide(chapter);
  hide(finder);
  filmEl.dataset.mode = 'region';
  setPins();
  track('film', { chapter: r.id });
  await film.show('region', r, { instant });
  if (my !== token) return;
  show(chapter, chapterHtml(r, idx));
  show(finder, finderHtml(r));
  schedule(DWELL);
}

steps.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) go(Number(b.dataset.i));
});
playBtn.addEventListener('click', () => {
  playing = !playing;
  setPlayBtn();
  if (playing) next();
  else {
    clearTimeout(timer);
    steps.querySelectorAll('.st__bar i').forEach((b) => {
      const m = getComputedStyle(b).transform;
      b.style.transition = 'none';
      b.style.transform = m === 'none' ? '' : m;
    });
  }
});
setPlayBtn();

// Le film tourne seulement quand il est à l'écran
new IntersectionObserver(
  ([e]) => {
    visible = e.isIntersecting;
    film.setRunning(visible);
    if (!visible) clearTimeout(timer);
    else if (playing) schedule(mode === 'opening' ? 4000 : 2500);
  },
  { threshold: 0.15 }
).observe(filmEl);

await go('opening', { instant: true });
if (reduced) {
  playing = false;
  setPlayBtn();
}
if (gsap && ST && !reduced) {
  gsap.from('.film__intro > *', { y: 30, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.15 });
  gsap.to('.film__shade', { opacity: 1, ease: 'none', scrollTrigger: { trigger: filmEl, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(stage, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: filmEl, start: 'top top', end: 'bottom top', scrub: true } });
}

/* ============================================================== */
/* La maison : manifeste mot à mot, valeurs                        */
/* ============================================================== */
$('#values').innerHTML = (C.values || [])
  .map((v) => `<li data-reveal><svg viewBox="0 0 40 40" aria-hidden="true"><path d="${starPath(20, 20, 15)}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><h4>${esc(i18n.t(v.title))}</h4><p>${esc(i18n.t(v.text))}</p></li>`)
  .join('');
const manifesto = $('#manifesto');
if (gsap && ST && !reduced) {
  const words = manifesto.textContent.trim().split(/\s+/);
  manifesto.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
  gsap.fromTo(manifesto.querySelectorAll('.w'), { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true } });
}

/* ============================================================== */
/* Filières : défilement horizontal                                 */
/* ============================================================== */
const products = visibleProducts(C);
const sectors = C.sectors.filter((s) => s.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
$('#sectors-track').innerHTML = sectors
  .map((s, i) => {
    const list = products.filter((p) => p.sector === s.id);
    const arts = list.slice(0, 3);
    return `<article class="sector" style="--sc:${esc(s.color)}">
      ${patternSvg(s.pattern, 'sector__pattern')}
      <span class="sector__num">${String(i + 1).padStart(2, '0')}</span>
      <div class="sector__art">${arts.map((p, k) => `<span class="sector__ill sector__ill--${k}">${illustration(p.art)}</span>`).join('')}</div>
      <div class="sector__body">
        <p class="sector__count">${esc(i18n.ui('sectors.count', { n: i18n.num(list.length) }))}</p>
        <h3 class="sector__name">${esc(i18n.t(s.name))}</h3>
        <p class="sector__desc">${esc(i18n.t(s.desc))}</p>
        <p class="sector__items">${list.map((p) => esc(i18n.t(p.name))).join(' · ')}</p>
        <a class="link-arrow link-arrow--light" href="${href(`produits.html?sector=${s.id}`)}">${esc(i18n.ui('sectors.explore'))}${icon('arrow')}</a>
      </div>
    </article>`;
  })
  .join('');

if (gsap && ST && !reduced) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const track = $('#sectors-track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tw = gsap.to(track, {
      x: () => (rtl ? dist() : -dist()),
      ease: 'none',
      scrollTrigger: {
        trigger: '#sectors-pin',
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => ($('#sectors-bar').style.transform = `scaleX(${self.progress})`),
      },
    });
    track.querySelectorAll('.sector').forEach((el) => {
      gsap.from(el.querySelectorAll('.sector__ill'), {
        y: 80,
        rotate: (k) => [-8, 6, -4][k],
        ease: 'none',
        scrollTrigger: { trigger: el, containerAnimation: tw, start: rtl ? 'right 100%' : 'left 100%', end: rtl ? 'right 30%' : 'left 30%', scrub: true },
      });
    });
  });
}

/* ============================================================== */
/* Identité : le sceau sur six supports                            */
/* ============================================================== */
const mk = {
  bottle: () => `<svg viewBox="0 0 120 160"><path d="M50 10 h20 v16 c0 6 18 12 18 30 v86 c0 6 -4 9 -10 9 h-36 c-6 0 -10 -3 -10 -9 v-86 c0 -18 18 -24 18 -30z" class="mk__fill"/><rect x="40" y="76" width="40" height="48" rx="2" class="mk__label"/><g transform="translate(46 82) scale(.28)" class="mk__seal">${emblemInner()}</g><rect x="48" y="2" width="24" height="10" rx="2" class="mk__fill"/></svg>`,
  box: () => `<svg viewBox="0 0 160 120"><path d="M14 36 L80 18 L146 36 L80 54Z" class="mk__label"/><path d="M14 36 v58 L80 112 v-58Z" class="mk__fill"/><path d="M146 36 v58 L80 112 v-58Z" class="mk__fill mk__fill--2"/><g transform="translate(66 22) scale(.28) skewY(-14)" class="mk__seal">${emblemInner()}</g></svg>`,
  tag: () => `<svg viewBox="0 0 120 160"><path d="M60 6 C 40 6 40 28 54 34" class="mk__line"/><path d="M34 40 h52 l10 14 v92 h-72 v-92z" class="mk__label"/><circle cx="60" cy="52" r="4" class="mk__hole"/><g transform="translate(42 70) scale(.36)" class="mk__seal">${emblemInner()}</g><path d="M40 118 h40 M44 128 h32" class="mk__line"/></svg>`,
  bag: () => `<svg viewBox="0 0 140 160"><path d="M26 22 h88 c4 0 6 3 6 6 l6 116 c0 6 -4 10 -10 10 h-92 c-6 0 -10 -4 -10 -10 l6 -116 c0 -3 2 -6 6 -6z" class="mk__fill"/><path d="M28 30 h84" class="mk__line mk__line--dash"/><g transform="translate(48 56) scale(.44)" class="mk__seal">${emblemInner()}</g><text x="70" y="136" class="mk__txt">50 KG</text></svg>`,
  container: () => `<svg viewBox="0 0 220 110"><rect x="6" y="16" width="208" height="80" class="mk__fill"/>${Array.from({ length: 25 }, (_, k) => `<path d="M${16 + k * 8} 22 v68" class="mk__rib"/>`).join('')}<rect x="150" y="34" width="50" height="44" class="mk__label"/><g transform="translate(160 41) scale(.3)" class="mk__seal">${emblemInner()}</g><text x="18" y="52" class="mk__txt mk__txt--l">ALGERIAN</text><text x="18" y="68" class="mk__txt mk__txt--l">PRODUCT</text></svg>`,
  label: () => `<svg viewBox="0 0 160 110"><path d="M10 30 L22 40 L10 50 V30Z M150 30 L138 40 L150 50 V30Z" class="mk__fill mk__fill--2"/><rect x="22" y="22" width="116" height="66" class="mk__label"/><g transform="translate(34 33) scale(.44)" class="mk__seal">${emblemInner()}</g><text x="114" y="52" class="mk__txt">MADE IN</text><text x="114" y="66" class="mk__txt">ALGERIA</text></svg>`,
};
function emblemInner() {
  return `<circle cx="50" cy="50" r="46.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="${starPath(50, 50, 34)}" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/><circle cx="50" cy="50" r="7" fill="currentColor"/>`;
}
const mockList = [
  ['bottle', 'seal.bottle'],
  ['box', 'seal.box'],
  ['tag', 'seal.tag'],
  ['bag', 'seal.bag'],
  ['container', 'seal.container'],
  ['label', 'seal.label'],
];
$('#identity-seal').innerHTML = seal('identity__sealsvg');
$('#mockups').innerHTML = mockList.map(([k, t]) => `<li class="mockup mockup--${k}"><div class="mockup__art">${mk[k]()}</div><p>${esc(i18n.ui(t))}</p></li>`).join('');
if (gsap && ST && !reduced) {
  gsap.to('#identity-seal svg', { rotate: 120, ease: 'none', scrollTrigger: { trigger: '#identite', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.mockup', { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '#mockups', start: 'top 80%' } });
}

/* ============================================================== */
/* Sélection                                                        */
/* ============================================================== */
const featured = products.filter((p) => p.featured).slice(0, 8);
const featEl = $('#featured');
featEl.innerHTML = featured.map((p) => productCard(p, ctx)).join('');
bindAddButtons(featEl, ctx);
if (gsap && ST && !reduced) {
  gsap.from(featEl.children, { y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: featEl, start: 'top 85%' } });
}

/* ============================================================== */
/* Atlas : carte plate de l'Algérie et liste des régions            */
/* ============================================================== */
{
  const B = { w: -9.2, e: 12.4, s: 18.6, n: 37.6 };
  const KX = Math.cos((28 * Math.PI) / 180);
  const VW = 600;
  const VH = Math.round((VW * (B.n - B.s)) / ((B.e - B.w) * KX));
  const px = (lon) => ((lon - B.w) / (B.e - B.w)) * VW;
  const py = (lat) => ((B.n - lat) / (B.n - B.s)) * VH;
  const path = (rings) => rings.map((r) => r.reduce((d, v, k) => (k % 2 ? d : d + `${k ? 'L' : 'M'}${px(r[k]).toFixed(1)} ${py(r[k + 1]).toFixed(1)}`), '') + 'Z').join('');
  $('#atlas-map').innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(i18n.ui('atlas.kicker'))}">
    <defs><clipPath id="atlas-clip"><rect width="${VW}" height="${VH}"/></clipPath></defs>
    <g clip-path="url(#atlas-clip)"><path class="atlas__land" d="${path(LAND)}" fill-rule="evenodd"/></g>
    <path class="atlas__dz" d="${path(ALGERIA)}"/>
    ${regions
      .map(
        (r, i) => `<g class="atlas__pin" data-i="${i}" transform="translate(${px(r.lon).toFixed(1)} ${py(r.lat).toFixed(1)})">
        <circle r="13" class="atlas__halo"/><circle r="4.5"/><text x="${r.lon > 6 ? -10 : 10}" y="4" text-anchor="${r.lon > 6 ? 'end' : 'start'}">${i + 1}</text></g>`
      )
      .join('')}
  </svg>`;
  $('#atlas-list').innerHTML = regions
    .map(
      (r, i) => `<li><button type="button" data-i="${i}"><span class="atlas__n">${String(i + 1).padStart(2, '0')}</span><span class="atlas__name">${esc(i18n.t(r.name))}</span><span class="atlas__prod">${esc(i18n.t(r.product?.name))}</span></button></li>`
    )
    .join('');
  const hl = (i) => document.querySelectorAll('.atlas__pin, #atlas-list button').forEach((el) => el.classList.toggle('is-hl', Number(el.dataset.i) === i));
  document.querySelectorAll('#atlas-list button, .atlas__pin').forEach((el) => {
    el.addEventListener('mouseenter', () => hl(Number(el.dataset.i)));
    el.addEventListener('focus', () => hl(Number(el.dataset.i)));
    el.addEventListener('mouseleave', () => hl(-1));
  });
  const replay = (i) => {
    if (ctx.lenis) ctx.lenis.scrollTo(0, { duration: 1.6 });
    else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    playing = !reduced;
    setPlayBtn();
    setTimeout(() => go(i), 600);
  };
  $('#atlas-list').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) replay(Number(b.dataset.i));
  });
  $('#atlas-replay').addEventListener('click', () => replay(0));
  if (gsap && ST && !reduced) {
    const dzp = document.querySelector('.atlas__dz');
    const L = dzp.getTotalLength();
    gsap.fromTo(dzp, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L, fillOpacity: 0 }, { strokeDashoffset: 0, fillOpacity: 1, duration: 2.6, ease: 'power2.inOut', scrollTrigger: { trigger: '#atlas-map', start: 'top 75%' } });
    gsap.from('.atlas__pin', { scale: 0, transformOrigin: 'center', duration: 0.7, ease: 'back.out(2)', stagger: 0.08, delay: 0.8, scrollTrigger: { trigger: '#atlas-map', start: 'top 75%' } });
  }
}

/* ============================================================== */
/* Marchés : carte du monde en points et arcs depuis Alger          */
/* ============================================================== */
{
  const DEGR = Math.PI / 180;
  const ee = (lon, lat) => {
    const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
    const M = Math.sqrt(3) / 2;
    const l = Math.asin(M * Math.sin(lat * DEGR));
    const l2 = l * l;
    const l6 = l2 * l2 * l2;
    const x = (lon * DEGR * Math.cos(l)) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)));
    const y = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2));
    return [WORLD.tx + x * WORLD.scale, WORLD.ty - y * WORLD.scale];
  };
  const dots = (arr) => {
    let d = '';
    for (let k = 0; k < arr.length; k += 2) d += `M${arr[k]} ${arr[k + 1]}h0`;
    return d;
  };
  const markets = (C.markets || []).filter((m) => m.visible !== false);
  const [hx, hy] = ee(3.06, 36.75);
  const arcs = markets.map((m) => {
    const [x, y] = ee(m.lon, m.lat);
    const len = Math.hypot(x - hx, y - hy);
    const cx = (hx + x) / 2;
    const cy = (hy + y) / 2 - Math.min(130, len * 0.38);
    return { m, x, y, d: `M${hx.toFixed(1)} ${hy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}` };
  });
  const label = (m) => esc(i18n.t(m.city).split(' · ')[0]);
  $('#world').innerHTML = `<svg viewBox="0 0 ${WORLD.w} ${WORLD.h}" role="img" aria-label="${esc(i18n.ui('markets.kicker'))}">
    <path class="world__dots" d="${dots(WORLD.dots)}"/>
    <path class="world__dz" d="${dots(WORLD.dz)}"/>
    ${arcs.map((a) => `<path class="world__arc world__arc--${a.m.status}" d="${a.d}"/>`).join('')}
    ${arcs
      .map(
        (a) => `<g class="world__city world__city--${a.m.status}" transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})"><circle r="9" class="world__pulse"/><circle r="3.2"/>${a.m.status === 'priority' ? `<text x="${a.x < hx ? -8 : 8}" y="-8" text-anchor="${a.x < hx ? 'end' : 'start'}">${label(a.m)}</text>` : ''}</g>`
      )
      .join('')}
    <g class="world__hub" transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})"><circle r="14" class="world__pulse"/><circle r="5"/><text x="-9" y="20" text-anchor="end">${esc(i18n.ui('markets.hub'))}</text></g>
  </svg>`;
  const groups = ['priority', 'developing', 'soon'];
  $('#markets-lists').innerHTML = groups
    .map(
      (g) => `<div class="mlist mlist--${g}" data-reveal><h3><span class="mlist__dot"></span>${esc(i18n.ui('markets.' + g))}</h3><ul>${markets
        .filter((m) => m.status === g)
        .map((m) => `<li><strong>${esc(i18n.country(m.code))}</strong><span>${esc(i18n.t(m.city))}</span></li>`)
        .join('')}</ul></div>`
    )
    .join('');
  if (gsap && ST && !reduced) {
    const arcEls = document.querySelectorAll('.world__arc');
    arcEls.forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = `${L} ${L}`;
      p.style.strokeDashoffset = L;
    });
    gsap.to(arcEls, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.09, scrollTrigger: { trigger: '#world', start: 'top 70%' } });
    gsap.from('.world__city', { scale: 0, transformOrigin: 'center', duration: 0.6, ease: 'back.out(2)', stagger: 0.09, delay: 1.2, scrollTrigger: { trigger: '#world', start: 'top 70%' } });
  }
}

/* ============================================================== */
/* Pour qui : défilé des types d'acheteurs                          */
/* ============================================================== */
{
  const keys = ['importers', 'distributors', 'wholesalers', 'chains', 'food', 'retail', 'trading', 'partners'];
  const row = keys.map((k) => `<span>${esc(i18n.ui('audience.' + k))}</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="${starPath(20, 20, 13)}"/></svg>`).join('');
  $('#audience').innerHTML = `<div class="marquee__row"><div class="marquee__inner">${row}${row}</div></div><div class="marquee__row marquee__row--rev"><div class="marquee__inner">${row}${row}</div></div>`;
}

/* ============================================================== */
/* Services : les étapes de l'export                                */
/* ============================================================== */
{
  const list = $('#steps');
  list.insertAdjacentHTML(
    'beforeend',
    (C.services || [])
      .map(
        (s, i) => `<li class="step" data-reveal><span class="step__n">${String(i + 1).padStart(2, '0')}</span><span class="step__ico">${icon(s.icon)}</span><div><h3>${esc(i18n.t(s.title))}</h3><p>${esc(i18n.t(s.text))}</p></div></li>`
      )
      .join('')
  );
  if (gsap && ST && !reduced) {
    gsap.fromTo('#steps-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true } });
    list.querySelectorAll('.step').forEach((el) => ST.create({ trigger: el, start: 'top 65%', onEnter: () => el.classList.add('is-lit'), onLeaveBack: () => el.classList.remove('is-lit') }));
  } else list.querySelectorAll('.step').forEach((el) => el.classList.add('is-lit'));
}

/* ============================================================== */
/* Producteurs et appel final                                       */
/* ============================================================== */
$('#producers-pattern').innerHTML = patternSvg('star', 'producers__svg');
$('#final-seal').innerHTML = seal('final__sealsvg');
{
  const ct = C.contact || {};
  const wa = String(ct.whatsapp || '').replace(/\D/g, '');
  $('#final-ctas').innerHTML = `<a class="btn btn--light btn--lg" href="${href('devis.html')}">${esc(i18n.ui('nav.quote'))}${icon('arrow')}</a>
    ${ct.email ? `<a class="btn btn--ghost" href="mailto:${esc(ct.email)}">${icon('mail')}${esc(i18n.ui('cta.email'))}</a>` : ''}
    ${wa ? `<a class="btn btn--ghost" href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('wa')}${esc(i18n.ui('cta.whatsapp'))}</a>` : ''}`;
  document.querySelectorAll('#final-ctas a, .film__ctas a, .hdr__cta').forEach((a) => a.addEventListener('click', () => track('cta', { name: a.getAttribute('href') })));
}
if (gsap && ST && !reduced) {
  gsap.to('#final-seal svg', { rotate: -90, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom top', scrub: true } });
}

// Profondeur de lecture (pour les statistiques)
{
  const marks = new Set();
  addEventListener(
    'scroll',
    () => {
      const p = Math.round(((scrollY + innerHeight) / document.documentElement.scrollHeight) * 4) * 25;
      if (p >= 50 && !marks.has(p)) {
        marks.add(p);
        track('scroll', { depth: p });
      }
    },
    { passive: true }
  );
}

fillIcons();
ready(ctx);
