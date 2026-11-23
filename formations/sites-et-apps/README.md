# Formation Sites & Apps — intégrée à Hooked Academy

**Créer, sécuriser, publier et vendre des sites et des applications avec l'IA (vibe coding).**
Troisième formation de Hooked Academy (identifiant `dev`, modules D00 à D15), à côté de la Créative et de l'IA.
Pour les débutants complets, avec des encadrés « niveau avancé » dans chaque leçon.

| | |
|---|---|
| Contenu | 16 modules · 88 leçons · 432 scènes animées · 13 leçons pratiques · 92 prompts d'atelier |
| Durée | ≈ 1 h 40 de vidéo animée (estimée d'après le prompteur ; elle suivra ta voix off) |
| Prix | **30 000 DA** seule ; **pack complet (3 formations) 50 000 DA** (modifiable dans Réglages) |
| Style | Thème « code » propre à cette formation : menthe, grille de plan d'architecte, terminal, éditeur, navigateur |
| Voix off | **Aucune voix générée** : texte « à dire » de chaque scène pour le prompteur du Studio voix off |

## Où sont les fichiers

| Fichier | Rôle |
|---|---|
| `sites/hooked-academy/data/programme-dev.js` (+ `-1`, `-2`, `-3`) | Les leçons : scènes, prompteur, l'essentiel, quiz, exercices, prompts |
| `sites/hooked-academy/motion/scenes-dev.js` et `dev.css` | Les 7 nouveaux types de scènes (terminal, code, browser, tree, diff, gitgraph, alert) et le thème |
| `sites/hooked-academy/assets/img/couv-dev.webp` | Couverture (générée avec Higgsfield, 1,5 crédit pour 2 variantes) |
| `sites/hooked-academy/assets/img/dev/` | Captures réelles du site exemple (ordinateur et mobile) |
| `sites/hooked-academy/video/vignettes/dv*.jpg` | Miniatures des 88 leçons (tirées des animations) |
| `sites/hooked-academy/ressources/dv*/` | Fiche PDF de chaque leçon, liens officiels, fichiers d'exemple (site, API, tests, skill) |
| `formations/sites-et-apps/programme-plateforme.md` | Le programme réel, leçon par leçon, avec les durées |
| `formations/sites-et-apps/tournages.md` | Les écrans à filmer toi-même (comptes GitHub, Supabase, Railway, claude.ai) |
| `formations/sites-et-apps/recherches.md` | Les recherches (novembre 2026), la sélection des meilleurs dépôts et sites, les sources |
| `formations/sites-et-apps/01-aide-memoire.md`, `03-ressources.md`, `modeles/` | Aide-mémoire, ressources, modèles à donner aux élèves |
| `formations/sites-et-apps/02-programme.md` | Premier brouillon (remplacé par les données de la plateforme) |

## Ce qui a changé sur la plateforme

- **Serveur** (`server/plateforme.js`, `server/index.mjs`) : formation `dev`, leçons `dv…`, packs `dev` et `all` ;
  le pack `both` reste Créative + IA (les anciens élèves ne reçoivent pas la nouvelle formation automatiquement).
- **Page d'accueil** : panneau « Formation 03 · Sites & Apps », billet « une formation au choix » (30 000 DA pour Sites & Apps) et pack complet, deux choix de
  plus dans le formulaire, textes en français, anglais et arabe.
- **Espace étudiant** : troisième formation (menthe), badge « Pratique », miniatures, carte de fin de formation.
- **Espace équipe** : choix des nouveaux packs, prix dans Réglages, la formation dans le programme et le studio voix off.
- **Outils** : `fiches-lecons.mjs` (TRACK=dev), `pdf-ressource.mjs`, `ressources.mjs` connaissent la formation.

## Reste à faire (toi)

1. **Voix off** : Admin → Studio voix off → chaque leçon D00 à D15 (le texte s'affiche scène par scène).
2. **Tournages** : les écrans de `tournages.md` (visites D03 et pratiques avec tes comptes), en session locale.
3. **Relire** les leçons et ajuster le ton ; les modifications se font aussi depuis l'espace équipe.
4. **Traductions** anglaise et arabe des leçons (`data/i18n/en|ar/dv*.js`) : l'interface et la page d'accueil sont déjà
   traduites ; le contenu des leçons est en français pour l'instant.
5. **Prix** : 30 000 DA et le pack complet à 50 000 DA (novembre 2026, Réglages), décider si les anciens élèves « both » reçoivent
   la formation en cadeau (Admin → Étudiants → cocher la formation).

## Les pratiques réelles (faites dans le cloud le 23/11/2026)

Site exemple « Salon Amina (exemple) » construit et mesuré (**Lighthouse mobile 100 / 100 / 100 / 100**), dépôt Git créé,
branche, fusion et `git revert`, `.env` ignoré vérifié, mini API Node testée avec `curl`, `npm create vite` (Vite 8),
`npm audit` sur une faille réelle (lodash), tests **Vitest** verts puis un test qui attrape un vrai bug de remise.
Toutes ces sorties sont reprises telles quelles dans les scènes « Session réelle ».
