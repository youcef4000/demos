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
// Vidéos aériennes : un élément <video> par région, gardé en mémoire ; la suivante se charge à l'avance
const saveData = !!navigator.connection?.saveData;
const pool = new Map();
function videoFor(key, src) {
  if (!src || reduced || saveData) return null;
  let v = pool.get(key);
  if (!v) {
    v = document.createElement('video');
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-hidden', 'true');
    v.preload = 'auto';
    v.className = 'fm__video';
    v.src = src;
    v.addEventListener('playing', () => v.classList.add('is-on'));
    pool.set(key, v);
  }
  return v;
}
const preload = (i) => regions[i] && videoFor(regions[i].id, regions[i].video);

function mediaHtml({ name, lat, lon, photo, real, label, product }) {
  const s = product && sectorOf(C, product.sector);
  return `<div class="fm">
    <div class="fm__screen">
      ${photo ? `<img class="fm__poster" src="${esc(photo)}" alt="" decoding="async">` : ''}
      <span class="fm__corner fm__corner--tl"></span><span class="fm__corner fm__corner--tr"></span>
      <span class="fm__corner fm__corner--bl"></span><span class="fm__corner fm__corner--br"></span>
      <p class="fm__label"><span class="hud__dot"></span>REC · ${esc(label)}</p>
      <p class="fm__tc" dir="ltr">00:00:00:00</p>
      <p class="fm__place">${esc(name)}${lat != null ? ` · <span dir="ltr">${dms(lat, 'N', 'S')} ${dms(lon, 'E', 'W')}</span>` : ''}</p>
      <span class="fm__scan" aria-hidden="true"></span>
    </div>
    ${product ? `<a class="fm__product" href="${productUrl(product)}">
      <span class="fm__pimg">${productVisual(product, s, { cls: 'fm__pv' })}</span>
      <span class="fm__ptext"><small>${esc(i18n.ui('film.flagship'))}</small><b>${esc(i18n.t(product.name))}</b><em>${esc(i18n.ui('film.seeProduct'))}${icon('arrow')}</em></span></a>` : ''}
  </div>`;
}
let tcTimer = null;
function mountMedia(key, src, data) {
  finder.innerHTML = mediaHtml(data);
  const screen = finder.querySelector('.fm__screen');
  const v = videoFor(key, src);
  pool.forEach((x) => x !== v && x.pause());
  if (v) {
    screen.insertBefore(v, screen.querySelector('.fm__corner'));
    v.currentTime = 0;
    v.play().catch(() => {});
  }
  finder.classList.add('is-on');
  const tc = finder.querySelector('.fm__tc');
  const t0 = performance.now();
  clearInterval(tcTimer);
  tcTimer = setInterval(() => {
    const t = (performance.now() - t0) / 1000;
    const f = Math.floor((t % 1) * 25);
    tc.textContent = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  }, 80);
  if (gsap && !reduced) {
    gsap.fromTo(screen, { clipPath: 'inset(48% 0% 48% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' });
    gsap.fromTo(finder.querySelector('.fm__poster'), { scale: 1.25 }, { scale: 1.06, duration: 9, ease: 'none' });
    gsap.from(finder.querySelector('.fm__product'), { x: 60, y: 30, rotate: 6, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: 0.45 });
    gsap.from(finder.querySelectorAll('.fm__label, .fm__tc, .fm__place'), { autoAlpha: 0, y: 8, duration: 0.6, stagger: 0.08, delay: 0.7 });
  }
}
function finderFor(r) {
  mountMedia(r.id, r.video, {
    name: i18n.t(r.name),
    lat: r.lat,
    lon: r.lon,
    photo: r.photo,
    label: i18n.ui(r.realVideo ? 'film.realAerial' : 'film.illusAerial'),
    product: r.product,
  });
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
  if (el === finder) {
    clearInterval(tcTimer);
    pool.forEach((v) => v.pause());
  }
}

let token = 0;
let playing = !reduced;
let timer = null;
let visible = true;
const DWELL = 8200;
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
    preload(0);
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
    const fm = C.media?.finale;
    if (fm) mountMedia('finale', fm.video, { name: i18n.ui('markets.hub'), lat: 36.75, lon: 3.06, photo: fm.photo, label: i18n.ui('film.realAerial') });
    schedule(9000);
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
  finderFor(r);
  preload(idx + 1);
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
/* La maison : manifeste mot à mot, bandeau de paysages, piliers    */
/* ============================================================== */
const M = C.media || {};
const mediaAt = (path) => path.split('.').reduce((o, k) => o?.[k], M);
document.querySelectorAll('img[data-media]').forEach((img) => {
  const src = mediaAt(img.dataset.media);
  if (src) {
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
  } else img.closest('figure')?.remove();
});
const manifesto = $('#manifesto');
if (gsap && ST && !reduced) {
  const words = manifesto.textContent.trim().split(/\s+/);
  manifesto.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
  gsap.fromTo(manifesto.querySelectorAll('.w'), { opacity: 0.12, y: 6 }, { opacity: 1, y: 0, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true } });
}
{
  const strip = M.strip || [];
  const names = ['Biskra', 'Constantine', 'Béjaïa', 'Kabylie', 'Ghardaïa', 'Tlemcen', 'Sahara', 'Atlas', 'Chetma', 'Aurès'];
  const tile = (src, i, big) => `<figure class="strip__tile${big ? '' : ' strip__tile--sm'}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"><figcaption>${esc(names[i] || '')}</figcaption></figure>`;
  const rows = document.querySelectorAll('.strip__row');
  rows[0].innerHTML = [...strip, ...strip].map((s, i) => tile(s, i % strip.length, true)).join('');
  const rev = [...strip].reverse();
  rows[1].innerHTML = [...rev, ...rev].map((s, i) => tile(s, strip.length - 1 - (i % strip.length), false)).join('');
  if (gsap && ST && !reduced) {
    rows.forEach((row) => {
      const dir = Number(row.dataset.dir) * (rtl ? -1 : 1);
      gsap.fromTo(row, { xPercent: dir > 0 ? 0 : -30 }, { xPercent: dir > 0 ? -30 : 0, ease: 'none', scrollTrigger: { trigger: '#strip', start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
    });
    // inclinaison selon la vitesse de défilement
    const skew = gsap.quickTo('.strip__row', 'skewX', { duration: 0.5, ease: 'power3' });
    ST.create({ trigger: '#strip', start: 'top bottom', end: 'bottom top', onUpdate: (self) => skew(Math.max(-6, Math.min(6, self.getVelocity() / -400))) });
  }
}
if (gsap && ST && !reduced) {
  document.querySelectorAll('[data-img-reveal]').forEach((fig) => {
    const img = fig.querySelector('img');
    gsap.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 85%' } });
    gsap.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 85%' } });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.pillar > :not(figure)', { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.pillars', start: 'top 70%' } });
}

/* ============================================================== */
/* Valeurs : cartes photo qui s'ouvrent au survol                  */
/* ============================================================== */
{
  const vals = C.values || [];
  const imgs = M.values || [];
  $('#values').innerHTML = vals
    .map(
      (v, i) => `<li class="vcard${i === 0 ? ' is-open' : ''}" tabindex="0">
      ${imgs[i] ? `<img class="vcard__img" src="${esc(imgs[i])}" alt="" loading="lazy" decoding="async">` : ''}
      <span class="vcard__n">${String(i + 1).padStart(2, '0')}</span>
      <svg class="vcard__star" viewBox="0 0 40 40" aria-hidden="true"><path d="${starPath(20, 20, 15)}"/></svg>
      <div class="vcard__body"><h3>${esc(i18n.t(v.title))}</h3><p>${esc(i18n.t(v.text))}</p></div>
    </li>`
    )
    .join('');
  const cards = [...document.querySelectorAll('.vcard')];
  const open = (c) => cards.forEach((x) => x.classList.toggle('is-open', x === c));
  cards.forEach((c) => {
    c.addEventListener('mouseenter', () => open(c));
    c.addEventListener('focus', () => open(c));
    c.addEventListener('click', () => open(c));
  });
  if (gsap && ST && !reduced) {
    gsap.from(cards, { y: 120, autoAlpha: 0, rotate: (i) => [-3, 2, -2, 3][i % 4], duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '#values', start: 'top 80%' } });
    // les cartes s'ouvrent l'une après l'autre au défilement (téléphone)
    if (!desktop.matches) cards.forEach((c) => ST.create({ trigger: c, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => s.isActive && open(c) }));
  }
}

/* ============================================================== */
/* Filières : panneaux photo en défilement horizontal              */
/* ============================================================== */
const products = visibleProducts(C);
const sectors = C.sectors.filter((s) => s.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
$('#sectors-track').innerHTML = sectors
  .map((s, i) => {
    const list = products.filter((p) => p.sector === s.id);
    const thumbs = list.filter((p) => p.image).slice(0, 3);
    return `<article class="sector" style="--sc:${esc(s.color)}">
      <div class="sector__bg">${s.photo ? `<img src="${esc(s.photo)}" alt="" loading="lazy" decoding="async">` : ''}</div>
      ${patternSvg(s.pattern, 'sector__pattern')}
      <span class="sector__num"><b>${String(i + 1).padStart(2, '0')}</b><i>/ ${String(sectors.length).padStart(2, '0')}</i></span>
      <div class="sector__thumbs">${thumbs.map((p, k) => `<a class="sector__thumb sector__thumb--${k}" href="${productUrl(p)}"><img src="${esc(p.image)}" alt="${esc(i18n.t(p.name))}" loading="lazy" decoding="async"><span>${esc(i18n.t(p.name))}</span></a>`).join('')}</div>
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
      const ca = { trigger: el, containerAnimation: tw, scrub: true };
      const enter = rtl ? { start: 'right 100%', end: 'left 0%' } : { start: 'left 100%', end: 'right 0%' };
      gsap.fromTo(el.querySelector('.sector__bg img'), { scale: 1.3, xPercent: rtl ? 8 : -8 }, { scale: 1.05, xPercent: rtl ? -8 : 8, ease: 'none', scrollTrigger: { ...ca, ...enter } });
      el.querySelectorAll('.sector__thumb').forEach((t, k) => gsap.fromTo(t, { y: 140 + k * 60, rotate: [-10, 8, -5][k] }, { y: -40 - k * 30, rotate: [-3, 4, -2][k], ease: 'none', scrollTrigger: { ...ca, ...enter } }));
      gsap.from(el.querySelectorAll('.sector__body > *'), { x: rtl ? -60 : 60, autoAlpha: 0, stagger: 0.06, ease: 'none', scrollTrigger: { ...ca, start: rtl ? 'right 90%' : 'left 90%', end: rtl ? 'right 45%' : 'left 45%' } });
    });
  });
  mm.add('(max-width: 899px)', () => {
    document.querySelectorAll('.sector__bg img').forEach((img) => gsap.fromTo(img, { yPercent: -8, scale: 1.2 }, { yPercent: 8, scale: 1.05, ease: 'none', scrollTrigger: { trigger: img.closest('.sector'), start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
}

/* ============================================================== */
/* Identité : le sceau se pose sur de vrais produits               */
/* ============================================================== */
const mockList = ['seal.bottle', 'seal.box', 'seal.tag', 'seal.bag', 'seal.container', 'seal.label'];
{
  const photos = M.stamps || [];
  const steps = mockList.slice(0, photos.length);
  $('#supports').innerHTML = steps.map((k, i) => `<li data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(i18n.ui(k))}</li>`).join('');
  $('#stamp-frames').innerHTML = photos.map((src, i) => `<figure class="stamp__frame" data-i="${i}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></figure>`).join('');
  $('#stamp-seal').innerHTML = seal('stamp__svg');
  const frames = [...document.querySelectorAll('.stamp__frame')];
  const items = [...document.querySelectorAll('#supports li')];
  const tag = $('#stamp-tag');
  const count = $('#stamp-count');
  let cur = -1;
  function setStep(i, animate = true) {
    if (i === cur) return;
    const prev = cur;
    cur = i;
    items.forEach((li, k) => li.classList.toggle('is-on', k === i));
    tag.innerHTML = `<span>${esc(i18n.ui('seal.stamp'))}</span> ${esc(i18n.ui(steps[i]))}`;
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
    if (!gsap || reduced || !animate) return;
    const f = frames[i];
    gsap.fromTo(f, { clipPath: i > prev ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' });
    gsap.fromTo(f.querySelector('img'), { scale: 1.3 }, { scale: 1.05, duration: 1.6, ease: 'expo.out' });
    const tl = gsap.timeline();
    tl.fromTo('#stamp-seal', { scale: 2.8, rotate: -40, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.55, ease: 'power4.in', delay: 0.35 })
      .fromTo('#stamp', { x: 0, y: 0 }, { x: 4, y: -3, duration: 0.05, repeat: 3, yoyo: true, ease: 'none' })
      .fromTo('#stamp-ring', { scale: 0.4, autoAlpha: 0.9 }, { scale: 1.8, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, '<')
      .from(tag, { y: 16, autoAlpha: 0, duration: 0.5, ease: 'expo.out' }, '<');
  }
  setStep(0, false);
  if (gsap && ST && !reduced) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      ST.create({
        trigger: '#identity-pin',
        start: 'top top',
        end: () => `+=${innerHeight * steps.length * 0.6}`,
        pin: true,
        onUpdate: (self) => setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
      });
    });
    mm.add('(max-width: 899px)', () => {
      ST.create({ trigger: '#stamp', start: 'top 70%', end: () => `+=${innerHeight * 2.2}`, onUpdate: (self) => setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))) });
    });
    gsap.to('#stamp-seal svg', { rotate: 360, duration: 40, repeat: -1, ease: 'none' });
  } else {
    let k = 0;
    if (!reduced) setInterval(() => setStep((k = (k + 1) % steps.length)), 2600);
  }
  items.forEach((li) => li.addEventListener('click', () => setStep(Number(li.dataset.i))));
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
  const peek = document.createElement('div');
  peek.className = 'atlas__peek';
  peek.innerHTML = '<img alt="">';
  document.body.appendChild(peek);
  const hl = (i) => {
    document.querySelectorAll('.atlas__pin, #atlas-list button').forEach((el) => el.classList.toggle('is-hl', Number(el.dataset.i) === i));
    const r = regions[i];
    if (r?.photo && matchMedia('(pointer: fine)').matches) {
      const img = peek.firstChild;
      if (img.getAttribute('src') !== r.photo) img.src = r.photo;
      peek.classList.add('is-on');
    } else peek.classList.remove('is-on');
  };
  addEventListener('pointermove', (e) => (peek.style.left = `${e.clientX}px`, peek.style.top = `${e.clientY}px`), { passive: true });
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
