# Formation Sites & Apps — intégrée à Hooked Academy

**Créer, sécuriser, publier et vendre des sites et des applications en dirigeant l'IA (vibe coding), sans écrire de code.**
Troisième formation de Hooked Academy (identifiant `dev`, modules D00 à D15), à côté de la Créative et de l'IA.
Pour les débutants complets. **100 % vibe coding** (refonte du 24/11/2026) : l'élève ne tape aucune commande et
n'ouvre aucun éditeur de code ; il dirige Claude Code (application Claude, onglet Code) ou Codex par des demandes
en français, et son agent installe lui-même ce qui manque (Git, etc.). Plus de VS Code, Node, terminal, Docker/VPS,
TypeScript ni Zod : les scènes « terminal » et « code » sont devenues des scènes « prompt » (la demande et la réponse
de l'agent), seuls restent des fichiers écrits en français (spec, CLAUDE.md, SKILL.md).

| | |
|---|---|
| Contenu | 16 modules · 89 leçons (86 animées + 3 vidéos de présentation à tourner) · 425 scènes animées · 13 leçons pratiques · 91 prompts d'atelier |
| Durée | ≈ 1 h 40 de vidéo animée (estimée d'après le prompteur ; elle suivra ta voix off) |
| Prix | **30 000 DA** seule ; **pack complet (3 formations) 50 000 DA** (modifiable dans Réglages) |
| Style | Thème « code » propre à cette formation : menthe, grille de plan d'architecte, fenêtre de l'agent, navigateur |
| Voix off | **Aucune voix générée** : texte « à dire » de chaque scène pour le prompteur du Studio voix off |

## Où sont les fichiers

| Fichier | Rôle |
|---|---|
| `sites/hooked-academy/data/programme-dev.js` (+ `-1`, `-2`, `-3`) | Les leçons : scènes, prompteur, l'essentiel, quiz, exercices, prompts |
| `sites/hooked-academy/motion/scenes-dev.js` et `dev.css` | Les 7 nouveaux types de scènes (terminal, code, browser, tree, diff, gitgraph, alert) et le thème |
| `sites/hooked-academy/assets/img/couv-dev.webp` | Couverture (générée avec Higgsfield, 1,5 crédit pour 2 variantes) |
| `sites/hooked-academy/assets/img/dev/` | Captures réelles du site exemple (ordinateur et mobile) |
| `sites/hooked-academy/assets/img/lecons/dv*.webp` | Image de chaque leçon (Higgsfield, Nano Banana Pro ; prompts dans `tools/hooked-academy/images-lecons-prompts.json`) |
| `sites/hooked-academy/data/videos-ecran.js` | Les 3 vidéos de présentation de D00 (places réservées : `video` vide → « Vidéo bientôt disponible ») |
| `sites/hooked-academy/ressources/dv*/` | Fiche PDF de chaque leçon, liens officiels, fichiers d'exemple (site, API, tests, skill) |
| `formations/sites-et-apps/programme-plateforme.md` | Le programme réel, leçon par leçon, avec les durées |
| `formations/sites-et-apps/tournages.md` | Les écrans à filmer toi-même : les 3 vidéos de présentation, puis les pratiques avec tes comptes |
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

1. **Les 3 vidéos de présentation** (D00, `dv0-l5` à `dv0-l7`) : à tourner, puis remplir `video` et `d` dans
   `data/videos-ecran.js` (voir `tournages.md`). Ce sont les seules vidéos ouvertes au compte démo.
2. **Voix off** : Admin → Studio voix off → chaque leçon D00 à D15 (le texte s'affiche scène par scène).
3. **Tournages** : les écrans de `tournages.md` (visites D03 et pratiques avec tes comptes), en session locale.
4. **Relire** les leçons et ajuster le ton ; les modifications se font aussi depuis l'espace équipe.
5. **Traductions** anglaise et arabe des leçons (`data/i18n/en|ar/dv*.js`) : l'interface et la page d'accueil sont déjà
   traduites ; le contenu des leçons est en français pour l'instant.
6. **Prix** : 30 000 DA et le pack complet à 50 000 DA (novembre 2026, Réglages), décider si les anciens élèves « both » reçoivent
   la formation en cadeau (Admin → Étudiants → cocher la formation).

## Les pratiques réelles (faites dans le cloud le 23/11/2026)

> Depuis la refonte vibe coding, ces sessions ne sont plus montrées comme des commandes : l'élève voit la demande faite à
> l'agent et sa réponse. Elles restent la preuve que chaque pratique marche de bout en bout.


Site exemple « Salon Amina (exemple) » construit et mesuré (**Lighthouse mobile 100 / 100 / 100 / 100**), dépôt Git créé,
branche, fusion et `git revert`, `.env` ignoré vérifié, mini API Node testée avec `curl`, `npm create vite` (Vite 8),
`npm audit` sur une faille réelle (lodash), tests **Vitest** verts puis un test qui attrape un vrai bug de remise.
Toutes ces sorties sont reprises telles quelles dans les scènes « Session réelle ».
