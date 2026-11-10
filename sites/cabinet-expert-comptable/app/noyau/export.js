// Noyau du cabinet — exports Excel (workflow W5 et W6).
//  - écritures validées au format d'import de PC Compta (colonnes réglables : hypothèse H6, le modèle exact
//    du cabinet n'a pas été transmis) ;
//  - G50 prête à saisir ;
//  - état des achats du mois (« l'état que tu veux récupérer », mémo 2, 00:05).
import { classeur } from './xlsx.js';
import { dateFr, periodeFr, nif } from './format.js';
import { JOURNAUX } from './scf.js';
import { lignesG50 } from './g50.js';

export const CHAMPS_EXPORT = {
  journal: 'Code journal',
  date: 'Date',
  piece: 'N° de pièce',
  compte: 'Compte',
  tiers: 'Tiers',
  nif: 'NIF du tiers',
  libelle: 'Libellé',
  debit: 'Débit',
  credit: 'Crédit',
  sens: 'Sens (D/C)',
  montant: 'Montant',
};

export const EXPORT_DEFAUT = {
  logiciel: 'PC Compta',
  nomFichier: 'PCCOMPTA_{dossier}_{periode}',
  colonnes: [
    { champ: 'journal', titre: 'Journal' },
    { champ: 'date', titre: 'Date' },
    { champ: 'piece', titre: 'N° Pièce' },
    { champ: 'compte', titre: 'Compte' },
    { champ: 'libelle', titre: 'Libellé' },
    { champ: 'debit', titre: 'Débit' },
    { champ: 'credit', titre: 'Crédit' },
  ],
  codesJournaux: { AC: 'AC', VT: 'VT', BQ: 'BQ', CA: 'CA', PA: 'PA' },
  dateEnTexte: false,
  compteTiersAuxiliaire: false,
};

const TYPES = { date: 'date', debit: 'montant', credit: 'montant', montant: 'montant' };
const LARGEURS = { journal: 9, date: 12, piece: 14, compte: 11, tiers: 28, nif: 20, libelle: 42, debit: 15, credit: 15, sens: 7, montant: 15 };

function compteExport(l, e, cfg) {
  if (!cfg.compteTiersAuxiliaire || !/^4(01|04|11)$/.test(String(l.compte)) || !e.tiers?.nif) return String(l.compte);
  return `${l.compte}${nif(e.tiers.nif).slice(-6)}`;
}

/** Lignes d'export (une par ligne d'écriture), pour l'aperçu à l'écran comme pour le fichier. */
export function lignesExport(ecritures, cfg = EXPORT_DEFAUT) {
  const out = [];
  const tri = [...ecritures].sort((a, b) => a.journal.localeCompare(b.journal) || a.date.localeCompare(b.date) || String(a.numeroPiece).localeCompare(String(b.numeroPiece)));
  for (const e of tri) {
    for (const l of e.lignes) {
      const v = {
        journal: cfg.codesJournaux?.[e.journal] || e.journal,
        date: cfg.dateEnTexte ? dateFr(e.date) : e.date,
        piece: e.numeroPiece,
        compte: compteExport(l, e, cfg),
        tiers: e.tiers?.nom || '',
        nif: e.tiers?.nif || '',
        libelle: l.libelle || e.libelle,
        debit: l.debit || 0,
        credit: l.credit || 0,
        sens: l.debit ? 'D' : 'C',
        montant: l.debit || l.credit || 0,
      };
      out.push(cfg.colonnes.map((c) => v[c.champ]));
    }
  }
  return out;
}

export function nomFichierExport(cfg, dossier, periode) {
  const court = String(dossier.raisonSociale || 'dossier').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').toUpperCase();
  return `${(cfg.nomFichier || 'export_{dossier}_{periode}').replace('{dossier}', court).replace('{periode}', periode.replace('-', ''))}.xlsx`;
}

/** Classeur d'import PC Compta : une feuille d'écritures + une feuille de contrôle par journal. */
export function exportPCCompta(ecritures, dossier, periode, cfg = EXPORT_DEFAUT) {
  const colonnes = cfg.colonnes.map((c) => ({ titre: c.titre, type: c.champ === 'date' && cfg.dateEnTexte ? 'texte' : TYPES[c.champ] || 'texte', largeur: LARGEURS[c.champ] }));
  const totaux = {};
  for (const e of ecritures) {
    const t = (totaux[e.journal] ||= { debit: 0, credit: 0, n: 0 });
    t.n++;
    for (const l of e.lignes) {
      t.debit += l.debit || 0;
      t.credit += l.credit || 0;
    }
  }
  const controle = Object.entries(totaux).map(([j, t]) => [cfg.codesJournaux?.[j] || j, JOURNAUX[j] || j, t.n, t.debit, t.credit, t.debit === t.credit ? 'Équilibré' : 'ÉCART']);
  return {
    nom: nomFichierExport(cfg, dossier, periode),
    octets: classeur([
      { nom: 'Ecritures', colonnes, lignes: lignesExport(ecritures, cfg) },
      {
        nom: 'Controle',
        colonnes: [{ titre: 'Journal', largeur: 9 }, { titre: 'Libellé', largeur: 28 }, { titre: 'Écritures', type: 'nombre', largeur: 11 }, { titre: 'Total débit', type: 'montant', largeur: 16 }, { titre: 'Total crédit', type: 'montant', largeur: 16 }, { titre: 'Contrôle', largeur: 12 }],
        lignes: controle,
      },
    ]),
  };
}

/** G50 prête à saisir (Excel), avec le détail des factures retenues. */
export function exportG50(declaration, dossier) {
  const c = declaration.calcul;
  const entete = [
    ['Contribuable', dossier.raisonSociale],
    ['NIF', dossier.nif],
    ['Article d’imposition', dossier.ai || ''],
    ['Période', periodeFr(declaration.periode)],
    ['Date limite', dateFr(c.dateLimite)],
    ['Statut', declaration.statut],
  ];
  return {
    nom: `G50_${nomFichierExport({ nomFichier: '{dossier}_{periode}' }, dossier, declaration.periode)}`,
    octets: classeur([
      {
        nom: 'G50',
        colonnes: [{ titre: 'Rubrique', largeur: 12 }, { titre: 'Libellé', largeur: 46 }, { titre: 'Montant (DA)', type: 'montant', largeur: 18 }],
        lignes: [...entete.map(([a, b]) => ['Identification', `${a} : ${b}`, null]), ...lignesG50(c).map((l) => ({ valeurs: [l.rubrique, l.libelle, l.montant], gras: Boolean(l.total) }))],
      },
      {
        nom: 'Ventes retenues',
        colonnes: [{ titre: 'Date', type: 'date', largeur: 12 }, { titre: 'N° facture', largeur: 14 }, { titre: 'Client', largeur: 32 }, { titre: 'Nature', largeur: 14 }, { titre: 'HT', type: 'montant', largeur: 16 }, { titre: 'TVA', type: 'montant', largeur: 16 }],
        lignes: c.detailVentes.map((v) => [v.date, v.numero, v.tiers, v.nature, v.ht, v.tva]),
      },
      {
        nom: 'Achats retenus',
        colonnes: [{ titre: 'Date', type: 'date', largeur: 12 }, { titre: 'N° facture', largeur: 14 }, { titre: 'Fournisseur', largeur: 32 }, { titre: 'NIF', largeur: 20 }, { titre: 'HT', type: 'montant', largeur: 16 }, { titre: 'TVA', type: 'montant', largeur: 16 }, { titre: 'TTC', type: 'montant', largeur: 16 }],
        lignes: c.detailAchats.map((v) => [v.date, v.numero, v.tiers, v.nif, v.ht, v.tva, v.ttc]),
      },
    ]),
  };
}

/** État des achats du mois (relevé des factures d'achat et TVA déductible). */
export function exportEtatAchats(calcul, dossier, periode) {
  const lignes = calcul.detailAchats.map((v) => [v.date, v.numero, v.tiers, v.nif, v.ht, v.tva, v.ttc]);
  const t = calcul.detailAchats.reduce((s, v) => ({ ht: s.ht + v.ht, tva: s.tva + v.tva, ttc: s.ttc + v.ttc }), { ht: 0, tva: 0, ttc: 0 });
  lignes.push({ valeurs: ['', '', 'TOTAL', '', t.ht, t.tva, t.ttc], gras: true });
  return {
    nom: `ETAT_ACHATS_${nomFichierExport({ nomFichier: '{dossier}_{periode}' }, dossier, periode)}`,
    octets: classeur([{ nom: 'Etat des achats', colonnes: [{ titre: 'Date', type: 'date', largeur: 12 }, { titre: 'N° facture', largeur: 14 }, { titre: 'Fournisseur', largeur: 34 }, { titre: 'NIF', largeur: 20 }, { titre: 'HT', type: 'montant', largeur: 16 }, { titre: 'TVA déductible', type: 'montant', largeur: 16 }, { titre: 'TTC', type: 'montant', largeur: 16 }], lignes }]),
  };
}
