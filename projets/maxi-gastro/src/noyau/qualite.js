// Noyau « Le Passe » — contrôle qualité d'une fiche produit.
// Partagé entre la démo (navigateur) et le moteur (Node). Aucune dépendance.
// Le but n'est pas une note pour faire joli : c'est la liste de ce qui bloque
// une publication (METRO refuse une offre sans EAN, un transporteur a besoin du poids…).

import { eanValide } from './rapprochement.js';

export const CONTROLES = [
  { cle: 'ean', label: 'Code EAN', poids: 3, test: (p) => eanValide(p.ean), bloque: ['metro', 'amazon', 'google'] },
  { cle: 'poids', label: 'Poids', poids: 2, test: (p) => p.poidsKg > 0, bloque: ['livraison', 'metro', 'amazon'] },
  { cle: 'dimensions', label: 'Dimensions', poids: 2, test: (p) => Boolean(p.dimensions), bloque: ['livraison'] },
  { cle: 'prixAchat', label: "Prix d'achat", poids: 3, test: (p) => p.prixAchatHT > 0, bloque: ['prix'] },
  { cle: 'stock', label: 'Stock fournisseur', poids: 2, test: (p) => p.statutStock && p.statutStock !== 'inconnu', bloque: ['metro'] },
  { cle: 'photos', label: '3 photos ou plus', poids: 1, test: (p) => (p.nbImages ?? 0) >= 3, bloque: [] },
  { cle: 'description', label: 'Description riche (600 caractères)', poids: 1, test: (p) => (p.lgDescription ?? 0) >= 600, bloque: [] },
  { cle: 'categorie', label: 'Vraie catégorie (pas la référence)', poids: 1, test: (p) => Boolean(p.categorie) && p.categorie !== p.ref, bloque: ['google'] },
  { cle: 'notice', label: 'Notice ou fiche PDF', poids: 1, test: (p) => Boolean(p.notice), bloque: [] },
  { cle: 'delai', label: 'Délai de livraison', poids: 1, test: (p) => Number.isFinite(p.delaiJours), bloque: ['buybox'] },
];

/** Évalue une fiche : pourcentage pondéré, champs manquants, canaux bloqués. */
export function evaluerFiche(p) {
  let total = 0;
  let obtenu = 0;
  const manquants = [];
  const bloque = new Set();
  for (const c of CONTROLES) {
    total += c.poids;
    if (c.test(p)) obtenu += c.poids;
    else {
      manquants.push({ cle: c.cle, label: c.label });
      c.bloque.forEach((b) => bloque.add(b));
    }
  }
  return { pct: Math.round((obtenu / total) * 100), manquants, bloque: [...bloque] };
}

/** Résumé d'un catalogue entier : ce qui manque le plus souvent. */
export function bilanCatalogue(produits) {
  const compte = Object.fromEntries(CONTROLES.map((c) => [c.cle, 0]));
  let somme = 0;
  for (const p of produits) {
    const e = evaluerFiche(p);
    somme += e.pct;
    e.manquants.forEach((m) => compte[m.cle]++);
  }
  return {
    moyenne: produits.length ? Math.round(somme / produits.length) : 0,
    manques: CONTROLES.map((c) => ({ cle: c.cle, label: c.label, nb: compte[c.cle] })).sort((a, b) => b.nb - a.nb),
  };
}
