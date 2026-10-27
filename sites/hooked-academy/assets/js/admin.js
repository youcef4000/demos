// Hooked Academy — espace équipe (français, anglais, arabe), branché sur le serveur (server/plateforme.js).
// Routes : #/ (vue d'ensemble) · #/inscriptions · #/etudiants · #/ressources · #/studio[/leçon] · #/programme
//          · #/edition/<leçon> · #/faq · #/reglages
// Connexion : compte de l'équipe (identifiant + mot de passe, créé une fois avec le code d'installation).
// Les inscriptions arrivent de la landing ; l'équipe contacte sur WhatsApp, encaisse, valide :
// la validation crée l'accès étudiant (e-mail ou téléphone + code) et prépare le message de bienvenue.
// Tout ce qui est modifié ici (textes des leçons, quiz, ateliers, voix off, ressources, FAQ, réglages) est
// publié par le serveur : le site est à jour pour tout le monde, sans passer par GitHub.

import { LANGS, lang, isRTL, locale, t, tIn, has, fmtNum, fmtDate, switcher, bindSwitchers } from './i18n.js';
import './i18n/common.js';
import { plural, exText } from './i18n/admin.js';
import './i18n/admin-serveur.js';
import { logoInner, markSVG } from './brand.js';
import { icon } from './icons.js';
import * as S from './store.js';
import { MODULES, allLessons, findLesson, modCode, modulesOf, coreModulesOf, lessonsOf, trackOf, edited } from '../../data/programme.js';
import { PUB } from '../../data/serveur.js';
import { plan, lessonDuration, BASE as SCENE_BASE } from '../../motion/engine.js';
import { api, upload, derive, randomSalt, proofLogin, siteUrl } from './api.js';
import * as V from './voix.js';
import * as FAQ from './faq.js';
import { initPWA, installable } from './pwa.js';
import { match as botMatch, SURE as BOT_SURE, builtins as botBuiltins } from './assistant.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = () => (reduce ? null : window.gsap);
const root = $('#root');
const LESSONS = allLessons();
let stop = [];
/** État du serveur (inscriptions, étudiants, contenus, fichiers, journal) ; null : pas encore chargé ou session fermée. */
let D = null;
const reload = async () => (D = await api('GET', 'admin/state'));
const enc = encodeURIComponent;

/** Message d'erreur lisible pour une réponse du serveur. */
const errText = (e) => t(`ad.err.${['network', 'no_server', 'rate', 'auth', 'too_large', 'type', 'signature', 'exists', 'fields', 'bad', 'bad_code', 'done'].includes(e?.code) ? e.code : e?.status === 429 ? 'rate' : 'generic'}`);
/**
 * Action sur le serveur : renvoie le résultat, ou null après avoir affiché l'erreur.
 * Session expirée : retour à l'écran de connexion.
 */
async function act(fn, okMsg = '') {
  try {
    const r = await fn();
    if (okMsg) toast(`${icon('check', { size: 16 })} ${okMsg}`);
    return r;
  } catch (e) {
    if (e?.status === 401 && e.code === 'auth') {
      D = null;
      route();
    }
    toast(`${icon('bell', { size: 16 })} ${esc(errText(e))}`, 4200);
    return null;
  }
}
/** Recharge la page en gardant la route (les contenus modifiés s'appliquent au chargement du programme). */
function reloadPage(msg) {
  try {
    sessionStorage.setItem('ha-admin-toast', msg);
  } catch {}
  location.reload();
}

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
function welcomeText(st, l, code = '') {
  const id = st.email ? tIn(l, 'ad.msg.email', { v: st.email }) : tIn(l, 'ad.msg.phone', { v: st.phone || '—' });
  const name = S.isDemo(st) ? tIn(l, 'ad.msg.demoName') : st.firstName || firstOf(st.name);
  const tr = S.accessOf(st);
  const packName = tr.map((x) => tIn(l, `track.${x}`)).join(' + ');
  const until = st.expiresAt ? new Intl.DateTimeFormat({ fr: 'fr-FR', en: 'en-GB', ar: 'ar-DZ' }[l] || 'fr-FR', { dateStyle: 'long' }).format(new Date(st.expiresAt)) : '';
  const pack = !S.isDemo(st) && tr.length && until ? `${tIn(l, 'ad.msg.pack', { p: packName, d: until })}\n` : '';
  return tIn(l, 'ad.msg.welcome', { name, url: studentUrl(l), id, code: code || '—', pack });
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

const authBox = (title, lead, form) => `<div class="login"><section class="login-box">
    <div class="login-top"><a class="ha-logo" href="../">${logoInner()}</a>${switcher('ad-lang')}</div>
    <h1>${title}</h1>
    <p class="muted">${lead}</p>
    ${form}
  </section><aside class="login-art la-team" aria-hidden="true"><div class="la-mark">${markSVG()}</div><p class="la-name">Hooked Academy</p><p class="la-sub">${t('ad.nav.team')}</p></aside></div>`;
const busyBtn = (b, on) => {
  b.disabled = on;
  b.setAttribute('aria-busy', String(on));
};

/** Connexion de l'équipe : identifiant + mot de passe (dérivé dans le navigateur, jamais envoyé tel quel). */
function viewLogin(err = '') {
  root.innerHTML = authBox(
    t('ad.login.title'),
    t('ad.auth.lead'),
    `<form id="af" style="display:grid;gap:12px" novalidate>
      <label class="lbl">${t('ad.auth.ident')}<input class="in" name="ident" autocomplete="username" type="text" inputmode="email" autocapitalize="off" spellcheck="false" required dir="ltr"></label>
      <label class="lbl">${t('ad.auth.pw')}<input class="in" name="pw" autocomplete="current-password" type="password" required dir="ltr"></label>
      <p class="login-err" role="alert">${esc(err)}</p>
      <button class="b b--or" type="submit">${t('ad.login.enter')}</button>
      <p class="muted" style="font-size:13px;margin:0">${t('ad.auth.lost')}</p>
    </form>`,
  );
  const f = $('#af');
  f.elements.ident.focus();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ident = f.elements.ident.value.trim();
    const pw = f.elements.pw.value;
    if (!ident || !pw) return ($('.login-err').textContent = t('ad.auth.empty'));
    const btn = $('button[type="submit"]', f);
    busyBtn(btn, true);
    $('.login-err').textContent = t('ad.auth.checking');
    try {
      await proofLogin('admin/login', ident, pw);
      D = null;
      route();
    } catch (x) {
      busyBtn(btn, false);
      if (x?.code === 'setup') return viewSetup();
      $('.login-err').textContent = x?.status === 401 ? t('ad.login.bad') : errText(x);
    }
  });
}

/** Première visite : création du compte de l'équipe avec le code d'installation (à usage unique). */
function viewSetup(err = '') {
  root.innerHTML = authBox(
    t('ad.setup.title'),
    t('ad.setup.lead'),
    `<form id="sf" style="display:grid;gap:12px" novalidate>
      <label class="lbl">${t('ad.setup.code')}<input class="in" name="code" autocomplete="off" required dir="ltr" placeholder="HA-SETUP-XXXXX-…" style="font-family:var(--font-mono)"></label>
      <label class="lbl">${t('ad.auth.ident')}<input class="in" name="ident" autocomplete="username" type="text" inputmode="email" autocapitalize="off" spellcheck="false" required dir="ltr"></label>
      <label class="lbl">${t('ad.setup.pw')}<input class="in" name="pw" autocomplete="new-password" type="password" required minlength="10" dir="ltr"></label>
      <label class="lbl">${t('ad.setup.pw2')}<input class="in" name="pw2" autocomplete="new-password" type="password" required dir="ltr"></label>
      <p class="muted" style="font-size:13px;margin:0">${t('ad.setup.hint')}</p>
      <p class="login-err" role="alert">${esc(err)}</p>
      <button class="b b--or" type="submit">${t('ad.setup.go')}</button>
    </form>`,
  );
  const f = $('#sf');
  f.elements.code.focus();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = (n) => f.elements[n].value.trim();
    const errEl = $('.login-err');
    if (!v('code') || v('ident').length < 3) return (errEl.textContent = t('ad.auth.empty'));
    if (f.elements.pw.value.length < 10) return (errEl.textContent = t('ad.setup.short'));
    if (f.elements.pw.value !== f.elements.pw2.value) return (errEl.textContent = t('ad.setup.diff'));
    const btn = $('button[type="submit"]', f);
    busyBtn(btn, true);
    errEl.textContent = t('ad.auth.checking');
    try {
      const salt = randomSalt();
      const proof = await derive(f.elements.pw.value, salt);
      await api('POST', 'admin/setup', { code: v('code'), ident: v('ident'), salt, proof });
      D = null;
      try {
        sessionStorage.setItem('ha-admin-toast', t('ad.setup.done'));
      } catch {}
      route();
    } catch (x) {
      busyBtn(btn, false);
      if (x?.code === 'done') return viewLogin();
      errEl.textContent = x?.code === 'bad_code' ? t('ad.err.bad_code') : errText(x);
    }
  });
}

/** Pas de serveur (miroir GitHub Pages, hors ligne) : l'espace équipe n'est disponible que sur le site principal. */
function viewOffline() {
  root.innerHTML = authBox(
    t('ad.off.title'),
    t('ad.off.lead'),
    `<div class="acts"><button class="b b--or" type="button" id="retry">${icon('repeat', { size: 16 })} ${t('ad.off.retry')}</button></div>`,
  );
  $('#retry').addEventListener('click', () => route());
}

const NAV = [
  { h: '#/', ic: 'chart', k: 'overview' },
  { h: '#/inscriptions', ic: 'users', k: 'apps' },
  { h: '#/etudiants', ic: 'book', k: 'students' },
  { h: '#/ressources', ic: 'box', k: 'res' },
  { h: '#/studio', ic: 'mic', k: 'studio' },
  { h: '#/programme', ic: 'layers', k: 'prog' },
  { h: '#/faq', ic: 'help', k: 'faq' },
  { h: '#/reglages', ic: 'settings', k: 'settings' },
];
const TABS = ['#/', '#/inscriptions', '#/etudiants', '#/ressources'];

function shell(active, html) {
  const d = D;
  const nNew = d.applications.filter((a) => a.status === 'nouvelle').length;
  const more = !TABS.includes(active);
  const out = `<a class="nv" href="../app/" target="_blank" rel="noopener">${icon('user', { size: 20 })}${t('ad.nav.studentSpace')} <span class="ext" aria-hidden="true">${EXT}</span></a><button class="nv" type="button" data-pwa-install ${installable() ? '' : 'hidden'}>${icon('download', { size: 20 })}${t('pwa.install')}</button>`;
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
  const logout = async () => {
    await api('POST', 'admin/logout').catch(() => {});
    D = null;
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
  const d = D;
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
    const mods = coreModulesOf(id);
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
  const d = D;
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
    // Une case qui commence par = + - @ (ou tabulation) serait une formule dans Excel : on la neutralise
    const cell = (x) => {
      const v = String(x ?? '');
      return `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
    };
    download(`${t('ad.csv.file')}-hooked-academy-${S.iso()}.csv`, '﻿' + rows.map((r) => r.map(cell).join(';')).join('\n'), 'text/csv');
  });
  gsap()?.from('.kb-card', { y: 20, autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
}

/**
 * Validation. Le serveur ne fusionne jamais en silence avec un étudiant qui a déjà cet e-mail ou ce téléphone
 * (l'e-mail d'une inscription n'est pas vérifié) : l'équipe voit le compte trouvé et choisit de le prolonger,
 * sans changer son code ni écrire au numéro de la nouvelle inscription.
 */
async function validateApp(id) {
  try {
    return await api('POST', `admin/apps/${enc(id)}/validate`);
  } catch (e) {
    if (e?.status !== 409 || e.code !== 'exists' || !e.data?.student) throw e;
    const x = e.data.student;
    const who = `${x.name} (${[x.email, x.phone].filter(Boolean).join(' · ')})`;
    if (!confirm(t('ad.renew.c', { who }))) return null;
    return api('POST', `admin/apps/${enc(id)}/validate`, { renew: x.id });
  }
}

async function setStatus(id, st, by) {
  if (!S.STATUS[st]) return;
  const r = await act(() => (st === 'validee' ? validateApp(id) : api('PATCH', `admin/apps/${enc(id)}`, { status: st, ...(by ? { by } : {}) })));
  if (!r) return;
  await reload().catch(() => {});
  toast(t('ad.apps.status', { s: esc(stLabel(st)) }));
  if (st === 'validee') openApp(id, r);
  else if (location.hash === '#/inscriptions') viewApps();
  return r;
}

function openApp(id, validation = null) {
  const d = D;
  const a = d.applications.find((x) => x.id === id);
  if (!a) return;
  const st = d.students.find((s) => s.id === a.studentId || (a.email && s.email === a.email));
  const access = st && !st.protected && (validation || a.status === 'validee');
  const code = validation?.code || '';
  const S0 = S.STATUS[a.status] || { c: 'var(--mist-400)' };
  const { dw, dispose } = drawer(
    t('ad.dw.label', { name: exText(a.name) }),
    `${drawerHead(`${esc(stLabel(a.status))}${a.exemple ? ` · ${t('ad.ex.tag')}` : ''}`, exText(a.name), S0.c)}
    ${mlSwitch(lgOf(a))}
    ${
      access && code
        ? `<section class="card acc-card"><p class="card-k" style="color:var(--body)">${icon('check', { size: 14 })} ${t('ad.dw.created')}</p><p class="acc-code"><span>${t('ad.dw.code')}</span><span class="code-big" dir="ltr">${esc(code)}</span></p><p class="muted" style="margin:0 0 8px;font-size:13px">${t('ad.code.once')}</p><div class="msg" data-msg="welcome"></div><div class="acts" style="margin-top:10px"><a class="b b--or b--s" data-wa="welcome" href="#" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} ${t('ad.dw.sendWa')}</a><button class="b b--s" type="button" data-copy="welcome">${icon('copy', { size: 16 })} ${t('ad.copy')}</button></div></section>`
        : access
          ? `<section class="card acc-card"><p class="card-k" style="color:var(--body)">${icon('check', { size: 14 })} ${t(validation?.renewed ? 'ad.renew.done' : 'ad.dw.active')}</p><p class="muted" style="margin:0 0 10px;font-size:13.5px">${t(validation?.renewed ? 'ad.renew.x' : 'ad.code.hidden')}</p><div class="acts"><button class="b b--s" type="button" data-newcode>${icon('key', { size: 15 })} ${t('ad.code.new')}</button></div></section>`
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
      <button class="b b--s b--danger b--i" data-delapp type="button" aria-label="${esc(t('ad.app.del'))}" title="${esc(t('ad.app.del'))}">${icon('x', { size: 16 })}</button>
    </div>
    <section style="display:grid;gap:8px"><p class="card-k" style="margin:6px 0 0">${t('ad.dw.notes')}</p><div class="notes">${a.notes.map((n) => `<p><small>${esc(fmtDT(n.at))} · ${esc(byLabel(n.by))}</small>${esc(exText(n.text))}</p>`).join('') || `<p class="muted">${t('ad.dw.noNotes')}</p>`}</div>
      <form data-note style="display:flex;gap:8px"><input class="in" name="t" placeholder="${esc(t('ad.dw.notePh'))}" aria-label="${esc(t('ad.dw.notePh'))}" style="min-height:42px"><button class="b b--s" type="submit">${t('ad.dw.add')}</button></form></section>
    <section><p class="card-k">${t('ad.dw.history')}</p><div class="hist">${a.history.map((h) => `<span>${esc(fmtDT(h.at))} — ${esc(stLabel(h.status))} <span class="muted">(${esc(byLabel(h.by))})</span></span>`).join('')}</div></section>`,
    route,
  );
  bindMsgs(dw, a.phone, { contact: (l) => contactText(a, l), ...(access && code ? { welcome: (l) => welcomeText(st, l, code) } : {}) }, { pref: lgOf(a), key: a.id });
  $('[data-contact]', dw).addEventListener('click', () => {
    if (a.status === 'nouvelle') setStatus(a.id, 'contactee', 'Équipe (WhatsApp)');
  });
  $$('[data-st]', dw).forEach((b) =>
    b.addEventListener('click', async () => {
      dispose();
      const r = await setStatus(a.id, b.dataset.st);
      if (r && b.dataset.st !== 'validee') openApp(a.id);
    }),
  );
  $('[data-newcode]', dw)?.addEventListener('click', () => {
    dispose();
    newCode(st);
  });
  $('[data-delapp]', dw).addEventListener('click', async () => {
    if (!confirm(t('ad.app.delC', { name: exText(a.name) }))) return;
    if (!(await act(() => api('DELETE', `admin/apps/${enc(a.id)}`), t('ad.app.deleted')))) return;
    dispose();
    await reload().catch(() => {});
    viewApps();
  });
  $('[data-note]', dw).addEventListener('submit', async (e) => {
    e.preventDefault();
    const txt = String(new FormData(e.target).get('t') || '').trim();
    if (!txt) return;
    if (!(await act(() => api('PATCH', `admin/apps/${enc(a.id)}`, { note: txt })))) return;
    await reload().catch(() => {});
    dispose();
    openApp(a.id);
  });
}

/* ------------------------------------------------------------------ */
/* Étudiants                                                           */
/* ------------------------------------------------------------------ */

/** Nouveau code d'accès (l'ancien ne marche plus), puis le message à envoyer. */
async function newCode(s) {
  if (!s || s.protected || !confirm(t('ad.code.newC', { name: stuName(s) }))) return;
  const r = await act(() => api('POST', `admin/students/${enc(s.id)}/code`));
  if (r) openAccess(r.student, r.code);
}

function openAccess(s, code) {
  // La langue choisie à l'inscription (si l'accès vient d'une inscription de la landing)
  const app = D.applications.find((a) => a.id === s.appId || (s.email && a.email === s.email));
  const pref = lgOf(app);
  const { dw } = drawer(
    t('ad.acc.title'),
    `${drawerHead(t('ad.acc.title'), stuName(s))}
    <p class="muted" style="margin:0">${t('ad.acc.lead')}</p>
    ${mlSwitch(pref)}
    <p class="acc-code"><span>${t('ad.dw.code')}</span><span class="code-big" dir="ltr">${esc(code)}</span></p>
    <p class="muted" style="margin:0;font-size:13px">${t('ad.code.once')}</p>
    <div class="msg" data-msg="welcome"></div>
    ${s.phone ? '' : `<p class="muted" style="margin:0;font-size:13px">${t('ad.acc.noPhone')}</p>`}
    <div class="acts"><a class="b b--or b--s" data-wa="welcome" href="#" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} ${t('ad.dw.sendWa')}</a><button class="b b--s" type="button" data-copy="welcome">${icon('copy', { size: 16 })} ${t('ad.copy')}</button></div>`,
  );
  bindMsgs(dw, s.phone, { welcome: (l) => welcomeText(s, l, code) }, { pref, key: app?.id || s.id });
}

/** Ajouter un étudiant sans inscription (payé directement sur WhatsApp, par exemple). */
function addStudentDrawer() {
  const dw = drawer(
    t('ad.st2.add'),
    `${drawerHead(icon('user', { size: 14 }) + ' ' + t('ad.nav.students'), t('ad.st2.add'))}
    <form id="nsf" class="ac-form" novalidate>
      <label class="lbl">${t('ad.f.name')}<input class="in" name="name" required maxlength="80"></label>
      <label class="lbl">${t('ad.f.wa')}<input class="in" name="phone" inputmode="tel" dir="ltr" maxlength="30"></label>
      <label class="lbl">${t('ad.f.email')}<input class="in" name="email" type="email" dir="ltr" maxlength="120"></label>
      <fieldset class="ac-tracks"><legend>${t('ad.f.formation')}</legend>
        ${['both', 'creative', 'ia'].map((f, i) => `<label class="ac-tr" data-fm="${f === 'both' ? 'creative' : f}"><input type="radio" name="formation" value="${f}"${i ? '' : ' checked'}><span><b>${esc(fmLabel(f, true))}</b></span></label>`).join('')}
      </fieldset>
      <p class="muted" style="font-size:13px">${t('ad.st2.addHint')}</p>
      <p class="login-err" id="nserr" role="alert"></p>
      <div class="acts"><button class="b b--or" type="submit">${t('ad.st2.create')}</button><button class="b" type="button" data-x>${t('ad.fq.cancel')}</button></div>
    </form>`,
  );
  const f = $('#nsf', dw.dw);
  f.elements.name.focus();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f).entries());
    if (String(v.name).trim().length < 2 || (!String(v.phone).trim() && !String(v.email).trim())) return ($('#nserr', dw.dw).textContent = t('ad.st2.need'));
    const r = await act(() => api('POST', 'admin/students', v));
    if (!r) return;
    dw.dispose();
    await reload().catch(() => {});
    viewStudents();
    openAccess(r.student, r.code);
  });
}

function viewStudents() {
  const d = D;
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
      : `<div class="acts">${accBtn(s, full)}<button class="b b--s" data-send="${esc(s.id)}" type="button" ${full ? '' : `aria-label="${esc(t('ad.code.new'))}" title="${esc(t('ad.code.new'))}"`}>${icon('whatsapp', { size: 15 })}${full ? ` ${t('ad.code.new')}` : ''}</button><button class="b b--s ${s.active ? 'b--danger' : 'b--ok'}" data-act="${esc(s.id)}" type="button">${t(s.active ? 'ad.st.suspend' : 'ad.st.reactivate')}</button><button class="b b--s b--danger b--i" data-del="${esc(s.id)}" type="button" aria-label="${esc(t('ad.st2.del'))}" title="${esc(t('ad.st2.del'))}">${icon('x', { size: 15 })}</button></div>`;
  const code = (s) => (s.protected ? `<span class="muted" title="${esc(t('ad.st.protectedHint'))}">${lock}</span>` : `<span class="muted" title="${esc(t('ad.code.hidden'))}" dir="ltr">HA-••••-••••</span>`);
  const access = (s) => {
    if (s.demo) return '<small class="muted">—</small>';
    const tr = S.accessOf(s);
    const chips = tr.length ? tr.map((x) => `<span class="fm" data-fm="${x}">${esc(t(`ad.fm.${x}`))}</span>`).join(' ') : `<span class="chip chip--off">${t('ad.ac.none')}</span>`;
    const until = s.protected || !s.expiresAt ? '' : `<br><small class="${S.isExpired(s) ? 'ac-exp' : 'muted'}">${t(S.isExpired(s) ? 'ad.ac.expired' : 'ad.ac.untilShort', { d: esc(fmtDate(s.expiresAt, { day: '2-digit', month: 'short', year: 'numeric' })) })}</small>`;
    return `<span class="ac-chips">${chips}</span>${until}`;
  };
  const accBtn = (s, full) =>
    s.protected || s.demo ? '' : `<button class="b b--s" data-acc="${esc(s.id)}" type="button" ${full ? '' : `aria-label="${esc(t('ad.ac.btn'))}" title="${esc(t('ad.ac.btn'))}"`}>${icon('key', { size: 15 })}${full ? ` ${t('ad.ac.btn')}` : ''}</button>`;
  shell(
    '#/etudiants',
    `<div class="ph-h"><div><h1>${t('ad.nav.students')}</h1><p>${t('ad.st.lead', { n: fmtNum(rows.filter((r) => r.s.active).length) })}</p></div><button class="b b--or b--s" id="addst" type="button">${icon('plus', { size: 16 })} ${t('ad.st2.add')}</button></div>
    <div class="card tbl-wrap scroll-x"><table class="tbl"><thead><tr><th>${t('ad.st.th.student')}</th><th>${t('ad.st.th.progress')}</th><th>${t('ad.st.th.level')}</th><th>${t('ad.st.th.streak')}</th><th>${t('ad.st.th.last')}</th><th>${t('ad.st.th.access')}</th><th>${t('ad.st.th.code')}</th><th><span class="sr">${t('ad.st.th.actions')}</span></th></tr></thead><tbody>${rows
      .map(
        ({ s, p, lastDay, xp, streak }) => `<tr${s.protected ? ' class="is-prot"' : ''}><td><b>${esc(stuName(s))}</b>${flags(s)}<br>${who(s)}</td><td><div class="meter"><i style="width:${p * 100}%"></i></div><small class="muted">${pct(p)}</small></td><td>${esc(lvName(xp))}<br><small class="muted">${fmtNum(xp)} XP</small></td><td>🔥 ${fmtNum(streak)}</td><td>${lastDay ? esc(fmtD(lastDay)) : '—'}</td><td>${access(s)}</td><td>${code(s)}</td><td>${acts(s, false)}</td></tr>`,
      )
      .join('')}</tbody></table></div>
    <div class="stu-cards">${rows
      .map(
        ({ s, p, xp, streak }) => `<div class="card stu-card${s.protected ? ' is-prot' : ''}"><div class="stu-h"><b>${esc(stuName(s))}</b><span>${flags(s)}</span></div>${s.protected ? who(s) : ''}<p class="stu-ac">${access(s)}</p><div class="meter"><i style="width:${p * 100}%"></i></div><small class="muted">${pct(p)} · ${esc(lvName(xp))} · 🔥 ${fmtNum(streak)}</small>${acts(s, true)}</div>`,
      )
      .join('')}</div>`,
  );
  $('#addst').addEventListener('click', addStudentDrawer);
  $$('[data-send]').forEach((b) => b.addEventListener('click', () => newCode(d.students.find((x) => x.id === b.dataset.send))));
  $$('[data-del]').forEach((b) =>
    b.addEventListener('click', async () => {
      const s = d.students.find((x) => x.id === b.dataset.del);
      if (!s || s.protected || !confirm(t('ad.st2.delC', { name: stuName(s) }))) return;
      if (!(await act(() => api('DELETE', `admin/students/${enc(s.id)}`), t('ad.st2.deleted')))) return;
      await reload().catch(() => {});
      viewStudents();
    }),
  );
  $$('[data-acc]').forEach((b) =>
    b.addEventListener('click', () => {
      const s = d.students.find((x) => x.id === b.dataset.acc);
      if (s && !s.protected) editAccess(s);
    }),
  );
  $$('[data-act]').forEach((b) =>
    b.addEventListener('click', async () => {
      const s = d.students.find((x) => x.id === b.dataset.act);
      if (!s || s.protected) return;
      if (!(await act(() => api('PATCH', `admin/students/${enc(s.id)}`, { active: !s.active })))) return;
      toast(t(s.active ? 'ad.st.suspended' : 'ad.st.reactivated'));
      await reload().catch(() => {});
      viewStudents();
    }),
  );
}

/** Formations ouvertes et durée d'accès d'un étudiant (pack du formulaire appliqué à la validation). */
function editAccess(s) {
  const app = D.applications.find((a) => a.id === s.appId);
  const tr = S.accessOf(s);
  const ymd = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
  const html = `${drawerHead(icon('key', { size: 14 }) + ' ' + t('ad.ac.k'), t('ad.ac.title', { name: stuName(s) }))}
    <form id="acf" class="ac-form">
      ${app && fmOf(app) ? `<p class="muted">${t('ad.ac.pack', { p: esc(fmLabel(fmOf(app), true)) })}</p>` : ''}
      <fieldset class="ac-tracks"><legend>${t('ad.ac.tracks')}</legend>
        ${S.TRACK_IDS.map((x) => `<label class="ac-tr" data-fm="${x}"><input type="checkbox" name="tr" value="${x}"${tr.includes(x) ? ' checked' : ''}><span>${icon(x === 'ia' ? 'sparkles' : 'film', { size: 18 })}<b>${esc(t(`track.${x}`))}</b></span></label>`).join('')}
      </fieldset>
      <label class="lbl">${t('ad.ac.until')}<input class="in" type="date" name="until" value="${ymd(s.expiresAt)}" dir="ltr"></label>
      <p class="muted ac-state">${S.isExpired(s) ? `<span class="ac-exp">${t('ad.ac.expired', { d: esc(fmtDate(s.expiresAt, { dateStyle: 'long' })) })}</span>` : ''}</p>
      <div class="acts"><button class="b b--s" type="button" id="ac-plus">${icon('plus', { size: 15 })} ${t('ad.ac.plus')}</button></div>
      <p class="muted" style="font-size:13px">${t('ad.ac.hint')}</p>
      <div class="acts"><button class="b b--or" type="submit">${t('ad.ac.save')}</button><button class="b" type="button" data-x>${t('ad.fq.cancel')}</button></div>
    </form>`;
  const dw = drawer(t('ad.ac.title', { name: stuName(s) }), html);
  const f = $('#acf', dw.dw);
  $('#ac-plus', dw.dw).addEventListener('click', () => {
    const base = Math.max(Date.now(), Date.parse(f.elements.until.value || 0) || 0);
    f.elements.until.value = new Date(base + S.ACCESS_DAYS * 864e5).toISOString().slice(0, 10);
  });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tracks = $$('input[name="tr"]:checked', f).map((i) => i.value);
    const body = { access: tracks, ...(f.elements.until.value ? { expiresAt: f.elements.until.value } : {}) };
    if (!(await act(() => api('PATCH', `admin/students/${enc(s.id)}`, body), t('ad.ac.saved')))) return;
    dw.dispose();
    await reload().catch(() => {});
    viewStudents();
  });
}

/* ------------------------------------------------------------------ */
/* En-tête d'une formation (Programme, Ressources)                      */
/* ------------------------------------------------------------------ */

function trackHead(id, stats) {
  const tr = trackOf(id);
  const mods = coreModulesOf(id);
  return `<header class="trh" data-track="${id}" style="--t:${tr.color}">
    <span class="trh-i">${icon(tr.icon, { size: 26 })}</span>
    <div class="trh-t"><p class="trh-k" dir="ltr">${modCode(mods[0])} – ${modCode(mods[mods.length - 1])}</p><h2>${t(`track.${id}`)}</h2>${arLine(tr.ar)}<p class="trh-p">${esc(tr.pitch)}</p></div>
    <dl class="trh-s">${stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
  </header>`;
}

/* ------------------------------------------------------------------ */
/* Ressources : fichiers de l'équipe (manifeste) + prompts du programme */
/* ------------------------------------------------------------------ */

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
/** Ressource déposée depuis l'espace équipe (serveur). */
function srvItem(x) {
  const kind = KIND[x.kind] ? x.kind : 'file';
  const href = x.kind === 'link' ? safeUrl(x.url) : x.url ? siteUrl(x.url) : '';
  return { kind, title: x.title || x.name || t(`ad.rs.kind.${kind}`), href, file: x.name || '', size: Number(x.size) || 0, text: x.text || '', lang: ['fr', 'en', 'ar'].includes(x.lang) ? x.lang : null, builtin: false, srv: true, id: x.id, raw: x };
}
function itemsOf(l) {
  const raw = MANI?.lessons?.[l.id];
  const team = (Array.isArray(raw) ? raw : []).map(normItem).filter(Boolean);
  const srv = (D?.res?.[l.id] || []).map(srvItem);
  const built = (l.res || []).filter((r) => r && r.text).map((r) => ({ kind: 'prompt', title: r.title || t('ad.rs.kind.prompt'), text: r.text, href: '', size: 0, lang: null, builtin: true }));
  return [...srv, ...team, ...built];
}
const kindOfFile = (name) => {
  const e = String(name).split('.').pop().toLowerCase();
  return e === 'pdf' ? 'pdf' : ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(e) ? 'image' : ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'opus'].includes(e) ? 'audio' : ['mp4', 'mov', 'webm'].includes(e) ? 'video' : 'file';
};
const MAX_UP = 25 * 1024 * 1024;
/** Enregistre la liste des ressources (serveur) d'une leçon. */
async function saveRes(lessonId, items) {
  const r = await act(() => api('PUT', `admin/res/${enc(lessonId)}`, { items }));
  if (r) D.res[lessonId] = r.items;
  return r;
}
/** Dépose des fichiers sur une leçon (25 Mo max chacun), avec la progression. */
async function addFiles(l, files, lg, out) {
  const items = [...(D.res[l.id] || [])];
  let n = 0;
  for (const f of files) {
    if (f.size > MAX_UP) {
      toast(`${icon('bell', { size: 16 })} ${esc(t('ad.rs2.tooBig', { name: f.name }))}`, 4200);
      continue;
    }
    if (out) out.textContent = t('ad.rs2.sending', { name: f.name, p: '0 %' });
    try {
      const r = await upload(`admin/files?name=${enc(f.name)}&lesson=${enc(l.id)}&scope=members`, f, (p) => out && (out.textContent = t('ad.rs2.sending', { name: f.name, p: pct(p) })));
      items.push({ kind: kindOfFile(f.name), title: f.name.replace(/\.[^.]+$/, ''), file: r.file.id, lang: lg || null });
      n++;
    } catch (e) {
      toast(`${icon('bell', { size: 16 })} ${esc(f.name)} : ${esc(errText(e))}`, 4200);
    }
  }
  if (out) out.textContent = '';
  if (n && (await saveRes(l.id, items))) toast(`${icon('check', { size: 16 })} ${t('ad.rs2.added', { n: fmtNum(n) })}`);
}
/** Prompt ou lien d'une leçon (ajout ou modification). */
function resDrawer(l, kind, item = null) {
  const isP = kind === 'prompt';
  const dw = drawer(
    t(isP ? 'ad.rs2.prompt' : 'ad.rs2.link'),
    `${drawerHead(`${icon(isP ? 'chat' : 'link', { size: 14 })} ${esc(l.title)}`, t(item ? (isP ? 'ad.rs2.editP' : 'ad.rs2.editL') : isP ? 'ad.rs2.prompt' : 'ad.rs2.link'))}
    <form id="rsf" class="fq-form" novalidate>
      <label class="lbl">${t('ad.rs2.title')}<input class="in" name="title" maxlength="200" value="${esc(item?.title || '')}" dir="auto" required></label>
      ${isP ? `<label class="lbl">${t('ad.rs2.text')}<textarea class="in" name="text" rows="10" maxlength="8000" dir="auto" required>${esc(item?.text || '')}</textarea></label>` : `<label class="lbl">${t('ad.rs2.url')}<input class="in" name="url" type="url" maxlength="1000" dir="ltr" placeholder="https://" value="${esc(item?.url || '')}" required></label>`}
      <label class="lbl">${t('ad.rs2.lang')}<select class="in" name="lang"><option value="">${t('ad.rs2.allLangs')}</option>${['fr', 'en', 'ar'].map((x) => `<option value="${x}"${item?.lang === x ? ' selected' : ''}>${x.toUpperCase()}</option>`).join('')}</select></label>
      <p class="login-err" id="rserr" role="alert"></p>
      <div class="acts"><button class="b b--or" type="submit">${t('ad.fq.save')}</button><button class="b" type="button" data-x>${t('ad.fq.cancel')}</button></div>
    </form>`,
  );
  const f = $('#rsf', dw.dw);
  f.elements.title.focus();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f).entries());
    if (!String(v.title).trim() || (isP ? !String(v.text).trim() : !/^https:\/\/\S+$/i.test(String(v.url).trim()))) return ($('#rserr', dw.dw).textContent = t(isP ? 'ad.rs2.needP' : 'ad.rs2.needL'));
    const it = { kind, title: v.title.trim(), lang: v.lang || null, ...(isP ? { text: v.text.trim() } : { url: v.url.trim() }) };
    const items = [...(D.res[l.id] || [])];
    const i = item ? items.findIndex((x) => x.id === item.id) : -1;
    if (i >= 0) items[i] = { ...it, id: item.id };
    else items.push(it);
    if (await saveRes(l.id, items)) {
      dw.dispose();
      toast(`${icon('check', { size: 16 })} ${t('ad.fq.saved')}`);
      viewRes();
    }
  });
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
  else if (!it.srv) meta.push(`<span class="rs-bi">GitHub</span>`);
  const open = it.href
    ? `<a class="b b--s" href="${esc(it.href)}" target="_blank" rel="noopener"${it.kind === 'file' ? ' download' : ''}>${icon(it.kind === 'file' ? 'download' : 'arrow-up', { size: 15 })} ${t(it.kind === 'file' ? 'ad.rs.download' : 'ad.rs.open')}</a>`
    : '';
  return `<li class="rs-it" style="--k:${k.c}" data-key="${key}">
    <span class="rs-ii">${icon(k.ic, { size: 18 })}</span>
    <div class="rs-im"><b dir="auto">${esc(it.title)}</b><small>${meta.join(' · ')}</small></div>
    <div class="rs-ia">${it.srv ? `${it.kind === 'prompt' || it.kind === 'link' ? `<button class="b b--s b--i" type="button" data-ed aria-label="${esc(t('ad.fq.edit'))}" title="${esc(t('ad.fq.edit'))}">${icon('pen', { size: 15 })}</button>` : ''}<button class="b b--s b--danger b--i" type="button" data-rm aria-label="${esc(t('ad.fq.delete'))}" title="${esc(t('ad.fq.delete'))}">${icon('x', { size: 15 })}</button>` : ''}${pv ? `<button class="b b--s" type="button" data-pv aria-expanded="false">${icon('eye', { size: 15 })} <span>${t('ad.rs.preview')}</span></button>` : ''}${it.kind === 'prompt' && it.text ? `<button class="b b--s" type="button" data-cp>${icon('copy', { size: 15 })} ${t('ad.copy')}</button>` : ''}${open}</div>
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
        <label class="b b--or b--s rs-up">${icon('plus', { size: 15 })} ${t('ad.rs2.files')}<input type="file" multiple data-up="${esc(l.id)}" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp3,.m4a,.wav,.ogg,.mp4,.mov,.txt,.md,.csv,.json,.zip,.docx,.xlsx,.pptx,.srt"></label>
        <button class="b b--s" type="button" data-addp="${esc(l.id)}">${icon('chat', { size: 15 })} ${t('ad.rs2.prompt')}</button>
        <button class="b b--s" type="button" data-addl="${esc(l.id)}">${icon('link', { size: 15 })} ${t('ad.rs2.link')}</button>
        <label class="rs-uplang">${t('ad.rs2.lang')}<select class="in" data-uplang="${esc(l.id)}"><option value="">${t('ad.rs2.allLangs')}</option><option value="fr">FR</option><option value="en">EN</option><option value="ar">AR</option></select></label>
        <span class="rs-prog muted" data-prog="${esc(l.id)}" aria-live="polite"></span>
      </div>
      ${items.length ? `<ul class="rs-items">${items.map((it, i) => itemRow(it, `${l.id}:${i}`)).join('')}</ul>` : `<p class="rs-empty">${icon('box', { size: 18 })}<span>${t('ad.rs.empty')}</span></p>`}
    </div>
  </details>`;
}

function viewRes() {
  if (MANI === undefined) {
    shell('#/ressources', `<div class="ph-h"><div><h1>${t('ad.nav.res')}</h1><p>${t('ad.rs.lead')}</p></div></div><p class="rs-status">${icon('repeat', { size: 16 })}<span>${t('ad.rs.loading')}</span></p>`);
    loadManifest().then(() => {
      if (location.hash.startsWith('#/ressources') && D) viewRes();
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
  $('#rsr').addEventListener('click', async () => {
    MANI = undefined;
    await Promise.all([loadManifest(true), reload().catch(() => {})]);
    if (location.hash.startsWith('#/ressources')) viewRes();
  });
  main.addEventListener('change', async (e) => {
    const inp = e.target.closest('input[data-up]');
    if (!inp || !inp.files?.length) return;
    const l = LESSONS.find((x) => x.id === inp.dataset.up);
    const lg = $(`[data-uplang="${CSS.escape(l.id)}"]`, main)?.value || '';
    rsOpen.add(l.id);
    await addFiles(l, [...inp.files], lg, $(`[data-prog="${CSS.escape(l.id)}"]`, main));
    viewRes();
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
    const ad = e.target.closest('[data-addp], [data-addl]');
    if (ad) {
      const l = LESSONS.find((x) => x.id === (ad.dataset.addp || ad.dataset.addl));
      rsOpen.add(l.id);
      return resDrawer(l, ad.dataset.addp ? 'prompt' : 'link');
    }
    const li = e.target.closest('.rs-it');
    if (!li) return;
    const it = rsItems.get(li.dataset.key);
    if (!it) return;
    if (e.target.closest('[data-cp]')) return copy(it.text);
    const lid = li.dataset.key.split(':')[0];
    if (e.target.closest('[data-ed]') && it.srv) return resDrawer(LESSONS.find((x) => x.id === lid), it.kind, it.raw);
    if (e.target.closest('[data-rm]') && it.srv) {
      if (!confirm(t('ad.rs2.rmC', { t: it.title }))) return;
      (async () => {
        const items = (D.res[lid] || []).filter((x) => x.id !== it.id);
        if (!(await saveRes(lid, items))) return;
        if (it.raw.file) await api('DELETE', `admin/files/${enc(it.raw.file)}`).catch(() => {});
        toast(`${icon('check', { size: 16 })} ${t('ad.fq.deleted')}`);
        viewRes();
      })();
      return;
    }
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

/** État de la voix off d'une leçon : ta voix publiée, voix clonée, ou aucune. */
const voiceOf = (l) => (l.own ? 'own' : l.audio ? 'clone' : 'none');

function scriptText(l) {
  const steps = plan(l);
  const head = `${modCode(l.module)} · ${l.title}`;
  return `${head}\n${'='.repeat(head.length)}\n${t('ad.sd.duration', { d: fmtMin(lessonDuration(l)) })}\n\n${steps
    .map((s, i) => `[${fmtMin(s.t)} → ${fmtMin(s.t + s.d)}] ${t('ad.sd.scene', { n: i + 1 })} (${s.sc.type})\n${s.sc.say || '—'}`)
    .join('\n\n')}\n`;
}

function viewStudio(id) {
  const cur = findLesson(id || 'm1-l3') || findLesson(LESSONS[0].id);
  const l = cur.lesson;
  const steps = plan(l);
  const vs = voiceOf(l);
  const playerSrc = `../motion/player.html?id=${enc(l.id)}${l.audio ? '&audio=1' : ''}`;
  shell(
    '#/studio',
    `<div class="ph-h"><div><h1>${t('ad.nav.studio')}</h1><p>${t('ad.vx.lead')}</p></div><button class="b b--s" id="allscript" type="button">${icon('doc', { size: 16 })} ${t('ad.sd.all')}</button></div>
    <div class="studio">
      <section class="card"><div class="st-list">${['creative', 'ia']
        .map(
          (tid) =>
            `<p class="st-tr" style="--t:${trackOf(tid).color}">${icon(trackOf(tid).icon, { size: 15 })}${t(`track.${tid}`)}</p>${modulesOf(tid)
              .map(
                (m) =>
                  `<h4><span dir="ltr">${modCode(m)}</span> ${esc(m.title)}</h4>${m.lessons.map((x) => `<button type="button" data-l="${esc(x.id)}" ${x.id === l.id ? 'aria-current="true"' : ''}><i class="${{ own: 'ok', clone: 'loc', none: '' }[voiceOf(x)]}"></i>${esc(x.title)}</button>`).join('')}`,
              )
              .join('')}`,
        )
        .join('')}</div><p class="muted st-legend"><span><i class="ok"></i>${t('ad.vx.lgOwn')}</span><span><i class="loc"></i>${t('ad.vx.lgClone')}</span><span><i></i>${t('ad.vx.lgNone')}</span></p></section>
      <section style="display:grid;gap:14px;min-width:0">
        <div class="card" style="display:grid;gap:12px">
          <div class="st-head"><div><p class="card-k" style="color:${cur.module.color || 'var(--gold-300)'};margin:0 0 4px"><span dir="ltr">${modCode(cur.module)}</span> · ${t(`track.${cur.module.track}`)}</p><h2 style="font-size:22px">${esc(l.title)}</h2></div><span class="muted st-dur">${plural('scene', steps.length)} · <span dir="ltr">${fmtMin(lessonDuration(l))}</span></span></div>
          <div class="st-player"><iframe id="sp" src="${playerSrc}" title="${esc(t('ad.sd.iframe'))}" allow="autoplay; fullscreen"></iframe><div class="countdown" id="cd" hidden></div></div>
          <div class="telep" aria-live="polite"><span class="card-k" style="margin:0">${t('ad.sd.now')}</span><p id="telet" dir="auto">${esc(steps[0]?.sc.say || '—')}</p></div>
          <div class="st-rec">
            <span class="chip ${vs === 'own' ? 'chip--ok' : vs === 'clone' ? 'chip--or' : ''}">${icon('mic', { size: 14 })} ${t(`ad.vx.state.${vs}`)}</span>
            <button class="b b--or" id="rec" type="button">${icon('mic', { size: 18 })} ${t('ad.sd.rec')}</button>
            <button class="b" id="stp" type="button" hidden><span class="rec-dot"></span> ${t('ad.sd.stop')}</button>
            <label class="b rs-up">${icon('arrow-up', { size: 16 })} ${t('ad.vx.memo')}<input type="file" id="memo" accept="audio/*,.m4a,.mp3,.wav,.aac,.ogg,.webm,.opus"></label>
            ${vs === 'own' ? `<button class="b b--s b--danger" id="unpub" type="button">${t('ad.vx.unpub')}</button>` : ''}
            <span class="muted" id="recs" style="font-size:13px"></span>
          </div>
          <div id="cut" class="vx" hidden>
            <div class="vx-h"><p class="card-k" style="margin:0">${icon('layers', { size: 14 })} ${t('ad.vx.cutT')}</p><audio id="aud" controls preload="auto"></audio></div>
            <p class="muted vx-x">${t('ad.vx.cutX')}</p>
            <div class="vx-wave" id="wavebox"><canvas id="wave" aria-hidden="true"></canvas><i class="vx-ph" id="ph" hidden></i><div id="marks"></div></div>
            <ol class="vx-list" id="vxl"></ol>
            <div class="acts">
              <button class="b b--s" id="auto" type="button">${icon('wand', { size: 15 })} ${t('ad.vx.auto')}</button>
              <button class="b b--s" id="prev" type="button">${icon('play', { size: 15 })} ${t('ad.vx.preview')}</button>
              <button class="b b--or" id="pub" type="button">${icon('globe', { size: 16 })} ${t('ad.vx.publish')}</button>
              <a class="b b--s" id="dl">${icon('download', { size: 15 })} ${t('ad.vx.dlTake')}</a>
            </div>
            <p class="muted vx-s" id="vxs" aria-live="polite"></p>
          </div>
        </div>
        <section class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px"><p class="card-k" style="margin:0">${t('ad.sd.scripts')}</p><div class="acts"><a class="b b--s" href="#/edition/${esc(l.id)}">${icon('pen', { size: 15 })} ${t('ad.ed.open')}</a><button class="b b--s" id="one" type="button">${icon('download', { size: 15 })} .txt</button></div></div>
          <ol class="say-list" id="say">${steps.map((s) => `<li data-t="${s.t}" data-e="${s.t + s.d}"><small dir="ltr">${fmtMin(s.t)} · ${esc(s.sc.type)}</small><span dir="auto">${esc(s.sc.say || '—')}</span></li>`).join('')}</ol></section>
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
  const telet = $('#telet');
  const hl = (tt) => {
    sayEls.forEach((li, i) => {
      const on = tt >= +li.dataset.t && tt < +li.dataset.e;
      li.classList.toggle('is-cur', on);
      if (on && steps[i].sc.say && telet.textContent !== steps[i].sc.say) telet.textContent = steps[i].sc.say;
    });
  };
  let rec = null;
  let stream = null;
  let previewUrl = '';
  const onMsg = (e) => {
    const m = e.data;
    if (!m || m.type !== 'ha-player' || m.id !== l.id) return;
    if (m.event === 'time' || m.event === 'play' || m.event === 'pause') hl(m.t);
    if (m.event === 'ended' && rec?.state === 'recording') finish();
  };
  addEventListener('message', onMsg);
  stop.push(() => removeEventListener('message', onMsg));
  stop.push(() => stream?.getTracks().forEach((tr) => tr.stop()));
  stop.push(() => previewUrl && URL.revokeObjectURL(previewUrl));

  /* ----- La prise : enregistrement synchronisé ou mémo déposé ----- */
  let take = null;
  const status = (txt) => ($('#vxs').textContent = txt);
  const weights = (synced) => (!synced && l.scenes.every((sc) => sc.say) ? l.scenes.map((sc) => sc.say.length) : steps.map((st) => st.d));
  stop.push(() => {
    if (take) {
      take.audio.pause();
      URL.revokeObjectURL(take.url);
    }
  });
  async function setTake(blob, synced) {
    $('#recs').textContent = t('ad.vx.decoding');
    let dec;
    try {
      dec = await V.decode(blob);
    } catch {
      $('#recs').textContent = t('ad.vx.badFile');
      return;
    }
    if (take) URL.revokeObjectURL(take.url);
    const dur = dec.x.length / dec.sr;
    if (dur < 1.5) return ($('#recs').textContent = t('ad.vx.tooShort'));
    take = { ...dec, dur, blob, synced, url: URL.createObjectURL(blob), audio: $('#aud') };
    take.audio.src = take.url;
    take.cuts = V.autoCuts(take.x, take.sr, weights(synced));
    $('#dl').href = take.url;
    $('#dl').download = `${l.id}-prise.${(blob.type.includes('mp4') && 'm4a') || (blob.type.includes('webm') && 'webm') || String(blob.name || '').split('.').pop() || 'audio'}`;
    $('#cut').hidden = false;
    $('#recs').textContent = t('ad.vx.ready', { d: fmtMin(dur) });
    drawWave();
    paintCuts();
    $('#cut').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }
  const box = $('#wavebox');
  function drawWave() {
    const cv = $('#wave');
    const w = box.clientWidth;
    const h = 96;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = h * dpr;
    cv.style.width = `${w}px`;
    cv.style.height = `${h}px`;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const pk = V.peaks(take.x, Math.max(50, Math.floor(w / 2)));
    const max = Math.max(...pk, 1e-4);
    g.fillStyle = getComputedStyle(box).getPropertyValue('--wave').trim() || '#e0be55';
    pk.forEach((v, i) => {
      const bh = Math.max(1, (v / max) * (h - 8));
      g.fillRect(i * 2, (h - bh) / 2, 1.4, bh);
    });
  }
  const segs = () => V.segments(take.dur, take.cuts);
  function paintCuts() {
    const n = take.cuts.length;
    $('#marks').innerHTML = take.cuts
      .map((c, i) => `<button type="button" class="vx-m" data-i="${i}" role="slider" aria-label="${esc(t('ad.vx.cutL', { a: i + 1, b: i + 2 }))}" aria-valuemin="0" aria-valuemax="${take.dur.toFixed(1)}" aria-valuenow="${c.toFixed(1)}" aria-valuetext="${fmtMin(c)}" style="left:${(c / take.dur) * 100}%"><span>${fmtNum(i + 2)}</span></button>`)
      .join('');
    $('#vxl').innerHTML = segs()
      .map(
        ([a, b], i) => `<li data-i="${i}"><span class="vx-n">${fmtNum(i + 1)}</span><div class="vx-t"><small dir="ltr">${fmtMin(a)} → ${fmtMin(b)} · ${esc(l.scenes[i].type)}</small><span dir="auto">${esc(l.scenes[i].say || '—')}</span></div><div class="vx-a"><button class="b b--s b--i" type="button" data-play="${i}" aria-label="${esc(t('ad.vx.play', { n: i + 1 }))}" title="${esc(t('ad.vx.play', { n: i + 1 }))}">${icon('play', { size: 14 })}</button>${i < n ? `<button class="b b--s b--i" type="button" data-nudge="${i}" data-by="-0.1" aria-label="${esc(t('ad.vx.earlier'))}" title="${esc(t('ad.vx.earlier'))}">−</button><button class="b b--s b--i" type="button" data-nudge="${i}" data-by="0.1" aria-label="${esc(t('ad.vx.later'))}" title="${esc(t('ad.vx.later'))}">+</button>` : ''}</div></li>`,
      )
      .join('');
  }
  const setCut = (i, v) => {
    const lo = (take.cuts[i - 1] ?? 0) + 0.3;
    const hi = (take.cuts[i + 1] ?? take.dur) - 0.3;
    take.cuts[i] = +Math.min(hi, Math.max(lo, v)).toFixed(2);
    paintCuts();
    box.querySelector(`.vx-m[data-i="${i}"]`)?.focus();
  };
  // Glisser une coupe sur la forme d'onde (souris, doigt), ou ← → au clavier
  box.addEventListener('pointerdown', (e) => {
    const m = e.target.closest('.vx-m');
    if (!m) return;
    e.preventDefault();
    const i = +m.dataset.i;
    const r = box.getBoundingClientRect();
    const move = (ev) => {
      take.cuts[i] = Math.min((take.cuts[i + 1] ?? take.dur) - 0.3, Math.max((take.cuts[i - 1] ?? 0) + 0.3, ((ev.clientX - r.left) / r.width) * take.dur));
      const el = box.querySelector(`.vx-m[data-i="${i}"]`);
      el.style.left = `${(take.cuts[i] / take.dur) * 100}%`;
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      setCut(i, take.cuts[i]);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
  box.addEventListener('keydown', (e) => {
    const m = e.target.closest('.vx-m');
    if (!m || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    setCut(+m.dataset.i, take.cuts[+m.dataset.i] + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 0.1));
  });
  // Écouter une scène
  let segEnd = 0;
  const ph = $('#ph');
  $('#aud').addEventListener('timeupdate', (e) => {
    const a = e.target;
    if (!take) return;
    ph.hidden = false;
    ph.style.left = `${(a.currentTime / take.dur) * 100}%`;
    if (segEnd && a.currentTime >= segEnd) {
      a.pause();
      segEnd = 0;
    }
  });
  $('#vxl').addEventListener('click', (e) => {
    const p = e.target.closest('[data-play]');
    if (p) {
      const [a, b] = segs()[+p.dataset.play];
      take.audio.currentTime = a;
      segEnd = b;
      take.audio.play();
      return;
    }
    const nd = e.target.closest('[data-nudge]');
    if (nd) setCut(+nd.dataset.nudge, take.cuts[+nd.dataset.nudge] + Number(nd.dataset.by));
  });
  $('#auto').addEventListener('click', () => {
    take.cuts = V.autoCuts(take.x, take.sr, weights(take.synced));
    paintCuts();
  });
  addEventListener('resize', () => take && drawWave());
  const built = async () => V.build(take.x, take.sr, take.cuts, l.scenes.map((sc) => SCENE_BASE[sc.type] ?? 5));
  $('#prev').addEventListener('click', async () => {
    status(t('ad.vx.building'));
    const b = await built();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(V.wav(b.pcm, b.sr));
    ifr.src = `../motion/player.html?id=${enc(l.id)}&audio=1&autoplay=1&src=${enc(previewUrl)}&d=${b.d.join(',')}`;
    status(t('ad.vx.previewing', { d: fmtMin(b.d.reduce((s2, x) => s2 + x, 0)) }));
    ifr.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });
  $('#pub').addEventListener('click', async () => {
    if (!confirm(t('ad.vx.publishC', { t: l.title }))) return;
    const btn = $('#pub');
    busyBtn(btn, true);
    try {
      status(t('ad.vx.building'));
      const b = await built();
      const mp3 = await V.mp3(b.pcm, b.sr, (p) => status(t('ad.vx.encoding', { p: pct(p) })));
      const up = await upload(`admin/files?name=${enc(`${l.id}-voix.mp3`)}&lesson=${enc(l.id)}&scope=public`, mp3, (p) => status(t('ad.vx.sending', { p: pct(p) })));
      await api('PUT', `admin/voix/${enc(l.id)}`, { file: up.file.id, d: b.d });
      reloadPage(t('ad.vx.published', { t: l.title }));
    } catch (e) {
      busyBtn(btn, false);
      status('');
      toast(`${icon('bell', { size: 16 })} ${esc(errText(e))}`, 4200);
    }
  });
  $('#unpub')?.addEventListener('click', async () => {
    if (!confirm(t('ad.vx.unpubC', { t: l.title }))) return;
    if (await act(() => api('DELETE', `admin/voix/${enc(l.id)}`))) reloadPage(t('ad.vx.unpublished'));
  });
  $('#memo').addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (f) setTake(f, false);
    e.target.value = '';
  });

  /* ----- Enregistrement calé sur l'animation ----- */
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
    if (ifr.src.includes('src=blob')) ifr.src = playerSrc;
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
    const chunks = [];
    const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((x) => MediaRecorder.isTypeSupported?.(x)) || '';
    rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      setTake(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }), true);
      toast(`${icon('mic', { size: 16 })} ${t('ad.sd.toast', { t: esc(l.title) })}`);
    };
    rec.start(250);
    cmd('play');
    $('#rec').hidden = true;
    $('#stp').hidden = false;
    $('#recs').textContent = t('ad.sd.recording');
  });
}

/* ------------------------------------------------------------------ */
/* Programme et réglages                                               */
/* ------------------------------------------------------------------ */

const widgetLabel = (w) => t(['formats', 'outils', 'ratio', 'anatomie', 'hooks', 'cta', 'aida', 'carrousel', 'prompt', 'prompt-image', 'camera', 'metrics', 'prix', 'dm'].includes(w) ? `ad.w.${w}` : 'ad.w.default');

function viewProgramme() {
  const voice = (l) => `<span class="chip${{ own: ' chip--ok', clone: ' chip--or', none: '' }[voiceOf(l)]}">${t(`ad.vx.state.${voiceOf(l)}`)}</span>`;
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
          [t('ad.pg.voiced'), fmtNum(ls_.filter((l) => l.own).length)],
        ])}
        <div class="pg-mods">${mods
          .map(
            (m) => `<section class="card pg-mod" style="--m:${m.color || trackOf(id).color}"><header class="pg-mh"><span class="rs-code" dir="ltr">${modCode(m)}</span><div class="rs-mt"><h3>${esc(m.title)}</h3>${arLine(m.ar)}</div><span class="rs-mc">${plural('lesson', m.lessons.length)}</span><button class="b b--s b--i" type="button" data-medit="${esc(m.id)}" aria-label="${esc(t('ad.ed.module'))}" title="${esc(t('ad.ed.module'))}">${icon('pen', { size: 14 })}</button></header><div class="scroll-x"><table class="tbl prog-tbl"><thead><tr><th>${t('ad.pg.th.lesson')}</th><th>${t('ad.pg.th.duration')}</th><th>${t('ad.pg.th.scenes')}</th><th>${t('ad.pg.th.voice')}</th><th>${t('ad.pg.th.exercise')}</th><th><span class="sr">${t('ad.st.th.actions')}</span></th></tr></thead><tbody>${ls_
              .filter((l) => l.module === m)
              .map(
                (l) => `<tr><td><span class="pg-n">${fmtNum(l.n)}</span><a class="pg-ed" href="#/edition/${esc(l.id)}">${esc(l.title)}</a>${edited('lessons', l.id).length ? ` <span class="chip chip--or pg-mod-c" title="${esc(edited('lessons', l.id).map((x) => x.toUpperCase()).join(' · '))}">${t('ad.ed.edited')}</span>` : ''}</td><td class="pg-num" data-th="${esc(t('ad.pg.th.duration'))}"><span dir="ltr">${fmtMin(lessonDuration(l))}</span></td><td class="pg-num" data-th="${esc(t('ad.pg.th.scenes'))}">${fmtNum(l.scenes.length)}</td><td>${voice(l)}</td><td data-th="${esc(t('ad.pg.th.exercise'))}">${esc(widgetLabel(l.widget))}</td><td><div class="acts"><a class="b b--s b--i" href="#/edition/${esc(l.id)}" aria-label="${esc(t('ad.ed.open'))}" title="${esc(t('ad.ed.open'))}">${icon('pen', { size: 14 })}</a><a class="b b--s b--i" href="../motion/player.html?id=${encodeURIComponent(l.id)}${l.audio ? '&audio=1' : ''}" target="_blank" rel="noopener" aria-label="${esc(t('ad.pg.watch'))}" title="${esc(t('ad.pg.watch'))}">${icon('play', { size: 14 })}</a><a class="b b--s b--i" href="#/studio/${esc(l.id)}" aria-label="${esc(t('ad.pg.toStudio'))}" title="${esc(t('ad.pg.toStudio'))}">${icon('mic', { size: 14 })}</a></div></td></tr>`,
              )
              .join('')}</tbody></table></div></section>`,
          )
          .join('')}</div></section>`;
      })
      .join('')}</div>`,
  );
  $$('[data-medit]').forEach((b) => b.addEventListener('click', () => moduleDrawer(MODULES.find((m) => m.id === b.dataset.medit))));
  gsap()?.from('.trh, .pg-mod', { y: 22, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
}

/* ------------------------------------------------------------------ */
/* Éditeur : tout le texte d'une leçon, dans la langue de l'interface  */
/* (titre, points clés, quiz, atelier, prompts, scènes et narration)   */
/* ------------------------------------------------------------------ */

const LANG_NAME = { fr: 'Français', en: 'English', ar: 'العربية' };
// Champs de scène qui ne sont pas du texte affiché (couleurs, pictogrammes, cadrages, minutage…)
const ED_SKIP = new Set(['type', 'c', 'icon', 'art', 'bg', 'align', 'mode', 'tone', 'style', 'shot', 'mood', 'kind', 'swatch', 'from', 'moves', 'd', 'at', 'id', 'app', 'k', 'r']);
const edLabel = (k) => (typeof k === 'number' ? fmtNum(k + 1) : has(`ad.ed.f.${k}`) ? t(`ad.ed.f.${k}`) : k);
const clone = (x) => JSON.parse(JSON.stringify(x ?? null));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/** Textes d'une scène : [{ path, v }] (chemin dans l'objet de la scène). */
function textFields(sc) {
  const out = [];
  const walk = (v, path) => {
    if (typeof v === 'string') return out.push({ path, v });
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, i]));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!ED_SKIP.has(k)) walk(x, [...path, k]);
  };
  walk(sc, []);
  // La narration d'abord (champ vide à remplir si la scène n'en a pas encore)
  if (typeof sc.say !== 'string') out.push({ path: ['say'], v: '' });
  return out.sort((a, b) => (b.path[0] === 'say') - (a.path[0] === 'say'));
}
/** Écrit une valeur dans un objet de modification (listes complétées par des « null » = inchangé). */
function setPath(root, path, v) {
  let o = root;
  path.forEach((k, i) => {
    if (i === path.length - 1) o[k] = v;
    else {
      if (o[k] == null || typeof o[k] !== 'object') o[k] = typeof path[i + 1] === 'number' ? [] : {};
      o = o[k];
    }
  });
  if (Array.isArray(o)) for (let i = 0; i < o.length; i++) if (o[i] === undefined) o[i] = null;
}
const fieldInput = (v, attrs) => (v.length > 70 || v.includes('\n') ? `<textarea class="in" rows="${Math.min(8, Math.max(2, Math.ceil(v.length / 70)))}" ${attrs}>${esc(v)}</textarea>` : `<input class="in" value="${esc(v)}" ${attrs}>`);
const listRow = (v = '') => `<li class="ed-li"><textarea class="in" rows="2" dir="auto" maxlength="600">${esc(v)}</textarea><div class="ed-ia"><button class="b b--s b--i" type="button" data-up aria-label="${esc(t('ad.fq.up'))}">↑</button><button class="b b--s b--i" type="button" data-down aria-label="${esc(t('ad.fq.down'))}">↓</button><button class="b b--s b--i b--danger" type="button" data-del aria-label="${esc(t('ad.fq.delete'))}">${icon('x', { size: 14 })}</button></div></li>`;
const ansRow = (v = '', ok = false, qi = 0) => `<li class="ed-ans"><label class="ed-ok" title="${esc(t('ad.ed.right'))}"><input type="radio" name="ok-${qi}"${ok ? ' checked' : ''}><span class="sr">${t('ad.ed.right')}</span></label><input class="in" value="${esc(v)}" dir="auto" maxlength="300" placeholder="${esc(t('ad.ed.answer'))}"><button class="b b--s b--i b--danger" type="button" data-del aria-label="${esc(t('ad.fq.delete'))}">${icon('x', { size: 14 })}</button></li>`;
let qSeq = 0;
const quizRow = (q = { q: '', a: ['', ''], ok: 0, why: '' }) => {
  const qi = qSeq++;
  return `<li class="ed-q card"><label class="lbl">${t('ad.ed.question')}<input class="in" data-qq value="${esc(q.q)}" dir="auto" maxlength="400"></label><p class="card-k" style="margin:4px 0 0">${t('ad.ed.answers')}</p><ol class="ed-anss">${q.a.map((a, i) => ansRow(a, i === q.ok, qi)).join('')}</ol><button class="b b--s" type="button" data-addans="${qi}">${icon('plus', { size: 14 })} ${t('ad.ed.addAnswer')}</button><label class="lbl">${t('ad.ed.why')}<textarea class="in" data-qw rows="2" dir="auto" maxlength="800">${esc(q.why || '')}</textarea></label><div class="ed-ia"><button class="b b--s b--i" type="button" data-up aria-label="${esc(t('ad.fq.up'))}">↑</button><button class="b b--s b--i" type="button" data-down aria-label="${esc(t('ad.fq.down'))}">↓</button><button class="b b--s b--danger" type="button" data-del>${icon('x', { size: 14 })} ${t('ad.ed.delQ')}</button></div></li>`;
};
const resRow = (r = { title: '', text: '' }) => `<li class="ed-r card"><label class="lbl">${t('ad.rs2.title')}<input class="in" data-rt value="${esc(r.title)}" dir="auto" maxlength="200"></label><label class="lbl">${t('ad.rs2.text')}<textarea class="in" data-rx rows="5" dir="auto" maxlength="8000">${esc(r.text)}</textarea></label><div class="ed-ia"><button class="b b--s b--i" type="button" data-up aria-label="${esc(t('ad.fq.up'))}">↑</button><button class="b b--s b--i" type="button" data-down aria-label="${esc(t('ad.fq.down'))}">↓</button><button class="b b--s b--danger" type="button" data-del>${icon('x', { size: 14 })} ${t('ad.fq.delete')}</button></div></li>`;

function viewEdit(id) {
  const f = findLesson(id);
  if (!f) {
    location.hash = '#/programme';
    return;
  }
  const l = f.lesson;
  const old = clone(PUB?.edits?.lessons?.[id]?.[lang] || {});
  const isEd = edited('lessons', id).includes(lang);
  const quiz0 = (l.quiz || []).map((q) => ({ q: q.q, a: [...q.a], ok: q.ok, why: q.why || '' }));
  const res0 = (l.res || []).map((r) => ({ title: r.title || '', text: r.text || '' }));
  const sec = (k, title, hint, body) => `<section class="card ed-sec" id="ed-${k}"><header class="ed-sh"><h2>${title}</h2>${hint ? `<p class="muted">${hint}</p>` : ''}</header>${body}</section>`;
  shell(
    '#/programme',
    `<div class="ph-h"><div><p class="card-k" style="color:${f.module.color || 'var(--gold-300)'}"><a href="#/programme">${t('ad.nav.prog')}</a> · <span dir="ltr">${modCode(f.module)}</span> · ${t(`track.${f.module.track}`)}</p><h1>${esc(l.title)}</h1><p>${t('ad.ed.lead')}</p></div>
      <div class="acts"><a class="b b--s" href="../motion/player.html?id=${enc(l.id)}${l.audio ? '&audio=1' : ''}" target="_blank" rel="noopener">${icon('play', { size: 15 })} ${t('ad.pg.watch')}</a><a class="b b--s" href="#/studio/${esc(l.id)}">${icon('mic', { size: 15 })} ${t('ad.pg.toStudio')}</a></div></div>
    <section class="card ed-lang"><span class="chip ${isEd ? 'chip--or' : ''}">${t(isEd ? 'ad.ed.edited' : 'ad.ed.original')}</span><p><b>${t('ad.ed.langNow', { l: LANG_NAME[lang] })}</b> ${t('ad.ed.langHint')}</p>${switcher('ad-lang')}</section>
    <nav class="ed-nav" aria-label="${esc(t('ad.ed.sections'))}">${['titre', 'cles', 'quiz', 'atelier', 'prompts', 'scenes'].map((k) => `<a href="#ed-${k}" data-jump="ed-${k}">${t(`ad.ed.s.${k}`)}</a>`).join('')}</nav>
    <form id="edf" class="ed" novalidate>
      ${sec('titre', t('ad.ed.s.titre'), '', `<label class="lbl">${t('ad.ed.title')}<input class="in" name="title" value="${esc(l.title)}" dir="auto" maxlength="300"></label><label class="lbl">${t('ad.ed.arTitle')}<input class="in" name="ar" value="${esc(l.ar || '')}" dir="rtl" lang="ar" maxlength="300"></label>`)}
      ${sec('cles', t('ad.ed.s.cles'), t('ad.ed.h.cles'), `<ol class="ed-list" data-list="key">${(l.key || []).map((v) => listRow(v)).join('')}</ol><button class="b b--s" type="button" data-add="key">${icon('plus', { size: 14 })} ${t('ad.ed.addPoint')}</button>`)}
      ${sec('quiz', t('ad.ed.s.quiz'), t('ad.ed.h.quiz'), `<ol class="ed-quiz" data-quiz>${quiz0.map((q) => quizRow(q)).join('')}</ol><button class="b b--s" type="button" data-addq>${icon('plus', { size: 14 })} ${t('ad.ed.addQ')}</button>`)}
      ${sec('atelier', t('ad.ed.s.atelier'), t('ad.ed.h.atelier'), `<ol class="ed-list" data-list="todo">${(l.todo || []).map((v) => listRow(v)).join('')}</ol><button class="b b--s" type="button" data-add="todo">${icon('plus', { size: 14 })} ${t('ad.ed.addAction')}</button>`)}
      ${sec('prompts', t('ad.ed.s.prompts'), t('ad.ed.h.prompts'), `<ol class="ed-res" data-res>${res0.map((r) => resRow(r)).join('')}</ol><button class="b b--s" type="button" data-addr>${icon('plus', { size: 14 })} ${t('ad.ed.addPrompt')}</button>`)}
      ${sec(
        'scenes',
        t('ad.ed.s.scenes'),
        t('ad.ed.h.scenes'),
        l.scenes
          .map(
            (sc, i) => `<details class="ed-sc" data-scene="${i}"${i ? '' : ' open'}><summary><span class="vx-n">${fmtNum(i + 1)}</span><b dir="auto">${esc(String(sc.title || sc.text || sc.kicker || sc.label || sc.headline || sc.type).replace(/\*/g, '').slice(0, 90))}</b><small class="muted">${esc(sc.type)}</small></summary><div class="ed-sf">${textFields(sc)
              .map(({ path, v }) => {
                const isSay = path[0] === 'say';
                const label = isSay ? t('ad.ed.f.say') : path.map(edLabel).join(' · ');
                return `<label class="lbl${isSay ? ' ed-say' : ''}">${esc(label)}${fieldInput(v, `data-path='${esc(JSON.stringify(path))}' dir="${isSay ? 'rtl' : 'auto'}"${isSay ? ' lang="ar"' : ''} maxlength="4000"`)}</label>`;
              })
              .join('')}</div></details>`,
          )
          .join(''),
      )}
      <div class="ed-bar"><p class="muted" id="ed-s" aria-live="polite">${t('ad.ed.stars')}</p><div class="acts">${isEd ? `<button class="b b--s b--danger" type="button" id="ed-reset">${t('ad.ed.reset')}</button>` : ''}<button class="b b--or" type="submit">${icon('globe', { size: 16 })} ${t('ad.ed.save')}</button></div></div>
    </form>`,
  );
  const form = $('#edf');
  form.addEventListener('input', () => ($('#ed-s').textContent = t('ad.ed.unsaved')));
  form.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const li = b.closest('li');
    if ('up' in b.dataset && li?.previousElementSibling) li.parentElement.insertBefore(li, li.previousElementSibling);
    else if ('down' in b.dataset && li?.nextElementSibling) li.parentElement.insertBefore(li.nextElementSibling, li);
    else if ('del' in b.dataset && li) li.remove();
    else if (b.dataset.add) $(`[data-list="${b.dataset.add}"]`, form).insertAdjacentHTML('beforeend', listRow());
    else if ('addq' in b.dataset) $('[data-quiz]', form).insertAdjacentHTML('beforeend', quizRow());
    else if ('addr' in b.dataset) $('[data-res]', form).insertAdjacentHTML('beforeend', resRow());
    else if (b.dataset.addans) {
      const ol = $('.ed-anss', b.closest('.ed-q'));
      if (ol.children.length < 6) ol.insertAdjacentHTML('beforeend', ansRow('', false, b.dataset.addans));
    } else return;
    $('#ed-s').textContent = t('ad.ed.unsaved');
  });
  $$('[data-jump]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      $(`#${a.dataset.jump}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }),
  );
  const listOf = (k) => $$(`[data-list="${k}"] textarea`, form).map((x) => x.value.trim()).filter(Boolean);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const st = $('#ed-s');
    // Quiz : une question, au moins deux réponses, une bonne réponse cochée
    const quiz = [];
    for (const q of $$('.ed-q', form)) {
      const answers = $$('.ed-ans', q).map((r) => ({ v: $('input.in', r).value.trim(), ok: $('input[type="radio"]', r).checked })).filter((a) => a.v);
      const qq = $('[data-qq]', q).value.trim();
      if (!qq && !answers.length) continue;
      if (!qq || answers.length < 2 || !answers.some((a) => a.ok)) {
        st.textContent = t('ad.ed.quizBad');
        q.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      quiz.push({ q: qq, a: answers.map((a) => a.v), ok: answers.findIndex((a) => a.ok), why: $('[data-qw]', q).value.trim() });
    }
    const res = $$('.ed-r', form)
      .map((r) => ({ title: $('[data-rt]', r).value.trim(), text: $('[data-rx]', r).value.trim() }))
      .filter((r) => r.title && r.text);
    const patch = old;
    const title = form.elements.title.value.trim();
    const ar = form.elements.ar.value.trim();
    if (title && title !== l.title) patch.title = title;
    if (ar !== (l.ar || '') && ar) patch.ar = ar;
    const key = listOf('key');
    const todo = listOf('todo');
    if (!same(key, l.key || [])) patch.key = key;
    if (!same(todo, l.todo || [])) patch.todo = todo;
    if (!same(quiz, quiz0)) patch.quiz = quiz;
    if (!same(res, res0)) patch.res = res;
    $$('[data-path]', form).forEach((el) => {
      const i = +el.closest('[data-scene]').dataset.scene;
      const path = JSON.parse(el.dataset.path);
      let orig = l.scenes[i];
      path.forEach((k) => (orig = orig?.[k]));
      const v = el.value.trim();
      if (v && v !== (orig ?? '')) setPath((patch.scenes ||= []), [i, ...path], v);
    });
    if (Array.isArray(patch.scenes)) for (let i = 0; i < l.scenes.length && i < patch.scenes.length; i++) if (patch.scenes[i] === undefined) patch.scenes[i] = null;
    if (same(patch, PUB?.edits?.lessons?.[id]?.[lang] || {})) return (st.textContent = t('ad.ed.nothing'));
    st.textContent = t('ad.ed.saving');
    if (await act(() => api('PUT', `admin/edit/lesson/${enc(id)}/${lang}`, { patch }))) reloadPage(t('ad.ed.saved', { t: title || l.title }));
    else st.textContent = '';
  });
  $('#ed-reset')?.addEventListener('click', async () => {
    if (!confirm(t('ad.ed.resetC', { l: LANG_NAME[lang] }))) return;
    if (await act(() => api('DELETE', `admin/edit/lesson/${enc(id)}/${lang}`))) reloadPage(t('ad.ed.resetDone'));
  });
}

/** Titre et présentation d'un module (langue de l'interface). */
function moduleDrawer(m) {
  if (!m) return;
  const old = clone(PUB?.edits?.modules?.[m.id]?.[lang] || {});
  const isEd = edited('modules', m.id).includes(lang);
  const dw = drawer(
    t('ad.ed.module'),
    `${drawerHead(`<span dir="ltr">${modCode(m)}</span> · ${esc(LANG_NAME[lang])}`, t('ad.ed.module'))}
    <form id="mef" class="fq-form" novalidate>
      <label class="lbl">${t('ad.ed.title')}<input class="in" name="title" value="${esc(m.title)}" dir="auto" maxlength="160"></label>
      <label class="lbl">${t('ad.ed.pitch')}<textarea class="in" name="pitch" rows="4" dir="auto" maxlength="600">${esc(m.pitch || '')}</textarea></label>
      <p class="muted" style="font-size:13px">${t('ad.ed.langHint')}</p>
      <div class="acts"><button class="b b--or" type="submit">${t('ad.ed.save')}</button>${isEd ? `<button class="b b--danger" type="button" id="me-reset">${t('ad.ed.reset')}</button>` : ''}<button class="b" type="button" data-x>${t('ad.fq.cancel')}</button></div>
    </form>`,
  );
  const f = $('#mef', dw.dw);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const patch = old;
    for (const k of ['title', 'pitch']) {
      const v = f.elements[k].value.trim();
      if (v && v !== (m[k] || '')) patch[k] = v;
    }
    if (await act(() => api('PUT', `admin/edit/module/${enc(m.id)}/${lang}`, { patch }))) reloadPage(t('ad.ed.savedM'));
  });
  $('#me-reset', dw.dw)?.addEventListener('click', async () => {
    if (confirm(t('ad.ed.resetC', { l: LANG_NAME[lang] })) && (await act(() => api('DELETE', `admin/edit/module/${enc(m.id)}/${lang}`)))) reloadPage(t('ad.ed.resetDone'));
  });
}

function viewSettings() {
  const st = D.settings;
  const of = { creative: 14900, ia: 24900, both: 32900, ...(st.offres || {}) };
  const code = (x) => `<code dir="ltr" style="color:var(--gold-300)">${esc(x)}</code>`;
  shell(
    '#/reglages',
    `<div class="ph-h"><div><h1>${t('ad.nav.settings')}</h1><p>${t('ad.set2.lead')}</p></div></div>
    <div class="set-grid">
      <section class="card set-lang"><p class="card-k">${icon('globe', { size: 14 })} ${t('ad.set.lang')}</p>${switcher('ad-lang ad-lang--wide')}<p class="muted" style="margin:10px 0 0;font-size:13.5px">${t('ad.set.langP')}</p></section>
      <form class="card" id="sf" style="display:grid;gap:12px">
        <p class="card-k">${icon('settings', { size: 14 })} ${t('ad.set2.general')}</p>
        <label class="lbl">${t('ad.set.cohort')}<input class="in" name="cohort" value="${esc(st.cohort)}" maxlength="80"></label>
        <label class="lbl">${t('ad.set.wa')}<input class="in" name="whatsapp" value="${esc(st.whatsapp)}" inputmode="tel" dir="ltr" maxlength="24"></label>
        <fieldset class="set-prices"><legend>${t('ad.set2.prices')}</legend>
          ${['creative', 'ia', 'both'].map((k) => `<label class="lbl">${esc(fmLabel(k, true))}<span class="set-da"><input class="in" name="of-${k}" type="number" min="1" max="10000000" step="100" value="${of[k]}" dir="ltr"><b>DA</b></span></label>`).join('')}
        </fieldset>
        <p class="muted" style="margin:0;font-size:13px">${t('ad.set2.pricesP')}</p>
        <button class="b b--or" type="submit">${t('ad.set.save')}</button>
      </form>
      <form class="card" id="pwf" style="display:grid;gap:12px" novalidate>
        <p class="card-k">${icon('key', { size: 14 })} ${t('ad.set2.security')}</p>
        <p class="muted" style="margin:0;font-size:13.5px">${t('ad.set2.securityP')}</p>
        <label class="lbl">${t('ad.auth.ident')}<input class="in" name="ident" autocomplete="username" dir="ltr" required></label>
        <label class="lbl">${t('ad.set2.pwNow')}<input class="in" name="pw" type="password" autocomplete="current-password" dir="ltr" required></label>
        <label class="lbl">${t('ad.set2.newIdent')}<input class="in" name="newIdent" autocomplete="off" dir="ltr" placeholder="${esc(t('ad.set2.newIdentPh'))}"></label>
        <label class="lbl">${t('ad.setup.pw')}<input class="in" name="npw" type="password" autocomplete="new-password" minlength="10" dir="ltr" required></label>
        <label class="lbl">${t('ad.setup.pw2')}<input class="in" name="npw2" type="password" autocomplete="new-password" dir="ltr" required></label>
        <p class="login-err" id="pwerr" role="alert"></p>
        <button class="b" type="submit">${t('ad.set2.change')}</button>
      </form>
      <section class="card" style="display:grid;gap:10px"><p class="card-k">${icon('doc', { size: 14 })} ${t('ad.set.data')}</p><p class="muted" style="margin:0">${t('ad.set2.dataP')}</p>
        <div class="acts"><button class="b b--s" id="exp" type="button">${icon('download', { size: 15 })} ${t('ad.set.export')}</button></div></section>
      <section class="card"><p class="card-k">${t('ad.set.access')}</p><p class="muted" style="margin:0">${t('ad.set2.accessP', { email: code(S.DEMO_STUDENT.email), code: code(S.DEMO_STUDENT.code) })}</p></section>
      <section class="card set-log"><p class="card-k">${icon('bell', { size: 14 })} ${t('ad.set2.log')}</p>${
        D.audit?.length
          ? `<ul class="act">${D.audit
              .slice(0, 40)
              .map((x) => `<li><span class="dot"></span><span><b>${esc(x.act)}</b>${x.info ? ` <small class="muted" dir="auto">${esc(x.info)}</small>` : ''}<br><small class="muted">${esc(x.who)}</small></span><time datetime="${new Date(x.at).toISOString()}">${esc(fmtDT(new Date(x.at).toISOString()))}</time></li>`)
              .join('')}</ul>`
          : `<p class="muted">${t('ad.ov.none')}</p>`
      }</section>
    </div>`,
  );
  $('#sf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const body = { cohort: f.cohort.value.trim(), whatsapp: f.whatsapp.value.trim(), offres: Object.fromEntries(['creative', 'ia', 'both'].map((k) => [k, Number(f[`of-${k}`].value)])) };
    if (await act(() => api('PUT', 'admin/settings', body))) reloadPage(t('ad.set.saved'));
  });
  $('#pwf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const err = $('#pwerr');
    if (f.npw.value.length < 10) return (err.textContent = t('ad.setup.short'));
    if (f.npw.value !== f.npw2.value) return (err.textContent = t('ad.setup.diff'));
    err.textContent = t('ad.auth.checking');
    try {
      const s0 = await api('POST', 'salt', { ident: f.ident.value.trim() });
      const proof = await derive(f.pw.value, s0.salt, s0.iter);
      const salt = randomSalt();
      const newProof = await derive(f.npw.value, salt);
      await api('POST', 'admin/password', { ident: f.ident.value.trim(), proof, salt, newProof, ...(f.newIdent.value.trim() ? { newIdent: f.newIdent.value.trim() } : {}) });
      e.target.reset();
      err.textContent = '';
      toast(`${icon('check', { size: 16 })} ${t('ad.set2.changed')}`);
    } catch (x) {
      err.textContent = x?.status === 401 ? t('ad.login.bad') : errText(x);
    }
  });
  $('#exp').addEventListener('click', async () => {
    const r = await act(() => api('GET', 'admin/export'));
    if (r) download(`${t('ad.set.file')}-${S.iso()}.json`, JSON.stringify(r, null, 2), 'application/json');
  });
}

/* ------------------------------------------------------------------ */
/* Questions fréquentes : brouillon dans ce navigateur, publication     */
/* par data/faq.json sur GitHub (le Worker met le site à jour)           */
/* ------------------------------------------------------------------ */

const FQ_LANGS = [
  { code: 'fr', label: 'Français', req: true },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];
// Liste en cours : celle du serveur, sinon la liste de base du site (data/faq.json) jusqu'au premier enregistrement
let fqList = null;
let fqAud = 'all';
let fqTest = 'public';
const audChip = (a) => `<span class="chip fq-aud" data-aud="${a}">${icon(a === 'pro' ? 'key' : a === 'both' ? 'users' : 'globe', { size: 12 })} ${t(`ad.fq2.aud.${a}`)}</span>`;
async function faqItems() {
  if (Array.isArray(D.faqAll)) return FAQ.normList(D.faqAll);
  if (!fqList) fqList = await FAQ.base();
  return fqList;
}
/** Enregistre toute la liste sur le serveur : publiée tout de suite pour tout le monde. */
async function faqSave(items, msg) {
  const r = await act(() => api('PUT', 'admin/faq', { items }), msg);
  if (r) {
    D.faqAll = r.items;
    fqList = null;
  }
  return r;
}

async function viewFaq() {
  const all = await faqItems();
  if (location.hash !== '#/faq') return;
  const fromServer = Array.isArray(D.faqAll);
  const items = all.filter((x) => fqAud === 'all' || x.aud === fqAud || (fqAud !== 'all' && x.aud === 'both'));
  const n = (a) => all.filter((x) => x.aud === a).length;
  const missing = (x) => FQ_LANGS.filter((l) => !x.q[l.code] || !x.a[l.code]).map((l) => l.code.toUpperCase());
  shell(
    '#/faq',
    `<div class="ph-h"><div><h1>${t('ad.nav.faq')}</h1><p>${t('ad.fq2.lead')}</p></div>
      <div class="acts"><button class="b b--or" type="button" id="fq-add">${icon('plus', { size: 16 })} ${t('ad.fq.add')}</button></div></div>
    <section class="card fq-pub${fromServer ? '' : ' is-dirty'}" aria-live="polite">
      <span class="fq-pub-i">${icon(fromServer ? 'check' : 'pen', { size: 20 })}</span>
      <div><b>${t(fromServer ? 'ad.fq2.live' : 'ad.fq2.base')}</b><p>${t(fromServer ? 'ad.fq2.liveP' : 'ad.fq2.baseP')}</p></div>
    </section>
    <div class="fq-tabs" role="group" aria-label="${esc(t('ad.fq2.filter'))}">${['all', 'public', 'pro', 'both']
      .map((a) => `<button type="button" data-aud="${a}" aria-pressed="${fqAud === a}">${t(`ad.fq2.tab.${a}`)} <b>${fmtNum(a === 'all' ? all.length : n(a))}</b></button>`)
      .join('')}</div>
    <section class="card fq-test">
      <div><b>${icon('bot', { size: 16 })} ${t('ad.fq.test.t')}</b><p class="muted">${t('ad.fq2.testX')}</p></div>
      <div class="fq-tabs fq-tabs--s" role="group" aria-label="${esc(t('ad.fq.test.t'))}">${['public', 'pro'].map((a) => `<button type="button" data-test="${a}" aria-pressed="${fqTest === a}">${t(`ad.fq2.bot.${a}`)}</button>`).join('')}</div>
      <input class="in" id="fq-try" type="search" placeholder="${esc(t('ad.fq.test.ph'))}" autocomplete="off" dir="auto">
      <p class="fq-try-r" id="fq-try-r" aria-live="polite"></p>
    </section>
    <p class="muted fq-n">${t('ad.fq2.count', { n: fmtNum(all.length), p: fmtNum(n('public') + n('both')), m: fmtNum(n('pro') + n('both')), l: fmtNum(all.filter((x) => x.landing).length) })}</p>
    ${
      items.length
        ? `<ol class="fq-list">${items
            .map((x) => {
              const miss = missing(x);
              const i = all.indexOf(x);
              return `<li class="card fq-row" data-id="${esc(x.id)}">
              <span class="fq-i">${fmtNum(i + 1)}</span>
              <div class="fq-m">
                <p class="fq-tags">${audChip(x.aud)}<span class="chip">${esc(t(`faq.cat.${x.cat}`))}</span>${x.landing ? `<span class="chip chip--or">${icon('globe', { size: 12 })} ${t('ad.fq.onLanding')}</span>` : ''}${x.kw ? `<span class="chip" title="${esc(x.kw)}">${icon('bot', { size: 12 })} ${t('ad.fq.kwN', { n: fmtNum(x.kw.split(',').filter((k) => k.trim()).length) })}</span>` : ''}${miss.length ? `<span class="chip chip--off" title="${esc(t('ad.fq.missingT'))}">${t('ad.fq.missing', { l: miss.join(' · ') })}</span>` : ''}</p>
                <b dir="auto">${esc(FAQ.pickLang(x.q, lang))}</b>
                <p class="fq-a" dir="auto">${esc(FAQ.pickLang(x.a, lang))}</p>
              </div>
              <div class="fq-acts">
                <button class="b b--s b--i" type="button" data-mv="-1" ${i === 0 ? 'disabled' : ''} aria-label="${esc(t('ad.fq.up'))}" title="${esc(t('ad.fq.up'))}"><span class="fq-ar" aria-hidden="true">↑</span></button>
                <button class="b b--s b--i" type="button" data-mv="1" ${i === all.length - 1 ? 'disabled' : ''} aria-label="${esc(t('ad.fq.down'))}" title="${esc(t('ad.fq.down'))}"><span class="fq-ar" aria-hidden="true">↓</span></button>
                <button class="b b--s" type="button" data-ed>${icon('pen', { size: 15 })} ${t('ad.fq.edit')}</button>
                <button class="b b--s b--danger b--i" type="button" data-rm aria-label="${esc(t('ad.fq.delete'))}" title="${esc(t('ad.fq.delete'))}">${icon('x', { size: 16 })}</button>
              </div>
            </li>`;
            })
            .join('')}</ol>`
        : `<section class="card fq-empty"><p class="muted">${t('ad.fq.empty')}</p></section>`
    }`,
  );
  $('#fq-add').addEventListener('click', () => faqDrawer());
  $$('[data-aud]', $('.fq-tabs')).forEach((b) =>
    b.addEventListener('click', () => {
      fqAud = b.dataset.aud;
      viewFaq();
    }),
  );
  // Test de l'assistant : même calcul que l'assistant public (landing) ou pro (membres)
  const tryIt = () => {
    const out = $('#fq-try-r');
    const q = $('#fq-try').value.trim();
    if (!q) return (out.textContent = '');
    const pool = all.filter((x) => (fqTest === 'pro' ? true : x.aud !== 'pro'));
    const found = botMatch(q, [...pool, ...botBuiltins()]);
    const best = found[0];
    if (!best || best.score < BOT_SURE) {
      out.className = 'fq-try-r is-none';
      out.textContent = t('ad.fq.test.none');
      return;
    }
    out.className = 'fq-try-r is-ok';
    const next = found.slice(1, 3).map((x) => `« ${FAQ.pickLang(x.e.q, lang)} » (${fmtNum(x.score, { maximumFractionDigits: 1 })})`);
    out.textContent = `${t('ad.fq.test.ok', { q: FAQ.pickLang(best.e.q, lang), s: fmtNum(best.score, { maximumFractionDigits: 1 }) })}${next.length ? ` · ${t('ad.fq.test.near', { list: next.join(', ') })}` : ''}`;
  };
  $('#fq-try').addEventListener('input', tryIt);
  $$('[data-test]').forEach((b) =>
    b.addEventListener('click', () => {
      fqTest = b.dataset.test;
      $$('[data-test]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      tryIt();
    }),
  );
  $$('.fq-row').forEach((row) => {
    const id = row.dataset.id;
    row.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      const list = await faqItems();
      const i = list.findIndex((x) => x.id === id);
      if (b.dataset.mv) {
        const j = i + Number(b.dataset.mv);
        if (i < 0 || j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        if (await faqSave(list)) viewFaq().then(() => $(`.fq-row[data-id="${CSS.escape(id)}"] [data-mv="${b.dataset.mv}"]`)?.focus());
      } else if ('ed' in b.dataset) faqDrawer(list[i]);
      else if ('rm' in b.dataset) {
        if (!list[i] || !confirm(t('ad.fq.deleteC', { q: FAQ.pickLang(list[i].q, lang) }))) return;
        list.splice(i, 1);
        if (await faqSave(list, t('ad.fq.deleted'))) viewFaq();
      }
    });
  });
}

function faqDrawer(item = null) {
  const it = item || { cat: 'formation', aud: fqAud === 'pro' ? 'pro' : 'public', landing: false, q: {}, a: {} };
  const html = `${drawerHead(icon('help', { size: 14 }) + ' ' + t('ad.nav.faq'), item ? t('ad.fq.editT') : t('ad.fq.addT'))}
    <form id="fqf" class="fq-form" novalidate>
      <fieldset class="fq-audf"><legend>${t('ad.fq2.audL')}</legend>${FAQ.AUD.map((a) => `<label class="fq-audo"><input type="radio" name="aud" value="${a}"${it.aud === a ? ' checked' : ''}><span>${audChip(a)}<small class="muted">${t(`ad.fq2.audH.${a}`)}</small></span></label>`).join('')}</fieldset>
      <div class="fq-row2">
        <label class="lbl">${t('ad.fq.cat')}<select class="in" name="cat">${FAQ.CATS.map((c) => `<option value="${c}"${c === it.cat ? ' selected' : ''}>${esc(t(`faq.cat.${c}`))}</option>`).join('')}</select></label>
        <label class="rs-only fq-land"><input type="checkbox" name="landing"${it.landing ? ' checked' : ''}><span>${t('ad.fq.landing')}</span></label>
      </div>
      <label class="lbl"><span class="fq-kw-l">${icon('bot', { size: 14 })} ${t('ad.fq.kw')}</span><input class="in" name="kw" value="${esc(it.kw || '')}" maxlength="600" placeholder="${esc(t('ad.fq.kw.ph'))}" dir="auto"><small class="muted fq-kw-h">${t('ad.fq.kw.hint')}</small></label>
      ${FQ_LANGS.map(
        (l) => `<fieldset class="fq-lg" lang="${l.code}"${l.dir ? ` dir="${l.dir}"` : ''}>
          <legend><span class="chip">${l.code.toUpperCase()}</span> ${l.label}${l.req ? ` <small>${t('ad.fq.req')}</small>` : ` <small>${t('ad.fq.opt')}</small>`}</legend>
          <label class="lbl">${t('ad.fq.q')}<input class="in" name="q-${l.code}" value="${esc(it.q?.[l.code] || '')}" ${l.req ? 'required' : ''} maxlength="200" dir="auto"></label>
          <label class="lbl">${t('ad.fq.a')}<textarea class="in" name="a-${l.code}" rows="4" ${l.req ? 'required' : ''} maxlength="3000" dir="auto">${esc(it.a?.[l.code] || '')}</textarea></label>
        </fieldset>`,
      ).join('')}
      <p class="login-err" id="fq-err" role="alert"></p>
      <div class="acts">
        <button class="b b--or" type="submit">${t('ad.fq2.save')}</button>
        <button class="b" type="button" data-x>${t('ad.fq.cancel')}</button>
      </div>
    </form>`;
  const dw = drawer(item ? t('ad.fq.editT') : t('ad.fq.addT'), html);
  const f = $('#fqf', dw.dw);
  setTimeout(() => f.elements['q-fr'].focus(), 30);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = (n) => f.elements[n].value.trim();
    if (!v('q-fr') || !v('a-fr')) {
      $('#fq-err', dw.dw).textContent = t('ad.fq.needFr');
      f.elements[v('q-fr') ? 'a-fr' : 'q-fr'].focus();
      return;
    }
    const clean = FAQ.norm({
      id: item?.id || `q${Date.now().toString(36)}`,
      cat: f.elements.cat.value,
      aud: f.elements.aud.value,
      landing: f.elements.landing.checked,
      kw: v('kw'),
      q: Object.fromEntries(FQ_LANGS.map((l) => [l.code, v(`q-${l.code}`)])),
      a: Object.fromEntries(FQ_LANGS.map((l) => [l.code, v(`a-${l.code}`)])),
    });
    const list = await faqItems();
    const i = list.findIndex((x) => x.id === clean.id);
    if (i >= 0) list[i] = clean;
    else list.push(clean);
    if (!(await faqSave(list, t('ad.fq2.saved')))) return;
    dw.dispose();
    viewFaq();
  });
}

/* ------------------------------------------------------------------ */

let routing = 0;
async function route() {
  const ticket = ++routing;
  $$('.drawer, .sheet').forEach((d) => d.remove());
  document.body.style.overflow = '';
  stop.forEach((f) => {
    try {
      f();
    } catch {}
  });
  stop = [];
  if (!D) {
    try {
      await reload();
    } catch (e) {
      if (ticket !== routing) return;
      if (e?.status === 401) {
        const h = await api('GET', 'health').catch(() => null);
        if (ticket !== routing) return;
        return h?.setup ? viewSetup() : viewLogin();
      }
      return viewOffline();
    }
    if (ticket !== routing) return;
  }
  try {
    const msg = sessionStorage.getItem('ha-admin-toast');
    if (msg) {
      sessionStorage.removeItem('ha-admin-toast');
      setTimeout(() => toast(`${icon('check', { size: 16 })} ${esc(msg)}`, 3600), 300);
    }
  } catch {}
  const h = location.hash || '#/';
  if (h === '#/inscriptions') return viewApps();
  if (h === '#/etudiants') return viewStudents();
  if (h === '#/ressources') return viewRes();
  if (h.startsWith('#/studio')) return viewStudio(decodeURIComponent(h.split('/')[2] || ''));
  if (h.startsWith('#/edition/')) return viewEdit(decodeURIComponent(h.split('/')[2] || ''));
  if (h === '#/programme') return viewProgramme();
  if (h === '#/faq') return viewFaq();
  if (h === '#/reglages') return viewSettings();
  return viewOverview();
}
bindSwitchers(document);
initPWA('../sw.js');
addEventListener('hashchange', () => {
  // Les ancres de l'éditeur (#ed-…) ne changent pas de page
  if (!location.hash.startsWith('#ed-')) route();
});
// Nouvelles inscriptions : l'état est relu quand l'onglet redevient visible
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !D || document.querySelector('.drawer, .sheet, #edf, #cut:not([hidden])')) return;
  const before = D.applications.length;
  await reload().catch(() => {});
  if (D && D.applications.length !== before && /^#\/(inscriptions)?$/.test(location.hash || '#/')) route();
});
(document.fonts ? document.fonts.ready : Promise.resolve()).then(route);
