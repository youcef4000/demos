# Dépôt privé `demos` — Hooked Academy et démos retirées

**Les démos pour prospects ne sont plus ici** : elles vivent dans le dépôt public `youcef4000/bornz-demos`,
publié par GitHub Pages sur `https://demos.bornzstudio.com/<slug>/` (consignes dans son `CLAUDE.md`).
Une nouvelle démo, une correction de démo ou Sarraf (le carnet du cambiste) : travailler dans `bornz-demos`.

Ce dépôt reste privé et garde :

- **Hooked Academy** : le site (`sites/hooked-academy/`), son serveur (`server/index.mjs`, `server/plateforme.js`)
  et ses outils (`tools/hooked-academy/`, workflows des vidéos et des ressources). En ligne sur
  https://hooked-academy.tech, servi par le VPS Hostinger (voir `DEPLOIEMENT-VPS.md`) ;
- l'installation du VPS (`server/installer-vps.sh`, `server/installer-hooked-lab.sh`) ;
- les démos retirées (`hors-ligne/`), publiées nulle part.

## Règles de travail

- Travailler directement sur `main` et pousser (`git push origin main`) : le VPS récupère `main` toutes les
  5 minutes et reconstruit Hooked Academy.
- Une erreur dans `server/` met Hooked Academy hors ligne : tester avec `node server/index.mjs` avant de pousser.
- Chemins **relatifs** dans le site (`./style.css`, `img/photo.webp`), jamais `/style.css`.
- Aucune dépendance de build : HTML, CSS et JS. Les librairies se chargent depuis
  `cdn.jsdelivr.net` avec une version fixée, ou sont copiées dans le dossier du site.
- Jamais de clé, de mot de passe ou de secret dans le dépôt : ils se tapent dans le terminal du VPS.
- Pas de faux avis, de faux chiffres ni de faux logos de clients : les contenus d'exemple sont
  présentés comme tels.

## Qualité attendue

- Mobile d'abord.
- Français par défaut ; arabe (RTL) et anglais quand le site les propose.
- Balises `<title>`, `description` et Open Graph renseignées.
- Respecter `prefers-reduced-motion`.

## Tester en local

```bash
node server/index.mjs
```

puis ouvrir http://localhost:3000/ (espace équipe : http://localhost:3000/admin/).
