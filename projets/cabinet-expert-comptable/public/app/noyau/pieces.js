// Noyau du cabinet — règles fixes sur les pièces (factures, avoirs, états de paie…).
// Ces règles ne demandent aucun jugement : elles tournent sans agent IA (03_architecture.md, workflows W1 à W3).
//   W1  achat ou vente : la facture émise par le client du cabinet est une vente, sinon c'est un achat ;
//   W2  contrôles arithmétiques et mentions (HT + TVA + timbre = TTC, NIF, taux, période, doublon) ;
//   W3  journal de règlement selon le mode de paiement (espèces → caisse, chèque / virement → banque).
import { nif, dateFr, periodeDe, da } from './format.js';
import { journalDeReglement } from './scf.js';

export const TYPES_PIECE = {
  facture_achat: "Facture d'achat",
  facture_vente: 'Facture de vente',
  avoir: 'Avoir',
  etat_paie: 'État de paie (récapitulatif du mois)',
  releve_bancaire: 'Relevé bancaire',
  piece_caisse: 'Pièce de caisse',
  autre: 'Autre document',
};

export const STATUTS_PIECE = {
  recue: 'Reçue',
  en_lecture: 'Lecture en cours',
  a_valider: 'À valider',
  validee: 'Validée',
  comptabilisee: 'Comptabilisée',
  rejetee: 'Rejetée',
};

export const TAUX_TVA = [19, 9, 0];
const TOLERANCE = 100; // 1 DA : écart d'arrondi accepté entre les totaux imprimés et recalculés

/** W1 — sens de la facture d'après le NIF de l'émetteur. */
export function sensFacture(fiche, dossier) {
  const nifDossier = nif(dossier?.nif);
  if (nifDossier && nif(fiche?.emetteur?.nif) === nifDossier) return 'vente';
  if (nifDossier && nif(fiche?.destinataire?.nif) === nifDossier) return 'achat';
  if (fiche?.typeDoc === 'facture_vente') return 'vente';
  if (fiche?.typeDoc === 'facture_achat') return 'achat';
  return fiche?.sens || 'achat';
}

/** Tiers (le fournisseur pour un achat, le client pour une vente). */
export function tiersDe(fiche) {
  return fiche.sens === 'vente' ? fiche.destinataire || {} : fiche.emetteur || {};
}

/** Totaux recalculés depuis les lignes (centimes). */
export function totaux(fiche) {
  const parTaux = {};
  let ht = 0;
  for (const l of fiche.lignes || []) {
    const m = Math.round(Number(l.montantHT) || 0);
    ht += m;
    const t = Number(l.tauxTVA ?? 19);
    parTaux[t] = (parTaux[t] || 0) + m;
  }
  const tvaParTaux = {};
  let tva = 0;
  for (const [t, base] of Object.entries(parTaux)) {
    const v = Math.round((base * Number(t)) / 100);
    tvaParTaux[t] = v;
    tva += v;
  }
  const timbre = Math.round(Number(fiche.timbre) || 0);
  return { ht, tva, timbre, ttc: ht + tva + timbre, baseParTaux: parTaux, tvaParTaux };
}

/**
 * W2 — contrôles. Renvoie une liste [{ niveau: 'erreur'|'alerte', code, message }].
 * Une erreur bloque la validation ; une alerte se lit et se confirme.
 */
export function controler(fiche, { dossier, periode, autresPieces = [] } = {}) {
  const r = [];
  const ajout = (niveau, code, message) => r.push({ niveau, code, message });
  const type = fiche.typeDoc;

  if (type === 'etat_paie') {
    const p = fiche.paie || {};
    if (!p.brut) ajout('erreur', 'paie_brut', 'Masse salariale brute manquante.');
    const net = (p.brut || 0) - (p.cotisationsSalariales || 0) - (p.irg || 0);
    if (p.net != null && Math.abs(net - p.net) > TOLERANCE) ajout('alerte', 'paie_net', `Net à payer recalculé ${da(net)} ≠ net lu ${da(p.net)} (retenues autres que CNAS et IRG ?).`);
    if (p.brut && p.cotisationsSalariales != null && Math.abs(p.cotisationsSalariales - Math.round(p.brut * 0.09)) > Math.max(TOLERANCE, p.brut * 0.02)) {
      ajout('alerte', 'paie_cnas', 'Cotisation salariale CNAS éloignée de 9 % du brut : vérifier l’assiette (primes non cotisables ?).');
    }
    return r;
  }
  if (!['facture_achat', 'facture_vente', 'avoir'].includes(type)) return r;

  const t = totaux(fiche);
  if (!fiche.numero) ajout('erreur', 'numero', 'Numéro de facture manquant.');
  if (!fiche.date) ajout('erreur', 'date', 'Date de facture manquante.');
  if (!(fiche.lignes || []).length) ajout('erreur', 'lignes', 'Aucune ligne de facture.');
  for (const l of fiche.lignes || []) {
    if (!TAUX_TVA.includes(Number(l.tauxTVA))) ajout('erreur', 'taux', `Taux de TVA ${l.tauxTVA} % inconnu (taux en vigueur : 19 %, 9 %, exonéré).`);
  }
  if (fiche.totalHT != null && Math.abs(fiche.totalHT - t.ht) > TOLERANCE) ajout('erreur', 'ht', `Total HT imprimé ${da(fiche.totalHT)} ≠ somme des lignes ${da(t.ht)}.`);
  if (fiche.totalTVA != null && Math.abs(fiche.totalTVA - t.tva) > TOLERANCE * 2) ajout('erreur', 'tva', `TVA imprimée ${da(fiche.totalTVA)} ≠ TVA recalculée ${da(t.tva)}.`);
  if (fiche.totalTTC != null && Math.abs(fiche.totalTTC - t.ttc) > TOLERANCE * 2) ajout('erreur', 'ttc', `TTC imprimé ${da(fiche.totalTTC)} ≠ HT + TVA + timbre ${da(t.ttc)}.`);

  const tiers = tiersDe(fiche);
  if (!tiers.nom) ajout('erreur', 'tiers', fiche.sens === 'vente' ? 'Client non identifié.' : 'Fournisseur non identifié.');
  const n = nif(tiers.nif);
  if (!n) ajout('alerte', 'nif', `NIF du ${fiche.sens === 'vente' ? 'client' : 'fournisseur'} absent : mention obligatoire sur une facture entre professionnels.`);
  else if (n.length !== 15 && n.length !== 20) ajout('alerte', 'nif_format', `NIF « ${tiers.nif} » : ${n.length} chiffres (15 ou 20 attendus).`);

  if (periode && fiche.date && periodeDe(fiche.date) !== periode) ajout('alerte', 'periode', `Facture du ${dateFr(fiche.date)} rangée dans une autre période.`);
  if (fiche.modePaiement === 'especes' && !t.timbre && fiche.sens === 'vente') ajout('alerte', 'timbre', 'Vente réglée en espèces sans droit de timbre : vérifier le barème applicable.');
  if (fiche.modePaiement !== 'especes' && t.timbre) ajout('alerte', 'timbre_mode', 'Droit de timbre présent alors que le règlement n’est pas en espèces.');
  if (!fiche.modePaiement) ajout('alerte', 'mode', 'Mode de paiement non indiqué : la facture sera traitée « à terme ».');
  if (!fiche.nature) ajout('erreur', 'nature', "Nature de l'opération à préciser (marchandises, production, prestation, travaux…).");

  const doublon = autresPieces.find((p) => p.id !== fiche.pieceId && p.statut !== 'rejetee' && p.fiche && p.fiche.numero && p.fiche.numero === fiche.numero && nif(tiersDe(p.fiche).nif) === n && n);
  if (doublon) ajout('erreur', 'doublon', `Même numéro et même ${fiche.sens === 'vente' ? 'client' : 'fournisseur'} qu'une pièce déjà reçue : doublon probable.`);
  if (dossier && fiche.sens === 'vente' && nif(fiche.emetteur?.nif) && nif(fiche.emetteur.nif) !== nif(dossier.nif)) ajout('alerte', 'emetteur', "Facture de vente dont l'émetteur n'est pas le client du cabinet.");
  return r;
}

export function bloquante(controles) {
  return controles.some((c) => c.niveau === 'erreur');
}

/** W3 — journal de règlement de la facture. */
export function journalReglement(fiche) {
  return journalDeReglement(fiche.modePaiement);
}

/**
 * Prépare une fiche à partir de la lecture de l'agent : sens (W1), totaux par défaut.
 * Ne modifie pas l'entrée.
 */
export function normaliserFiche(lecture, dossier) {
  const f = structuredClone(lecture || {});
  f.lignes = (f.lignes || []).map((l) => ({ ...l, montantHT: Math.round(Number(l.montantHT) || 0), tauxTVA: Number(l.tauxTVA ?? 19) }));
  if (['facture_achat', 'facture_vente', 'avoir'].includes(f.typeDoc)) {
    f.sens = sensFacture(f, dossier);
    if (f.typeDoc !== 'avoir') f.typeDoc = f.sens === 'vente' ? 'facture_vente' : 'facture_achat';
  }
  return f;
}
