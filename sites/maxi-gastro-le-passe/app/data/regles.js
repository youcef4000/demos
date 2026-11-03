// Règles commerciales de la démo. Valeurs d'exemple : les vraies sont celles de Maxi Gastro.
export const REGLES_DEFAUT = {
  defaut: { type: 'coef', valeur: 1.4, arrondi: 'x90' },
  fournisseurs: {
    tefcold: { type: 'coef', valeur: 1.38, arrondi: 'x90' },
    combisteel: { type: 'coef', valeur: 1.42, arrondi: 'x90' },
    cuistance: { type: 'coef', valeur: 1.35, arrondi: 'x90' },
    equipme: { type: 'coef', valeur: 1.45, arrondi: 'x90' },
    autres: { type: 'coef', valeur: 1.36, arrondi: 'x90' },
  },
  categories: {
    ventilation: { type: 'coef', valeur: 1.45, arrondi: 'x90' },
  },
  croisees: {},
  produits: {},
  seuilAutoPct: 0.05,
  exclusions: { 'pieces-detachees': true, accessoires: false },
  margeMinMarketplace: 0.12,
};

export const FOURNISSEURS_NOMS = { tefcold: 'Tefcold', combisteel: 'Combisteel', cuistance: 'Cuistance', equipme: 'equip.me', diamond: 'Diamond', autres: 'Autres marques' };

export const FAMILLES = {
  froid: 'Froid',
  cuisson: 'Cuisson',
  laverie: 'Laverie',
  inox: 'Inox & mobilier',
  ventilation: 'Ventilation',
  preparation: 'Préparation',
  'pieces-detachees': 'Pièces détachées',
  accessoires: 'Accessoires',
};

export const ARRONDIS = {
  x90: 'Finit par ,90 (1 342,90 €)',
  x9: 'Finit par 9 (1 349 €)',
  euro: "À l'euro supérieur",
  centime: 'Au centime',
};
