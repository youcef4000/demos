// Villa Lumen — visite au scroll en photos : on franchit chaque pièce par une porte en arche,
// le plan de la pièce se dessine à côté. Puis animations de toutes les sections.
import { ROOMS, roomSVG, keySVG, palmSVG, plotSVG } from './plans.js';

const { gsap, ScrollTrigger, SplitText, Lenis } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const mobile = coarse || innerWidth < 820;
const fr = (n) => String(n).replace('.', ',');

// plan affiché pour chaque étape de la visite
const VIEWS = {
  accueil: { name: 'Palm Jumeirah · palme N', svg: () => palmSVG({ compact: true }) },
  villa: { name: 'Parcelle · 1 100 m²', svg: plotSVG },
  entree: { room: 'entree' },
  sejour: { room: 'sejour' },
  cuisine: { room: 'cuisine' },
  suite: { room: 'suite' },
  bain: { room: 'bain' },
  bassin: { room: 'terrasse', key: 'terrasse' },
  soir: { name: 'Marina · Burj Al Arab · Downtown', svg: () => palmSVG({ compact: true, routes: true }) },
};
for (const v of Object.values(VIEWS)) {
  if (!v.room) continue;
  const R = ROOMS[v.room];
  v.name = `${R.name} · ${fr(R.w)} × ${fr(R.h)} m`;
  v.svg = () => roomSVG(v.room);
  v.key = v.key || v.room;
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

main().catch((err) => {
  console.error(err);
  document.body.classList.remove('is-loading');
  $('#loader')?.remove();
});

async function main() {
  const loaderEl = $('#loader');
  buildPlans();
  if (!gsap || !ScrollTrigger) {
    document.body.classList.remove('is-loading');
    loaderEl?.remove();
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (!location.hash) scrollTo(0, 0);

  // --- chargement : on attend les premières photos de la visite
  const pct = $('#pct'), bar = $('#loader-bar');
  const load = { v: 0 };
  const paint = () => {
    pct.textContent = Math.round(load.v);
    bar.style.transform = `scaleX(${load.v / 100})`;
  };
  const imgs = $$('.shot img');
  let done = 0;
  const bump = () => {
    done++;
    gsap.to(load, { v: Math.min(96, (done / imgs.length) * 100), duration: 0.4, onUpdate: paint, overwrite: true });
  };
  const ready = imgs.slice(0, 3).map((img) =>
    img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener('load', r, { once: true }) || img.addEventListener('error', r, { once: true })),
  );
  imgs.forEach((img) => (img.complete ? bump() : (img.addEventListener('load', bump, { once: true }), img.addEventListener('error', bump, { once: true }))));

  let lenis = null;
  if (!reduce && Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  buildVisit(lenis);
  buildSections();
  buildNav();
  bindLinks(lenis);
  studioCredit();

  await Promise.race([Promise.all([...ready, document.fonts ? document.fonts.ready : null]), wait(5000)]);
  gsap.to(load, { v: 100, duration: 0.4, onUpdate: paint, overwrite: true });
  gsap.to(loaderEl, { yPercent: -100, duration: 1.15, ease: 'expo.inOut', delay: 0.45, onComplete: () => loaderEl.remove() });
  document.body.classList.remove('is-loading');
  lenis?.start();
  ScrollTrigger.refresh();
  if (location.hash && $(location.hash)) setTimeout(() => scrollToTarget($(location.hash), lenis, true), 900);
  intro();
}

/* ------------------------------------------------------------------ */
/* Plans (SVG générés)                                                 */
/* ------------------------------------------------------------------ */
function buildPlans() {
  const views = $('#plan-views');
  for (const [id, v] of Object.entries(VIEWS)) {
    const el = document.createElement('div');
    el.className = 'pv';
    el.dataset.stop = id;
    el.innerHTML = v.svg();
    views.append(el);
  }
  $('#plan-key').innerHTML = keySVG();
  $('#plan-big').innerHTML = keySVG();
  $('#palm-map').insertAdjacentHTML('afterbegin', palmSVG({ routes: true }));
}

// animation d'apparition d'un plan : murs tracés, cotes, mobilier, point de vue
function drawPlan(tl, pv, at, dur = 0.6) {
  const strokes = $$('.pw, .pwin, .pdoor, .pedge, .pdim path, .palm__coast, .palm__trunk, .palm__frond, .palm__crescent, .palm__route', pv);
  const fills = $$('.pf, .ppool, .kroom, .kpool, .kbeach, .plot__sea, .plot__land, .palm__pts circle', pv);
  const texts = $$('text', pv);
  const cam = $$('.pcam, .palm__pin', pv);
  tl.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur * 0.7, stagger: (dur * 0.3) / Math.max(1, strokes.length), ease: 'power2.out', immediateRender: false }, at);
  if (fills.length) tl.fromTo(fills, { opacity: 0 }, { opacity: 1, duration: dur * 0.4, stagger: 0.02, immediateRender: false }, at + dur * 0.35);
  if (texts.length) tl.fromTo(texts, { opacity: 0 }, { opacity: 1, duration: dur * 0.3, stagger: 0.02, immediateRender: false }, at + dur * 0.55);
  if (cam.length) tl.fromTo(cam, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: dur * 0.35, ease: 'back.out(2.5)', immediateRender: false }, at + dur * 0.6);
}

/* ------------------------------------------------------------------ */
/* Visite                                                              */
/* ------------------------------------------------------------------ */
function buildVisit(lenis) {
  const visit = $('#visite'), stage = $('.visit__stage'), door = $('.door');
  const shots = $$('.shot');
  const ids = shots.map((s) => s.dataset.stop);
  const room = (id) => $(`.room[data-stop="${id}"]`);
  const pv = (id) => $(`.pv[data-stop="${id}"]`);
  const img = (s) => $('img', s);

  // géométrie de la porte (arche) lue sur l'élément .door, en px : recalculée à chaque refresh
  const box = () => {
    const s = stage.getBoundingClientRect();
    const d = door.getBoundingClientRect();
    const cs = getComputedStyle(door);
    const top = parseFloat(cs.top), left = parseFloat(cs.left), right = parseFloat(cs.right), bottom = parseFloat(cs.bottom);
    return { top, left, right, bottom, r: (s.width - left - right) / 2 || d.width / 2 };
  };
  const doorClip = () => {
    const b = box();
    return `inset(${b.top}px ${b.right}px ${b.bottom}px ${b.left}px round ${b.r}px ${b.r}px 0px 0px)`;
  };
  const FULL = 'inset(0px 0px 0px 0px round 0px 0px 0px 0px)';
  // on garde la position CSS de la porte : GSAP anime une copie
  const frame = door.cloneNode();
  frame.className = 'door door--anim';
  door.after(frame);
  door.style.visibility = 'hidden';

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const labels = { [ids[0]]: 0 };
  const D = 1.3, HOLD = 0.95;
  let t = 0.55;

  gsap.set(pv(ids[0]), { autoAlpha: 1 });
  gsap.set($('.plancard'), { autoAlpha: 1 });
  tl.to('.hero', { autoAlpha: 0, y: -60, duration: 0.5, ease: 'power2.in' }, 0.3);
  tl.to('.scroll-hint', { autoAlpha: 0, duration: 0.2 }, 0.05);
  tl.fromTo(img(shots[0]), { scale: 1.12 }, { scale: 1.0, duration: 0.55 }, 0);

  for (let i = 1; i < shots.length; i++) {
    const prev = shots[i - 1], next = shots[i];
    const a = ids[i - 1], b = ids[i];
    // la pièce actuelle « avance » vers nous, la suivante apparaît dans l'arche puis l'envahit
    tl.to(img(prev), { scale: 1.65, duration: D, ease: 'power2.in' }, t);
    tl.set(next, { visibility: 'visible' }, t);
    tl.fromTo(next, { clipPath: doorClip }, { clipPath: FULL, duration: D, ease: 'power3.inOut', immediateRender: false }, t);
    tl.fromTo(img(next), { scale: 1.5, xPercent: 0 }, { scale: 1.12, duration: D, ease: 'power2.out', immediateRender: false }, t);
    tl.fromTo(frame,
      { top: () => box().top, left: () => box().left, right: () => box().right, bottom: () => box().bottom, opacity: 1 },
      { top: -80, left: -80, right: -80, bottom: -80, opacity: 0, duration: D * 0.9, ease: 'power3.inOut', immediateRender: false }, t);
    tl.set(prev, { visibility: 'hidden' }, t + D);
    // lent travelling pendant l'arrêt
    tl.to(img(next), { scale: 1.02, xPercent: i % 2 ? -2.5 : 2.5, duration: HOLD }, t + D);

    // légendes et plans
    if (room(a)) tl.to(room(a), { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power1.in' }, t);
    tl.to(pv(a), { autoAlpha: 0, duration: 0.25 }, t);
    const el = room(b);
    if (el) {
      tl.set(el, { autoAlpha: 1, y: 0 }, t + D - 0.35);
      tl.fromTo(el.children, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', immediateRender: false }, t + D - 0.35);
    }
    tl.set(pv(b), { autoAlpha: 1 }, t + D - 0.3);
    drawPlan(tl, pv(b), t + D - 0.3, 0.75);

    t += D;
    labels[b] = t;
    t += HOLD;
  }
  tl.to({}, { duration: 0.3 }, t);

  const unit = mobile ? 54 : 68; // hauteur de scroll (vh) par seconde de timeline
  visit.style.height = `${Math.round(tl.duration() * unit + 100)}vh`;

  // progression, pièce courante, nom du plan, pièce allumée sur le plan d'ensemble
  const barEl = $('#progress'), nameEl = $('#plan-name');
  const railBtns = $$('.rail button');
  let current = '';
  const sync = () => {
    barEl.style.transform = `scaleX(${tl.progress().toFixed(4)})`;
    let id = ids[0];
    for (const s of ids) if (tl.time() >= labels[s] - 0.4) id = s;
    if (id === current) return;
    current = id;
    railBtns.forEach((b) => (b.dataset.go === id ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    nameEl.textContent = VIEWS[id].name;
    $$('#plan-key .kroom').forEach((r) => r.classList.toggle('is-on', r.dataset.room === VIEWS[id].key));
  };
  tl.eventCallback('onUpdate', sync);
  sync();

  const st = ScrollTrigger.create({
    trigger: visit, start: 'top top', end: 'bottom bottom',
    animation: reduce ? undefined : tl,
    scrub: reduce ? false : mobile ? 0.6 : 1,
    invalidateOnRefresh: true,
    onUpdate(self) {
      if (!reduce) return;
      // mouvement réduit : on passe d'une pièce à l'autre, sans travelling
      const target = self.progress * tl.duration();
      let lt = 0;
      for (const s of ids) if (target >= labels[s] - 0.6) lt = labels[s] + 0.8;
      if (Math.abs(tl.time() - lt) > 0.01) tl.time(lt);
    },
  });

  railBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const y = st.start + ((labels[b.dataset.go] + 0.2) / tl.duration()) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 2.2 });
      else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }),
  );
  if (location.search.includes('debug')) window.villa = { tl, labels, st };
}

function intro() {
  if (reduce) {
    gsap.from('.hero, .nav, .plancard', { autoAlpha: 0, duration: 0.6, delay: 0.5 });
    return;
  }
  const split = SplitText.create('.hero__title', { type: 'lines', mask: 'lines' });
  const tl = gsap.timeline({ delay: 0.75 });
  tl.fromTo('.shot:first-child img', { scale: 1.45 }, { scale: 1.12, duration: 2.6, ease: 'expo.out' }, 0)
    .from(split.lines, { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.12 }, 0.1)
    .from('.hero__eyebrow', { autoAlpha: 0, y: 14, duration: 0.8 }, 0.15)
    .from('.hero__lead', { autoAlpha: 0, y: 18, duration: 0.9 }, 0.45)
    .from('.scroll-hint', { autoAlpha: 0, duration: 0.8 }, 0.9)
    .fromTo('.nav', { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, ease: 'expo.out' }, 0.25)
    .from('.plancard', { autoAlpha: 0, y: 20, duration: 0.8, ease: 'power3.out' }, 0.7);
  const first = $('.pv');
  const draw = gsap.timeline();
  drawPlan(draw, first, 0, 1.2);
  tl.add(draw, 0.9);
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */
function buildSections() {
  if (reduce) {
    $('.types').classList.add('types--static');
    $$('.timeline__line i').forEach((i) => (i.style.transform = 'none'));
    return;
  }

  $$('[data-reveal]').forEach((el) =>
    gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
  );
  $$('[data-split]').forEach((el) =>
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 108, duration: 1.25, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    }),
  );
  SplitText.create('.manifesto__text', {
    type: 'words', autoSplit: true,
    onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.13 }, { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: '.manifesto__text', start: 'top 82%', end: 'bottom 48%', scrub: true } }),
  });
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: +(el.dataset.from || 0) };
    el.textContent = o.v;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  // villas : défilement horizontal épinglé, photos en parallaxe
  const types = $('.types'), track = $('.types__track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const setH = () => (types.style.height = `${innerHeight + dist()}px`);
  setH();
  ScrollTrigger.addEventListener('refreshInit', setH);
  const hTween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: types, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
  $$('.type').forEach((card, i) => {
    gsap.fromTo($('img', card), { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
    if (i > 0) gsap.fromTo(card, { y: 60, rotate: 3 }, { y: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left 105%', end: 'left 55%', scrub: true } });
  });

  // plan du rez-de-jardin : les pièces se posent une à une, la liste les allume
  gsap.timeline({ scrollTrigger: { trigger: '#plan-big', start: 'top 80%', end: 'center 55%', scrub: 0.8 } })
    .from('#plan-big .kbeach', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.4 })
    .from('#plan-big .kroom', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', stagger: 0.08, duration: 0.4 }, 0.1)
    .from('#plan-big .kpool', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.5 }, 0.6)
    .from('#plan-big .klbl', { opacity: 0, stagger: 0.04, duration: 0.3 }, 0.7);
  $$('.plan__list li').forEach((li) => {
    const zone = $(`#plan-big .kroom[data-room="${li.dataset.room}"]`);
    const on = (v) => {
      li.classList.toggle('is-on', v);
      zone?.classList.toggle('is-on', v);
    };
    li.addEventListener('pointerenter', () => on(true));
    li.addEventListener('pointerleave', () => on(false));
    ScrollTrigger.create({ trigger: li, start: 'top 60%', end: 'bottom 60%', onToggle: (s) => coarse && on(s.isActive) });
  });

  // prestations : cartes photo empilées
  const cards = $$('.card');
  cards.forEach((c, i) => {
    c.style.setProperty('--i', i);
    gsap.fromTo($('img', c), { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 20%', scrub: true } });
    if (i < cards.length - 1) gsap.to(c, { scale: 0.9, '--shade': 0.5, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 25%', scrub: true } });
  });

  // quartier : bandeau piloté par la vitesse du scroll, palm qui se dessine, photos qui s'ouvrent
  const loop = gsap.to('.marquee__track', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    trigger: '.place', start: 'top bottom', end: 'bottom top',
    onUpdate: (s) => {
      const dir = s.direction, boost = 1 + Math.min(Math.abs(s.getVelocity()) / 220, 9);
      gsap.to(loop, { timeScale: dir * boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: dir, duration: 1.4, ease: 'power2.out' }) });
    },
  });
  gsap.timeline({ scrollTrigger: { trigger: '#palm-map', start: 'top 85%', end: 'center 45%', scrub: 0.8 } })
    .fromTo('#palm-map .palm__coast', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5 })
    .fromTo('#palm-map .palm__trunk', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4 }, 0.2)
    .fromTo('#palm-map .palm__frond', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, stagger: 0.03 }, 0.4)
    .fromTo('#palm-map .palm__crescent', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6 }, 0.6)
    .from('#palm-map .palm__sea, #palm-map .palm__lbl', { opacity: 0, duration: 0.3 }, 0.9)
    .from('#palm-map .palm__pin', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2)' }, 1)
    .fromTo('#palm-map .palm__route', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12 }, 1.1)
    .from('#palm-map .palm__pts > *', { opacity: 0, duration: 0.2, stagger: 0.04 }, 1.4);
  $$('.spot').forEach((s, i) => {
    gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 88%', once: true }, delay: mobile ? 0 : i * 0.12 })
      .fromTo($('figure', s), { clipPath: 'inset(100% 0% 0% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.2, ease: 'expo.out' })
      .fromTo($('img', s), { scale: 1.35 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0)
      .from($('.spot__t', s), { autoAlpha: 0, y: 16, duration: 0.7 }, 0.3);
  });

  // paiement : la ligne se remplit jusqu'à l'étape en cours
  const mm = gsap.matchMedia();
  const fill = (prop) => gsap.fromTo('.timeline__line i', { [prop]: 0 }, { [prop]: 0.5, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 78%', end: 'bottom 55%', scrub: true } });
  mm.add('(min-width: 760px)', () => fill('scaleX'));
  mm.add('(max-width: 759px)', () => fill('scaleY'));
  gsap.from('.step', { autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.timeline', start: 'top 82%', once: true } });

  if (!coarse) {
    $$('.btn').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  // formulaire (démo : rien n'est envoyé)
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    let ok = true;
    for (const name of ['nom', 'tel']) {
      const input = f.elements[name];
      const bad = !input.value.trim();
      input.closest('.field').classList.toggle('is-bad', bad);
      if (bad && ok) input.focus();
      if (bad) ok = false;
    }
    if (!ok) return;
    const msg = $('#form-ok');
    msg.hidden = false;
    gsap.from(msg, { autoAlpha: 0, y: 10, duration: 0.6 });
    f.querySelector('button[type="submit"]').disabled = true;
  });
}

function buildNav() {
  const nav = $('#nav');
  let hidden = false;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      const h = s.direction === 1 && s.scroll() > 140;
      if (h === hidden) return;
      hidden = h;
      gsap.to(nav, { yPercent: h ? -110 : 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    },
  });
  const lit = new Set();
  $$('.light').forEach((sec) =>
    ScrollTrigger.create({
      trigger: sec, start: 'top 36px', end: 'bottom 36px',
      onToggle: (s) => {
        s.isActive ? lit.add(sec) : lit.delete(sec);
        nav.classList.toggle('nav--light', lit.size > 0);
      },
    }),
  );
}

function scrollToTarget(target, lenis, instant = false) {
  if (lenis) lenis.scrollTo(target, { duration: instant ? 0 : 1.8, immediate: instant });
  else target.scrollIntoView({ behavior: reduce || instant ? 'auto' : 'smooth' });
}

function bindLinks(lenis) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    const target = hash.length > 1 && $(hash);
    if (!target) return;
    e.preventDefault();
    if (a.dataset.type) [...$('#f-type').options].forEach((o) => (o.selected = o.text === a.dataset.type));
    scrollToTarget(target, lenis);
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
        const text = encodeURIComponent("Bonjour, j'ai vu la démo Villa Lumen. Je voudrais un site comme celui-ci pour mon projet.");
        wa.href = `https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}?text=${text}`;
      }
    })
    .catch(() => {});
}
