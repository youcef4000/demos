// Noyau du cabinet — préparation de la déclaration mensuelle G50 (workflow W6).
// Mémo 2 : « chaque mois les G50 », chiffre d'affaires sur la vente, sur l'achat, la déduction, le précompte,
// l'IRG sur le salaire (tiré de la paie), puis « on fait le G50 sur l'Excel ».
// Le résultat est une déclaration PRÊTE À SAISIR (Jibaya'tic ou formulaire papier) : aucune transmission
// automatique à la DGI (pas d'API officielle vérifiée).
//
// Règles retenues (hypothèses H8 à H10 de 02_analyse_besoins.md, modifiables par dossier) :
//  - ventes de marchandises et de production : TVA exigible le mois de la facture (livraison) ;
//  - prestations de services et travaux : TVA exigible le mois de l'encaissement (art. 14 du CTCA) ;
//  - TVA déductible : le mois de la facture d'achat ; immobilisations isolées ;
//  - précompte = crédit de TVA reporté de la G50 du mois précédent ;
//  - IRG salaires = IRG retenu figurant sur l'état de paie du mois (logiciel de paie) ;
//  - droit de timbre = timbre des ventes réglées en espèces du mois.
// La TAP n'apparaît plus : supprimée par la loi de finances 2024 (art. 14).
import { periodeDe, decalerPeriode } from './format.js';
import { totaux } from './pieces.js';

const FACTURES = ['facture_achat', 'facture_vente', 'avoir'];

/** Période d'exigibilité de la TVA d'une facture de vente. null = pas encore exigible (prestation non encaissée). */
export function periodeExigibilite(fiche, dossier) {
  const encaissement = dossier?.tvaSurEncaissements !== false && (fiche.nature === 'prestation' || fiche.nature === 'travaux');
  if (!encaissement) return periodeDe(fiche.date);
  if (fiche.modePaiement && fiche.modePaiement !== 'a_terme') return periodeDe(fiche.datePaiement || fiche.date);
  return null;
}

/** Date limite de dépôt et de paiement : le 20 du mois suivant la période. */
export function dateLimiteG50(periode, jour = 20) {
  return `${decalerPeriode(periode, 1)}-${String(jour).padStart(2, '0')}`;
}

/**
 * Calcule la G50 d'un dossier pour une période.
 * pieces : toutes les pièces VALIDÉES du dossier (toutes périodes : nécessaire pour l'exigibilité sur encaissement).
 * precedente : déclaration du mois précédent (pour le précompte), ou null.
 * saisies : { precompte (forcé), irg (forcé), autres: [{ libelle, montant }] } — corrections du cabinet.
 */
export function calculerG50({ dossier, periode, pieces, precedente = null, saisies = {} }) {
  const valides = pieces.filter((p) => (p.statut === 'validee' || p.statut === 'comptabilisee') && p.fiche);
  const caParTaux = { 19: 0, 9: 0 };
  let caExonere = 0;
  const tvaCollectee = { 19: 0, 9: 0 };
  let deductibleBS = 0;
  let deductibleImmo = 0;
  let timbre = 0;
  let caAchats = 0;
  const enAttente = [];
  const detailVentes = [];
  const detailAchats = [];

  for (const p of valides) {
    const f = p.fiche;
    if (!FACTURES.includes(f.typeDoc)) continue;
    const t = totaux(f);
    const signe = f.typeDoc === 'avoir' ? -1 : 1;
    if (f.sens === 'vente') {
      const pe = periodeExigibilite(f, dossier);
      if (pe === null) {
        if (periodeDe(f.date) <= periode) enAttente.push({ pieceId: p.id, numero: f.numero, client: f.destinataire?.nom, tva: signe * t.tva, date: f.date });
        continue;
      }
      if (pe !== periode) continue;
      for (const [taux, base] of Object.entries(t.baseParTaux)) {
        if (Number(taux) === 0) caExonere += signe * base;
        else {
          caParTaux[taux] = (caParTaux[taux] || 0) + signe * base;
          tvaCollectee[taux] = (tvaCollectee[taux] || 0) + signe * (t.tvaParTaux[taux] || 0);
        }
      }
      if (f.modePaiement === 'especes') timbre += signe * t.timbre;
      detailVentes.push({ pieceId: p.id, numero: f.numero, date: f.date, tiers: f.destinataire?.nom, ht: signe * t.ht, tva: signe * t.tva, nature: f.nature });
    } else {
      if (periodeDe(f.date) !== periode) continue;
      caAchats += signe * t.ht;
      if (f.nature === 'immobilisation') deductibleImmo += signe * t.tva;
      else deductibleBS += signe * t.tva;
      detailAchats.push({ pieceId: p.id, numero: f.numero, date: f.date, tiers: f.emetteur?.nom, nif: f.emetteur?.nif, ht: signe * t.ht, tva: signe * t.tva, ttc: signe * t.ttc, nature: f.nature });
    }
  }

  // IRG salaires : état de paie validé du mois
  const paie = valides.find((p) => p.fiche.typeDoc === 'etat_paie' && p.periode === periode);
  const irgLu = paie ? paie.fiche.paie?.irg || 0 : 0;
  const baseIrg = paie ? paie.fiche.paie?.brut - (paie.fiche.paie?.cotisationsSalariales || 0) : 0;
  const irg = saisies.irg != null ? saisies.irg : irgLu;

  const precompteAuto = precedente?.calcul?.tva?.creditAReporter ?? dossier?.creditTvaInitial ?? 0;
  const precompte = saisies.precompte != null ? saisies.precompte : precompteAuto;

  const totalCollectee = Object.values(tvaCollectee).reduce((a, b) => a + b, 0);
  const totalDeductible = deductibleBS + deductibleImmo;
  const solde = totalCollectee - totalDeductible - precompte;
  const tvaNette = Math.max(0, solde);
  const creditAReporter = Math.max(0, -solde);
  const autres = (saisies.autres || []).filter((a) => a && a.libelle).map((a) => ({ libelle: a.libelle, montant: Math.round(Number(a.montant) || 0) }));
  const totalAutres = autres.reduce((s, a) => s + a.montant, 0);
  const total = tvaNette + irg + timbre + totalAutres;

  const alertes = [];
  if (dossier?.salaries > 0 && !paie) alertes.push("État de paie du mois non reçu ou non validé : l'IRG salaires est à 0.");
  if (saisies.irg != null && paie && saisies.irg !== irgLu) alertes.push('IRG saisi à la main, différent de l’état de paie.');
  if (saisies.precompte != null && saisies.precompte !== precompteAuto) alertes.push('Précompte saisi à la main, différent du crédit reporté de la G50 précédente.');
  if (enAttente.length) alertes.push(`${enAttente.length} facture(s) de prestation non encaissée(s) : TVA exigible à l'encaissement.`);

  return {
    periode,
    dateLimite: dateLimiteG50(periode),
    tva: {
      caParTaux,
      caExonere,
      tvaCollectee,
      totalCollectee,
      deductibleBiensServices: deductibleBS,
      deductibleImmobilisations: deductibleImmo,
      totalDeductible,
      precompte,
      precompteAuto,
      tvaNette,
      creditAReporter,
      achatsHT: caAchats,
    },
    irg: { base: baseIrg, montant: irg, lu: irgLu, pieceId: paie?.id || null },
    timbre,
    autres,
    total,
    enAttente,
    detailVentes,
    detailAchats,
    alertes,
  };
}

/** Lignes « prêtes à saisir » (libellé, montant) dans l'ordre du formulaire. */
export function lignesG50(calcul) {
  const t = calcul.tva;
  return [
    { rubrique: 'TVA', libelle: "Chiffre d'affaires imposable à 19 %", montant: t.caParTaux[19] || 0 },
    { rubrique: 'TVA', libelle: 'TVA collectée à 19 %', montant: t.tvaCollectee[19] || 0 },
    { rubrique: 'TVA', libelle: "Chiffre d'affaires imposable à 9 %", montant: t.caParTaux[9] || 0 },
    { rubrique: 'TVA', libelle: 'TVA collectée à 9 %', montant: t.tvaCollectee[9] || 0 },
    { rubrique: 'TVA', libelle: "Chiffre d'affaires exonéré", montant: t.caExonere },
    { rubrique: 'TVA', libelle: 'TVA déductible sur biens et services', montant: t.deductibleBiensServices },
    { rubrique: 'TVA', libelle: 'TVA déductible sur immobilisations', montant: t.deductibleImmobilisations },
    { rubrique: 'TVA', libelle: 'Précompte (crédit du mois précédent)', montant: t.precompte },
    { rubrique: 'TVA', libelle: 'TVA nette à payer', montant: t.tvaNette, total: true },
    { rubrique: 'TVA', libelle: 'Crédit de TVA à reporter', montant: t.creditAReporter },
    { rubrique: 'IRG', libelle: 'IRG salaires (retenue à la source)', montant: calcul.irg.montant, total: true },
    { rubrique: 'Timbre', libelle: 'Droit de timbre (paiements en espèces)', montant: calcul.timbre, total: true },
    ...calcul.autres.map((a) => ({ rubrique: 'Autres', libelle: a.libelle, montant: a.montant, total: true })),
    { rubrique: 'Total', libelle: 'Total à payer', montant: calcul.total, total: true, final: true },
  ];
}
