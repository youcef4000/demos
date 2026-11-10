// Noyau du cabinet — échéancier fiscal et social (workflow W8).
// Les règles sont des paramètres modifiables dans Paramètres → Échéancier : les dates changent avec les lois de
// finances et les reports décidés par la DGI, la CNAS ou la CASNOS. Chaque règle garde sa source et une note.
import { decalerPeriode, jourSemaine, finDePeriode } from './format.js';

export const CONCERNE = {
  tous: 'Tous les dossiers',
  reel: 'Régime du réel (G50 mensuelle)',
  ibs: "Sociétés soumises à l'IBS",
  employeurs: 'Employeurs (au moins un salarié)',
  employeurs_plus_10: 'Employeurs de plus de 10 salariés',
  employeurs_10_ou_moins: 'Employeurs de 10 salariés ou moins',
  non_salaries: 'Gérants et associés non salariés (CASNOS)',
};

export const ECHEANCIER_DEFAUT = [
  { id: 'g50', organisme: 'DGI', libelle: 'G50 du mois : déclaration et paiement (TVA, IRG salaires, droit de timbre)', frequence: 'mensuelle', jour: 20, mois: [], decalage: -1, concerne: 'reel', lien: 'g50', actif: true, verifie: true, source: 'DGI : dans les 20 premiers jours du mois suivant (report au premier jour ouvrable si jour férié)', note: '' },
  { id: 'ibs-acompte', organisme: 'DGI', libelle: 'Acompte provisionnel IBS (payé avec la G50)', frequence: 'annuelle', jour: 20, mois: [3, 6, 11], decalage: 0, concerne: 'ibs', lien: '', actif: true, verifie: true, source: 'DGI : trois acomptes au plus tard les 20 mars, 20 juin et 20 novembre', note: '' },
  { id: 'liasse', organisme: 'DGI', libelle: 'Déclaration annuelle des résultats et liasse fiscale (série G n° 4)', frequence: 'annuelle', jour: 30, mois: [4], decalage: -12, concerne: 'ibs', lien: '', actif: true, verifie: true, source: 'Au plus tard le 30 avril de l’année suivante', note: 'Reports fréquents (loi de finances, décision DGI) : vérifier chaque année.' },
  { id: 'ibs-solde', organisme: 'DGI', libelle: 'Solde de liquidation IBS', frequence: 'annuelle', jour: 20, mois: [5], decalage: -12, concerne: 'ibs', lien: '', actif: true, verifie: false, source: 'Vingt jours après la date limite de la déclaration annuelle', note: 'À décaler si la date de la liasse est reportée.' },
  { id: 'cnas-mois', organisme: 'CNAS', libelle: 'Cotisations sociales du mois : déclaration et versement', frequence: 'mensuelle', jour: 30, mois: [], decalage: -1, concerne: 'employeurs_plus_10', lien: '', actif: true, verifie: false, source: 'À confirmer auprès de la CNAS', note: 'Délai retenu : 30 jours après la fin du mois.' },
  { id: 'cnas-trimestre', organisme: 'CNAS', libelle: 'Cotisations sociales du trimestre : déclaration et versement', frequence: 'annuelle', jour: 30, mois: [1, 4, 7, 10], decalage: -1, concerne: 'employeurs_10_ou_moins', lien: '', actif: true, verifie: false, source: 'À confirmer auprès de la CNAS', note: 'Délai retenu : 30 jours après la fin du trimestre.' },
  { id: 'das', organisme: 'CNAS', libelle: 'Déclaration annuelle des salaires et des salariés (DAS)', frequence: 'annuelle', jour: 30, mois: [1], decalage: -12, concerne: 'employeurs', lien: '', actif: true, verifie: true, source: 'Calendrier publié pour 2027 : 30 janvier', note: '' },
  { id: 'casnos', organisme: 'CASNOS', libelle: 'Cotisation annuelle des non-salariés (gérant, associés)', frequence: 'annuelle', jour: 30, mois: [6], decalage: 0, concerne: 'non_salaries', lien: '', actif: true, verifie: false, source: 'À confirmer auprès de la CASNOS', note: '' },
];

export function regleConcerne(regle, dossier) {
  const s = Number(dossier.salaries) || 0;
  switch (regle.concerne) {
    case 'tous': return true;
    case 'reel': return dossier.regime !== 'ifu';
    case 'ibs': return dossier.impot === 'IBS';
    case 'employeurs': return s > 0;
    case 'employeurs_plus_10': return s > 10;
    case 'employeurs_10_ou_moins': return s > 0 && s <= 10;
    case 'non_salaries': return Boolean(dossier.casnos);
    default: return false;
  }
}

/** Date d'échéance d'une règle dans le mois « mois » (AAAA-MM) ; null si la règle ne tombe pas ce mois. */
export function dateDansLeMois(regle, mois) {
  const m = Number(mois.slice(5, 7));
  if (regle.frequence !== 'mensuelle' && !(regle.mois || []).map(Number).includes(m)) return null;
  const fin = finDePeriode(mois);
  const jour = Math.min(Number(regle.jour) || 1, Number(fin.slice(8, 10)));
  return `${mois}-${String(jour).padStart(2, '0')}`;
}

/** Période concernée par l'échéance (ex. G50 du 20/11 → octobre). */
export function periodeConcernee(regle, mois) {
  if (regle.decalage === -12) return String(Number(mois.slice(0, 4)) - 1);
  if (regle.frequence === 'annuelle' && Number(regle.decalage) === 0) {
    const liste = (regle.mois || []).map(Number).sort((a, b) => a - b);
    const rang = liste.indexOf(Number(mois.slice(5, 7))) + 1;
    return liste.length > 1 ? `${rang === 1 ? '1er' : `${rang}e`} acompte ${mois.slice(0, 4)}` : mois.slice(0, 4);
  }
  if (regle.frequence === 'annuelle' && regle.decalage === -1 && (regle.mois || []).length === 4) {
    const fin = decalerPeriode(mois, -1);
    return `T${Math.ceil(Number(fin.slice(5, 7)) / 3)} ${fin.slice(0, 4)}`;
  }
  return decalerPeriode(mois, Number(regle.decalage) || 0);
}

/**
 * Échéances du mois pour une liste de dossiers.
 * etat(dossier, regle, periodeConcernee) → { fait: bool, statut?: string } fourni par l'appelant (G50, suivi manuel).
 */
export function echeancesDuMois({ mois, dossiers, regles = ECHEANCIER_DEFAUT, etat = () => ({ fait: false }), aujourdhui }) {
  const out = [];
  for (const r of regles) {
    if (!r.actif) continue;
    const date = dateDansLeMois(r, mois);
    if (!date) continue;
    const pc = periodeConcernee(r, mois);
    const js = jourSemaine(date);
    for (const d of dossiers) {
      if (!regleConcerne(r, d)) continue;
      const e = etat(d, r, pc) || {};
      const retard = !e.fait && aujourdhui && aujourdhui > date;
      out.push({
        cle: `${r.id}|${d.id}|${date}`,
        regleId: r.id,
        organisme: r.organisme,
        libelle: r.libelle,
        date,
        periodeConcernee: pc,
        dossierId: d.id,
        dossier: d.raisonSociale,
        lien: r.lien,
        fait: Boolean(e.fait),
        statut: e.statut || (e.fait ? 'fait' : retard ? 'en_retard' : 'a_faire'),
        montant: e.montant ?? null,
        avertissement: js === 'vendredi' || js === 'samedi' ? `Tombe un ${js} (repos hebdomadaire) : prévoir le dépôt le jeudi précédent.` : '',
        verifie: r.verifie,
      });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.dossier.localeCompare(b.dossier));
}
