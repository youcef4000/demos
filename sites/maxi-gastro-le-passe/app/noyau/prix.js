// Noyau « Le Passe » — règles de prix.
// Ce fichier est partagé tel quel entre la démo (navigateur) et le moteur (Node) :
// la démo exécute exactement la logique qui tournera en production.
// Aucune dépendance, aucun accès réseau, aucune donnée globale.

/** Arrondit un prix HT selon la stratégie choisie. */
export function arrondir(prix, mode = 'centime') {
  if (!Number.isFinite(prix)) return NaN;
  switch (mode) {
    case 'aucun':
      return prix;
    case 'euro':
      return Math.ceil(prix);
    case 'x9': {
      // 1 342,10 → 1 349 ; 87,20 → 89 : prix « psychologique » à l'euro, toujours vers le haut
      const base = Math.floor(prix / 10) * 10 + 9;
      return base >= prix ? base : base + 10;
    }
    case 'x90': {
      // 1 342,10 → 1 342,90 ; 1 342,95 → 1 343,90
      const base = Math.floor(prix) + 0.9;
      return round2(base >= prix ? base : base + 1);
    }
    case 'centime':
    default:
      return round2(Math.ceil(round4(prix * 100)) / 100);
  }
}

/**
 * Trouve la règle de marge qui s'applique à un produit.
 * Priorité : produit > fournisseur + catégorie > catégorie > fournisseur > défaut.
 * (Une règle de catégorie, « on marge plus sur la ventilation », passe avant le coefficient
 * général du fournisseur ; le croisement des deux permet les exceptions fines.)
 * regles = { defaut, fournisseurs: { tefcold: {...} }, categories: { froid: {...} },
 *            croisees: { 'tefcold|froid': {...} }, produits: { 'TEFCOLD:15844': {...} } }
 */
export function regleApplicable(regles, { cle, fournisseur, categorie } = {}) {
  const f = (fournisseur || '').toLowerCase();
  const c = (categorie || '').toLowerCase();
  const candidats = [
    ['produit', regles?.produits?.[cle]],
    ['fournisseur+catégorie', regles?.croisees?.[`${f}|${c}`]],
    ['catégorie', regles?.categories?.[c]],
    ['fournisseur', regles?.fournisseurs?.[f]],
    ['défaut', regles?.defaut],
  ];
  for (const [niveau, regle] of candidats) {
    if (regle && Number.isFinite(regle.valeur)) return { ...regle, niveau };
  }
  return { type: 'coef', valeur: 1.5, arrondi: 'centime', niveau: 'secours' };
}

/**
 * Prix de vente HT à partir du prix d'achat HT.
 * regle.type = 'coef'  → prix = achat × coef
 * regle.type = 'marge' → taux de marque : prix = achat ÷ (1 − marge)
 */
export function calculerPrixVente(prixAchatHT, regle, { tva = 0.2 } = {}) {
  if (!(prixAchatHT > 0)) return null;
  let brut;
  if (regle.type === 'marge') {
    if (!(regle.valeur < 1)) throw new Error('Une marge doit être inférieure à 100 %');
    brut = prixAchatHT / (1 - regle.valeur);
  } else {
    brut = prixAchatHT * regle.valeur;
  }
  if (Number.isFinite(regle.prixMinHT)) brut = Math.max(brut, regle.prixMinHT);
  const prixHT = arrondir(brut, regle.arrondi);
  return {
    prixHT,
    prixTTC: round2(prixHT * (1 + tva)),
    coef: round4(prixHT / prixAchatHT),
    margePct: round4((prixHT - prixAchatHT) / prixHT),
  };
}

/**
 * Que faire d'un nouveau prix ?
 * - prix verrouillé à la main → on ne touche pas, on garde la trace ;
 * - petite variation → appliquée automatiquement ;
 * - grosse variation → mise en file au « passe » pour validation humaine.
 */
export function decisionPrix({ ancienHT, nouveauHT, verrouille = false, seuilAutoPct = 0.05 }) {
  if (!(nouveauHT > 0)) return { action: 'ignorer', raison: 'prix calculé invalide' };
  if (!(ancienHT > 0)) return { action: verrouille ? 'ignorer-verrou' : 'appliquer', variationPct: null, raison: 'nouveau produit' };
  const variationPct = round4((nouveauHT - ancienHT) / ancienHT);
  if (Math.abs(variationPct) < 0.00005) return { action: 'rien', variationPct };
  if (verrouille) return { action: 'ignorer-verrou', variationPct, raison: 'prix verrouillé manuellement' };
  if (Math.abs(variationPct) <= seuilAutoPct) return { action: 'appliquer', variationPct };
  return { action: 'valider', variationPct, raison: `variation de ${(variationPct * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} % au-delà du seuil` };
}

/**
 * Prix plancher HT sur une marketplace : en dessous, on perd la marge minimale.
 * La commission des marketplaces se calcule en général sur le prix TTC payé par l'acheteur.
 * net = prixHT − commission − fraisFixes − port − achat ≥ margeMin × prixHT
 */
export function prixPlancher({
  prixAchatHT,
  commissionPct = 0.15,
  commissionSurTTC = true,
  fraisFixesHT = 0,
  fraisPortHT = 0,
  margeMinPct = 0.12,
  tva = 0.2,
}) {
  const partCommission = commissionPct * (commissionSurTTC ? 1 + tva : 1);
  const diviseur = 1 - partCommission - margeMinPct;
  if (diviseur <= 0) return Infinity;
  return Math.ceil(((prixAchatHT + fraisFixesHT + fraisPortHT) / diviseur) * 100) / 100;
}

/** Ce qu'il reste réellement en poche pour un prix de vente HT donné. */
export function margeNette({ prixHT, prixAchatHT, commissionPct = 0.15, commissionSurTTC = true, fraisFixesHT = 0, fraisPortHT = 0, tva = 0.2 }) {
  const commission = prixHT * commissionPct * (commissionSurTTC ? 1 + tva : 1);
  const net = prixHT - commission - fraisFixesHT - fraisPortHT - prixAchatHT;
  return { net: round2(net), pct: prixHT > 0 ? round4(net / prixHT) : 0, commission: round2(commission) };
}

/**
 * Stratégie Buy Box : passer juste sous le concurrent… sans jamais franchir le plancher.
 * Le prix n'est qu'un critère : délai, stock et note vendeur comptent aussi.
 */
export function strategieBuyBox({ plancherHT, prixConcurrentHT, prixActuelHT, pasHT = 1, delaiJours, delaiConcurrentJours }) {
  if (!Number.isFinite(prixConcurrentHT)) {
    return { statut: 'seul', prixHT: prixActuelHT ?? plancherHT, message: 'Aucun concurrent visible sur cette fiche : on garde notre prix.' };
  }
  const cible = round2(prixConcurrentHT - pasHT);
  const delaiAvantage = Number.isFinite(delaiJours) && Number.isFinite(delaiConcurrentJours) && delaiJours < delaiConcurrentJours;
  if (cible >= plancherHT) {
    return {
      statut: 'gagnable',
      prixHT: cible,
      message: `On passe à ${fmt(cible)} HT, ${fmt(pasHT)} sous le concurrent, en restant au-dessus du plancher (${fmt(plancherHT)}).`,
    };
  }
  return {
    statut: delaiAvantage ? 'delai' : 'plancher',
    prixHT: plancherHT,
    ecartHT: round2(plancherHT - prixConcurrentHT),
    message: delaiAvantage
      ? `Le concurrent est ${fmt(plancherHT - prixConcurrentHT)} moins cher, mais nous livrons plus vite (${delaiJours} j contre ${delaiConcurrentJours} j) : on reste au plancher et on joue le délai.`
      : `Le concurrent est sous notre plancher de ${fmt(plancherHT - prixConcurrentHT)} : on ne le suit pas. Marge protégée.`,
  };
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function round4(n) {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}
function fmt(n) {
  return `${round2(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}
