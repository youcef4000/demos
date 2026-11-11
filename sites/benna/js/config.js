// Réglages de Benna : tout ce qui change sans toucher au code de l'application.

export const CONFIG = {
  nom: 'Benna',
  version: '1.0',

  // Numéro WhatsApp qui reçoit les demandes d'abonnement et de partenariat (format international, sans +).
  whatsapp: '213558678038',

  // Clé publique qui vérifie les liens d'activation. La clé privée correspondante n'est pas dans le dépôt :
  // elle sert, dans admin.html, à créer les liens. Changer cette clé annule tous les liens déjà émis.
  cleLicence: { kty: 'EC', crv: 'P-256', x: 'sBnX7mUrq3pTn93yAW99Ky5AdpmoUt2GLqFQLfDySho', y: 'kvoOAQnSvYn_VsDsAm2Z1ChcsVF7e12-OZLv6ZCho2o' },

  // Prix affichés dans « Offres ». Ce sont des propositions de départ.
  prix: {
    plus: { DZD: { mois: 390, an: 2900 }, EUR: { mois: 2.99, an: 19.99 } },
    pro: { DZD: { mois: 990, an: 7900 }, EUR: { mois: 7.99, an: 59 } },
  },

  // Durée de l'essai gratuit de toutes les fonctions, en jours.
  essaiJours: 7,

  // Premier jour du Ramadan selon les calculs astronomiques ; la date officielle est fixée la veille.
  ramadan: { debut: '2027-02-08', jours: 30 },

  // Nombre de recettes personnelles autorisées sans abonnement.
  persoGratuites: 3,
};
