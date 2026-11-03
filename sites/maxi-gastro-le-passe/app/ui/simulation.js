// Simulation d'événements fournisseurs, décidés par le vrai noyau (prix.js).
import { regleApplicable, calculerPrixVente, decisionPrix } from '../noyau/prix.js';
import { FOURNISSEURS_NOMS } from '../data/regles.js';
import { euro } from './tickets.js';

const CANAL = { tefcold: 'Flux XML', combisteel: 'API', cuistance: 'CSV mail', equipme: 'API', autres: 'Fichier' };

function hasard(n) {
  return Math.floor(Math.random() * n);
}
const pct = (x) => (x * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const court = (t) => t.replace(/\s+-\s+.*$/, '').replace(/\s+—\s+.*$/, '').slice(0, 46);

/** Prix de vente que les règles donneraient pour un prix d'achat. */
export function prixParRegle(p, regles, prixAchatHT = p.prixAchatHT) {
  const regle = regleApplicable(regles, { cle: p.id, fournisseur: p.fournisseur, categorie: p.famille });
  const calc = calculerPrixVente(prixAchatHT, regle);
  return { regle, ...calc };
}

/**
 * Prépare un changement (sans l'appliquer).
 * cas : 'stock' | 'hausse' | 'grosse' | 'baisse' | 'rupture' | 'retour' ; sinon tiré au hasard.
 */
export function preparerEvenement(produits, regles, { cas, produit, nouveauStock } = {}) {
  const branches = produits.filter((p) => ['tefcold', 'combisteel', 'cuistance'].includes(p.fournisseur));
  const p = produit || branches[hasard(branches.length)];
  const tirage = cas || ['stock', 'stock', 'stock', 'hausse', 'baisse', 'grosse', 'rupture', 'retour'][hasard(8)];
  const nom = FOURNISSEURS_NOMS[p.fournisseur] || p.marque;
  const base = { produit: p, fournisseur: `${nom} · ${CANAL[p.fournisseur] || ''}`, titre: court(p.titre), date: new Date() };

  if (tirage === 'stock' || tirage === 'rupture' || tirage === 'retour') {
    let nouveau = tirage === 'rupture' ? 0 : tirage === 'retour' ? 6 + hasard(10) : Math.max(1, p.stock + (hasard(2) ? -1 : 1) * (1 + hasard(5)));
    if (tirage === 'retour' && p.stock > 0) nouveau = p.stock + 4;
    if (Number.isFinite(nouveauStock)) nouveau = nouveauStock;
    const rupture = nouveau === 0;
    return {
      ...base,
      type: rupture ? 'Rupture' : 'Stock',
      etat: 'ok',
      changement: { stock: nouveau, statutStock: rupture ? 'rupture' : 'en-stock' },
      lignes: [['Stock', `${p.stock} → ${nouveau}`], rupture ? ['METRO', 'offre suspendue'] : ['Validation', 'automatique']],
      etapes: rupture ? `${nom} → Shopify 0 → METRO suspendu` : `${nom} → Shopify → METRO`,
      explication: rupture
        ? 'Stock à zéro : Shopify passe à 0 et l\'offre METRO est suspendue pour éviter une vente impossible.'
        : 'Un stock ne demande jamais de validation : il part tout de suite partout.',
    };
  }

  const variation = tirage === 'grosse' ? 0.09 : tirage === 'baisse' ? -0.02 : 0.03;
  const achat = Math.round(p.prixAchatHT * (1 + variation) * 100) / 100;
  const calc = prixParRegle(p, regles, achat);
  const decision = decisionPrix({ ancienHT: p.prixVenteHT, nouveauHT: calc.prixHT, verrouille: p.verrouille, seuilAutoPct: regles.seuilAutoPct });
  const etat = decision.action === 'valider' ? 'passe' : decision.action === 'ignorer-verrou' ? 'verrou' : 'ok';
  const signe = variation > 0 ? '+' : '';
  return {
    ...base,
    type: 'Prix',
    etat,
    decision,
    regle: calc.regle,
    changement: { prixAchatHT: achat, ...(etat === 'ok' ? { prixVenteHT: calc.prixHT } : {}) },
    proposition: { prixVenteHT: calc.prixHT },
    lignes: [
      ['Achat', `${signe}${Math.round(variation * 100)} % → ${euro(achat)}`],
      ['Vente', `${euro(p.prixVenteHT)} → ${euro(calc.prixHT)}`],
    ],
    etapes:
      etat === 'ok' ? `${nom} → règle ×${String(calc.regle.valeur).replace('.', ',')} → Shopify → METRO` : etat === 'passe' ? `${nom} → règle → attend votre feu vert` : `${nom} → prix verrouillé : rien ne bouge`,
    explication:
      etat === 'ok'
        ? `Prix de vente : ${decision.variationPct > 0 ? '+' : ''}${pct(decision.variationPct)} %, sous le seuil de ${Math.round(regles.seuilAutoPct * 100)} % : appliquée seule (règle « ${calc.regle.niveau} », coefficient ${String(calc.regle.valeur).replace('.', ',')}).`
        : etat === 'passe'
          ? `Prix de vente : +${pct(decision.variationPct)} %, au-delà du seuil de ${Math.round(regles.seuilAutoPct * 100)} % : le nouveau prix attend votre validation au passe.`
          : 'Ce prix a été verrouillé à la main : le prix d\'achat est enregistré (la marge est recalculée), le prix de vente ne bouge pas.',
  };
}
