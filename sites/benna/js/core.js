// Calculs de Benna, sans rien qui touche à la page : portions, mesures, coûts, liste de courses, suggestions.
// Testé par tools/benna/test.mjs (node tools/benna/test.mjs).

import { INGREDIENTS, PLACARD, RAYONS } from './data/ingredients.js';

export const VERRE = 200; // le verre d'eau ordinaire, en ml
export const CUP = 240;
const CS = 15;
const CC = 5;
const PINCEE = 0.4; // grammes
export const UNITES_COMPTEES = ['pc', 'gousse', 'feuille', 'sachet', 'boite', 'botte', 'branche', 'tranche'];
const estCompte = (u) => UNITES_COMPTEES.includes(u);

/* ---------- Conversions ---------- */

export function enGrammes(ing, q, u) {
  const d = ing.d || 1;
  if (u === 'g') return q;
  if (u === 'ml') return q * d;
  if (u === 'cs') return q * CS * d;
  if (u === 'cc') return q * CC * d;
  if (u === 'pincee') return q * PINCEE;
  return q * (ing.w || 0);
}

export function enMl(ing, q, u) {
  const d = ing.d || 1;
  if (u === 'ml') return q;
  if (u === 'cs') return q * CS;
  if (u === 'cc') return q * CC;
  if (u === 'g') return q / d;
  if (u === 'pincee') return q * 0.5;
  return (q * (ing.w || 0)) / d;
}

/* ---------- Portions ---------- */

// Arrondit une quantité mise à l'échelle pour qu'elle reste mesurable en cuisine.
export function arrondir(q, u, id) {
  if (u === 'g' || u === 'ml') {
    if (q < 20) return Math.max(1, Math.round(q));
    if (q < 100) return Math.round(q / 5) * 5;
    if (q < 1000) return Math.round(q / 10) * 10;
    return Math.round(q / 50) * 50;
  }
  if (u === 'pincee') return Math.max(1, Math.round(q));
  if (u === 'pc' && id === 'oeuf') return Math.max(1, Math.round(q));
  return Math.max(0.25, Math.round(q * 4) / 4 >= 1 ? Math.round(q * 2) / 2 : Math.round(q * 4) / 4);
}

// Lignes d'ingrédients d'une recette pour un nombre de parts donné.
// Renvoie [{ groupe } | { id, q, u }].
export function lignes(recette, parts) {
  const f = parts / recette.serves;
  return recette.ing.map(([id, q, u]) => {
    if (id === '#') return { groupe: q };
    if (q == null) return { id, q: null, u: null };
    return { id, q: f === 1 ? q : arrondir(q * f, u, id), u };
  });
}

/* ---------- Affichage des quantités ---------- */

const GLYPHES = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];

// 1.5 → « 1 ½ », 0.33 → « ⅓ ». `pas` limite aux quarts (true) ou autorise les tiers (false).
export function fraction(n, quartsSeulement = false) {
  let entier = Math.floor(n + 1e-9);
  const reste = n - entier;
  let meilleur = GLYPHES[0];
  for (const g of GLYPHES) {
    if (quartsSeulement && (g[0] === 1 / 3 || g[0] === 2 / 3)) continue;
    if (Math.abs(g[0] - reste) < Math.abs(meilleur[0] - reste)) meilleur = g;
  }
  if (meilleur[0] === 1) entier += 1;
  const glyphe = meilleur[0] === 1 ? '' : meilleur[1];
  if (!entier && !glyphe) return '¼';
  return [entier || '', glyphe].filter(Boolean).join(' ');
}

const nombre = (n, lang) => new Intl.NumberFormat(lang === 'en' ? 'en' : 'fr', { maximumFractionDigits: 1 }).format(n);

// Écrit un volume en verres (ou cups), cuillères à soupe ou cuillères à café.
function volumeMaison(ml, mode, u) {
  const grand = mode === 'cups' ? CUP : VERRE;
  if (ml >= grand * 0.22) return { n: fraction(ml / grand), nb: ml / grand, u: mode === 'cups' ? 'cup' : 'verre' };
  if (ml >= 11) return { n: fraction(Math.round((ml / CS) * 2) / 2, true), nb: ml / CS, u: 'cs' };
  return { n: fraction(Math.max(0.25, Math.round((ml / CC) * 4) / 4), true), nb: ml / CC, u: 'cc' };
}

// Texte d'une quantité selon le mode de mesure : 'metric', 'maison' (verres et cuillères) ou 'cups'.
// `u(unite, n)` renvoie le libellé de l'unité dans la langue courante.
// Renvoie { principal, secondaire } : le secondaire rappelle les grammes quand on affiche des verres.
export function ecrire(id, q, unite, mode, lang, u) {
  if (q == null) return { principal: '', secondaire: '' };
  const ing = INGREDIENTS[id];
  const metrique = () => {
    if ((unite === 'g' || unite === 'ml') && q >= 1000) return `${nombre(q / 1000, lang)} ${u(unite === 'g' ? 'kg' : 'l', q / 1000)}`;
    if (unite === 'g' || unite === 'ml') return `${nombre(q, lang)} ${u(unite, q)}`;
    if (unite === 'pc') return fraction(q, true);
    return `${fraction(q, true)} ${u(unite, q)}`;
  };
  if (mode === 'metric' || !ing) return { principal: metrique(), secondaire: '' };
  if (unite === 'g' && ing.d > 0) {
    const v = volumeMaison(q / ing.d, mode);
    return { principal: `${v.n} ${u(v.u, v.nb)}`, secondaire: metrique() };
  }
  if (unite === 'ml') {
    const v = volumeMaison(q, mode);
    return { principal: `${v.n} ${u(v.u, v.nb)}`, secondaire: metrique() };
  }
  return { principal: metrique(), secondaire: '' };
}

/* ---------- Coûts ---------- */

export function prixDe(id, devise, perso) {
  const p = perso?.[devise]?.[id];
  return p != null ? p : INGREDIENTS[id]?.p[devise] || 0;
}

export function cout(id, q, u, devise, perso) {
  const ing = INGREDIENTS[id];
  if (!ing || q == null) return 0;
  const prix = prixDe(id, devise, perso);
  if (ing.per === 'pc') return prix * (estCompte(u) ? q : enGrammes(ing, q, u) / (ing.w || 1));
  if (ing.per === 'l') return (prix * enMl(ing, q, u)) / 1000;
  return (prix * enGrammes(ing, q, u)) / 1000;
}

export function coutRecette(recette, parts, devise, perso) {
  return lignes(recette, parts).reduce((s, l) => (l.id ? s + cout(l.id, l.q, l.u, devise, perso) : s), 0);
}

export const coutParPart = (recette, devise, perso) => coutRecette(recette, recette.serves, devise, perso) / recette.serves;

// Arrondi lisible d'un montant : dizaine de dinars, dixième d'euro.
export function arrondiPrix(n, devise) {
  if (devise === 'DZD') return n < 100 ? Math.round(n / 5) * 5 : Math.round(n / 10) * 10;
  return Math.round(n * 10) / 10;
}

export function ecrirePrix(n, devise, lang) {
  const v = arrondiPrix(n, devise);
  if (devise === 'DZD') return `${new Intl.NumberFormat('fr').format(v)} ${lang === 'ar' ? 'دج' : 'DA'}`;
  return `${new Intl.NumberFormat(lang === 'en' ? 'en' : 'fr', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)} €`;
}

// Trois niveaux de budget par part, pour les filtres.
export function niveauBudget(coutPart, devise) {
  const [petit, moyen] = devise === 'DZD' ? [150, 350] : [1.5, 3.5];
  return coutPart <= petit ? 1 : coutPart <= moyen ? 2 : 3;
}

/* ---------- Temps ---------- */

export const tempsActif = (r) => r.prep + r.cook;
export const tempsTotal = (r) => r.prep + r.cook + (r.rest || 0);

/* ---------- Liste de courses ---------- */

// Regroupe les ingrédients de plusieurs recettes. `choix` : [{ recette, parts }].
// Renvoie { rayons: [{ rayon, items }], placard: [items], total } ;
// un item : { id, q, u, cout, de: [idRecette] }.
export function listeCourses(choix, devise, perso) {
  const cumul = new Map();
  for (const { recette, parts } of choix) {
    for (const l of lignes(recette, parts)) {
      if (!l.id || l.id === 'eau') continue;
      const ing = INGREDIENTS[l.id];
      if (!ing) continue;
      const c = cumul.get(l.id) || { id: l.id, compte: 0, masse: 0, volume: 0, sansQuantite: false, cout: 0, de: new Set() };
      c.de.add(recette.id);
      if (l.q == null) c.sansQuantite = true;
      else {
        c.cout += cout(l.id, l.q, l.u, devise, perso);
        if (estCompte(l.u)) c.compte += l.q;
        else if (ing.per === 'l') c.volume += enMl(ing, l.q, l.u);
        else c.masse += enGrammes(ing, l.q, l.u);
      }
      cumul.set(l.id, c);
    }
  }
  const items = [...cumul.values()].map((c) => {
    const ing = INGREDIENTS[c.id];
    let q = null;
    let u = null;
    if (c.compte) {
      // Tout ramener à des unités comptées si une partie est donnée au poids.
      const enPlus = c.masse && ing.w ? c.masse / ing.w : 0;
      q = Math.ceil((c.compte + enPlus) * 2) / 2;
      u = uniteNaturelle(c.id);
    } else if (c.volume) {
      q = arrondir(c.volume, 'ml');
      u = 'ml';
    } else if (c.masse) {
      q = arrondir(c.masse, 'g');
      u = 'g';
    }
    return { id: c.id, rayon: ing.rayon, q, u, cout: c.cout, de: [...c.de] };
  });
  const dansPlacard = (it) => PLACARD.includes(it.id) && (it.q == null || (it.u === 'ml' && it.q < 100) || (it.u === 'g' && it.q < 30));
  const placard = items.filter(dansPlacard);
  const reste = items.filter((it) => !dansPlacard(it));
  return {
    rayons: RAYONS.map((rayon) => ({ rayon, items: reste.filter((it) => it.rayon === rayon) })).filter((g) => g.items.length),
    placard,
    total: reste.reduce((s, it) => s + it.cout, 0),
  };
}

// Unité comptée habituelle d'un ingrédient (gousse pour l'ail, botte pour le persil…).
const NATURELLES = { ail: 'gousse', persil: 'botte', coriandre: 'botte', basilic: 'botte', 'celeri-branche': 'branche', 'feuille-brick': 'feuille', nori: 'feuille', laurier: 'feuille', thon: 'boite', 'tomate-concassee': 'boite', 'levure-chimique': 'sachet', vanille: 'sachet', 'fromage-tranche': 'tranche' };
export const uniteNaturelle = (id) => NATURELLES[id] || 'pc';

/* ---------- Frigo et suggestions ---------- */

// Ingrédients qui comptent pour savoir si l'on peut faire une recette (hors placard).
export function besoins(recette) {
  return [...new Set(recette.ing.filter(([id]) => id !== '#' && !PLACARD.includes(id)).map(([id]) => id))];
}

// Pour chaque recette : part des ingrédients disponibles et liste de ceux qui manquent.
export function selonFrigo(recettes, frigo) {
  const ai = new Set(frigo);
  return recettes
    .map((r) => {
      const b = besoins(r);
      const manque = b.filter((id) => !ai.has(id));
      return { recette: r, score: b.length ? (b.length - manque.length) / b.length : 0, manque };
    })
    .sort((a, b) => b.score - a.score || a.manque.length - b.manque.length);
}

// « Ce soir on mange quoi ? » : filtre selon le temps, le budget et l'envie, puis tire au sort
// en favorisant ce que le frigo permet. `alea` est injectable pour les tests.
export function ceSoir(recettes, { minutes, budget, envie, frigo = [], devise, perso }, alea = Math.random) {
  const ok = recettes.filter((r) => {
    if (r.cat === 'base') return false;
    if (minutes && tempsTotal(r) > minutes) return false;
    if (envie === 'sale' && r.kind !== 'sale') return false;
    if (envie === 'sucre' && r.kind !== 'sucre') return false;
    if (envie === 'leger' && !(r.tags.includes('vegetarien') || r.cat === 'soupe')) return false;
    if (budget && niveauBudget(coutParPart(r, devise, perso), devise) > budget) return false;
    return true;
  });
  const classe = selonFrigo(ok, frigo).map((x) => ({ ...x, tirage: alea() + (frigo.length ? x.score : 0) }));
  return classe.sort((a, b) => b.tirage - a.tirage).slice(0, 3);
}

/* ---------- Atelier Pro : prix de revient ---------- */

// `matieres` : coût des ingrédients du lot ; `pieces` : nombre de pièces du lot ;
// emballage par pièce, énergie et autres frais par lot, heures de travail et taux horaire, marge en %.
export function prixDeRevient({ matieres, pieces, emballage = 0, frais = 0, heures = 0, taux = 0, marge = 0 }) {
  const n = Math.max(1, pieces);
  const travail = heures * taux;
  const lot = matieres + frais + travail + emballage * n;
  const revient = lot / n;
  const vente = revient * (1 + marge / 100);
  return { lot, revient, vente, benefice: (vente - revient) * n, travail, parPiece: { matieres: matieres / n, emballage, frais: frais / n, travail: travail / n } };
}

/* ---------- Recherche ---------- */

// Enlève accents et signes arabes pour comparer des textes saisis à la main.
export const simplifier = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ًͯ-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/œ/g, 'oe')
    .trim();

export function chercher(recettes, texte, lang) {
  const mots = simplifier(texte).split(/\s+/).filter(Boolean);
  if (!mots.length) return recettes;
  return recettes.filter((r) => {
    const foin = simplifier(
      [r.t.fr, r.t.ar, r.t.en, r.d[lang], ...r.ing.filter(([id]) => id !== '#').map(([id]) => Object.values(INGREDIENTS[id]?.n || {}).join(' '))].join(' '),
    );
    return mots.every((m) => foin.includes(m));
  });
}
