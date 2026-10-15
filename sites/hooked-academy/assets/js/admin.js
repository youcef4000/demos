// Hooked Academy — espace équipe (français, anglais, arabe).
// Routes : #/ (vue d'ensemble) · #/inscriptions · #/etudiants · #/ressources · #/studio[/leçon] · #/programme · #/reglages
// Les inscriptions arrivent de la landing ; l'équipe contacte sur WhatsApp, encaisse, valide :
// la validation crée l'accès étudiant (e-mail + code) et prépare le message de bienvenue, dans la langue choisie.
// Ressources : ressources/manifest.json (généré par une action GitHub) liste les fichiers déposés par leçon.

import { LANGS, lang, isRTL, locale, t, tIn, fmtNum, fmtDate, switcher, bindSwitchers } from './i18n.js';
import './i18n/common.js';
import { plural, exText } from './i18n/admin.js';
import { logoInner, markSVG } from './brand.js';
import { icon } from './icons.js';
import * as S from './store.js';
import { MODULES, allLessons, findLesson, modCode, modulesOf, lessonsOf, trackOf } from '../../data/programme.js';
import { plan, lessonDuration } from '../../motion/engine.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = () => (reduce ? null : window.gsap);
const root = $('#root');
const LESSONS = allLessons();
let stop = [];

document.title = t('ad.meta.title');
const ARROW = isRTL ? '←' : '→';
const EXT = isRTL ? '↖' : '↗';

const fmtD = (s) => fmtDate(s, { day: '2-digit', month: 'short' });
const fmtDT = (s) => fmtDate(s, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const RTF = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
const ago = (s) => {
  const m = Math.round((Date.now() - new Date(s)) / 60000);
  if (m < 60) return RTF.format(-Math.max(1, m), 'minute');
  const h = Math.round(m / 60);
  if (h < 24) return RTF.format(-h, 'hour');
  return RTF.format(-Math.round(h / 24), 'day');
};
const pct = (x) => fmtNum(x, { style: 'percent', maximumFractionDigits: 0 });
const waNum = (p) => {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `213${d.slice(1)}`;
  return d;
};
const wa = (phone, text) => `https://wa.me/${waNum(phone)}?text=${encodeURIComponent(text)}`;
const fmtMin = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const arLine = (s) => (lang === 'ar' || !s ? '' : `<p class="ar-line" lang="ar" dir="rtl">${esc(s)}</p>`);
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ًͯ-ٰٟ]/g, '').toLowerCase();

// Libellés partagés (common.js) et données d'exemple traduites
const stLabel = (k) => (S.STATUS[k] ? t(`status.${k}`) : k || '—');
const prLabel = (k) => (S.PROFILS[k] ? t(`profil.${k}`) : k || '—');
const BY = { Formulaire: 'ad.by.form', Équipe: 'ad.by.team', 'Équipe (WhatsApp)': 'ad.by.teamWa' };
const byLabel = (b) => (BY[b] ? t(BY[b]) : b || '');
const srcLabel = (s) => (!s || s === 'Landing' ? t('ad.src.landing') : s);
const stuName = (s) => (S.isDemo(s) ? t('ad.st.demo') : exText(s.name));
const lvName = (xp) => t(`level.${S.level(xp).i}`);
const exTag = () => `<span class="ex-tag">${t('ad.ex.tag')}</span>`;
// Formation et langue choisies sur la landing (absentes des fiches plus anciennes)
const fmOf = (a) => (['creative', 'ia', 'both'].includes(a?.formation) ? a.formation : null);
const lgOf = (a) => (LANGS.some((x) => x.code === a?.lang) ? a.lang : null);
const fmLabel = (f, long = false) => (!f ? '' : f === 'both' ? t(long ? 'ad.fm.bothL' : 'ad.fm.both') : long ? t(`track.${f}`) : t(`ad.fm.${f}`));
const fmChip = (f, long = false) => (f ? `<span class="fm" data-fm="${f}">${esc(fmLabel(f, long))}</span>` : '');
const lgName = (l) => LANGS.find((x) => x.code === l)?.label || '';

function toast(html, ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  $('#toasts').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 320);
  }, ms);
}
const copy = (text) => navigator.clipboard?.writeText(text).then(
  () => toast(`${icon('copy', { size: 16 })} ${t('ad.copied')}`),
  () => {},
);
function download(name, content, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type: `${type};charset=utf-8` }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 500);
}
const ls = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

/* ------------------------------------------------------------------ */
/* Messages WhatsApp aux étudiants : langue choisie dans le tiroir      */
/* ------------------------------------------------------------------ */

const ML_KEY = 'hooked-academy:admin:msg-lang';
const ML = [
  ['fr', 'FR'],
  ['ar', 'العربية'],
  ['en', 'EN'],
];
let msgLang = ML.some(([c]) => c === ls.get(ML_KEY)) ? ls.get(ML_KEY) : lang;

const studentUrl = (l) => {
  const u = new URL('../app/', location.href);
  u.search = `?lang=${l}`;
  u.hash = '';
  return u.href;
};
const firstOf = (name) => String(name || '').replace(/^Exemple — /, '').split(/\s+/)[0];
function welcomeText(st, l) {
  const id = st.email ? tIn(l, 'ad.msg.email', { v: st.email }) : tIn(l, 'ad.msg.phone', { v: st.phone || '—' });
  const name = S.isDemo(st) ? tIn(l, 'ad.msg.demoName') : st.firstName || firstOf(st.name);
  return tIn(l, 'ad.msg.welcome', { name, url: studentUrl(l), id, code: st.code });
}
const contactText = (a, l) => tIn(l, 'ad.msg.contact', { name: firstOf(a.name) });

/** Sélecteur de langue des messages. `pref` : langue choisie par l'inscrit sur la landing (pastille). */
const mlSwitch = (pref = null) =>
  `<div class="ml"><span class="ml-l">${icon('globe', { size: 15 })}${t('ad.dw.msgLang')}</span><div class="ml-b" role="group" aria-label="${esc(t('ad.dw.msgLang'))}">${ML.map(
    ([c, l]) => `<button type="button" data-ml="${c}" lang="${c}" aria-pressed="false"${c === pref ? ` data-pref title="${esc(t('ad.dw.prefLang'))}"` : ''}>${l}</button>`,
  ).join('')}</div>${pref ? `<p class="ml-p"><span>${t('ad.dw.prefLang')}</span><b lang="${pref}">${esc(lgName(pref))}</b></p>` : ''}</div>`;

// Langue choisie à la main pour une fiche précise (le temps de la session)
const mlPicked = new Map();

/**
 * Remplit les messages d'un tiroir ([data-msg], [data-wa], [data-copy]) et suit le choix de langue.
 * Avec `pref` (langue de l'inscription), le message part dans cette langue ; un autre choix ne vaut
 * que pour cette fiche (`key`). Sans `pref`, le choix devient la langue par défaut de l'équipe.
 */
function bindMsgs(box, phone, gens, { pref = null, key = '' } = {}) {
  let cur = (key && mlPicked.get(key)) || pref || msgLang;
  const paint = () => {
    $$('[data-ml]', box).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ml === cur)));
    for (const [k, gen] of Object.entries(gens)) {
      const txt = gen(cur);
      $$(`[data-msg="${k}"]`, box).forEach((el) => {
        el.textContent = txt;
        el.lang = cur;
        el.dir = cur === 'ar' ? 'rtl' : 'ltr';
      });
      $$(`[data-wa="${k}"]`, box).forEach((el) => (el.href = wa(phone, txt)));
    }
  };
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ml]');
    if (b) {
      cur = b.dataset.ml;
      if (pref) {
        if (key) mlPicked.set(key, cur);
      } else {
        msgLang = cur;
        ls.set(ML_KEY, msgLang);
      }
      paint();
    }
    const c = e.target.closest('[data-copy]');
    if (c && gens[c.dataset.copy]) copy(gens[c.dataset.copy](cur));
  });
  paint();
}

/** Tiroir latéral (à droite, à gauche en arabe). close() rafraîchit la vue, dispose() retire sans rien faire. */
function drawer(label, html, onClose) {
  const dw = document.createElement('div');
  dw.className = 'drawer';
  dw.innerHTML = `<div class="drawer-p" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
  document.body.appendChild(dw);
  document.body.style.overflow = 'hidden';
  gsap()?.fromTo($('.drawer-p', dw), { x: isRTL ? -80 : 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out' });
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };
  const dispose = () => {
    removeEventListener('keydown', onKey);
    dw.remove();
    document.body.style.overflow = '';
  };
  const close = () => {
    if (!dw.isConnected) return;
    dispose();
    onClose?.();
  };
  addEventListener('keydown', onKey);
  dw.addEventListener('click', (e) => {
    if (e.target === dw || e.target.closest('[data-x]')) close();
  });
  setTimeout(() => $('[data-x]', dw)?.focus(), 0);
  return { dw, close, dispose };
}
const drawerHead = (kicker, title, color = '') =>
  `<div class="drawer-h"><div><p class="card-k"${color ? ` style="color:${color}"` : ''}>${kicker}</p><h2>${esc(title)}</h2></div><button class="b b--i" type="button" data-x aria-label="${esc(t('ad.close'))}">${icon('x', { size: 18 })}</button></div>`;

/* ------------------------------------------------------------------ */
/* Connexion et structure                                              */
/* ------------------------------------------------------------------ */

function viewLogin(err = '') {
  root.innerHTML = `<div class="login"><section class="login-box">
    <div class="login-top"><a class="ha-logo" href="../">${logoInner()}</a>${switcher('ad-lang')}</div>
    <h1>${t('ad.login.title')}</h1>
    <p class="muted">${t('ad.login.lead')}</p>
    <form id="af" style="display:grid;gap:12px" novalidate>
      <label class="lbl">${t('ad.login.code')}<input class="in" name="code" autocomplete="current-password" type="password" required dir="ltr" style="font-family:var(--font-mono)"></label>
      <p class="login-err" role="alert">${esc(err)}</p>
      <button class="b b--or" type="submit">${t('ad.login.enter')}</button>
    </form>
    <div class="login-demo">${t('ad.login.demo')} <code dir="ltr">${S.TEAM_CODE}</code><br><button class="b b--s" type="button" id="ademo" style="margin-top:10px">${t('ad.login.demoBtn')}</button></div>
  </section><aside class="login-art la-team" aria-hidden="true"><div class="la-mark">${markSVG()}</div><p class="la-name">Hooked Academy</p><p class="la-sub">${t('ad.nav.team')}</p></aside></div>`;
  $('#af').addEventListener('submit', (e) => {
    e.preventDefault();
    if (S.loginAdmin(new FormData(e.target).get('code'))) route();
    else viewLogin(t('ad.login.bad'));
  });
  $('#ademo').addEventListener('click', () => {
    S.loginAdmin(S.TEAM_CODE);
    route();
  });
}

const NAV = [
  { h: '#/', ic: 'chart', k: 'overview' },
  { h: '#/inscriptions', ic: 'users', k: 'apps' },
  { h: '#/etudiants', ic: 'book', k: 'students' },
  { h: '#/ressources', ic: 'box', k: 'res' },
  { h: '#/studio', ic: 'mic', k: 'studio' },
  { h: '#/programme', ic: 'layers', k: 'prog' },
  { h: '#/reglages', ic: 'settings', k: 'settings' },
];
const TABS = ['#/', '#/inscriptions', '#/etudiants', '#/ressources'];

function shell(active, html) {
  const d = S.load();
  const nNew = d.applications.filter((a) => a.status === 'nouvelle').length;
  const more = !TABS.includes(active);
  const out = `<a class="nv" href="../app/" target="_blank" rel="noopener">${icon('user', { size: 20 })}${t('ad.nav.studentSpace')} <span class="ext" aria-hidden="true">${EXT}</span></a>`;
  root.innerHTML = `<div class="sh">
    <aside class="side">
      <a class="ha-logo" href="../">${logoInner()}</a>
      <p class="card-k side-k">${t('ad.nav.space')}</p>
      <nav class="side-nav" aria-label="${esc(t('ad.nav.label'))}">${NAV.map(
        (n) => `<a class="nv" href="${n.h}" ${active === n.h ? 'aria-current="page"' : ''}>${icon(n.ic, { size: 20 })}${t(`ad.nav.${n.k}`)}${n.h === '#/inscriptions' && nNew ? `<span class="cnt">${fmtNum(nNew)}</span>` : ''}</a>`,
      ).join('')}</nav>
      <div class="side-foot">${switcher('ad-lang ad-lang--side')}${out}<button class="b b--s" id="out" type="button">${icon('logout', { size: 16 })} ${t('ad.nav.logout')}</button></div>
    </aside>
    <div class="sh-main">
      <header class="top"><a class="ha-logo" href="#/">${logoInner()}</a><span class="chip chip--or top-chip">${t('ad.nav.team')}</span>${switcher('ad-lang ad-lang--top')}<button class="b b--s b--i" id="out2" type="button" aria-label="${esc(t('ad.nav.logout'))}">${icon('logout', { size: 16 })}</button></header>
      <main class="main" id="main">${html}</main>
    </div>
  </div>
  <nav class="tabs" aria-label="${esc(t('ad.nav.label'))}">${NAV.filter((n) => TABS.includes(n.h))
    .map((n) => `<a href="${n.h}" ${active === n.h ? 'aria-current="page"' : ''}>${icon(n.ic, { size: 20 })}<span>${t(`ad.tab.${n.k}`)}</span>${n.h === '#/inscriptions' && nNew ? `<i class="tab-dot" aria-hidden="true"></i>` : ''}</a>`)
    .join('')}<button type="button" id="more" aria-haspopup="dialog" aria-expanded="false" ${more ? 'data-on' : ''}>${icon('grid', { size: 20 })}<span>${t('ad.nav.more')}</span></button></nav>`;
  const logout = () => {
    S.logoutAdmin();
    route();
  };
  $('#out').addEventListener('click', logout);
  $('#out2').addEventListener('click', logout);
  $('#more').addEventListener('click', () => openMore(active, logout));
  window.scrollTo(0, 0);
}

/** Menu « Plus » (mobile) : pages hors onglets, langue, déconnexion. */
function openMore(active, logout) {
  const sh = document.createElement('div');
  sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-p" role="dialog" aria-modal="true" aria-label="${esc(t('ad.nav.more'))}"><span class="sheet-grip" aria-hidden="true"></span>
    <nav class="sheet-nav">${NAV.filter((n) => !TABS.includes(n.h))
      .map((n) => `<a class="nv" href="${n.h}" ${active === n.h ? 'aria-current="page"' : ''}>${icon(n.ic, { size: 20 })}${t(`ad.nav.${n.k}`)}</a>`)
      .join('')}<a class="nv" href="../app/" target="_blank" rel="noopener">${icon('user', { size: 20 })}${t('ad.nav.studentSpace')} <span class="ext" aria-hidden="true">${EXT}</span></a></nav>
    <div class="sheet-foot">${switcher('ad-lang')}<button class="b b--s" type="button" data-out>${icon('logout', { size: 16 })} ${t('ad.nav.logout')}</button></div>
    <button class="b b--s sheet-x" type="button" data-x>${t('ad.nav.close')}</button></div>`;
  document.body.appendChild(sh);
  const btn = $('#more');
  btn?.setAttribute('aria-expanded', 'true');
  gsap()?.fromTo($('.sheet-p', sh), { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'expo.out' });
  const onKey = (e) => e.key === 'Escape' && close();
  function close() {
    removeEventListener('keydown', onKey);
    sh.remove();
    btn?.setAttribute('aria-expanded', 'false');
    btn?.focus();
  }
  addEventListener('keydown', onKey);
  sh.addEventListener('click', (e) => {
    if (e.target === sh || e.target.closest('[data-x]')) close();
    else if (e.target.closest('[data-out]')) {
      close();
      logout();
    } else if (e.target.closest('a.nv[href^="#"]')) close();
  });
  $('.sheet-nav a', sh)?.focus();
}

const exBanner = (d) =>
  d.applications.some((a) => a.exemple) ? `<p class="ex-banner">${icon('sparkles', { size: 16 })}<span>${t('ad.ex.banner', { tag: exTag() })}</span></p>` : '';

/* ------------------------------------------------------------------ */
/* Vue d'ensemble                                                      */
/* ------------------------------------------------------------------ */

function studentPct(st) {
  return LESSONS.filter((l) => st.progress.lessons[l.id]?.done).length / LESSONS.length;
}

function viewOverview() {
  const d = S.load();
  const A = d.applications;
  const by = (s) => A.filter((a) => a.status === s).length;
  const active = d.students.filter((s) => s.active);
  const avg = active.length ? active.reduce((s, st) => s + studentPct(st), 0) / active.length : 0;
  const days = Array.from({ length: 14 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (13 - i));
    const k = S.iso(dt);
    return { k, n: A.filter((a) => S.iso(new Date(a.createdAt)) === k).length, l: dt.getDate() };
  });
  const max = Math.max(1, ...days.map((x) => x.n));
  const events = A.flatMap((a) => [
    ...a.history.map((h) => ({ at: h.at, c: S.STATUS[h.status]?.c, t: `${esc(exText(a.name))} ${ARROW} <b>${esc(stLabel(h.status))}</b>`, by: byLabel(h.by) })),
    ...a.notes.map((n) => ({ at: n.at, c: 'var(--mist-400)', t: esc(t('ad.ov.noteOn', { name: exText(a.name), text: exText(n.text) })), by: byLabel(n.by) })),
  ])
    .sort((x, y) => new Date(y.at) - new Date(x.at))
    .slice(0, 8);
  const tracks = ['creative', 'ia'].map((id) => {
    const tr = trackOf(id);
    const mods = modulesOf(id);
    return `<a class="ov-tr" href="#/programme" style="--t:${tr.color}"><span class="ov-tr-i">${icon(tr.icon, { size: 20 })}</span><span class="ov-tr-t"><b>${t(`track.${id}`)}</b><small>${plural('module', mods.length)} · ${plural('lesson', lessonsOf(id).length)}</small></span><em dir="ltr">${modCode(mods[0])}–${modCode(mods[mods.length - 1])}</em></a>`;
  });
  shell(
    '#/',
    `<div class="ph-h"><div><h1>${t('ad.nav.overview')}</h1><p>${esc(fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' }))}</p></div><a class="b b--or b--s" href="#/inscriptions">${icon('users', { size: 16 })} ${t('ad.ov.cta')}</a></div>
    ${exBanner(d)}
    <div class="kpi-row">
      <a class="card kpi-c" href="#/inscriptions" style="--c:var(--hook);text-decoration:none;color:inherit"><i>${icon('bell', { size: 20 })}</i><b data-c="${by('nouvelle')}">0</b><span>${t('ad.ov.kNew')}</span></a>
      <div class="card kpi-c" style="--c:var(--cta)"><i>${icon('money', { size: 20 })}</i><b data-c="${by('paiement')}">0</b><span>${t('ad.ov.kPay')}</span></div>
      <div class="card kpi-c" style="--c:var(--body)"><i>${icon('users', { size: 20 })}</i><b data-c="${active.length}">0</b><span>${t('ad.ov.kActive')}</span></div>
      <div class="card kpi-c"><i>${icon('chart', { size: 20 })}</i><b data-c="${Math.round(avg * 100)}" data-pct>0</b><span>${t('ad.ov.kAvg')}</span></div>
    </div>
    <div class="ov" style="margin-top:14px">
      <section class="card"><p class="card-k">${t('ad.ov.chart')}</p><div class="bars">${days.map((x) => `<span><b>${x.n ? fmtNum(x.n) : ''}</b><i style="height:${(x.n / max) * 100}%"></i>${fmtNum(x.l)}</span>`).join('')}</div></section>
      <section class="card"><p class="card-k">${t('ad.ov.pipeline')}</p><div class="funnel-ad">${Object.entries(S.STATUS)
        .map(([k, s]) => `<div style="--c:${s.c}"><span>${esc(stLabel(k))}</span><em><i style="transform:scaleX(${A.length ? by(k) / A.length : 0})"></i></em><b>${fmtNum(by(k))}</b></div>`)
        .join('')}</div></section>
      <section class="card"><p class="card-k">${t('ad.ov.activity')}</p><ul class="act">${events.map((e) => `<li style="--c:${e.c}"><span class="dot"></span><span>${e.t}<br><small class="muted">${esc(e.by || '')}</small></span><time datetime="${esc(e.at)}">${esc(ago(e.at))}</time></li>`).join('') || `<li class="muted">${t('ad.ov.none')}</li>`}</ul></section>
      <section class="card ov-tracks"><p class="card-k">${t('ad.ov.tracks')}</p>${tracks.join('')}<a class="b b--s" href="#/ressources">${icon('box', { size: 16 })} ${t('ad.ov.manageRes')}</a></section>
    </div>`,
  );
  $$('[data-c]').forEach((el) => {
    const n = +el.dataset.c;
    const f = el.hasAttribute('data-pct') ? (v) => pct(v / 100) : (v) => fmtNum(v);
    if (!gsap()) return (el.textContent = f(n));
    const o = { v: 0 };
    gsap().to(o, { v: n, duration: 1.1, ease: 'power3.out', onUpdate: () => (el.textContent = f(Math.round(o.v))) });
  });
  gsap()?.from('.bars i', { scaleY: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 });
  gsap()?.from('.funnel-ad em i', { scaleX: 0, duration: 1, ease: 'expo.out', stagger: 0.06 });
  gsap()?.from('.main .card', { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
}

/* ------------------------------------------------------------------ */
/* Inscriptions                                                        */
/* ------------------------------------------------------------------ */

let filter = '';
function viewApps() {
  const d = S.load();
  const q = fold(filter);
  const list = d.applications.filter(
    (a) => !q || fold(`${a.name} ${exText(a.name)} ${a.email} ${a.phone} ${a.city} ${exText(a.city)} ${a.objectif} ${exText(a.objectif)} ${fmLabel(fmOf(a), true)} ${lgName(lgOf(a))}`).includes(q),
  );
  shell(
    '#/inscriptions',
    `<div class="ph-h"><div><h1>${t('ad.nav.apps')}</h1><p>${t('ad.apps.lead')}</p></div><button class="b b--s" id="csv" type="button">${icon('download', { size: 16 })} ${t('ad.apps.csv')}</button></div>
    ${exBanner(d)}
    <div class="tools"><input class="in" id="flt" type="search" placeholder="${esc(t('ad.apps.search'))}" value="${esc(filter)}" aria-label="${esc(t('ad.apps.searchL'))}"></div>
    <div class="kb">${Object.entries(S.STATUS)
      .map(
        ([k, s]) => `<section class="kb-col" data-st="${k}" style="--c:${s.c}" aria-label="${esc(stLabel(k))}"><div class="kb-h"><i></i>${esc(stLabel(k))}<span>${fmtNum(list.filter((a) => a.status === k).length)}</span></div>
        ${list
          .filter((a) => a.status === k)
          .map(
            (a) => `<button class="kb-card" draggable="true" data-id="${esc(a.id)}" type="button" style="--c:${s.c}"><b>${esc(exText(a.name))}</b><small>${esc(exText(a.objectif) || '—')}</small><div class="kb-meta">${a.exemple ? exTag() : ''}${Date.now() - new Date(a.createdAt) < 864e5 && a.status === 'nouvelle' ? `<span class="kb-new">${t('ad.apps.new')}</span>` : ''}${fmChip(fmOf(a))}${lgOf(a) ? `<span class="kb-lg" title="${esc(`${t('ad.f.lang')} · ${lgName(lgOf(a))}`)}">${lgOf(a).toUpperCase()}</span>` : ''}<span>${esc(prLabel(a.profil))}</span>·<span>${esc(exText(a.city) || '—')}</span>·<span>${esc(ago(a.createdAt))}</span></div></button>`,
          )
          .join('')}</section>`,
      )
      .join('')}</div>`,
  );
  const flt = $('#flt');
  flt.addEventListener('input', () => {
    filter = flt.value;
    const pos = flt.selectionStart;
    viewApps();
    const f = $('#flt');
    f.focus();
    f.setSelectionRange(pos, pos);
  });
  $$('.kb-card').forEach((c) => {
    c.addEventListener('click', () => openApp(c.dataset.id));
    c.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', c.dataset.id);
      c.classList.add('is-drag');
    });
    c.addEventListener('dragend', () => c.classList.remove('is-drag'));
  });
  $$('.kb-col').forEach((col) => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('is-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('is-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('is-over');
      const id = e.dataTransfer.getData('text/plain');
      setStatus(id, col.dataset.st);
    });
  });
  $('#csv').addEventListener('click', () => {
    const H = ['date', 'name', 'wa', 'email', 'city', 'profil', 'formation', 'lang', 'level', 'goal', 'status', 'ex'].map((k) => t(`ad.csv.${k}`));
    const rows = [H].concat(
      d.applications.map((a) => [
        fmtDT(a.createdAt),
        exText(a.name),
        a.phone,
        a.email,
        exText(a.city),
        prLabel(a.profil),
        fmLabel(fmOf(a), true),
        lgName(lgOf(a)),
        exText(a.niveau),
        exText(a.objectif),
        stLabel(a.status),
        a.exemple ? t('ad.csv.yes') : '',
      ]),
    );
    download(`${t('ad.csv.file')}-hooked-academy-${S.iso()}.csv`, '﻿' + rows.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
  });
  gsap()?.from('.kb-card', { y: 20, autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
}

function setStatus(id, st) {
  if (!S.STATUS[st]) return;
  if (st === 'validee') {
    const r = S.validateApplication(id);
    if (r) openApp(id, r);
  } else S.updateApplication(id, { status: st });
  toast(t('ad.apps.status', { s: esc(stLabel(st)) }));
  if (st !== 'validee') viewApps();
}

function openApp(id, validation = null) {
  const d = S.load();
  const a = d.applications.find((x) => x.id === id);
  if (!a) return;
  const st = d.students.find((s) => s.id === a.studentId || (a.email && s.email === a.email));
  const access = st && !st.protected && (validation || a.status === 'validee');
  const S0 = S.STATUS[a.status] || { c: 'var(--mist-400)' };
  const { dw, dispose } = drawer(
    t('ad.dw.label', { name: exText(a.name) }),
    `${drawerHead(`${esc(stLabel(a.status))}${a.exemple ? ` · ${t('ad.ex.tag')}` : ''}`, exText(a.name), S0.c)}
    ${mlSwitch(lgOf(a))}
    ${
      access
        ? `<section class="card acc-card"><p class="card-k" style="color:var(--body)">${icon('check', { size: 14 })} ${t(validation ? 'ad.dw.created' : 'ad.dw.active')}</p><p class="acc-code"><span>${t('ad.dw.code')}</span><span class="code-big" dir="ltr">${esc(st.code)}</span></p><div class="msg" data-msg="welcome"></div><div class="acts" style="margin-top:10px"><a class="b b--or b--s" data-wa="welcome" href="#" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} ${t('ad.dw.sendWa')}</a><button class="b b--s" type="button" data-copy="welcome">${icon('copy', { size: 16 })} ${t('ad.copy')}</button></div></section>`
        : ''
    }
    <dl class="dl">
      <dt>${t('ad.f.wa')}</dt><dd dir="ltr">${esc(a.phone || '—')}</dd>
      <dt>${t('ad.f.email')}</dt><dd dir="ltr">${esc(a.email || '—')}</dd>
      <dt>${t('ad.f.city')}</dt><dd>${esc(exText(a.city) || '—')}</dd>
      <dt>${t('ad.f.profil')}</dt><dd>${esc(prLabel(a.profil))}</dd>
      <dt>${t('ad.f.formation')}</dt><dd>${fmChip(fmOf(a), true) || '—'}</dd>
      <dt>${t('ad.f.lang')}</dt><dd>${lgOf(a) ? `<span lang="${lgOf(a)}">${esc(lgName(lgOf(a)))}</span>` : '—'}</dd>
      <dt>${t('ad.f.level')}</dt><dd>${esc(exText(a.niveau) || '—')}</dd>
      <dt>${t('ad.f.goal')}</dt><dd>${esc(exText(a.objectif) || '—')}</dd>
      <dt>${t('ad.f.received')}</dt><dd>${esc(fmtDT(a.createdAt))} · ${esc(srcLabel(a.source))}</dd>
    </dl>
    <div class="acts">
      <a class="b b--s" data-wa="contact" href="#" target="_blank" rel="noopener" data-contact>${icon('whatsapp', { size: 16 })} ${t('ad.dw.contact')}</a>
      ${a.status !== 'contactee' && a.status !== 'validee' ? `<button class="b b--s" data-st="contactee" type="button">${t('ad.dw.markContacted')}</button>` : ''}
      ${a.status !== 'paiement' && a.status !== 'validee' ? `<button class="b b--s" data-st="paiement" type="button">${esc(stLabel('paiement'))}</button>` : ''}
      ${a.status !== 'validee' ? `<button class="b b--ok b--s" data-st="validee" type="button">${icon('check', { size: 16 })} ${t('ad.dw.validate')}</button>` : ''}
      ${a.status !== 'refusee' ? `<button class="b b--s b--danger" data-st="refusee" type="button">${t('ad.dw.refuse')}</button>` : ''}
    </div>
    <section style="display:grid;gap:8px"><p class="card-k" style="margin:6px 0 0">${t('ad.dw.notes')}</p><div class="notes">${a.notes.map((n) => `<p><small>${esc(fmtDT(n.at))} · ${esc(byLabel(n.by))}</small>${esc(exText(n.text))}</p>`).join('') || `<p class="muted">${t('ad.dw.noNotes')}</p>`}</div>
      <form data-note style="display:flex;gap:8px"><input class="in" name="t" placeholder="${esc(t('ad.dw.notePh'))}" aria-label="${esc(t('ad.dw.notePh'))}" style="min-height:42px"><button class="b b--s" type="submit">${t('ad.dw.add')}</button></form></section>
    <section><p class="card-k">${t('ad.dw.history')}</p><div class="hist">${a.history.map((h) => `<span>${esc(fmtDT(h.at))} — ${esc(stLabel(h.status))} <span class="muted">(${esc(byLabel(h.by))})</span></span>`).join('')}</div></section>`,
    route,
  );
  bindMsgs(dw, a.phone, { contact: (l) => contactText(a, l), ...(access ? { welcome: (l) => welcomeText(st, l) } : {}) }, { pref: lgOf(a), key: a.id });
  $('[data-contact]', dw).addEventListener('click', () => {
    if (a.status === 'nouvelle') S.updateApplication(a.id, { status: 'contactee' }, 'Équipe (WhatsApp)');
  });
  $$('[data-st]', dw).forEach((b) =>
    b.addEventListener('click', () => {
      dispose();
      setStatus(a.id, b.dataset.st);
      if (b.dataset.st !== 'validee') openApp(a.id);
    }),
  );
  $('[data-note]', dw).addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = String(new FormData(e.target).get('t') || '').trim();
    if (!txt) return;
    S.updateApplication(a.id, { note: txt });
    dispose();
    openApp(a.id);
  });
}

/* ------------------------------------------------------------------ */
/* Étudiants                                                           */
/* ------------------------------------------------------------------ */

function openAccess(s) {
  // La langue choisie à l'inscription (si l'accès vient d'une inscription de la landing)
  const app = S.load().applications.find((a) => a.id === s.appId || (s.email && a.email === s.email));
  const pref = lgOf(app);
  const { dw } = drawer(
    t('ad.acc.title'),
    `${drawerHead(t('ad.acc.title'), stuName(s))}
    <p class="muted" style="margin:0">${t('ad.acc.lead')}</p>
    ${mlSwitch(pref)}
    <p class="acc-code"><span>${t('ad.dw.code')}</span><span class="code-big" dir="ltr">${esc(s.code)}</span></p>
    <div class="msg" data-msg="welcome"></div>
    ${s.phone ? '' : `<p class="muted" style="margin:0;font-size:13px">${t('ad.acc.noPhone')}</p>`}
    <div class="acts"><a class="b b--or b--s" data-wa="welcome" href="#" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} ${t('ad.dw.sendWa')}</a><button class="b b--s" type="button" data-copy="welcome">${icon('copy', { size: 16 })} ${t('ad.copy')}</button></div>`,
  );
  bindMsgs(dw, s.phone, { welcome: (l) => welcomeText(s, l) }, { pref, key: app?.id || s.id });
}

function viewStudents() {
  const d = S.load();
  const rows = d.students.map((s) => {
    const p = studentPct(s);
    const lastDay = [...s.progress.days].sort().pop();
    return { s, p, lastDay, xp: s.progress.xp || 0, streak: S.streak(s.progress.days) };
  });
  const lock = icon('lock', { size: 13 });
  const who = (s) =>
    s.protected
      ? `<span class="prot" title="${esc(t('ad.st.protectedHint'))}">${lock}${t('ad.st.protected')}</span>`
      : `<small class="muted" dir="ltr">${esc(s.email || s.phone || '—')}</small>`;
  const flags = (s) => `${s.exemple ? ` ${exTag()}` : ''}${s.active ? '' : ` <span class="chip chip--off">${t('ad.st.isSuspended')}</span>`}`;
  const acts = (s, full) =>
    s.protected
      ? ''
      : `<div class="acts"><button class="b b--s" data-send="${esc(s.id)}" type="button" ${full ? '' : `aria-label="${esc(t('ad.st.resend'))}" title="${esc(t('ad.st.resend'))}"`}>${icon('whatsapp', { size: 15 })}${full ? ` ${t('ad.st.resend')}` : ''}</button><button class="b b--s ${s.active ? 'b--danger' : 'b--ok'}" data-act="${esc(s.id)}" type="button">${t(s.active ? 'ad.st.suspend' : 'ad.st.reactivate')}</button></div>`;
  const code = (s) => (s.protected ? `<span class="muted" title="${esc(t('ad.st.protectedHint'))}">${lock}</span>` : `<code dir="ltr">${esc(s.code || '—')}</code>`);
  shell(
    '#/etudiants',
    `<div class="ph-h"><div><h1>${t('ad.nav.students')}</h1><p>${t('ad.st.lead', { n: fmtNum(rows.filter((r) => r.s.active).length) })}</p></div></div>
    <div class="card tbl-wrap scroll-x"><table class="tbl"><thead><tr><th>${t('ad.st.th.student')}</th><th>${t('ad.st.th.progress')}</th><th>${t('ad.st.th.level')}</th><th>${t('ad.st.th.streak')}</th><th>${t('ad.st.th.last')}</th><th>${t('ad.st.th.code')}</th><th><span class="sr">${t('ad.st.th.actions')}</span></th></tr></thead><tbody>${rows
      .map(
        ({ s, p, lastDay, xp, streak }) => `<tr${s.protected ? ' class="is-prot"' : ''}><td><b>${esc(stuName(s))}</b>${flags(s)}<br>${who(s)}</td><td><div class="meter"><i style="width:${p * 100}%"></i></div><small class="muted">${pct(p)}</small></td><td>${esc(lvName(xp))}<br><small class="muted">${fmtNum(xp)} XP</small></td><td>🔥 ${fmtNum(streak)}</td><td>${lastDay ? esc(fmtD(lastDay)) : '—'}</td><td>${code(s)}</td><td>${acts(s, false)}</td></tr>`,
      )
      .join('')}</tbody></table></div>
    <div class="stu-cards">${rows
      .map(
        ({ s, p, xp, streak }) => `<div class="card stu-card${s.protected ? ' is-prot' : ''}"><div class="stu-h"><b>${esc(stuName(s))}</b><span>${flags(s)}</span></div>${s.protected ? who(s) : ''}<div class="meter"><i style="width:${p * 100}%"></i></div><small class="muted">${pct(p)} · ${esc(lvName(xp))} · 🔥 ${fmtNum(streak)}${s.protected ? '' : ` · <code dir="ltr" style="color:var(--gold-300)">${esc(s.code || '—')}</code>`}</small>${acts(s, true)}</div>`,
      )
      .join('')}</div>`,
  );
  $$('[data-send]').forEach((b) =>
    b.addEventListener('click', () => {
      const s = d.students.find((x) => x.id === b.dataset.send);
      if (s && !s.protected) openAccess(s);
    }),
  );
  $$('[data-act]').forEach((b) =>
    b.addEventListener('click', () => {
      const s = d.students.find((x) => x.id === b.dataset.act);
      if (!s || s.protected) return;
      S.setStudentActive(s.id, !s.active);
      toast(t(s.active ? 'ad.st.suspended' : 'ad.st.reactivated'));
      viewStudents();
    }),
  );
}

/* ------------------------------------------------------------------ */
/* En-tête d'une formation (Programme, Ressources)                      */
/* ------------------------------------------------------------------ */

function trackHead(id, stats) {
  const tr = trackOf(id);
  const mods = modulesOf(id);
  return `<header class="trh" data-track="${id}" style="--t:${tr.color}">
    <span class="trh-i">${icon(tr.icon, { size: 26 })}</span>
    <div class="trh-t"><p class="trh-k" dir="ltr">${modCode(mods[0])} – ${modCode(mods[mods.length - 1])}</p><h2>${t(`track.${id}`)}</h2>${arLine(tr.ar)}<p class="trh-p">${esc(tr.pitch)}</p></div>
    <dl class="trh-s">${stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
  </header>`;
}

/* ------------------------------------------------------------------ */
/* Ressources : fichiers de l'équipe (manifeste) + prompts du programme */
/* ------------------------------------------------------------------ */

const GH = 'https://github.com/youcef4000/demos';
const RS_DIR = 'sites/hooked-academy/ressources';
const KIND = {
  pdf: { ic: 'doc', c: '#ec7a45' },
  prompt: { ic: 'chat', c: '#c8b6ff' },
  link: { ic: 'link', c: '#8fb8e8' },
  image: { ic: 'image', c: '#55b894' },
  file: { ic: 'box', c: '#b9b1c4' },
};
const GROUPS = ['pdf', 'prompt', 'link', 'file'];
const groupOf = (k) => (k === 'image' ? 'file' : k);
const RS_ORDER = ['ia', 'creative'];
const HELP_KEY = 'hooked-academy:admin:rs-help';

let MANI; // undefined : pas encore lu · null : absent ou illisible · objet : manifeste
let maniP = null;
function loadManifest(force = false) {
  if (force) maniP = null;
  if (!maniP)
    maniP = fetch('../ressources/manifest.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((j) => (MANI = j && typeof j === 'object' && j.lessons && typeof j.lessons === 'object' ? j : null));
  return maniP;
}
const safeUrl = (u) => (/^https?:\/\/[^\s]+$/i.test(String(u || '').trim()) ? String(u).trim() : '');
const relPath = (p) => {
  const s = String(p || '').trim().replace(/^\.?\//, '');
  if (!s || /^[a-z][a-z0-9+.-]*:/i.test(s) || s.split('/').includes('..')) return '';
  return `../${s.split('/').map(encodeURIComponent).join('/')}`;
};
function normItem(x) {
  if (!x || typeof x !== 'object') return null;
  const kind = KIND[x.kind] ? x.kind : 'file';
  const href = kind === 'link' ? safeUrl(x.url) : relPath(x.path);
  const title = String(x.title || x.file || '').trim() || t(`ad.rs.kind.${kind}`);
  return { kind, title, href, file: String(x.file || ''), size: Number(x.size) || 0, text: typeof x.text === 'string' ? x.text : '', lang: ['fr', 'en', 'ar'].includes(x.lang) ? x.lang : null, builtin: false };
}
function itemsOf(l) {
  const raw = MANI?.lessons?.[l.id];
  const team = (Array.isArray(raw) ? raw : []).map(normItem).filter(Boolean);
  const built = (l.res || []).filter((r) => r && r.text).map((r) => ({ kind: 'prompt', title: r.title || t('ad.rs.kind.prompt'), text: r.text, href: '', size: 0, lang: null, builtin: true }));
  return [...team, ...built];
}
const countOf = (items) => items.reduce((c, i) => (c[groupOf(i.kind)]++, c), { pdf: 0, prompt: 0, link: 0, file: 0 });
const fmtSize = (b) => {
  if (!b) return '';
  const [unit, v] = b >= 1e6 ? ['megabyte', b / 1e6] : b >= 1e3 ? ['kilobyte', b / 1e3] : ['byte', b];
  return fmtNum(v, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: v < 10 ? 1 : 0 });
};

let rsQ = '';
let rsOnly = false;
const rsOpen = new Set();
let rsItems = new Map();

function itemRow(it, key) {
  const k = KIND[it.kind];
  const pv = it.kind === 'prompt' ? !!it.text : (it.kind === 'image' || it.kind === 'pdf') && !!it.href;
  const meta = [t(`ad.rs.kind.${it.kind}`), fmtSize(it.size)].filter(Boolean).map(esc);
  if (it.lang) meta.push(`<span class="rs-lg">${t(`ad.rs.only.${it.lang}`)}</span>`);
  if (it.builtin) meta.push(`<span class="rs-bi">${t('ad.rs.builtin')}</span>`);
  const open = it.href
    ? `<a class="b b--s" href="${esc(it.href)}" target="_blank" rel="noopener"${it.kind === 'file' ? ' download' : ''}>${icon(it.kind === 'file' ? 'download' : 'arrow-up', { size: 15 })} ${t(it.kind === 'file' ? 'ad.rs.download' : 'ad.rs.open')}</a>`
    : '';
  return `<li class="rs-it" style="--k:${k.c}" data-key="${key}">
    <span class="rs-ii">${icon(k.ic, { size: 18 })}</span>
    <div class="rs-im"><b dir="auto">${esc(it.title)}</b><small>${meta.join(' · ')}</small></div>
    <div class="rs-ia">${pv ? `<button class="b b--s" type="button" data-pv aria-expanded="false">${icon('eye', { size: 15 })} <span>${t('ad.rs.preview')}</span></button>` : ''}${it.kind === 'prompt' && it.text ? `<button class="b b--s" type="button" data-cp>${icon('copy', { size: 15 })} ${t('ad.copy')}</button>` : ''}${open}</div>
    <div class="rs-pv" hidden></div>
  </li>`;
}

function lessonRow(l) {
  const items = itemsOf(l);
  const c = countOf(items);
  const m = l.module;
  items.forEach((it, i) => rsItems.set(`${l.id}:${i}`, it));
  const q = fold([l.title, l.id, modCode(m), m.title, ...items.map((i) => i.title)].join(' '));
  return `<details class="rs-l" data-l="${esc(l.id)}" data-q="${esc(q)}" data-n="${items.length}"${rsOpen.has(l.id) ? ' open' : ''}>
    <summary>
      <span class="rs-n">${fmtNum(l.n)}</span>
      <span class="rs-lt"><b>${esc(l.title)}</b><small dir="ltr">${modCode(m)} · ${esc(l.id)}</small></span>
      <span class="rs-chips">${GROUPS.map((g) => `<span class="rs-chip${c[g] ? '' : ' is-0'}" style="--k:${KIND[g].c}" title="${esc(t(`ad.rs.k.${g}`))} · ${c[g]}" aria-label="${esc(t(`ad.rs.k.${g}`))} · ${c[g]}">${icon(KIND[g].ic, { size: 14 })}<b>${fmtNum(c[g])}</b></span>`).join('')}</span>
      <i class="rs-car" aria-hidden="true"></i>
    </summary>
    <div class="rs-lb">
      <div class="rs-acts">
        <a class="b b--or b--s" href="${GH}/upload/main/${RS_DIR}/${encodeURIComponent(l.id)}" target="_blank" rel="noopener">${icon('plus', { size: 15 })} ${t('ad.rs.upload')} <span aria-hidden="true">${EXT}</span></a>
        <a class="b b--s" href="${GH}/tree/main/${RS_DIR}/${encodeURIComponent(l.id)}" target="_blank" rel="noopener">${icon('grid', { size: 15 })} ${t('ad.rs.folder')} <span aria-hidden="true">${EXT}</span></a>
        <span class="rs-path"><span>${t('ad.rs.folderL')}</span><code dir="ltr">ressources/${esc(l.id)}/</code></span>
      </div>
      ${items.length ? `<ul class="rs-items">${items.map((it, i) => itemRow(it, `${l.id}:${i}`)).join('')}</ul>` : `<p class="rs-empty">${icon('box', { size: 18 })}<span>${t('ad.rs.empty')}</span></p>`}
    </div>
  </details>`;
}

function viewRes() {
  if (MANI === undefined) {
    shell('#/ressources', `<div class="ph-h"><div><h1>${t('ad.nav.res')}</h1><p>${t('ad.rs.lead')}</p></div></div><p class="rs-status">${icon('repeat', { size: 16 })}<span>${t('ad.rs.loading')}</span></p>`);
    loadManifest().then(() => {
      if (location.hash.startsWith('#/ressources') && S.adminSession()) viewRes();
    });
    return;
  }
  rsItems = new Map();
  const per = (id) => lessonsOf(id).map((l) => itemsOf(l));
  const tot = { pdf: 0, prompt: 0, link: 0, file: 0 };
  RS_ORDER.forEach((id) => per(id).forEach((items) => GROUPS.forEach((g) => (tot[g] += countOf(items)[g]))));
  const help = ls.get(HELP_KEY) !== 'closed';
  const gen = MANI?.generated && !Number.isNaN(new Date(MANI.generated).getTime()) ? fmtDate(MANI.generated, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '';
  const tracks = RS_ORDER.map((id) => {
    const mods = modulesOf(id);
    const ls_ = lessonsOf(id);
    const n = per(id).reduce((s, items) => s + items.length, 0);
    return `<section class="rs-track" id="rs-${id}" style="--t:${trackOf(id).color}">
      ${trackHead(id, [
        [t('ad.pg.modules'), fmtNum(mods.length)],
        [t('ad.pg.lessons'), fmtNum(ls_.length)],
        [t('ad.nav.res'), fmtNum(n)],
      ])}
      <div class="rs-mods">${mods
        .map((m) => {
          const mls = ls_.filter((l) => l.module === m);
          const mn = mls.reduce((s, l) => s + itemsOf(l).length, 0);
          return `<article class="rs-mod" style="--m:${m.color || trackOf(id).color}"><header class="rs-mh"><span class="rs-code" dir="ltr">${modCode(m)}</span><div class="rs-mt"><h3>${esc(m.title)}</h3>${arLine(m.ar)}</div><span class="rs-mc${mn ? '' : ' is-0'}">${plural('res', mn)}</span></header><div class="rs-ls">${mls.map(lessonRow).join('')}</div></article>`;
        })
        .join('')}</div>
    </section>`;
  }).join('');
  shell(
    '#/ressources',
    `<div class="ph-h"><div><h1>${t('ad.nav.res')}</h1><p>${t('ad.rs.lead')}</p></div><button class="b b--s" id="rsr" type="button">${icon('repeat', { size: 16 })} ${t('ad.rs.refresh')}</button></div>
    <div class="rs-kpis">${GROUPS.map((g) => `<div class="card rs-kpi" style="--k:${KIND[g].c}"><i>${icon(KIND[g].ic, { size: 20 })}</i><b>${fmtNum(tot[g])}</b><span>${t(`ad.rs.k.${g}`)}</span></div>`).join('')}</div>
    <p class="rs-status${MANI ? ' is-ok' : ''}">${icon(MANI ? 'check' : 'bell', { size: 16 })}<span>${MANI ? (gen ? t('ad.rs.updated', { date: esc(gen) }) : '') : t('ad.rs.none')}</span></p>
    <details class="card rs-help"${help ? ' open' : ''}>
      <summary><span class="rs-hi">${icon('wand', { size: 18 })}</span><b>${t('ad.rs.help.title')}</b><i class="rs-car" aria-hidden="true"></i></summary>
      <div class="rs-hb">
        <ol class="rs-steps"><li>${t('ad.rs.help.s1')}</li><li>${t('ad.rs.help.s2')}</li><li>${t('ad.rs.help.s3')}</li></ol>
        <div class="rs-hcols">
          <div><p class="card-k">${t('ad.rs.help.formats')}</p><ul class="rs-fmts">
            <li style="--k:${KIND.pdf.c}">${icon(KIND.pdf.ic, { size: 16 })}<span>${t('ad.rs.help.pdf')}</span></li>
            <li style="--k:${KIND.prompt.c}">${icon(KIND.prompt.ic, { size: 16 })}<span>${t('ad.rs.help.prompt')}</span></li>
            <li style="--k:${KIND.link.c}">${icon(KIND.link.ic, { size: 16 })}<span>${t('ad.rs.help.links')}</span></li>
            <li style="--k:${KIND.image.c}">${icon(KIND.image.ic, { size: 16 })}<span>${t('ad.rs.help.img')}</span></li>
            <li style="--k:${KIND.file.c}">${icon(KIND.file.ic, { size: 16 })}<span>${t('ad.rs.help.other')}</span></li>
          </ul></div>
          <div><p class="card-k">${t('ad.rs.help.langT')}</p><p class="rs-lang">${icon('globe', { size: 16 })}<span>${t('ad.rs.help.lang')}</span></p></div>
        </div>
      </div>
    </details>
    <div class="rs-bar">
      <div class="rs-jump" role="group" aria-label="${esc(t('ad.rs.jump'))}">${RS_ORDER.map((id) => `<button type="button" data-jump="${id}" style="--t:${trackOf(id).color}">${icon(trackOf(id).icon, { size: 15 })}${t(`track.${id}`)}</button>`).join('')}</div>
      <input class="in" id="rsq" type="search" placeholder="${esc(t('ad.rs.search'))}" aria-label="${esc(t('ad.rs.searchL'))}" value="${esc(rsQ)}">
      <label class="rs-only"><input type="checkbox" id="rso"${rsOnly ? ' checked' : ''}><span>${t('ad.rs.onlyWith')}</span></label>
    </div>
    ${tracks}
    <p class="rs-nomatch" hidden>${t('ad.rs.noMatch')}</p>`,
  );
  const main = $('#main');
  const apply = () => {
    const q = fold(rsQ.trim());
    let any = false;
    $$('.rs-track', main).forEach((tr) => {
      let tAny = false;
      $$('.rs-mod', tr).forEach((m) => {
        let mAny = false;
        $$('.rs-l', m).forEach((dd) => {
          const ok = (!q || dd.dataset.q.includes(q)) && (!rsOnly || +dd.dataset.n > 0);
          dd.hidden = !ok;
          mAny ||= ok;
        });
        m.hidden = !mAny;
        tAny ||= mAny;
      });
      tr.hidden = !tAny;
      any ||= tAny;
    });
    $('.rs-nomatch', main).hidden = any;
  };
  apply();
  $('#rsq').addEventListener('input', (e) => {
    rsQ = e.target.value;
    apply();
  });
  $('#rso').addEventListener('change', (e) => {
    rsOnly = e.target.checked;
    apply();
  });
  $('#rsr').addEventListener('click', () => {
    MANI = undefined;
    loadManifest(true).then(() => location.hash.startsWith('#/ressources') && viewRes());
  });
  $('.rs-help').addEventListener('toggle', (e) => ls.set(HELP_KEY, e.target.open ? 'open' : 'closed'));
  main.addEventListener(
    'toggle',
    (e) => {
      const dd = e.target;
      if (!dd.classList?.contains('rs-l')) return;
      if (dd.open) rsOpen.add(dd.dataset.l);
      else rsOpen.delete(dd.dataset.l);
    },
    true,
  );
  main.addEventListener('click', (e) => {
    const j = e.target.closest('[data-jump]');
    if (j) {
      const sec = $(`#rs-${j.dataset.jump}`);
      if (sec && !sec.hidden) sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const li = e.target.closest('.rs-it');
    if (!li) return;
    const it = rsItems.get(li.dataset.key);
    if (!it) return;
    if (e.target.closest('[data-cp]')) return copy(it.text);
    const b = e.target.closest('[data-pv]');
    if (!b) return;
    const box = $('.rs-pv', li);
    const show = box.hidden;
    if (show && !box.childElementCount) {
      if (it.kind === 'prompt') box.innerHTML = `<pre class="rs-pre" dir="auto">${esc(it.text)}</pre>`;
      else if (it.kind === 'image') box.innerHTML = `<img src="${esc(it.href)}" alt="${esc(it.title)}" loading="lazy">`;
      else if (it.kind === 'pdf') box.innerHTML = `<iframe src="${esc(it.href)}#view=FitH" title="${esc(it.title)}" loading="lazy"></iframe>`;
      else box.innerHTML = `<p class="muted">${t('ad.rs.noPreview')}</p>`;
    }
    box.hidden = !show;
    b.setAttribute('aria-expanded', String(show));
    $('span', b).textContent = t(show ? 'ad.rs.hide' : 'ad.rs.preview');
  });
  gsap()?.from('.rs-kpi, .rs-help, .trh, .rs-mod', { y: 22, autoAlpha: 0, duration: 0.6, stagger: 0.035, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
}

/* ------------------------------------------------------------------ */
/* Studio voix off                                                     */
/* ------------------------------------------------------------------ */

const VKEY = (id) => `hooked-academy:voix:${id}`;
const voiceLocal = (id) => ls.get(VKEY(id));

function scriptText(l) {
  const steps = plan(l);
  const head = `${modCode(l.module)} · ${l.title}`;
  return `${head}\n${'='.repeat(head.length)}\n${t('ad.sd.duration', { d: fmtMin(lessonDuration(l)) })}\n\n${steps
    .map((s, i) => `[${fmtMin(s.t)} → ${fmtMin(s.t + s.d)}] ${t('ad.sd.scene', { n: i + 1 })} (${s.sc.type})\n${s.sc.say || (l.voice ? t('ad.sd.recorded') : '—')}`)
    .join('\n\n')}\n`;
}

function viewStudio(id) {
  const cur = findLesson(id || 'm1-l3') || findLesson(LESSONS[0].id);
  const l = cur.lesson;
  const steps = plan(l);
  shell(
    '#/studio',
    `<div class="ph-h"><div><h1>${t('ad.nav.studio')}</h1><p>${t('ad.sd.lead')}</p></div><button class="b b--s" id="allscript" type="button">${icon('doc', { size: 16 })} ${t('ad.sd.all')}</button></div>
    <div class="studio">
      <section class="card"><div class="st-list">${['creative', 'ia']
        .map(
          (tid) =>
            `<p class="st-tr" style="--t:${trackOf(tid).color}">${icon(trackOf(tid).icon, { size: 15 })}${t(`track.${tid}`)}</p>${modulesOf(tid)
              .map(
                (m) =>
                  `<h4><span dir="ltr">${modCode(m)}</span> ${esc(m.title)}</h4>${m.lessons.map((x) => `<button type="button" data-l="${esc(x.id)}" ${x.id === l.id ? 'aria-current="true"' : ''}><i class="${x.voice ? 'ok' : voiceLocal(x.id) ? 'loc' : ''}"></i>${esc(x.title)}</button>`).join('')}`,
              )
              .join('')}`,
        )
        .join('')}</div><p class="muted st-legend"><span><i class="ok"></i>${t('ad.sd.lgDone')}</span><span><i class="loc"></i>${t('ad.sd.lgLocal')}</span><span><i></i>${t('ad.sd.lgTodo')}</span></p></section>
      <section style="display:grid;gap:14px;min-width:0">
        <div class="card" style="display:grid;gap:12px">
          <div class="st-head"><div><p class="card-k" style="color:${cur.module.color || 'var(--gold-300)'};margin:0 0 4px"><span dir="ltr">${modCode(cur.module)}</span> · ${t(`track.${cur.module.track}`)}</p><h2 style="font-size:22px">${esc(l.title)}</h2></div><span class="muted st-dur">${plural('scene', steps.length)} · <span dir="ltr">${fmtMin(lessonDuration(l))}</span></span></div>
          <div class="st-player"><iframe id="sp" src="../motion/player.html?id=${encodeURIComponent(l.id)}${l.audio ? '&audio=1' : ''}" title="${esc(t('ad.sd.iframe'))}" allow="autoplay; fullscreen"></iframe><div class="countdown" id="cd" hidden></div></div>
          <div class="telep" aria-live="polite"><span class="card-k" style="margin:0">${t('ad.sd.now')}</span><p id="telet" dir="auto">${esc(steps[0]?.sc.say || (l.voice ? t('ad.sd.voiceDone') : '—'))}</p></div>
          <div class="st-rec">
            ${l.voice ? `<span class="chip chip--ok">${icon('check', { size: 14 })} ${t('ad.sd.mounted')}</span>` : ''}
            <button class="b b--or" id="rec" type="button">${icon('mic', { size: 18 })} ${t('ad.sd.rec')}</button>
            <button class="b" id="stp" type="button" hidden><span class="rec-dot"></span> ${t('ad.sd.stop')}</button>
            <span class="muted" id="recs" style="font-size:13px"></span>
          </div>
          <div id="take" hidden style="display:grid;gap:10px"><audio id="aud" controls style="width:100%"></audio><div class="acts"><button class="b b--s" id="sync" type="button">${icon('play', { size: 15 })} ${t('ad.sd.sync')}</button><a class="b b--s b--or" id="dl">${icon('download', { size: 15 })} ${t('ad.sd.dl')}</a><a class="b b--s" href="${GH}/upload/main/sites/hooked-academy/video/voix" target="_blank" rel="noopener">${icon('arrow-up', { size: 15 })} ${t('ad.sd.upload')} <span aria-hidden="true">${EXT}</span></a></div><p class="muted" style="font-size:12.5px;margin:0">${t('ad.sd.dropHint')}</p></div>
        </div>
        <section class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px"><p class="card-k" style="margin:0">${t('ad.sd.scripts')}</p><button class="b b--s" id="one" type="button">${icon('download', { size: 15 })} .txt</button></div>
          <ol class="say-list" id="say">${steps.map((s) => `<li data-t="${s.t}" data-e="${s.t + s.d}"><small dir="ltr">${fmtMin(s.t)} · ${esc(s.sc.type)}</small><span dir="auto">${esc(s.sc.say || (l.voice ? t('ad.sd.sceneDone') : '—'))}</span></li>`).join('')}</ol></section>
      </section>
    </div>`,
  );
  $$('[data-l]').forEach((b) => b.addEventListener('click', () => (location.hash = `#/studio/${b.dataset.l}`)));
  $('[data-l][aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  window.scrollTo(0, 0);
  $('#one').addEventListener('click', () => download(`${l.id}-${t('ad.sd.file')}.txt`, scriptText(l)));
  $('#allscript').addEventListener('click', () => download(`${t('ad.sd.fileAll')}.txt`, LESSONS.map(scriptText).join('\n\n\n')));
  const ifr = $('#sp');
  const cmd = (c, tt) => ifr.contentWindow?.postMessage({ type: 'ha-cmd', cmd: c, t: tt }, '*');
  const sayEls = $$('#say li');
  let rec = null;
  let chunks = [];
  let stream = null;
  let lastBlob = null;
  const telet = $('#telet');
  const hl = (tt) => {
    sayEls.forEach((li, i) => {
      const on = tt >= +li.dataset.t && tt < +li.dataset.e;
      li.classList.toggle('is-cur', on);
      if (on && steps[i].sc.say && telet.textContent !== steps[i].sc.say) telet.textContent = steps[i].sc.say;
    });
  };
  const onMsg = (e) => {
    const m = e.data;
    if (!m || m.type !== 'ha-player' || m.id !== l.id) return;
    if (m.event === 'time' || m.event === 'play' || m.event === 'pause') hl(m.t);
    if (m.event === 'ended' && rec?.state === 'recording') finish();
  };
  addEventListener('message', onMsg);
  stop.push(() => removeEventListener('message', onMsg));
  stop.push(() => stream?.getTracks().forEach((tr) => tr.stop()));

  const finish = () => {
    if (rec?.state === 'recording') rec.stop();
    cmd('pause');
    $('#stp').hidden = true;
    $('#rec').hidden = false;
  };
  $('#stp').addEventListener('click', finish);
  $('#rec').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      $('#recs').textContent = t('ad.sd.noRec');
      return;
    }
    try {
      stream = stream || (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }));
    } catch {
      $('#recs').textContent = t('ad.sd.mic');
      return;
    }
    cmd('pause');
    cmd('seek', 0);
    const cd = $('#cd');
    cd.hidden = false;
    for (const n of [3, 2, 1]) {
      cd.textContent = n;
      gsap()?.fromTo(cd, { scale: 1.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3 });
      await new Promise((r) => setTimeout(r, 750));
    }
    cd.hidden = true;
    chunks = [];
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((x) => MediaRecorder.isTypeSupported?.(x)) || '';
    rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      lastBlob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      const url = URL.createObjectURL(lastBlob);
      $('#aud').src = url;
      const ext = (rec.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
      $('#dl').href = url;
      $('#dl').download = `${l.id}-voix-off.${ext}`;
      $('#take').hidden = false;
      $('#recs').textContent = t('ad.sd.taken');
      ls.set(VKEY(l.id), new Date().toISOString());
      toast(`${icon('mic', { size: 16 })} ${t('ad.sd.toast', { t: esc(l.title) })}`);
    };
    rec.start(250);
    cmd('play');
    $('#rec').hidden = true;
    $('#stp').hidden = false;
    $('#recs').textContent = t('ad.sd.recording');
  });
  $('#sync').addEventListener('click', () => {
    const a = $('#aud');
    cmd('seek', 0);
    a.currentTime = 0;
    a.play();
    cmd('play');
  });
}

/* ------------------------------------------------------------------ */
/* Programme et réglages                                               */
/* ------------------------------------------------------------------ */

const widgetLabel = (w) => t(['formats', 'outils', 'ratio', 'anatomie', 'hooks', 'cta', 'aida', 'carrousel', 'prompt', 'prompt-image', 'camera', 'metrics', 'prix', 'dm'].includes(w) ? `ad.w.${w}` : 'ad.w.default');

function viewProgramme() {
  const voice = (l) =>
    l.voice ? `<span class="chip chip--ok">${t('ad.pg.vDone')}</span>` : voiceLocal(l.id) ? `<span class="chip chip--or">${t('ad.pg.vLocal')}</span>` : `<span class="chip">${t('ad.pg.vTodo')}</span>`;
  shell(
    '#/programme',
    `<div class="ph-h"><div><h1>${t('ad.nav.prog')}</h1><p>${t('ad.pg.lead')}</p></div></div>
    <div class="pg">${['creative', 'ia']
      .map((id) => {
        const mods = modulesOf(id);
        const ls_ = lessonsOf(id);
        const mins = Math.round(ls_.reduce((s, l) => s + lessonDuration(l), 0) / 60);
        return `<section class="pg-track" style="--t:${trackOf(id).color}">
        ${trackHead(id, [
          [t('ad.pg.modules'), fmtNum(mods.length)],
          [t('ad.pg.lessons'), fmtNum(ls_.length)],
          [t('ad.pg.minutes'), fmtNum(mins)],
          [t('ad.pg.voiced'), fmtNum(ls_.filter((l) => l.voice).length)],
        ])}
        <div class="pg-mods">${mods
          .map(
            (m) => `<section class="card pg-mod" style="--m:${m.color || trackOf(id).color}"><header class="pg-mh"><span class="rs-code" dir="ltr">${modCode(m)}</span><div class="rs-mt"><h3>${esc(m.title)}</h3>${arLine(m.ar)}</div><span class="rs-mc">${plural('lesson', m.lessons.length)}</span></header><div class="scroll-x"><table class="tbl prog-tbl"><thead><tr><th>${t('ad.pg.th.lesson')}</th><th>${t('ad.pg.th.duration')}</th><th>${t('ad.pg.th.scenes')}</th><th>${t('ad.pg.th.voice')}</th><th>${t('ad.pg.th.exercise')}</th><th><span class="sr">${t('ad.st.th.actions')}</span></th></tr></thead><tbody>${ls_
              .filter((l) => l.module === m)
              .map(
                (l) => `<tr><td><span class="pg-n">${fmtNum(l.n)}</span>${esc(l.title)}</td><td class="pg-num" data-th="${esc(t('ad.pg.th.duration'))}"><span dir="ltr">${fmtMin(lessonDuration(l))}</span></td><td class="pg-num" data-th="${esc(t('ad.pg.th.scenes'))}">${fmtNum(l.scenes.length)}</td><td>${voice(l)}</td><td data-th="${esc(t('ad.pg.th.exercise'))}">${esc(widgetLabel(l.widget))}</td><td><div class="acts"><a class="b b--s b--i" href="../motion/player.html?id=${encodeURIComponent(l.id)}" target="_blank" rel="noopener" aria-label="${esc(t('ad.pg.watch'))}" title="${esc(t('ad.pg.watch'))}">${icon('play', { size: 14 })}</a><a class="b b--s b--i" href="#/studio/${esc(l.id)}" aria-label="${esc(t('ad.pg.toStudio'))}" title="${esc(t('ad.pg.toStudio'))}">${icon('mic', { size: 14 })}</a></div></td></tr>`,
              )
              .join('')}</tbody></table></div></section>`,
          )
          .join('')}</div></section>`;
      })
      .join('')}</div>`,
  );
  gsap()?.from('.trh, .pg-mod', { y: 22, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
}

function viewSettings() {
  const d = S.load();
  const code = (s) => `<code dir="ltr" style="color:var(--gold-300)">${esc(s)}</code>`;
  shell(
    '#/reglages',
    `<div class="ph-h"><div><h1>${t('ad.nav.settings')}</h1><p>${t('ad.set.lead')}</p></div></div>
    <div style="display:grid;gap:12px;max-width:640px">
      <section class="card set-lang"><p class="card-k">${icon('globe', { size: 14 })} ${t('ad.set.lang')}</p>${switcher('ad-lang ad-lang--wide')}<p class="muted" style="margin:10px 0 0;font-size:13.5px">${t('ad.set.langP')}</p></section>
      <form class="card" id="sf" style="display:grid;gap:12px">
        <label class="lbl">${t('ad.set.cohort')}<input class="in" name="cohort" value="${esc(d.settings.cohort)}"></label>
        <label class="lbl">${t('ad.set.wa')}<input class="in" name="whatsapp" value="${esc(d.settings.whatsapp)}" inputmode="tel" dir="ltr"></label>
        <button class="b b--or" type="submit">${t('ad.set.save')}</button>
      </form>
      <section class="card" style="display:grid;gap:10px"><p class="card-k">${t('ad.set.data')}</p><p class="muted" style="margin:0">${t('ad.set.dataP')}</p>
        <div class="acts"><button class="b b--s" id="exp" type="button">${icon('download', { size: 15 })} ${t('ad.set.export')}</button><button class="b b--s b--danger" id="rst" type="button">${t('ad.set.reset')}</button></div></section>
      <section class="card"><p class="card-k">${t('ad.set.access')}</p><p class="muted" style="margin:0">${t('ad.set.accessP', { team: code(S.TEAM_CODE), email: code(S.DEMO_STUDENT.email), code: code(S.DEMO_STUDENT.code) })}</p></section>
    </div>`,
  );
  $('#sf').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    const dd = S.load();
    Object.assign(dd.settings, f);
    S.save(dd);
    toast(t('ad.set.saved'));
  });
  $('#exp').addEventListener('click', () => download(`${t('ad.set.file')}-${S.iso()}.json`, JSON.stringify(S.load(), null, 2), 'application/json'));
  $('#rst').addEventListener('click', () => {
    if (!confirm(t('ad.set.confirm'))) return;
    S.reset();
    S.loginAdmin(S.TEAM_CODE);
    toast(t('ad.set.resetDone'));
    viewSettings();
  });
}

/* ------------------------------------------------------------------ */

function route() {
  $$('.drawer, .sheet').forEach((d) => d.remove());
  document.body.style.overflow = '';
  stop.forEach((f) => {
    try {
      f();
    } catch {}
  });
  stop = [];
  if (!S.adminSession()) return viewLogin();
  const h = location.hash || '#/';
  if (h === '#/inscriptions') return viewApps();
  if (h === '#/etudiants') return viewStudents();
  if (h === '#/ressources') return viewRes();
  if (h.startsWith('#/studio')) return viewStudio(decodeURIComponent(h.split('/')[2] || ''));
  if (h === '#/programme') return viewProgramme();
  if (h === '#/reglages') return viewSettings();
  return viewOverview();
}
bindSwitchers(document);
addEventListener('hashchange', route);
// Une inscription envoyée depuis la landing (autre onglet) apparaît sans recharger
addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('hooked-academy:data') && !document.querySelector('.drawer, .sheet')) route();
});
(document.fonts ? document.fonts.ready : Promise.resolve()).then(route);
