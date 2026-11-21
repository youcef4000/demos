# demos

Sites de démonstration pour prospects : un dossier par démo dans `sites/`, publié par GitHub Pages.

En ligne sur **https://demos.bornzstudio.com** :

| Adresse | Contenu |
|---|---|
| `/` | Galerie des démos marquées `public` dans `sites/demos.json` |
| `/<slug>/` | La démo du dossier `sites/<slug>/` |
| `/hooked-academy/…` | Renvoie vers https://hooked-academy.tech (la formation a son propre site) |

## Ajouter une démo

1. Créer `sites/<slug>/index.html` (et ses fichiers, avec des chemins relatifs).
2. Ajouter l'entrée dans `sites/demos.json` (`"public": false` pour un lien envoyé en privé).
3. Pousser sur `main` : la démo est en ligne une à deux minutes plus tard sur
   `https://demos.bornzstudio.com/<slug>/` (suivi dans l'onglet **Actions** → « Publier les démos »).

Les consignes détaillées sont dans `CLAUDE.md`.

## Réglage de GitHub Pages (une seule fois)

1. **Settings → Pages** : **Source : GitHub Actions**.
2. Même page : **Custom domain** : `demos.bornzstudio.com` → **Save**, puis cocher **Enforce HTTPS** quand GitHub
   le propose (le certificat arrive en quelques minutes).
3. DNS de `bornzstudio.com` : un enregistrement `CNAME` nommé `demos` vers `youcef4000.github.io`, sans proxy
   (déjà en place).

Le dépôt doit rester **public** : avec le plan GitHub gratuit, un dépôt privé ne peut pas être publié.

## Discount Horeca — nouvelle boutique (`sites/discount-horeca/`)

Proposition de refonte de https://www.discounthoreca.be (HF Concept SRL, showroom à Sint-Pieters-Leeuw), sur le thème de
la démo grossiste CHR : 9 univers (dont « Friterie & snack ») et 60 catégories avec photos, prix **HTVA et TVAC**,
promotions et économie, bonnes affaires et modèles d’exposition, packs d’ouverture et simulateur de budget, commande
**sans compte** ou avec un compte pro (numéro d’entreprise BCE contrôlé, TVA calculée), comptes revendeurs validés avec
remise, livraison en Belgique gratuite dès 1 200 € HTVA, retrait au showroom, installation sur devis, paiement
Bancontact / Payconiq / carte / virement / acompte de 30 % (simulés), devis PDF, suivi de commande, bouton WhatsApp.
Espace admin (`/discount-horeca/admin/`) : produits, promotions, catégories, commandes, clients, devis, réglages.
**Version Premium** : boutique en français, néerlandais et anglais (`#/nl/…`, `#/en/…`, hreflang), facture Peppol
(fichier UBL 2.1 / Peppol BIS Billing 3.0, envoi simulé), fournisseurs (règles et synchronisation simulée des prix et
stocks, journal), « SEO et langues » (contrôles calculés sur le catalogue, mots-clés cibles, plan de trois mois) et
traductions relues fiche par fiche dans l’éditeur de produit.
Analyse du site actuel : `/discount-horeca/analyse-seo.html`. Lien privé : https://demos.bornzstudio.com/discount-horeca/

- **Réel** (relevé public du 21/11/2026, 1 355 produits, 214 catégories) : 325 produits de la démo avec noms (casse et
  fautes corrigées), références, marques, prix HTVA, prix avant promotion, stocks, descriptions, caractéristiques et
  photos ; coordonnées, horaires et conditions de vente (franco, acompte, garantie) publiés sur le site.
- **Exemples** : clients, commandes, devis, 6 modèles d’exposition (`-EXPO`), remise revendeur (10 %), frais de
  livraison sous le franco (65 € HTVA). Photos d’ambiance : illustrations générées, à remplacer par le showroom.
- Textes éditoriaux et SEO : `sites/discount-horeca/js/univers.js`. Logo redessiné (texte vectorisé) : `img/logo.svg`.
- Rafraîchir le catalogue : `python3 tools/discount-horeca/scrape.py /tmp/dh` puis
  `python3 tools/discount-horeca/generer.py /tmp/dh sites/discount-horeca`.
- Langues : textes d’interface dans `tools/discount-horeca/textes_ui.py` (clés : `cles_ui.json`), gammes, catégories et
  FAQ dans `textes_contenu.py`, puis `python3 tools/discount-horeca/i18n_ui.py` écrit `js/i18n-nl.js` et `js/i18n-en.js`.
  Fiches produits : `traduire.py` (traduction automatique locale, noms traduits à la main dans `noms_traduits.py`)
  écrit `js/catalogue-nl.js` et `js/catalogue-en.js` ; la boutique signale ces fiches tant qu’elles ne sont pas relues.

## Stockinox — plateforme de vente en gros (`sites/grossiste-chr/`)

Site B2B d’un grossiste en matériel CHR qui vend **aux revendeurs** (grossistes, magasins,
e-commerçants, cuisinistes, export), dans le style de FourniResto : univers avec pastille, compteurs et photo
d'ambiance, sous-catégories numérotées avec image, catalogue, fiches, barre d'onglets mobile, animations au défilement.
Prix revendeur réservés aux comptes validés ; prix public conseillé (PPC) et marge sur chaque fiche ; colisage par lot,
prix dégressifs (3 lots, palette), niveaux revendeurs (Silver, Gold, Distributeur), minimum de commande, franco,
livraison directe chez le client final sous étiquette neutre, devis volume / conteneur, commande rapide par référence,
export du catalogue en CSV pour le site du revendeur, suivi de commande. Espace admin (`/grossiste-chr/admin/`) :
produits (PPC, prix revendeur, colisage, palette, arrivage, photos), catégories, commandes et statuts, validation des
revendeurs et niveau, devis, réglages. Analyse SEO : `/grossiste-chr/analyse-seo.html`.
Lien privé : https://demos.bornzstudio.com/grossiste-chr/

Nom « Stockinox », logo, adresse, téléphone et e-mail sont **fictifs** (`img/logo.svg`, réglages dans l’admin) :
la démo ne montre ni le nom ni les coordonnées du client.

- **Réel** (relevé public sur le site du client le 15/11/2026) : 129 produits, références, marques, prix publics HT,
  stocks, délais, fiches et photos.
- **Exemples** : remise revendeur (30 % du PPC), colisage, palettes, arrivages, paliers, niveaux, minimum, franco,
  articles « second choix », revendeurs, commandes et devis (présentés comme tels). Photos d'ambiance des univers :
  illustrations générées par ordinateur, à remplacer par des photos du showroom et de l'entrepôt.
- Tout reste dans le navigateur (localStorage) : l'admin et la boutique ouverts dans le même navigateur se répondent.
  La vraie version demande un serveur (base de données, comptes, paiement, e-mails) et de vraies adresses par page.
- Textes éditoriaux et SEO des univers : `sites/grossiste-chr/js/univers.js`.
- Rafraîchir le catalogue : `python3 tools/grossiste-chr/scrape.py /tmp/mcf` puis
  `python3 tools/grossiste-chr/generer.py /tmp/mcf sites/grossiste-chr`.

## Sarraf — carnet du cambiste (`sites/sarraf/`)

Application installable (PWA) : après chaque appel, un mémo (vocal ou écrit) devient une fiche à vérifier — sommes,
taux, par qui, à qui, bénéfice net, reste à régler — dans plusieurs pays et plusieurs monnaies. Tout reste dans le
téléphone (IndexedDB), sans serveur : un mémo écrit remplit la fiche tout seul, un mémo vocal se réécoute pour la
remplir. Sauvegarde et export Excel depuis **Réglages**. Lien privé : https://demos.bornzstudio.com/sarraf/

## Benna — la cuisine pas à pas (`sites/benna/`)

Application installable (PWA), en français, en arabe et en anglais : 38 recettes d'Algérie et du monde, mode cuisine
pas à pas (minuteurs, lecture à voix haute, commande vocale), portions et mesures ajustables (grammes, verres, cups),
coût par part, liste de courses envoyée sur WhatsApp, frigo, « Ce soir on mange quoi ? », SOS cuisine, gestes en
boucle, parcours, carnet d'essais. Abonnés : planificateur (semaine, Ramadan) et atelier Pro (prix de revient, devis,
commandes). Tout reste dans le téléphone, sans serveur. Lien privé : https://demos.bornzstudio.com/benna/

- Réglages (prix des offres, numéro WhatsApp, date du Ramadan, clé publique) : `sites/benna/js/config.js`.
- Liens d'activation des abonnements : `sites/benna/admin.html`, avec la clé privée, qui n'est **pas** dans le dépôt.
- Ajouter une recette : un objet dans `sites/benna/js/data/recettes-*.js`, sa photo dans `img/r/<id>.webp`.
- Vérifier les données et les calculs : `node tools/benna/test.mjs`.
- Photos des plats et boucles de gestes : illustrations générées par ordinateur, à remplacer par des prises de vue.

## Cabinet d'expertise comptable (`sites/cabinet-expert-comptable/`, `projets/cabinet-expert-comptable/`)

Site public, application associé / collaborateur / client et agents IA (lecture des pièces, imputation SCF) pour un
cabinet algérien : pièces déposées en photo, écritures validées puis exportées vers PC Compta, G50 prête à saisir,
résultat du mois, échéancier, relances validées avant envoi. Démo (données fictives, tout dans le navigateur) :
https://demos.bornzstudio.com/cabinet-expert-comptable/ — version réelle (serveur Node, SQLite) et documents (mémos
transcrits, besoins, architecture, abonnements, guide, livraison) dans `projets/cabinet-expert-comptable/`.

## Hooked Academy (`sites/hooked-academy/`, `server/`)

La formation a un vrai serveur (inscriptions, comptes étudiants, contenus modifiés depuis l'espace équipe,
voix off, ressources, FAQ), en ligne sur **https://hooked-academy.tech**, servi par le VPS Hostinger :

- `server/plateforme.js` : le cœur, indépendant de l'hébergeur ;
- `server/index.mjs` + `server/Dockerfile` : Node seul, base SQLite dans le volume `academy-data` du VPS ;
- `server/installer-vps.sh` : installation du VPS en une commande (Docker, Caddy pour le HTTPS, mise à jour
  automatique depuis `main` toutes les 5 minutes). Détails : **DEPLOIEMENT-VPS.md**.

Compte de l'équipe : créé à la première visite de l'espace équipe avec un code d'installation à usage
unique (100 bits). Seule son empreinte SHA-256 est dans `server/plateforme.js` (`SETUP`, ou la variable
`SETUP_HASH` du serveur) ; la remplacer désactive le compte existant (procédure « mot de passe perdu »).

Tester en local : `node server/index.mjs`, puis http://localhost:3000/admin/.

Test A/B des landings : la landing principale (`/`, page « a ») et la landing Formation IA (`/ia/`, page « ia »,
`sites/hooked-academy/ia/`, non indexée). Chaque page envoie `POST api/visit` (une visite par jour, par réseau
et par page) ; les inscriptions de `/ia/` arrivent avec la source « Landing IA ». La vue d'ensemble de l'espace
équipe affiche visiteurs, inscriptions et taux de chaque page depuis le premier jour mesuré. Textes de `/ia/` en
trois langues : `ia/ia-i18n.js`, vérifiés par `node tools/hooked-academy/ia-check.mjs`.
