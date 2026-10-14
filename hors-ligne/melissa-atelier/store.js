// Melissa — données de l'atelier : rendez-vous, modèles, production, stock, achats, commandes, clientes.
// Démo sans serveur : tout est enregistré dans ce navigateur (localStorage). Le site lit les mêmes
// données pour proposer les créneaux encore libres et afficher les réalisations mises « en vitrine » ;
// ses demandes de rendez-vous arrivent dans l'espace atelier. En production, ces fonctions liraient
// et écriraient via une API (Worker Cloudflare + base D1, par exemple).
import { seed, VERSION, COLORS } from './seed.js';

export { COLORS };

const KEY = 'melissa:atelier:v1';
const REQ = 'melissa:demandes:v1';

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
    console.warn(err);
    return false;
  }
};

export function loadData() {
  const d = read(KEY);
  if (d && d.version === VERSION) return d;
  return seed(new Date());
}
export const isSaved = () => !!read(KEY);
export const saveData = (d) => write(KEY, d);
export function resetData() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(REQ);
  } catch {}
}
export function usageKB() {
  try {
    return Math.round(((localStorage.getItem(KEY) || '').length + (localStorage.getItem(REQ) || '').length) / 1024);
  } catch {
    return 0;
  }
}

// Demandes de rendez-vous envoyées depuis le site
export const readRequests = () => read(REQ) || [];
export const writeRequests = (list) => write(REQ, list);
export function addRequest(r) {
  const list = readRequests();
  list.push(r);
  return writeRequests(list);
}

export const uid = (p = 'x') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* Dates ------------------------------------------------------------- */
const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
// Semaine du samedi au vendredi, comme en Algérie
export const weekStart = (d) => addDays(d, -((d.getDay() + 1) % 7));
export const toMin = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number);
  return h * 60 + (m || 0);
};
export const fromMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_S = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const dayName = (d, short = false) => (short ? DAYS[d.getDay()].slice(0, 3) + '.' : DAYS[d.getDay()]);
export const fmtDate = (d, { weekday = false, year = false, short = false } = {}) => {
  if (typeof d === 'string') d = parseISO(d);
  const m = short ? MONTHS_S[d.getMonth()] : MONTHS[d.getMonth()];
  return `${weekday ? dayName(d, short) + ' ' : ''}${d.getDate() === 1 ? '1er' : d.getDate()} ${m}${year ? ' ' + d.getFullYear() : ''}`;
};
export const fmtHour = (hhmm) => String(hhmm).replace(':', 'h').replace(/h00$/, 'h');
export const money = (n) => `${String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DA`;

/* Rendez-vous ---------------------------------------------------------- */
// Couleurs validées (contraste, daltonisme) ; chaque rendez-vous affiche aussi son libellé.
export const RDV_TYPES = {
  essayage: { label: 'Essayage', site: 'Essayage en boutique', color: '#d4628d', duration: 60 },
  mesures: { label: 'Sur-mesure', site: 'Sur-mesure · prise de mesures', color: '#d08a0e', duration: 60 },
  gros: { label: 'Revendeuse', site: 'Achat en gros (revendeuses)', color: '#6b55b8', duration: 60 },
  visite: { label: "Visite d'atelier", site: "Visite de l'atelier", color: '#1a9d78', duration: 60 },
  fournisseur: { label: 'Fournisseur', color: '#2f78cc', duration: 60 },
  interne: { label: 'Atelier & shooting', color: '#e2693a', duration: 60 },
};
export const SITE_TYPES = ['essayage', 'mesures', 'gros', 'visite'];

const overlaps = (aStart, aDur, bStart, bDur) => aStart < bStart + bDur && bStart < aStart + aDur;

// Créneaux proposés sur le site pour un jour donné : [{ time, free }]
export function slotsFor(data, dateISO, requests = readRequests()) {
  const s = data.settings;
  const d = parseISO(dateISO);
  if (!s.openDays.includes(d.getDay())) return [];
  const step = Number(s.slot) || 60;
  const open = toMin(s.open);
  const close = toMin(s.close);
  const now = new Date();
  const isToday = iso(now) === dateISO;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const busy = [
    ...data.rdv.filter((r) => r.date === dateISO && r.status !== 'annule').map((r) => [toMin(r.start), Number(r.duration) || 60]),
    ...requests.filter((r) => r.date === dateISO).map((r) => [toMin(r.start), step]),
  ];
  const out = [];
  for (let t = open; t + step <= close; t += step) {
    const free = !(isToday && t <= nowMin + 60) && !busy.some(([b, dur]) => overlaps(t, step, b, dur));
    out.push({ time: fromMin(t), free });
  }
  return out;
}

/* Production ---------------------------------------------------------- */
export const STEPS = [
  ['coupe', 'Coupe'],
  ['couture', 'Couture'],
  ['finitions', 'Finitions'],
  ['repassage', 'Repassage'],
  ['controle', 'Contrôle & emballage'],
];
export function progressOf(p) {
  const q = Math.max(1, Number(p.qty) || 1);
  const sum = STEPS.reduce((a, [k]) => a + Math.min(q, Number(p.steps?.[k]) || 0), 0);
  return sum / (q * STEPS.length);
}
// 'avance' | 'ok' | 'retard' | 'fini'
export function paceOf(p, now = today()) {
  const prog = progressOf(p);
  if (prog >= 1) return 'fini';
  const start = parseISO(p.start);
  const end = parseISO(p.deadline);
  const span = Math.max(1, (end - start) / 864e5);
  const expected = Math.min(1, Math.max(0, (now - start) / 864e5 / span));
  if (now > end) return 'retard';
  if (prog >= expected + 0.12) return 'avance';
  if (prog >= expected - 0.08) return 'ok';
  return 'retard';
}

/* Stock ---------------------------------------------------------------- */
export const SIZES = ['S', 'M', 'L', 'XL'];
export const totalOf = (item) => item.variants.reduce((a, v) => a + Object.values(v.sizes).reduce((x, y) => x + (Number(y) || 0), 0), 0);
export function stockAlerts(data) {
  const out = [];
  for (const it of data.stock) {
    for (const v of it.variants) {
      for (const [size, q] of Object.entries(v.sizes)) {
        if ((Number(q) || 0) <= (Number(it.threshold) || 0)) out.push({ item: it, variant: v, size, qty: Number(q) || 0 });
      }
    }
  }
  return out.sort((a, b) => a.qty - b.qty);
}
export const lowMatieres = (data) => data.matieres.filter((m) => Number(m.qty) < Number(m.threshold));

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
