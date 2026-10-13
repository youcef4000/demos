// Hooked Academy — landing. GSAP ScrollTrigger + Lenis ; three.js pour le labo IA.
// Fil rouge : la page suit elle-même la structure enseignée (Hook → Body → CTA),
// l'indicateur en bas à droite le montre pendant le scroll.

import { logoInner, markSVG, LEGS } from './brand.js';
import { icon } from './icons.js';
import { product, person, BG } from '../../motion/art.js';
import { MODULES, PARTS, allLessons } from '../../data/programme.js';
import { addApplication } from './store.js';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;
if (reduce) root.classList.add('reduce');
if (!gsap || !ST) root.classList.add('no-pin');

const LESSONS = allLessons();

/* ------------------------------------------------------------------ */
/* Contenus générés                                                    */
/* ------------------------------------------------------------------ */

$('#nav-logo').innerHTML = logoInner();
$('#foot-logo').innerHTML = logoInner();
$$('[data-count="lessons"]').forEach((e) => (e.textContent = LESSONS.length));
$$('[data-count="modules"]').forEach((e) => (e.textContent = MODULES.length));
$('#prog-count').textContent = MODULES.length;
$('#prog-tot').textContent = String(MODULES.length).padStart(2, '0');
$$('.who-i').forEach((e) => (e.innerHTML = icon(e.dataset.icon, { size: 26 })));
$('#aph-prod').innerHTML = product('parfum');

// Bandeau
const words = ['Prompting', 'Images IA', 'Vidéos IA', 'UGC', 'Cinématique', 'Hook · Body · CTA', 'CapCut', 'Canva', 'Clients'];
const mq = $('#marquee');
const chunk = `<span>${words.map((w) => `${w}${markSVG({ solid: '#07060a' })}`).join('')}</span>`;
mq.innerHTML = chunk.repeat(4);

// Fil d'actualité du hero : des mini-créatives d'exemple
const FEED = [
  { t: 'Ton parfum disparaît avant midi ?', art: 'parfum', bg: 'teal', k: 'Vidéo' },
  { t: '3 erreurs qui donnent des boutons', art: 'serum', bg: 'rose', k: 'Carrousel' },
  { t: 'J’ai testé pendant 7 jours', ugc: true, bg: 'cuisine', k: 'UGC' },
  { t: 'Livraison 58 wilayas', art: 'creme', bg: 'sable', k: 'Image' },
  { t: 'Avant / après', art: 'creme', bg: 'bain', k: 'Vidéo' },
  { t: 'Le cadeau de l’Aïd', art: 'parfum', bg: 'or', k: 'Image' },
  { t: 'Ce que personne ne te dit', art: 'serum', bg: 'nuit', k: 'Vidéo' },
  { t: 'Unboxing', ugc: true, bg: 'rose', k: 'UGC', hijab: true },
  { t: '2 gouttes suffisent', art: 'serum', bg: 'teal', k: 'IA' },
  { t: 'Paiement à la livraison', art: 'parfum', bg: 'sable', k: 'Image' },
  { t: 'Spot cinématique', art: 'parfum', bg: 'studio', k: 'IA' },
  { t: 'Mythe ou vérité ?', ugc: true, bg: 'teal', k: 'UGC' },
];
const card = (f) =>
  `<div class="feed-card" style="background:${BG[f.bg]}">${f.ugc ? `<div class="fc-art" style="left:6%;right:6%;top:24%;bottom:0">${person({ mood: 'smile', top: '#55b894', hijab: !!f.hijab })}</div>` : `<div class="fc-art">${product(f.art)}</div>`}<p>${f.t}</p><span>${f.k}</span><em></em></div>`;
const feed = $('#feed');
const nCols = innerWidth < 600 ? 4 : innerWidth < 1100 ? 6 : 8;
const cols = [];
for (let c = 0; c < nCols; c++) {
  const col = document.createElement('div');
  col.className = 'feed-col';
  const list = Array.from({ length: 6 }, (_, i) => FEED[(c * 5 + i * 7) % FEED.length]);
  col.innerHTML = [...list, ...list].map(card).join('');
  feed.appendChild(col);
  cols.push({ el: col, y: -Math.random() * 400, speed: 26 + ((c * 37) % 30) });
}
$('#hero-pick').innerHTML = card({ t: '<b style="color:#fff3c4">Stop.</b> Ton parfum tient combien de temps ?', art: 'parfum', bg: 'teal', k: 'Hooked' });

// Modules du programme (rail horizontal)
const partName = Object.fromEntries(PARTS.map((p) => [p.id, `Partie ${p.n} · ${p.title}`]));
$('#prog-track').innerHTML = MODULES.map(
  (m) => `<article class="mod ${m.part !== 'p1' ? 'is-ai' : ''}" style="--c:${m.color}">
    <span class="mod-n">${String(m.n).padStart(2, '0')}</span>
    <span class="mod-ico">${icon(m.icon, { size: 30 })}</span>
    <p class="mod-part">${partName[m.part]}</p>
    <h3>${m.title}</h3>
    <p class="mod-ar" lang="ar" dir="rtl">${m.ar}</p>
    <p class="mod-p">${m.pitch}</p>
    <ul>${m.lessons
      .slice(0, 4)
      .map((l) => `<li>${l.title}</li>`)
      .join('')}${m.lessons.length > 4 ? `<li class="mod-more">+ ${m.lessons.length - 4} leçon${m.lessons.length - 4 > 1 ? 's' : ''}</li>` : ''}</ul>
  </article>`,
).join('');

// Trois formats
const fph = (kind) => {
  if (kind === 'video')
    return `<div class="fph" data-k="video" style="--c:var(--hook)"><div class="fph-s" style="background:${BG.teal}"><div class="fph-prog"><i></i></div><div class="fc-art">${product('parfum')}</div><p class="fph-hl">Ton parfum tient combien de temps ?</p><div class="fph-btn">Commander</div></div><span class="fph-l">Vidéo</span></div>`;
  if (kind === 'image')
    return `<div class="fph" data-k="image" style="--c:var(--body)"><div class="fph-s" style="background:${BG.sable}"><p class="fph-hl">Une peau nette, <span style="color:#fff3c4">sans effort</span></p><div class="fc-art" style="top:38%">${product('creme')}</div><div class="fph-btn">Découvrir</div></div><span class="fph-l">Image</span></div>`;
  const slides = [
    ['Le problème', 'nuit', 'serum'],
    ['La solution', 'teal', 'serum'],
    ['Comment l’utiliser', 'rose', 'serum'],
    ['Commande', 'or', 'serum'],
  ];
  return `<div class="fph" data-k="car" style="--c:var(--cta)"><div class="fph-s"><div class="fph-car">${slides.map(([t, bg, a]) => `<div style="background:${BG[bg]}"><p class="fph-hl">${t}</p><div class="fc-art">${product(a)}</div></div>`).join('')}</div><div class="fph-btn">Glisse →</div></div><span class="fph-l">Carrousel</span></div>`;
};
$('#fmt-stage').innerHTML = fph('image') + fph('car') + fph('video');

// Monogramme du lien Hooked Lab (état Lab au départ)
$('#hl-mark').innerHTML = markSVG({ lab: true });
$('#done-mark').innerHTML = markSVG({ lab: true });
$$('.bt-wave').forEach((w) => (w.innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="animation-delay:${(-i * 0.09).toFixed(2)}s"></i>`).join('')));

// Manifeste : chaque mot devient un span
const mani = $('#mani');
let hl = false;
mani.innerHTML = mani.textContent
  .split(/(\s+)/)
  .map((w) => {
    if (/^\s+$/.test(w)) return w;
    const open = w.startsWith('*');
    const close = w.replace(/[.,]$/, '').endsWith('*');
    if (open) hl = true;
    const clean = w.replace(/\*/g, '');
    const out = `<span class="mw ${hl ? 'is-hl' : ''}">${clean}</span>`;
    if (close) hl = false;
    return out;
  })
  .join('');

/* ------------------------------------------------------------------ */
/* Navigation, menu, curseur                                           */
/* ------------------------------------------------------------------ */

const nav = $('#nav');
const burger = $('#burger');
const menu = $('#menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && !reduce) gsap?.fromTo($$('#menu a'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5, ease: 'expo.out' });
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    burger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    document.body.style.overflow = '';
  }
});

if (fine && !reduce) {
  root.classList.add('has-cursor');
  const cur = $('#cursor');
  const lab = cur.querySelector('span');
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let cx = x;
  let cy = y;
  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    const t = e.target.closest?.('[data-cursor], a, button, summary, label');
    const txt = t?.dataset?.cursor || '';
    cur.classList.toggle('is-on', !!txt);
    lab.textContent = txt;
    cur.querySelector('i').style.transform = t && !txt ? 'scale(1.5)' : '';
  });
  const loop = () => {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    cur.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  // Boutons magnétiques
  $$('.btn--or').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });
}

/* ------------------------------------------------------------------ */
/* Formulaire d'inscription (fonctionne aussi sans animations)         */
/* ------------------------------------------------------------------ */

const form = $('#form');
const steps = $$('.fs', form);
let stepI = 0;
const next = $('#form-next');
const prev = $('#form-prev');
const err = $('#form-err');
function showStep(i) {
  stepI = i;
  steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
  prev.hidden = i === 0;
  next.textContent = i === steps.length - 1 ? 'Envoyer mon inscription' : 'Continuer';
  $('#form-bar').style.width = `${((i + 1) / steps.length) * 100}%`;
  err.textContent = '';
}
function validStep(i) {
  const fields = $$('input, select, textarea', steps[i]);
  for (const f of fields) {
    f.classList.remove('is-bad');
    if (!f.checkValidity()) {
      f.classList.add('is-bad');
      f.focus();
      const name = f.closest('label')?.querySelector('span')?.textContent?.replace(/\(.*\)/, '').trim();
      err.textContent = f.type === 'checkbox' ? 'Coche la case pour que l’équipe puisse te contacter.' : `Vérifie le champ « ${name} ».`;
      return false;
    }
  }
  return true;
}
next.addEventListener('click', () => {
  if (!validStep(stepI)) return;
  if (stepI < steps.length - 1) return showStep(stepI + 1);
  const data = Object.fromEntries(new FormData(form).entries());
  const app = addApplication(data);
  $('#done-name').textContent = app.name.split(/\s+/)[0] || '';
  const done = $('#form-done');
  done.hidden = false;
  done.focus();
  if (gsap && !reduce) {
    gsap.fromTo(done, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(150% at 50% 100%)', duration: 0.9, ease: 'expo.inOut' });
    const legs = $$('#done-mark .ha-leg');
    const p = { t: 0 };
    gsap.to(p, {
      t: 1,
      duration: 1,
      delay: 0.6,
      ease: 'expo.inOut',
      onUpdate: () =>
        legs.forEach((l, i) => {
          const v = LEGS.lab[i].map((x, k) => x + (LEGS.academy[i][k] - x) * p.t);
          l.setAttribute('d', `M${v[0].toFixed(2)} ${v[1].toFixed(2)} ${v[2].toFixed(2)} ${v[3].toFixed(2)}`);
        }),
    });
  } else {
    $$('#done-mark .ha-leg').forEach((l, i) => l.setAttribute('d', `M${LEGS.academy[i].slice(0, 2).join(' ')} ${LEGS.academy[i].slice(2).join(' ')}`));
  }
});
prev.addEventListener('click', () => showStep(Math.max(0, stepI - 1)));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  next.click();
});
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    next.click();
  }
});
showStep(0);

/* ------------------------------------------------------------------ */
/* Labo IA (3D)                                                        */
/* ------------------------------------------------------------------ */

const TOKENS = [
  { t: 'Flacon de parfum ambré,', tag: 'Sujet', c: 'var(--hook)' },
  { t: 'bouchon doré,', tag: 'Sujet', c: 'var(--hook)' },
  { t: 'posé sur du marbre noir,', tag: 'Décor', c: 'var(--body)' },
  { t: 'lumière douce venant de la gauche,', tag: 'Lumière', c: 'var(--gold-400)' },
  { t: 'plan rapproché, légère contre-plongée,', tag: 'Cadrage', c: 'var(--cta)' },
  { t: 'photo produit de luxe, format 4:5.', tag: 'Style', c: 'var(--ia)' },
];
const TAGS = [...new Map(TOKENS.map((t) => [t.tag, t.c])).entries()];
$('#lab-tags').innerHTML = TAGS.map(([t, c]) => `<span style="--c:${c}" data-tag="${t}">${t}</span>`).join('');
const totalChars = TOKENS.reduce((s, t) => s + t.t.length + 1, 0);
let lab = null;
let labLast = -1;
function labRender(p) {
  const chars = Math.round(clamp(p) * totalChars);
  if (chars === labLast) return;
  labLast = chars;
  let left = chars;
  let html = '';
  let stepF = 0;
  const on = new Set();
  TOKENS.forEach((tk, i) => {
    const n = Math.min(tk.t.length, Math.max(0, left));
    if (n > 0) {
      html += `<span style="--c:${tk.c}">${tk.t.slice(0, n)}</span> `;
      on.add(tk.tag);
      stepF = i + n / tk.t.length;
    }
    left -= tk.t.length + 1;
  });
  $('#lab-txt').innerHTML = `${html}<i class="caret"></i>`;
  $$('#lab-tags span').forEach((s) => s.classList.toggle('is-on', on.has(s.dataset.tag)));
  lab?.setStep(stepF);
  $('#lab-frame').style.opacity = String(clamp((stepF - 5.2) * 2));
}
async function bootLab() {
  try {
    const m = await import('./lab3d.js');
    lab = m.initLab($('#lab-canvas'), { onFail: labFallback });
    if (!lab) labFallback();
  } catch (e) {
    console.warn('3D indisponible', e);
    labFallback();
  }
  labLast = -1;
  labRender(reduce ? 1 : labP);
}
function labFallback() {
  const f = $('#lab-fallback');
  f.hidden = false;
  f.innerHTML = product('parfum');
  $('#lab-canvas').hidden = true;
  $('#lab-badge').textContent = 'Illustration';
}
let labP = 0;
labRender(reduce ? 1 : 0);
const labIO = new IntersectionObserver(
  ([e]) => {
    if (e.isIntersecting) {
      labIO.disconnect();
      bootLab();
    }
  },
  { rootMargin: '600px' },
);
labIO.observe($('#lab-stage'));

/* ------------------------------------------------------------------ */
/* Sans animation : états finaux, puis on s'arrête là                  */
/* ------------------------------------------------------------------ */

document.body.classList.remove('is-loading');
if (reduce || !gsap || !ST) {
  root.classList.add('no-pin');
  const solid = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', solid, { passive: true });
  solid();
  $('#pre')?.remove();
  $$('.ha-leg', $('#hl-mark')).forEach((l, i) => l.setAttribute('d', `M${LEGS.academy[i].slice(0, 2).join(' ')} ${LEGS.academy[i].slice(2).join(' ')}`));
  $('#t-n').textContent = '3';
  $$('.anat-steps li').forEach((l) => l.classList.add('is-on'));
  $$('.anat-bar i').forEach((i) => i.style.setProperty('--f', 1));
  const v = $('#bt-video');
  v.preload = 'metadata';
  $$('.fph').forEach((p, i) => (p.style.transform = `translateX(${(i - 1) * 105}%) rotate(${(i - 1) * 4}deg)`));
} else {
  animate();
}

/* ------------------------------------------------------------------ */
/* Animations                                                          */
/* ------------------------------------------------------------------ */

function animate() {
  gsap.registerPlugin(ST);

  // Défilement doux
  const lenis = window.Lenis ? new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true }) : null;
  let vel = 0;
  if (lenis) {
    lenis.on('scroll', (e) => {
      vel = e.velocity || 0;
      ST.update();
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id === '#top' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === '#inscription' ? -70 : 0, duration: 1.4 });
      }),
    );
  } else {
    addEventListener('scroll', () => {
      const y = scrollY;
      vel = y - (animate.lastY || y);
      animate.lastY = y;
    });
  }

  // Barre de navigation : opaque après le hero, cachée en descendant
  let lastY = 0;
  ST.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', y > 600 && y > lastY + 2 && menu.hidden);
      if (y < lastY - 2) nav.classList.remove('is-hidden');
      lastY = y;
    },
  });

  // Ouverture : 3, 2, 1… puis volet de barres dorées
  const intro = gsap.timeline({ paused: true });
  intro
    .fromTo('.ht-l', { yPercent: 60, autoAlpha: 0, rotateX: -50 }, { yPercent: 0, autoAlpha: 1, rotateX: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1 }, 0)
    .fromTo(['.eyebrow', '.hero-ar', '.hero-sub', '.hero-cta', '.hero-facts li'], { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, 0.35)
    .fromTo('#feed', { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 0.85, scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
  const pre = $('#pre');
  let seen = false;
  try {
    seen = sessionStorage.getItem('ha-pre') === '1';
    sessionStorage.setItem('ha-pre', '1');
  } catch {}
  if (seen || !pre) {
    pre?.remove();
    intro.play(0.2);
  } else {
    const n = $('#pre-n');
    const ring = $('.pre-ring circle');
    const tl = gsap.timeline({ onComplete: () => pre.remove() });
    tl.fromTo(['.pre-ring', '.pre-t'], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 });
    [3, 2, 1].forEach((v, i) => {
      tl.set(n, { textContent: v }, 0.35 + i * 0.45);
      tl.fromTo(n, { scale: 1.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(3)' }, 0.35 + i * 0.45);
    });
    tl.fromTo(ring, { strokeDashoffset: 0 }, { strokeDashoffset: 340, duration: 1.35, ease: 'none' }, 0.35);
    tl.to('.pre-bars i', { scaleY: 1, duration: 0.42, ease: 'power3.in', stagger: 0.06 }, 1.65);
    tl.set(['.pre-ring', '.pre-t'], { autoAlpha: 0 }, 2.2);
    tl.set(pre, { background: 'transparent' }, 2.2);
    tl.set('.pre-bars i', { transformOrigin: '50% 0%' }, 2.2);
    tl.to('.pre-bars i', { scaleY: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, 2.22);
    tl.add(() => intro.play(0), 2.25);
    $('#pre').addEventListener('click', () => tl.progress(1));
  }

  // Fil d'actualité qui défile ; la vitesse suit le scroll, puis s'arrête (« arrête le scroll »)
  let feedFactor = 1;
  let wd = 112;
  const titleEl = $('#hero-title');
  gsap.ticker.add((time, dt) => {
    const boost = 1 + Math.min(6, Math.abs(vel) * 0.12);
    cols.forEach((c, i) => {
      const hgt = c.el.scrollHeight / 2;
      c.y -= (c.speed * boost * feedFactor * dt) / 1000;
      if (c.y < -hgt) c.y += hgt;
      c.el.style.transform = `translate3d(0, ${(c.y + (i % 2 ? -hgt * 0.25 : 0)).toFixed(1)}px, 0)`;
    });
    // Le titre se compresse quand on scrolle vite, se détend quand on s'arrête
    const target = 112 - Math.min(38, Math.abs(vel) * 1.6);
    wd += (target - wd) * 0.12;
    titleEl.style.setProperty('--wd', wd.toFixed(1));
    vel *= 0.92;
  });

  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=85%', scrub: 0.6, pin: true, anticipatePin: 1 },
  });
  const ff = { v: 1 };
  heroTl
    .to(ff, { v: 0.04, ease: 'power2.out', duration: 1, onUpdate: () => (feedFactor = ff.v) }, 0)
    .to('#hero-hook', { scaleY: 1, ease: 'power2.inOut', duration: 0.55 }, 0.05)
    .fromTo('#hero-pick', { autoAlpha: 0, scale: 0.5, y: -40, rotate: -6 }, { autoAlpha: 1, scale: 1, y: 0, rotate: 0, ease: 'back.out(1.6)', duration: 0.4 }, 0.5)
    .to('#feed', { filter: 'blur(4px) brightness(.55)', duration: 0.6 }, 0.45)
    .to('.hero-copy', { y: -40, duration: 1 }, 0)
    .to('.hero-scroll', { autoAlpha: 0, duration: 0.2 }, 0);

  // Bandeau : sens et vitesse selon le scroll
  let mx = 0;
  let dir = -1;
  gsap.ticker.add((t, dt) => {
    if (Math.abs(vel) > 0.5) dir = vel > 0 ? -1 : 1;
    mx += dir * (40 + Math.min(400, Math.abs(vel) * 20)) * (dt / 1000);
    const w = mq.scrollWidth / 4;
    if (mx < -w) mx += w;
    if (mx > 0) mx -= w;
    mq.style.transform = `translate3d(${mx.toFixed(1)}px,0,0)`;
  });

  // Anatomie : 3 secondes, puis Body, puis CTA
  const TF = $('#t-fg');
  const TN = $('#t-n');
  const lis = $$('#anat-steps li');
  const bars = $$('.anat-bar i');
  const ahead = $('#anat-head');
  const curve = $('#anat-curve');
  const cl = curve.getTotalLength();
  curve.style.strokeDasharray = `${cl} ${cl}`;
  const bodyLis = $$('#aph-body li');
  ST.create({
    trigger: '#hook',
    start: 'top top',
    end: '+=230%',
    pin: '.anat-pin',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const ph = p < 0.28 ? 0 : p < 0.74 ? 1 : 2;
      const hp = clamp(p / 0.28);
      const bp = clamp((p - 0.28) / 0.46);
      const cp = clamp((p - 0.74) / 0.26);
      TF.style.strokeDashoffset = String(553 * hp);
      TN.textContent = ph === 0 ? String(Math.max(1, Math.ceil(3 * (1 - hp)))) : ph === 1 ? 'Body' : 'CTA';
      TN.style.fontSize = ph === 0 ? '' : '0.42em';
      TF.style.stroke = ['var(--hook)', 'var(--body)', 'var(--cta)'][ph];
      lis.forEach((l, i) => l.classList.toggle('is-on', i === ph));
      bars[0].style.setProperty('--f', hp);
      bars[1].style.setProperty('--f', bp);
      bars[2].style.setProperty('--f', cp);
      ahead.style.left = `${p * 100}%`;
      curve.style.strokeDashoffset = String(cl * (1 - p));
      $('#aph-prog').style.transform = `scaleX(${p})`;
      $('#aph-hook').style.transform = `scale(${ph === 0 ? 1 + 0.08 * Math.sin(hp * Math.PI) : 0.92})`;
      $('#aph-hook').style.opacity = ph === 0 ? 1 : 0.55;
      bodyLis.forEach((l, i) => {
        const v = clamp(bp * 3.2 - i);
        l.style.opacity = v;
        l.style.transform = `translateY(${(1 - v) * 14}px)`;
      });
      const cta = $('#aph-cta');
      cta.style.opacity = 0.25 + 0.75 * cp;
      cta.style.transform = `scale(${1 + 0.06 * Math.sin(cp * Math.PI * 3)})`;
      $('.aph').style.transform = `rotateY(${-14 + p * 22}deg) rotateX(${6 - p * 6}deg)`;
    },
  });
  gsap.from('.anat-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '#hook', start: 'top 75%' } });

  // Manifeste : les mots s'allument au scroll
  const mws = $$('.mw', mani);
  ST.create({
    trigger: '.mani',
    start: 'top 75%',
    end: 'bottom 45%',
    scrub: true,
    onUpdate: (self) => {
      const lit = self.progress * (mws.length + 4);
      mws.forEach((w, i) => (w.style.opacity = String(0.16 + 0.84 * clamp(lit - i))));
    },
  });
  gsap.from('.mani-ar', { autoAlpha: 0, x: 60, duration: 1, scrollTrigger: { trigger: '.mani-ar', start: 'top 90%' } });

  // Programme : rail horizontal en 3D
  const track = $('#prog-track');
  const mods = $$('.mod', track);
  const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
  const cur = $('#prog-cur');
  const small = innerWidth < 700;
  const pbar = $('#prog-bar');
  gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#programme',
      start: 'top top',
      end: () => `+=${dist() + innerHeight * 0.3}`,
      pin: '.prog-pin',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const cxv = innerWidth / 2;
        let best = 0;
        let bd = 1e9;
        mods.forEach((m, i) => {
          const r = m.getBoundingClientRect();
          const off = (r.left + r.width / 2 - cxv) / innerWidth;
          if (Math.abs(off) < bd) {
            bd = Math.abs(off);
            best = i;
          }
          m.style.transform = small ? '' : `rotateY(${clamp(off * -30, -18, 18).toFixed(2)}deg) translateZ(${(-Math.abs(off) * 70).toFixed(1)}px)`;
        });
        cur.textContent = String(best + 1).padStart(2, '0');
        pbar.style.transform = `scaleX(${(best + 1) / mods.length})`;
      },
    },
  });

  // Labo IA : le prompt s'écrit au scroll, la 3D suit
  ST.create({
    trigger: '#ia',
    start: 'top top',
    end: '+=260%',
    pin: '.lab-pin',
    scrub: true,
    onUpdate: (self) => {
      labP = clamp(self.progress * 1.08);
      labRender(labP);
    },
  });

  // Formats : les trois téléphones s'écartent en éventail
  const phones = $$('.fph');
  gsap.set(phones, { xPercent: 0, rotateY: 0, rotateZ: (i) => (i - 1) * 3, scale: 0.9 });
  gsap.to(phones, {
    xPercent: (i) => (i - 1) * (innerWidth < 600 ? 72 : 112),
    rotateY: (i) => (i - 1) * -22,
    rotateZ: (i) => (i - 1) * 5,
    y: (i) => (i === 1 ? -20 : 20),
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.fmt', start: 'top top', end: '+=90%', pin: '.fmt-pin', scrub: 0.6 },
  });
  gsap.from('.fmt-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.fmt', start: 'top 70%' } });

  // Hooked Lab → Hooked Academy : le monogramme se transforme au scroll
  const legs = $$('#hl-mark .ha-leg');
  const lp = { t: 0 };
  const hlTl = gsap.timeline({ scrollTrigger: { trigger: '#hooked-lab', start: 'top top', end: '+=120%', pin: '.hl-pin', scrub: 0.6 } });
  hlTl
    .fromTo('#hl-mark', { rotate: -8, scale: 0.86 }, { rotate: 0, scale: 1, duration: 1 }, 0)
    .to(
      lp,
      {
        t: 1,
        duration: 0.6,
        ease: 'power2.inOut',
        onUpdate: () =>
          legs.forEach((l, i) => {
            const v = LEGS.lab[i].map((x, k) => x + (LEGS.academy[i][k] - x) * lp.t);
            l.setAttribute('d', `M${v[0].toFixed(2)} ${v[1].toFixed(2)} ${v[2].toFixed(2)} ${v[3].toFixed(2)}`);
          }),
      },
      0.3,
    )
    .to('.hl-a', { autoAlpha: 0, y: -30, duration: 0.3 }, 0.35)
    .fromTo('.hl-b', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.55)
    .from('#hl-chips li', { autoAlpha: 0, y: 20, scale: 0.8, stagger: 0.05, duration: 0.3 }, 0.2);

  // Bento : apparition + vidéo lue seulement à l'écran
  ST.batch('.bt', { start: 'top 88%', onEnter: (b) => gsap.fromTo(b, { y: 60, autoAlpha: 0, rotateX: -12 }, { y: 0, autoAlpha: 1, rotateX: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out', overwrite: true }) });
  const vid = $('#bt-video');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      vid.preload = 'auto';
      vid.play().catch(() => {});
    } else vid.pause();
  }, { threshold: 0.3 }).observe(vid);
  $$('.bt-big').forEach((b) => {
    const n = +b.textContent;
    const o = { v: 0 };
    gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (b.textContent = Math.round(o.v)), scrollTrigger: { trigger: b, start: 'top 85%' } });
  });
  gsap.from('#format .sec-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '#format', start: 'top 75%' } });

  // Espace étudiant : la maquette se redresse au scroll, suit la souris
  const win = $('.sm-win');
  gsap.fromTo(win, { rotateX: 26, rotateY: -24, rotateZ: 4, y: 80 }, { rotateX: 6, rotateY: -8, rotateZ: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.space', start: 'top bottom', end: 'center center', scrub: 0.6 } });
  gsap.from('.sm-card', { z: -200, autoAlpha: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.space', start: 'top 65%' } });
  gsap.fromTo('.sm-ring .fg', { strokeDashoffset: 251 }, { strokeDashoffset: 223, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.space', start: 'top 60%' } });
  if (fine) {
    $('#space-mock').addEventListener('pointermove', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to('.sm-card', { x: x * 18, y: y * 14, duration: 0.6, stagger: 0.02 });
    });
  }
  gsap.from('.space-copy > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.space', start: 'top 70%' } });

  // Parcours : la ligne se dessine
  const pl = $('#path-line');
  const plen = pl.getTotalLength();
  pl.style.strokeDasharray = `${plen} ${plen}`;
  gsap.fromTo(pl, { strokeDashoffset: plen }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.path-wrap', start: 'top 70%', end: 'bottom 70%', scrub: 0.5 } });
  $$('.path-steps li').forEach((li, i) => gsap.from(li, { x: i % 2 ? 80 : -80, autoAlpha: 0, rotate: i % 2 ? 3 : -3, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 80%' } }));
  gsap.from('.path .sec-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.path', start: 'top 75%' } });

  // Pour qui, inscription, FAQ
  gsap.from('.who-c', { y: 80, autoAlpha: 0, rotate: (i) => (i % 2 ? 4 : -4), stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.who-grid', start: 'top 80%' } });
  gsap.from('.who .sec-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.who', start: 'top 75%' } });
  gsap.from('.join-copy > *, .join-steps li', { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.join', start: 'top 70%' } });
  gsap.from('.form', { y: 80, rotateX: -10, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 85%' } });
  gsap.from('.faq details', { y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.7, scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });

  // Pied de page : le grand nom glisse
  gsap.fromTo('.foot-big span:first-child', { xPercent: -12 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.fromTo('.foot-big span:last-child', { xPercent: 10 }, { xPercent: -2, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // Indicateur Hook · Body · CTA
  const hbc = $('#hbc');
  const parts = ['hook', 'body', 'cta'];
  const fills = Object.fromEntries(parts.map((p) => [p, $(`#hbc li[data-part="${p}"] b`)]));
  const items = Object.fromEntries(parts.map((p) => [p, $(`#hbc li[data-part="${p}"]`)]));
  const spans = {};
  parts.forEach((p) => {
    const els = $$(`[data-part="${p}"]`).filter((e) => e.tagName !== 'LI');
    spans[p] = els;
  });
  ST.create({
    start: 0,
    end: 'max',
    onUpdate: () => {
      const mid = scrollY + innerHeight / 2;
      hbc.classList.toggle('is-on', scrollY > innerHeight * 0.4);
      parts.forEach((p) => {
        const els = spans[p];
        const a = els[0].getBoundingClientRect().top + scrollY;
        const last = els[els.length - 1];
        const b = last.getBoundingClientRect().bottom + scrollY;
        const f = clamp((mid - a) / (b - a));
        fills[p].style.transform = `scaleX(${f})`;
        items[p].classList.toggle('is-cur', f > 0 && f < 1);
      });
    },
  });

  addEventListener('load', () => ST.refresh());
  document.fonts?.ready.then(() => ST.refresh());
}
