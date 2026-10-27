# Dépôt `demos` — sites de démonstration pour prospects

Chaque démo est un site vitrine statique, montré à un prospect (souvent avant qu'il achète son nom de domaine)
ou publié sur LinkedIn. Les démos sont publiées par **GitHub Pages** : pousser sur `main` suffit à mettre en ligne
(1 à 2 minutes, workflow `.github/workflows/pages.yml`). Aucun serveur, aucun autre hébergeur pour les démos.

> **Dépôt public** : tout ce qui est ici est visible par tous. Jamais de clé d'API, de mot de passe, de données
> de clients réels dans le dépôt.

## Règles de travail

- Travailler directement sur `main` et pousser (`git push origin main`). Pas de branche par démo.
- Une démo = un dossier `sites/<slug>/` avec son `index.html`. Le slug est en minuscules,
  sans accents, avec des tirets : `agence-immo-oran`, `cafe-el-bahdja`.
- Adresse publique : `https://demos.bornzstudio.com/<slug>/`. Les balises `canonical`, `og:url` et `og:image` utilisent
  `https://demos.bornzstudio.com/`.
- Chemins **relatifs** uniquement dans une démo (`./style.css`, `img/photo.webp`), jamais `/style.css` :
  la démo vit dans un sous-dossier.
- Démos 100 % statiques : pas de code serveur, pas de clé secrète dans le navigateur. GitHub Pages n'envoie pas
  d'en-têtes personnalisés : une politique de sécurité se met dans la page (`<meta http-equiv="Content-Security-Policy">`).
- Fichiers de moins de 100 Mo (limite de GitHub) ; site publié sous 1 Go.
- Aucune dépendance de build : HTML, CSS et JS. Les librairies se chargent depuis
  `cdn.jsdelivr.net` avec une version fixée, ou sont copiées dans le dossier de la démo.
- Ajouter l'entrée de la démo dans `sites/demos.json` :
  `{ "slug", "title", "sector", "city", "color", "public" }`.
  `public: false` garde la démo hors de la galerie d'accueil (lien partagé en privé).
- Pas de faux avis, de faux chiffres ni de faux logos de clients : les contenus d'exemple sont
  présentés comme tels.
- `sites/404.html` : page des liens cassés ; elle renvoie aussi les anciens liens `/hooked-academy/…` vers
  https://hooked-academy.tech.
- Démos retirées : dans `hors-ligne/` (jamais publié).

## Hooked Academy (à part)

`sites/hooked-academy/` n'est pas publié par GitHub Pages : la formation a son propre site, https://hooked-academy.tech,
servi par le VPS Hostinger avec son serveur (`server/index.mjs`, `server/plateforme.js`, voir README et
DEPLOIEMENT-VPS.md). Le VPS récupère `main` toutes les 5 minutes. Une erreur dans `server/` met Hooked Academy
hors ligne : tester avec `node server/index.mjs` avant de pousser.

## Qualité attendue

- Mobile d'abord : la plupart des visiteurs arrivent depuis LinkedIn, Instagram ou WhatsApp.
- Français par défaut ; arabe (RTL) et anglais si le prospect le demande.
- Balises `<title>`, `description` et Open Graph renseignées : le lien partagé doit afficher un aperçu.
- Respecter `prefers-reduced-motion`.

## Tester en local

```bash
python3 -m http.server 8000 -d sites
```

puis ouvrir http://localhost:8000/<slug>/ (Hooked Academy : `node server/index.mjs`, puis http://localhost:3000/).
