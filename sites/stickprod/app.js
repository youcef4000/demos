// Stickprod — la spirale. Le contenu vient de content.json (ou de l'espace admin),
// les réalisations défilent sur une hélice WebGL pilotée par le scroll.
import { loadContent, resetLocal, sized, videoEmbed, esc } from './store.js';

const { gsap, ScrollTrigger, SplitText, Lenis } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const pad = (n) => String(n).padStart(2, '0');

const params = new URLSearchParams(location.search);
const PREVIEW = params.has('preview');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;

let C = null; // contenu
let P = []; // réalisations visibles
let lenis = null;
let spiral = null;
let active = -1;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

main().catch((err) => {
  console.error(err);
  document.body.classList.remove('is-loading');
  $('#loader')?.remove();
});

async function main() {
  const { content, source } = await loadContent({ preview: PREVIEW });
  C = content;
  P = (C.projects || []).filter((p) => p.visible !== false);

  render();
  if (source === 'local' && !PREVIEW) showLocalPill();

  const hasGsap = !!(gsap && ScrollTrigger);
  let webgl = false;
  if (hasGsap && !reduce && P.length) {
    try {
      const mod = await import('./spiral.js');
      if (mod.webglOK()) {
        spiral = mod.createSpiral($('#gl'), { projects: P, accent: C.brand?.accent });
        webgl = true;
      }
    } catch (err) {
      console.warn('Spirale indisponible, affichage simple.', err);
    }
  }
  if (!webgl) document.body.classList.add('is-static');

  if (!hasGsap) {
    finishLoader(true);
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (!reduce && Lenis && !PREVIEW) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const loaderDone = PREVIEW ? finishLoader(true) : runLoader();

  if (webgl) buildSpiral();
  else buildStatic();
  buildSections();
  buildNav();
  buildCursor();
  buildCase();
  bindLinks();
  studioCredit();
  listenAdmin();

  await loaderDone;
  lenis?.start();
  ScrollTrigger.refresh();

  if (PREVIEW) {
    const y = Number(sessionStorage.getItem('stickprod:preview-scroll') || 0);
    if (y) scrollTo(0, y);
  } else if (location.hash && $(location.hash)) {
    setTimeout(() => goTo($(location.hash), true), 400);
  } else {
    scrollTo(0, 0);
  }
  spiral?.intro(PREVIEW ? 0 : 2.6, PREVIEW);
  if (!PREVIEW) intro();
  if (PREVIEW && parent !== window) parent.postMessage({ type: 'preview-ready' }, location.origin);
}

/* ------------------------------------------------------------------ */
/* Rendu du contenu                                                    */
/* ------------------------------------------------------------------ */
function get(path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
}

function render() {
  const accent = C.brand?.accent || '#ff4a1c';
  document.documentElement.style.setProperty('--accent', accent);
  document.body.classList.toggle('no-grain', C.brand?.grain === false);
  $$('[data-bind]').forEach((el) => {
    const v = get(el.dataset.bind);
    if (v != null && v !== '') el.textContent = v;
  });
  if (C.brand?.name) document.title = `${C.brand.name} — production audiovisuelle à Alger · spots, films, motion design 3D`;

  // réalisations
  $('#count').textContent = pad(P.length);
  $('.work').style.setProperty('--n', Math.max(1, P.length));
  $('#chapters').innerHTML = P.map(chapterHTML).join('');
  $('#rail').innerHTML = P.map((p, i) => `<button type="button" data-go="${i}" aria-label="${esc(p.title)}"></button>`).join('');

  // savoir-faire
  const svc = C.services?.items || [];
  $('#services').innerHTML = svc
    .map(
      (s, i) => `<li data-svc="${i}">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
        ${s.image ? `<img class="svc__thumb" src="${esc(sized(s.image, 200))}" alt="" loading="lazy">` : ''}
      </li>`,
    )
    .join('');
  $('.svc-preview__in').innerHTML = svc.map((s, i) => (s.image ? `<img src="${esc(sized(s.image, 700))}" alt="" data-svc-img="${i}" loading="lazy">` : '')).join('');

  // méthode
  $('#steps').innerHTML =
    '<i class="steps__bar" aria-hidden="true"></i>' +
    (C.process?.steps || [])
      .map(
        (s, i) => `<li>
        <p class="mono">Étape ${pad(i + 1)}</p>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
        ${s.deliverable ? `<span class="deliv"><b>Livré</b>${esc(s.deliverable)}</span>` : ''}
      </li>`,
      )
      .join('');

  // studio
  $('#facts').innerHTML = (C.studio?.facts || []).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('');

  // contact
  const c = C.contact || {};
  const lines = [];
  if (c.email) lines.push(['E-mail', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`]);
  if (c.phone) lines.push(['Téléphone', `<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a>`]);
  if (c.whatsapp) lines.push(['WhatsApp', `<a href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener">${esc(c.whatsapp)}</a>`]);
  if (c.instagram) lines.push(['Instagram', `<a href="${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram.replace(/\/+$/, '').split('/').pop())}</a>`]);
  if (c.address) lines.push(['Studio', `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}" target="_blank" rel="noopener">${esc(c.address)}</a>`]);
  $('#contact-lines').innerHTML = lines.map(([k, v]) => `<li><span class="mono">${k}</span><span>${v}</span></li>`).join('');
  const types = [...new Set([...svc.map((s) => s.title.split(/ & | et /)[0]), 'Autre'])];
  $('#types').innerHTML = types.map((t, i) => `<label><input type="radio" name="type" value="${esc(t)}"${i === 0 ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('');
}

function chapterHTML(p, i) {
  const hasVideo = !!videoEmbed(p.video);
  const delivered = (p.delivered || []).filter(Boolean);
  const results = (p.results || []).filter((r) => r && (r.value || r.label));
  return `<article class="chap" data-i="${i}" aria-label="${esc(p.title)}">
    <figure class="chap__fig"><img src="${esc(sized(p.cover, 1200))}" alt="${esc(p.alt || p.title)}" loading="lazy"></figure>
    <dl class="chap__meta mono">
      ${p.category ? `<div><dt>Catégorie</dt><dd>${esc(p.category)}</dd></div>` : ''}
      ${p.client ? `<div class="chap__client"><dt>Client</dt><dd>${esc(p.client)}</dd></div>` : ''}
      ${p.year ? `<div><dt>Année</dt><dd>${esc(p.year)}</dd></div>` : ''}
      ${p.format ? `<div><dt>Format</dt><dd>${esc(p.format)}</dd></div>` : ''}
      ${p.example ? `<div><dd><span class="pill-ex" title="Contenu d'exemple, à remplacer depuis l'espace admin">Projet d'exemple</span></dd></div>` : ''}
    </dl>
    <div class="chap__main">
      <h3 class="chap__title">${esc(p.title)}</h3>
      ${p.brief ? `<p class="chap__brief">${esc(p.brief)}</p>` : ''}
      ${delivered.length ? `<ul class="chap__chips">${delivered.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
      <button class="btn btn--small chap__open" type="button" data-open="${i}"><span>${hasVideo ? 'Voir le film' : 'Voir le projet'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </div>
    <div class="chap__side">
      ${delivered.length ? `<div><h4 class="mono">Ce qu'on a livré</h4><ul>${delivered.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>` : ''}
      ${results.length ? `<div><h4 class="mono">En chiffres</h4>${resultsHTML(results)}</div>` : ''}
    </div>
  </article>`;
}

const resultsHTML = (results) => `<dl class="results">${results.map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('')}</dl>`;

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */
// spirale d'or : r = a·e^(bθ), b = ln φ / (π/2)
function goldenSpiral({ turns = 2, rMax = 55, cx = 0, cy = 0, sx = 1, sy = 1, steps = 240 } = {}) {
  const b = Math.log(1.618034) / (Math.PI / 2);
  const T = turns * Math.PI * 2;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const th = (T * i) / steps;
    const r = rMax * Math.exp(b * (th - T));
    const x = cx + Math.cos(th) * r * sx;
    const y = cy - Math.sin(th) * r * sy;
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function timecode(sec) {
  const f = Math.floor((sec % 1) * 24);
  const s = Math.floor(sec) % 60;
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

async function runLoader() {
  const path = $('#loader-path');
  path.setAttribute('d', goldenSpiral({ turns: 2.2, rMax: 56 }));
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  const load = { v: 0 };
  const pct = $('#pct'), tc = $('#loader-tc');
  const paint = () => {
    pct.textContent = Math.round(load.v);
    tc.textContent = timecode(load.v / 25);
    path.style.strokeDashoffset = len * (1 - load.v / 100);
  };
  const t0 = performance.now();
  const target = () => {
    const tex = spiral ? spiral.readyCount() / Math.max(1, P.length) : 1;
    return Math.min(96, 30 + tex * 66);
  };
  let stop = false;
  const tick = () => {
    if (stop) return;
    gsap.to(load, { v: Math.max(load.v, target()), duration: 0.5, onUpdate: paint, overwrite: true });
    setTimeout(tick, 200);
  };
  tick();
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const textures = new Promise((r) => {
    const check = () => (!spiral || spiral.readyCount() >= Math.min(3, P.length) ? r() : setTimeout(check, 120));
    check();
  });
  await Promise.race([Promise.all([fonts, textures, wait(900)]), wait(5500)]);
  stop = true;
  await new Promise((r) => gsap.to(load, { v: 100, duration: 0.5, ease: 'power2.out', onUpdate: paint, onComplete: r, overwrite: true }));
  console.debug(`chargement ${Math.round(performance.now() - t0)} ms`);
  return finishLoader(false);
}

function finishLoader(instant) {
  const el = $('#loader');
  document.body.classList.remove('is-loading');
  if (!el) return Promise.resolve();
  if (instant || !gsap) {
    el.remove();
    return Promise.resolve();
  }
  return new Promise((r) => {
    const tl = gsap.timeline({ onComplete: () => (el.remove(), r()) });
    tl.to('.loader__spiral', { scale: 3.2, rotate: -140, opacity: 0, duration: 1.2, ease: 'expo.in' }, 0)
      .to('.loader__mark, .loader__tc, .loader__pct', { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' }, 0.3)
      .to(el, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.9);
    setTimeout(r, 900); // on lance la suite pendant le fondu
  });
}

function intro() {
  const lines = $$('.hero__line');
  const split = SplitText.create(lines, { type: 'words', mask: 'words', wordsClass: 'hw' });
  gsap.from(split.words, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.06, delay: 0.15 });
  gsap.from('.hero__kicker, .hero__lead, .hero__cta, .nav', { opacity: 0, y: 14, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.5 });
}

/* ------------------------------------------------------------------ */
/* La spirale                                                          */
/* ------------------------------------------------------------------ */
function buildSpiral() {
  const work = $('#realisations');
  const stage = $('#stage');
  const chaps = $$('.chap');
  const rail = $$('#rail button');
  const tc = $('#tc'), idx = $('#idx');
  const root = document.documentElement;

  const splits = chaps.map((c) => SplitText.create($('.chap__title', c), { type: 'words,chars', mask: 'words', wordsClass: 'wd', charsClass: 'char' }));
  chaps.forEach((c) => (c.inert = true));

  const layout = () => {
    const r = spiral.resize();
    stage.style.setProperty('--cx', `${r.x}px`);
    stage.style.setProperty('--cy', `${r.y}px`);
    stage.style.setProperty('--cw', `${r.w}px`);
    stage.style.setProperty('--ch', `${r.h}px`);
  };
  layout();
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 140) return; // barre d'adresse mobile
    lastW = innerWidth;
    lastH = innerHeight;
    layout();
  });

  // position dans la section → index du film au point, avec un palier sur chaque film
  const progress = () => {
    const vh = innerHeight;
    const x = (scrollY - work.offsetTop) / vh;
    if (x < 0) return { x, p: Math.max(-1.6, x * 1.6) };
    const i = Math.floor(x);
    const p = i + smooth(0.3, 0.9, x - i);
    return { x, p: Math.min(p, P.length - 1) };
  };

  const show = (i, dir) => {
    if (i === active) return;
    const prev = chaps[active];
    active = i;
    if (prev) {
      prev.inert = true;
      gsap.to(prev, { autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: true });
    }
    const next = chaps[i];
    if (!next) return;
    next.inert = false;
    idx.textContent = pad(i + 1);
    const s = splits[i];
    const bits = $$('.chap__meta > div, .chap__brief, .chap__chips li, .chap__open, .chap__side > div', next);
    gsap.killTweensOf([s.chars, bits]);
    gsap.set(next, { autoAlpha: 1 });
    gsap.fromTo(s.chars, { yPercent: dir > 0 ? 110 : -110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.018, delay: 0.1 });
    gsap.fromTo(bits, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.035, delay: 0.2 });
  };

  let lastP = -9;
  const update = () => {
    const { x, p } = progress();
    spiral.setProgress(p);
    tc.textContent = timecode(Math.max(0, scrollY / innerHeight) * 2.5);
    const near = Math.round(p);
    const off = Math.abs(p - near);
    root.style.setProperty('--vf', p < -0.3 ? 0 : clamp(1 - off * 4, 0, 1));
    const target = p < -0.45 || x > P.length - 0.2 ? -1 : clamp(near, 0, P.length - 1);
    if (target !== active) {
      if (target === -1) {
        const prev = chaps[active];
        if (prev) {
          prev.inert = true;
          gsap.to(prev, { autoAlpha: 0, duration: 0.3, overwrite: true });
        }
        active = -1;
      } else show(target, target >= active ? 1 : -1);
    }
    if (Math.abs(p - lastP) > 0.001) rail.forEach((b, i) => b.style.setProperty('--fill', clamp(p - i + 1, 0, 1)));
    lastP = p;
    $('.vf__hit').disabled = active < 0 || off > 0.15;
  };
  gsap.ticker.add(update);
  update();

  // la scène ne tourne que lorsqu'elle est visible
  const io = new IntersectionObserver((entries) => {
    const on = entries.some((e) => e.isIntersecting) || work.getBoundingClientRect().bottom > 0;
    spiral.setVisible(on);
    $('#gl').style.opacity = on ? 1 : 0;
  });
  io.observe($('.hero'));
  io.observe(work);

  if (fine) {
    addEventListener('pointermove', (e) => spiral.setPointer(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });
  }

  rail.forEach((b) => b.addEventListener('click', () => goToProject(+b.dataset.go)));
  $('#vf-hit').addEventListener('click', () => active >= 0 && openCase(active));
}

// palier du film i : x ∈ [i − 0,1 ; i + 0,3] → on vise le milieu
function projectY(i) {
  return $('#realisations').offsetTop + (i + 0.1) * innerHeight;
}

function goToProject(i, instant = false) {
  if ($('body').classList.contains('is-static')) return goTo($$('.chap')[i], instant);
  const y = projectY(i);
  if (lenis && !instant) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else scrollTo(0, y);
}

function buildStatic() {
  $$('.chap').forEach((c) => {
    c.inert = false;
    if (!gsap || reduce) return;
    gsap.from($$('.chap__fig, .chap__meta, .chap__main, .chap__side', c), {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: c, start: 'top 80%' },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */
function buildSections() {
  // titres : lignes qui montent
  $$('[data-split]').forEach((el) => {
    if (reduce) return;
    const s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.from(s.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // savoir-faire : aperçu qui suit le curseur
  const rows = $$('#services li');
  if (!reduce) gsap.from(rows, { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '#services', start: 'top 80%' } });
  const prev = $('#svc-preview');
  if (fine && prev && getComputedStyle(prev).display !== 'none') {
    const imgs = $$('img', prev);
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, cur = { ...pos };
    let on = false;
    rows.forEach((row) =>
      row.addEventListener('pointerenter', () => {
        on = true;
        prev.classList.add('is-on');
        imgs.forEach((im) => im.classList.toggle('is-on', im.dataset.svcImg === row.dataset.svc));
      }),
    );
    $('#services').addEventListener('pointerleave', () => {
      on = false;
      prev.classList.remove('is-on');
    });
    addEventListener('pointermove', (e) => ((pos.x = e.clientX), (pos.y = e.clientY)), { passive: true });
    gsap.ticker.add(() => {
      if (!on && !prev.classList.contains('is-on')) return;
      const dx = pos.x - cur.x;
      cur.x += dx * 0.14;
      cur.y += (pos.y - cur.y) * 0.14;
      prev.style.transform = `translate(${cur.x + 30}px, ${cur.y - 190}px) rotate(${clamp(dx * 0.04, -8, 8)}deg)`;
    });
  }

  // méthode : la spirale d'or se trace au fil des étapes
  const steps = $$('#steps li');
  const svg = $('#gspiral');
  const d = goldenSpiral({ turns: 2.25, rMax: 150, cx: 248, cy: 108, sx: 1.05, sy: 0.82 });
  $('.gspiral__ghost', svg).setAttribute('d', d);
  const draw = $('.gspiral__draw', svg);
  draw.setAttribute('d', d);
  const len = draw.getTotalLength();
  const at = steps.map((_, i) => 0.06 + (0.9 * i) / Math.max(1, steps.length - 1));
  $('.gspiral__pts', svg).innerHTML = at
    .map((f, i) => {
      const pt = draw.getPointAtLength(f * len);
      return `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="5"/><text x="${(pt.x + 10).toFixed(1)}" y="${(pt.y - 8).toFixed(1)}">${pad(i + 1)}</text>`;
    })
    .join('');
  const circles = $$('circle', svg), labels = $$('text', svg);
  gsap.set(draw, { strokeDasharray: len, strokeDashoffset: len });
  const setStep = (k) => {
    steps.forEach((s, i) => s.classList.toggle('is-on', i <= k));
    circles.forEach((c, i) => c.classList.toggle('is-on', i <= k));
    labels.forEach((c, i) => c.classList.toggle('is-on', i <= k));
  };
  ScrollTrigger.create({
    trigger: '#steps',
    start: 'top 60%',
    end: 'bottom 70%',
    scrub: reduce ? false : 0.6,
    onUpdate: (st) => {
      const pr = st.progress;
      draw.style.strokeDashoffset = len * (1 - (0.06 + pr * 0.9));
      $('.steps__bar').style.transform = `scaleY(${pr})`;
    },
  });
  steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 62%', end: 'bottom 62%', onEnter: () => setStep(i), onEnterBack: () => setStep(i), onLeaveBack: () => setStep(i - 1) }));

  // studio : les mots s'allument
  const st = $('#statement');
  if (!reduce) {
    const s = SplitText.create(st, { type: 'words', wordsClass: 'w' });
    gsap.to(s.words, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 } });
  } else $$('.w', st).forEach((w) => (w.style.opacity = 1));
  $$('#facts dd').forEach((dd) => {
    const n = Number(dd.textContent);
    if (!Number.isFinite(n) || reduce || n <= 0) return;
    const o = { v: n > 1000 ? n - 18 : 0 };
    gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', snap: { v: 1 }, onUpdate: () => (dd.textContent = o.v), scrollTrigger: { trigger: dd, start: 'top 90%' } });
  });

  // footer : le nom de marque occupe toute la largeur, quelle que soit sa longueur
  const word = $('.footer__word');
  const fit = () => {
    word.style.setProperty('--fw', '100px');
    const r = document.createRange();
    r.selectNodeContents(word);
    const w = r.getBoundingClientRect().width;
    if (w) word.style.setProperty('--fw', `${Math.min(34, 9600 / w)}vw`); // 96 % de la largeur
  };
  fit();
  document.fonts?.ready.then(fit);
  addEventListener('resize', fit);

  // footer : le mot s'allume
  if (!reduce) gsap.from('.footer__word', { yPercent: 30, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 90%' } });

  // formulaire → e-mail ou WhatsApp
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const note = $('#form-note');
    if (!f.get('name') || !f.get('message')) {
      note.textContent = 'Indiquez au moins votre nom et votre projet.';
      return;
    }
    const txt = `Bonjour ${C.brand?.name || 'Stickprod'},\n\nProjet : ${f.get('type') || ''}\nNom : ${f.get('name')}\nEntreprise : ${f.get('company') || '—'}\nÉchéance : ${f.get('when') || '—'}\n\n${f.get('message')}`;
    const c = C.contact || {};
    if (c.whatsapp) {
      open(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
      note.textContent = 'WhatsApp s’ouvre avec votre message.';
    } else if (c.email) {
      location.href = `mailto:${c.email}?subject=${encodeURIComponent(`Projet ${f.get('type') || ''} — ${f.get('company') || f.get('name')}`)}&body=${encodeURIComponent(txt)}`;
      note.textContent = 'Votre messagerie s’ouvre avec la demande préremplie.';
    }
  });
}

function buildNav() {
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (st) => {
      const y = st.scroll();
      nav.classList.toggle('is-hidden', y > innerHeight * 0.6 && y > lastY && !$('#case').open);
      nav.classList.toggle('is-solid', y > $('#savoir-faire').offsetTop - 80);
      lastY = y;
    },
  });
  $$('.nav__links a').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => a.classList.toggle('is-active', st.isActive) });
  });
}

function buildCursor() {
  const el = $('#cursor');
  if (!fine || reduce) return el.remove();
  const pos = { x: -100, y: -100 }, cur = { ...pos };
  addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    el.classList.add('is-on');
    const t = e.target.closest?.('[data-cursor]');
    const label = t && !t.disabled ? t.dataset.cursor : '';
    el.classList.toggle('is-label', !!label);
    el.firstElementChild.textContent = label;
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  gsap.ticker.add(() => {
    cur.x += (pos.x - cur.x) * 0.22;
    cur.y += (pos.y - cur.y) * 0.22;
    el.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
  });
}

/* ------------------------------------------------------------------ */
/* Fiche réalisation                                                    */
/* ------------------------------------------------------------------ */
function buildCase() {
  const dlg = $('#case');
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (b) openCase(+b.dataset.open);
  });
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeCase();
    const n = e.target.closest('[data-next]');
    if (n) openCase(+n.dataset.next, true);
    const play = e.target.closest('.case__play');
    if (play) {
      const src = play.dataset.src;
      const media = play.parentElement;
      media.innerHTML = /\.(mp4|webm)(\?|$)/i.test(src)
        ? `<video src="${esc(src)}" controls autoplay playsinline></video>`
        : `<iframe src="${esc(src)}" title="Film" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
  });
  dlg.addEventListener('close', () => {
    lenis?.start();
    $('#case-body').innerHTML = '';
  });
  dlg.addEventListener('cancel', () => lenis?.start());
}

function openCase(i, swap = false) {
  const p = P[i];
  if (!p) return;
  const dlg = $('#case');
  const src = videoEmbed(p.video);
  const next = (i + 1) % P.length;
  const results = (p.results || []).filter((r) => r && (r.value || r.label));
  $('#case-idx').textContent = `Réalisation ${pad(i + 1)} / ${pad(P.length)}${p.example ? " · projet d'exemple" : ''}`;
  $('#case-body').innerHTML = `
    <figure class="case__media">
      <img src="${esc(sized(p.cover, 1800))}" alt="${esc(p.alt || p.title)}">
      ${src ? `<button class="case__play" type="button" data-src="${esc(src)}" data-cursor="Lecture"><span class="sr-only">Lire le film</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg></button>` : ''}
    </figure>
    <header class="case__head">
      <h2 class="case__title" id="case-title">${esc(p.title)}</h2>
      <dl class="case__meta mono">
        ${[['Client', p.client], ['Catégorie', p.category], ['Année', p.year], ['Format', p.format]]
          .filter(([, v]) => v)
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
          .join('')}
      </dl>
    </header>
    <div class="case__cols">
      ${p.brief ? `<section><h3 class="mono">Le brief</h3><p>${esc(p.brief)}</p></section>` : ''}
      ${p.approach ? `<section><h3 class="mono">Notre réponse</h3><p>${esc(p.approach)}</p></section>` : ''}
      ${(p.delivered || []).length ? `<section><h3 class="mono">Ce qu'on a livré</h3><ul class="case__list">${p.delivered.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></section>` : ''}
      ${results.length ? `<section><h3 class="mono">En chiffres</h3>${resultsHTML(results)}</section>` : ''}
      ${p.credits ? `<section><h3 class="mono">Crédits</h3><p class="case__credits">${esc(p.credits)}</p></section>` : ''}
    </div>
    ${P.length > 1 ? `<button class="case__next" type="button" data-next="${next}"><span class="mono">Réalisation suivante</span><span>${esc(P[next].title)}</span></button>` : ''}`;
  $('#case-body').scrollTop = 0;
  if (!dlg.open) {
    dlg.showModal();
    lenis?.stop();
  }
  if (!reduce && gsap) {
    gsap.fromTo('.case__media', { clipPath: 'inset(12% 8% 12% 8% round 12px)', opacity: swap ? 0 : 1 }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', opacity: 1, duration: 1.1, ease: 'expo.out' });
    gsap.from('.case__head > *, .case__cols > *', { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.15 });
  }
}

function closeCase() {
  const dlg = $('#case');
  if (!dlg.open) return;
  if (reduce || !gsap) return dlg.close();
  gsap.to(dlg, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => (dlg.close(), gsap.set(dlg, { opacity: 1 })) });
}

/* ------------------------------------------------------------------ */
/* Liens, crédits, admin                                                */
/* ------------------------------------------------------------------ */
function goTo(el, instant = false) {
  if (!el) return;
  if (el.id === 'realisations' && !$('body').classList.contains('is-static')) return goToProject(0, instant);
  if (lenis && !instant) lenis.scrollTo(el, { duration: 1.6, offset: el.id === 'top' ? 0 : -10 });
  else el.scrollIntoView({ behavior: instant || reduce ? 'auto' : 'smooth' });
}

function bindLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const el = $(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    goTo(el);
    history.replaceState(null, '', a.getAttribute('href') === '#top' ? location.pathname + location.search : a.getAttribute('href'));
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
      if (s.portfolio) Object.assign(link, { href: s.portfolio, target: '_blank', rel: 'noopener' });
      if (s.whatsapp) {
        const text = encodeURIComponent("Bonjour, j'ai vu la démo Stickprod. Je voudrais un site comme celui-ci.");
        wa.href = `https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}?text=${text}`;
      }
    })
    .catch(() => {});
}

function showLocalPill() {
  const pill = $('#local-pill');
  pill.hidden = false;
  $('#local-reset').addEventListener('click', () => {
    resetLocal();
    location.reload();
  });
}

// aperçu dans l'admin : l'admin demande d'aller au film qu'on modifie
function listenAdmin() {
  if (!PREVIEW) return;
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.type === 'goto-project') goToProject(clamp(e.data.index, 0, P.length - 1), true);
    if (e.data.type === 'goto' && $(e.data.target)) goTo($(e.data.target), true);
  });
  addEventListener('scroll', () => sessionStorage.setItem('stickprod:preview-scroll', String(scrollY)), { passive: true });
}
