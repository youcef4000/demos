// Contenu éditorial et SEO des univers (familles) et sous-catégories : accroches, textes, FAQ, couleurs, photos.
// Les photos d'ambiance (img/univers/) sont des illustrations générées par ordinateur, à remplacer par des prises de vue.
// Mots-clés travaillés : grossiste, vente en gros, prix revendeur, revendeurs, palette, lot, matériel CHR, professionnel.

export const UNIVERS = {
  froid: {
    couleur: '#1a8cd8', pastel: '#e6f2fc',
    pastille: 'Tout l’univers du froid professionnel',
    titre: ['Le froid professionnel', 'au prix revendeur'],
    intro: 'Armoires réfrigérées, congélateurs, vitrines, saladettes et tables réfrigérées : le froid commercial en vente en gros pour les revendeurs, cuisinistes et distributeurs CHR. Prix revendeur HT, lots et palettes complètes, stock en entrepôt.',
    seo: [
      'Grossiste en froid professionnel, Stockinox fournit les revendeurs de matériel de restauration en France, en Belgique et à l’export. Chaque référence est vendue au prix revendeur, avec un prix public conseillé pour calculer votre marge, un colisage clair et un prix dégressif à la palette.',
      'Armoires positives et négatives, armoires à boissons, vitrines pâtissières, saladettes, dessertes réfrigérées et machines à glaçons : les modèles les plus demandés par les restaurants, snacks, boulangeries et collectivités, pour réassortir votre magasin ou équiper les cuisines de vos clients.',
    ],
    faq: [
      ['Quel volume minimum pour le froid ?', 'Le colisage est indiqué sur chaque fiche : à l’unité pour les armoires et vitrines, par lot pour les petits appareils. Le minimum de commande s’applique au panier, toutes catégories confondues.'],
      ['Livrez-vous chez mon client final ?', 'Oui : la livraison directe se fait sous étiquette neutre, sans prix ni facture dans le colis.'],
    ],
    sous: {
      'armoires-refrigerees': 'Armoires réfrigérées positives et armoires à boissons en vente en gros : inox, laquées ou vitrées, de 50 à 800 litres, au prix revendeur.',
      congelateurs: 'Congélateurs professionnels en gros : armoires négatives, coffres et modèles compacts pour revendeurs et installateurs CHR.',
      'vitrines-refrigerees': 'Vitrines réfrigérées et vitrines pâtissières au prix revendeur : modèles de comptoir et grandes vitrines d’exposition.',
      saladettes: 'Saladettes et meubles réfrigérés de préparation en gros, avec vitre et bacs gastronormes, pour snacks et restaurants.',
      'tables-refrigerees': 'Tables et dessertes réfrigérées positives ou négatives, 2 ou 3 portes, au prix grossiste.',
      'machines-a-glacons': 'Machines à glaçons pleins ou creux de 26 à 30 kg/24 h, en vente en gros pour bars et restaurants.',
    },
  },
  cuisson: {
    couleur: '#f0612a', pastel: '#fdece4',
    pastille: 'Tout l’univers de la cuisson',
    titre: ['La cuisson pro,', 'en lots et palettes'],
    intro: 'Fours mixtes et à convection, friteuses, planchas, salamandres, cuisinières et rôtissoires : le matériel de cuisson professionnel en vente en gros pour les revendeurs CHR, au prix revendeur HT.',
    seo: [
      'Le poste cuisson est le cœur d’une cuisine professionnelle et le premier poste de dépense de vos clients. Stockinox vous approvisionne en fours, friteuses gaz et électriques, planchas, salamandres, cuisinières et rôtissoires, au prix grossiste, avec un prix public conseillé pour garder votre marge.',
      'Les modèles gaz sont livrés avec leur kit de conversion quand le fabricant le prévoit : vérifiez la fiche technique (puissance, alimentation, dimensions) avant de commander pour vos clients.',
    ],
    faq: [
      ['Les appareils gaz sont-ils fournis pour le propane ?', 'La fiche technique précise le gaz d’origine et la présence d’un kit de conversion. Les versions propane existent pour une partie des friteuses et planchas.'],
      ['Puis-je commander un four à l’unité ?', 'Oui : les gros appareils de cuisson se commandent à l’unité ; le prix dégressif s’applique dès 3 lots et à la palette.'],
    ],
    sous: {
      fours: 'Fours mixtes et fours à convection professionnels en gros, électriques ou gaz, du 4 au 10 niveaux GN.',
      friteuses: 'Friteuses professionnelles électriques et gaz en vente en gros, de 4 à 21 litres, pour snacks et restaurants.',
      planchas: 'Planchas et plaques grill gaz ou électriques au prix revendeur, lisses ou chromées.',
      'grills-salamandres': 'Salamandres, toasters et grills contact professionnels en gros pour snacking et brasseries.',
      cuisinieres: 'Cuisinières professionnelles, fourneaux et plaques à induction au prix grossiste.',
      rotissoires: 'Rôtissoires à poulets électriques et gaz en vente en gros pour traiteurs et marchés.',
    },
  },
  'pizza-boulangerie': {
    couleur: '#e0453a', pastel: '#fce8e6',
    pastille: 'Tout l’univers pizza et boulangerie',
    titre: ['Pizza & boulangerie,', 'prix grossiste'],
    intro: 'Fours à pizza électriques et gaz, pétrins spirale, façonneuses et saladettes à pizza : l’équipement des pizzerias et boulangeries en vente en gros pour les revendeurs.',
    seo: [
      'Les pizzerias et les points chauds ouvrent chaque année par milliers : un marché régulier pour les revendeurs. Stockinox fournit fours à pizza, pétrins à spirale, laminoirs et saladettes au prix revendeur, avec des packs d’ouverture faciles à proposer à vos clients.',
      'Chaque fiche indique la capacité (nombre et diamètre des pizzas, litres de cuve, kilos de pâte), l’alimentation et les dimensions, pour conseiller vos clients sans erreur.',
    ],
    faq: [
      ['Proposez-vous des packs pizzeria ?', 'Oui : la rubrique « Équiper un métier » réunit four, pétrin, saladette et façonneuse, à ajouter en un clic.'],
    ],
    sous: {
      'fours-a-pizza': 'Fours à pizza professionnels en gros, électriques ou gaz, 1 à 4 pizzas, au prix revendeur.',
      petrins: 'Pétrins à spirale professionnels de 8 à 20 litres, tête fixe, 1 ou 2 vitesses, en vente en gros.',
      faconneuses: 'Façonneuses et laminoirs à pizza 30 et 40 cm au prix grossiste.',
      'saladettes-a-pizza': 'Saladettes à pizza et puits réfrigérés GN en gros pour pizzerias.',
    },
  },
  preparation: {
    couleur: '#7a5af8', pastel: '#efebfe',
    pastille: 'Tout l’univers de la préparation',
    titre: ['Préparation & boucherie,', 'en vente en gros'],
    intro: 'Trancheuses, hachoirs à viande, coupe-légumes, batteurs mélangeurs et machines sous vide : le matériel de préparation professionnel au prix revendeur.',
    seo: [
      'Boucheries, traiteurs, restaurants et collectivités renouvellent régulièrement leur matériel de préparation. Trancheuses à jambon, hachoirs, coupe-légumes, batteurs planétaires et machines sous vide : Stockinox vous fournit en gros, avec fiches techniques détaillées et prix public conseillé.',
    ],
    faq: [
      ['Vendez-vous les accessoires (disques, couteaux) ?', 'Oui, les accessoires et pièces sont disponibles sur demande et seront ajoutés au catalogue en ligne.'],
    ],
    sous: {
      trancheuses: 'Trancheuses professionnelles à jambon et à viande en gros, couteau de 220 à 300 mm.',
      hachoirs: 'Hachoirs à viande professionnels de 120 à 300 kg/h au prix revendeur.',
      'coupe-legumes': 'Coupe-légumes professionnels multifonctions jusqu’à 450 kg/h, disques inclus, en vente en gros.',
      'batteurs-blenders': 'Batteurs mélangeurs planétaires et mixeurs professionnels au prix grossiste.',
      'sous-vide': 'Machines sous vide professionnelles à cloche ou à barre, en gros pour traiteurs et restaurants.',
    },
  },
  snack: {
    couleur: '#e79a0c', pastel: '#fdf3dd',
    pastille: 'Tout l’univers du snack',
    titre: ['Snack & maintien au chaud,', 'pour vos clients pros'],
    intro: 'Machines à kebab, chauffe-frites, bains-marie, vitrines chauffantes, crêpières et gaufriers : l’équipement de la restauration rapide en vente en gros.',
    seo: [
      'La restauration rapide est le premier marché des revendeurs CHR : snacks, kebabs, friteries et food trucks s’équipent vite et renouvellent souvent. Stockinox vous fournit en gros les appareils les plus vendus, du grill à kebab au chauffe-frites, au prix revendeur HT.',
    ],
    faq: [
      ['Avez-vous des machines à kebab gaz et électriques ?', 'Oui, les deux, avec des broches de différentes capacités ; la fiche précise la puissance et le nombre de brûleurs.'],
    ],
    sous: {
      kebab: 'Machines à kebab gaz et électriques, coupeuses doner, en vente en gros pour snacks.',
      'chauffe-frites': 'Chauffe-frites et chauffe-aliments à infrarouge au prix revendeur.',
      'bain-marie': 'Bains-marie électriques GN pour maintien au chaud, en vente en gros.',
      'vitrines-chauffantes': 'Vitrines chauffantes de comptoir 35 à 50 litres au prix grossiste.',
      'crepieres-gaufriers': 'Crêpières, poffertjes et gaufriers professionnels en gros pour snacks et forains.',
    },
  },
  bar: {
    couleur: '#0fa38f', pastel: '#e0f5f1',
    pastille: 'Tout l’univers du café et du bar',
    titre: ['Café & bar,', 'au prix revendeur'],
    intro: 'Machines à granita, machines à café frappé, distributeurs de boissons et presse-agrumes : le matériel de bar en vente en gros pour les revendeurs.',
    seo: [
      'Bars, cafés, glaciers et parcs de loisirs : les machines à boissons sont des produits à forte rotation pour un revendeur. Stockinox vous fournit machines à granita, distributeurs de boissons réfrigérées et machines à café frappé au prix grossiste.',
    ],
    faq: [
      ['Les machines à granita sont-elles livrées montées ?', 'Oui, prêtes à brancher ; la fiche indique le nombre de bacs et leur contenance.'],
    ],
    sous: {
      'machines-a-granita': 'Machines à granita et slush 1 ou 2 bacs de 12 litres en vente en gros.',
      'machines-a-cafe': 'Machines à café frappé et équipement de bar au prix revendeur.',
      'distributeurs-boissons': 'Distributeurs de boissons réfrigérées et presse-agrumes en gros.',
    },
  },
  laverie: {
    couleur: '#139dd2', pastel: '#e1f3fa',
    pastille: 'Tout l’univers de la laverie',
    titre: ['Laverie professionnelle,', 'prix grossiste'],
    intro: 'Lave-vaisselle frontaux et lave-verres professionnels, avec ou sans pompe de vidange : la plonge en vente en gros pour les revendeurs CHR.',
    seo: [
      'Le lave-vaisselle et le lave-verres sont indispensables dans chaque restaurant et chaque bar. Stockinox vous fournit en gros des modèles frontaux 35×35 à 50×50 cm, avec ou sans pompe de vidange, au prix revendeur et avec fiche technique complète.',
    ],
    faq: [
      ['Quelle différence entre lave-verres et lave-vaisselle ?', 'Le lave-verres a un panier plus petit (35 à 40 cm) et une hauteur utile adaptée aux verres ; le lave-vaisselle accepte assiettes et plateaux (paniers de 50 cm).'],
    ],
    sous: {
      'lave-vaisselle': 'Lave-vaisselle professionnels frontaux en vente en gros, paniers 35 à 50 cm.',
      'lave-verres': 'Lave-verres professionnels 400×400 mm, avec ou sans pompe de vidange, au prix revendeur.',
    },
  },
  inox: {
    couleur: '#5b6b80', pastel: '#ebeff3',
    pastille: 'Tout l’univers de l’inox',
    titre: ['Inox & hygiène,', 'à la palette'],
    intro: 'Tables inox, plonges, étagères murales et lave-mains : le mobilier inox professionnel en vente en gros, idéal pour les commandes à la palette.',
    seo: [
      'Le mobilier inox est le produit idéal pour la palette : léger, empilable, demandé dans chaque cuisine professionnelle. Stockinox vous fournit tables de travail, plonges, étagères murales et lave-mains à commande fémorale au prix grossiste, en profondeur 600 ou 700 mm.',
    ],
    faq: [
      ['Les tables inox sont-elles livrées démontées ?', 'Oui pour la plupart : elles voyagent à plat, ce qui permet d’en charger davantage par palette.'],
    ],
    sous: {
      'tables-inox': 'Tables inox professionnelles avec ou sans étagère, profondeur 600 ou 700 mm, en vente en gros.',
      plonges: 'Plonges et éviers inox 1 cuve, avec ou sans sous-tablette, au prix revendeur.',
      etageres: 'Étagères murales inox 600 à 1000 mm en gros, idéales pour compléter une palette.',
      'lave-mains': 'Lave-mains inox à commande au genou, conformes aux normes d’hygiène, au prix grossiste.',
    },
  },
  ventilation: {
    couleur: '#4b6bff', pastel: '#e8ecff',
    pastille: 'Tout l’univers de la ventilation',
    titre: ['Ventilation & extraction,', 'pour les installateurs'],
    intro: 'Hottes professionnelles et moteurs d’extraction avec ou sans caisson : la ventilation de cuisine en vente en gros pour revendeurs et installateurs.',
    seo: [
      'Une cuisine professionnelle doit être correctement ventilée. Stockinox fournit aux installateurs et revendeurs des hottes déflecteurs et des moteurs d’extraction (caissons et ventilateurs) au prix grossiste, avec les débits et dimensions indiqués sur chaque fiche.',
    ],
    faq: [
      ['Fournissez-vous le dimensionnement ?', 'Notre équipe vous aide à choisir le moteur adapté à la hotte et au volume de la cuisine : écrivez-nous depuis la page Contact.'],
    ],
    sous: {
      hottes: 'Hottes professionnelles à déflecteurs de 51 à 100 cm en vente en gros.',
      moteurs: 'Moteurs de hotte et ventilateurs d’extraction avec ou sans caisson, au prix revendeur.',
    },
  },
};

export const FAQ_GROS = [
  ['Qui peut acheter sur Stockinox ?', 'Les professionnels qui revendent ou installent du matériel CHR : grossistes, revendeurs en magasin, e-commerçants, cuisinistes et installateurs, centrales d’achat et clients export. Un SIRET (ou un numéro de TVA pour l’Union européenne) est demandé à l’ouverture du compte.'],
  ['Comment voir les prix revendeur ?', 'Les prix revendeur sont réservés aux comptes validés. Ouvrez votre compte en deux minutes : nous le validons sous 24 h ouvrées et vos prix, votre niveau de remise et vos conditions de paiement s’affichent sur tout le catalogue.'],
  ['Y a-t-il un minimum de commande ?', 'Oui, un montant minimum par commande et un colisage par référence (à l’unité, par lot ou à la palette). Les deux sont affichés clairement avant l’ajout au panier.'],
  ['Comment marchent les prix dégressifs ?', 'Le prix baisse dès 3 lots d’une même référence, puis à la palette complète. S’y ajoute la remise de votre niveau (Silver, Gold, Distributeur), calculée sur votre volume d’achat annuel.'],
  ['Livrez-vous directement chez mes clients ?', 'Oui : la livraison directe se fait sous étiquette neutre, sans prix ni document à notre nom dans le colis. Vous gardez la relation avec votre client.'],
  ['Puis-je récupérer les fiches et photos pour mon site ?', 'Oui : depuis votre compte, exportez le catalogue (références, prix revendeur, prix public conseillé, descriptions, caractéristiques et photos) pour l’importer sur votre boutique.'],
  ['Quels délais et quels moyens de paiement ?', 'Expédition sous 1 à 3 jours ouvrés pour le stock, par messagerie ou palette. Paiement par virement, carte, ou à 30 / 45 jours fin de mois pour les comptes validés.'],
];

export const ETAPES_GROS = [
  ['Ouvrez votre compte revendeur', 'SIRET ou n° de TVA, activité, volume estimé : deux minutes en ligne.'],
  ['Validation sous 24 h ouvrées', 'Nous vérifions votre société et activons votre niveau de remise et vos conditions de paiement.'],
  ['Commandez en lots ou en palettes', 'Prix revendeur, prix public conseillé et marge affichés sur chaque fiche. Prix dégressifs automatiques.'],
  ['Livraison chez vous ou chez votre client', 'Palette, camion avec hayon, enlèvement à l’entrepôt ou livraison directe sous étiquette neutre.'],
];
