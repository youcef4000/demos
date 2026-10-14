// Hooked Academy — espace étudiant.
// Routes : #/ (accueil) · #/parcours · #/lecon/<id> · #/ressources · #/profil
// Données : assets/js/store.js (localStorage). L'accès est créé par l'équipe dans l'admin.

import { logoInner, markSVG } from './brand.js';
import { icon } from './icons.js';
import * as S from './store.js';
import { MODULES, PARTS, allLessons, findLesson } from '../../data/programme.js';
import { compose, lessonDuration } from '../../motion/engine.js';
import { renderWidget, flashcards } from './widgets.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = () => window.gsap;
const root = $('#root');
const LESSONS = allLessons();
const DUR = Object.fromEntries(LESSONS.map((l) => [l.id, lessonDuration(l)]));
const fmtMin = (s) => (s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')}`);

let me = null;
let stop = []; // nettoyages de la vue courante (animations, écouteurs)

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

export function toast(html, ms = 2600) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  $('#toasts').appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .3s, transform .3s';
    t.style.opacity = '0';
    t.style.transform = 'translateY(-10px)';
    setTimeout(() => t.remove(), 320);
  }, ms);
}

const RING_DEF = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="ring-or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2dfa0"/><stop offset="1" stop-color="#c9a227"/></linearGradient></defs></svg>';
function ring(pct, { size = 100, sw = 9, label = '', color = '' } = {}) {
  const r = 50 - sw / 2 - 1;
  const c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="${r}" stroke-width="${sw}"/><circle class="fg" cx="50" cy="50" r="${r}" stroke-width="${sw}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-off="${(c * (1 - Math.min(1, Math.max(0, pct)))).toFixed(1)}" ${color ? `style="stroke:${color}"` : ''}/></svg>${label}</div>`;
}
function animateRings(scope) {
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.ring .fg[data-off]', scope).forEach((c) => (c.style.strokeDashoffset = c.dataset.off))));
}
function countUp(el, to, dur = 1.2) {
  if (reduce || !gsap()) {
    el.textContent = to;
    return;
  }
  const o = { v: 0 };
  gsap().to(o, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
}

function progressOf(st) {
  const L = st.progress.lessons;
  const done = LESSONS.filter((l) => L[l.id]?.done);
  const quizzes = Object.values(L).filter((x) => typeof x.quiz === 'number');
  const quizAvg = quizzes.length ? quizzes.reduce((s, x) => s + x.quiz, 0) / quizzes.length : 0;
  const minutes = done.reduce((s, l) => s + DUR[l.id], 0);
  let next = LESSONS.find((l) => !L[l.id]?.done) || LESSONS[LESSONS.length - 1];
  if (st.progress.last && !L[st.progress.last]?.done) next = LESSONS.find((l) => l.id === st.progress.last) || next;
  const mods = MODULES.map((m) => {
    const d = m.lessons.filter((l) => L[l.id]?.done).length;
    return { m, done: d, total: m.lessons.length, pct: d / m.lessons.length };
  });
  return { done: done.length, total: LESSONS.length, pct: done.length / LESSONS.length, quizAvg, quizN: quizzes.length, minutes, next, mods };
}

function checkBadges(st) {
  const P = progressOf(st);
  const L = st.progress.lessons;
  const modDone = (id) => MODULES.find((m) => m.id === id).lessons.every((l) => L[l.id]?.done);
  const rules = {
    'premier-pas': P.done >= 1,
    fondations: modDone('m1'),
    structure: modDone('m2'),
    'sans-faute': Object.values(L).some((x) => x.quiz === 1),
    prompteur: modDone('ia1'),
    serie: S.streak(st.progress.days) >= 5,
    ia: modDone('ia2') && modDone('ia3'),
    closer: modDone('ia8'),
    diplome: P.done === P.total,
  };
  Object.entries(rules).forEach(([k, ok]) => {
    if (ok && S.awardBadge(st.id, k)) setTimeout(() => toast(`${icon(S.BADGES[k].icon, { size: 20 })} Badge débloqué : <b>${S.BADGES[k].name}</b>`, 3400), 900);
  });
}

function refreshMe() {
  me = S.currentStudent();
  return me;
}

/* ------------------------------------------------------------------ */
/* Aperçu animé d'une leçon (moteur vidéo, en boucle)                  */
/* ------------------------------------------------------------------ */

function livePreview(box, lessonId, { from = 0, to = 7, scaleTo = box } = {}) {
  const f = findLesson(lessonId);
  if (!f || !gsap()) return () => {};
  const comp = compose(f.lesson, box, { module: f.module, next: f.next });
  const fit = () => {
    const w = scaleTo.getBoundingClientRect().width;
    const h = scaleTo.getBoundingClientRect().height;
    const s = Math.max(w / 1920, h / 1080);
    comp.root.style.transform = `translate(${(w - 1920 * s) / 2}px, ${(h - 1080 * s) / 2}px) scale(${s})`;
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(scaleTo);
  const end = Math.min(to, comp.duration);
  if (reduce) {
    comp.tl.seek(Math.min(end, 2.6), false);
    return () => ro.disconnect();
  }
  let t = from;
  let alive = true;
  let vis = true;
  const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
  io.observe(box);
  let last = performance.now();
  const loop = (now) => {
    if (!alive) return;
    if (vis) {
      t += (now - last) / 1000;
      if (t > end) t = from;
      comp.tl.seek(t, false);
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
/* Connexion                                                           */
/* ------------------------------------------------------------------ */

function viewLogin(msg = '') {
  root.innerHTML = `
  <div class="login">
    <section class="login-box">
      <a class="ha-logo" href="../">${logoInner()}</a>
      <h1>Ton espace <em>étudiant</em></h1>
      <p class="muted">Connecte-toi avec l’e-mail (ou le numéro) et le code d’accès envoyés par l’équipe sur WhatsApp.</p>
      <form class="login-f" id="lf" novalidate style="display:grid;gap:12px">
        <label class="lbl">E-mail ou téléphone<input class="in" name="ident" autocomplete="username" required placeholder="toi@mail.com"></label>
        <label class="lbl">Code d’accès<input class="in" name="code" autocomplete="one-time-code" required placeholder="HA-XXXX-XXXX" style="text-transform:uppercase;font-family:var(--font-mono)"></label>
        <p class="login-err" id="lerr" role="alert">${esc(msg)}</p>
        <button class="b b--or" type="submit">Entrer</button>
      </form>
      <div class="login-demo">Démo : <code>${S.DEMO_STUDENT.email}</code> · code <code>${S.DEMO_STUDENT.code}</code><br><button class="b b--s" id="ldemo" type="button" style="margin-top:10px">Ouvrir le compte démo</button></div>
      <p class="muted" style="font-size:13px">Pas encore inscrit·e ? <a href="../#inscription" style="color:var(--gold-300)">Réserve ta place</a>.</p>
    </section>
    <aside class="login-art" id="lart" aria-hidden="true"></aside>
  </div>`;
  const f = $('#lf');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const r = S.loginStudent(d.ident, d.code);
    if (r.error) {
      $('#lerr').textContent = r.error;
      return;
    }
    me = r.student;
    location.hash = '#/';
    route();
  });
  $('#ldemo').addEventListener('click', () => {
    const r = S.loginStudent(S.DEMO_STUDENT.email, S.DEMO_STUDENT.code);
    me = r.student;
    location.hash = '#/';
    route();
  });
  const art = $('#lart');
  if (getComputedStyle(art).display !== 'none') stop.push(livePreview(art, 'm1-l2', { from: 0, to: 14 }));
}

/* ------------------------------------------------------------------ */
/* Coquille                                                            */
/* ------------------------------------------------------------------ */

const NAV = [
  ['#/', 'home', 'Accueil'],
  ['#/parcours', 'map', 'Parcours'],
  ['#/ressources', 'book', 'Ressources'],
  ['#/profil', 'user', 'Profil'],
];

function shell(active, html) {
  const lv = S.level(me.progress.xp);
  const st = S.streak(me.progress.days);
  root.innerHTML = `${RING_DEF}
  <div class="sh">
    <aside class="side">
      <a class="ha-logo" href="../">${logoInner()}</a>
      ${NAV.map(([h, ic, t]) => `<a class="nv" href="${h}" ${active === h ? 'aria-current="page"' : ''}>${icon(ic, { size: 20 })}${t}</a>`).join('')}
      <div class="side-foot">
        <a class="nv" href="https://hooked-lab.com" target="_blank" rel="noopener">${markSVG({ lab: true, cls: 'side-lab' }).replace('<svg', '<svg width="20" height="20"')}Hooked Lab ↗</a>
        <a class="nv" href="../">${icon('arrow', { size: 20 })}Le site</a>
      </div>
    </aside>
    <div>
      <header class="top">
        <a class="ha-logo" href="#/">${logoInner()}</a>
        <span class="streak" title="Jours d’affilée">${icon('fire', { size: 18 })}${st}</span>
        <span class="xp" title="${esc(lv.name)}">⚡ <b id="xp-v">${me.progress.xp}</b> XP</span>
        <a class="av" href="#/profil" aria-label="Mon profil">${esc((me.firstName || 'H')[0])}</a>
      </header>
      <main class="main" id="main">${html}</main>
    </div>
  </div>
  <nav class="tabs" aria-label="Navigation">${NAV.map(([h, ic, t]) => `<a href="${h}" ${active === h ? 'aria-current="page"' : ''}>${icon(ic, { size: 21 })}${t}</a>`).join('')}</nav>`;
  window.scrollTo(0, 0);
  animateRings(root);
}

function enter(sel = '.main > * > *, .main > *') {
  if (reduce || !gsap()) return;
  gsap().from($$(sel).slice(0, 14), { y: 26, autoAlpha: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, clearProps: 'all' });
}

/* ------------------------------------------------------------------ */
/* Accueil                                                             */
/* ------------------------------------------------------------------ */

const DEFIS = [
  'Écris 3 hooks pour le dernier produit que tu as acheté.',
  'Trouve une pub qui t’a arrêté·e aujourd’hui : quel était son hook ?',
  'Transforme une caractéristique en bénéfice pour un produit de ta cuisine.',
  'Écris un CTA clair pour une crème, avec paiement à la livraison.',
  'Décris une photo produit en prompt : sujet, décor, lumière, cadrage, style.',
  'Analyse une créative dans Hooked Lab et note son hook sur 10.',
  'Rédige un premier message de prospection pour une boutique de ta ville.',
];

function viewHome() {
  const P = progressOf(me);
  const lv = S.level(me.progress.xp);
  const nf = findLesson(P.next.id);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { iso: S.iso(d), l: 'DLMMJVS'[d.getDay()] };
  });
  const set = new Set(me.progress.days);
  const hour = today.getHours();
  const hi = hour < 12 ? 'Sbah el khir' : hour < 18 ? 'Salam' : 'Masa el khir';
  const defi = DEFIS[Math.floor(Date.now() / 864e5) % DEFIS.length];
  const curMod = nf.module.id;
  shell(
    '#/',
    `<div class="dash">
      <section class="card hello">
        <div class="hello-deco">${markSVG()}</div>
        <p class="card-k">${icon('sparkles', { size: 14 })} ${esc(me.cohort || 'Hooked Academy')}</p>
        <h1>${hi}, ${esc(me.firstName)} <span id="wave">👋</span></h1>
        <p class="hello-ar" lang="ar" dir="rtl">${esc(lv.ar)} · ${esc(lv.name)}</p>
        <div class="lvl">
          <div class="lvl-top"><span class="lvl-name">${esc(lv.name)}</span><span class="muted">${lv.next ? `${me.progress.xp} / ${lv.next.xp} XP → ${esc(lv.next.name)}` : 'Niveau maximum'}</span></div>
          <div class="lvl-bar"><i id="lvl-i" style="transform:scaleX(${lv.pct})"></i></div>
        </div>
      </section>

      <a class="card cont" href="#/lecon/${P.next.id}" aria-label="Continuer : ${esc(P.next.title)}">
        <div class="cont-stage" id="cont-stage"></div>
        <span class="cont-play" aria-hidden="true">${icon('play', { size: 22 })}</span>
        <div class="cont-b">
          <p class="card-k">${icon('play', { size: 12 })} ${me.progress.lessons[P.next.id]?.watched ? 'Reprendre' : 'Continuer'}</p>
          <h2>${esc(P.next.title)}</h2>
          <div class="cont-meta"><span class="chip" style="color:${nf.module.color}">Module ${nf.module.n}</span><span>Leçon ${P.next.n} · ${fmtMin(DUR[P.next.id])}</span>${P.next.voice ? '<span class="chip chip--ok">Voix off</span>' : ''}</div>
        </div>
      </a>

      <section class="card overall-c">
        <div class="overall">
          ${ring(P.pct, { size: 116, sw: 10, label: `<b><span id="pct">0</span>%</b>` })}
          <div>
            <p class="card-k">Ta progression</p>
            <h3 style="font-size:22px">${P.done} leçon${P.done > 1 ? 's' : ''} sur ${P.total}</h3>
            <p class="muted" style="margin:4px 0 0">${P.pct >= 1 ? 'Formation terminée : bravo !' : `Encore ${P.total - P.done} leçons de 2 minutes avant le projet final.`}</p>
          </div>
        </div>
      </section>

      <div class="stats">
        <div class="card stat"><i>${icon('check', { size: 18 })}</i><b data-c="${P.done}">0</b><span>leçons terminées</span></div>
        <div class="card stat"><i>${icon('clock', { size: 18 })}</i><b>${Math.round(P.minutes / 60)}</b><span>minutes apprises</span></div>
        <div class="card stat"><i>${icon('target', { size: 18 })}</i><b>${P.quizN ? Math.round(P.quizAvg * 100) : '—'}${P.quizN ? '<small style="font-size:16px">%</small>' : ''}</b><span>réussite aux quiz</span></div>
        <div class="card stat"><i>${icon('trophy', { size: 18 })}</i><b data-c="${me.progress.badges.length}">0</b><span>badges</span></div>
      </div>

      <section class="card week-c">
        <p class="card-k">${icon('fire', { size: 14 })} Série : ${S.streak(me.progress.days)} jour${S.streak(me.progress.days) > 1 ? 's' : ''}</p>
        <h3 style="font-size:19px">Une leçon par jour suffit.</h3>
        <div class="week">${days.map((d) => `<span><i class="${set.has(d.iso) ? 'on' : ''} ${d.iso === S.iso() ? 'today' : ''}">${set.has(d.iso) ? '🔥' : ''}</i>${d.l}</span>`).join('')}</div>
      </section>

      <section style="display:grid;gap:10px">
        <div class="ph-h" style="margin:4px 0 0"><h1 style="font-size:24px">Tes modules</h1><a class="b b--s" href="#/parcours">Voir le parcours</a></div>
        <div class="mods">${P.mods
          .map(
            ({ m, done, total, pct }) => `<a href="#/lecon/${(m.lessons.find((l) => !me.progress.lessons[l.id]?.done) || m.lessons[0]).id}" style="--c:${m.color}" class="${m.id === curMod ? 'is-cur' : ''}">
            ${ring(pct, { size: 54, sw: 10, color: m.color, label: `<b>${String(m.n).padStart(2, '0')}</b>` })}
            <h4>${esc(m.title)}</h4><small>${done}/${total} leçons</small></a>`,
          )
          .join('')}</div>
      </section>

      <section class="card defi">
        <p class="card-k">${icon('bolt', { size: 14 })} Défi du jour</p>
        <p>${esc(defi)}</p>
        <a class="b b--s" href="#/ressources">Ouvrir la bibliothèque de prompts</a>
      </section>

      <a class="card lab-card" href="https://hooked-lab.com" target="_blank" rel="noopener">
        <span class="lc-m">${markSVG({ lab: true })}</span>
        <div><p class="card-k" style="margin-bottom:4px">Hooked Lab</p><h3 style="font-size:19px">Analyse une créative qui marche</h3><p class="muted" style="margin:2px 0 0;font-size:13px">Script, séquences, hook noté, angles marketing ↗</p></div>
      </a>

      <section style="display:grid;gap:10px">
        <div class="ph-h" style="margin:4px 0 0"><h1 style="font-size:24px">Tes badges</h1><a class="b b--s" href="#/profil">Tout voir</a></div>
        <div class="badges">${Object.entries(S.BADGES)
          .slice(0, 6)
          .map(([k, b]) => badgeHTML(k, b))
          .join('')}</div>
      </section>
    </div>`,
  );
  countUp($('#pct'), Math.round(P.pct * 100));
  $$('[data-c]').forEach((e) => countUp(e, +e.dataset.c));
  if (!reduce && gsap()) {
    gsap().fromTo('#lvl-i', { scaleX: 0 }, { scaleX: lv.pct, duration: 1.4, ease: 'expo.out', delay: 0.2 });
    gsap().fromTo('#wave', { rotate: 0 }, { rotate: 18, duration: 0.25, repeat: 5, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
    gsap().from('.dash > *', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity,visibility' });
    gsap().from('.mods a', { x: 40, autoAlpha: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04, delay: 0.3, clearProps: 'transform,opacity,visibility' });
  }
  stop.push(livePreview($('#cont-stage'), P.next.id, { from: 0, to: 9 }));
}

function badgeHTML(k, b) {
  const on = me.progress.badges.includes(k);
  return `<div class="bdg ${on ? 'is-on' : ''}" title="${esc(b.desc)}"><div class="bdg-in"><span class="bdg-ic">${icon(on ? b.icon : 'lock', { size: 24 })}</span><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div></div>`;
}

/* ------------------------------------------------------------------ */
/* Parcours                                                            */
/* ------------------------------------------------------------------ */

function viewMap() {
  const P = progressOf(me);
  const L = me.progress.lessons;
  const partOf = Object.fromEntries(PARTS.map((p) => [p.id, p]));
  let lastPart = '';
  shell(
    '#/parcours',
    `<div class="ph-h"><div><h1>Ton parcours</h1><p>${MODULES.length} modules · ${P.total} leçons · ${P.done} terminées</p></div>${ring(P.pct, { size: 64, sw: 10, label: `<b style="font-family:var(--font-mono);font-size:13px">${Math.round(P.pct * 100)}%</b>` })}</div>
    <div class="map">${MODULES.map((m) => {
      const head = m.part !== lastPart ? `<p class="card-k" style="margin:10px 0 -10px">${esc(`Partie ${partOf[m.part].n} · ${partOf[m.part].title}`)}</p>` : '';
      lastPart = m.part;
      return `${head}<section class="map-mod" style="--c:${m.color}">
        <div class="map-head"><span class="map-n">${String(m.n).padStart(2, '0')}</span><div><h2>${esc(m.title)}</h2><p><span class="ar" lang="ar" dir="rtl">${esc(m.ar)}</span> · ${m.lessons.length} leçons</p></div></div>
        <div class="trail">${m.lessons
          .map((l) => {
            const done = L[l.id]?.done;
            const cur = l.id === P.next.id;
            return `<a class="node ${done ? 'is-done' : ''} ${cur ? 'is-cur' : ''}" href="#/lecon/${l.id}">${cur ? '<span class="node-tag">ICI</span>' : ''}<span class="node-b">${done ? icon('check', { size: 26, stroke: 3 }) : l.n}</span><span class="node-t"><b>${esc(l.title)}</b><span>${fmtMin(DUR[l.id])}${l.voice ? ' · voix off' : ''}${L[l.id]?.quiz != null ? ` · quiz ${Math.round(L[l.id].quiz * 100)} %` : ''}</span></span></a>`;
          })
          .join('')}</div>
      </section>`;
    }).join('')}</div>`,
  );
  if (!reduce && gsap()) {
    $$('.map-mod').forEach((mod) => {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        gsap().from($$('.node', mod), { x: -30, autoAlpha: 0, scale: 0.9, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.07, clearProps: 'all' });
      });
      io.observe(mod);
    });
    const cur = $('.node.is-cur');
    if (cur) setTimeout(() => cur.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
  }
}

/* ------------------------------------------------------------------ */
/* Leçon                                                               */
/* ------------------------------------------------------------------ */

function viewLesson(id) {
  const f = findLesson(id);
  if (!f) {
    location.hash = '#/parcours';
    return;
  }
  const { lesson: l, module: m, prev, next } = f;
  const rec = me.progress.lessons[l.id] || {};
  S.recordLesson(me.id, l.id, { watched: rec.watched || 0 });
  refreshMe();
  const tabs = [
    ['ess', 'L’essentiel'],
    ['ex', 'Exercice'],
    ['quiz', `Quiz (${(l.quiz || []).length})`],
    ...(l.res?.length ? [['res', 'Prompts']] : []),
  ];
  shell(
    '#/parcours',
    `<div class="lesson">
      <div class="ls-main">
        <nav class="ls-crumb" aria-label="Fil d’Ariane"><a href="#/parcours">Parcours</a>›<span style="color:${m.color}">Module ${m.n} · ${esc(m.title)}</span>›<span>Leçon ${l.n}</span></nav>
        <header class="ls-title"><h1>${esc(l.title)}</h1><p class="ar" lang="ar" dir="rtl">${esc(l.ar || '')}</p></header>
        <div class="player" id="player">${
          l.video
            ? `<video id="vid" src="../${l.video}" poster="../${l.poster || ''}" controls playsinline preload="metadata"></video>`
            : `<iframe id="ifr" src="../motion/player.html?id=${l.id}" title="Vidéo : ${esc(l.title)}" allow="fullscreen; autoplay" loading="lazy"></iframe>`
        }</div>
        <div class="ls-row">
          <span class="chip">${icon('clock', { size: 14 })} ${fmtMin(DUR[l.id])}</span>
          ${l.voice ? '<span class="chip chip--ok">Voix off en darija</span>' : '<span class="ls-note">Vidéo animée · voix off en darija en cours d’enregistrement</span>'}
          <span class="grow"></span>
          <button class="b b--s ${rec.done ? 'b--ok' : 'b--or'}" id="mark" type="button">${rec.done ? `${icon('check', { size: 16, stroke: 2.6 })} Terminée` : 'Marquer comme terminée'}</button>
        </div>
        <div class="ls-tabs" role="tablist">${tabs.map(([k, t], i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${k}">${t}</button>`).join('')}</div>
        <section class="card ls-panel" id="panel"></section>
        <nav class="ls-next">${prev ? `<a href="#/lecon/${prev.id}"><span>← Précédente</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}${next ? `<a href="#/lecon/${next.id}"><span>Suivante →</span><b>${esc(next.title)}</b></a>` : `<a href="#/profil"><span>Terminé →</span><b>Ton certificat</b></a>`}</nav>
      </div>
      <aside class="ls-aside">
        <section class="card">
          <p class="card-k" style="color:${m.color}">Module ${m.n}</p>
          <h3 style="font-size:18px;margin-bottom:10px">${esc(m.title)}</h3>
          <div class="ls-list">${m.lessons.map((x) => `<a href="#/lecon/${x.id}" class="${me.progress.lessons[x.id]?.done ? 'is-done' : ''}" ${x.id === l.id ? 'aria-current="page"' : ''}><i>${me.progress.lessons[x.id]?.done ? '✓' : x.n}</i>${esc(x.title)}</a>`).join('')}</div>
        </section>
        <a class="card lab-card" href="https://hooked-lab.com" target="_blank" rel="noopener"><span class="lc-m">${markSVG({ lab: true })}</span><div><h3 style="font-size:16px">Applique avec Hooked Lab</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Analyse une créative de ta niche ↗</p></div></a>
      </aside>
    </div>`,
  );

  const panel = $('#panel');
  const show = (k) => {
    $$('.ls-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === k)));
    panel.innerHTML = '';
    if (k === 'ess') {
      panel.innerHTML = `<p class="card-k">À retenir</p><ol class="keys">${(l.key || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol><p class="card-k" style="margin-top:22px">Cartes mémoire — touche pour retourner</p><div id="fc"></div>`;
      flashcards($('#fc', panel), l);
      if (!reduce && gsap()) gsap().from($$('.keys li', panel), { x: -24, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'expo.out', clearProps: 'all' });
    }
    if (k === 'ex') renderWidget(l.widget, panel, { lesson: l, module: m, onXP: (n, why) => gainXP(n, why) });
    if (k === 'quiz') renderQuiz(panel, l);
    if (k === 'res') {
      panel.innerHTML = `<div class="res">${l.res.map((r, i) => `<div class="res-i"><div class="res-h"><b>${esc(r.title)}</b><button class="b b--s" data-copy="${i}" type="button">${icon('copy', { size: 15 })} Copier</button></div><pre>${esc(r.text)}</pre></div>`).join('')}</div>`;
      $$('[data-copy]', panel).forEach((b) => b.addEventListener('click', () => copy(l.res[+b.dataset.copy].text)));
    }
  };
  $$('.ls-tabs button').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  show('ess');

  const markDone = (auto = false) => {
    if (me.progress.lessons[l.id]?.done) return;
    const r = S.recordLesson(me.id, l.id, { done: true });
    refreshMe();
    const btn = $('#mark');
    btn.className = 'b b--s b--ok';
    btn.innerHTML = `${icon('check', { size: 16, stroke: 2.6 })} Terminée`;
    $('#xp-v').textContent = me.progress.xp;
    burst(`+${r.gained} XP`);
    toast(`${auto ? 'Leçon terminée' : 'Bravo'} : <b>+${r.gained} XP</b>`);
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
  st.progress.xp += n;
  S.save(d);
  refreshMe();
  const x = $('#xp-v');
  if (x) x.textContent = me.progress.xp;
  toast(`${esc(why)} : <b>+${n} XP</b>`);
}

function renderQuiz(panel, l) {
  const qs = l.quiz || [];
  if (!qs.length) {
    panel.innerHTML = '<p class="muted">Pas de quiz pour cette leçon.</p>';
    return;
  }
  let good = 0;
  let answered = 0;
  panel.innerHTML = `<div class="quiz">${qs
    .map(
      (q, i) => `<div class="qz" data-q="${i}"><p>${i + 1}. ${esc(q.q)}</p>${q.a.map((a, k) => `<button type="button" data-l="${'ABCD'[k]}" data-k="${k}">${esc(a)}</button>`).join('')}<p class="qz-why" hidden></p></div>`,
    )
    .join('')}<div id="qz-end"></div></div>`;
  $$('.qz', panel).forEach((box) => {
    const q = qs[+box.dataset.q];
    $$('button', box).forEach((b) =>
      b.addEventListener('click', () => {
        const k = +b.dataset.k;
        $$('button', box).forEach((x) => (x.disabled = true));
        b.classList.add(k === q.ok ? 'ok' : 'ko');
        if (k !== q.ok) $$('button', box)[q.ok].classList.add('ok');
        const why = $('.qz-why', box);
        why.hidden = false;
        why.textContent = `${k === q.ok ? 'Exact. ' : 'Pas tout à fait. '}${q.why}`;
        if (k === q.ok) good++;
        answered++;
        if (answered === qs.length) {
          const score = good / qs.length;
          const r = S.recordLesson(me.id, l.id, { quiz: score });
          refreshMe();
          $('#xp-v').textContent = me.progress.xp;
          $('#qz-end', panel).innerHTML = `<div class="qz-score">${ring(score, { size: 56, sw: 12, label: `<b style="font-family:var(--font-mono);font-size:12px">${good}/${qs.length}</b>` })}<div>${score === 1 ? 'Sans faute ! ' : score >= 0.5 ? 'Bien joué. ' : 'Revois la vidéo et retente. '}${r.gained > 0 ? `<b style="color:var(--gold-300)">+${r.gained} XP</b>` : ''}</div><button class="b b--s" type="button" id="qz-re" style="margin-left:auto">Recommencer</button></div>`;
          animateRings(panel);
          $('#qz-re', panel).addEventListener('click', () => renderQuiz(panel, l));
          if (score === 1) burst('Sans faute');
          checkBadges(me);
        }
      }),
    );
  });
}

function burst(text) {
  if (reduce || !gsap()) return;
  const el = document.createElement('div');
  el.className = 'done-burst';
  el.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
  el.querySelector('b').textContent = text;
  document.body.appendChild(el);
  const tl = gsap().timeline({ onComplete: () => el.remove() });
  tl.to($$('i', el), { scaleY: 1, duration: 0.35, ease: 'power3.in', stagger: 0.05 })
    .to($('b', el), { opacity: 1, scale: 1.1, duration: 0.3, ease: 'back.out(3)' }, 0.3)
    .set($$('i', el), { transformOrigin: '50% 0%' }, 0.95)
    .to($('b', el), { opacity: 0, duration: 0.2 }, 0.95)
    .to($$('i', el), { scaleY: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05 }, 1);
}

export function copy(text) {
  navigator.clipboard?.writeText(text).then(
    () => toast(`${icon('copy', { size: 16 })} Copié`),
    () => toast('Copie impossible : sélectionne le texte'),
  );
}

/* ------------------------------------------------------------------ */
/* Ressources                                                          */
/* ------------------------------------------------------------------ */

const EXTRA = [
  { cat: 'Hooks', title: '10 hooks par famille', text: 'Agis comme un copywriter publicitaire. Produit : [produit]. Cible : [cible]. Problème : [problème]. Écris 10 hooks de moins de 10 mots : 4 positifs, 4 négatifs, 2 avec un emplacement [chiffre vrai]. Classe-les du plus fort au plus faible et explique le n°1.' },
  { cat: 'Scripts', title: 'Script vidéo Hook / Body / CTA', text: 'Tu es un créateur de publicités pour TikTok et Reels en Algérie. Produit : [produit], prix : [prix], livraison : [livraison]. Écris un script de 20 secondes au format : HOOK (0–3 s), BODY (3–17 s : problème, produit, preuve), CTA (17–20 s). Pour chaque partie : voix off en darija + texte à l’écran + plan à filmer. Aucune promesse invérifiable.' },
  { cat: 'Scripts', title: 'Script UGC 25 s', text: 'Écris un script UGC de 25 secondes pour [produit], face caméra, ton naturel en darija. Structure : hook personnel, problème vécu, découverte, résultat montré, CTA naturel. Indique les plans à filmer et le texte à l’écran.' },
  { cat: 'Images', title: 'Packshot studio', text: 'Garde le produit exactement identique (forme, étiquette, couleurs). [Produit] posé sur [matière], fond [couleur], lumière douce venant de [direction], ombre douce au sol, plan rapproché, légère contre-plongée, photo produit de luxe, format 4:5.' },
  { cat: 'Images', title: 'Mise en situation', text: '[Produit] utilisé dans [décor : salle de bain, cuisine…], [moment de la journée], lumière naturelle, mains de [personne] en train de [action], cadrage serré, style photo lifestyle authentique, format 9:16.' },
  { cat: 'Vidéos', title: 'Packshot animé 5 s', text: 'À partir de l’image fournie : garde le produit parfaitement identique. [Une action lente : reflet qui glisse, goutte, fumée légère], léger push-in, 5 secondes, ambiance [chaude / fraîche], pas de texte.' },
  { cat: 'Vidéos', title: 'Storyboard 5 plans', text: 'Transforme ce script en storyboard de 5 plans. Pour chaque plan : taille de plan, mouvement de caméra, lumière, durée, et le prompt image à utiliser. Script : [colle ton script].' },
  { cat: 'Clients', title: 'Premier message de prospection', text: 'Salam [prénom/marque] ! J’ai vu votre [Reel/post] sur [produit] : [observation précise et sincère]. J’ai préparé [3 idées de hooks / une analyse rapide] pour le relancer, je vous les envoie ?' },
  { cat: 'Clients', title: 'Proposition de pack', text: 'Rédige une proposition courte pour [marque] : contexte (ce que j’ai observé), objectif (ventes, messages…), offre (pack de [n] créatives, formats, délais), étapes, et prochaine action. Ton professionnel et chaleureux, 150 mots maximum.' },
];

function viewRes() {
  const fromLessons = LESSONS.flatMap((l) => (l.res || []).map((r) => ({ cat: l.module.title, title: r.title, text: r.text, lesson: l })));
  const all = [...EXTRA, ...fromLessons];
  const cats = ['Tout', ...new Set(all.map((r) => r.cat))];
  shell(
    '#/ressources',
    `<div class="ph-h"><div><h1>Bibliothèque de prompts</h1><p>Copie, remplace les [crochets], colle dans ton outil.</p></div></div>
    <div style="display:grid;gap:12px">
      <input class="in" id="q" type="search" placeholder="Rechercher un prompt…" aria-label="Rechercher">
      <div class="seg" id="cats">${cats.map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="res" id="list"></div>
    </div>`,
  );
  let cat = 'Tout';
  const draw = () => {
    const q = $('#q').value.toLowerCase();
    const list = all.filter((r) => (cat === 'Tout' || r.cat === cat) && (!q || `${r.title} ${r.text}`.toLowerCase().includes(q)));
    $('#list').innerHTML = list.length
      ? list.map((r, i) => `<div class="card res-i"><div class="res-h"><div><p class="card-k" style="margin:0 0 2px">${esc(r.cat)}</p><b>${esc(r.title)}</b></div><button class="b b--s" type="button" data-i="${i}">${icon('copy', { size: 15 })} Copier</button></div><pre>${esc(r.text)}</pre></div>`).join('')
      : '<p class="muted">Aucun prompt ne correspond.</p>';
    $$('#list [data-i]').forEach((b) => b.addEventListener('click', () => copy(list[+b.dataset.i].text)));
  };
  $('#q').addEventListener('input', draw);
  $$('#cats button').forEach((b) =>
    b.addEventListener('click', () => {
      cat = b.dataset.c;
      $$('#cats button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }),
  );
  draw();
  enter('.res > *');
}

/* ------------------------------------------------------------------ */
/* Profil                                                              */
/* ------------------------------------------------------------------ */

function viewProfile() {
  const P = progressOf(me);
  const lv = S.level(me.progress.xp);
  const quizOk = P.quizN > 0 && P.quizAvg >= 0.7;
  shell(
    '#/profil',
    `<div class="ph-h"><div><h1>${esc(me.name)}</h1><p>${esc(me.email || me.phone)} · ${esc(me.cohort || '')}</p></div><button class="b b--s" id="out" type="button">${icon('logout', { size: 16 })} Se déconnecter</button></div>
    <div class="dash">
      <section class="card hello" style="grid-column:span 12">
        <p class="card-k">Niveau</p>
        <h1>${esc(lv.name)} <span class="ar" lang="ar" dir="rtl" style="font-size:.6em;color:var(--gold-300)">${esc(lv.ar)}</span></h1>
        <div class="lvl"><div class="lvl-top"><span class="muted">${me.progress.xp} XP</span><span class="muted" style="margin-left:auto">${lv.next ? `Prochain : ${esc(lv.next.name)} (${lv.next.xp} XP)` : 'Niveau maximum'}</span></div><div class="lvl-bar"><i style="transform:scaleX(${lv.pct})"></i></div></div>
        <div class="seg" style="margin-top:16px">${S.LEVELS.map((x, i) => `<span class="chip ${i <= lv.i ? 'chip--or' : ''}">${esc(x.name)}</span>`).join('')}</div>
      </section>
      <section class="card" style="grid-column:span 12">
        <p class="card-k">${icon('trophy', { size: 14 })} Certificat Hooked Academy</p>
        <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
          <div class="kpi"><b>${Math.round(P.pct * 100)} %</b><span>leçons terminées</span><div class="meter"><i style="width:${P.pct * 100}%"></i></div></div>
          <div class="kpi"><b>${P.quizN ? Math.round(P.quizAvg * 100) + ' %' : '—'}</b><span>réussite aux quiz (70 % requis)</span><em style="color:${quizOk ? 'var(--body)' : 'var(--mist-400)'}">${quizOk ? 'Validé' : 'En cours'}</em></div>
          <div class="kpi"><b>À rendre</b><span>projet final (IA09)</span><em class="muted">Relu par l’équipe</em></div>
        </div>
      </section>
      <section style="grid-column:span 12;display:grid;gap:10px"><h2 style="margin:6px 0 0;font-family:var(--font-display);font-size:24px">Badges</h2><div class="badges">${Object.entries(S.BADGES)
        .map(([k, b]) => badgeHTML(k, b))
        .join('')}</div></section>
      ${me.exemple ? `<section class="card" style="grid-column:span 12"><p class="card-k">Compte démo</p><p class="muted" style="margin:0 0 12px">Ce compte sert à présenter la plateforme. Tu peux remettre sa progression d’exemple à zéro.</p><button class="b b--s b--danger" id="rst" type="button">Réinitialiser la démo</button></section>` : ''}
    </div>`,
  );
  $('#out').addEventListener('click', () => {
    S.logout();
    me = null;
    location.hash = '';
    route();
  });
  $('#rst')?.addEventListener('click', () => {
    S.reset();
    S.loginStudent(S.DEMO_STUDENT.email, S.DEMO_STUDENT.code);
    refreshMe();
    toast('Démo réinitialisée');
    viewProfile();
  });
  enter('.dash > *');
}

/* ------------------------------------------------------------------ */
/* Routeur                                                             */
/* ------------------------------------------------------------------ */

function route() {
  stop.forEach((f) => {
    try {
      f();
    } catch {}
  });
  stop = [];
  refreshMe();
  if (new URLSearchParams(location.search).has('demo') && !me) {
    S.loginStudent(S.DEMO_STUDENT.email, S.DEMO_STUDENT.code);
    refreshMe();
  }
  if (!me) return viewLogin();
  const h = location.hash || '#/';
  document.title = 'Espace étudiant — Hooked Academy';
  if (h.startsWith('#/lecon/')) return viewLesson(decodeURIComponent(h.slice(8)));
  if (h === '#/parcours') return viewMap();
  if (h === '#/ressources') return viewRes();
  if (h === '#/profil') return viewProfile();
  return viewHome();
}

addEventListener('hashchange', route);
// Vidéos finales (voix off montée) publiées par le rendu : video/manifest.json
async function loadManifest() {
  try {
    const r = await fetch('../video/manifest.json', { cache: 'no-cache' });
    if (!r.ok) return;
    const m = await r.json();
    LESSONS.forEach((l) => {
      if (m[l.id]) Object.assign(l, m[l.id]);
    });
    MODULES.forEach((mod) => mod.lessons.forEach((l) => m[l.id] && Object.assign(l, m[l.id])));
  } catch {}
}
const start = () => Promise.all([document.fonts?.ready, loadManifest()]).then(route);
if (window.gsap) start();
else addEventListener('load', start);
