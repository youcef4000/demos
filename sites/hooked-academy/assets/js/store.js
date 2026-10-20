// Hooked Academy — données de la plateforme : inscriptions, étudiants, progression.
// Démo sans serveur : tout est enregistré dans ce navigateur (localStorage). La landing dépose les
// inscriptions, l'équipe les traite dans l'admin (contact WhatsApp, paiement, validation) et la
// validation crée l'accès étudiant (e-mail + code). En production, ces fonctions appelleraient une
// API (Worker Cloudflare + D1, ou la base de Hooked Lab) avec exactement les mêmes entrées/sorties.

const KEY = 'hooked-academy:data:v1';
const SESSION = 'hooked-academy:session:v1';
const ADMIN = 'hooked-academy:admin:v1';
export const VERSION = 2;
export const TEAM_CODE = 'HOOKED-TEAM';
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
export const PACKS = ['creative', 'ia', 'both'];
export const packTracks = (f) => (f === 'creative' ? ['creative'] : f === 'ia' ? ['ia'] : ['creative', 'ia']);
export const packOf = (tracks = []) => (tracks.includes('creative') && tracks.includes('ia') ? 'both' : tracks.includes('ia') ? 'ia' : tracks.includes('creative') ? 'creative' : null);
const lessonTrack = (id) => (String(id).startsWith('ia') ? 'ia' : 'creative');
const plusDays = (from, days) => new Date(from + days * 864e5).toISOString();

/**
 * Comptes à mot de passe (créés par l'équipe). Ni l'e-mail ni le mot de passe ne sont écrits en clair :
 * on garde l'empreinte SHA-256 de l'e-mail et une dérivation PBKDF2 (SHA-256, 310000 itérations) du mot de passe.
 * Site statique : la vérification se fait dans le navigateur. Ce n'est pas une vraie sécurité serveur,
 * seulement de quoi ne pas publier d'identifiants lisibles. Pour la production : une API d'authentification.
 */
const ACCOUNTS = [
  {
    studentId: 'st-youcef',
    emailHash: 'db1572b1c8e0b2192074866704364e1acdb42f4284baf23279601b55e5720969',
    salt: '94aad5e8fc81e5d62f36079fe0989450',
    iter: 310000,
    passHash: '18f6257adb0a6762c3c2ccfb879219f0b865880f1137010d4f4a80fd4afdad30',
    profile: { name: 'Youcef', firstName: 'Youcef', cohort: 'Équipe Hooked', role: 'formateur' },
  },
];

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

const read = (k) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch (err) {
    console.warn('Enregistrement impossible', err);
    return false;
  }
};

export const uid = (p = 'x') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const pad = (n) => String(n).padStart(2, '0');
export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n, h = 10, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

function accessCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('');
  return `HA-${part()}-${part()}`;
}

/* ------------------------------------------------------------------ */
/* Données d'exemple : clairement marquées, remplacées par les vraies   */
/* ------------------------------------------------------------------ */

function seed() {
  const ex = (o) => ({ exemple: true, notes: [], history: [{ at: o.createdAt, status: 'nouvelle', by: 'Formulaire' }], ...o });
  const applications = [
    ex({ id: 'ex-a1', createdAt: daysAgo(0, 9, 14), name: 'Exemple — Amina B.', phone: '0550 00 00 01', email: 'amina.exemple@mail.dz', city: 'Alger', profil: 'ecommercant', niveau: 'Je vends déjà, mes pubs ne marchent pas', objectif: 'Faire mes propres vidéos pour ma boutique de cosmétiques', status: 'nouvelle' }),
    ex({ id: 'ex-a2', createdAt: daysAgo(0, 11, 2), name: 'Exemple — Yacine K.', phone: '0661 00 00 02', email: 'yacine.exemple@mail.dz', city: 'Oran', profil: 'freelance', niveau: 'Je fais déjà du montage', objectif: 'Proposer des créatives IA à mes clients', status: 'nouvelle' }),
    ex({ id: 'ex-a3', createdAt: daysAgo(1, 16, 40), name: 'Exemple — Sara M.', phone: '0770 00 00 03', email: 'sara.exemple@mail.dz', city: 'Constantine', profil: 'debutant', niveau: 'Débutante complète', objectif: 'Apprendre un métier et trouver mes premiers clients', status: 'contactee', notes: [{ at: daysAgo(1, 17), by: 'Équipe', text: 'Appel fait, intéressée par la session du mois prochain.' }] }),
    ex({ id: 'ex-a4', createdAt: daysAgo(2, 10, 5), name: 'Exemple — Walid H.', phone: '0555 00 00 04', email: 'walid.exemple@mail.dz', city: 'Sétif', profil: 'ecommercant', niveau: 'Je vends déjà', objectif: 'Scaler mes pubs avec l’UGC IA', status: 'paiement', notes: [{ at: daysAgo(2, 12), by: 'Équipe', text: 'Paiement BaridiMob annoncé, en attente de reçu.' }] }),
    ex({ id: 'ex-a5', createdAt: daysAgo(4, 14, 30), name: 'Exemple — Nour E.', phone: '0698 00 00 05', email: 'nour.exemple@mail.dz', city: 'Blida', profil: 'createur', niveau: 'Je crée déjà du contenu', objectif: 'Passer à la vidéo cinématique', status: 'validee' }),
    ex({ id: 'ex-a6', createdAt: daysAgo(6, 19, 12), name: 'Exemple — Karim D.', phone: '0540 00 00 06', email: 'karim.exemple@mail.dz', city: 'Tizi Ouzou', profil: 'agence', niveau: 'Équipe de 3 personnes', objectif: 'Former l’équipe au prompting', status: 'refusee', notes: [{ at: daysAgo(5, 10), by: 'Équipe', text: 'Préfère une formation en présentiel : orienté vers la prochaine masterclass.' }] }),
  ];

  // Compte démo : volontairement presque vide (une leçon ouverte par formation)
  const lessons = { 'm1-l1': { done: false, watched: 12 } };
  const days = [0].map((n) => iso(new Date(Date.now() - n * 864e5)));
  const demo = {
    id: 'st-demo',
    appId: 'ex-a5',
    exemple: true,
    name: 'Compte démo',
    firstName: 'Créateur',
    email: DEMO_STUDENT.email,
    phone: '',
    code: DEMO_STUDENT.code,
    createdAt: daysAgo(7),
    active: true,
    cohort: 'Session découverte',
    demo: true,
    progress: { lessons, last: 'm1-l1', days, xp: 0, badges: [] },
  };
  return ensureAccounts({ version: VERSION, applications, students: [demo], settings: { whatsapp: '213558678038', cohort: 'Prochaine session' } });
}

/** Ajoute les comptes à mot de passe qui manquent (sans toucher à leur progression s'ils existent). */
function ensureAccounts(d) {
  let changed = false;
  ACCOUNTS.forEach((a) => {
    if (d.students.some((s) => s.id === a.studentId)) return;
    d.students.push({
      id: a.studentId,
      appId: null,
      exemple: false,
      ...a.profile,
      email: '',
      phone: '',
      code: null,
      protected: true,
      createdAt: new Date().toISOString(),
      active: true,
      progress: { lessons: {}, last: null, days: [], xp: 0, badges: [] },
    });
    changed = true;
  });
  d._accountsChanged = changed;
  return d;
}

/* ------------------------------------------------------------------ */

export function load() {
  const d = read(KEY);
  if (d && d.version === VERSION) {
    ensureAccounts(d);
    if (d._accountsChanged) {
      delete d._accountsChanged;
      write(KEY, d);
    }
    delete d._accountsChanged;
    return d;
  }
  const s = seed();
  delete s._accountsChanged;
  write(KEY, s);
  return s;
}
export const save = (d) => write(KEY, d);
export function reset() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SESSION);
    localStorage.removeItem(ADMIN);
  } catch {}
}

/** Inscription envoyée depuis la landing. */
export function addApplication(form) {
  const d = load();
  const app = {
    id: uid('ins-'),
    createdAt: new Date().toISOString(),
    name: String(form.name || '').trim(),
    phone: String(form.phone || '').trim(),
    email: String(form.email || '').trim().toLowerCase(),
    city: String(form.city || '').trim(),
    profil: form.profil || 'debutant',
    formation: ['creative', 'ia', 'both'].includes(form.formation) ? form.formation : 'both',
    lang: ['fr', 'en', 'ar'].includes(form.lang) ? form.lang : 'fr',
    niveau: String(form.niveau || '').trim(),
    objectif: String(form.objectif || '').trim(),
    source: form.source || 'Landing',
    status: 'nouvelle',
    notes: [],
    history: [{ at: new Date().toISOString(), status: 'nouvelle', by: 'Formulaire' }],
  };
  d.applications.unshift(app);
  save(d);
  return app;
}

export function updateApplication(id, patch, by = 'Équipe') {
  const d = load();
  const a = d.applications.find((x) => x.id === id);
  if (!a) return null;
  if (patch.status && patch.status !== a.status) a.history.push({ at: new Date().toISOString(), status: patch.status, by });
  if (patch.note) a.notes.push({ at: new Date().toISOString(), by, text: patch.note });
  const { note, ...rest } = patch;
  Object.assign(a, rest);
  save(d);
  return a;
}

/** Valide une inscription : crée (ou réactive) l'accès étudiant et renvoie le message à envoyer. */
export function validateApplication(id, by = 'Équipe') {
  const d = load();
  const a = d.applications.find((x) => x.id === id);
  if (!a) return null;
  let st = d.students.find((s) => s.appId === a.id || (a.email && s.email === a.email));
  if (!st) {
    st = {
      id: uid('st-'),
      appId: a.id,
      exemple: !!a.exemple,
      name: a.name,
      firstName: a.name.replace(/^Exemple — /, '').split(/\s+/)[0] || 'Créateur',
      email: a.email,
      phone: a.phone,
      code: accessCode(),
      createdAt: new Date().toISOString(),
      active: true,
      cohort: d.settings.cohort,
      access: packTracks(a.formation),
      expiresAt: plusDays(Date.now(), ACCESS_DAYS),
      progress: { lessons: {}, last: null, days: [], xp: 0, badges: [] },
    };
    d.students.push(st);
  } else {
    // Réinscription : on ajoute les formations du nouveau pack et on repart pour un an
    st.active = true;
    st.access = [...new Set([...accessOf(st), ...packTracks(a.formation)])].filter((x) => TRACK_IDS.includes(x));
    st.expiresAt = plusDays(Math.max(Date.now(), Date.parse(st.expiresAt || 0) || 0), ACCESS_DAYS);
  }
  if (a.status !== 'validee') a.history.push({ at: new Date().toISOString(), status: 'validee', by });
  a.status = 'validee';
  a.studentId = st.id;
  save(d);
  return { app: a, student: st, message: welcomeMessage(st) };
}

export function welcomeMessage(st) {
  const url = new URL('app/', location.href.replace(/(admin|app)\/.*$/, '')).href;
  return `Salam ${st.firstName} ! Ton inscription à Hooked Academy est validée 🎉\n\nTon espace étudiant : ${url}\nIdentifiant : ${st.email || st.phone}\nCode d'accès : ${st.code}\n\nCommence par le module 1 — 2 minutes par leçon. Bonne formation !`;
}

export function setStudentActive(id, active) {
  const d = load();
  const st = d.students.find((s) => s.id === id);
  if (!st) return null;
  st.active = active;
  save(d);
  return st;
}

/** Formations ouvertes à un étudiant (le compte formateur et les comptes d'avant les packs ont les deux). */
export const accessOf = (st) => (!st ? [] : st.protected || !Array.isArray(st.access) ? [...TRACK_IDS] : st.access.filter((x) => TRACK_IDS.includes(x)));
/** L'accès d'un an est-il terminé ? */
export const isExpired = (st) => !!st && !st.protected && !!st.expiresAt && Date.now() > Date.parse(st.expiresAt);
/** L'étudiant a-t-il cette formation dans son pack (et un accès en cours) ? */
export const hasTrack = (st, track) => !!st && !isDemo(st) && accessOf(st).includes(track) && !isExpired(st);

/** Espace équipe : choisir les formations d'un étudiant (au moins zéro, au plus les deux). */
export function setStudentAccess(id, tracks) {
  const d = load();
  const st = d.students.find((s) => s.id === id);
  if (!st || st.protected) return null;
  st.access = TRACK_IDS.filter((x) => tracks.includes(x));
  if (!st.expiresAt) st.expiresAt = plusDays(Date.now(), ACCESS_DAYS);
  save(d);
  return st;
}
/** Espace équipe : prolonger l'accès (par défaut d'un an, à partir de la date de fin si elle n'est pas passée). */
export function extendStudent(id, days = ACCESS_DAYS) {
  const d = load();
  const st = d.students.find((s) => s.id === id);
  if (!st || st.protected) return null;
  st.expiresAt = plusDays(Math.max(Date.now(), Date.parse(st.expiresAt || 0) || 0), days);
  save(d);
  return st;
}
/** Espace équipe : fixer la date de fin d'accès (AAAA-MM-JJ). */
export function setStudentExpiry(id, ymd) {
  const d = load();
  const st = d.students.find((s) => s.id === id);
  if (!st || st.protected || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  st.expiresAt = new Date(`${ymd}T23:59:59`).toISOString();
  save(d);
  return st;
}

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
async function sha256(text) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}
async function pbkdf2(pass, saltHex, iter) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations: iter }, key, 256));
}

/**
 * Connexion étudiant : e-mail (ou téléphone) + mot de passe ou code d'accès. Asynchrone.
 * Renvoie { student } ou { error: 'bad' | 'suspended', message } (message en français, à traduire côté interface).
 */
export async function loginStudent(ident, secret) {
  const d = load();
  const id = String(ident || '').trim().toLowerCase().replace(/\s+/g, '');
  const raw = String(secret || '').trim();
  const bad = { error: 'bad', message: 'Identifiant ou mot de passe incorrect.' };
  if (!id || !raw) return bad;
  // 1. Comptes à mot de passe (empreintes)
  if (globalThis.crypto?.subtle) {
    const eh = await sha256(`hooked-academy:${id}`);
    const acc = ACCOUNTS.find((a) => a.emailHash === eh);
    if (acc) {
      if ((await pbkdf2(raw, acc.salt, acc.iter)) !== acc.passHash) return bad;
      const st = d.students.find((s) => s.id === acc.studentId);
      if (!st) return bad;
      if (!st.active) return { error: 'suspended', message: 'Ton accès est suspendu. Contacte l’équipe.' };
      write(SESSION, { role: 'student', id: st.id, at: Date.now() });
      return { student: st };
    }
  }
  // 2. Codes d'accès remis à la validation (HA-XXXX-XXXX) et compte démo
  const c = raw.toUpperCase();
  const st = d.students.find((s) => !s.protected && (s.email === id || (s.phone || '').replace(/\s+/g, '') === id) && s.code === c);
  if (!st) return bad;
  if (!st.active) return { error: 'suspended', message: 'Ton accès est suspendu. Contacte l’équipe.' };
  write(SESSION, { role: 'student', id: st.id, at: Date.now() });
  return { student: st };
}

/** Le compte démo (ou ?demo=1) : accès limité à DEMO_OPEN. */
export const isDemo = (st) => !!st && (st.demo || st.id === 'st-demo');
/** Une leçon est-elle ouverte pour cet étudiant ? (bienvenue : tout le monde ; démo : DEMO_OPEN ; sinon : son pack) */
export const canAccess = (st, lessonId) => !!st && (FREE_OPEN.includes(lessonId) || (isDemo(st) ? DEMO_OPEN.includes(lessonId) : hasTrack(st, lessonTrack(lessonId))));

export function loginAdmin(code) {
  if (String(code || '').trim().toUpperCase() !== TEAM_CODE) return false;
  write(ADMIN, { role: 'admin', at: Date.now() });
  return true;
}
export const adminSession = () => read(ADMIN);
export function logoutAdmin() {
  try {
    localStorage.removeItem(ADMIN);
  } catch {}
}

export const session = () => read(SESSION);
export function logout() {
  try {
    localStorage.removeItem(SESSION);
  } catch {}
}

export function currentStudent() {
  const s = session();
  if (!s || s.role !== 'student') return null;
  return load().students.find((x) => x.id === s.id) || null;
}

/** Met à jour la progression d'une leçon et l'XP. */
export function recordLesson(studentId, lessonId, patch) {
  const d = load();
  const st = d.students.find((s) => s.id === studentId);
  if (!st) return null;
  const P = st.progress;
  const prev = P.lessons[lessonId] || {};
  const next = { ...prev, ...patch };
  let gained = 0;
  if (patch.done && !prev.done) {
    next.at = new Date().toISOString();
    gained += 100;
  }
  if (typeof patch.quiz === 'number' && (prev.quiz ?? -1) < patch.quiz) gained += Math.round(patch.quiz * 50) - Math.round(Math.max(0, prev.quiz || 0) * 50);
  P.lessons[lessonId] = next;
  P.last = lessonId;
  P.xp = (P.xp || 0) + Math.max(0, gained);
  const today = iso();
  if (!P.days.includes(today)) P.days.push(today);
  save(d);
  return { student: st, gained };
}

export function awardBadge(studentId, badge) {
  const d = load();
  const st = d.students.find((s) => s.id === studentId);
  if (!st || st.progress.badges.includes(badge)) return false;
  st.progress.badges.push(badge);
  save(d);
  return true;
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
