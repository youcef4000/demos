// Dar Nour — orchestration : chargement, visite 3D pilotée par le scroll, animations des sections.
const { gsap, ScrollTrigger, SplitText, Lenis } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const mobile = coarse || innerWidth < 820;

// Ordre des pièces (doit suivre le chemin de caméra de scene.js ; sert aussi sans WebGL).
const STOPS = [
  { id: 'accueil', knot: 0 }, { id: 'entree', knot: 2 }, { id: 'sejour', knot: 4 }, { id: 'cuisine', knot: 6 },
  { id: 'suite', knot: 9 }, { id: 'bain', knot: 11 }, { id: 'terrasse', knot: 14 }, { id: 'vue', knot: 16 },
];

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

main().catch((err) => {
  console.error(err);
  document.body.classList.remove('is-loading');
  $('#loader')?.remove();
});

async function main() {
  const loaderEl = $('#loader');
  if (!gsap || !ScrollTrigger) {
    document.body.classList.remove('is-loading');
    loaderEl?.remove();
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
  const fake = gsap.to(load, { v: 86, duration: 2.6, ease: 'power2.out', onUpdate: paint });

  // --- défilement doux (ordinateur ; le tactile garde le défilement natif)
  let lenis = null;
  if (!reduce && Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // --- 3D
  let apt = null;
  try {
    const { createApartment } = await import('./scene.js');
    apt = createApartment($('#scene'), { mobile, reducedMotion: reduce });
    await Promise.race([apt.warm(), wait(6000)]);
  } catch (err) {
    console.warn('Visite 3D indisponible, images fixes à la place.', err);
    apt = null;
    document.documentElement.classList.add('no-webgl');
  }

  buildVisit(apt, lenis);
  buildSections(lenis);
  buildNav();
  bindLinks(lenis);
  studioCredit();

  await Promise.race([document.fonts ? document.fonts.ready : null, wait(2500)]);
  fake.kill();
  gsap.to(load, { v: 100, duration: 0.45, ease: 'power1.out', onUpdate: paint });
  gsap.to(loaderEl, {
    yPercent: -100, duration: 1.15, ease: 'expo.inOut', delay: 0.5,
    onComplete: () => loaderEl.remove(),
  });
  document.body.classList.remove('is-loading');
  lenis?.start();
  ScrollTrigger.refresh();
  if (location.hash && $(location.hash)) setTimeout(() => scrollToTarget($(location.hash), lenis, true), 900);
  intro(apt);
}

/* ------------------------------------------------------------------ */
/* Visite : un seul timeline GSAP, lié au scroll de la section #visite  */
/* ------------------------------------------------------------------ */
function buildVisit(apt, lenis) {
  const visit = $('#visite');
  const stops = apt ? apt.stops : STOPS;
  const roomEl = (id) => $(`.room[data-stop="${id}"]`);
  const img = (id) => $(`#fallback img[data-stop="${id}"]`);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const labels = { accueil: 0 };
  const HOLD = 0.75;
  let t = 0.5;

  tl.to('.hero', { autoAlpha: 0, y: -50, duration: 0.45, ease: 'power2.in' }, 0.3);
  tl.to('.scroll-hint', { autoAlpha: 0, duration: 0.2 }, 0.05);
  if (!apt) tl.set(img('accueil'), { autoAlpha: 1 }, 0);

  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1], b = stops[i];
    const dur = 1.15 + 0.2 * (b.knot - a.knot - 1);
    if (apt) {
      tl.to(apt.state, { u: b.knot, duration: dur, ease: 'power1.inOut' }, t);
    } else {
      tl.to(img(a.id), { autoAlpha: 0, duration: dur * 0.5 }, t + dur * 0.3);
      tl.fromTo(img(b.id), { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: dur * 0.6, immediateRender: false }, t + dur * 0.35);
    }
    const prev = roomEl(a.id);
    if (prev) tl.to(prev, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power1.in' }, t);
    t += dur;
    labels[b.id] = t;
    const el = roomEl(b.id);
    if (el) {
      tl.set(el, { autoAlpha: 1, y: 0 }, t - 0.34);
      tl.fromTo(el.children, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.05, ease: 'power2.out', immediateRender: false }, t - 0.34);
    }
    t += HOLD;
  }
  if (apt) {
    tl.to(apt.state, { door: 1, duration: 0.7, ease: 'power2.inOut' }, 0.5);
    tl.to(apt.state, { slide: 1, duration: 0.45, ease: 'power2.inOut' }, labels.bain + HOLD - 0.05);
  }
  tl.to({}, { duration: 0.3 }, t);

  const unit = mobile ? 58 : 72; // hauteur de scroll (vh) par seconde de timeline
  visit.style.height = `${Math.round(tl.duration() * unit + 100)}vh`;

  // progression + pièce courante
  const barEl = $('#progress');
  const railBtns = $$('.rail button');
  const order = stops.map((s) => s.id);
  let current = '';
  const sync = () => {
    barEl.style.transform = `scaleX(${tl.progress().toFixed(4)})`;
    const time = tl.time();
    let id = 'accueil';
    for (const s of order) if (time >= labels[s] - 0.35) id = s;
    if (id !== current) {
      current = id;
      railBtns.forEach((b) => (b.dataset.go === id ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    }
  };
  tl.eventCallback('onUpdate', sync);

  const st = ScrollTrigger.create({
    trigger: visit,
    start: 'top top',
    end: 'bottom bottom',
    animation: reduce ? undefined : tl,
    scrub: reduce ? false : mobile ? 0.7 : 1.1,
    onUpdate(self) {
      if (!reduce) return;
      // mouvement réduit : on passe d'une pièce à l'autre sans travelling
      const target = self.progress * tl.duration();
      let lt = 0;
      for (const s of order) if (target >= labels[s] - 0.6) lt = labels[s];
      if (Math.abs(tl.time() - lt) > 0.01) tl.time(lt);
    },
  });

  if (location.search.includes('debug')) window.darNour = { tl, labels, st, apt };

  railBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const y = st.start + (labels[b.dataset.go] / tl.duration()) * (st.end - st.start) + 2;
      if (lenis) lenis.scrollTo(y, { duration: 2.4 });
      else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }),
  );

  // rendu uniquement quand la visite est à l'écran
  if (!apt) return;
  let active = true;
  ScrollTrigger.create({ trigger: visit, start: 'top bottom', end: 'bottom top', onToggle: (s) => (active = s.isActive) });
  let still = 0, sig = '', skip = false, acc = 0;
  gsap.ticker.add((time, dt) => {
    if (!active || document.hidden) return;
    const now = `${apt.state.u.toFixed(4)}|${apt.state.pull.toFixed(3)}|${apt.pointer.x.toFixed(3)}`;
    still = now === sig ? still + dt : 0;
    sig = now;
    acc += dt;
    // à l'arrêt, 30 images/s suffisent pour la mer, le feu et l'eau (économie de batterie)
    skip = still > 1200 && !skip;
    if (skip) return;
    apt.render(Math.min(acc, 80) / 1000);
    acc = 0;
    if (still === 0) apt.adapt(dt);
  });
  if (!coarse) {
    addEventListener('pointermove', (e) => apt.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
  }
  let w = innerWidth, h = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === w && Math.abs(innerHeight - h) < 160) return;
    w = innerWidth;
    h = innerHeight;
    apt.resize();
  });
}

function intro(apt) {
  if (reduce) {
    gsap.from('.hero, .nav', { autoAlpha: 0, duration: 0.6, delay: 0.6 });
    return;
  }
  if (apt) gsap.fromTo(apt.state, { pull: 2.4 }, { pull: 0, duration: 3.2, ease: 'expo.out', delay: 0.45 });
  const split = SplitText.create('.hero__title', { type: 'lines', mask: 'lines' });
  gsap.timeline({ delay: 0.8 })
    .from(split.lines, { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.12 })
    .from('.hero__eyebrow', { autoAlpha: 0, y: 14, duration: 0.8, ease: 'power2.out' }, 0.05)
    .from('.hero__lead', { autoAlpha: 0, y: 18, duration: 0.9, ease: 'power2.out' }, 0.4)
    .from('.scroll-hint', { autoAlpha: 0, duration: 0.8 }, 0.8)
    .from('.nav', { yPercent: -100, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.2);
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */
function buildSections() {
  if (reduce) {
    $('.types').classList.add('types--static');
    $$('[data-count]').forEach((el) => (el.textContent = el.dataset.count));
    $$('.timeline__line i').forEach((i) => (i.style.transform = 'none'));
    return;
  }

  // apparitions simples
  $$('[data-reveal]').forEach((el) =>
    gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
  );
  // titres : lignes qui montent derrière un masque
  $$('[data-split]').forEach((el) =>
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 108, duration: 1.25, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    }),
  );
  // manifeste : les mots s'allument au fil du scroll
  SplitText.create('.manifesto__text', {
    type: 'words', autoSplit: true,
    onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.13 }, { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: '.manifesto__text', start: 'top 82%', end: 'bottom 48%', scrub: true } }),
  });
  // compteurs
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: +(el.dataset.from || 0) };
    el.textContent = o.v;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  // typologies : défilement horizontal épinglé
  const types = $('.types'), track = $('.types__track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const setH = () => (types.style.height = `${innerHeight + dist()}px`);
  setH();
  ScrollTrigger.addEventListener('refreshInit', setH);
  const hTween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: types, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
  });
  $$('.type').forEach((card, i) => {
    gsap.fromTo($('img', card), { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
    if (i > 0) gsap.fromTo(card, { y: 60, rotate: 3 }, { y: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left 105%', end: 'left 55%', scrub: true } });
  });

  // plan : les murs se dessinent, puis le mobilier et les noms des pièces
  gsap.timeline({ scrollTrigger: { trigger: '.plan__figure', start: 'top 82%', end: 'bottom 80%', scrub: 0.8 } })
    .fromTo('.plan .w', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.07 })
    .from('.plan .f', { autoAlpha: 0, duration: 0.3, stagger: 0.03 }, 0.6)
    .from('.plan .pool', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.5 }, 0.8)
    .from('.plan .lbl', { autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 0.95);
  $$('.plan__list li').forEach((li) => {
    const zone = $(`.zone[data-room="${li.dataset.room}"]`);
    const on = (v) => {
      li.classList.toggle('is-on', v);
      zone?.classList.toggle('is-on', v);
    };
    li.addEventListener('pointerenter', () => on(true));
    li.addEventListener('pointerleave', () => on(false));
    if (coarse) ScrollTrigger.create({ trigger: li, start: 'top 62%', end: 'bottom 62%', onToggle: (s) => on(s.isActive) });
  });

  // prestations : cartes empilées
  const cards = $$('.card');
  cards.forEach((c, i) => c.style.setProperty('--i', i));
  cards.forEach((c, i) => {
    if (i === cards.length - 1) return;
    gsap.to(c, { scale: 0.9, '--shade': 0.5, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 25%', scrub: true } });
  });

  // quartier : bandeau qui accélère avec le scroll, carte qui se dessine
  const loop = gsap.to('.marquee__track', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    trigger: '.place', start: 'top bottom', end: 'bottom top',
    onUpdate: (s) => {
      const dir = s.direction, boost = 1 + Math.min(Math.abs(s.getVelocity()) / 220, 9);
      gsap.to(loop, { timeScale: dir * boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: dir, duration: 1.4, ease: 'power2.out' }) });
    },
  });
  gsap.timeline({ scrollTrigger: { trigger: '.map', start: 'top 85%', end: 'center 50%', scrub: 0.8 } })
    .fromTo('.map__coast', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 })
    .from('.map__sea', { autoAlpha: 0, duration: 0.6 }, 0.2)
    .from('.map__bay', { autoAlpha: 0, y: 10, duration: 0.4 }, 0.5)
    .from('.map__pin', { scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(2)' }, 0.6)
    .fromTo('.map__route', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15 }, 0.8)
    .from('.map__pts > *', { autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 1);

  // chantier : la ligne d'avancement se remplit jusqu'à l'étape en cours
  const mm = gsap.matchMedia();
  const fill = (prop) => gsap.fromTo('.timeline__line i', { [prop]: 0 }, { [prop]: 0.42, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 78%', end: 'bottom 55%', scrub: true } });
  mm.add('(min-width: 760px)', () => fill('scaleX'));
  mm.add('(max-width: 759px)', () => fill('scaleY'));
  gsap.from('.step', { autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.timeline', start: 'top 82%', once: true } });

  // boutons « aimantés » (souris uniquement)
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

// navigation : se cache en descendant, réapparaît en remontant ; passe en clair sur fond clair
function buildNav() {
  const nav = $('#nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => nav.classList.toggle('nav--hidden', s.direction === 1 && s.scroll() > 140),
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
    if (a.dataset.type) {
      const sel = $('#f-type');
      [...sel.options].forEach((o) => (o.selected = o.text === a.dataset.type));
    }
    scrollToTarget(target, lenis);
  });
}

// crédit du studio (lu dans la galerie, un dossier plus haut)
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
        const text = encodeURIComponent("Bonjour, j'ai vu la démo Dar Nour. Je voudrais un site comme celui-ci pour ma promotion.");
        wa.href = `https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}?text=${text}`;
      }
    })
    .catch(() => {});
}
