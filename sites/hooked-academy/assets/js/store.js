// Hooked Academy — données de l'espace étudiant.
// Les inscriptions, les comptes et la progression sont gardés par le serveur (worker/academy.js, via api.js).
// Ce navigateur garde une copie de l'étudiant connecté (affichage immédiat, hors ligne) et renvoie sa
// progression au serveur. Le compte démo vit seulement ici, sans serveur.

import { PUB } from '../../data/serveur.js';
import { api, apiUrl, proofLogin, ApiError } from './api.js';

const ME = 'hooked-academy:me:v2';
const OLD = ['hooked-academy:data:v1', 'hooked-academy:session:v1', 'hooked-academy:admin:v1'];
export const DEMO_STUDENT = { email: 'demo@hooked.academy', code: 'DEMO-2026' };

/** Le compte démo ne montre presque rien : une leçon par formation, le reste est verrouillé. */
export const DEMO_OPEN = ['m1-l1', 'ia1-l1'];
/** Bienvenue et prise en main de chaque formation : ouvertes à tous, en démo comme avant l'inscription. */
export const FREE_OPEN = ['m0-l1', 'm0-l2', 'ia0-l1', 'ia0-l4'];

/**
 * Accès par formation. Chaque pack ouvre une ou deux formations pour un an :
 * « creative » (Formation Créative), « ia » (Formation IA), « both » (les deux).
 * L'équipe peut ensuite ajouter ou retirer une formation et prolonger l'accès (espace équipe → Étudiants).
 */
export const TRACK_IDS = ['creative', 'ia'];
export const ACCESS_DAYS = 365;
const lessonTrack = (id) => (String(id).startsWith('ia') ? 'ia' : 'creative');

export const STATUS = {
  nouvelle: { label: 'Nouvelle', c: '#e0be55' },
  contactee: { label: 'Contactée', c: '#8fb8e8' },
  paiement: { label: 'Paiement en attente', c: '#ec7a45' },
  validee: { label: 'Validée', c: '#55b894' },
  refusee: { label: 'Refusée', c: '#8b8494' },
};
export const PROFILS = {
  debutant: 'Je débute',
  ecommercant: 'E-commerçant·e',
  freelance: 'Freelance / community manager',
  createur: 'Créateur·rice de contenu',
  agence: 'Agence / équipe marketing',
};

/** Réglages publiés par l'équipe (WhatsApp, session en cours). */
export const settings = () => ({ whatsapp: '213558678038', cohort: 'Prochaine session', ...(PUB?.settings || {}) });

const pad = (n) => String(n).padStart(2, '0');
export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(ME));
    return v && v.student && typeof v.student === 'object' ? v : null;
  } catch {
    return null;
  }
};
const write = (v) => {
  try {
    if (v) localStorage.setItem(ME, JSON.stringify(v));
    else localStorage.removeItem(ME);
  } catch {}
};
// Anciennes données de démonstration (avant le serveur) : la progression du formateur est reprise une fois
function legacyProgress() {
  try {
    const d = JSON.parse(localStorage.getItem(OLD[0]));
    return d?.students?.find((s) => s.id === 'st-youcef')?.progress || null;
  } catch {
    return null;
  }
}
function dropLegacy() {
  try {
    OLD.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/* ------------------------------------------------------------------ */
/* Progression : copie locale, renvoyée au serveur                     */
/* ------------------------------------------------------------------ */

const emptyProgress = () => ({ lessons: {}, last: null, days: [], xp: 0, badges: [] });
/** Deux appareils, une progression : on garde le meilleur de chacun (même règle que le serveur). */
export function mergeProgress(a = emptyProgress(), b = emptyProgress()) {
  const o = {
    lessons: { ...(a.lessons || {}) },
    last: b.last || a.last || null,
    days: [...new Set([...(a.days || []), ...(b.days || [])])].sort().slice(-1000),
    xp: Math.max(a.xp || 0, b.xp || 0),
    badges: [...new Set([...(a.badges || []), ...(b.badges || [])])],
  };
  for (const [k, v] of Object.entries(b.lessons || {})) {
    const x = o.lessons[k] || {};
    const m = { ...x, ...v };
    if (x.done || v.done) m.done = true;
    if (x.todoDone || v.todoDone) m.todoDone = true;
    if (x.watched || v.watched) m.watched = Math.max(x.watched || 0, v.watched || 0);
    if (x.quiz != null || v.quiz != null) m.quiz = Math.max(x.quiz ?? 0, v.quiz ?? 0);
    if (x.at && v.at) m.at = x.at < v.at ? x.at : v.at;
    o.lessons[k] = m;
  }
  return o;
}

let timer = null;
/** Envoie la progression au serveur (regroupé : une requête au plus toutes les 2 secondes). */
function sync(now = false) {
  const cur = read();
  if (!cur || cur.demo) return;
  clearTimeout(timer);
  const send = async () => {
    const c = read();
    if (!c || c.demo || !c.dirty) return;
    try {
      const r = await api('PUT', 'me/progress', { progress: c.student.progress });
      const after = read();
      if (after?.student.id !== c.student.id) return;
      after.student.progress = mergeProgress(r.progress, after.student.progress);
      // D'autres changements sont arrivés pendant l'envoi : ils partiront au prochain tour
      after.dirty = JSON.stringify(after.student.progress) !== JSON.stringify(r.progress);
      write(after);
      if (after.dirty) sync();
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return;
      timer = setTimeout(send, 30000);
    }
  };
  if (now) send();
  else timer = setTimeout(send, 2000);
}
// La page se ferme : dernier envoi, même si l'onglet disparaît
addEventListener('pagehide', () => {
  const c = read();
  if (!c || c.demo || !c.dirty) return;
  try {
    fetch(apiUrl('me/progress'), {
      method: 'PUT',
      keepalive: true,
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-ha': '1' },
      body: JSON.stringify({ progress: c.student.progress }),
    });
  } catch {}
});

function change(fn) {
  const c = read();
  if (!c) return null;
  const out = fn(c.student);
  c.dirty = !c.demo;
  write(c);
  sync();
  return out;
}

/* ------------------------------------------------------------------ */
/* Connexion                                                           */
/* ------------------------------------------------------------------ */

function demoAccount() {
  return {
    id: 'st-demo',
    demo: true,
    name: 'Compte démo',
    firstName: 'Créateur',
    email: DEMO_STUDENT.email,
    phone: '',
    cohort: 'Session découverte',
    active: true,
    access: [],
    progress: { lessons: { 'm1-l1': { done: false, watched: 12 } }, last: 'm1-l1', days: [iso()], xp: 0, badges: [] },
  };
}
const normCode = (s) => {
  const c = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^HA[A-Z0-9]{8}$/.test(c) ? `HA-${c.slice(2, 6)}-${c.slice(6)}` : '';
};
const errOf = (e) => {
  if (!(e instanceof ApiError)) return { error: 'bad' };
  if (e.status === 403 && e.code === 'suspended') return { error: 'suspended' };
  if (e.status === 429) return { error: 'rate' };
  if (e.status === 0 || e.code === 'no_server' || e.status >= 500) return { error: 'offline' };
  return { error: 'bad' };
};
function opened(data) {
  const prev = read();
  const st = data.student;
  let progress = st.progress || emptyProgress();
  // Même étudiant déjà connu sur cet appareil : sa progression locale non envoyée est gardée
  if (prev && !prev.demo && prev.student.id === st.id) progress = mergeProgress(progress, prev.student.progress);
  if (st.id === 'st-trainer' && legacyProgress()) progress = mergeProgress(progress, legacyProgress());
  dropLegacy();
  const dirty = JSON.stringify(progress) !== JSON.stringify(st.progress || emptyProgress());
  write({ student: { ...st, progress }, member: { faq: data.faq || null, res: data.res || {} }, dirty, at: Date.now() });
  if (dirty) sync(true);
  return read().student;
}

/**
 * Connexion étudiant : e-mail (ou téléphone) + code d'accès (HA-XXXX-XXXX), ou le compte de l'équipe (mot de passe).
 * Renvoie { student } ou { error: 'bad' | 'suspended' | 'rate' | 'offline' }.
 */
export async function loginStudent(ident, secret) {
  const id = String(ident || '').trim();
  const raw = String(secret || '').trim();
  if (!id || !raw) return { error: 'bad' };
  if (id.toLowerCase() === DEMO_STUDENT.email && raw.toUpperCase() === DEMO_STUDENT.code) {
    const prev = read();
    write({ student: prev?.demo ? prev.student : demoAccount(), demo: true, member: { faq: null, res: {} }, at: Date.now() });
    return { student: read().student };
  }
  try {
    const code = normCode(raw);
    const data = code ? await api('POST', 'login', { ident: id, code }) : await proofLogin('login', id, raw);
    return { student: opened(data) };
  } catch (e) {
    return errOf(e);
  }
}

/**
 * Au chargement de l'espace étudiant : profil, accès et contenus réservés à jour depuis le serveur.
 * Renvoie 'ok', 'offline' (on garde la copie locale) ou 'out' (session fermée, suspendue ou expirée).
 */
export async function refresh() {
  const c = read();
  if (!c || c.demo) return 'ok';
  try {
    opened(await api('GET', 'me', undefined, { timeout: 8000 }));
    return 'ok';
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      write(null);
      return 'out';
    }
    return 'offline';
  }
}

export function logout() {
  const c = read();
  write(null);
  if (c && !c.demo) api('POST', 'logout').catch(() => {});
}

export function currentStudent() {
  return read()?.student || null;
}
/** Contenus réservés aux membres : FAQ de l'assistant pro, ressources de leurs formations. */
export const member = () => read()?.member || { faq: null, res: {} };

/** Inscription envoyée depuis la landing. Renvoie { ok, id } ; lève ApiError si le serveur ne répond pas. */
export async function addApplication(form) {
  const pick = (k, max) => String(form[k] || '').trim().slice(0, max);
  return api('POST', 'apply', {
    name: pick('name', 80),
    phone: pick('phone', 30),
    email: pick('email', 120),
    city: pick('city', 60),
    profil: pick('profil', 20),
    formation: pick('formation', 10),
    lang: pick('lang', 2),
    niveau: pick('niveau', 200),
    objectif: pick('objectif', 500),
    source: pick('source', 40) || 'Landing',
    website: pick('website', 200),
  });
}

/* ------------------------------------------------------------------ */
/* Accès                                                               */
/* ------------------------------------------------------------------ */

/** Formations ouvertes à un étudiant (le compte formateur a les deux). */
export const accessOf = (st) => (!st ? [] : st.protected ? [...TRACK_IDS] : (Array.isArray(st.access) ? st.access : []).filter((x) => TRACK_IDS.includes(x)));
/** L'accès d'un an est-il terminé ? */
export const isExpired = (st) => !!st && !st.protected && !!st.expiresAt && Date.now() > Date.parse(st.expiresAt);
/** L'étudiant a-t-il cette formation dans son pack (et un accès en cours) ? */
export const hasTrack = (st, track) => !!st && !isDemo(st) && st.active !== false && accessOf(st).includes(track) && !isExpired(st);
/** Le compte démo : accès limité à DEMO_OPEN. */
export const isDemo = (st) => !!st && (st.demo || st.id === 'st-demo');
/** Une leçon est-elle ouverte pour cet étudiant ? (bienvenue : tout le monde ; démo : DEMO_OPEN ; sinon : son pack) */
export const canAccess = (st, lessonId) => !!st && (FREE_OPEN.includes(lessonId) || (isDemo(st) ? DEMO_OPEN.includes(lessonId) : hasTrack(st, lessonTrack(lessonId))));

export const TODO_XP = 40;

/** Met à jour la progression d'une leçon et l'XP. */
export function recordLesson(studentId, lessonId, patch) {
  return change((st) => {
    if (st.id !== studentId) return null;
    const P = (st.progress ||= emptyProgress());
    const prev = P.lessons[lessonId] || {};
    const next = { ...prev, ...patch };
    let gained = 0;
    if (patch.done && !prev.done) {
      next.at = new Date().toISOString();
      gained += 100;
    }
    if (typeof patch.quiz === 'number' && (prev.quiz ?? -1) < patch.quiz) gained += Math.round(patch.quiz * 50) - Math.round(Math.max(0, prev.quiz || 0) * 50);
    // Partie pratique : toutes les actions de la to-do cochées (une seule fois par leçon)
    if (patch.todoDone && !prev.todoDone) gained += TODO_XP;
    P.lessons[lessonId] = next;
    P.last = lessonId;
    P.xp = (P.xp || 0) + Math.max(0, gained);
    const today = iso();
    if (!P.days.includes(today)) P.days.push(today);
    return { student: st, gained };
  });
}

export function awardBadge(studentId, badge) {
  return !!change((st) => {
    if (st.id !== studentId || st.progress.badges.includes(badge)) return false;
    st.progress.badges.push(badge);
    return true;
  });
}
export function gainXP(n) {
  change((st) => (st.progress.xp = (st.progress.xp || 0) + n));
}
/** Compte démo : repartir de zéro. */
export function resetProgress() {
  change((st) => (st.progress = emptyProgress()));
}

/** Série de jours consécutifs d'apprentissage. */
export function streak(days = []) {
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  if (!set.has(iso(d))) d.setDate(d.getDate() - 1);
  while (set.has(iso(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const LEVELS = [
  { xp: 0, name: 'Scrolleur', ar: 'متصفح' },
  { xp: 400, name: 'Accrocheur', ar: 'صاحب الهوك' },
  { xp: 1200, name: 'Créateur', ar: 'مبدع' },
  { xp: 2600, name: 'Directeur créatif', ar: 'مدير إبداعي' },
  { xp: 4600, name: 'Hooked Pro', ar: 'محترف' },
];
export function level(xp = 0) {
  let i = 0;
  LEVELS.forEach((l, k) => {
    if (xp >= l.xp) i = k;
  });
  const cur = LEVELS[i];
  const nxt = LEVELS[i + 1];
  return { ...cur, i, next: nxt, pct: nxt ? (xp - cur.xp) / (nxt.xp - cur.xp) : 1 };
}

export const BADGES = {
  'premier-pas': { name: 'Premier pas', desc: 'Première leçon terminée', icon: 'play' },
  fondations: { name: 'Fondations', desc: 'Module 1 terminé', icon: 'spark' },
  structure: { name: 'Architecte', desc: 'Module 2 terminé : Hook, Body, CTA', icon: 'layers' },
  'sans-faute': { name: 'Sans faute', desc: 'Un quiz à 100 %', icon: 'check' },
  prompteur: { name: 'Prompteur', desc: 'Module Prompting terminé', icon: 'chat' },
  serie: { name: 'En feu', desc: '5 jours d’affilée', icon: 'fire' },
  ia: { name: 'Créateur IA', desc: 'Images et vidéos IA terminées', icon: 'sparkles' },
  closer: { name: 'Closer', desc: 'Module Acquisition terminé', icon: 'handshake' },
  diplome: { name: 'Diplômé', desc: 'Toute la formation terminée', icon: 'trophy' },
};
