// Catalogue complet.
// Une recette : { id, c (pays), cat, kind ('sale' | 'sucre'), prep, cook, rest (minutes), diff (1 à 3),
//   serves, per ('pcs' si on compte en pièces), tags, eq (matériel), t (titre), d (description),
//   ing : lignes [idIngrédient, quantité | null, unité] ou ['#', groupe],
//   steps : { fr, ar, en, m (minuteur en minutes), g (geste), tip } }.

import dzSale from './recettes-dz-sale.js';
import dzSucre from './recettes-dz-sucre.js';
import mondeSale from './recettes-monde-sale.js';
import mondeSucre from './recettes-monde-sucre.js';

export const RECETTES = [...dzSale, ...dzSucre, ...mondeSale, ...mondeSucre];
export const PAR_ID = Object.fromEntries(RECETTES.map((r) => [r.id, r]));

export { INGREDIENTS, PLACARD, RAYONS, REMPLACEMENTS } from './ingredients.js';
export { PAYS, GESTES, SOS, PARCOURS, ASTUCES } from './extras.js';
