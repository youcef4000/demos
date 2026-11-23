# Formation Sites & Apps — brouillon pour Hooked Academy

**Créer, publier et vendre des sites web et des applications avec l'IA.** Pour les débutants complets, avec une partie
« 🔥 Niveau avancé » dans chaque leçon pour ceux qui ont des bases.

> Ce dossier n'est **pas publié** (GitHub Pages ne publie que `sites/`, le VPS ne sert que `sites/hooked-academy/`).
> Attention : le dépôt est public, le texte reste lisible sur GitHub.

## Contenu

| Fichier | Pour qui | Contenu |
|---|---|---|
| [`01-aide-memoire.md`](01-aide-memoire.md) | Toi (et les élèves en fiche PDF) | Tout ce qu'il faut, en résumé : ce que tu avais mis en place, le parcours en 10 étapes, comptes, hébergeurs comparés, Git/GitHub, Supabase, Claude (skills, plugins, MCP), démos à 0 €, motion design, check-list des oublis, commandes |
| [`02-programme.md`](02-programme.md) | La formation | 3 parties, 13 modules (D00 à D12), 66 leçons : objectif, à retenir, exercice, quiz, niveau avancé ; projet final et certificat ; correspondance avec le format de la plateforme |
| [`03-ressources.md`](03-ressources.md) | Les élèves | Les sites à connaître, classés par besoin (apprendre, IA, design, composants, motion, hébergement, GitHub, Claude, paiement, tests) |
| [`modeles/`](modeles/) | Les élèves (à télécharger) | `CLAUDE-modele.md`, `brief-projet.md`, `checklist-livraison.md`, `gitignore.txt`, `env.example.txt`, un skill complet `skills/nouvelle-demo/SKILL.md` |

## Le programme en un coup d'œil

| Partie | Module | Sujet |
|---|---|---|
| **1. Les bases** | D00 | Bienvenue, comptes, installation du poste, organisation |
| | D01 | Comment marche le web : domaine, DNS, front/back, statique vs app, HTML/CSS/JS, frameworks |
| | D02 | Coder avec l'IA : outils, méthode, prompts de build, Claude Code, débogage |
| | D03 | Premier site vitrine : structure, design, images, SEO et Open Graph, qualité |
| | D04 | Git & GitHub : commits, dépôt, branches et PR, secrets, chercher des repositories |
| **2. Construire et publier** | D05 | Hébergeurs : GitHub Pages, Vercel/Netlify/Cloudflare, Railway/Render, domaine et DNS, VPS |
| | D06 | Supabase : tables, connexion, Auth, RLS, Storage, Edge Functions, MCP |
| | D07 | Vraie app : fiche produit, générateurs, Claude Code, paiements (Chargily, Stripe), e-mails, PWA et mobile |
| | D08 | Motion design : principes, CSS, GSAP + Lenis, Lottie/Rive/Spline/Three.js, vidéo par le code, inspiration |
| **3. Passer pro** | D09 | Booster Claude : CLAUDE.md, skills, plugins, MCP, workflows avancés |
| | D10 | Démos sans perdre d'argent : stratégie, système à 0 €, démo « app » sans serveur, budget, vente |
| | D11 | Livrer pro : sécurité, tests, performance et SEO, légal, maintenance |
| | D12 | Projet final (vitrine + app + démo présentée) et portfolio |

## L'ajouter plus tard sur Hooked Academy

Les étapes sont dans l'annexe de [`02-programme.md`](02-programme.md#annexe--correspondance-avec-le-format-hooked-academy) :
fichier `data/programme-dev.js` (même structure que la Formation IA), entrée dans `TRACKS` et `PARTS`, scènes animées
avec voix off en darija, offres, traductions, images, puis test avec `node server/index.mjs` avant de pousser sur `main`.

## À revoir régulièrement

Les prix et offres gratuites (Railway, Render, Vercel, Netlify, Supabase, GitHub Student Pack) et les commandes de
Claude Code changent vite. Vérifiés en **novembre 2026** ; à revérifier avant chaque session de formation.
