// Ce que l'application retient sur l'appareil (localStorage) : réglages, favoris, carnet, listes, licence.
// Rien n'est envoyé ailleurs.

import { CONFIG } from './config.js';

const CLE = 'benna.v1';

function langueParDefaut() {
  const l = (navigator.language || 'fr').toLowerCase();
  return l.startsWith('ar') ? 'ar' : l.startsWith('en') ? 'en' : 'fr';
}

function deviseParDefaut() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return tz.startsWith('Europe/') ? 'EUR' : 'DZD';
  } catch {
    return 'DZD';
  }
}

const DEFAUT = () => ({
  lang: langueParDefaut(),
  theme: 'auto',
  mesure: 'metric',
  devise: deviseParDefaut(),
  favoris: [],
  journal: [], // { id, date, etoiles, note, photo }
  gestesVus: [],
  courses: [], // { id, parts }
  coches: {}, // ingrédients cochés dans la liste
  coursesLibres: [], // { texte, fait }
  frigo: [],
  plans: {}, // semaine, ramadan : [{ creneau: idRecette }]
  prix: { DZD: {}, EUR: {} },
  perso: [],
  pro: { fiches: [], commandes: [] },
  essai: null, // date de début de l'essai
  licence: null, // jeton signé
  voix: false,
});

function charger() {
  try {
    return { ...DEFAUT(), ...JSON.parse(localStorage.getItem(CLE) || '{}') };
  } catch {
    return DEFAUT();
  }
}

export const etat = charger();

export function sauver() {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
    return true;
  } catch {
    return false; // stockage plein ou navigation privée
  }
}

export function toutEffacer() {
  localStorage.removeItem(CLE);
  Object.assign(etat, DEFAUT());
}

export const basculer = (liste, v) => {
  const i = liste.indexOf(v);
  if (i >= 0) liste.splice(i, 1);
  else liste.push(v);
  sauver();
};

/* ---------- Progression ---------- */

export const aujourdhui = () => new Date().toISOString().slice(0, 10);

export function stats() {
  const jours = [...new Set(etat.journal.map((j) => j.date.slice(0, 10)))].sort().reverse();
  let serie = 0;
  const d = new Date();
  // La série tient si l'on a cuisiné aujourd'hui ou hier, puis chaque jour précédent.
  if (jours[0] !== d.toISOString().slice(0, 10)) d.setDate(d.getDate() - 1);
  for (const j of jours) {
    if (j === d.toISOString().slice(0, 10)) {
      serie += 1;
      d.setDate(d.getDate() - 1);
    } else if (j < d.toISOString().slice(0, 10)) break;
  }
  const cuisinees = new Set(etat.journal.map((j) => j.id)).size;
  const xp = etat.journal.length * 20 + etat.gestesVus.length * 5;
  return { cuisinees, fois: etat.journal.length, serie, xp, niveau: Math.min(6, Math.floor(xp / 100) + 1), versSuivant: xp % 100 };
}

export const dejaCuisine = (id) => etat.journal.some((j) => j.id === id);

/* ---------- Licence : lien d'activation signé ---------- */

const depuis64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

// Un jeton : « B1.<contenu>.<signature> ». Le contenu est { p: 'plus' | 'pro', x: 'AAAA-MM-JJ', n: nom }.
// Renvoie le contenu si la signature est bonne, sinon null.
export async function lireJeton(jeton) {
  try {
    const [v, contenu, signature] = String(jeton || '').trim().split('.');
    if (v !== 'B1' || !contenu || !signature || !CONFIG.cleLicence) return null;
    const cle = await crypto.subtle.importKey('jwk', CONFIG.cleLicence, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const bon = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, cle, depuis64(signature), new TextEncoder().encode(contenu));
    if (!bon) return null;
    const c = JSON.parse(new TextDecoder().decode(depuis64(contenu)));
    return ['plus', 'pro'].includes(c.p) && /^\d{4}-\d{2}-\d{2}$/.test(c.x) ? c : null;
  } catch {
    return null;
  }
}

// Droits en cours : { plan: 'gratuit' | 'plus' | 'pro', source, fin, nom, essaiReste }.
export const droits = { plan: 'gratuit', source: null, fin: null, nom: null, essaiReste: 0 };

export async function calculerDroits() {
  Object.assign(droits, { plan: 'gratuit', source: null, fin: null, nom: null, essaiReste: 0 });
  if (etat.essai) {
    const ecoule = Math.floor((Date.now() - new Date(etat.essai).getTime()) / 86400000);
    droits.essaiReste = Math.max(0, CONFIG.essaiJours - ecoule);
    if (droits.essaiReste > 0) Object.assign(droits, { plan: 'pro', source: 'essai' });
  }
  const c = etat.licence ? await lireJeton(etat.licence) : null;
  if (c && c.x >= aujourdhui()) Object.assign(droits, { plan: c.p, source: 'licence', fin: c.x, nom: c.n || null });
  return droits;
}

export const acces = (niveau) => droits.plan === 'pro' || (niveau === 'plus' && droits.plan === 'plus');
