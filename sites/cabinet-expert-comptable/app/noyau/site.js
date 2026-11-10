// Noyau du cabinet — textes du site public et coordonnées du cabinet (modifiables dans Admin → Textes du site).
// Le nom « Cabinet Mizane » est provisoire (hypothèse H1) : le nom du cabinet n'est pas donné dans les mémos.

export const CABINET_DEFAUT = {
  nom: 'Cabinet Mizane',
  activite: 'Expertise comptable',
  expert: "[Nom de l'expert-comptable]",
  ville: 'Alger',
  adresse: '[Adresse du cabinet]',
  telephone: '[Téléphone du cabinet]',
  whatsapp: '',
  email: '[contact@votre-domaine.dz]',
  horaires: 'Du dimanche au jeudi, de 8 h 30 à 17 h',
  agrement: "[N° d'inscription au tableau de l'Ordre national des experts-comptables]",
  signature: "L'équipe du Cabinet Mizane",
};

export const SITE_DEFAUT = {
  accroche: 'Expertise comptable · Algérie',
  titre: 'Votre comptabilité SCF tenue chaque mois, votre G50 prête avant le 20.',
  sousTitre: 'Déposez vos factures en photo depuis votre téléphone. Le cabinet les lit, les classe, les comptabilise et prépare votre déclaration du mois. Chaque écriture est vérifiée par un collaborateur.',
  boutonPrincipal: 'Accéder à mon espace client',
  boutonSecondaire: 'Nous écrire',
  services: [
    { titre: 'Tenue de comptabilité selon le SCF', texte: "Vos factures d'achat et de vente classées par nature (marchandises, production, prestations, travaux) et comptabilisées dans les journaux achats, ventes, banque et caisse." },
    { titre: 'Déclaration mensuelle G50', texte: "TVA collectée et déductible, précompte, IRG sur salaires, droit de timbre : votre G50 est préparée, contrôlée par l'associé et prête à déposer avant la date limite." },
    { titre: 'Résultat du mois', texte: "Chaque mois, votre chiffre d'affaires, vos charges et votre résultat, publiés dans votre espace client dès que la comptabilité du mois est validée." },
    { titre: 'Espace client en ligne', texte: 'Les pièces à fournir, les échéances fiscales et sociales, les montants à payer et les messages du cabinet, au même endroit, sur téléphone comme sur ordinateur.' },
  ],
  etapesTitre: 'Comment nous travaillons, chaque mois',
  etapes: [
    { titre: 'Vous déposez vos pièces', texte: 'Factures, relevé bancaire, état de paie : en photo, en scan ou en PDF, depuis votre espace client.' },
    { titre: 'Lecture et classement', texte: 'Chaque facture est lue (HT, TVA, timbre, TTC, mode de paiement), classée en achat ou en vente et rangée par nature.' },
    { titre: 'Comptabilisation vérifiée', texte: "Les écritures sont proposées pour chaque journal puis validées par un collaborateur avant d'entrer dans notre logiciel comptable." },
    { titre: 'G50 et résultat', texte: "La G50 est validée par l'associé ; vous recevez le montant à payer et la date limite, puis le résultat du mois." },
  ],
  engagementsTitre: 'Nos engagements',
  engagements: [
    { titre: 'Secret professionnel', texte: 'Vos pièces et vos chiffres ne sont accessibles qu’au cabinet et à vous. Chaque accès est tracé.' },
    { titre: 'Contrôle humain', texte: 'Aucune écriture, aucune déclaration, aucun message ne part sans la validation d’un membre du cabinet.' },
    { titre: 'Échéances tenues', texte: 'Un échéancier fiscal et social suit chaque dossier : G50, acomptes IBS, CNAS, CASNOS, liasse annuelle.' },
  ],
  contactTitre: 'Parlons de votre dossier',
  contactTexte: 'Décrivez votre activité en quelques lignes : nous vous rappelons pour fixer un premier rendez-vous.',
  mentions: 'Site de démonstration : nom, coordonnées et contenus sont des exemples à remplacer.',
};
