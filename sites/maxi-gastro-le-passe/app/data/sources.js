// Ce que chaque source fournit réellement. Mis à jour le 3 novembre 2026.
// oui = vérifié dans la documentation · annonce = annoncé, à confirmer · non = absent · inconnu = à demander
// equip.me : spécification OpenAPI publique « Dealers API 1.0.4 » (https://equip.me/api/).
// Tefcold : annonce du flux XML revendeur (https://www.tefcold.com/news/new-feature-a-live-xml-feed-for-your-website).
// Combisteel, Diamond : clé API annoncée par Maxi Gastro, documentation non publique.
// Cuistance : fichier de stock CSV (mémo vocal, pas encore reçu) et liste de prix Excel du 4 mars 2026 (reçue, jamais publiée).

export const CHAMPS_SOURCE = [
  ['ref', 'Référence'],
  ['prixAchat', "Prix d'achat"],
  ['stock', 'Stock'],
  ['delai', 'Délai'],
  ['description', 'Description'],
  ['photos', 'Photos'],
  ['caracteristiques', 'Caract. techniques'],
  ['dimensions', 'Dimensions / poids'],
  ['ean', 'EAN'],
  ['pdf', 'Notices PDF'],
  ['commandes', 'Commande auto'],
];

export const SOURCES = [
  {
    id: 'equipme',
    nom: 'equip.me',
    mode: 'API REST',
    detail: 'api.equip.me/v1 · clé en paramètre · Dealers API 1.0.4',
    statut: 'attente-cle',
    statutTexte: 'Connecteur prêt, en attente de la clé (compte Superviseur)',
    rythme: 'toutes les 30 min, seulement ce qui a changé (change_from)',
    champs: { ref: 'oui', prixAchat: 'oui', stock: 'oui', delai: 'annonce', description: 'oui', photos: 'oui', caracteristiques: 'oui', dimensions: 'oui', ean: 'non', pdf: 'oui', commandes: 'oui' },
    notes: {
      delai: 'Donné vers l\'entrepôt de Moscou : à confirmer pour la France.',
      dimensions: 'Demander unit=metric, sinon pouces et livres.',
      ean: 'Aucun champ EAN dans la spécification.',
    },
    endpoints: [
      ['GET', '/dealer/products', 'catalogue paginé, filtre change_from, catalog_type, photos, PDF, caractéristiques, prix conseillé'],
      ['GET', '/dealer/stocks', 'liste des entrepôts'],
      ['GET', '/dealer/products/categories', 'arbre des catégories'],
      ['GET', '/dealer/products/properties', 'dictionnaire des caractéristiques'],
      ['POST', '/dealer/order', 'créer une commande chez le fournisseur'],
      ['GET', '/dealer/orders', 'suivre les commandes'],
    ],
  },
  {
    id: 'tefcold',
    nom: 'Tefcold',
    mode: 'Flux XML (+ clé API annoncée)',
    detail: 'lien unique depuis l\'espace client Tefcold',
    statut: 'a-demander',
    statutTexte: 'Demander le lien du flux XML au service client',
    rythme: 'flux « live » : relu toutes les 30 min',
    champs: { ref: 'oui', prixAchat: 'inconnu', stock: 'oui', delai: 'inconnu', description: 'oui', photos: 'oui', caracteristiques: 'oui', dimensions: 'annonce', ean: 'inconnu', pdf: 'inconnu', commandes: 'inconnu' },
    notes: { prixAchat: 'Non mentionné dans l\'annonce du flux.', ean: 'Non mentionné : à demander.' },
  },
  {
    id: 'combisteel',
    nom: 'Combisteel',
    mode: 'Clé API',
    detail: 'documentation dans l\'espace pro',
    statut: 'a-demander',
    statutTexte: 'Récupérer la documentation de l\'API',
    rythme: 'à définir selon les limites d\'appels',
    champs: { ref: 'annonce', prixAchat: 'annonce', stock: 'annonce', delai: 'inconnu', description: 'annonce', photos: 'annonce', caracteristiques: 'inconnu', dimensions: 'inconnu', ean: 'inconnu', pdf: 'inconnu', commandes: 'inconnu' },
    notes: {},
  },
  {
    id: 'diamond',
    nom: 'Diamond',
    mode: 'Clé API (à vérifier)',
    detail: 'aucune documentation publique',
    statut: 'a-demander',
    statutTexte: 'Demander un contact technique',
    rythme: 'à définir',
    champs: { ref: 'annonce', prixAchat: 'annonce', stock: 'annonce', delai: 'inconnu', description: 'inconnu', photos: 'inconnu', caracteristiques: 'inconnu', dimensions: 'inconnu', ean: 'inconnu', pdf: 'inconnu', commandes: 'inconnu' },
    notes: {},
  },
  {
    id: 'cuistance',
    nom: 'Cuistance',
    mode: 'CSV de stock + liste de prix Excel',
    detail: 'stock 1 à 2 fois par semaine, tarif à chaque changement',
    statut: 'pret',
    statutTexte: 'Lecteur prêt : glissez le CSV de stock ou la liste de prix .xlsx',
    rythme: 'à chaque mail reçu',
    champs: { ref: 'oui', prixAchat: 'oui', stock: 'annonce', delai: 'inconnu', description: 'non', photos: 'non', caracteristiques: 'non', dimensions: 'non', ean: 'non', pdf: 'non', commandes: 'non' },
    notes: { prixAchat: 'Liste de prix du 4 mars 2026 reçue : référence, code, tarif HT, ancien tarif, paliers de quantité.', stock: 'Fichier de stock pas encore reçu.', ean: 'Pas d\'EAN dans la liste de prix.' },
  },
];

export const MARKETPLACES = [
  {
    id: 'metro',
    nom: 'METRO',
    connexion: 'API (clé client + secret) ou connecteur (ChannelEngine, Shoppingfeed, e-tailize…)',
    exige: ['ean', 'stock', 'poids'],
    faits: [
      'Offre rattachée au catalogue METRO par l\'EAN.',
      'Produit absent du catalogue : création par fichier, validation jusqu\'à 7 jours (selon des intégrateurs).',
      'Un pays par connexion (France, Allemagne, Italie, Espagne, Pays-Bas, Portugal).',
      'Stocks, prix et commandes synchronisés.',
    ],
    commission: 0.12,
  },
  {
    id: 'amazon',
    nom: 'Amazon',
    connexion: 'Shopify Marketplace Connect',
    exige: ['ean', 'poids'],
    faits: ['Couvre Amazon, eBay, Walmart, Target+ (couverture française à confirmer).', 'GTIN demandé, sauf exemption de marque.'],
    commission: 0.15,
  },
  {
    id: 'autres',
    nom: 'ManoMano, Cdiscount, Leroy Merlin…',
    connexion: 'Agrégateur de flux branché sur Shopify',
    exige: ['ean', 'categorie'],
    faits: ['Un seul branchement pour plusieurs marketplaces.', 'Connecteurs à vérifier marketplace par marketplace.'],
    commission: 0.15,
  },
];
