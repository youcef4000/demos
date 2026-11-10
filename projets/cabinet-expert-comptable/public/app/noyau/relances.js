// Noyau du cabinet — pièces attendues et relances (workflow W9).
// Liste des pièces à demander et modèles de relance : paramètres éditables dans l'admin.
// Une relance n'est jamais envoyée directement : elle entre dans la boîte d'envoi « à valider ».
import { periodeFr, dateFr, da, remplir } from './format.js';

export const PIECES_A_DEMANDER_DEFAUT = [
  { id: 'fa', libelle: "Factures d'achat du mois", type: 'facture_achat', condition: 'toujours', actif: true },
  { id: 'fv', libelle: 'Factures de vente du mois', type: 'facture_vente', condition: 'toujours', actif: true },
  { id: 'rb', libelle: 'Relevé bancaire du mois', type: 'releve_bancaire', condition: 'banque', actif: true },
  { id: 'ep', libelle: "État de paie récapitulatif du mois (avec l'IRG retenu)", type: 'etat_paie', condition: 'salaries', actif: true },
  { id: 'pc', libelle: 'Pièces de caisse du mois (bons, reçus en espèces)', type: 'piece_caisse', condition: 'caisse', actif: true },
];

export const CONDITIONS = {
  toujours: 'Tous les dossiers',
  banque: 'Dossiers avec un compte bancaire',
  salaries: 'Dossiers avec des salariés',
  caisse: 'Dossiers qui encaissent ou paient en espèces',
};

export const MODELES_DEFAUT = [
  {
    id: 'relance_1', nom: 'Relance pièces — 1er rappel (e-mail)', usage: 'relance', canal: 'email',
    objet: 'Pièces comptables de {{mois}} — {{entreprise}}',
    corps: "Bonjour {{contact}},\n\nPour tenir la comptabilité de {{mois}} et préparer votre G50 (date limite : {{date_limite}}), il nous manque encore :\n\n{{liste_pieces}}\n\nVous pouvez les déposer en photo ou en PDF dans votre espace client, ou nous les envoyer par retour de mail.\n\nMerci d'avance,\n{{signature}}",
  },
  {
    id: 'relance_2', nom: 'Relance pièces — 2e rappel (WhatsApp)', usage: 'relance', canal: 'whatsapp',
    objet: '',
    corps: 'Bonjour {{contact}}, rappel du cabinet {{cabinet}} : pour votre G50 de {{mois}} (avant le {{date_limite}}), il nous manque : {{liste_courte}}. Vous pouvez les déposer dans votre espace client. Merci !',
  },
  {
    id: 'g50_montant', nom: 'G50 prête — montant à payer (e-mail)', usage: 'g50', canal: 'email',
    objet: 'Votre G50 de {{mois}} : {{montant}} à payer avant le {{date_limite}}',
    corps: "Bonjour {{contact}},\n\nVotre déclaration G50 de {{mois}} est prête. Montant à payer : {{montant}}, au plus tard le {{date_limite}}.\n\n{{detail}}\n\nLe détail est disponible dans votre espace client.\n\n{{signature}}",
  },
  {
    id: 'resultat', nom: 'Résultat du mois disponible (e-mail)', usage: 'resultat', canal: 'email',
    objet: 'Votre résultat de {{mois}} — {{entreprise}}',
    corps: "Bonjour {{contact}},\n\nLe résultat de {{mois}} est disponible dans votre espace client : {{resultat}} (chiffre d'affaires {{ca}}).\n\nNous restons à votre disposition pour en parler.\n\n{{signature}}",
  },
];

export function conditionRemplie(condition, dossier) {
  switch (condition) {
    case 'toujours': return true;
    case 'banque': return dossier.banque !== false;
    case 'salaries': return Number(dossier.salaries) > 0;
    case 'caisse': return Boolean(dossier.caisse);
    default: return false;
  }
}

/**
 * Pièces attendues pour un dossier et une période, avec leur état.
 * neant : types déclarés « néant ce mois » (pas de vente ce mois-ci, par exemple).
 */
export function piecesAttendues({ dossier, periode, pieces, liste = PIECES_A_DEMANDER_DEFAUT, neant = [] }) {
  return liste
    .filter((x) => x.actif !== false && conditionRemplie(x.condition, dossier))
    .map((x) => {
      const recues = pieces.filter((p) => p.dossierId === dossier.id && p.periode === periode && p.statut !== 'rejetee' && (p.type === x.type || p.fiche?.typeDoc === x.type));
      const estNeant = neant.includes(x.type);
      return { ...x, recues: recues.length, neant: estNeant, manquante: !recues.length && !estNeant };
    });
}

/** Valeurs disponibles dans les modèles : {{contact}}, {{entreprise}}, {{mois}}, {{liste_pieces}}… */
export function valeursModele({ dossier, periode, cabinet = {}, manquantes = [], g50 = null, resultat = null, dateLimite }) {
  return {
    contact: dossier.contact?.nom || 'Madame, Monsieur',
    entreprise: dossier.raisonSociale,
    mois: periodeFr(periode),
    date_limite: dateFr(dateLimite || g50?.dateLimite || ''),
    liste_pieces: manquantes.map((m) => `• ${m.libelle}`).join('\n'),
    liste_courte: manquantes.map((m) => m.libelle.replace(/ du mois.*$/, '').toLowerCase()).join(', '),
    cabinet: cabinet.nom || '',
    signature: cabinet.signature || cabinet.nom || '',
    montant: g50 ? da(g50.total) : '',
    detail: g50 ? `TVA nette : ${da(g50.tva.tvaNette)}\nIRG salaires : ${da(g50.irg.montant)}\nDroit de timbre : ${da(g50.timbre)}${g50.tva.creditAReporter ? `\nCrédit de TVA reporté : ${da(g50.tva.creditAReporter)}` : ''}` : '',
    resultat: resultat ? da(resultat.resultat) : '',
    ca: resultat ? da(resultat.groupes.ventes) : '',
  };
}

/** Brouillon de message à partir d'un modèle (jamais envoyé ici). */
export function brouillon(modele, valeurs, dossier) {
  const destinataire = modele.canal === 'whatsapp' ? dossier.contact?.telephone || '' : dossier.contact?.email || '';
  return { canal: modele.canal, modeleId: modele.id, destinataire, objet: remplir(modele.objet, valeurs), corps: remplir(modele.corps, valeurs) };
}

/** Lien WhatsApp « click to chat » : le message s'ouvre prérempli, la personne appuie elle-même sur Envoyer. */
export function lienWhatsApp(telephone, texte) {
  let t = String(telephone || '').replace(/\D/g, '');
  if (t.startsWith('0')) t = `213${t.slice(1)}`;
  return `https://wa.me/${t}?text=${encodeURIComponent(texte)}`;
}
