# Dépôt `demos` — sites de démonstration pour prospects

Chaque démo est un site vitrine statique, montré à un prospect ou publié sur LinkedIn.
Tout est servi par un seul Worker Cloudflare (`demos`) : pousser sur `main` suffit à mettre en ligne.

## Règles de travail

- Travailler directement sur `main` et pousser (`git push origin main`). Pas de branche par démo.
- Une démo = un dossier `sites/<slug>/` avec son `index.html`. Le slug est en minuscules,
  sans accents, avec des tirets : `agence-immo-oran`, `cafe-el-bahdja`.
- Adresse publique : `https://demos.bornzstudio.com/<slug>/` (secours : `https://demos.youcef-ny.workers.dev/<slug>/` ;
  miroir hors Cloudflare : `https://youcef4000.github.io/demos/<slug>/`, publié par `.github/workflows/pages.yml`). Les balises `canonical`, `og:url` et `og:image` utilisent `https://demos.bornzstudio.com/`.
- Chemins **relatifs** uniquement dans une démo (`./style.css`, `img/photo.webp`), jamais `/style.css` :
  la démo vit dans un sous-dossier.
- Aucune dépendance de build : HTML, CSS et JS. Les librairies se chargent depuis
  `cdn.jsdelivr.net` avec une version fixée, ou sont copiées dans le dossier de la démo.
- Ajouter l'entrée de la démo dans `sites/demos.json` :
  `{ "slug", "title", "sector", "city", "color", "public" }`.
  `public: false` garde la démo hors de la galerie d'accueil (lien partagé en privé).
- Pas de faux avis, de faux chiffres ni de faux logos de clients : les contenus d'exemple sont
  présentés comme tels.

## Qualité attendue

- Mobile d'abord : la plupart des visiteurs arrivent depuis LinkedIn, Instagram ou WhatsApp.
- Français par défaut ; arabe (RTL) et anglais si le prospect le demande.
- Balises `<title>`, `description` et Open Graph renseignées : le lien partagé doit afficher un aperçu.
- Respecter `prefers-reduced-motion`.

## Tester en local

```bash
npx wrangler dev
```

puis ouvrir http://localhost:8787/<slug>/.
