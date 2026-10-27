// Accueil : le film d'introduction (vidéos aériennes région par région), puis les sections animées.
import { boot, ready, reduced, href, esc, fillIcons } from './site.js';
import { track, mediaUrl, pexelsVideoId } from './store.js';
import { emblem, seal, patternSvg, illustration, productVisual, icon, starPath } from './art.js';
import { productCard, bindAddButtons, sectorOf, regionOf, visibleProducts, productUrl, dms } from './ui.js';
import { BOX, LAND, ALGERIA, WORLD } from './geo.js';

const PAGE = document.body.dataset.page || 'home';
const ctx = await boot(PAGE);
const { content: C, i18n, gsap, ST } = ctx;
const $ = (s, r = document) => r.querySelector(s);
const desktop = matchMedia('(min-width: 900px)');
const rtl = i18n.dir === 'rtl';

const M = C.media || {};
const mediaAt = (path) => path.split('.').reduce((o, k) => o?.[k], M);
const products = visibleProducts(C);
const sectors = C.sectors.filter((s) => s.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
let replayFilm = null;
// Vidéos : versions réencodées servies par le site (video/manifest.json), sinon le lien d'origine
let clips = {};
try {
  clips = (await (await fetch('./video/manifest.json', { cache: 'no-cache' })).json()) || {};
} catch {}
const clipIndex = new Map(Object.entries(clips).map(([k, m]) => [pexelsVideoId(k) || k, m]));
// Écran paysage (ordinateur, tablette couchée) : 1080p ; téléphone en portrait : 720p
const wantHD = innerWidth >= innerHeight && innerWidth * Math.min(devicePixelRatio || 1, 2) > 1000 && !navigator.connection?.saveData;
function clip(url) {
  const raw = mediaUrl(url, 'video');
  if (!raw) return null;
  const m = clips[raw] || clipIndex.get(pexelsVideoId(raw) || raw);
  return m ? { src: `./video/${wantHD ? m.hd : m.sd}`, poster: `./video/${m.poster}` } : { src: raw, poster: '' };
}
document.querySelectorAll('img[data-media]').forEach((img) => {
  const src = mediaAt(img.dataset.media);
  if (src) {
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
  } else img.closest('figure')?.remove();
});
// En-tête des pages intérieures : photo qui se dévoile, titre ligne à ligne
if ($('.phero') && gsap && !reduced) {
  gsap.fromTo('.phero__img', { scale: 1.25 }, { scale: 1.02, duration: 2.4, ease: 'expo.out' });
  gsap.from('.phero__inner > *', { y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: 0.15 });
  if (ST) gsap.to('.phero__img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
}
const regions = C.film
  .filter((f) => f.visible !== false)
  .map((f) => ({ ...f, name: regionOf(C, f.id)?.name || f.id, product: C.products.find((p) => p.id === f.product) }));


/* ============================================================== */
/* Film                                                            */
/* ============================================================== */
if ($('#film')) {
$('#intro-seal').innerHTML = emblem();

const steps = $('#film-steps');
steps.innerHTML = regions
  .map((r, i) => `<li><button type="button" data-i="${i}"><span class="st__bar"><i></i></span><span class="st__name">${esc(i18n.t(r.name))}</span></button></li>`)
  .join('');

const stage = $('#film-stage');
const filmEl = $('#film');

// Le film : des plans vidéo plein écran en fondu enchaîné. Chaque plan attend que sa vidéo puisse
// jouer sans à-coup ; la vidéo suivante se charge pendant que la précédente est à l'écran.
const saveData = !!navigator.connection?.saveData;
const pool = new Map();
function videoFor(key, url) {
  if (reduced || saveData) return null;
  let v = pool.get(key);
  if (v) return v;
  const c = clip(url);
  if (!c) return null;
  v = document.createElement('video');
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.setAttribute('aria-hidden', 'true');
  v.preload = 'auto';
  v.className = 'cine__video';
  if (c.poster) v.poster = c.poster; // première image de la même vidéo : aucun changement visible
  v.src = c.src;
  v.addEventListener('playing', () => v.classList.add('is-on'));
  v.addEventListener('error', () => v.classList.add('is-broken'));
  pool.set(key, v);
  return v;
}
// Prête à jouer sans coupure (ou délai dépassé : on montre ce qu'on a)
const canPlay = (v, ms) =>
  new Promise((resolve) => {
    if (v.readyState >= 4) return resolve(true);
    if (v.error || v.classList.contains('is-broken')) return resolve(false);
    const done = (ok) => (clearTimeout(t), v.removeEventListener('canplaythrough', yes), v.removeEventListener('error', no), resolve(ok));
    const yes = () => done(true);
    const no = () => done(false);
    const t = setTimeout(() => done(v.readyState >= 3), ms);
    v.addEventListener('canplaythrough', yes);
    v.addEventListener('error', no);
  });
const preload = (i) => regions[i] && videoFor(regions[i].id, regions[i].video);
const hudLat = $('#hud-lat');
const hudLon = $('#hud-lon');
const hudAlt = $('#hud-alt');
let tcTimer = null;
let current = null; // vidéo à l'écran
let firstShot = true;
async function shot(key, photo, video, lat, lon, stale) {
  const v = videoFor(key, video);
  if (v && v.readyState < 4 && !(firstShot && v.poster)) await canPlay(v, firstShot ? 6000 : 4500);
  if (stale()) return;
  firstShot = false;
  const layer = document.createElement('div');
  layer.className = 'cine__layer';
  // La photo ne sert que de secours (pas de vidéo, ou vidéo en erreur / trop lente)
  if (photo && (!v || v.classList.contains('is-broken') || (v.readyState < 2 && !v.poster))) layer.innerHTML = `<img class="cine__poster" src="${esc(photo)}" alt="" decoding="async">`;
  if (v) {
    layer.appendChild(v);
    if (v.readyState >= 2 || v.poster) v.classList.add('is-on');
    if (v.currentTime > 0.1) {
      try {
        v.currentTime = 0;
      } catch {}
    }
    v.play().catch(() => {});
  }
  current = v;
  const old = [...stage.querySelectorAll('.cine__layer')];
  stage.appendChild(layer);
  if (lat != null) {
    hudLat.textContent = dms(lat, 'N', 'S');
    hudLon.textContent = dms(lon, 'E', 'W');
  }
  const t0 = performance.now();
  clearInterval(tcTimer);
  tcTimer = setInterval(() => {
    const t = v && !v.paused ? v.currentTime : (performance.now() - t0) / 1000;
    hudAlt.textContent = `00:${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor((t % 1) * 25)).padStart(2, '0')}`;
  }, 80);
  // L'ancien plan continue de jouer pendant le fondu, puis s'arrête
  const finish = () => {
    old.forEach((o) => {
      o.querySelectorAll('video').forEach((x) => x !== v && x.pause());
      o.remove();
    });
  };
  return new Promise((resolve) => {
    if (gsap && !reduced) {
      gsap.fromTo(layer, { autoAlpha: 0, clipPath: 'inset(8% 8% 8% 8%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', onComplete: () => (finish(), resolve()) });
      gsap.fromTo(layer.querySelectorAll('img, video'), { scale: 1.1 }, { scale: 1, duration: 6.5, ease: 'none' });
    } else {
      finish();
      resolve();
    }
  });
}
const film = {
  show(kind, r, stale) {
    if (kind === 'region') return shot(r.id, r.photo ? mediaUrl(r.photo) : '', r.video, r.lat, r.lon, stale);
    return shot('finale', M.finale?.photo, M.finale?.video, 36.75, 3.06, stale);
  },
  setRunning(on) {
    pool.forEach((v) => (on && v.isConnected ? v.play().catch(() => {}) : v.pause()));
  },
};
let mode = 'opening';
let idx = -1;

function setPins() {
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
// À droite : la vraie photo du produit phare, et la mention de la vidéo
function finderFor(r) {
  const p = r.product;
  const s = p && sectorOf(C, p.sector);
  finder.innerHTML = `<div class="fm">
    <p class="fm__label"><span class="hud__dot"></span>REC · ${esc(i18n.ui(r.realVideo ? 'film.realAerial' : 'film.illusAerial'))}</p>
    ${p ? `<a class="fm__product" href="${productUrl(p)}">
      <span class="fm__pimg">${productVisual(p, s, { cls: 'fm__pv' })}</span>
      <span class="fm__ptext"><small>${esc(i18n.ui('film.flagship'))}</small><b>${esc(i18n.t(p.name))}</b><em>${esc(i18n.ui('film.seeProduct'))}${icon('arrow')}</em></span></a>` : ''}
  </div>`;
  finder.classList.add('is-on');
  if (gsap && !reduced) {
    gsap.fromTo(finder.querySelector('.fm__product'), { x: rtl ? -80 : 80, rotate: rtl ? -5 : 5, autoAlpha: 0 }, { x: 0, rotate: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', delay: 0.2 });
    gsap.from(finder.querySelector('.fm__label'), { autoAlpha: 0, y: 10, duration: 0.6, delay: 0.5 });
  }
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
let clock = 0;
let visible = true;
const DWELL = 4200; // ~4 s par région (fondu compris : 5 s à l'écran)
const playBtn = $('#film-play');
const setPlayBtn = () => {
  playBtn.innerHTML = icon(playing ? 'pause' : 'play');
  playBtn.setAttribute('aria-label', i18n.ui(playing ? 'film.pause' : 'film.play'));
  filmEl.classList.toggle('is-paused', !playing);
};

// Durée d'un plan : le compteur avance seulement quand la vidéo joue vraiment (pas pendant un chargement)
const stopClock = () => (cancelAnimationFrame(clock), (clock = 0));
function schedule(ms) {
  stopClock();
  if (!playing || !visible) return;
  const bar = idx >= 0 && mode === 'region' ? steps.querySelector(`button[data-i="${idx}"] .st__bar i`) : null;
  if (bar) bar.style.transition = 'none';
  let left = ms;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(now - last, 100);
    last = now;
    const stalled = current && current.isConnected && !current.classList.contains('is-broken') && (current.paused || current.readyState < 3);
    if (!stalled) left -= dt;
    if (bar) bar.style.transform = `scaleX(${Math.min(1, 1 - left / ms)})`;
    if (left <= 0) {
      clock = 0;
      next();
    } else clock = requestAnimationFrame(tick);
  };
  clock = requestAnimationFrame(tick);
}
function next() {
  if (mode === 'opening') go(0);
  else if (mode === 'region') go(idx + 1 < regions.length ? idx + 1 : 'finale');
  else go('opening');
}

async function go(target, { instant = false } = {}) {
  const my = ++token;
  stopClock();
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
    preload(1);
    await film.show('opening', null, () => my !== token);
    if (my !== token) return;
    schedule(5000);
    return;
  }
  if (target === 'finale') {
    mode = 'finale';
    idx = regions.length;
    hide(chapter);
    hide(finder);
    filmEl.dataset.mode = 'finale';
    setPins();
    await film.show('overview', null, () => my !== token);
    if (my !== token) return;
    show(chapter, finaleHtml());
    schedule(5000);
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
  preload(idx + 1);
  await film.show('region', r, () => my !== token);
  if (my !== token) return;
  show(chapter, chapterHtml(r, idx));
  finderFor(r);
  preload(idx + 2);
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
  else stopClock();
});
setPlayBtn();

// Le film tourne seulement quand il est à l'écran
new IntersectionObserver(
  ([e]) => {
    visible = e.isIntersecting;
    film.setRunning(visible);
    if (!visible) stopClock();
    else if (playing) schedule(mode === 'opening' ? 4000 : 2500);
  },
  { threshold: 0.15 }
).observe(filmEl);

replayFilm = (i) => {
    if (ctx.lenis) ctx.lenis.scrollTo(0, { duration: 1.6 });
    else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    playing = !reduced;
    setPlayBtn();
    setTimeout(() => go(i), 600);
  };
  const askChapter = new URLSearchParams(location.search).get('chapter');
  await go('opening', { instant: true });
  if (askChapter != null && regions[Number(askChapter)]) go(Number(askChapter));
if (reduced) {
  playing = false;
  setPlayBtn();
}
if (gsap && ST && !reduced) {
  gsap.from('.film__intro > *', { y: 30, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.15 });
  gsap.to('.film__shade', { opacity: 1, ease: 'none', scrollTrigger: { trigger: filmEl, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(stage, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: filmEl, start: 'top top', end: 'bottom top', scrub: true } });
}
}

/* ============================================================== */
/* La maison : une fenêtre sur l'Algérie qui s'ouvre au défilement, */
/* repères chiffrés, puis vision / mission / stratégie empilées     */
/* ============================================================== */
if ($('#maison')) {
const ab = $('#maison');
const motion = !!(gsap && ST && !reduced);
const A = M.about || {};
const flip = rtl ? -1 : 1;

// Fenêtre : la vidéo du lieu (sa première image s'affiche en attendant) ; la photo ne sert que de secours
const win = $('#ab-window');
if (win) {
  $('#ab-place').textContent = A.place || '';
  $('#ab-coords').textContent = A.coords || '';
  const v = win.querySelector('video');
  const c = clip(A.video);
  if (c && !reduced && !navigator.connection?.saveData && 'IntersectionObserver' in window) {
    if (c.poster) ((v.poster = c.poster), (win.querySelector('.ab-open__img').src = c.poster));
    v.preload = 'auto';
    let loaded = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!loaded) ((loaded = true), (v.src = c.src), v.addEventListener('playing', () => v.classList.add('is-on'), { once: true }));
        v.play().catch(() => {});
      } else v.pause();
    }, { rootMargin: '900px 0px' }).observe(win);
  } else v.remove();
}

// Manifeste mot à mot ; les mots « Algérie » et « monde » prennent l'accent
const manifesto = $('#manifesto');
if (manifesto) {
  const accent = /^(l[’']alg[ée]rie|alg[ée]rie|algeria|argelia|الجزائر|monde|world|mundo|العالم)(?![a-z])/i;
  // En arabe, les mots latins consécutifs (« Algerian Product ») restent groupés pour garder leur ordre
  const words = manifesto.textContent.trim().split(/\s+/).reduce((acc, w) => {
    if (rtl && /^[A-Za-z]/.test(w) && /[A-Za-z]$/.test(acc.at(-1) || '')) acc[acc.length - 1] += `\u00a0${w}`;
    else acc.push(w);
    return acc;
  }, []);
  manifesto.innerHTML = words
    .map((w) => `<span class="w${accent.test(w.replace(/^[«“"(—-]+/, '')) ? ' is-accent' : ''}">${esc(w)}</span>`)
    .join(' ');
}

// Galerie flottante : un produit par filière d'abord, pour montrer l'étendue de l'offre
const gal = $('#ab-gallery');
if (gal && motion) {
  const withImg = products.filter((p) => p.image);
  const picks = [];
  for (const s of sectors) {
    const p = withImg.find((x) => x.sector === s.id && !picks.includes(x));
    if (p) picks.push(p);
  }
  for (const p of withImg) if (picks.length < 8 && !picks.includes(p)) picks.push(p);
  gal.innerHTML = picks
    .slice(0, 8)
    .map((p, i) => `<figure class="ab-g ab-g--${i}"><div class="ab-g__in"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"><figcaption>${esc(i18n.t(p.name))}</figcaption></div></figure>`)
    .join('');
}

if (motion) {
  ab.classList.add('ab--anim');
  const stage = $('.ab-open__stage');
  const small = matchMedia('(max-width: 699px)');
  const startClip = () => (small.matches ? 'inset(31% 17% 31% 17% round 22px)' : 'inset(27% 35% 27% 35% round 28px)');
  const figs = [...gal.querySelectorAll('.ab-g')];
  // Chaque vignette s'éloigne du centre, comme si la caméra traversait la galerie
  const away = (fig, k) => () =>
    (k === 'x' ? fig.offsetLeft + fig.offsetWidth / 2 - stage.offsetWidth / 2 : fig.offsetTop + fig.offsetHeight / 2 - stage.offsetHeight / 2) * 1.5;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#ab-open', start: 'top top', end: () => `+=${innerHeight * (small.matches ? 2.2 : 2.6)}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
  });
  tl.fromTo(win, { clipPath: startClip }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1.4 }, 0)
    .fromTo('.ab-open__img, .ab-open__video', { scale: 1.45 }, { scale: 1, ease: 'power2.inOut', duration: 1.4 }, 0)
    .fromTo('.ab-open__shade', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1)
    .fromTo('.ab-open__hud', { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.25)
    .to('.ab-open__hint', { autoAlpha: 0, duration: 0.2 }, 0)
    .fromTo('.ab-open__line--a', { x: 0, autoAlpha: 1 }, { x: () => -innerWidth * 0.75 * flip, autoAlpha: 0, ease: 'power2.in', duration: 1.2 }, 0.05)
    .fromTo('.ab-open__line--b', { x: 0, autoAlpha: 1 }, { x: () => innerWidth * 0.75 * flip, autoAlpha: 0, ease: 'power2.in', duration: 1.2 }, 0.05);
  figs.forEach((fig, i) => tl.fromTo(fig, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: away(fig, 'x'), y: away(fig, 'y'), scale: 1.7 + (i % 3) * 0.3, autoAlpha: 0, ease: 'power2.in', duration: 1.1 }, 0.02 * i));
  tl.fromTo('.ab-open__copy .kicker', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 1.45)
    .fromTo('#manifesto .w', { opacity: 0.12, y: 24, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.04, duration: 0.3 }, 1.55)
    .to({}, { duration: 0.5 });

  // Entrée de la galerie quand la section arrive, puis légère profondeur au pointeur
  gsap.from(gal.querySelectorAll('.ab-g__in'), { yPercent: 60, scale: 0.6, autoAlpha: 0, duration: 1.4, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '#ab-open', start: 'top 75%' } });
  gsap.from('.ab-open__big', { y: 120, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#ab-open', start: 'top 70%' } });
  if (matchMedia('(pointer: fine)').matches) {
    const movers = figs.map((f, i) => {
      const el = f.firstElementChild;
      const d = 14 + (i % 4) * 10;
      return { x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }), d };
    });
    stage.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      movers.forEach((m) => (m.x(-nx * m.d * 2), m.y(-ny * m.d * 2)));
    });
  }
}

// Repères : bandeau des filières (accéléré par le défilement) et compteurs
const mq = $('#ab-marquee .ab-marquee__inner');
if (mq) {
  const star = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${starPath(20, 20, 14)}"/></svg>`;
  const row = sectors.map((s) => `<span>${esc(i18n.t(s.name))}</span>${star}`).join('');
  mq.innerHTML = row + row;
  if (motion) {
    const loop = gsap.to(mq, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    let dir = 1;
    ST.create({
      trigger: '.ab-facts',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) > 40) dir = v > 0 ? 1 : -1;
        gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 300, 6)), duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: 'power2.out' });
      },
    });
    gsap.fromTo(mq, { skewX: 0 }, { skewX: -4, ease: 'none', scrollTrigger: { trigger: '.ab-facts', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
}
const facts = $('#ab-facts');
if (facts) {
  const fmt = (n) => i18n.num(n).replace(/\u202f/g, '\u00a0');
  const list = [
    { n: 2381741, key: 'about.fact.area', wide: true },
    { n: sectors.length, key: 'about.fact.sectors' },
    { n: regions.length, key: 'about.fact.regions' },
    { n: products.length, key: 'about.fact.products' },
  ];
  facts.innerHTML = list
    .map((f) => {
      // « unité — libellé » : l'unité s'affiche à côté du chiffre
      const [a, b] = i18n.ui(f.key).split(/\s+—\s+/);
      const unit = b ? a : '';
      return `<div class="ab-fact${f.wide ? ' ab-fact--wide' : ''}"><dt><b data-n="${f.n}">${esc(fmt(f.n))}</b>${unit ? `<small>${esc(unit)}</small>` : ''}</dt><dd>${esc(b || a)}</dd></div>`;
    })
    .join('');
  if (motion) {
    facts.querySelectorAll('.ab-fact').forEach((el, i) => {
      const b = el.querySelector('b');
      const o = { v: 0 };
      const tw = { trigger: facts, start: 'top 82%' };
      gsap.fromTo(el, { '--p': 0 }, { '--p': 1, duration: 1.4, ease: 'expo.inOut', delay: i * 0.1, scrollTrigger: tw });
      gsap.from(el.children, { y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: 0.15 + i * 0.1, stagger: 0.08, scrollTrigger: tw });
      gsap.to(o, { v: Number(b.dataset.n), duration: 2.2, ease: 'expo.out', delay: 0.15 + i * 0.1, scrollTrigger: tw, onUpdate: () => (b.textContent = fmt(Math.round(o.v))) });
    });
  }
}

// Paysages (page « La maison ») : deux rangées qui glissent en sens inverse
{
  const strip = M.strip || [];
  const names = ['Biskra', 'Constantine', 'Béjaïa', 'Kabylie', 'Ghardaïa', 'Tlemcen', 'Sahara', 'Atlas', 'Chetma', 'Aurès'];
  const tile = (src, i, big) => `<figure class="strip__tile${big ? '' : ' strip__tile--sm'}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"><figcaption>${esc(names[i] || '')}</figcaption></figure>`;
  const rows = document.querySelectorAll('.strip__row');
  if (rows.length) rows[0].innerHTML = [...strip, ...strip].map((s, i) => tile(s, i % strip.length, true)).join('');
  const rev = [...strip].reverse();
  if (rows.length) rows[1].innerHTML = [...rev, ...rev].map((s, i) => tile(s, strip.length - 1 - (i % strip.length), false)).join('');
  if (rows.length && motion) {
    rows.forEach((row) => {
      const dir = Number(row.dataset.dir) * flip;
      gsap.fromTo(row, { xPercent: dir > 0 ? 0 : -30 }, { xPercent: dir > 0 ? -30 : 0, ease: 'none', scrollTrigger: { trigger: '#strip', start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
    });
    const skew = gsap.quickTo('.strip__row', 'skewX', { duration: 0.5, ease: 'power3' });
    ST.create({ trigger: '#strip', start: 'top bottom', end: 'bottom top', onUpdate: (self) => skew(Math.max(-6, Math.min(6, self.getVelocity() / -400))) });
  }
}

// Cartes empilées : la carte recouverte recule et s'assombrit, l'image respire
if (motion) {
  const cards = [...ab.querySelectorAll('.ab-card')];
  cards.forEach((card, i) => {
    const img = card.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.from(card.querySelectorAll('.ab-card__body > *'), { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: card, start: 'top 65%' } });
    const next = cards[i + 1];
    if (next) gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, { scale: 0.9 - (cards.length - 2 - i) * 0.03, filter: 'brightness(0.55)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } });
  });
}
}

/* ============================================================== */
/* Valeurs : cartes photo qui s'ouvrent au survol                  */
/* ============================================================== */
if ($('#values')) {
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
}

/* ============================================================== */
/* Filières : panneaux photo en défilement horizontal              */
/* ============================================================== */
if ($('#sectors-track')) {
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
}

/* ============================================================== */
/* Identité : le sceau se pose sur de vrais produits               */
/* ============================================================== */
if ($('#supports')) {
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
}

/* ============================================================== */
/* Sélection                                                        */
/* ============================================================== */
if ($('#featured')) {
const featured = products.filter((p) => p.featured).slice(0, 8);
const featEl = $('#featured');
featEl.innerHTML = featured.map((p) => productCard(p, ctx)).join('');
bindAddButtons(featEl, ctx);
if (gsap && ST && !reduced) {
  gsap.from(featEl.children, { y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: featEl, start: 'top 85%' } });
}
}

/* ============================================================== */
/* Atlas : carte plate de l'Algérie et liste des régions            */
/* ============================================================== */
if ($('#atlas-map')) {
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
  const replay = (i) => (replayFilm ? replayFilm(i) : (location.href = href(`./?chapter=${i}#film`)));
  $('#atlas-list').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) replay(Number(b.dataset.i));
  });
  $('#atlas-replay')?.addEventListener('click', () => replay(0));
  if (gsap && ST && !reduced) {
    const dzp = document.querySelector('.atlas__dz');
    const L = dzp.getTotalLength();
    gsap.fromTo(dzp, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L, fillOpacity: 0 }, { strokeDashoffset: 0, fillOpacity: 1, duration: 2.6, ease: 'power2.inOut', scrollTrigger: { trigger: '#atlas-map', start: 'top 75%' } });
    gsap.from('.atlas__pin', { scale: 0, transformOrigin: 'center', duration: 0.7, ease: 'back.out(2)', stagger: 0.08, delay: 0.8, scrollTrigger: { trigger: '#atlas-map', start: 'top 75%' } });
  }
}
}

/* ============================================================== */
/* Régions en détail (page Régions)                                 */
/* ============================================================== */
if ($('#region-cards')) {
  const el = $('#region-cards');
  el.innerHTML = regions
    .map((r, i) => {
      const p = r.product;
      const s = p && sectorOf(C, p.sector);
      return `<article class="rcard" data-i="${i}">
        <div class="rcard__media">${r.photo ? `<img src="${esc(r.photo)}" alt="" loading="lazy" decoding="async">` : ''}
          ${r.video ? `<button class="rcard__play" type="button" data-video="${esc(r.video)}">${icon('play')}<span>${esc(i18n.ui('page.regions.watch'))}</span></button>` : ''}
          <span class="rcard__n">${String(i + 1).padStart(2, '0')}</span></div>
        <div class="rcard__body">
          <p class="rcard__meta">${esc(i18n.t(r.area))} · <span dir="ltr">${dms(r.lat, 'N', 'S')} ${dms(r.lon, 'E', 'W')}</span></p>
          <h3>${esc(i18n.t(r.name))}</h3>
          <p class="rcard__line">${esc(i18n.t(r.line))}</p>
          ${p ? `<a class="rcard__prod" href="${productUrl(p)}"><span>${productVisual(p, s, { cls: 'rcard__pv' })}</span><span><small>${esc(i18n.ui('film.flagship'))}</small><b>${esc(i18n.t(p.name))}</b></span>${icon('arrow')}</a>` : ''}
          <p class="rcard__credit">${esc(i18n.ui(r.realVideo ? 'film.realAerial' : 'film.illusAerial'))}</p>
        </div>
      </article>`;
    })
    .join('');
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-video]');
    if (!b) return;
    const media = b.closest('.rcard__media');
    el.querySelectorAll('.rcard__media video').forEach((v) => v.pause());
    let v = media.querySelector('video');
    if (!v) {
      v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, src: b.dataset.video });
      v.setAttribute('playsinline', '');
      v.addEventListener('playing', () => media.classList.add('is-playing'));
      media.insertBefore(v, b);
    }
    v.play().catch(() => {});
    track('film', { chapter: regions[Number(b.closest('.rcard').dataset.i)]?.id, from: 'regions' });
  });
  if (gsap && ST && !reduced) {
    el.querySelectorAll('.rcard').forEach((c) => {
      gsap.from(c, { y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 88%' } });
      gsap.fromTo(c.querySelector('.rcard__media img'), { scale: 1.3 }, { scale: 1.02, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }
}

/* ============================================================== */
/* Marchés : carte du monde en points et arcs depuis Alger          */
/* ============================================================== */
if ($('#world')) {
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
}

/* ============================================================== */
/* Pour qui : défilé des types d'acheteurs                          */
/* ============================================================== */
if ($('#audience')) {
{
  const keys = ['importers', 'distributors', 'wholesalers', 'chains', 'food', 'retail', 'trading', 'partners'];
  const row = keys.map((k) => `<span>${esc(i18n.ui('audience.' + k))}</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="${starPath(20, 20, 13)}"/></svg>`).join('');
  $('#audience').innerHTML = `<div class="marquee__row"><div class="marquee__inner">${row}${row}</div></div><div class="marquee__row marquee__row--rev"><div class="marquee__inner">${row}${row}</div></div>`;
}
}

/* ============================================================== */
/* Services : les étapes de l'export                                */
/* ============================================================== */
if ($('#steps')) {
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
}

/* ============================================================== */
/* Producteurs et appel final                                       */
/* ============================================================== */
if ($('#producers-pattern') || $('#final-ctas')) {
if ($('#producers-pattern')) $('#producers-pattern').innerHTML = patternSvg('star', 'producers__svg');
if ($('#final-seal')) $('#final-seal').innerHTML = seal('final__sealsvg');
{
  const ct = C.contact || {};
  const wa = String(ct.whatsapp || '').replace(/\D/g, '');
  if ($('#final-ctas')) $('#final-ctas').innerHTML = `<a class="btn btn--light btn--lg" href="${href('devis.html')}">${esc(i18n.ui('nav.quote'))}${icon('arrow')}</a>
    ${ct.email ? `<a class="btn btn--ghost" href="mailto:${esc(ct.email)}">${icon('mail')}${esc(i18n.ui('cta.email'))}</a>` : ''}
    ${wa ? `<a class="btn btn--ghost" href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('wa')}${esc(i18n.ui('cta.whatsapp'))}</a>` : ''}`;
  document.querySelectorAll('#final-ctas a, .film__ctas a, .hdr__cta').forEach((a) => a.addEventListener('click', () => track('cta', { name: a.getAttribute('href') })));
}
if (gsap && ST && !reduced) {
  gsap.to('#final-seal svg', { rotate: -90, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom top', scrub: true } });
}
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
