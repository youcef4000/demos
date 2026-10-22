// Hooked Academy — landing « Coupe franche ».
// La page se lit comme un rush : clap d'ouverture, plans numérotés, timecode (la page « dure » 2:00,
// comme une leçon au maximum), coupes franches. Les chiffres viennent de data/programme.js.
// Mouvement : sauts en steps() (pellicule), jamais de fondu ; tout est désactivé en mouvement réduit.

import { lang, isRTL, t, has, setLang, locale } from './i18n.js';
import './i18n/landing.js';
import { logoInner, markSVG, morphMark } from './brand.js';
import { TRACKS, MODULES as ALL_MODULES, allLessons, modCode, coreModulesOf, findLesson } from '../../data/programme.js';
import { addApplication, settings } from './store.js';
import * as FAQ from './faq.js';
import { OFFRES } from '../../data/offres.js';
import { mountAssistant } from './assistant.js';
import { initPWA } from './pwa.js';
import { OUTILS, BUDGETS, CHECKED } from '../../data/outils.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const pad = (n, l = 2) => String(Math.max(0, Math.floor(n))).padStart(l, '0');
const FPS = 25;
const PAGE_SEC = 120; // la page entière « dure » 2:00
const tc = (sec) => {
  const f = Math.floor(sec * FPS);
  return `${pad(f / (FPS * 3600))}:${pad((f / (FPS * 60)) % 60)}:${pad((f / FPS) % 60)}:${pad(f % FPS)}`;
};

/* ------------------------------------------------------------------ */
/* Langue : le français est dans le HTML, les autres langues remplacent */
/* ------------------------------------------------------------------ */

function translateDom() {
  document.title = t('meta.title');
  $('meta[name="description"]')?.setAttribute('content', t('meta.desc'));
  if (lang === 'fr') return;
  $$('[data-i18n]').forEach((el) => has(el.dataset.i18n) && (el.textContent = t(el.dataset.i18n)));
  $$('[data-i18n-html]').forEach((el) => has(el.dataset.i18nHtml) && (el.innerHTML = t(el.dataset.i18nHtml)));
  $$('[data-i18n-attr]').forEach((el) =>
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key && has(key)) el.setAttribute(attr, t(key));
    }),
  );
}
translateDom();

// Typographie française : espace insécable avant « : ; ! ? » et dans les guillemets, pour qu'aucun
// signe ne se retrouve seul en début de ligne.
function frTypo(root) {
  if (lang !== 'fr' || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const v = n.nodeValue.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
    if (v !== n.nodeValue) n.nodeValue = v;
  }
}
$$('#lsw [data-lang]').forEach((b) => {
  b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  b.addEventListener('click', () => setLang(b.dataset.lang));
});
$('#nav-logo').innerHTML = logoInner();
$('#foot-logo').innerHTML = logoInner();

/* ------------------------------------------------------------------ */
/* Données réelles du programme                                        */
/* ------------------------------------------------------------------ */

// La bienvenue (module 00) n'entre ni dans les comptes ni dans les listes de modules
const MODULES = ALL_MODULES.filter((m) => !m.intro);
const LESSONS = allLessons().filter((l) => !l.module.intro);
const byTrack = Object.fromEntries(TRACKS.map((x) => [x.id, { mods: coreModulesOf(x.id), lessons: LESSONS.filter((l) => l.module.track === x.id) }]));
const nL = (n) => t('count.lessons', { n });
const nM = (n) => t('count.modules', { n });

$$('.js-count').forEach((el) => (el.textContent = nL(byTrack[el.dataset.track].lessons.length)));
$('#coach-lessons').textContent = String(LESSONS.length);

// Combien coûte l'IA pour commencer : les trois budgets de data/outils.js (prix relevés, en dollars par mois)
{
  const byId = Object.fromEntries(OUTILS.map((o) => [o.id, o]));
  const pk = (o) => (o && (o[lang] || o.fr)) || '';
  const usd = (n) => t('ai.usd', { n });
  $('#tix-ai-row').innerHTML = BUDGETS.map(
    (b) => `<li class="ai-c${b.max ? '' : ' is-free'}">
      <p class="burn">${esc(pk(b.title))}</p>
      <p class="ai-p">${b.max ? esc(t('ai.range', { a: usd(b.min), b: usd(b.max) })) : esc(t('ai.free'))}${b.max ? ` <small>${esc(t('ai.month'))}</small>` : ''}</p>
      <p class="ai-t">${esc(pk(b.text))}</p>
      <p class="ai-tools">${b.tools.map((id) => `<span>${esc(byId[id]?.name || id)}</span>`).join('')}</p>
    </li>`,
  ).join('');
  const [y, m] = CHECKED.split('-').map(Number);
  $('#tix-ai-note').textContent = t('ai.note', { d: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1)) });
}
for (const tr of TRACKS) {
  const { mods, lessons } = byTrack[tr.id];
  $(`#duo-range-${tr.id}`).textContent = `${modCode(mods[0])}–${modCode(mods[mods.length - 1])}`;
  $(`#duo-pitch-${tr.id}`).textContent = tr.pitch;
  // Programme détaillé : chaque module se déplie sur la liste de ses leçons
  $(`#duo-mods-${tr.id}`).innerHTML = mods
    .map(
      (m) => `<li><details><summary><span class="c">${modCode(m)}</span><span class="t">${esc(m.title)}${m.level === 'avance' ? ` <em class="lv">${t('duo.lv')}</em>` : ''}</span><span class="n">${esc(nL(m.lessons.length))}</span><i class="pm" aria-hidden="true"></i></summary>
        <ol class="dm-ls">${m.lessons.map((l) => `<li><span class="c">${pad(l.n)}</span><span>${esc(l.title)}</span></li>`).join('')}</ol></details></li>`,
    )
    .join('');
  $(`#duo-n-${tr.id}`).textContent = [nL(lessons.length), nM(mods.length), t('duo.final')].join(' · ');
}
$('#count-t').textContent = `${nL(LESSONS.length)}, ${nM(MODULES.length)}, ${t('count.final')}`;

// Tarifs (data/offres.js) : billets et choix de formation du formulaire
const money = (n) => `${new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'fr-FR').format(n)} ${t('tix.cur')}`;
const sep = OFFRES.creative + OFFRES.ia;
$$('.js-amt').forEach((el) => (el.textContent = money(OFFRES[el.dataset.offre])));
$$('.js-was, .js-save').forEach((el) => {
  el.hidden = sep <= OFFRES.both;
  el.textContent = el.matches('.js-was') ? t('tix.was', { p: money(sep) }) : t('tix.save', { p: money(sep - OFFRES.both) });
});
$$('.js-inc').forEach((el) => {
  const { track, mods } = el.dataset;
  const n = track === 'all' ? LESSONS.length : track ? byTrack[track].lessons.length : byTrack[mods].mods.length;
  el.textContent = t(el.dataset.k, { n });
});
$$('[data-pick]').forEach((a) =>
  a.addEventListener('click', () => {
    const r = $(`#form input[name="formation"][value="${a.dataset.pick}"]`);
    if (r) r.checked = true;
  }),
);
frTypo(document.body);

// Parcours : les modules de chaque partie, le dernier module (projet final) à part
const LAST = MODULES[MODULES.length - 1];
$$('[data-chips]').forEach((ul) => {
  const k = ul.dataset.chips;
  const list = k === 'final' ? [LAST] : MODULES.filter((m) => m.part === k && m !== LAST);
  ul.innerHTML = list.map((m) => `<li data-track="${m.track}" title="${esc(m.title)}">${modCode(m)}</li>`).join('');
});

// Ardoise : identifiant de clip et date du jour, comme sur un vrai rush
const now = new Date();
const yymmdd = `${pad(now.getFullYear() % 100)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
$('#clip-id').textContent = `A001_C001_${yymmdd}`;
$('#slate-date').textContent = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${pad(now.getFullYear() % 100)}`;
$('#faq-file').textContent = `questions_${lang}.srt`;

// Questions : liste gérée par l'équipe (data/faq.json, page « Questions fréquentes » de l'espace équipe).
// Les questions cochées « page d'accueil » remplacent la liste écrite dans le HTML.
const srtTime = (s) => {
  const ms = Math.round(s * 1000);
  return `00:${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)},${String(ms % 1000).padStart(3, '0')}`;
};
FAQ.ready().then(() => {
  const items = FAQ.list().filter((x) => x.landing);
  if (!items.length) return;
  let at = 1;
  $('#srt').innerHTML = items
    .map((x, i) => {
      const q = FAQ.pickLang(x.q, lang);
      const a = FAQ.pickLang(x.a, lang)
        .split(/\n\s*\n/)
        .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
        .join('');
      const end = at + Math.max(2.6, q.length * 0.07);
      const tc = `${srtTime(at)} --&gt; ${srtTime(end)}`;
      at = end + 0.2;
      return `<details><summary><span class="srt-i" aria-hidden="true"><b>${i + 1}</b><span>${tc}</span></span><span>${esc(q)}</span></summary>${a}</details>`;
    })
    .join('');
  frTypo($('#srt'));
});

/* ------------------------------------------------------------------ */
/* Défilement : Lenis sur pointeur fin, ancres, timecode et plans      */
/* ------------------------------------------------------------------ */

let lenis = null;
const navH = () => $('#nav').getBoundingClientRect().height;
function goTo(target) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -navH() + 1, duration: 1.1 });
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2 || !$(id)) return;
  e.preventDefault();
  goTo(id);
  history.replaceState(null, '', id);
});

const SECTIONS = $$('[data-plan]');
const nav = $('#nav');
const tcBox = $('#tc');
const dock = $('#dock');
const join = $('#inscription');
const links = $$('.nav-links a');
let lastPlan = '';
function onScroll() {
  const y = scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const time = tc((y / max) * PAGE_SEC);
  $('#tc-time').textContent = time;
  $('#dock-time').textContent = time;
  // Ton du bandeau : le plan qui passe sous lui
  const probe = navH() + 1;
  const mid = innerHeight * 0.45;
  let under = SECTIONS[0];
  let cur = SECTIONS[0];
  for (const s of SECTIONS) {
    const r = s.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) under = s;
    if (r.top <= mid && r.bottom > mid) cur = s;
  }
  const ton = under.dataset.ton === 'duo' ? 'encre' : under.dataset.ton;
  if (nav.dataset.ton !== ton) nav.dataset.ton = ton;
  if (cur.dataset.plan !== lastPlan) {
    lastPlan = cur.dataset.plan;
    const name = t(cur.dataset.name);
    $('#tc-n').textContent = lastPlan;
    $('#tc-name').textContent = name;
    $('#dock-n').textContent = `${t('plan.word')} ${lastPlan}`;
    links.forEach((a) => a.classList.toggle('is-on', cur.id && a.getAttribute('href') === `#${cur.id}`));
  }
  const jr = join.getBoundingClientRect();
  const inJoin = jr.top < innerHeight * 0.75 && jr.bottom > innerHeight * 0.25;
  tcBox.classList.toggle('is-off', inJoin);
  dock.classList.toggle('is-off', inJoin || typing);
}
let typing = false;
document.addEventListener('focusin', (e) => {
  typing = !!e.target.closest('input, textarea, select');
  onScroll();
});
document.addEventListener('focusout', () => {
  typing = false;
  setTimeout(onScroll, 50);
});
let ticking = false;
addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onScroll();
    });
  },
  { passive: true },
);
addEventListener('resize', onScroll);
onScroll();

/* ------------------------------------------------------------------ */
/* Le clap                                                             */
/* ------------------------------------------------------------------ */

// Son du clap : synthétisé (bruit filtré + coup sourd), joué seulement après un clic.
let actx = null;
function armSound() {
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch {
    actx = null;
  }
}
function clapSound() {
  if (!actx) return;
  try {
    const t0 = actx.currentTime;
    const sr = actx.sampleRate;
    const buf = actx.createBuffer(1, Math.floor(sr * 0.22), sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.016));
    const crack = actx.createBufferSource();
    crack.buffer = buf;
    const bp = actx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const cg = actx.createGain();
    cg.gain.value = 0.55;
    crack.connect(bp).connect(cg).connect(actx.destination);
    const knock = actx.createOscillator();
    knock.frequency.setValueAtTime(210, t0);
    knock.frequency.exponentialRampToValueAtTime(70, t0 + 0.09);
    const kg = actx.createGain();
    kg.gain.setValueAtTime(0.4, t0);
    kg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.11);
    knock.connect(kg).connect(actx.destination);
    crack.start(t0);
    knock.start(t0);
    knock.stop(t0 + 0.12);
  } catch {}
}

// Contact des claquettes : secousse, éclair de synchro, poussière de craie
function impact(slate, sound) {
  const g = window.gsap;
  if (sound) clapSound();
  g.fromTo(
    slate,
    { x: 0, y: 0, rotation: 0 },
    {
      keyframes: [
        { x: -3, y: 2, rotation: -0.35, duration: 0.03 },
        { x: 2.4, y: -1, rotation: 0.22, duration: 0.03 },
        { x: -1, y: 0.5, rotation: -0.08, duration: 0.03 },
        { x: 0, y: 0, rotation: 0, duration: 0.06 },
      ],
      clearProps: 'transform',
    },
  );
  const sec = slate.closest('.sh');
  let fl = $('.sync-flash', sec);
  if (!fl) {
    fl = document.createElement('div');
    fl.className = 'sync-flash';
    fl.setAttribute('aria-hidden', 'true');
    sec.prepend(fl);
  }
  const r = slate.getBoundingClientRect();
  const rs = sec.getBoundingClientRect();
  fl.style.setProperty('--fx', `${(((r.left + r.width / 2 - rs.left) / rs.width) * 100).toFixed(1)}%`);
  g.fromTo(fl, { opacity: 0.42 }, { opacity: 0, duration: 0.32, ease: 'power2.out' });
  const sticks = $('.sticks', slate);
  const w = sticks.offsetWidth;
  const y = $('.clapper', sticks).offsetHeight;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i');
    p.className = 'dust';
    sticks.appendChild(p);
    const x0 = w * (0.12 + Math.random() * 0.84);
    const s = 0.5 + Math.random() * 1.3;
    g.set(p, { x: x0, y, scale: s, opacity: 0.85 });
    g.to(p, { x: x0 + (Math.random() - 0.5) * 90, y: y - 20 - Math.random() * 60, duration: 0.35 + Math.random() * 0.25, ease: 'power2.out' });
    g.to(p, { y: `+=${18 + Math.random() * 30}`, opacity: 0, scale: s * 0.4, duration: 0.5, delay: 0.3, ease: 'power1.in', onComplete: () => p.remove() });
  }
}

function clap(slate, clapper, { onShut, sound = false } = {}) {
  const g = window.gsap;
  if (!g || reduce) {
    clapper.style.setProperty('--open', '0deg');
    if (sound) clapSound();
    onShut?.();
    return;
  }
  g.killTweensOf(clapper);
  const tl = g.timeline();
  // ouverture (élan), claquement, petit rebond
  tl.to(clapper, { '--open': '-28deg', duration: 0.22, ease: 'power2.out' })
    .to(clapper, { '--open': '0deg', duration: 0.075, ease: 'power4.in' })
    .add(() => {
      impact(slate, sound);
      onShut?.();
    })
    .to(clapper, { '--open': '-2.4deg', duration: 0.05, ease: 'power1.out' })
    .to(clapper, { '--open': '0deg', duration: 0.08, ease: 'power2.in' });
  return tl;
}
const slate = $('#slate');
const clapper = $('#clapper');
let take = 1;
$('#slate-hit').addEventListener('click', () => {
  armSound();
  clap(slate, clapper, {
    sound: true,
    onShut: () => {
      take += 1;
      $('#take').textContent = pad(take);
    },
  });
});
// Au survol, les claquettes s'entrouvrent ; le reflet de l'acrylique suit la souris
if (fine && !reduce) {
  const hit = $('#slate-hit');
  hit.addEventListener('pointerenter', () => window.gsap?.to(clapper, { '--open': '-9deg', duration: 0.25, ease: 'power2.out' }));
  hit.addEventListener('pointerleave', () => window.gsap?.to(clapper, { '--open': '0deg', duration: 0.2, ease: 'power2.in' }));
  let raf = 0;
  $$('.slate').forEach((sl) =>
    sl.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const body = $('.slate-body', sl);
        const r = body.getBoundingClientRect();
        body.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        body.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      });
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Titres en « jump cut » : les mots apparaissent par morceaux de 4 images */
/* ------------------------------------------------------------------ */

function splitWords(el) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walk.nextNode()) if (!walk.currentNode.parentElement.closest('.um')) nodes.push(walk.currentNode);
  const words = [];
  nodes.forEach((n) => {
    const parts = n.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((p) => {
      if (!p) return;
      if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
      else {
        const s = document.createElement('span');
        s.className = 'jw';
        s.textContent = p;
        frag.appendChild(s);
        words.push(s);
      }
    });
    n.replaceWith(frag);
  });
  return words;
}

/* ------------------------------------------------------------------ */
/* Le titre « dérushé » : les hésitations sont barrées puis coupées    */
/* ------------------------------------------------------------------ */

function derush(h, g) {
  const ums = $$('.um', h);
  if (!ums.length) return;
  h.classList.add('is-on');
  ums.forEach((u) => u.style.setProperty('--w', `${u.scrollWidth + 2}px`));
  const tl = g.timeline({ paused: true });
  ums.forEach((u, i) => tl.to(u, { '--strike': 1, duration: 0.16, ease: 'steps(4)' }, 0.5 + i * 0.08));
  tl.to(ums, { maxWidth: 0, duration: 0.08, ease: 'steps(2)' }, '+=0.32').add(() => {
    ums.forEach((u) => u.remove());
    h.classList.remove('is-on');
    h.normalize();
  });
  return tl;
}

/* ------------------------------------------------------------------ */
/* La leçon : vidéo, pistes et tête de lecture                         */
/* ------------------------------------------------------------------ */

const f1 = findLesson('m1-l1');
const L1 = f1?.lesson;
const LDUR = L1 ? L1.scenes.reduce((s, sc) => s + (sc.d || 4), 0) : 52;
$('#lv-title').textContent = `M01 · L01 — ${has('lecon.title') ? t('lecon.title') : L1?.title || ''}`;
(function buildTimeline() {
  const ruler = $('#tl-ruler');
  let r = '';
  for (let s = 0; s <= 120; s += 5) r += `<i class="${s % 30 === 0 ? 'is-major' : ''}" style="left:${(s / 120) * 100}%"></i>`;
  for (const s of [0, 30, 60, 90, 120]) r += `<span style="left:${(s / 120) * 100}%">${Math.floor(s / 60)}:${pad(s % 60)}</span>`;
  ruler.innerHTML = r;
  const names = t('lecon.sc').split('|');
  let at = 0;
  $('#tl-clips').innerHTML = (L1?.scenes || [])
    .map((sc, i) => {
      const d = sc.d || 4;
      const html = `<span class="tl-clip" data-i="${i}" style="left:${(at / 120) * 100}%;width:${(d / 120) * 100}%">${esc(names[i] || sc.type)}</span>`;
      at += d;
      return html;
    })
    .join('');
})();

// Forme d'onde : calculée sur la vraie voix off de la leçon (repli : rien)
async function drawWave() {
  const box = $('#tl-wave');
  if (box.dataset.done) return;
  box.dataset.done = '1';
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !L1?.audio) return;
    const buf = await (await fetch(L1.audio)).arrayBuffer();
    const ac = new AC();
    const audio = await ac.decodeAudioData(buf);
    ac.close?.();
    const data = audio.getChannelData(0);
    const bars = Math.round((audio.duration / 120) * 280);
    const step = Math.floor(data.length / bars);
    const peaks = [];
    for (let b = 0; b < bars; b++) {
      let sum = 0;
      for (let k = b * step; k < (b + 1) * step; k += 16) sum += data[k] * data[k];
      peaks.push(Math.sqrt(sum / (step / 16)));
    }
    const top = Math.max(...peaks) || 1;
    box.innerHTML = peaks.map((p, b) => `<i style="left:${((b * (audio.duration / bars)) / 120) * 100}%;height:${Math.max(6, (p / top) * 100).toFixed(1)}%"></i>`).join('');
  } catch {}
}

const viewer = $('#viewer');
const video = $('#lv');
const head = $('#tl-head');
const clips = $$('.tl-clip');
const soundBtn = $('#lv-sound');
function syncHead() {
  const ct = video.currentTime || 0;
  $('#lv-tc').textContent = tc(ct);
  const w = $('#tl-clips').getBoundingClientRect().width;
  head.style.setProperty('--x', `${(Math.min(ct, 120) / 120) * w}px`);
  let at = 0;
  const cur = (L1?.scenes || []).findIndex((sc) => {
    at += sc.d || 4;
    return ct < at;
  });
  clips.forEach((c, i) => c.classList.toggle('is-on', i === cur));
}
let raf = 0;
const loop = () => {
  syncHead();
  if (!video.paused) raf = requestAnimationFrame(loop);
};
video.addEventListener('play', () => {
  viewer.classList.add('is-playing');
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
});
video.addEventListener('pause', () => cancelAnimationFrame(raf));
video.addEventListener('seeked', syncHead);
$('#lv-play').addEventListener('click', () => {
  video.play().catch(() => {});
  drawWave();
});
function setSound(on) {
  video.muted = !on;
  soundBtn.setAttribute('aria-pressed', String(on));
  $('#lv-sound-t').textContent = t(on ? 'lecon.mute' : 'lecon.sound');
}
soundBtn.addEventListener('click', () => {
  const on = video.muted;
  setSound(on);
  if (on && video.paused) video.play().catch(() => {});
  drawWave();
});
addEventListener('resize', syncHead);
// Lecture automatique sans le son, seulement sur ordinateur et quand la vidéo est visible
const saveData = navigator.connection?.saveData;
new IntersectionObserver(
  ([e]) => {
    if (e.isIntersecting) {
      drawWave();
      if (fine && !reduce && !saveData) video.play().catch(() => {});
    } else if (!video.paused) video.pause();
  },
  { threshold: 0.5 },
).observe(viewer);

// Le mini-quiz
$$('#mq button').forEach((b) =>
  b.addEventListener('click', () => {
    const all = $$('#mq button');
    all.forEach((x) => (x.disabled = true));
    b.classList.add(b.dataset.ok === '1' ? 'ok' : 'ko');
    all.find((x) => x.dataset.ok === '1').classList.add('ok');
  }),
);

/* ------------------------------------------------------------------ */
/* Casting : « C'est moi » choisit le profil du formulaire              */
/* ------------------------------------------------------------------ */

$$('.role-me').forEach((b) =>
  b.addEventListener('click', () => {
    const v = b.dataset.profil;
    const radio = $(`#form input[name="profil"][value="${v}"]`);
    if (radio) radio.checked = true;
    $$('.role-me').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    goTo('#inscription');
  }),
);

/* ------------------------------------------------------------------ */
/* Hooked Lab : le monogramme passe de Lab à Academy                    */
/* ------------------------------------------------------------------ */

$('#lab-mark').innerHTML = markSVG({ lab: true, solid: '#0f0f0d' });
$('#done-mark').innerHTML = markSVG({ solid: '#0f0f0d' });

/* ------------------------------------------------------------------ */
/* Inscription : l'ardoise-formulaire en trois prises                  */
/* ------------------------------------------------------------------ */

const form = $('#form');
const steps = $$('.fs', form);
const next = $('#form-next');
const prev = $('#form-prev');
const err = $('#form-err');
let stepI = 0;
function showStep(i, focus = false) {
  stepI = i;
  steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
  prev.hidden = i === 0;
  next.textContent = t(i === steps.length - 1 ? 'f.send' : 'f.next');
  $('#f-step').textContent = String(i + 1);
  err.textContent = '';
  if (focus) $('input, select, textarea', steps[i])?.focus({ preventScroll: true });
  const g = window.gsap;
  if (g && !reduce && focus) g.fromTo(steps[i], { clipPath: isRTL ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 0.12, ease: 'steps(3)', clearProps: 'clipPath' });
}
function validStep(i) {
  for (const f of $$('input, select, textarea', steps[i])) {
    f.classList.remove('is-bad');
    if (!f.checkValidity()) {
      f.classList.add('is-bad');
      f.focus();
      const name = f.closest('label')?.querySelector('span')?.textContent?.replace(/\(.*\)/, '').trim();
      err.textContent = f.type === 'checkbox' ? t('f.err.check') : t('f.err.field', { name });
      return false;
    }
  }
  return true;
}
next.addEventListener('click', () => {
  if (!validStep(stepI)) return;
  if (stepI < steps.length - 1) return showStep(stepI + 1, true);
  if (next.disabled) return;
  const data = Object.fromEntries(new FormData(form).entries());
  data.lang = lang;
  next.disabled = true;
  next.setAttribute('aria-busy', 'true');
  addApplication(data)
    .then(() => sent(data))
    .catch((e) => {
      // Serveur injoignable ou trop d'envois : l'inscription part sur WhatsApp, rien n'est perdu
      const wa = settings().whatsapp;
      const msg = t('f.err.waMsg', { name: data.name || '', phone: data.phone || '', pack: data.formation || '' });
      err.innerHTML = `${esc(t(e?.status === 429 ? 'f.err.rate' : 'f.err.send'))} <a href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${esc(t('f.err.wa'))}</a>`;
    })
    .finally(() => {
      next.disabled = false;
      next.removeAttribute('aria-busy');
    });
});
function sent(data) {
  const first = String(data.name || '').trim().split(/\s+/)[0] || '';
  $('#done-t').textContent = first ? t('f.done.t', { name: first }) : t('f.done.t0');
  const done = $('#form-done');
  armSound();
  clap($('#fslate'), $('#fclapper'), {
    sound: true,
    onShut: () => {
      form.classList.add('is-done');
      done.hidden = false;
      done.focus();
    },
  });
}
prev.addEventListener('click', () => showStep(Math.max(0, stepI - 1), true));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  next.click();
});
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
    e.preventDefault();
    next.click();
  }
});
showStep(0);

/* ------------------------------------------------------------------ */
/* Ajustements typographiques : le grand mot remplit son panneau       */
/* ------------------------------------------------------------------ */

function fitBig() {
  $$('.duo-big').forEach((el) => {
    el.style.removeProperty('--fit');
    const box = el.parentElement.getBoundingClientRect().width;
    const w = el.scrollWidth;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (w > box) el.style.setProperty('--fit', `${Math.floor((fs * box) / w) - 1}px`);
  });
}

/* ------------------------------------------------------------------ */
/* Animations (GSAP + ScrollTrigger + Lenis)                           */
/* ------------------------------------------------------------------ */

function animate() {
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  if (!g || !ST || reduce) {
    $('#rails').style.setProperty('--prog', 1);
    $$('.st').forEach((s) => s.classList.add('is-on'));
    $('#lab-mark .ha-leg') && $$('#lab-mark .ha-leg').forEach((l, i) => l.setAttribute('d', ['M19.4 29.2 24 18.8', 'M28.6 29.2 24 18.8'][i]));
    return;
  }
  g.registerPlugin(ST);

  if (fine && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on('scroll', ST.update);
    g.ticker.add((time) => lenis.raf(time * 1000));
    g.ticker.lagSmoothing(0);
  }

  // Ouverture : le clap se ferme à 0,6 s, le timecode démarre
  g.set(clapper, { '--open': '-16deg' });
  g.delayedCall(0.6, () => clap(slate, clapper));

  // Titres en jump cut
  $$('.h2:not(.derush)').forEach((h) => {
    const words = splitWords(h);
    if (!words.length) return;
    g.set(words, { visibility: 'hidden' });
    ST.create({
      trigger: h,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const tl = g.timeline();
        // par morceaux de 4 images (160 ms), deux mots à la fois
        for (let i = 0; i < words.length; i += 2) tl.set(words.slice(i, i + 2), { visibility: 'visible' }, (i / 2) * 0.16);
      },
    });
  });

  // Titre dérushé
  const dh = $('.derush');
  const dtl = derush(dh, g);
  if (dtl) ST.create({ trigger: dh, start: 'top 70%', once: true, onEnter: () => dtl.play() });

  // Moniteur : les anneaux se remplissent par images
  const mock = $('.mock');
  mock.style.setProperty('--on', 0);
  ST.create({ trigger: mock, start: 'top 75%', once: true, onEnter: () => mock.style.setProperty('--on', 1) });

  // Travelling : le chariot avance avec le défilement
  const rails = $('#rails');
  const sts = $$('.st');
  ST.create({
    trigger: rails,
    start: 'top 70%',
    end: 'bottom 55%',
    scrub: true,
    onUpdate: (st) => {
      const p = st.progress;
      rails.style.setProperty('--prog', p.toFixed(4));
      sts.forEach((s, i) => s.classList.toggle('is-on', p >= i / (sts.length - 1) - 0.02));
    },
  });

  // Hooked Lab : morph du monogramme, en 6 images
  const svg = $('#lab-mark svg');
  ST.create({ trigger: '#hooked-lab', start: 'top 60%', once: true, onEnter: () => morphMark(svg, g, { duration: 0.24, ease: 'steps(6)' }) });

  // Billetterie : les billets sortent de la machine, en 6 images chacun
  const tks = $$('.tk');
  g.set(tks, { clipPath: 'inset(0 0 100% 0)' });
  ST.create({ trigger: '.tix-row', start: 'top 80%', once: true, onEnter: () => g.to(tks, { clipPath: 'inset(0 0 0% 0)', duration: 0.24, ease: 'steps(6)', stagger: 0.14, clearProps: 'clipPath' }) });

  // Coupe : chaque plan « tombe » en une image (aucun fondu)
  addEventListener('load', () => ST.refresh());
}

// Assistant (bot) : les questions des visiteurs, avec les réponses de la FAQ de l'équipe et les tarifs
function bot() {
  let wa = '';
  try {
    wa = String(settings().whatsapp || '').replace(/\D/g, '');
  } catch {}
  const go = (href, k) => ({ href, label: t(k) });
  mountAssistant({
    whatsapp: wa,
    faqHref: '#faq',
    filter: (e) => e.landing,
    links: {
      _prix: go('#tarifs', 'bot.l.tarifs'),
      paiement: go('#inscription', 'bot.l.signup'),
      acces: go('#tarifs', 'bot.l.tarifs'),
      deux: go('#formations', 'bot.l.courses'),
      debutant: go('#inscription', 'bot.l.signup'),
    },
  });
}

const start = () => {
  fitBig();
  new ResizeObserver(fitBig).observe($('#formations'));
  animate();
  onScroll();
  bot();
};
if (document.fonts?.ready) document.fonts.ready.then(start);
else start();
initPWA('sw.js');
