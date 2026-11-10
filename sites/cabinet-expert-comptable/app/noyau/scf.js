// Noyau du cabinet — Système comptable financier (SCF, loi 07-11 du 25/11/2007).
// Extrait du plan de comptes utilisé par les schémas de comptabilisation proposés par défaut.
// Tout est modifiable dans Paramètres → Schémas de comptabilisation : ces valeurs ne sont qu'un point de départ
// que l'associé valide une fois, au démarrage, pour l'aligner sur le plan de comptes de PC Compta du cabinet.

export const PLAN_COMPTES = {
  '205': 'Logiciels informatiques et assimilés',
  '215': 'Installations techniques, matériel et outillage industriels',
  '2182': 'Matériel de transport',
  '2183': 'Matériel de bureau et matériel informatique',
  '2184': 'Mobilier',
  '401': 'Fournisseurs de stocks et services',
  '404': "Fournisseurs d'immobilisations",
  '411': 'Clients',
  '421': 'Personnel, rémunérations dues',
  '427': 'Personnel, oppositions et autres retenues',
  '431': 'Sécurité sociale (CNAS)',
  '442': "État, impôts et taxes recouvrables sur des tiers (IRG salaires)",
  '4456': 'TVA déductible sur biens et services',
  '4452': 'TVA déductible sur immobilisations',
  '4457': 'TVA collectée',
  '447': 'Autres impôts, taxes et versements assimilés (droit de timbre)',
  '512': 'Banque',
  '53': 'Caisse',
  '600': 'Achats de marchandises vendues',
  '601': 'Matières premières',
  '602': 'Autres approvisionnements',
  '604': "Achats d'études et de prestations de services",
  '605': 'Achats de matériels, équipements et travaux',
  '607': 'Achats non stockés de matières et fournitures',
  '611': 'Sous-traitance générale',
  '613': 'Locations',
  '615': 'Entretien, réparations et maintenance',
  '616': "Primes d'assurances",
  '617': 'Études et recherches',
  '618': 'Documentation et divers',
  '621': "Personnel extérieur à l'entreprise",
  '622': "Rémunérations d'intermédiaires et honoraires",
  '623': 'Publicité, publications, relations publiques',
  '624': 'Transports de biens et transport collectif du personnel',
  '625': 'Déplacements, missions et réceptions',
  '626': 'Frais postaux et de télécommunications',
  '627': 'Services bancaires et assimilés',
  '628': 'Cotisations et divers',
  '631': 'Rémunérations du personnel',
  '635': 'Cotisations aux organismes sociaux',
  '645': 'Autres impôts et taxes',
  '700': 'Ventes de marchandises',
  '701': 'Ventes de produits finis',
  '704': 'Vente de travaux',
  '706': 'Autres prestations de services',
};

/** Natures d'opération citées dans le mémo 1 (prestation, vente de marchandises, production, travaux). */
export const NATURES = {
  marchandises: 'Vente / achat de marchandises (négoce)',
  production: 'Production (produits finis, matières premières)',
  prestation: 'Prestation de services',
  travaux: 'Travaux',
  immobilisation: "Achat d'immobilisation",
  frais: 'Frais généraux (loyer, téléphone, banque, assurance…)',
};

/** Journaux cités dans le mémo 1 (01:48) : achats, ventes, caisse, « paie ou paiement » → banque et paie (hypothèse H4). */
export const JOURNAUX = {
  AC: 'Journal des achats',
  VT: 'Journal des ventes',
  BQ: 'Journal de banque',
  CA: 'Journal de caisse',
  PA: 'Journal de paie',
};

export const MODES_PAIEMENT = {
  especes: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement',
  carte: 'Carte CIB / Edahabia',
  a_terme: 'À terme (non réglée)',
};

/**
 * Schémas de comptabilisation par défaut (règles fixes, éditables dans l'admin).
 * achats[nature] = compte de charge (ou d'immobilisation) au débit ; ventes[nature] = compte de produit au crédit.
 * motsCles : règles d'imputation des frais généraux (libellé de ligne ou nom du fournisseur → compte).
 */
export const SCHEMAS_DEFAUT = {
  achats: {
    marchandises: '600',
    production: '601',
    prestation: '604',
    travaux: '605',
    // immobilisation (215, 2182, 2183, 2184…) et « frais » sans mot-clé reconnu : pas de compte par défaut,
    // l'agent imputation_scf propose (jugement), le collaborateur valide
  },
  ventes: {
    marchandises: '700',
    production: '701',
    prestation: '706',
    travaux: '704',
  },
  tiers: { fournisseur: '401', fournisseurImmo: '404', client: '411' },
  tva: { deductible: '4456', deductibleImmo: '4452', collectee: '4457' },
  timbre: { achat: '645', vente: '447' },
  tresorerie: { banque: '512', caisse: '53' },
  paie: { brut: '631', patronal: '635', cnas: '431', irg: '442', net: '421' },
  motsCles: [
    { motif: 'loyer|location', compte: '613' },
    { motif: 'entretien|réparation|reparation|maintenance', compte: '615' },
    { motif: 'assurance', compte: '616' },
    { motif: 'honoraire|commission|avocat|notaire', compte: '622' },
    { motif: 'transport|fret|livraison', compte: '624' },
    { motif: 'téléphone|telephone|internet|fibre|adsl|forfait|poste', compte: '626' },
    { motif: 'frais bancaires|agios|tenue de compte|commission bancaire', compte: '627' },
    { motif: 'carburant|gasoil|gazole|essence|fourniture|papeterie|consommable', compte: '607' },
  ],
};

export function libelleCompte(compte, plan = PLAN_COMPTES) {
  return plan[compte] || plan[String(compte).slice(0, 3)] || 'Compte à préciser';
}

/** Journal de règlement selon le mode de paiement (règle fixe). null = facture à terme, pas de règlement. */
export function journalDeReglement(mode) {
  if (mode === 'especes') return 'CA';
  if (mode === 'cheque' || mode === 'virement' || mode === 'carte') return 'BQ';
  return null;
}
