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
