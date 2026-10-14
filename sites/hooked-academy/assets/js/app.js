// Hooked Academy — espace étudiant, en français, anglais et arabe (de droite à gauche).
// Routes : #/ (accueil) · #/parcours/creative · #/parcours/ia · #/lecon/<id> · #/ressources · #/profil
// Données : assets/js/store.js (localStorage) ; programme déjà traduit : data/programme.js.
// Fichiers de l'équipe : ressources/manifest.json (facultatif) ; vidéos publiées : video/manifest.json.
// Textes de l'interface : assets/js/i18n/app.js (+ i18n/common.js pour niveaux, badges, formations).

import { lang, LANG, LANGS, isRTL, locale, t, switcher, bindSwitchers, fmtNum, fmtDate } from './i18n.js';
import './i18n/common.js';
import './i18n/app.js';
import { logoInner, markSVG } from './brand.js';
import { icon } from './icons.js';
import * as S from './store.js';
import { TRACKS, PARTS, MODULES, allLessons, findLesson, modCode, modulesOf, lessonsOf } from '../../data/programme.js';
import { compose, lessonDuration } from '../../motion/engine.js';
import { renderWidget, flashcards } from './widgets.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** GSAP seulement si le mouvement est autorisé (les animations décoratives s'appuient dessus). */
const G = () => (reduce ? null : window.gsap || null);
const root = $('#root');
const LESSONS = allLessons();
const DUR = Object.fromEntries(LESSONS.map((l) => [l.id, lessonDuration(l)]));
const TRK = Object.fromEntries(TRACKS.map((x) => [x.id, x]));
const RESERVE = '../#inscription';
const AR = lang === 'ar';
/** Décalage horizontal dans le sens de lecture (les entrées viennent du début de ligne). */
const X = (n) => (isRTL ? -n : n);

const num = (n) => fmtNum(n);
const pc = (x) => t('app.fmt.pct', { n: fmtNum(Math.round((x || 0) * 100)) });
const pad2 = (n) => String(n).padStart(2, '0');
const trName = (id) => t(`track.${id}`);
const lessonN = (n) => t('app.lesson.n', { n: pad2(n) });
const bdi = (s) => `<bdi>${esc(s)}</bdi>`;
const arrow = (size = 18, cls = '') => icon('arrow', { size, cls: `i-dir ${cls}` });
const back = (size = 18) => icon('arrow', { size, cls: 'i-back' });
function dur(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return s < 60 ? t('app.dur.s', { s }) : t('app.dur.ms', { m: Math.floor(s / 60), s: pad2(s % 60) });
}
function fmtSize(size) {
  if (size == null || size === '') return '';
  if (typeof size === 'string' && !/^\d+$/.test(size)) return size;
  const b = Number(size);
  try {
    const big = b >= 1048576;
    return new Intl.NumberFormat(locale, { style: 'unit', unit: big ? 'megabyte' : 'kilobyte', unitDisplay: 'short', maximumFractionDigits: big ? 1 : 0 }).format(big ? b / 1048576 : Math.max(1, b / 1024));
  } catch {
    return `${(b / 1048576).toFixed(1)} MB`;
  }
}

let me = null;
let stop = []; // nettoyages de la vue courante (animations, écouteurs)
let TEAM = { lessons: {} }; // ressources/manifest.json

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

export function toast(html, ms = 2800) {
  const box = $('#toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 360);
  }, ms);
}

export function copy(text) {
  const ok = () => toast(`${icon('check', { size: 18 })} ${t('app.copied')}`);
  const fallback = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;inset-inline-start:-9999px';
      document.body.appendChild(ta);
      ta.select();
      const done = document.execCommand('copy');
      ta.remove();
      done ? ok() : toast(t('app.copy.fail'));
    } catch {
      toast(t('app.copy.fail'));
    }
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
  else fallback();
}

const RING_DEF = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="ring-or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2dfa0"/><stop offset="1" stop-color="#c9a227"/></linearGradient>
<linearGradient id="ring-ia" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efeaff"/><stop offset="1" stop-color="#9c84f0"/></linearGradient>
</defs></svg>`;

/** Anneau de progression. `track` : 'creative' (or) ou 'ia' (lavande). */
function ring(p, { size = 100, sw = 9, label = '', color = '', track = '', title = '' } = {}) {
  const r = 50 - sw / 2 - 1;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, p || 0));
  return `<div class="ring ${track ? `ring--${track}` : ''}" style="width:${size}px;height:${size}px" ${title ? `role="img" aria-label="${esc(title)}"` : ''}><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="${r}" stroke-width="${sw}"/><circle class="fg" cx="50" cy="50" r="${r}" stroke-width="${sw}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(reduce ? c * (1 - v) : c).toFixed(1)}" data-off="${(c * (1 - v)).toFixed(1)}" ${color ? `style="stroke:${color}"` : ''}/></svg>${label}</div>`;
}
function animateRings(scope) {
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.ring .fg[data-off]', scope).forEach((c) => (c.style.strokeDashoffset = c.dataset.off))));
}
function countUp(el, to, d = 1.2) {
  if (!el) return;
  const g = G();
  if (!g) {
    el.textContent = num(to);
    return;
  }
  const o = { v: 0 };
  g.to(o, { v: to, duration: d, ease: 'power3.out', onUpdate: () => (el.textContent = num(Math.round(o.v))) });
}

function refreshMe() {
  me = S.currentStudent();
  return me;
}

/* ------------------------------------------------------------------ */
/* Progression : deux formations distinctes                            */
/* ------------------------------------------------------------------ */

function trackProgress(st, track) {
  const L = st.progress.lessons;
  const list = lessonsOf(track);
  const open = list.filter((l) => S.canAccess(st, l.id));
  const doneL = list.filter((l) => L[l.id]?.done);
  const quizzes = list.map((l) => L[l.id]?.quiz).filter((x) => typeof x === 'number');
  const quizAvg = quizzes.length ? quizzes.reduce((s, x) => s + x, 0) / quizzes.length : 0;
  const lastL = list.find((l) => l.id === st.progress.last);
  const next = (lastL && !L[lastL.id]?.done && S.canAccess(st, lastL.id) ? lastL : null) || open.find((l) => !L[l.id]?.done) || open[0] || list[0];
  const mods = modulesOf(track).map((m) => {
    const d = m.lessons.filter((l) => L[l.id]?.done).length;
    return { m, done: d, total: m.lessons.length, pct: m.lessons.length ? d / m.lessons.length : 0, open: m.lessons.some((l) => S.canAccess(st, l.id)) };
  });
  return {
    track,
    list,
    open,
    done: doneL.length,
    total: list.length,
    pct: list.length ? doneL.length / list.length : 0,
    quizAvg,
    quizN: quizzes.length,
    seconds: doneL.reduce((s, l) => s + DUR[l.id], 0),
    next,
    mods,
    complete: list.length > 0 && doneL.length === list.length,
    resume: !!(next && L[next.id] && !L[next.id].done),
  };
}
const progressAll = (st) => Object.fromEntries(TRACKS.map((x) => [x.id, trackProgress(st, x.id)]));

/** Formation de la dernière leçon ouverte (sinon la Créative). */
function lastTrack(st = me) {
  return findLesson(st?.progress?.last || '')?.module.track || TRACKS[0].id;
}
const rangeOf = (track) => {
  const ms = modulesOf(track);
  return `${modCode(ms[0])}–${modCode(ms[ms.length - 1])}`;
};

function checkBadges(st) {
  const L = st.progress.lessons;
  const modDone = (id) => !!MODULES.find((m) => m.id === id)?.lessons.every((l) => L[l.id]?.done);
  const all = LESSONS.length > 0 && LESSONS.every((l) => L[l.id]?.done);
  const rules = {
    'premier-pas': LESSONS.some((l) => L[l.id]?.done),
    fondations: modDone('m1'),
    structure: modDone('m2'),
    'sans-faute': Object.values(L).some((x) => x.quiz === 1),
    prompteur: modDone('ia1'),
    serie: S.streak(st.progress.days) >= 5,
    ia: modDone('ia2') && modDone('ia3'),
    closer: modDone('ia8'),
    diplome: all,
  };
  let delay = 900;
  Object.entries(rules).forEach(([k, ok]) => {
    if (ok && S.BADGES[k] && S.awardBadge(st.id, k)) {
      setTimeout(() => toast(`${icon(S.BADGES[k].icon, { size: 20 })} ${t('app.toast.badge', { name: `<b>${esc(t(`badge.${k}`))}</b>` })}`, 3600), delay);
      delay += 700;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Aperçu animé d'une leçon (moteur vidéo, en boucle)                  */
/* ------------------------------------------------------------------ */

function livePreview(box, lessonId, { from = 0, to = 7 } = {}) {
  const f = findLesson(lessonId);
  if (!f || !box || !window.gsap) return () => {};
  let comp;
  try {
    comp = compose(f.lesson, box, { module: f.module, next: f.next });
  } catch (err) {
    console.warn('Aperçu', lessonId, err);
    return () => {};
  }
  const fit = () => {
    const r = box.getBoundingClientRect();
    const s = Math.max(r.width / 1920, r.height / 1080);
    comp.root.style.transform = `translate(${(r.width - 1920 * s) / 2}px, ${(r.height - 1080 * s) / 2}px) scale(${s})`;
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(box);
  const end = Math.min(to, comp.duration);
  if (reduce) {
    comp.tl.seek(Math.min(end, 2.6), false);
    return () => ro.disconnect();
  }
  let time = from;
  let alive = true;
  let vis = true;
  const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
  io.observe(box);
  let last = performance.now();
  const loop = (now) => {
    if (!alive) return;
    if (vis && !document.hidden) {
      time += Math.min(0.1, (now - last) / 1000);
      if (time > end) time = from;
      comp.tl.seek(time, false);
    }
    last = now;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return () => {
    alive = false;
    ro.disconnect();
    io.disconnect();
  };
}

/* ------------------------------------------------------------------ */
/* Sélecteur de langue compact (barre du haut)                         */
/* ------------------------------------------------------------------ */

function langMenu() {
  return `<div class="lm">
    <button type="button" class="lm-b" aria-haspopup="true" aria-expanded="false" aria-label="${esc(t('i18n.choose'))}" title="${esc(t('i18n.choose'))}">${icon('globe', { size: 17 })}<span lang="${lang}">${LANG.short}</span></button>
    <div class="lm-m" role="menu" hidden>${LANGS.map((l) => `<button type="button" role="menuitemradio" aria-checked="${l.code === lang}" data-lang="${l.code}" lang="${l.code}" dir="${l.dir}"><span>${l.label}</span>${l.code === lang ? icon('check', { size: 16 }) : ''}</button>`).join('')}</div>
  </div>`;
}
function closeMenus() {
  $$('.lm-m:not([hidden])').forEach((m) => {
    m.hidden = true;
    m.previousElementSibling?.setAttribute('aria-expanded', 'false');
  });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('.lm-b');
  if (b) {
    const m = b.nextElementSibling;
    const willOpen = m.hidden;
    closeMenus();
    if (willOpen) {
      m.hidden = false;
      b.setAttribute('aria-expanded', 'true');
      m.querySelector('[aria-checked="true"]')?.focus();
    }
    return;
  }
  if (!e.target.closest('.lm-m')) closeMenus();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenus();
});
bindSwitchers(document.body);

/* ------------------------------------------------------------------ */
/* Connexion                                                           */
/* ------------------------------------------------------------------ */

const EYE_OFF = '<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.4 6.4C3.9 8.1 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

function viewLogin() {
  setTitle(t('app.title.login'));
  root.innerHTML = `
  <div class="login">
    <section class="login-box">
      <div class="login-top"><a class="ha-logo" href="../">${logoInner()}</a>${switcher('lang-sw')}</div>
      <div class="login-intro">
        <p class="card-k">${icon('play', { size: 13 })} ${t('app.login.kicker')}</p>
        <h1>${t('app.login.title')}</h1>
        <p class="muted">${t('app.login.lead')}</p>
      </div>
      <form class="login-f" id="lf" novalidate>
        <div class="fld">
          <label class="lbl" for="lf-id">${t('app.login.ident')}</label>
          <input class="in in--ltr" id="lf-id" name="ident" type="text" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false" required placeholder="${esc(t('app.login.ident.ph'))}">
        </div>
        <div class="fld">
          <label class="lbl" for="lf-pw">${t('app.login.secret')}</label>
          <div class="pw">
            <input class="in in--ltr" id="lf-pw" name="secret" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required placeholder="${esc(t('app.login.secret.ph'))}">
            <button class="pw-t" id="pw-t" type="button" aria-controls="lf-pw" aria-pressed="false" aria-label="${esc(t('app.login.show'))}" title="${esc(t('app.login.show'))}">${icon('eye', { size: 18 })}</button>
          </div>
          <p class="fld-h">${t('app.login.secret.help')}</p>
        </div>
        <p class="login-err" id="lerr" role="alert" aria-live="assertive"></p>
        <button class="b b--or b--l" id="lsub" type="submit"><span class="spin" aria-hidden="true"></span><span class="b-t">${t('app.login.submit')}</span></button>
      </form>
      <div class="login-demo">
        <span class="login-demo-ic">${icon('eye', { size: 20 })}</span>
        <div><b>${t('app.login.demo.title')}</b><p>${t('app.login.demo.text')}</p></div>
        <button class="b b--s" id="ldemo" type="button"><span class="spin" aria-hidden="true"></span><span class="b-t">${t('app.login.demo.btn')}</span></button>
      </div>
      <p class="muted login-foot">${t('app.login.noaccount')} <a href="${RESERVE}">${t('app.cta.reserve')}</a></p>
    </section>
    <aside class="login-art" id="lart" aria-hidden="true"><div class="login-art-cap"><span>${t('app.login.art')}</span></div></aside>
  </div>`;
  const f = $('#lf');
  const err = $('#lerr');
  const pw = $('#lf-pw');
  $('#pw-t').addEventListener('click', (e) => {
    const b = e.currentTarget;
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(show));
    const label = t(show ? 'app.login.hide' : 'app.login.show');
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = show ? EYE_OFF : icon('eye', { size: 18 });
    pw.focus();
  });
  const busy = (btn, on) => {
    btn.disabled = on;
    btn.classList.toggle('is-busy', on);
    btn.setAttribute('aria-busy', String(on));
    const tx = $('.b-t', btn);
    if (on) {
      btn.dataset.label = tx.textContent;
      tx.textContent = t('app.login.loading');
    } else if (btn.dataset.label) tx.textContent = btn.dataset.label;
  };
  const fail = (r) => {
    err.textContent = r?.error === 'suspended' ? t('app.login.err.suspended') : t('app.login.err.bad');
    f.classList.remove('is-shake');
    void f.offsetWidth;
    f.classList.add('is-shake');
  };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    if (!String(d.ident || '').trim() || !String(d.secret || '').trim()) {
      err.textContent = t('app.login.err.empty');
      (String(d.ident || '').trim() ? pw : $('#lf-id')).focus();
      return;
    }
    err.textContent = '';
    const btn = $('#lsub');
    busy(btn, true);
    let r;
    try {
      r = await S.loginStudent(d.ident, d.secret);
    } catch (x) {
      console.warn('Connexion', x);
      r = { error: 'bad' };
    }
    if (!r?.student) {
      busy(btn, false);
      fail(r);
      return;
    }
    me = r.student;
    if (location.hash !== '#/' && location.hash !== '') location.hash = '#/';
    else route();
  });
  $('#ldemo').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    busy(btn, true);
    const r = await openDemo();
    if (!r) {
      busy(btn, false);
      fail({ error: 'bad' });
      return;
    }
    if (location.hash !== '#/' && location.hash !== '') location.hash = '#/';
    else route();
  });
  const art = $('#lart');
  if (getComputedStyle(art).display !== 'none') stop.push(livePreview(art, 'm1-l2', { from: 0, to: 14 }));
  const g = G();
  if (g) g.from('.login-box > *', { y: 18, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, clearProps: 'all' });
}

async function openDemo() {
  try {
    const r = await S.loginStudent(S.DEMO_STUDENT.email, S.DEMO_STUDENT.code);
    if (r?.student) {
      me = r.student;
      return me;
    }
  } catch (x) {
    console.warn('Démo', x);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Coquille                                                            */
/* ------------------------------------------------------------------ */

function setTitle(s) {
  document.title = `${s} — Hooked Academy`;
}

function shell(active, html, { track = '' } = {}) {
  const demo = S.isDemo(me);
  const PP = progressAll(me);
  const st = S.streak(me.progress.days);
  const initial = demo ? t('app.demo.initial') : (me.firstName || me.name || 'H').trim()[0] || 'H';
  const isOn = (k) => (active === k ? 'aria-current="page"' : '');
  const trackActive = (id) => active === `track:${id}` || active === `lesson:${id}`;
  const tabs = [
    ['#/', 'home', t('app.nav.home'), active === 'home'],
    [`#/parcours/${active.startsWith('track:') || active.startsWith('lesson:') ? active.split(':')[1] : lastTrack()}`, 'map', t('app.nav.path'), active.startsWith('track:') || active.startsWith('lesson:')],
    ['#/ressources', 'book', t('app.nav.resources'), active === 'res'],
    ['#/profil', 'user', t('app.nav.profile'), active === 'profile'],
  ];
  root.innerHTML = `${RING_DEF}
  <a class="skip" href="#main">${t('app.skip')}</a>
  <div class="sh${demo ? ' is-demo' : ''}">
    <aside class="side" aria-label="${esc(t('app.nav.label'))}">
      <a class="ha-logo" href="../" aria-label="Hooked Academy">${logoInner()}</a>
      <nav class="side-nav" aria-label="${esc(t('app.nav.label'))}">
        <a class="nv" href="#/" ${isOn('home')}>${icon('home', { size: 20 })}<span>${t('app.nav.home')}</span></a>
        <p class="side-k">${t('app.nav.courses')}</p>
        ${TRACKS.map(
          (x) => `<a class="nv nv-trk" data-track="${x.id}" href="#/parcours/${x.id}" ${trackActive(x.id) ? 'aria-current="page"' : ''}>
            <span class="nv-ic">${icon(x.icon, { size: 18 })}</span>
            <span class="nv-t"><b>${trName(x.id)}</b><small>${demo ? t('app.demo.open1') : `${bdi(rangeOf(x.id))} · ${pc(PP[x.id].pct)}`}</small></span>
            ${demo ? '' : `<span class="nv-bar" aria-hidden="true"><i style="width:${(PP[x.id].pct * 100).toFixed(1)}%"></i></span>`}
          </a>`,
        ).join('')}
        <p class="side-k">${t('app.nav.space')}</p>
        <a class="nv" href="#/ressources" ${isOn('res')}>${icon('book', { size: 20 })}<span>${t('app.nav.resources')}</span>${demo ? icon('lock', { size: 14, cls: 'nv-lk' }) : ''}</a>
        <a class="nv" href="#/profil" ${isOn('profile')}>${icon('user', { size: 20 })}<span>${t('app.nav.profile')}</span></a>
      </nav>
      <div class="side-foot">
        ${switcher('lang-sw')}
        <a class="nv" href="https://hooked-lab.com" target="_blank" rel="noopener">${markSVG({ lab: true, cls: 'side-lab' }).replace('<svg', '<svg width="20" height="20"')}<span>Hooked Lab</span>${icon('arrow', { size: 14, cls: 'i-ext' })}</a>
        <a class="nv" href="../">${back(20)}<span>${t('app.nav.site')}</span></a>
      </div>
    </aside>
    <div class="sh-b">
      <header class="top-wrap">
        ${
          demo
            ? `<div class="demo-bar" role="note"><span class="demo-bar-k">${icon('lock', { size: 14 })}<b>${t('app.demo.pill')}</b></span><span class="demo-bar-t">${t('app.demo.bar')}</span><a class="demo-bar-cta" href="${RESERVE}">${t('app.cta.reserve')}${arrow(14)}</a></div>`
            : ''
        }
        <div class="top">
          <a class="ha-logo" href="#/" aria-label="${esc(t('app.nav.home'))}">${logoInner()}</a>
          ${
            demo
              ? ''
              : `<span class="streak" title="${esc(t('app.streak.title'))}">${icon('fire', { size: 18 })}<b>${num(st)}</b></span>
          <span class="xp" title="${esc(t(`level.${S.level(me.progress.xp).i}`))}"><span aria-hidden="true">⚡</span><b id="xp-v">${num(me.progress.xp)}</b> XP</span>`
          }
          ${langMenu()}
          <a class="av" href="#/profil" aria-label="${esc(t('app.nav.profile'))}">${esc(initial.toUpperCase())}</a>
        </div>
      </header>
      <main class="main" id="main" tabindex="-1" ${track ? `data-track="${track}"` : ''}>${html}</main>
    </div>
  </div>
  <nav class="tabs" aria-label="${esc(t('app.nav.label'))}">${tabs.map(([h, ic, label, on]) => `<a href="${h}" ${on ? 'aria-current="page"' : ''}>${icon(ic, { size: 21 })}<span>${label}</span></a>`).join('')}</nav>`;
  window.scrollTo(0, 0);
  animateRings(root);
}

function enter(sel) {
  const g = G();
  if (!g) return;
  const els = $$(sel).slice(0, 16);
  if (els.length) g.from(els, { y: 24, autoAlpha: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity,visibility' });
}

/* ------------------------------------------------------------------ */
/* Accueil : deux produits distincts                                   */
/* ------------------------------------------------------------------ */

function greet() {
  const h = new Date().getHours();
  return t(h < 12 ? 'app.hi.morning' : h < 18 ? 'app.hi.day' : 'app.hi.evening');
}

function voiceChip(l) {
  if (lang === 'fr') return l.voice || l.audio ? `<span class="chip chip--ok">${icon('mic', { size: 13 })} ${t('app.voice.darija')}</span>` : '';
  return l.audio ? `<span class="chip chip--ok">${icon('mic', { size: 13 })} ${t('app.voice.darija')}</span>` : '';
}

function contCard(P, { demo = false } = {}) {
  const l = P.next;
  if (!l) return '';
  const m = l.module;
  return `<a class="card cont" data-track="${P.track}" href="#/lecon/${l.id}" aria-label="${esc(`${t(P.resume ? 'app.home.resume' : demo ? 'app.home.start' : 'app.home.continue')} : ${l.title}`)}">
    <div class="cont-stage" id="cont-stage"><span class="cont-shade" aria-hidden="true"></span></div>
    <span class="cont-play" aria-hidden="true">${icon('play', { size: 22 })}</span>
    <div class="cont-b">
      <p class="card-k">${icon(TRK[P.track].icon, { size: 13 })} ${trName(P.track)} · ${t(P.resume ? 'app.home.resume' : demo ? 'app.home.start' : 'app.home.continue')}</p>
      <h2>${esc(l.title)}</h2>
      <div class="cont-meta"><span class="chip chip--acc">${bdi(modCode(m))}</span><span>${lessonN(l.n)} · ${dur(DUR[l.id])}</span>${voiceChip(l)}</div>
    </div>
  </a>`;
}

function productCard(tr, P, demo) {
  const ms = P.mods;
  const footer = demo
    ? `<a class="prod-next" href="#/lecon/${P.open[0]?.id || P.next.id}"><span><small>${t('app.demo.openLesson')}</small><b>${bdi(modCode(P.open[0]?.module || P.next.module))} · ${esc((P.open[0] || P.next).title)}</b></span><span class="prod-go">${arrow(18)}</span></a>`
    : P.complete
      ? `<div class="prod-end">${icon('trophy', { size: 20 })}<span><b>${t(`app.end.${tr.id}.title`)}</b><small>${t(`app.end.${tr.id}.short`)}</small></span></div>`
      : `<a class="prod-next" href="#/lecon/${P.next.id}"><span><small>${t(P.resume ? 'app.home.resume' : P.done ? 'app.home.continue' : 'app.home.start')}</small><b>${bdi(modCode(P.next.module))} · ${esc(P.next.title)}</b></span><span class="prod-go">${arrow(18)}</span></a>`;
  return `<section class="prod" data-track="${tr.id}" aria-labelledby="prod-${tr.id}">
    <span class="prod-art" aria-hidden="true">${esc(tr.code)}</span>
    <a class="prod-h" href="#/parcours/${tr.id}">
      <span class="prod-ic">${icon(tr.icon, { size: 26 })}</span>
      <span class="prod-t"><small>${bdi(rangeOf(tr.id))} · ${t('app.n.lessons', { n: P.total })}</small><b id="prod-${tr.id}">${trName(tr.id)}</b></span>
      ${demo ? `<span class="chip chip--lock">${icon('lock', { size: 12 })} ${t('app.demo.chip')}</span>` : ring(P.pct, { size: 62, sw: 9, track: tr.id, title: pc(P.pct), label: `<b>${pc(P.pct)}</b>` })}
    </a>
    <p class="prod-p">${esc(tr.pitch)}</p>
    ${
      demo
        ? `<ol class="prod-list">${ms.map((x) => `<li class="${x.open ? 'is-open' : 'is-lock'}">${x.open ? icon('play', { size: 13 }) : icon('lock', { size: 13 })}<span class="prod-code">${bdi(modCode(x.m))}</span><span>${esc(x.m.title)}</span></li>`).join('')}</ol>`
        : `<ol class="prod-mods" aria-label="${esc(t('app.word.modules'))}">${ms.map((x) => `<li style="--c:${x.m.color};--p:${x.pct.toFixed(3)}" title="${esc(`${modCode(x.m)} · ${x.m.title} — ${x.done}/${x.total}`)}" class="${x.done === x.total ? 'is-done' : x.m.id === P.next?.module.id ? 'is-cur' : ''}"><i aria-hidden="true"></i><span>${bdi(modCode(x.m))}</span></li>`).join('')}</ol>`
    }
    ${footer}
  </section>`;
}

function viewHome() {
  const demo = S.isDemo(me);
  const PP = progressAll(me);
  setTitle(t('app.title.home'));
  if (demo) return viewHomeDemo(PP);
  const lv = S.level(me.progress.xp);
  let heroT = lastTrack();
  if (PP[heroT].complete) heroT = TRACKS.find((x) => !PP[x.id].complete)?.id || heroT;
  const hero = PP[heroT];
  const done = TRACKS.reduce((s, x) => s + PP[x.id].done, 0);
  const seconds = TRACKS.reduce((s, x) => s + PP[x.id].seconds, 0);
  const qN = TRACKS.reduce((s, x) => s + PP[x.id].quizN, 0);
  const qAvg = qN ? TRACKS.reduce((s, x) => s + PP[x.id].quizAvg * PP[x.id].quizN, 0) / qN : 0;
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { iso: S.iso(d), l: fmtDate(d, { weekday: 'narrow' }), full: fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }) };
  });
  const set = new Set(me.progress.days);
  const streak = S.streak(me.progress.days);
  const defi = t(`app.defi.${Math.floor(Date.now() / 864e5) % 7}`);
  const name = esc(me.firstName || me.name || '');
  shell(
    'home',
    `<div class="dash">
      <section class="card hello">
        <div class="hello-deco" aria-hidden="true">${markSVG()}</div>
        <p class="card-k">${icon('sparkles', { size: 14 })} ${esc(cohortOf(me))}</p>
        <h1>${greet()}${name ? `${AR ? "،" : ","} ${name}` : ''} <span id="wave" aria-hidden="true">👋</span></h1>
        <div class="lvl">
          <div class="lvl-top"><span class="lvl-name">${t(`level.${lv.i}`)}</span><span class="muted">${lv.next ? t('app.level.next', { xp: num(me.progress.xp), need: num(lv.next.xp), name: esc(t(`level.${lv.i + 1}`)) }) : t('app.level.max')}</span></div>
          <div class="lvl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(lv.pct * 100)}" aria-label="${esc(t(`level.${lv.i}`))}"><i id="lvl-i" style="transform:scaleX(${lv.pct})"></i></div>
        </div>
      </section>

      ${contCard(hero)}

      <div class="stats">
        <div class="card stat"><i>${icon('check', { size: 18 })}</i><b data-c="${done}">${num(done)}</b><span>${t('app.stat.done')}</span></div>
        <div class="card stat"><i>${icon('clock', { size: 18 })}</i><b>${num(Math.round(seconds / 60))}</b><span>${t('app.stat.minutes')}</span></div>
        <div class="card stat"><i>${icon('target', { size: 18 })}</i><b>${qN ? pc(qAvg) : '—'}</b><span>${t('app.stat.quiz')}</span></div>
        <div class="card stat"><i>${icon('trophy', { size: 18 })}</i><b data-c="${me.progress.badges.length}">${num(me.progress.badges.length)}</b><span>${t('app.stat.badges')}</span></div>
      </div>

      <section class="prods" aria-labelledby="prods-h">
        <div class="sec-h"><div><h2 id="prods-h">${t('app.home.courses')}</h2><p>${t('app.home.courses.sub')}</p></div></div>
        <div class="prods-g">${TRACKS.map((x) => productCard(x, PP[x.id], false)).join('')}</div>
      </section>

      <section class="card week-c">
        <p class="card-k">${icon('fire', { size: 14 })} ${t('app.streak', { n: streak })}</p>
        <h3>${t('app.week.title')}</h3>
        <div class="week">${days.map((d) => `<span title="${esc(d.full)}"><i class="${set.has(d.iso) ? 'on' : ''} ${d.iso === S.iso() ? 'today' : ''}">${set.has(d.iso) ? icon('fire', { size: 15 }) : ''}</i>${esc(d.l)}</span>`).join('')}</div>
      </section>

      <section class="card defi">
        <p class="card-k">${icon('bolt', { size: 14 })} ${t('app.defi.k')}</p>
        <p class="defi-t">${esc(defi)}</p>
        <a class="b b--s" href="#/ressources">${icon('book', { size: 15 })} ${t('app.defi.cta')}</a>
      </section>

      <a class="card lab-card" href="https://hooked-lab.com" target="_blank" rel="noopener">
        <span class="lc-m">${markSVG({ lab: true })}</span>
        <div><p class="card-k">Hooked Lab</p><h3>${t('app.lab.title')}</h3><p class="muted">${t('app.lab.text')}</p></div>
      </a>

      <section class="bdg-sec">
        <div class="sec-h"><div><h2>${t('app.badges.title')}</h2></div><a class="b b--s" href="#/profil">${t('app.badges.all')}</a></div>
        <div class="badges">${Object.keys(S.BADGES)
          .slice(0, 6)
          .map((k) => badgeHTML(k))
          .join('')}</div>
      </section>
    </div>`,
  );
  $$('[data-c]').forEach((e) => countUp(e, +e.dataset.c));
  const g = G();
  if (g) {
    g.fromTo('#lvl-i', { scaleX: 0 }, { scaleX: lv.pct, duration: 1.4, ease: 'expo.out', delay: 0.2 });
    g.fromTo('#wave', { rotate: 0 }, { rotate: 18, duration: 0.25, repeat: 5, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
    g.from('.dash > *', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity,visibility' });
    g.from('.prod-mods li', { y: 14, autoAlpha: 0, duration: 0.5, ease: 'expo.out', stagger: 0.03, delay: 0.4, clearProps: 'transform,opacity,visibility' });
  }
  stop.push(livePreview($('#cont-stage'), hero.next.id, { from: 0, to: 9 }));
}

function viewHomeDemo(PP) {
  const heroT = lastTrack();
  const hero = PP[heroT];
  shell(
    'home',
    `<div class="dash dash--demo">
      <section class="card hello hello--demo">
        <div class="hello-deco" aria-hidden="true">${markSVG()}</div>
        <p class="card-k">${icon('eye', { size: 14 })} ${t('app.demo.kicker')}</p>
        <h1>${t('app.demo.home.title')}</h1>
        <p class="hello-lead">${t('app.demo.home.lead')}</p>
        <div class="hello-cta"><a class="b b--or" href="${RESERVE}">${t('app.cta.reserve')}</a><a class="b" href="#/parcours/${heroT}">${icon('map', { size: 16 })} ${t('app.demo.home.path')}</a></div>
      </section>
      ${contCard(hero, { demo: true })}
      <section class="prods" aria-labelledby="prods-h">
        <div class="sec-h"><div><h2 id="prods-h">${t('app.home.courses')}</h2><p>${t('app.demo.courses.sub')}</p></div></div>
        <div class="prods-g">${TRACKS.map((x) => productCard(x, PP[x.id], true)).join('')}</div>
      </section>
    </div>`,
  );
  const g = G();
  if (g) g.from('.dash > *', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity,visibility' });
  stop.push(livePreview($('#cont-stage'), hero.next.id, { from: 0, to: 9 }));
}

function cohortOf(st) {
  if (S.isDemo(st)) return t('app.demo.cohort');
  if (st.role === 'formateur') return t('app.role.trainer');
  return st.cohort || 'Hooked Academy';
}

function badgeHTML(k) {
  const b = S.BADGES[k];
  const on = me.progress.badges.includes(k);
  const name = t(`badge.${k}`);
  const desc = t(`badge.${k}.d`);
  return `<div class="bdg ${on ? 'is-on' : ''}" title="${esc(desc)}"><div class="bdg-in"><span class="bdg-ic">${icon(on ? b.icon : 'lock', { size: 24 })}</span><b>${esc(name)}</b><span>${esc(desc)}</span><span class="sr-only">${t(on ? 'app.badge.on' : 'app.badge.off')}</span></div></div>`;
}

/* ------------------------------------------------------------------ */
/* Parcours : une vue par formation                                    */
/* ------------------------------------------------------------------ */

function trackSwitch(active, PP, demo) {
  return `<nav class="trk-sw" aria-label="${esc(t('app.track.switch'))}">${TRACKS.map(
    (x) => `<a href="#/parcours/${x.id}" data-track="${x.id}" ${x.id === active ? 'aria-current="page"' : ''}>
      <span class="trk-sw-ic">${icon(x.icon, { size: 20 })}</span>
      <span class="trk-sw-t"><b>${trName(x.id)}</b><small>${bdi(rangeOf(x.id))} · ${t('app.n.modules', { n: modulesOf(x.id).length })}</small></span>
      ${demo ? '' : `<span class="trk-sw-pc">${pc(PP[x.id].pct)}</span><span class="trk-sw-bar" aria-hidden="true"><i style="width:${(PP[x.id].pct * 100).toFixed(1)}%"></i></span>`}
    </a>`,
  ).join('')}</nav>`;
}

function endCard(trackId) {
  const other = TRACKS.find((x) => x.id !== trackId);
  const cta = trackId === 'creative' ? `<a class="b b--acc-o" href="#/parcours/${other.id}" data-track="${other.id}">${icon(other.icon, { size: 16 })} ${t('app.end.creative.cta')}</a>` : `<a class="b b--acc" href="#/profil">${icon('trophy', { size: 16 })} ${t('app.end.ia.cta')}</a>`;
  return `<section class="card trk-end"><span class="trk-end-ic">${icon('trophy', { size: 28 })}</span><div><h2>${t(`app.end.${trackId}.title`)}</h2><p>${t(`app.end.${trackId}.text`)}</p></div>${cta}</section>`;
}

function lockedNode(l) {
  return `<span class="node is-lock" role="listitem" aria-label="${esc(`${lessonN(l.n)} — ${t('app.lock.members')}`)}"><span class="node-b">${icon('lock', { size: 20 })}</span><span class="node-t"><b>${lessonN(l.n)}</b><span class="node-sk" aria-hidden="true"><i></i><i></i></span><span class="node-lk">${t('app.lock.members')}</span></span></span>`;
}

function moduleHTML(m, P, demo) {
  const L = me.progress.lessons;
  const openHere = m.lessons.filter((l) => S.canAccess(me, l.id));
  const locked = demo && !openHere.length;
  const d = m.lessons.filter((l) => L[l.id]?.done).length;
  const head = `<div class="map-head">
      <span class="map-n">${esc(modCode(m))}</span>
      <div class="map-ht"><h2>${esc(m.title)}</h2><p>${m.ar && !AR ? `<span class="ar" lang="ar">${esc(m.ar)}</span><span class="dot" aria-hidden="true">·</span>` : ''}<span>${t('app.n.lessons', { n: m.lessons.length })}</span>${demo ? '' : `<span class="dot" aria-hidden="true">·</span><span>${t('app.map.done', { d: num(d), n: num(m.lessons.length) })}</span>`}</p></div>
      ${locked ? `<span class="lock-tag">${icon('lock', { size: 13 })} ${t('app.lock.members')}</span>` : !demo && d === m.lessons.length ? `<span class="done-tag">${icon('check', { size: 14, stroke: 2.6 })}</span>` : ''}
    </div>`;
  if (locked) return `<section class="map-mod is-locked" style="--c:${m.color}" aria-label="${esc(`${modCode(m)} · ${m.title}`)}">${head}</section>`;
  const nodes = m.lessons
    .map((l) => {
      if (!S.canAccess(me, l.id)) return lockedNode(l);
      const done = L[l.id]?.done;
      const cur = l.id === P.next?.id && !P.complete;
      const q = L[l.id]?.quiz;
      return `<a class="node ${done ? 'is-done' : ''} ${cur ? 'is-cur' : ''}" role="listitem" href="#/lecon/${l.id}" ${cur ? 'aria-current="step"' : ''}>${cur ? `<span class="node-tag">${t('app.map.here')}</span>` : ''}<span class="node-b">${done ? icon('check', { size: 26, stroke: 3 }) : num(l.n)}</span><span class="node-t"><b>${esc(l.title)}</b><span>${dur(DUR[l.id])}${(lang === 'fr' && l.voice) || l.audio ? ` · ${t('app.map.voice')}` : ''}${q != null ? ` · ${t('app.map.quiz', { s: pc(q) })}` : ''}</span></span></a>`;
    })
    .join('');
  return `<section class="map-mod" style="--c:${m.color}" id="mod-${m.id}" aria-label="${esc(`${modCode(m)} · ${m.title}`)}">${head}${demo ? '' : `<div class="map-bar" aria-hidden="true"><i style="width:${((d / m.lessons.length) * 100).toFixed(1)}%"></i></div>`}<div class="trail" role="list">${nodes}</div></section>`;
}

function viewTrack(trackId) {
  const tr = TRK[trackId];
  const PP = progressAll(me);
  const P = PP[trackId];
  const demo = S.isDemo(me);
  const mods = modulesOf(trackId);
  const parts = [...new Set(mods.map((m) => m.part))];
  const partOf = Object.fromEntries(PARTS.map((p) => [p.id, p]));
  setTitle(trName(trackId));
  const cta = demo
    ? `<a class="b b--acc" href="#/lecon/${P.open[0]?.id || P.next.id}">${icon('play', { size: 16 })} ${t('app.demo.openLesson')}</a><a class="b" href="${RESERVE}">${t('app.cta.reserve')}</a>`
    : P.complete
      ? `<a class="b b--acc" href="#/lecon/${P.list[0].id}">${icon('repeat', { size: 16 })} ${t('app.track.again')}</a>`
      : `<a class="b b--acc" href="#/lecon/${P.next.id}">${icon('play', { size: 16 })} ${t(P.resume ? 'app.home.resume' : P.done ? 'app.home.continue' : 'app.track.start')}<span class="b-sub">${bdi(modCode(P.next.module))} · ${lessonN(P.next.n)}</span></a>`;
  let lastPart = '';
  shell(
    `track:${trackId}`,
    `<div class="trk">
      ${trackSwitch(trackId, PP, demo)}
      <header class="trk-h">
        <span class="trk-code" aria-hidden="true">${esc(tr.code)}</span>
        <div class="trk-hb">
          <p class="card-k">${icon(tr.icon, { size: 14 })} ${bdi(rangeOf(trackId))} · ${t('app.n.modules', { n: mods.length })} · ${t('app.n.lessons', { n: P.total })}</p>
          <h1>${trName(trackId)}</h1>
          ${!AR && tr.ar ? `<p class="trk-ar ar" lang="ar">${esc(tr.ar)}</p>` : ''}
          <p class="trk-p">${esc(tr.pitch)}</p>
          <div class="trk-act">${cta}</div>
        </div>
        ${
          demo
            ? `<div class="trk-demo"><span class="trk-demo-ic">${icon('lock', { size: 22 })}</span><b>${t('app.demo.trk.title', { n: P.open.length })}</b><p>${t('app.demo.trk.text', { n: P.total })}</p></div>`
            : `<div class="trk-ring">${ring(P.pct, { size: 132, sw: 8, track: trackId, title: pc(P.pct), label: `<b>${pc(P.pct)}</b><small>${t('app.map.done', { d: num(P.done), n: num(P.total) })}</small>` })}
              <dl class="trk-dl"><div><dt>${t('app.stat.minutes')}</dt><dd>${num(Math.round(P.seconds / 60))}</dd></div><div><dt>${t('app.stat.quiz')}</dt><dd>${P.quizN ? pc(P.quizAvg) : '—'}</dd></div></dl></div>`
        }
      </header>
      ${!demo && P.complete ? endCard(trackId) : ''}
      <div class="map">${mods
        .map((m) => {
          let head = '';
          if (parts.length > 1 && m.part !== lastPart) {
            const p = partOf[m.part];
            head = `<p class="map-part"><span>${t('app.map.part', { n: parts.indexOf(m.part) + 1 })}</span><b>${esc(p?.title || '')}</b></p>`;
          }
          lastPart = m.part;
          return head + moduleHTML(m, P, demo);
        })
        .join('')}</div>
    </div>`,
    { track: trackId },
  );
  const g = G();
  if (g) {
    g.from('.trk-h > *, .trk-sw', { y: 22, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity,visibility' });
    $$('.map-mod').forEach((mod) => {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        g.from($$('.node', mod), { x: X(-30), autoAlpha: 0, scale: 0.92, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.06, clearProps: 'transform,opacity,visibility' });
      });
      io.observe(mod);
      stop.push(() => io.disconnect());
    });
  }
  const cur = $('.node.is-cur');
  if (cur && P.done > 0) {
    const tm = setTimeout(() => cur.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 450);
    stop.push(() => clearTimeout(tm));
  }
}

/* ------------------------------------------------------------------ */
/* Fichiers de l'équipe (ressources/manifest.json)                     */
/* ------------------------------------------------------------------ */

const KINDS = ['pdf', 'prompt', 'link', 'image', 'file'];
function normItem(x, lessonId) {
  if (!x || typeof x !== 'object') return null;
  const kind = KINDS.includes(String(x.kind || '').toLowerCase()) ? String(x.kind).toLowerCase() : 'file';
  let href = '';
  if (kind === 'link') {
    if (!/^https?:\/\//i.test(String(x.url || ''))) return null;
    href = x.url;
  } else if (x.path) {
    const p = String(x.path).replace(/^\.?\/+/, '');
    if (/^[a-z]+:/i.test(p) || p.includes('..')) return null;
    href = `../${p}`;
  } else if (/^https?:\/\//i.test(String(x.url || ''))) href = x.url;
  if (kind !== 'prompt' && !href) return null;
  if (kind === 'prompt' && !x.text && !href) return null;
  return { kind, title: String(x.title || x.file || '').trim() || t('app.file.untitled'), file: x.file || '', href, size: x.size, text: x.text || '', lessonId, team: true };
}
function teamItems(lessonId) {
  const list = TEAM.lessons?.[lessonId];
  if (!Array.isArray(list)) return [];
  return list
    .filter((x) => x && (x.lang == null || x.lang === '' || x.lang === lang))
    .map((x) => normItem(x, lessonId))
    .filter(Boolean);
}
const ext = (it) => (String(it.file || it.href).split(/[?#]/)[0].split('.').pop() || '').slice(0, 4).toUpperCase();
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

function emptyState(ic, title, text) {
  return `<div class="empty"><span class="empty-ic">${icon(ic, { size: 26 })}</span><b>${title}</b><p>${text}</p></div>`;
}
function lockedPanel(text) {
  return `<div class="locked-p"><div class="locked-sk" aria-hidden="true"><i></i><i></i><i></i></div><div class="empty is-lock"><span class="empty-ic">${icon('lock', { size: 24 })}</span><b>${t('app.lock.members')}</b><p>${text}</p><a class="b b--or b--s" href="${RESERVE}">${t('app.cta.reserve')}</a></div></div>`;
}

function renderPdfs(panel, items) {
  if (!items.length) {
    panel.innerHTML = emptyState('doc', t('app.empty.pdf.t'), t('app.empty.pdf.x'));
    return;
  }
  const canPrev = matchMedia('(min-width: 760px)').matches;
  panel.innerHTML = `<ul class="files">${items
    .map(
      (it, i) => `<li class="file" data-kind="pdf">
        <span class="file-ic file-ic--pdf" aria-hidden="true">PDF</span>
        <div class="file-b"><b>${esc(it.title)}</b><small>${[fmtSize(it.size), it.file ? `<bdi>${esc(it.file)}</bdi>` : ''].filter(Boolean).join(' · ')}</small></div>
        <div class="file-a">
          ${canPrev ? `<button class="b b--s" type="button" data-prev="${i}" aria-expanded="false">${icon('eye', { size: 15 })} <span>${t('app.file.preview')}</span></button>` : ''}
          <a class="b b--s" href="${esc(it.href)}" target="_blank" rel="noopener">${t('app.file.open')}</a>
          <a class="b b--s b--i" href="${esc(it.href)}" download aria-label="${esc(`${t('app.file.download')} : ${it.title}`)}" title="${esc(t('app.file.download'))}">${icon('download', { size: 16 })}</a>
        </div>
        <div class="file-prev" hidden></div>
      </li>`,
    )
    .join('')}</ul>`;
  $$('[data-prev]', panel).forEach((b) =>
    b.addEventListener('click', () => {
      const li = b.closest('.file');
      const box = $('.file-prev', li);
      const open = box.hidden;
      box.hidden = !open;
      b.setAttribute('aria-expanded', String(open));
      $('span', b).textContent = t(open ? 'app.file.preview.hide' : 'app.file.preview');
      if (open && !box.firstChild) box.innerHTML = `<iframe src="${esc(items[+b.dataset.prev].href)}#view=FitH" title="${esc(items[+b.dataset.prev].title)}" loading="lazy"></iframe>`;
    }),
  );
}

function renderPrompts(panel, prompts) {
  if (!prompts.length) {
    panel.innerHTML = emptyState('chat', t('app.empty.prompts.t'), t('app.empty.prompts.x'));
    return;
  }
  panel.innerHTML = `<div class="res">${prompts
    .map(
      (p, i) => `<article class="res-i">
        <div class="res-h"><div><p class="card-k">${p.team ? `${icon('users', { size: 12 })} ${t('app.prompt.team')}` : `${icon('sparkles', { size: 12 })} ${t('app.prompt.lesson')}`}</p><b>${esc(p.title)}</b></div>
        ${p.text ? `<button class="b b--s" type="button" data-copy="${i}">${icon('copy', { size: 15 })} ${t('app.copy')}</button>` : `<a class="b b--s" href="${esc(p.href)}" target="_blank" rel="noopener">${t('app.file.open')}</a>`}</div>
        ${p.text ? `<pre dir="auto">${esc(p.text)}</pre>` : ''}
      </article>`,
    )
    .join('')}</div>`;
  $$('[data-copy]', panel).forEach((b) => b.addEventListener('click', () => copy(prompts[+b.dataset.copy].text)));
}

function renderFiles(panel, items, { withPdf = false } = {}) {
  const pdfs = withPdf ? items.filter((x) => x.kind === 'pdf') : [];
  const imgs = items.filter((x) => x.kind === 'image');
  const links = items.filter((x) => x.kind === 'link');
  const files = items.filter((x) => x.kind === 'file');
  if (!pdfs.length && !imgs.length && !links.length && !files.length) {
    panel.innerHTML = emptyState('link', t('app.empty.res.t'), t('app.empty.res.x'));
    return;
  }
  const row = (it) => {
    const isLink = it.kind === 'link';
    return `<li class="file" data-kind="${it.kind}">
      <span class="file-ic ${it.kind === 'pdf' ? 'file-ic--pdf' : ''}" aria-hidden="true">${isLink ? icon('link', { size: 18 }) : it.kind === 'pdf' ? 'PDF' : esc(ext(it) || '—')}</span>
      <div class="file-b"><b>${esc(it.title)}</b><small>${isLink ? `<bdi>${esc(host(it.href))}</bdi>` : [fmtSize(it.size), it.file ? `<bdi>${esc(it.file)}</bdi>` : ''].filter(Boolean).join(' · ')}</small></div>
      <div class="file-a">${
        isLink
          ? `<a class="b b--s" href="${esc(it.href)}" target="_blank" rel="noopener noreferrer">${t('app.file.visit')} ${icon('arrow', { size: 14, cls: 'i-ext' })}</a>`
          : `<a class="b b--s" href="${esc(it.href)}" target="_blank" rel="noopener">${t('app.file.open')}</a><a class="b b--s b--i" href="${esc(it.href)}" download aria-label="${esc(`${t('app.file.download')} : ${it.title}`)}" title="${esc(t('app.file.download'))}">${icon('download', { size: 16 })}</a>`
      }</div>
    </li>`;
  };
  panel.innerHTML = `${pdfs.length ? `<p class="card-k">${t('app.tab.pdf')}</p><ul class="files">${pdfs.map(row).join('')}</ul>` : ''}
    ${imgs.length ? `<p class="card-k">${t('app.res.images')}</p><ul class="imgs">${imgs.map((it) => `<li><a href="${esc(it.href)}" target="_blank" rel="noopener"><img src="${esc(it.href)}" alt="${esc(it.title)}" loading="lazy" decoding="async"><span>${esc(it.title)}</span></a></li>`).join('')}</ul>` : ''}
    ${links.length ? `<p class="card-k">${t('app.res.links')}</p><ul class="files">${links.map(row).join('')}</ul>` : ''}
    ${files.length ? `<p class="card-k">${t('app.res.files')}</p><ul class="files">${files.map(row).join('')}</ul>` : ''}`;
}

/* ------------------------------------------------------------------ */
/* Onglets accessibles (clic, flèches dans le sens de lecture)         */
/* ------------------------------------------------------------------ */

function tabList(id, tabs, cls = '') {
  return `<div class="tg ${cls}" role="tablist" id="${id}">${tabs
    .map(
      (x) => `<button type="button" role="tab" id="${id}-${x.k}" data-tab="${x.k}" aria-selected="false" tabindex="-1" aria-controls="${id}-panel" class="${x.lock ? 'is-lock' : ''}">${x.ic ? icon(x.ic, { size: 16 }) : ''}<span>${x.label}</span>${x.lock ? icon('lock', { size: 13, cls: 'tg-lk' }) : x.count != null ? `<em>${num(x.count)}</em>` : ''}${x.lock ? `<span class="sr-only">${t('app.lock.members')}</span>` : ''}</button>`,
    )
    .join('')}</div>`;
}
function bindTabs(id, render, first) {
  const list = $(`#${id}`);
  const panel = $(`#${id}-panel`);
  if (!list || !panel) return;
  const btns = $$('[role="tab"]', list);
  const select = (k, focus = false) => {
    btns.forEach((b) => {
      const on = b.dataset.tab === k;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on) {
        panel.setAttribute('aria-labelledby', b.id);
        if (focus) b.focus();
      }
    });
    panel.innerHTML = '';
    render(k, panel);
    const g = G();
    if (g && panel.children.length) g.from(panel.children, { y: 14, autoAlpha: 0, duration: 0.5, ease: 'expo.out', stagger: 0.04, clearProps: 'transform,opacity,visibility' });
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(b.dataset.tab));
    b.addEventListener('keydown', (e) => {
      const fwd = isRTL ? 'ArrowLeft' : 'ArrowRight';
      const bwd = isRTL ? 'ArrowRight' : 'ArrowLeft';
      let j = -1;
      if (e.key === fwd) j = (i + 1) % btns.length;
      if (e.key === bwd) j = (i - 1 + btns.length) % btns.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = btns.length - 1;
      if (j >= 0) {
        e.preventDefault();
        select(btns[j].dataset.tab, true);
      }
    });
  });
  select(first || btns[0]?.dataset.tab);
}

/* ------------------------------------------------------------------ */
/* Leçon                                                               */
/* ------------------------------------------------------------------ */

function crumb(f) {
  const { lesson: l, module: m, track } = f;
  return `<nav class="ls-crumb" aria-label="${esc(t('app.crumb'))}"><a href="#/parcours/${track.id}">${icon(track.icon, { size: 14 })} ${trName(track.id)}</a><span class="sep" aria-hidden="true">${icon('arrow', { size: 12, cls: 'i-dir' })}</span><a href="#/parcours/${track.id}" class="crumb-mod">${bdi(modCode(m))} · ${esc(m.title)}</a><span class="sep" aria-hidden="true">${icon('arrow', { size: 12, cls: 'i-dir' })}</span><span aria-current="page">${lessonN(l.n)}</span></nav>`;
}

function playerHTML(l) {
  const mp4 = lang === 'fr' && l.video;
  if (mp4) return `<video id="vid" src="../${esc(l.video)}" ${l.poster ? `poster="../${esc(l.poster)}"` : ''} controls playsinline preload="metadata" aria-label="${esc(t('app.player.label', { title: l.title }))}"></video>`;
  const q = new URLSearchParams({ id: l.id, lang });
  if (l.audio) q.set('audio', '1');
  return `<iframe id="ifr" src="../motion/player.html?${q}" title="${esc(t('app.player.label', { title: l.title }))}" allow="fullscreen; autoplay" allowfullscreen loading="lazy"></iframe>`;
}

function playerNote(l) {
  if (lang === 'fr') {
    if (l.video) return '';
    return l.audio ? '' : `<span class="ls-note">${t('app.voice.soon')}</span>`;
  }
  return `<span class="ls-note">${l.audio ? t('app.voice.translated') : t('app.voice.translated.soon')}</span>`;
}

function viewLocked(f) {
  const { lesson: l, module: m, track } = f;
  const P = trackProgress(me, track.id);
  const open = P.open[0];
  setTitle(t('app.lock.title'));
  shell(
    `lesson:${track.id}`,
    `<div class="lk">
      ${crumb(f)}
      <div class="lk-stage" aria-hidden="true"><div class="lk-art">${markSVG()}<i></i><i></i><i></i><i></i></div><span class="lk-lock">${icon('lock', { size: 30 })}</span></div>
      <div class="lk-b">
        <p class="card-k">${bdi(modCode(m))} · ${lessonN(l.n)}</p>
        <h1>${t('app.lock.title')}</h1>
        <p>${t('app.lock.text', { n: P.total, track: trName(track.id) })}</p>
        <ul class="lk-list">${['app.lock.inc.lessons', 'app.lock.inc.quiz', 'app.lock.inc.files', 'app.lock.inc.cert'].map((k) => `<li>${icon('check', { size: 15, stroke: 2.4 })} ${t(k)}</li>`).join('')}</ul>
        <div class="lk-act"><a class="b b--or" href="${RESERVE}">${t('app.cta.reserve')}</a>${open ? `<a class="b" href="#/lecon/${open.id}">${icon('play', { size: 15 })} ${t('app.lock.open')}</a>` : ''}</div>
      </div>
    </div>`,
    { track: track.id },
  );
  enter('.lk > *');
}

function viewLesson(id) {
  const f = findLesson(id);
  if (!f) {
    location.replace(`#/parcours/${lastTrack()}`);
    return;
  }
  if (!S.canAccess(me, f.lesson.id)) return viewLocked(f);
  const { lesson: l, module: m, prev, next, track } = f;
  const demo = S.isDemo(me);
  const rec = me.progress.lessons[l.id] || {};
  S.recordLesson(me.id, l.id, { watched: rec.watched || 0 });
  refreshMe();
  const P = trackProgress(me, track.id);
  const isIA = track.id === 'ia';
  const items = teamItems(l.id);
  const pdfs = items.filter((x) => x.kind === 'pdf');
  const prompts = [...(l.res || []).map((r) => ({ kind: 'prompt', title: r.title, text: r.text, team: false })), ...items.filter((x) => x.kind === 'prompt')];
  const others = items.filter((x) => x.kind === 'link' || x.kind === 'image' || x.kind === 'file');
  const quizN = (l.quiz || []).length;
  setTitle(l.title);

  const learnTabs = [
    { k: 'ess', ic: 'star', label: t('app.tab.ess') },
    { k: 'ex', ic: 'pen', label: t('app.tab.ex') },
  ];
  let tabsHTML;
  if (isIA) {
    const at = [
      { k: 'quiz', ic: 'target', label: t('app.tab.quiz'), count: quizN },
      { k: 'pdf', ic: 'doc', label: t('app.tab.pdf'), count: pdfs.length, lock: demo },
      { k: 'prompts', ic: 'chat', label: t('app.tab.prompts'), count: prompts.length, lock: demo },
      { k: 'res', ic: 'link', label: t('app.tab.res'), count: others.length, lock: demo },
    ];
    tabsHTML = `<section class="atl" aria-labelledby="atl-h">
        <header class="atl-h"><span class="atl-ic">${icon('sparkles', { size: 20 })}</span><div><h2 id="atl-h">${t('app.atl.title')}</h2><p>${t(demo ? 'app.atl.sub.demo' : 'app.atl.sub')}</p></div></header>
        ${tabList('atl', at, 'tg--tiles')}
        <div class="card ls-panel atl-panel" id="atl-panel" role="tabpanel" tabindex="0"></div>
      </section>
      <section class="learn" aria-labelledby="learn-h">
        <h2 class="sec-t" id="learn-h">${t('app.learn.title')}</h2>
        ${tabList('lt', learnTabs, 'ls-tabs')}
        <div class="card ls-panel" id="lt-panel" role="tabpanel" tabindex="0"></div>
      </section>`;
  } else {
    const tabs = [
      ...learnTabs,
      { k: 'quiz', ic: 'target', label: t('app.tab.quiz'), count: quizN },
      ...(prompts.length ? [{ k: 'prompts', ic: 'chat', label: t('app.tab.prompts'), count: prompts.length, lock: demo }] : []),
      ...(pdfs.length + others.length ? [{ k: 'res', ic: 'link', label: t('app.tab.res'), count: pdfs.length + others.length, lock: demo }] : []),
    ];
    tabsHTML = `<section class="learn">${tabList('lt', tabs, 'ls-tabs')}<div class="card ls-panel" id="lt-panel" role="tabpanel" tabindex="0"></div></section>`;
  }

  const nextLocked = next && !S.canAccess(me, next.id);
  const navNext = next
    ? `<a href="#/lecon/${next.id}" class="is-next ${nextLocked ? 'is-lock' : ''}"><span>${t('app.next')} ${arrow(13)}</span><b>${nextLocked ? `${icon('lock', { size: 14 })} ${t('app.lock.members')}` : esc(next.title)}</b></a>`
    : `<a href="#/parcours/${track.id}" class="is-next"><span>${t('app.track.end.k')} ${arrow(13)}</span><b>${t('app.track.end.link', { track: trName(track.id) })}</b></a>`;

  shell(
    `lesson:${track.id}`,
    `<div class="lesson">
      <div class="ls-main">
        ${crumb(f)}
        <header class="ls-title">
          <p class="ls-k"><span class="chip chip--acc">${bdi(modCode(m))} · ${lessonN(l.n)}</span>${rec.done ? `<span class="chip chip--ok">${icon('check', { size: 13, stroke: 2.6 })} ${t('app.lesson.done')}</span>` : ''}</p>
          <h1>${esc(l.title)}</h1>
          ${!AR && l.ar ? `<p class="ar" lang="ar">${esc(l.ar)}</p>` : ''}
        </header>
        <div class="player" id="player">${playerHTML(l)}</div>
        <div class="ls-row">
          <span class="chip">${icon('clock', { size: 14 })} ${dur(DUR[l.id])}</span>
          ${voiceChip(l)}
          ${playerNote(l)}
          <span class="grow"></span>
          <button class="b b--s ${rec.done ? 'b--ok' : 'b--acc'}" id="mark" type="button" ${rec.done ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${rec.done ? `${icon('check', { size: 16, stroke: 2.6 })} ${t('app.lesson.done')}` : t('app.lesson.mark')}</button>
        </div>
        ${tabsHTML}
        <nav class="ls-next" aria-label="${esc(t('app.lesson.nav'))}">${prev ? `<a href="#/lecon/${prev.id}" class="is-prev"><span>${back(13)} ${t('app.prev')}</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}${navNext}</nav>
      </div>
      <aside class="ls-aside">
        <a class="card ls-trk" href="#/parcours/${track.id}">
          <span class="ls-trk-ic">${icon(track.icon, { size: 20 })}</span>
          <span class="ls-trk-t"><small>${trName(track.id)}</small><b>${demo ? t('app.demo.open1') : t('app.map.done', { d: num(P.done), n: num(P.total) })}</b></span>
          ${demo ? '' : ring(P.pct, { size: 44, sw: 10, track: track.id, title: pc(P.pct) })}
        </a>
        <section class="card">
          <p class="card-k" style="color:${m.color}">${bdi(modCode(m))}</p>
          <h3 class="ls-mt">${esc(m.title)}</h3>
          <div class="ls-list">${m.lessons
            .map((x) =>
              S.canAccess(me, x.id)
                ? `<a href="#/lecon/${x.id}" class="${me.progress.lessons[x.id]?.done ? 'is-done' : ''}" ${x.id === l.id ? 'aria-current="page"' : ''}><i>${me.progress.lessons[x.id]?.done ? icon('check', { size: 12, stroke: 3 }) : num(x.n)}</i><span>${esc(x.title)}</span></a>`
                : `<span class="is-lock"><i>${icon('lock', { size: 11 })}</i><span>${lessonN(x.n)}</span><em>${t('app.lock.short')}</em></span>`,
            )
            .join('')}</div>
        </section>
        <a class="card lab-card lab-card--s" href="https://hooked-lab.com" target="_blank" rel="noopener"><span class="lc-m">${markSVG({ lab: true })}</span><div><h3>${t('app.lab.apply')}</h3><p class="muted">${t('app.lab.apply.text')}</p></div></a>
      </aside>
    </div>`,
    { track: track.id },
  );

  const renderPanel = (k, panel) => {
    if (k === 'ess') {
      panel.innerHTML = `<p class="card-k">${t('app.ess.keys')}</p><ol class="keys">${(l.key || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol><p class="card-k ess-fc">${t('app.ess.cards')}</p><div id="fc"></div>`;
      flashcards($('#fc', panel), l);
      const g = G();
      if (g) g.from($$('.keys li', panel), { x: X(-24), autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
      return;
    }
    if (k === 'ex') return renderWidget(l.widget, panel, { lesson: l, module: m, onXP: (n, why) => gainXP(n, why) });
    if (k === 'quiz') return renderQuiz(panel, l);
    if (k === 'pdf') return demo ? (panel.innerHTML = lockedPanel(t('app.lock.atl'))) : renderPdfs(panel, pdfs);
    if (k === 'prompts') return demo ? (panel.innerHTML = lockedPanel(t('app.lock.atl'))) : renderPrompts(panel, prompts);
    if (k === 'res') return demo ? (panel.innerHTML = lockedPanel(t('app.lock.atl'))) : renderFiles(panel, isIA ? others : [...pdfs, ...others], { withPdf: !isIA });
  };
  if (isIA) {
    bindTabs('atl', renderPanel, 'quiz');
    bindTabs('lt', renderPanel, 'ess');
  } else bindTabs('lt', renderPanel, 'ess');

  const markDone = (auto = false) => {
    if (me.progress.lessons[l.id]?.done) return;
    const r = S.recordLesson(me.id, l.id, { done: true });
    refreshMe();
    const btn = $('#mark');
    if (btn) {
      btn.className = 'b b--s b--ok';
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = `${icon('check', { size: 16, stroke: 2.6 })} ${t('app.lesson.done')}`;
    }
    const xv = $('#xp-v');
    if (xv) xv.textContent = num(me.progress.xp);
    burst(t('app.burst.xp', { n: num(r.gained) }));
    toast(`${icon('check', { size: 18 })} ${t(auto ? 'app.toast.auto' : 'app.toast.done', { xp: `<b>+${num(r.gained)} XP</b>` })}`);
    const tp = trackProgress(me, track.id);
    if (tp.complete) setTimeout(() => toast(`${icon('trophy', { size: 20 })} <span><b>${t(`app.end.${track.id}.title`)}</b></span>`, 4200), 1200);
    checkBadges(me);
    refreshMe();
  };
  $('#mark').addEventListener('click', () => markDone());

  const vid = $('#vid');
  if (vid) {
    vid.addEventListener('timeupdate', () => {
      if (vid.duration && vid.currentTime / vid.duration > 0.9) markDone(true);
    });
  }
  const onMsg = (e) => {
    const d = e.data;
    if (!d || d.type !== 'ha-player' || d.id !== l.id) return;
    if (d.event === 'ended' || (d.event === 'time' && d.duration && d.t / d.duration > 0.9)) markDone(true);
  };
  addEventListener('message', onMsg);
  stop.push(() => removeEventListener('message', onMsg));
}

function gainXP(n, why) {
  const d = S.load();
  const st = d.students.find((s) => s.id === me.id);
  if (!st) return;
  st.progress.xp += n;
  S.save(d);
  refreshMe();
  const x = $('#xp-v');
  if (x) x.textContent = num(me.progress.xp);
  toast(`${icon('bolt', { size: 18 })} ${why ? `${esc(why)} : ` : ''}<b>+${num(n)} XP</b>`);
}

const QL = { fr: 'ABCD', en: 'ABCD', ar: 'أبجد' };
function renderQuiz(panel, l) {
  const qs = l.quiz || [];
  if (!qs.length) {
    panel.innerHTML = emptyState('target', t('app.empty.quiz.t'), t('app.empty.quiz.x'));
    return;
  }
  let good = 0;
  let answered = 0;
  const letters = [...(QL[lang] || QL.fr)];
  panel.innerHTML = `<div class="quiz">
    <div class="qz-top"><p class="card-k">${t('app.quiz.k', { n: qs.length })}</p><div class="qz-prog" aria-hidden="true">${qs.map(() => '<i></i>').join('')}</div></div>
    ${qs
      .map(
        (q, i) => `<fieldset class="qz" data-q="${i}"><legend><span class="qz-n">${num(i + 1)}</span>${esc(q.q)}</legend><div class="qz-a">${q.a.map((a, k) => `<button type="button" data-l="${letters[k] || k + 1}" data-k="${k}">${esc(a)}</button>`).join('')}</div><p class="qz-why" hidden aria-live="polite"></p></fieldset>`,
      )
      .join('')}<div id="qz-end" aria-live="polite"></div></div>`;
  const dots = $$('.qz-prog i', panel);
  $$('.qz', panel).forEach((box) => {
    const qi = +box.dataset.q;
    const q = qs[qi];
    $$('button', box).forEach((b) =>
      b.addEventListener('click', () => {
        const k = +b.dataset.k;
        const ok = k === q.ok;
        $$('button', box).forEach((x) => (x.disabled = true));
        b.classList.add(ok ? 'ok' : 'ko');
        b.setAttribute('aria-label', `${b.textContent} — ${t(ok ? 'app.quiz.right' : 'app.quiz.wrong')}`);
        if (!ok) $$('button', box)[q.ok]?.classList.add('ok');
        dots[qi]?.classList.add(ok ? 'ok' : 'ko');
        const why = $('.qz-why', box);
        why.hidden = false;
        why.innerHTML = `<b>${t(ok ? 'app.quiz.right' : 'app.quiz.wrong')}</b> ${esc(q.why || '')}`;
        if (ok) good++;
        answered++;
        if (answered === qs.length) {
          const score = good / qs.length;
          const r = S.recordLesson(me.id, l.id, { quiz: score });
          refreshMe();
          const xv = $('#xp-v');
          if (xv) xv.textContent = num(me.progress.xp);
          $('#qz-end', panel).innerHTML = `<div class="qz-score">${ring(score, { size: 58, sw: 11, track: l.module.track, label: `<b class="qz-sc">${num(good)}/${num(qs.length)}</b>` })}<div class="qz-msg"><b>${t(score === 1 ? 'app.quiz.perfect' : score >= 0.5 ? 'app.quiz.good' : 'app.quiz.retry')}</b>${r.gained > 0 ? `<span class="qz-xp">+${num(r.gained)} XP</span>` : ''}</div><button class="b b--s" type="button" id="qz-re">${icon('repeat', { size: 15 })} ${t('app.quiz.again')}</button></div>`;
          animateRings(panel);
          $('#qz-re', panel).addEventListener('click', () => renderQuiz(panel, l));
          if (score === 1) burst(t('app.quiz.perfect'));
          checkBadges(me);
        }
      }),
    );
  });
}

function burst(text) {
  const g = G();
  if (!g) return;
  const el = document.createElement('div');
  el.className = 'done-burst';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
  el.querySelector('b').textContent = text;
  document.body.appendChild(el);
  const tl = g.timeline({ onComplete: () => el.remove() });
  tl.to($$('i', el), { scaleY: 1, duration: 0.35, ease: 'power3.in', stagger: 0.05 })
    .to($('b', el), { opacity: 1, scale: 1.1, duration: 0.3, ease: 'back.out(3)' }, 0.3)
    .set($$('i', el), { transformOrigin: '50% 0%' }, 0.95)
    .to($('b', el), { opacity: 0, duration: 0.2 }, 0.95)
    .to($$('i', el), { scaleY: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05 }, 1);
}

/* ------------------------------------------------------------------ */
/* Bibliothèque : prompts et documents de l'équipe                     */
/* ------------------------------------------------------------------ */

const LIB = [
  ['hooks', 'p0'],
  ['scripts', 'p1'],
  ['scripts', 'p2'],
  ['images', 'p3'],
  ['images', 'p4'],
  ['videos', 'p5'],
  ['videos', 'p6'],
  ['clients', 'p7'],
  ['clients', 'p8'],
];

function viewRes() {
  setTitle(t('app.title.res'));
  const demo = S.isDemo(me);
  if (demo) {
    shell(
      'res',
      `<div class="ph-h"><div><h1>${t('app.lib.title')}</h1><p>${t('app.lib.lead')}</p></div></div>
      <div class="lib-lock">
        <div class="lib-sk" aria-hidden="true">${Array.from({ length: 4 }, () => '<div class="card"><i></i><i></i><i></i></div>').join('')}</div>
        <div class="card lib-lock-c"><span class="empty-ic">${icon('lock', { size: 26 })}</span><h2>${t('app.lock.members')}</h2><p>${t('app.lock.lib')}</p><a class="b b--or" href="${RESERVE}">${t('app.cta.reserve')}</a></div>
      </div>`,
    );
    enter('.ph-h, .lib-lock-c');
    return;
  }
  const base = LIB.map(([cat, k]) => ({ cat, title: t(`app.lib.${k}.t`), text: t(`app.lib.${k}.x`) }));
  const fromLessons = LESSONS.flatMap((l) => (l.res || []).map((r) => ({ cat: l.module.track, title: r.title, text: r.text, lesson: l })));
  const teamAll = LESSONS.flatMap((l) => teamItems(l.id).map((it) => ({ ...it, lesson: l })));
  const teamPrompts = teamAll.filter((x) => x.kind === 'prompt').map((x) => ({ cat: x.lesson.module.track, title: x.title, text: x.text, href: x.href, lesson: x.lesson, team: true }));
  const prompts = [...base, ...fromLessons, ...teamPrompts];
  const docs = teamAll.filter((x) => x.kind !== 'prompt');
  const cats = ['all', 'hooks', 'scripts', 'images', 'videos', 'clients', ...TRACKS.map((x) => x.id).filter((id) => prompts.some((p) => p.cat === id))];
  const catLabel = (c) => (c === 'all' ? t('app.lib.cat.all') : TRK[c] ? trName(c) : t(`app.lib.cat.${c}`));
  shell(
    'res',
    `<div class="lib">
      <div class="ph-h"><div><h1>${t('app.lib.title')}</h1><p>${t('app.lib.lead')}</p></div></div>
      ${tabList('lib', [
        { k: 'prompts', ic: 'chat', label: t('app.lib.tab.prompts'), count: prompts.length },
        { k: 'docs', ic: 'doc', label: t('app.lib.tab.docs'), count: docs.length },
      ], 'ls-tabs lib-tabs')}
      <div id="lib-panel" role="tabpanel" class="lib-panel" tabindex="-1"></div>
    </div>`,
  );
  let cat = 'all';
  let q = '';
  const drawPrompts = (panel) => {
    panel.innerHTML = `<div class="lib-tools">
        <label class="search">${icon('search', { size: 18 })}<span class="sr-only">${t('app.lib.search')}</span><input class="in" id="q" type="search" value="${esc(q)}" placeholder="${esc(t('app.lib.search.ph'))}" autocomplete="off"></label>
        <div class="seg" id="cats" role="group" aria-label="${esc(t('app.lib.cats'))}">${cats.map((c) => `<button type="button" aria-pressed="${c === cat}" data-c="${c}">${esc(catLabel(c))}</button>`).join('')}</div>
      </div>
      <p class="lib-count muted" id="lib-n" aria-live="polite"></p>
      <div class="res lib-list" id="list"></div>`;
    const draw = () => {
      const s = q.trim().toLowerCase();
      const list = prompts.filter((r) => (cat === 'all' || r.cat === cat) && (!s || `${r.title} ${r.text}`.toLowerCase().includes(s)));
      $('#lib-n', panel).textContent = t('app.lib.count', { n: list.length });
      $('#list', panel).innerHTML = list.length
        ? list
            .map(
              (r, i) => `<article class="card res-i" ${r.lesson ? `data-track="${r.lesson.module.track}"` : ''}>
              <div class="res-h"><div><p class="card-k">${r.lesson ? `<a href="#/lecon/${r.lesson.id}">${bdi(modCode(r.lesson.module))} · ${lessonN(r.lesson.n)}</a>${r.team ? ` · ${t('app.prompt.team')}` : ''}` : esc(catLabel(r.cat))}</p><b>${esc(r.title)}</b></div>
              ${r.text ? `<button class="b b--s" type="button" data-i="${i}">${icon('copy', { size: 15 })} ${t('app.copy')}</button>` : `<a class="b b--s" href="${esc(r.href)}" target="_blank" rel="noopener">${t('app.file.open')}</a>`}</div>
              ${r.text ? `<pre dir="auto">${esc(r.text)}</pre>` : ''}
            </article>`,
            )
            .join('')
        : emptyState('search', t('app.lib.none.t'), t('app.lib.none.x'));
      $$('#list [data-i]', panel).forEach((b) => b.addEventListener('click', () => copy(list[+b.dataset.i].text)));
    };
    $('#q', panel).addEventListener('input', (e) => {
      q = e.target.value;
      draw();
    });
    $$('#cats button', panel).forEach((b) =>
      b.addEventListener('click', () => {
        cat = b.dataset.c;
        $$('#cats button', panel).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }),
    );
    draw();
  };
  const drawDocs = (panel) => {
    if (!docs.length) {
      panel.innerHTML = `<div class="card">${emptyState('doc', t('app.lib.docs.none.t'), t('app.lib.docs.none.x'))}</div>`;
      return;
    }
    panel.innerHTML = TRACKS.map((tr) => {
      const mine = docs.filter((d) => d.lesson.module.track === tr.id);
      if (!mine.length) return '';
      const byLesson = [...new Set(mine.map((d) => d.lesson.id))];
      return `<section class="lib-trk" data-track="${tr.id}"><h2 class="sec-t">${icon(tr.icon, { size: 18 })} ${trName(tr.id)}</h2>${byLesson
        .map((id) => {
          const ls = mine.filter((d) => d.lesson.id === id);
          const L0 = ls[0].lesson;
          return `<div class="card lib-l"><p class="card-k"><a href="#/lecon/${id}">${bdi(modCode(L0.module))} · ${lessonN(L0.n)} — ${esc(L0.title)}</a></p><div class="lib-l-b"></div></div>`;
        })
        .join('')}</section>`;
    }).join('');
    $$('.lib-l', panel).forEach((card, i) => {
      const id = $('a', card).getAttribute('href').split('/').pop();
      renderFiles($('.lib-l-b', card), docs.filter((d) => d.lesson.id === id), { withPdf: true });
    });
  };
  bindTabs('lib', (k, panel) => (k === 'docs' ? drawDocs(panel) : drawPrompts(panel)), 'prompts');
  enter('.ph-h');
}

/* ------------------------------------------------------------------ */
/* Profil                                                              */
/* ------------------------------------------------------------------ */

function prefsCard({ demo = false } = {}) {
  return `<section class="card prefs">
    <p class="card-k">${icon('globe', { size: 14 })} ${t('app.prefs.lang')}</p>
    <p class="muted">${t('app.prefs.lang.text')}</p>
    ${switcher('lang-sw lang-sw--l')}
    ${demo ? `<hr><p class="card-k">${icon('repeat', { size: 14 })} ${t('app.demo.reset.k')}</p><p class="muted">${t('app.demo.reset.text')}</p><button class="b b--s b--danger" id="rst" type="button">${t('app.demo.reset')}</button>` : ''}
  </section>`;
}

function viewProfile() {
  setTitle(t('app.title.profile'));
  const demo = S.isDemo(me);
  const ident = me.protected ? `${icon('shield', { size: 14 })} ${t('app.profile.protected')}` : esc(me.email || me.phone || '');
  const name = demo ? t('app.demo.name') : esc(me.name || me.firstName || '');
  const initial = demo ? t('app.demo.initial') : esc(((me.firstName || me.name || 'H').trim()[0] || 'H').toUpperCase());
  const head = `<header class="card prof-h">
      <span class="prof-av" aria-hidden="true">${initial}</span>
      <div class="prof-id"><h1>${name}</h1><p>${demo ? t('app.demo.limited') : `${ident}${cohortOf(me) ? ` <span class="dot" aria-hidden="true">·</span> ${esc(cohortOf(me))}` : ''}`}</p></div>
      <button class="b b--s" id="out" type="button">${icon('logout', { size: 16 })} ${t('app.logout')}</button>
    </header>`;
  if (demo) {
    shell(
      'profile',
      `<div class="prof">
        ${head}
        <section class="card demo-inc">
          <h2>${t('app.demo.inc.title')}</h2>
          <ul class="inc">
            <li class="ok">${icon('check', { size: 16, stroke: 2.4 })} ${t('app.demo.inc.1')}</li>
            <li class="ok">${icon('check', { size: 16, stroke: 2.4 })} ${t('app.demo.inc.2')}</li>
            <li class="no">${icon('lock', { size: 16 })} ${t('app.demo.inc.3')}</li>
            <li class="no">${icon('lock', { size: 16 })} ${t('app.demo.inc.4')}</li>
          </ul>
          <a class="b b--or" href="${RESERVE}">${t('app.cta.reserve')}</a>
        </section>
        ${prefsCard({ demo: true })}
      </div>`,
    );
  } else {
    const PP = progressAll(me);
    const lv = S.level(me.progress.xp);
    shell(
      'profile',
      `<div class="prof">
        ${head}
        <section class="card lvl-card">
          <p class="card-k">${icon('bolt', { size: 14 })} ${t('app.level.k')}</p>
          <h2>${t(`level.${lv.i}`)} <span class="lvl-xp"><bdi>${num(me.progress.xp)} XP</bdi></span></h2>
          <div class="lvl"><div class="lvl-top"><span class="muted">${lv.next ? t('app.level.next', { xp: num(me.progress.xp), need: num(lv.next.xp), name: esc(t(`level.${lv.i + 1}`)) }) : t('app.level.max')}</span></div><div class="lvl-bar"><i style="transform:scaleX(${lv.pct})"></i></div></div>
          <ol class="lvl-steps">${S.LEVELS.map((x, i) => `<li class="${i < lv.i ? 'is-past' : i === lv.i ? 'is-cur' : ''}"><i></i><b>${t(`level.${i}`)}</b><small><bdi>${num(x.xp)} XP</bdi></small></li>`).join('')}</ol>
        </section>
        <div class="certs">${TRACKS.map((tr) => {
          const P = PP[tr.id];
          const quizOk = P.quizN > 0 && P.quizAvg >= 0.7;
          return `<section class="card cert" data-track="${tr.id}">
            <p class="card-k">${icon(tr.icon, { size: 14 })} ${t('app.cert.k', { track: trName(tr.id) })}</p>
            <div class="cert-b">${ring(P.pct, { size: 84, sw: 9, track: tr.id, title: pc(P.pct), label: `<b>${pc(P.pct)}</b>` })}
              <ul class="cert-req">
                <li class="${P.complete ? 'ok' : ''}">${icon(P.complete ? 'check' : 'clock', { size: 15, stroke: 2.2 })} ${t('app.cert.lessons', { d: num(P.done), n: num(P.total) })}</li>
                <li class="${quizOk ? 'ok' : ''}">${icon(quizOk ? 'check' : 'clock', { size: 15, stroke: 2.2 })} ${t('app.cert.quiz', { s: P.quizN ? pc(P.quizAvg) : '—' })}</li>
                ${tr.id === 'ia' ? `<li>${icon('doc', { size: 15 })} ${t('app.cert.project')}</li>` : ''}
              </ul>
            </div>
            ${P.complete ? `<p class="cert-msg">${t(`app.end.${tr.id}.short`)}</p>` : ''}
          </section>`;
        }).join('')}</div>
        <section class="bdg-sec">
          <div class="sec-h"><div><h2>${t('app.badges.title')}</h2><p>${t('app.badges.count', { d: num(me.progress.badges.length), n: num(Object.keys(S.BADGES).length) })}</p></div></div>
          <div class="badges">${Object.keys(S.BADGES)
            .map((k) => badgeHTML(k))
            .join('')}</div>
        </section>
        ${prefsCard()}
      </div>`,
    );
  }
  $('#out').addEventListener('click', () => {
    S.logout();
    me = null;
    const u = new URL(location.href);
    u.searchParams.delete('demo');
    u.hash = '';
    history.replaceState(null, '', u.pathname + u.search);
    route();
  });
  $('#rst')?.addEventListener('click', () => {
    const d = S.load();
    const st = d.students.find((s) => s.id === me.id);
    if (st) {
      st.progress = { lessons: {}, last: null, days: [], xp: 0, badges: [] };
      S.save(d);
    }
    refreshMe();
    toast(`${icon('repeat', { size: 18 })} ${t('app.demo.reset.done')}`);
  });
  enter('.prof > *');
}

/* ------------------------------------------------------------------ */
/* Routeur                                                             */
/* ------------------------------------------------------------------ */

let demoTried = false;
let routing = 0;
async function route() {
  const ticket = ++routing;
  stop.forEach((f) => {
    try {
      f();
    } catch {}
  });
  stop = [];
  closeMenus();
  refreshMe();
  if (!me && !demoTried && new URLSearchParams(location.search).has('demo')) {
    demoTried = true;
    await openDemo();
    if (ticket !== routing) return;
    refreshMe();
  }
  if (!me) return viewLogin();
  const h = location.hash || '#/';
  const tm = h.match(/^#\/parcours(?:\/([a-z]+))?\/?$/);
  if (tm) {
    const id = TRK[tm[1]] ? tm[1] : lastTrack();
    if (tm[1] !== id) history.replaceState(null, '', `#/parcours/${id}`);
    return viewTrack(id);
  }
  if (h.startsWith('#/lecon/')) return viewLesson(decodeURIComponent(h.slice(8)));
  if (h === '#/ressources') return viewRes();
  if (h === '#/profil') return viewProfile();
  return viewHome();
}

addEventListener('hashchange', route);

// Vidéos finales (voix off montée) publiées par le rendu : video/manifest.json
async function loadVideos() {
  try {
    const r = await fetch('../video/manifest.json', { cache: 'no-cache' });
    if (!r.ok) return;
    const m = await r.json();
    LESSONS.forEach((l) => m[l.id] && Object.assign(l, m[l.id]));
    MODULES.forEach((mod) => mod.lessons.forEach((l) => m[l.id] && Object.assign(l, m[l.id])));
  } catch {}
}
// Fichiers déposés par l'équipe (PDF, prompts, liens…) : ressources/manifest.json, facultatif
async function loadTeam() {
  try {
    const r = await fetch('../ressources/manifest.json', { cache: 'no-cache' });
    if (!r.ok) return;
    const m = await r.json();
    if (m && typeof m.lessons === 'object' && m.lessons) TEAM = m;
  } catch {}
}
const start = () => Promise.all([document.fonts?.ready, loadVideos(), loadTeam()]).then(route);
if (window.gsap || document.readyState === 'complete') start();
else addEventListener('load', start, { once: true });
