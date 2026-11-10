// Noyau du cabinet — génération des écritures proposées à partir d'une fiche validée (workflow W4).
// « On propose un schéma de comptabilisation pour chaque journal » (mémo 1, 01:45) : journal des achats,
// des ventes, de banque, de caisse (+ banque et paie, hypothèse H4). Chaque écriture reste « proposée » tant qu'un membre
// du cabinet ne l'a pas validée ; seules les écritures validées partent dans l'export PC Compta.
import { SCHEMAS_DEFAUT, journalDeReglement, libelleCompte } from './scf.js';
import { tiersDe, totaux } from './pieces.js';
import { nif } from './format.js';

/**
 * Imputation d'une ligne de facture (règles fixes, dans l'ordre) :
 *   1. compte saisi à la main sur la ligne ;
 *   2. historique : même fournisseur (NIF) et même nature déjà validés → même compte ;
 *   3. mots-clés des frais généraux (loyer, téléphone, assurance…) ;
 *   4. schéma par nature d'opération ;
 *   5. sinon : à proposer par l'agent « imputation_scf » (jugement), puis validation humaine.
 */
export function imputerLigne(ligne, fiche, { schemas = SCHEMAS_DEFAUT, historique = [] } = {}) {
  if (ligne.compte) return { compte: String(ligne.compte), source: ligne.sourceCompte || 'manuel', justification: ligne.justification || 'Compte choisi par le cabinet.' };
  const vente = fiche.sens === 'vente';
  const nature = ligne.nature || fiche.nature;
  if (!vente) {
    const n = nif(tiersDe(fiche).nif);
    const deja = n && historique.find((h) => h.nif === n && h.nature === nature && h.compte);
    if (deja) return { compte: deja.compte, source: 'historique', justification: `Même fournisseur déjà imputé en ${deja.compte}.` };
    if (nature === 'frais' || nature === 'prestation' || !nature) {
      const texte = `${ligne.libelle || ''} ${tiersDe(fiche).nom || ''}`.toLowerCase();
      for (const r of schemas.motsCles || []) {
        if (new RegExp(r.motif, 'i').test(texte)) return { compte: r.compte, source: 'regle', justification: `Mot-clé « ${r.motif.split('|')[0]} ».` };
      }
    }
  }
  const table = vente ? schemas.ventes : schemas.achats;
  if (nature && table?.[nature]) return { compte: table[nature], source: 'schema', justification: `Schéma « ${nature} ».` };
  return { compte: null, source: 'a_proposer', justification: 'Aucune règle : proposition de l’agent à demander.' };
}

const L = (compte, libelle, montant) => (montant >= 0 ? { compte, libelle, debit: montant, credit: 0 } : { compte, libelle, debit: 0, credit: -montant });
const C = (compte, libelle, montant) => L(compte, libelle, -montant);

function regrouper(lignes) {
  const m = new Map();
  for (const l of lignes) {
    if (!l.debit && !l.credit) continue;
    const k = `${l.compte}|${l.debit ? 'D' : 'C'}|${l.libelle}`;
    const e = m.get(k);
    if (e) {
      e.debit += l.debit;
      e.credit += l.credit;
    } else m.set(k, { ...l });
  }
  return [...m.values()];
}

export function equilibre(lignes) {
  const d = lignes.reduce((s, l) => s + (l.debit || 0), 0);
  const c = lignes.reduce((s, l) => s + (l.credit || 0), 0);
  return { debit: d, credit: c, ecart: d - c, ok: d === c };
}

/**
 * Écritures proposées pour une pièce. imputations = { indexLigne: { compte, source, justification } } déjà résolues.
 * Renvoie { ecritures: [...], manquantes: [index des lignes sans compte] }.
 */
export function genererEcritures(piece, dossier, { schemas = SCHEMAS_DEFAUT, historique = [], imputations = {} } = {}) {
  const f = piece.fiche;
  const s = schemas;
  const base = { dossierId: piece.dossierId, pieceId: piece.id, periode: piece.periode, numeroPiece: f.numero || piece.id };
  const out = [];
  const manquantes = [];

  if (f.typeDoc === 'etat_paie') {
    const p = f.paie || {};
    const net = p.net ?? (p.brut || 0) - (p.cotisationsSalariales || 0) - (p.irg || 0);
    const autres = (p.brut || 0) - (p.cotisationsSalariales || 0) - (p.irg || 0) - net;
    const lignes = [
      L(s.paie.brut, 'Salaires bruts du mois', p.brut || 0),
      C(s.paie.cnas, 'Retenue CNAS salariale', p.cotisationsSalariales || 0),
      C(s.paie.irg, 'IRG retenu sur salaires', p.irg || 0),
      C(s.paie.net, 'Salaires nets à payer', net),
      ...(autres ? [C('427', 'Autres retenues sur salaires', autres)] : []),
      L(s.paie.patronal, 'Charges patronales CNAS', p.cotisationsPatronales || 0),
      C(s.paie.cnas, 'Charges patronales CNAS', p.cotisationsPatronales || 0),
    ];
    out.push({ ...base, journal: 'PA', date: f.date || `${piece.periode}-28`, libelle: `Paie ${f.libellePeriode || piece.periode}`, lignes: regrouper(lignes), source: 'regle' });
    return { ecritures: out, manquantes };
  }
  if (f.typeDoc === 'piece_caisse') {
    // Bon de caisse : dépense payée en espèces, sans TVA récupérable → charge au débit, caisse au crédit
    const lignes = [];
    let total = 0;
    (f.lignes || []).forEach((l, i) => {
      const imp = imputations[i] || imputerLigne(l, { ...f, sens: 'achat', nature: f.nature || 'frais' }, { schemas: s, historique });
      if (!imp.compte) return manquantes.push(i);
      lignes.push(L(imp.compte, l.libelle || libelleCompte(imp.compte), l.montantHT));
      total += l.montantHT;
    });
    if (manquantes.length || !total) return { ecritures: [], manquantes };
    lignes.push(C(s.tresorerie.caisse, `Bon de caisse ${f.numero || ''}`.trim(), total));
    out.push({ ...base, journal: 'CA', date: f.date || `${piece.periode}-28`, libelle: `Bon de caisse ${f.numero || ''}`.trim(), lignes: regrouper(lignes), source: 'regle' });
    return { ecritures: out, manquantes };
  }
  if (!['facture_achat', 'facture_vente', 'avoir'].includes(f.typeDoc)) return { ecritures: out, manquantes };

  const vente = f.sens === 'vente';
  const signe = f.typeDoc === 'avoir' ? -1 : 1;
  const t = totaux(f);
  const tiers = tiersDe(f);
  const nomTiers = tiers.nom || (vente ? 'Client' : 'Fournisseur');
  const libelle = `${vente ? 'Fact.' : 'Fact.'} ${f.numero || ''} ${nomTiers}`.replace(/\s+/g, ' ').trim();
  const immo = !vente && f.nature === 'immobilisation';
  const compteTiers = vente ? s.tiers.client : immo ? s.tiers.fournisseurImmo : s.tiers.fournisseur;

  const lignes = [];
  let sourceAgent = false;
  (f.lignes || []).forEach((l, i) => {
    const imp = imputations[i] || imputerLigne(l, f, { schemas: s, historique });
    if (!imp.compte) {
      manquantes.push(i);
      return;
    }
    if (imp.source === 'agent') sourceAgent = true;
    const m = signe * l.montantHT;
    lignes.push(vente ? C(imp.compte, l.libelle || libelleCompte(imp.compte), m) : L(imp.compte, l.libelle || libelleCompte(imp.compte), m));
  });
  for (const [taux, montant] of Object.entries(t.tvaParTaux)) {
    if (!montant) continue;
    const m = signe * montant;
    if (vente) lignes.push(C(s.tva.collectee, `TVA collectée ${taux} %`, m));
    else lignes.push(L(immo ? s.tva.deductibleImmo : s.tva.deductible, `TVA déductible ${taux} %`, m));
  }
  if (t.timbre) lignes.push(vente ? C(s.timbre.vente, 'Droit de timbre', signe * t.timbre) : L(s.timbre.achat, 'Droit de timbre', signe * t.timbre));
  lignes.push(vente ? L(compteTiers, nomTiers, signe * t.ttc) : C(compteTiers, nomTiers, signe * t.ttc));

  if (manquantes.length) return { ecritures: [], manquantes };

  out.push({ ...base, journal: vente ? 'VT' : 'AC', date: f.date, libelle, lignes: regrouper(lignes), source: sourceAgent ? 'agent' : 'regle', tiers: { nom: nomTiers, nif: tiers.nif || '' } });

  const jr = journalDeReglement(f.modePaiement);
  if (jr) {
    const tresor = jr === 'CA' ? s.tresorerie.caisse : s.tresorerie.banque;
    const m = signe * t.ttc;
    const reg = vente ? [L(tresor, `Encaissement ${nomTiers}`, m), C(compteTiers, nomTiers, m)] : [L(compteTiers, nomTiers, m), C(tresor, `Règlement ${nomTiers}`, m)];
    out.push({ ...base, journal: jr, date: f.datePaiement || f.date, libelle: `${vente ? 'Encaissement' : 'Règlement'} ${f.numero || ''} ${nomTiers}`.replace(/\s+/g, ' ').trim(), lignes: reg, source: 'regle', tiers: { nom: nomTiers, nif: tiers.nif || '' } });
  }
  return { ecritures: out, manquantes };
}

/** Historique d'imputation (fournisseur → compte) tiré des écritures validées d'un dossier. */
export function historiqueImputations(pieces, ecritures) {
  const parPiece = new Map(pieces.map((p) => [p.id, p]));
  const h = [];
  for (const e of ecritures) {
    if (e.statut !== 'validee' && e.statut !== 'exportee') continue;
    if (e.journal !== 'AC') continue;
    const p = parPiece.get(e.pieceId);
    if (!p?.fiche) continue;
    const charge = e.lignes.find((l) => /^[26]/.test(l.compte) && l.debit);
    if (charge) h.push({ nif: nif(p.fiche.emetteur?.nif), nature: p.fiche.nature, compte: charge.compte });
  }
  return h;
}
