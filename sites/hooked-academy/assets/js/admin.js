// Hooked Academy — espace équipe.
// Routes : #/ (vue d'ensemble) · #/inscriptions · #/etudiants · #/studio · #/programme · #/reglages
// Les inscriptions arrivent de la landing ; l'équipe contacte sur WhatsApp, encaisse, valide :
// la validation crée l'accès étudiant (e-mail + code) et prépare le message de bienvenue.

import { logoInner } from './brand.js';
import { icon } from './icons.js';
import * as S from './store.js';
import { MODULES, allLessons, findLesson } from '../../data/programme.js';
import { plan, lessonDuration } from '../../motion/engine.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = () => (reduce ? null : window.gsap);
const root = $('#root');
const LESSONS = allLessons();
let stop = [];

const fmtDate = (s) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
const fmtDT = (s) => new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const ago = (s) => {
  const m = Math.round((Date.now() - new Date(s)) / 60000);
  if (m < 60) return `il y a ${Math.max(1, m)} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
};
const waNum = (p) => {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `213${d.slice(1)}`;
  return d;
};
const wa = (phone, text) => `https://wa.me/${waNum(phone)}?text=${encodeURIComponent(text)}`;
const fmtMin = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function toast(html, ms = 2600) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  $('#toasts').appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 320);
  }, ms);
}
const copy = (text) => navigator.clipboard?.writeText(text).then(() => toast(`${icon('copy', { size: 16 })} Copié`));
function download(name, content, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type: `${type};charset=utf-8` }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 500);
}

/* ------------------------------------------------------------------ */

function viewLogin(err = '') {
  root.innerHTML = `<div class="login"><section class="login-box">
    <a class="ha-logo" href="../">${logoInner()}</a>
    <h1>Espace <em>équipe</em></h1>
    <p class="muted">Inscriptions, validation des accès, suivi des étudiants et studio voix off.</p>
    <form id="af" style="display:grid;gap:12px" novalidate>
      <label class="lbl">Code équipe<input class="in" name="code" autocomplete="current-password" type="password" required style="font-family:var(--font-mono)"></label>
      <p class="login-err" role="alert">${esc(err)}</p>
      <button class="b b--or" type="submit">Entrer</button>
    </form>
    <div class="login-demo">Démo : code équipe <code>${S.TEAM_CODE}</code><br><button class="b b--s" type="button" id="ademo" style="margin-top:10px">Entrer avec le code démo</button></div>
  </section><aside class="login-art" aria-hidden="true" style="display:grid;place-items:center"><div style="width:min(70%,420px)">${logoInner().replace('ha-logo__pastille', 'ha-logo__pastille" style="width:9em;height:9em;border-radius:2.4em;font-size:16px"')}</div></aside></div>`;
  $('#af').addEventListener('submit', (e) => {
    e.preventDefault();
    if (S.loginAdmin(new FormData(e.target).get('code'))) route();
    else viewLogin('Code incorrect.');
  });
  $('#ademo').addEventListener('click', () => {
    S.loginAdmin(S.TEAM_CODE);
    route();
  });
}

const NAV = [
  ['#/', 'chart', 'Vue d’ensemble'],
  ['#/inscriptions', 'users', 'Inscriptions'],
  ['#/etudiants', 'book', 'Étudiants'],
  ['#/studio', 'mic', 'Studio voix off'],
  ['#/programme', 'layers', 'Programme'],
  ['#/reglages', 'settings', 'Réglages'],
];

function shell(active, html) {
  const d = S.load();
  const nNew = d.applications.filter((a) => a.status === 'nouvelle').length;
  root.innerHTML = `<div class="sh">
    <aside class="side">
      <a class="ha-logo" href="../">${logoInner()}</a>
      <p class="card-k" style="margin:0 12px 8px">Espace équipe</p>
      ${NAV.map(([h, ic, t]) => `<a class="nv" href="${h}" ${active === h ? 'aria-current="page"' : ''}>${icon(ic, { size: 20 })}${t}${h === '#/inscriptions' && nNew ? `<span class="cnt">${nNew}</span>` : ''}</a>`).join('')}
      <div class="side-foot"><a class="nv" href="../app/" target="_blank">${icon('user', { size: 20 })}Espace étudiant ↗</a><button class="b b--s" id="out" type="button">${icon('logout', { size: 16 })} Déconnexion</button></div>
    </aside>
    <div>
      <header class="top"><a class="ha-logo" href="#/">${logoInner()}</a><span class="chip chip--or">Équipe</span><button class="b b--s b--i" id="out2" type="button" aria-label="Déconnexion">${icon('logout', { size: 16 })}</button></header>
      <main class="main" id="main">${html}</main>
    </div>
  </div>
  <nav class="tabs" aria-label="Navigation">${NAV.slice(0, 5).map(([h, ic, t]) => `<a href="${h}" ${active === h ? 'aria-current="page"' : ''}>${icon(ic, { size: 20 })}${t.split(' ')[0]}</a>`).join('')}</nav>`;
  const out = () => {
    S.logoutAdmin();
    route();
  };
  $('#out').addEventListener('click', out);
  $('#out2').addEventListener('click', out);
  window.scrollTo(0, 0);
}
const exBanner = (d) =>
  d.applications.some((a) => a.exemple) ? `<p class="ex-banner">${icon('sparkles', { size: 16 })} Les fiches marquées <span class="ex-tag">exemple</span> sont fictives : elles montrent le fonctionnement. Les vraies inscriptions de la landing s’ajoutent au-dessus.</p>` : '';

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
    ...a.history.map((h) => ({ at: h.at, c: S.STATUS[h.status]?.c, t: `${esc(a.name)} → <b>${S.STATUS[h.status]?.label}</b>`, by: h.by })),
    ...a.notes.map((n) => ({ at: n.at, c: 'var(--mist-400)', t: `Note sur ${esc(a.name)} : ${esc(n.text)}`, by: n.by })),
  ])
    .sort((x, y) => new Date(y.at) - new Date(x.at))
    .slice(0, 8);
  shell(
    '#/',
    `<div class="ph-h"><div><h1>Vue d’ensemble</h1><p>${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><a class="b b--or b--s" href="#/inscriptions">${icon('users', { size: 16 })} Traiter les inscriptions</a></div>
    ${exBanner(d)}
    <div class="kpi-row">
      <a class="card kpi-c" href="#/inscriptions" style="--c:var(--hook);text-decoration:none;color:inherit"><i>${icon('bell', { size: 20 })}</i><b data-c="${by('nouvelle')}">0</b><span>nouvelles inscriptions</span></a>
      <div class="card kpi-c" style="--c:var(--cta)"><i>${icon('money', { size: 20 })}</i><b data-c="${by('paiement')}">0</b><span>paiements en attente</span></div>
      <div class="card kpi-c" style="--c:var(--body)"><i>${icon('users', { size: 20 })}</i><b data-c="${active.length}">0</b><span>étudiants actifs</span></div>
      <div class="card kpi-c"><i>${icon('chart', { size: 20 })}</i><b data-c="${Math.round(avg * 100)}" data-suf=" %">0</b><span>progression moyenne</span></div>
    </div>
    <div class="ov" style="margin-top:14px">
      <section class="card"><p class="card-k">Inscriptions · 14 derniers jours</p><div class="bars">${days.map((x) => `<span><b>${x.n || ''}</b><i style="height:${(x.n / max) * 100}%"></i>${x.l}</span>`).join('')}</div></section>
      <section class="card"><p class="card-k">Pipeline</p><div class="funnel-ad">${Object.entries(S.STATUS)
        .map(([k, s]) => `<div style="--c:${s.c}"><span>${s.label}</span><em><i style="transform:scaleX(${A.length ? by(k) / A.length : 0})"></i></em><b>${by(k)}</b></div>`)
        .join('')}</div></section>
      <section class="card" style="grid-column:1/-1"><p class="card-k">Activité récente</p><ul class="act">${events.map((e) => `<li style="--c:${e.c}"><span class="dot"></span><span>${e.t}<br><small class="muted">${esc(e.by || '')}</small></span><time>${ago(e.at)}</time></li>`).join('') || '<li class="muted">Rien pour l’instant.</li>'}</ul></section>
    </div>`,
  );
  $$('[data-c]').forEach((el) => {
    const n = +el.dataset.c;
    const suf = el.dataset.suf || '';
    if (!gsap()) return (el.textContent = `${n}${suf}`);
    const o = { v: 0 };
    gsap().to(o, { v: n, duration: 1.1, ease: 'power3.out', onUpdate: () => (el.textContent = `${Math.round(o.v)}${suf}`) });
  });
  gsap()?.from('.bars i', { scaleY: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 });
  gsap()?.from('.funnel-ad em i', { scaleX: 0, duration: 1, ease: 'expo.out', stagger: 0.06 });
  gsap()?.from('.main .card', { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out', clearProps: 'all' });
}

/* ------------------------------------------------------------------ */
/* Inscriptions                                                        */
/* ------------------------------------------------------------------ */

let filter = '';
function viewApps() {
  const d = S.load();
  const q = filter.toLowerCase();
  const list = d.applications.filter((a) => !q || `${a.name} ${a.email} ${a.phone} ${a.city} ${a.objectif}`.toLowerCase().includes(q));
  shell(
    '#/inscriptions',
    `<div class="ph-h"><div><h1>Inscriptions</h1><p>Glisse une fiche d’une colonne à l’autre, ou ouvre-la pour agir.</p></div><button class="b b--s" id="csv" type="button">${icon('download', { size: 16 })} Export CSV</button></div>
    ${exBanner(d)}
    <div class="tools"><input class="in" id="flt" type="search" placeholder="Rechercher : nom, téléphone, ville…" value="${esc(filter)}" aria-label="Rechercher"></div>
    <div class="kb">${Object.entries(S.STATUS)
      .map(
        ([k, s]) => `<section class="kb-col" data-st="${k}" style="--c:${s.c}"><div class="kb-h"><i></i>${s.label}<span>${list.filter((a) => a.status === k).length}</span></div>
        ${list
          .filter((a) => a.status === k)
          .map(
            (a) => `<button class="kb-card" draggable="true" data-id="${a.id}" type="button" style="--c:${s.c}"><b>${esc(a.name)}</b><small>${esc(a.objectif || '—')}</small><div class="kb-meta">${a.exemple ? '<span class="ex-tag">exemple</span>' : ''}${Date.now() - new Date(a.createdAt) < 864e5 && a.status === 'nouvelle' ? '<span class="kb-new">NOUVEAU</span>' : ''}<span>${esc(S.PROFILS[a.profil] || '')}</span>·<span>${esc(a.city || '')}</span>·<span>${ago(a.createdAt)}</span></div></button>`,
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
    const rows = [['Date', 'Nom', 'WhatsApp', 'E-mail', 'Ville', 'Profil', 'Niveau', 'Objectif', 'Statut', 'Exemple']].concat(
      d.applications.map((a) => [fmtDT(a.createdAt), a.name, a.phone, a.email, a.city, S.PROFILS[a.profil] || a.profil, a.niveau, a.objectif, S.STATUS[a.status].label, a.exemple ? 'oui' : '']),
    );
    download(`inscriptions-hooked-academy-${S.iso()}.csv`, '﻿' + rows.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
  });
  gsap()?.from('.kb-card', { y: 20, autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: 'expo.out', clearProps: 'all' });
}

function setStatus(id, st) {
  if (st === 'validee') {
    const r = S.validateApplication(id);
    if (r) openApp(id, r);
  } else S.updateApplication(id, { status: st });
  toast(`Statut : <b>${S.STATUS[st].label}</b>`);
  if (st !== 'validee') {
    viewApps();
  }
}

function openApp(id, validation = null) {
  const d = S.load();
  const a = d.applications.find((x) => x.id === id);
  if (!a) return;
  const st = d.students.find((s) => s.id === a.studentId || (a.email && s.email === a.email));
  const contact = `Salam ${a.name.replace(/^Exemple — /, '').split(' ')[0]} ! Ici l’équipe Hooked Academy 👋 Merci pour ton inscription. On t’appelle pour te présenter la prochaine session, le tarif et les moyens de paiement (CCP, BaridiMob ou espèces). Quel moment t’arrange ?`;
  const welcome = st ? S.welcomeMessage(st) : '';
  const dw = document.createElement('div');
  dw.className = 'drawer';
  dw.innerHTML = `<div class="drawer-p" role="dialog" aria-modal="true" aria-label="Inscription de ${esc(a.name)}">
    <div class="drawer-h"><div><p class="card-k" style="color:${S.STATUS[a.status].c}">${S.STATUS[a.status].label}${a.exemple ? ' · exemple' : ''}</p><h2>${esc(a.name)}</h2></div><button class="b b--i" type="button" data-x aria-label="Fermer">${icon('x', { size: 18 })}</button></div>
    ${
      validation || (a.status === 'validee' && st)
        ? `<section class="card" style="box-shadow:inset 0 0 0 1px rgb(85 184 148 / .4)"><p class="card-k" style="color:var(--body)">${icon('check', { size: 14 })} Accès étudiant ${validation ? 'créé' : 'actif'}</p><p style="margin:0 0 8px">Code d’accès : <span class="code-big">${esc(st.code)}</span></p><div class="msg">${esc(welcome)}</div><div class="acts" style="margin-top:10px"><a class="b b--or b--s" href="${wa(a.phone, welcome)}" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} Envoyer sur WhatsApp</a><button class="b b--s" type="button" data-copy-w>${icon('copy', { size: 16 })} Copier</button></div></section>`
        : ''
    }
    <dl class="dl">
      <dt>WhatsApp</dt><dd>${esc(a.phone)}</dd>
      <dt>E-mail</dt><dd>${esc(a.email)}</dd>
      <dt>Ville</dt><dd>${esc(a.city || '—')}</dd>
      <dt>Profil</dt><dd>${esc(S.PROFILS[a.profil] || a.profil)}</dd>
      <dt>Niveau</dt><dd>${esc(a.niveau || '—')}</dd>
      <dt>Objectif</dt><dd>${esc(a.objectif || '—')}</dd>
      <dt>Reçue</dt><dd>${fmtDT(a.createdAt)} · ${esc(a.source || 'Landing')}</dd>
    </dl>
    <div class="acts">
      <a class="b b--s" href="${wa(a.phone, contact)}" target="_blank" rel="noopener" data-contact>${icon('whatsapp', { size: 16 })} Contacter</a>
      ${a.status !== 'contactee' && a.status !== 'validee' ? `<button class="b b--s" data-st="contactee" type="button">Marquer contactée</button>` : ''}
      ${a.status !== 'paiement' && a.status !== 'validee' ? `<button class="b b--s" data-st="paiement" type="button">Paiement en attente</button>` : ''}
      ${a.status !== 'validee' ? `<button class="b b--ok b--s" data-st="validee" type="button">${icon('check', { size: 16 })} Paiement reçu : valider</button>` : ''}
      ${a.status !== 'refusee' ? `<button class="b b--s b--danger" data-st="refusee" type="button">Refuser</button>` : ''}
    </div>
    <section style="display:grid;gap:8px"><p class="card-k" style="margin:6px 0 0">Notes de l’équipe</p><div class="notes">${a.notes.map((n) => `<p><small>${fmtDT(n.at)} · ${esc(n.by)}</small>${esc(n.text)}</p>`).join('') || '<p class="muted">Aucune note.</p>'}</div>
      <form data-note style="display:flex;gap:8px"><input class="in" name="t" placeholder="Ajouter une note (appel, paiement…)" style="min-height:42px"><button class="b b--s" type="submit">Ajouter</button></form></section>
    <section><p class="card-k">Historique</p><div class="hist">${a.history.map((h) => `<span>${fmtDT(h.at)} — ${S.STATUS[h.status]?.label} <span class="muted">(${esc(h.by)})</span></span>`).join('')}</div></section>
  </div>`;
  document.body.appendChild(dw);
  document.body.style.overflow = 'hidden';
  gsap()?.fromTo($('.drawer-p', dw), { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out' });
  const close = () => {
    dw.remove();
    document.body.style.overflow = '';
    route();
  };
  dw.addEventListener('click', (e) => {
    if (e.target === dw || e.target.closest('[data-x]')) close();
  });
  addEventListener(
    'keydown',
    function esc(e) {
      if (e.key === 'Escape') {
        removeEventListener('keydown', esc);
        if (dw.isConnected) close();
      }
    },
  );
  $('[data-contact]', dw).addEventListener('click', () => {
    if (a.status === 'nouvelle') S.updateApplication(a.id, { status: 'contactee' }, 'Équipe (WhatsApp)');
  });
  $$('[data-st]', dw).forEach((b) =>
    b.addEventListener('click', () => {
      dw.remove();
      document.body.style.overflow = '';
      setStatus(a.id, b.dataset.st);
      if (b.dataset.st !== 'validee') openApp(a.id);
    }),
  );
  $('[data-copy-w]', dw)?.addEventListener('click', () => copy(welcome));
  $('[data-note]', dw).addEventListener('submit', (e) => {
    e.preventDefault();
    const t = new FormData(e.target).get('t').trim();
    if (!t) return;
    S.updateApplication(a.id, { note: t });
    dw.remove();
    openApp(a.id);
  });
  $('[data-x]', dw).focus();
}

/* ------------------------------------------------------------------ */
/* Étudiants                                                           */
/* ------------------------------------------------------------------ */

function viewStudents() {
  const d = S.load();
  const rows = d.students.map((s) => {
    const pct = studentPct(s);
    const lastDay = [...s.progress.days].sort().pop();
    return { s, pct, lastDay, lv: S.level(s.progress.xp), streak: S.streak(s.progress.days) };
  });
  shell(
    '#/etudiants',
    `<div class="ph-h"><div><h1>Étudiants</h1><p>${rows.filter((r) => r.s.active).length} actifs · accès créés à la validation d’une inscription</p></div></div>
    <div class="card tbl-wrap scroll-x"><table class="tbl"><thead><tr><th>Étudiant</th><th>Progression</th><th>Niveau</th><th>Série</th><th>Dernière activité</th><th>Code</th><th></th></tr></thead><tbody>${rows
      .map(
        ({ s, pct, lastDay, lv, streak }) => `<tr><td><b>${esc(s.name)}</b>${s.exemple ? ' <span class="ex-tag">exemple</span>' : ''}<br><small class="muted">${esc(s.email || s.phone)}</small></td><td><div class="meter"><i style="width:${pct * 100}%"></i></div><small class="muted">${Math.round(pct * 100)} %</small></td><td>${esc(lv.name)}<br><small class="muted">${s.progress.xp} XP</small></td><td>🔥 ${streak}</td><td>${lastDay ? fmtDate(lastDay) : '—'}</td><td><code>${esc(s.code)}</code></td><td><div class="acts"><button class="b b--s" data-send="${s.id}" type="button">${icon('whatsapp', { size: 15 })}</button><button class="b b--s ${s.active ? 'b--danger' : 'b--ok'}" data-act="${s.id}" type="button">${s.active ? 'Suspendre' : 'Réactiver'}</button></div></td></tr>`,
      )
      .join('')}</tbody></table></div>
    <div class="stu-cards">${rows
      .map(
        ({ s, pct, lv, streak }) => `<div class="card" style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(s.name)}</b>${s.exemple ? '<span class="ex-tag">exemple</span>' : ''}</div><div class="meter"><i style="width:${pct * 100}%"></i></div><small class="muted">${Math.round(pct * 100)} % · ${esc(lv.name)} · 🔥 ${streak} · <code style="color:var(--gold-300)">${esc(s.code)}</code></small><div class="acts"><button class="b b--s" data-send="${s.id}" type="button">${icon('whatsapp', { size: 15 })} Renvoyer l’accès</button><button class="b b--s ${s.active ? 'b--danger' : 'b--ok'}" data-act="${s.id}" type="button">${s.active ? 'Suspendre' : 'Réactiver'}</button></div></div>`,
      )
      .join('')}</div>`,
  );
  $$('[data-send]').forEach((b) =>
    b.addEventListener('click', () => {
      const s = d.students.find((x) => x.id === b.dataset.send);
      window.open(wa(s.phone, S.welcomeMessage(s)), '_blank', 'noopener');
    }),
  );
  $$('[data-act]').forEach((b) =>
    b.addEventListener('click', () => {
      const s = d.students.find((x) => x.id === b.dataset.act);
      S.setStudentActive(s.id, !s.active);
      toast(s.active ? 'Accès suspendu' : 'Accès réactivé');
      viewStudents();
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Studio voix off                                                     */
/* ------------------------------------------------------------------ */

const VKEY = (id) => `hooked-academy:voix:${id}`;
const voiceLocal = (id) => {
  try {
    return localStorage.getItem(VKEY(id));
  } catch {
    return null;
  }
};

function scriptText(l) {
  const steps = plan(l);
  return `${l.title}\n${'='.repeat(l.title.length)}\nDurée : ${fmtMin(lessonDuration(l))}\n\n${steps.map((s, i) => `[${fmtMin(s.t)} → ${fmtMin(s.t + s.d)}] Scène ${i + 1} (${s.sc.type})\n${s.sc.say || (l.voice ? '(voix déjà enregistrée)' : '—')}`).join('\n\n')}\n`;
}

function viewStudio(id) {
  const cur = findLesson(id || 'm1-l3') || findLesson('m1-l3');
  const l = cur.lesson;
  const steps = plan(l);
  shell(
    '#/studio',
    `<div class="ph-h"><div><h1>Studio voix off</h1><p>Le texte à dire défile pendant l’animation : enregistre ta voix en darija, parfaitement calée.</p></div><button class="b b--s" id="allscript" type="button">${icon('doc', { size: 16 })} Tous les textes (.txt)</button></div>
    <div class="studio">
      <section class="card"><div class="st-list">${MODULES.map(
        (m) => `<h4>Module ${m.n} · ${esc(m.title)}</h4>${m.lessons.map((x) => `<button type="button" data-l="${x.id}" ${x.id === l.id ? 'aria-current="true"' : ''}><i class="${x.voice ? 'ok' : voiceLocal(x.id) ? 'loc' : ''}"></i>${esc(x.title)}</button>`).join('')}`,
      ).join('')}</div><p class="muted" style="font-size:12px;margin:10px 4px 0"><span style="color:var(--body)">●</span> voix montée · <span style="color:var(--gold-400)">●</span> enregistrée dans ce navigateur · <span>●</span> à enregistrer</p></section>
      <section style="display:grid;gap:14px;min-width:0">
        <div class="card" style="display:grid;gap:12px">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;justify-content:space-between"><h2 style="font-size:22px">${esc(l.title)}</h2><span class="muted" style="font-family:var(--font-mono);font-size:12px">${steps.length} scènes · ${fmtMin(lessonDuration(l))}</span></div>
          <div class="st-player"><iframe id="sp" src="../motion/player.html?id=${l.id}${l.audio ? '&audio=1' : ''}" title="Animation de la leçon" allow="autoplay; fullscreen"></iframe><div class="countdown" id="cd" hidden></div></div>
          <div class="telep" aria-live="polite"><span class="card-k" style="margin:0">À dire maintenant</span><p id="telet">${esc(steps[0]?.sc.say || (l.voice ? 'Voix déjà enregistrée : écoute le rendu.' : '—'))}</p></div>
          <div class="st-rec">
            ${l.voice ? `<span class="chip chip--ok">${icon('check', { size: 14 })} Voix off déjà montée</span>` : ''}
            <button class="b b--or" id="rec" type="button">${icon('mic', { size: 18 })} Enregistrer ma voix</button>
            <button class="b" id="stp" type="button" hidden><span class="rec-dot"></span> Arrêter</button>
            <span class="muted" id="recs" style="font-size:13px"></span>
          </div>
          <div id="take" hidden style="display:grid;gap:10px"><audio id="aud" controls style="width:100%"></audio><div class="acts"><button class="b b--s" id="sync" type="button">${icon('play', { size: 15 })} Réécouter avec l’animation</button><a class="b b--s b--or" id="dl">${icon('download', { size: 15 })} Télécharger la voix</a></div><p class="muted" style="font-size:12.5px;margin:0">Dépose ce fichier tel quel dans <code>sites/hooked-academy/video/voix/</code> du dépôt GitHub (Add file → Upload files) : la vidéo finale est générée avec ta voix et publiée automatiquement dans la formation.</p></div>
        </div>
        <section class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px"><p class="card-k" style="margin:0">Texte à dire, scène par scène</p><button class="b b--s" id="one" type="button">${icon('download', { size: 15 })} .txt</button></div>
          <ol class="say-list" id="say">${steps.map((s) => `<li data-t="${s.t}" data-e="${s.t + s.d}"><small>${fmtMin(s.t)} · ${s.sc.type}</small>${esc(s.sc.say || (l.voice ? 'Voix déjà enregistrée et montée sur cette scène.' : '—'))}</li>`).join('')}</ol></section>
      </section>
    </div>`,
  );
  $$('[data-l]').forEach((b) => b.addEventListener('click', () => (location.hash = `#/studio/${b.dataset.l}`)));
  $('#one').addEventListener('click', () => download(`${l.id}-texte-voix-off.txt`, scriptText(l)));
  $('#allscript').addEventListener('click', () => download('hooked-academy-textes-voix-off.txt', LESSONS.map(scriptText).join('\n\n\n')));
  const ifr = $('#sp');
  const cmd = (c, t) => ifr.contentWindow?.postMessage({ type: 'ha-cmd', cmd: c, t }, '*');
  const sayEls = $$('#say li');
  let rec = null;
  let chunks = [];
  let stream = null;
  let lastBlob = null;
  const telet = $('#telet');
  const hl = (t) => {
    sayEls.forEach((li, i) => {
      const on = t >= +li.dataset.t && t < +li.dataset.e;
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
  stop.push(() => stream?.getTracks().forEach((t) => t.stop()));

  const finish = () => {
    if (rec?.state === 'recording') rec.stop();
    cmd('pause');
    $('#stp').hidden = true;
    $('#rec').hidden = false;
  };
  $('#stp').addEventListener('click', finish);
  $('#rec').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      $('#recs').textContent = 'Enregistrement non disponible dans ce navigateur : essaie Chrome ou Edge.';
      return;
    }
    try {
      stream = stream || (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }));
    } catch {
      $('#recs').textContent = 'Micro refusé : autorise-le dans le navigateur puis réessaie.';
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
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
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
      $('#recs').textContent = 'Prise enregistrée.';
      try {
        localStorage.setItem(VKEY(l.id), new Date().toISOString());
      } catch {}
      toast(`${icon('mic', { size: 16 })} Voix enregistrée : <b>${esc(l.title)}</b>`);
    };
    rec.start(250);
    cmd('play');
    $('#rec').hidden = true;
    $('#stp').hidden = false;
    $('#recs').textContent = 'Enregistrement… lis le texte qui défile sous l’animation.';
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

function viewProgramme() {
  const total = LESSONS.reduce((s, l) => s + lessonDuration(l), 0);
  shell(
    '#/programme',
    `<div class="ph-h"><div><h1>Programme</h1><p>${MODULES.length} modules · ${LESSONS.length} leçons · ${Math.round(total / 60)} minutes de vidéo animée · ${LESSONS.filter((l) => l.voice).length} leçons avec voix off montée</p></div></div>
    <div style="display:grid;gap:12px">${MODULES.map(
      (m) => `<section class="card"><p class="card-k" style="color:${m.color}">Module ${m.n} · <span lang="ar" dir="rtl">${esc(m.ar)}</span></p><h2 style="font-size:22px;margin-bottom:10px">${esc(m.title)}</h2><div class="scroll-x"><table class="tbl prog-tbl"><thead><tr><th>Leçon</th><th>Durée</th><th>Scènes</th><th>Voix</th><th>Exercice</th><th></th></tr></thead><tbody>${m.lessons
        .map(
          (l) => `<tr><td><b>${l.n}.</b> ${esc(l.title)}</td><td>${fmtMin(lessonDuration(l))}</td><td>${l.scenes.length}</td><td>${l.voice ? '<span class="chip chip--ok">montée</span>' : voiceLocal(l.id) ? '<span class="chip chip--or">enregistrée</span>' : '<span class="chip">à faire</span>'}</td><td>${esc(l.widget || 'Applique')}</td><td><div class="acts"><a class="b b--s" href="../motion/player.html?id=${l.id}" target="_blank">${icon('play', { size: 14 })}</a><a class="b b--s" href="#/studio/${l.id}">${icon('mic', { size: 14 })}</a></div></td></tr>`,
        )
        .join('')}</tbody></table></div></section>`,
    ).join('')}</div>`,
  );
}

function viewSettings() {
  const d = S.load();
  shell(
    '#/reglages',
    `<div class="ph-h"><div><h1>Réglages</h1><p>Démo : les données restent dans ce navigateur.</p></div></div>
    <div style="display:grid;gap:12px;max-width:640px">
      <form class="card" id="sf" style="display:grid;gap:12px">
        <label class="lbl">Nom de la prochaine session (donné aux nouveaux étudiants)<input class="in" name="cohort" value="${esc(d.settings.cohort)}"></label>
        <label class="lbl">Numéro WhatsApp de l’équipe<input class="in" name="whatsapp" value="${esc(d.settings.whatsapp)}" inputmode="tel"></label>
        <button class="b b--or" type="submit">Enregistrer</button>
      </form>
      <section class="card" style="display:grid;gap:10px"><p class="card-k">Données</p><p class="muted" style="margin:0">En production, ces données vivent sur un serveur (Worker Cloudflare + D1, ou la base de Hooked Lab) et l’équipe les retrouve sur tous ses appareils.</p>
        <div class="acts"><button class="b b--s" id="exp" type="button">${icon('download', { size: 15 })} Exporter (JSON)</button><button class="b b--s b--danger" id="rst" type="button">Remettre les données d’exemple</button></div></section>
      <section class="card"><p class="card-k">Accès</p><p class="muted" style="margin:0">Code équipe de la démo : <code style="color:var(--gold-300)">${S.TEAM_CODE}</code>. Compte étudiant démo : <code style="color:var(--gold-300)">${S.DEMO_STUDENT.email}</code> / <code style="color:var(--gold-300)">${S.DEMO_STUDENT.code}</code>.</p></section>
    </div>`,
  );
  $('#sf').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    const dd = S.load();
    Object.assign(dd.settings, f);
    S.save(dd);
    toast('Réglages enregistrés');
  });
  $('#exp').addEventListener('click', () => download(`hooked-academy-donnees-${S.iso()}.json`, JSON.stringify(S.load(), null, 2), 'application/json'));
  $('#rst').addEventListener('click', () => {
    if (!confirm('Remettre les données d’exemple ? Les inscriptions de ce navigateur seront effacées.')) return;
    S.reset();
    S.loginAdmin(S.TEAM_CODE);
    toast('Données remises à zéro');
    viewSettings();
  });
}

/* ------------------------------------------------------------------ */

function route() {
  $$('.drawer').forEach((d) => d.remove());
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
  if (h.startsWith('#/studio')) return viewStudio(h.split('/')[2]);
  if (h === '#/programme') return viewProgramme();
  if (h === '#/reglages') return viewSettings();
  return viewOverview();
}
addEventListener('hashchange', route);
// Une inscription envoyée depuis la landing (autre onglet) apparaît sans recharger
addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('hooked-academy:data') && !document.querySelector('.drawer')) route();
});
(document.fonts ? document.fonts.ready : Promise.resolve()).then(route);
