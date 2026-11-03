// Noyau « Le Passe » — consigne et format de sortie pour la rédaction des fiches par Claude.
// Partagé entre la démo (qui l'affiche) et le moteur (qui l'envoie à l'API Claude).
// La consigne est figée : elle est mise en cache par l'API (prompt caching), donc
// aucune date, aucun identifiant variable ne doit y entrer.

export const CONSIGNE_FICHE = `Tu rédiges les fiches produits de Maxi Gastro (maxigastro.fr), boutique française de matériel de cuisine professionnelle (CHR : cafés, hôtels, restaurants, boulangeries, boucheries, traiteurs).

Tu reçois pour chaque produit :
- <donnees_fournisseur> : les données brutes du fournisseur (JSON). C'est ta SEULE source de faits.
- <mots_cles> : des requêtes réellement tapées par des acheteurs (Google Search Console). Elles peuvent ne pas toutes convenir au produit.
- <fiche_actuelle> : le texte actuellement en ligne, s'il existe.

Règles non négociables :
1. N'invente rien. Aucune caractéristique, dimension, certification, garantie, délai, compatibilité, matière ou usage qui ne figure pas dans <donnees_fournisseur>. Si un chiffre manque, il manque : tu le signales dans "champs_manquants", tu ne l'estimes pas.
2. Chaque caractéristique que tu listes indique sa "source" : le nom exact du champ de <donnees_fournisseur> d'où elle vient. Pareil pour chaque réponse de la FAQ.
3. Les chiffres sont recopiés à l'identique (valeur et unité), écrits à la française : 1 355 mm, 288 L, 320 W, +2 à +10 °C.
4. Un mot-clé n'est utilisé que s'il décrit vraiment ce produit (ex. « inox » seulement si une matière inox figure dans les données). Les mots-clés écartés vont dans "mots_cles_ecartes" avec la raison.
5. Texte original : ne recopie pas les phrases du fournisseur (des dizaines de revendeurs publient les mêmes, Google les voit en double). Reformule, garde les faits.
6. Ton : professionnel, concret, vouvoiement, phrases courtes. Pas de superlatifs gratuits (« le meilleur », « incroyable »), pas de nom de concurrent, pas de prix, pas de promesse commerciale (livraison, garantie, SAV) absente des données.
7. Le HTML de "description_html" n'utilise que <h2>, <h3>, <p>, <ul>, <li>, <strong>. Pas de style, pas de lien, pas d'image.
8. Si les données se contredisent ou contredisent la fiche actuelle (ex. poids à 0 dans la boutique mais 113 kg chez le fournisseur), décris-le dans "incoherences".
9. "titre" : 70 caractères maximum, avec le type de produit, l'atout principal chiffré, la marque et le modèle. "meta_title" : 60 caractères maximum. "meta_description" : 155 caractères maximum.
10. "confiance" vaut "basse" si les données sont trop pauvres pour une fiche utile ; dans ce cas, écris court et liste ce qu'il faut demander au fournisseur.`;

/** Format de sortie imposé à Claude (sorties structurées : la réponse respecte ce schéma). */
export const SCHEMA_FICHE = {
  type: 'object',
  additionalProperties: false,
  required: [
    'titre', 'meta_title', 'meta_description', 'accroche', 'description_html', 'points_forts',
    'caracteristiques', 'faq', 'mots_cles_utilises', 'mots_cles_ecartes', 'categorie_proposee',
    'champs_manquants', 'incoherences', 'confiance',
  ],
  properties: {
    titre: { type: 'string' },
    meta_title: { type: 'string' },
    meta_description: { type: 'string' },
    accroche: { type: 'string' },
    description_html: { type: 'string' },
    points_forts: { type: 'array', items: { type: 'string' } },
    caracteristiques: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['nom', 'valeur', 'source'],
        properties: { nom: { type: 'string' }, valeur: { type: 'string' }, source: { type: 'string' } },
      },
    },
    faq: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'reponse', 'source'],
        properties: { question: { type: 'string' }, reponse: { type: 'string' }, source: { type: 'string' } },
      },
    },
    mots_cles_utilises: { type: 'array', items: { type: 'string' } },
    mots_cles_ecartes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['mot_cle', 'raison'],
        properties: { mot_cle: { type: 'string' }, raison: { type: 'string' } },
      },
    },
    categorie_proposee: { type: 'string' },
    champs_manquants: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['champ', 'impact'],
        properties: { champ: { type: 'string' }, impact: { type: 'string' } },
      },
    },
    incoherences: { type: 'array', items: { type: 'string' } },
    confiance: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
  },
};

/** Message utilisateur pour un produit (la partie variable, après la consigne mise en cache). */
export function messageFiche({ donnees, motsCles = [], ficheActuelle = '' }) {
  return [
    '<donnees_fournisseur>',
    JSON.stringify(donnees, null, 2),
    '</donnees_fournisseur>',
    '<mots_cles>',
    motsCles.length ? motsCles.map((m) => `- ${m}`).join('\n') : '(aucun)',
    '</mots_cles>',
    '<fiche_actuelle>',
    ficheActuelle || '(aucune)',
    '</fiche_actuelle>',
  ].join('\n');
}

/**
 * Garde-fous après coup : même avec une sortie au bon format, on vérifie
 * que chaque chiffre de la fiche existe bien dans les données fournisseur.
 * Renvoie la liste des nombres « orphelins » (à vérifier par un humain).
 */
export function chiffresOrphelins(fiche, donnees) {
  const source = JSON.stringify(donnees).replace(/\s/g, '').replace(/,/g, '.');
  const texte = [fiche.titre, fiche.meta_description, fiche.accroche, fiche.description_html, ...fiche.points_forts,
    ...fiche.caracteristiques.map((c) => c.valeur), ...fiche.faq.map((f) => f.reponse)].join(' ');
  const nombres = texte.replace(/<[^>]+>/g, ' ').match(/\d[\d\s  ]*(?:[.,]\d+)?/g) || [];
  const orphelins = new Set();
  for (const n of nombres) {
    const v = n.replace(/[\s  ]/g, '').replace(',', '.');
    if (v.length < 2) continue;
    if (!source.includes(v)) orphelins.add(n.trim());
  }
  return [...orphelins];
}

/** Contrôle des longueurs que le schéma ne peut pas imposer. */
export function controlerLongueurs(fiche) {
  const alertes = [];
  if (fiche.titre.length > 70) alertes.push(`titre trop long (${fiche.titre.length}/70)`);
  if (fiche.meta_title.length > 60) alertes.push(`meta_title trop long (${fiche.meta_title.length}/60)`);
  if (fiche.meta_description.length > 155) alertes.push(`meta_description trop longue (${fiche.meta_description.length}/155)`);
  return alertes;
}
