# Aide-mémoire — tout ce qu'il faut pour créer, publier et vendre des sites et des apps

> Le résumé de **tout ce dont tu as besoin**, dans l'ordre où tu en as besoin.
> Prix et offres vérifiés en **novembre 2026** : ils changent souvent, vérifie toujours la page « Pricing » avant
> de conseiller un outil à un élève ou à un client.

---

## 0. Ce que tu avais déjà mis en place (retrouvé dans ce dépôt)

Les étapes que tu as faites ces derniers mois, reconstituées à partir de l'historique Git :

| Date | Ce que tu as fait | Où c'est documenté |
|---|---|---|
| 22/10/2026 | Serveur de Hooked Academy (Node + SQLite) sur le **VPS Hostinger**. Essai avec **Coolify**, puis installation en une commande : **Docker** + **Caddy** (HTTPS automatique) + mise à jour automatique toutes les 5 min depuis `main`. | `DEPLOIEMENT-VPS.md`, `server/installer-vps.sh` |
| 22/10/2026 | Hooked Academy installable comme une app (**PWA** : `manifest.webmanifest` + `sw.js`). | `sites/hooked-academy/` |
| 27/10/2026 | **Hooked Lab** sur le même VPS : dépôt **privé** cloné avec une **clé de déploiement** GitHub, clés d'API tapées dans le terminal (jamais dans le dépôt), reprise des données depuis **Cloudflare R2**. | `server/installer-hooked-lab.sh` |
| 27/10/2026 | Démos : Cloudflare → VPS → finalement **GitHub Pages** (dépôt public, gratuit) avec le sous-domaine `demos.bornzstudio.com` (enregistrement DNS `CNAME demos → <ton-compte>.github.io`). | `README.md`, `.github/workflows/pages.yml` |
| Nov. 2026 | Projets clients réels : serveur Node 22 + SQLite + agents Claude (cabinet comptable), moteur de synchro fournisseurs → Shopify (Maxi Gastro), transcription locale Whisper. | `projets/` |
| En continu | Animations : **GSAP 3.15**, **Lenis 1.3** (défilement doux), **Three.js** (3D), chargés depuis `cdn.jsdelivr.net` avec une **version fixée**. | `sites/*/index.html` |
| En continu | Règles de travail données à Claude dans **`CLAUDE.md`** ; skills personnelles (ex. `prompt-architect`). | `CLAUDE.md` |

**Ta règle d'or, à transmettre aux élèves :** démo = statique et gratuite (GitHub Pages) ; vrai projet avec serveur =
VPS ou hébergeur payé **par le client**.

---

## 1. Le parcours d'un projet en 10 étapes

```
 1. Idée / besoin du client
 2. Brief (une page : pour qui, quoi, écrans, données)      → modeles/brief-projet.md
 3. Inspiration + maquette rapide (Figma, ou directement l'IA)
 4. Construction avec l'IA (Claude Code, Lovable, Bolt…)
 5. Sauvegarde sur GitHub (commit + push à chaque étape)
 6. Tests (téléphone réel, Lighthouse, liens, formulaires)
 7. Mise en ligne (GitHub Pages / Vercel / Railway / VPS)
 8. Nom de domaine + HTTPS
 9. Livraison (accès, guide, propriété au nom du client)     → modeles/checklist-livraison.md
10. Maintenance (sauvegardes, mises à jour, surveillance)
```

---

## 2. Les comptes et outils à avoir

### Indispensables

| Outil | À quoi ça sert | Coût |
|---|---|---|
| **GitHub** | Stocker le code, l'historique, publier (Pages), relier les hébergeurs | Gratuit |
| **Claude** (Pro ou Max) | Claude.ai + **Claude Code** (terminal, appli de bureau, web sur claude.ai/code) | Abonnement mensuel |
| **VS Code** (ou Cursor) | Éditeur de code | Gratuit (Cursor : gratuit limité) |
| **Node.js LTS** | Faire tourner JavaScript côté serveur, installer des paquets (`npm`) | Gratuit |
| **Git** | Versionner le code sur ton ordinateur | Gratuit |
| **Chrome** + DevTools | Tester, lire les erreurs (F12 → Console), simuler un téléphone | Gratuit |
| **Supabase** | Base de données + comptes utilisateurs + fichiers | Gratuit (2 projets actifs) |
| **Un hébergeur** | Voir § 3 | Gratuit → quelques $/mois |
| **Un registraire de domaine** | Acheter `tonnom.com` | ~10–15 $/an selon l'extension |

### Selon le projet

| Outil | Quand |
|---|---|
| **Lovable / Bolt / v0 / Replit** | Prototyper vite une app avec interface, sans installer quoi que ce soit (crédits gratuits limités) |
| **Figma** (ou Penpot, open source) | Maquettes, présentation client |
| **Railway / Render** | Héberger un serveur Node/Python, une API, un bot |
| **Cloudflare** | DNS, CDN, Pages, Workers, R2 (stockage) |
| **Resend / Brevo** | E-mails automatiques (confirmation, mot de passe oublié) |
| **Chargily Pay** | Paiement en ligne en Algérie (CIB, Edahabia), mode test disponible |
| **Stripe / Lemon Squeezy / Paddle** | Paiement international (selon le pays de l'entreprise) |
| **Expo** (React Native) | Vraie app mobile iOS/Android |
| **Apple Developer** / **Google Play Console** | Publier sur les stores : 99 $/an (Apple), 25 $ une fois (Google) |

> **Élèves étudiants :** le **GitHub Student Developer Pack** (education.github.com/pack) donne des outils gratuits
> (dont un plan Copilot étudiant). L'offre change : vérifier la page avant de la promettre.
>
> **Payer ses outils depuis l'Algérie :** voir la Formation IA, module IA00 (« Bienvenue et préparatifs »).

---

## 3. Héberger : quel service pour quoi

| Type de projet | Service conseillé | Plan gratuit | Pièges |
|---|---|---|---|
| **Site statique / démo** (HTML, CSS, JS) | **GitHub Pages** | Gratuit (dépôt public), site ≤ 1 Go, fichiers ≤ 100 Mo | Dépôt **public** sur le plan gratuit ; pas d'en-têtes HTTP personnalisés |
| Site statique ou front React | **Cloudflare Pages** | Très généreux | Réglages DNS chez Cloudflare conseillés |
| Front React / Next.js | **Vercel** | Plan Hobby | Hobby = **usage personnel, non commercial** : un site client doit passer en Pro |
| Front + formulaires | **Netlify** | Plan gratuit à crédits mensuels | Un site bloqué si les crédits sont épuisés |
| **Serveur / API** (Node, Python, bot) | **Railway** | Essai : 5 $ une fois (30 jours, sans carte) ; plan Free : 1 $ d'usage/mois, services mis en veille ; Hobby : 5 $/mois (usage inclus) | Facturé à la seconde : **mettre une limite de dépense** |
| Serveur / API | **Render** | Services web gratuits | Veille après ~15 min sans visite (réveil ≈ 1 min) ; Postgres gratuit **supprimé après 30 jours** (+14 jours de grâce) |
| Serveur / API | **Koyeb**, **Fly.io**, **Northflank** | Variable / essai | Fly.io n'a plus d'offre gratuite pour les nouveaux comptes |
| **Base de données + auth** | **Supabase** | 2 projets actifs, 500 Mo de base par projet | Projet gratuit **mis en pause après 7 jours sans activité** ; Pro ≈ 25 $/mois |
| Plusieurs apps, coût fixe | **VPS** (Hostinger, Hetzner…) + **Coolify** ou **Dokploy** | Coolify/Dokploy gratuits, tu paies le VPS (~5–20 $/mois) | Tu gères les mises à jour, la sécurité, les sauvegardes |

**Arbre de décision rapide :**

```
Le projet a-t-il besoin d'un serveur ou d'une base de données ?
├── Non  → GitHub Pages (démo) / Cloudflare Pages ou Netlify (client)
└── Oui
    ├── Juste des données + comptes utilisateurs → front statique + Supabase
    ├── Un serveur Node/Python simple            → Railway ou Render
    └── Plusieurs apps, trafic régulier          → VPS + Docker (+ Coolify)
```

---

## 4. Git et GitHub — l'essentiel

### Relier un projet à GitHub (première fois)

```bash
git init
git add .
git commit -m "Premier commit"
git branch -M main
git remote add origin https://github.com/<compte>/<projet>.git
git push -u origin main
```

Ensuite, à chaque étape : `git add .` → `git commit -m "Ce que j'ai fait"` → `git push`.
Se connecter sans mot de passe : `gh auth login` (GitHub CLI) ou une clé SSH.

### Les mots à connaître

| Mot | Sens |
|---|---|
| **Repository (dépôt)** | Le dossier du projet + tout son historique |
| **Commit** | Une sauvegarde nommée (comme un point de sauvegarde dans un jeu) |
| **Push / Pull** | Envoyer / récupérer les commits vers / depuis GitHub |
| **Branch (branche)** | Une copie de travail parallèle pour tester sans casser `main` |
| **Pull Request (PR)** | Demande de fusion d'une branche, avec relecture |
| **Fork** | Ta copie personnelle du dépôt de quelqu'un d'autre |
| **Template** | Dépôt modèle : bouton « Use this template » pour partir d'une base |
| **Deploy key** | Clé qui donne à **un serveur** l'accès (souvent en lecture) à **un dépôt** privé |
| **Secret (Actions)** | Valeur cachée utilisable par GitHub Actions (Settings → Secrets) |

### Chercher des repositories comme un pro

Dans la barre de recherche de github.com :

```
landing page stars:>500 language:HTML pushed:>2026-01-01
topic:supabase topic:nextjs stars:>1000
"admin dashboard" in:name,description license:mit archived:false
```

| Filtre | Effet |
|---|---|
| `stars:>500` | Projets populaires (donc testés par beaucoup de monde) |
| `pushed:>2026-01-01` | Encore maintenus |
| `language:TypeScript` | Langage principal |
| `topic:landing-page` | Étiquette du projet |
| `license:mit` | Licence permissive (usage commercial autorisé) |
| `in:readme` / `in:name,description` | Où chercher les mots |
| `archived:false` | Exclut les projets abandonnés |

En ligne de commande : `gh search repos "landing page" --language=html --sort=stars --limit 20`.

Ailleurs : **github.com/trending**, **github.com/topics**, les listes **« awesome »** (ex. `awesome-nextjs`),
**ossinsight.io**, **star-history.com** (croissance d'un projet), **grep.app** (chercher du code dans des milliers de
dépôts), **npmtrends.com** (comparer des librairies).

**Avant d'utiliser un dépôt :** dernière mise à jour < 6 mois, issues qui reçoivent des réponses, licence présente
(sans licence = tu n'as **pas** le droit de réutiliser), README clair, pas de code qui télécharge des choses bizarres.

---

## 5. Supabase — l'essentiel

| Brique | Ce que ça fait |
|---|---|
| **Database** | Une vraie base PostgreSQL, éditable comme un tableur (Table Editor) |
| **Auth** | Comptes : e-mail + mot de passe, lien magique, Google… |
| **Storage** | Fichiers et images (buckets publics ou privés) |
| **Realtime** | Mises à jour en direct (chat, tableau de bord) |
| **Edge Functions** | Petit code serveur (webhooks de paiement, appels d'API avec clé secrète) |

**Les 2 clés à ne jamais confondre :**

| Clé | Où | Risque |
|---|---|---|
| **Publishable** (`sb_publishable_…`, ancienne « anon ») | Dans le navigateur, l'app | Aucun **si la RLS est activée** sur chaque table |
| **Secret** (`sb_secret_…`, ancienne « service_role ») | Serveur / Edge Function **uniquement** | Accès total à la base : jamais dans le front, jamais sur GitHub |

**Règle n°1 : RLS (Row Level Security) activée sur toutes les tables**, avec des règles du type
« un utilisateur ne voit que ses lignes » (`auth.uid() = user_id`). Sans RLS, n'importe qui peut lire ta base avec la clé
publique.

Relier Supabase à Claude Code (serveur MCP officiel, connexion par navigateur avec `/mcp`) :

```bash
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
```

---

## 6. Claude — mémoire, skills, plugins, MCP

### Installer Claude Code

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows (PowerShell) : `irm https://claude.ai/install.ps1 | iex` — puis `claude --version`. Aussi disponible dans
l'application de bureau Claude et sur **claude.ai/code** (dans le navigateur, relié à GitHub).

### Les réflexes

| Commande / fichier | Rôle |
|---|---|
| `claude` | Lancer Claude Code dans le dossier du projet |
| `/init` | Crée **`CLAUDE.md`** : la mémoire du projet (règles, commandes, structure) |
| **Shift + Tab** | Change de mode (dont le **mode plan** : Claude propose un plan avant de toucher aux fichiers) |
| `/clear` | Repartir d'une conversation vide (nouvelle tâche) |
| `/compact` | Résumer la conversation quand elle devient longue |
| **Échap × 2** | Revenir en arrière (annuler les dernières modifications) |
| `/mcp` | Voir et connecter les serveurs MCP |
| `/plugin` | Parcourir, installer, désactiver des plugins |
| `/skills` | Voir les skills disponibles |
| `claude -p "…"` | Lancer une tâche sans interface (scripts, automatisations) |

### Skills — apprendre une méthode à Claude

Un skill = un dossier avec un fichier **`SKILL.md`** (des instructions + éventuellement des scripts et modèles).
Claude le charge **tout seul** quand la `description` correspond à la demande, ou tu l'appelles avec `/nom-du-skill`.

| Portée | Dossier |
|---|---|
| Personnel (tous tes projets) | `~/.claude/skills/<nom>/SKILL.md` |
| Projet (toute l'équipe, versionné) | `.claude/skills/<nom>/SKILL.md` |
| Dans un plugin | `<plugin>/skills/<nom>/SKILL.md` → appelé `/<plugin>:<nom>` |

```markdown
---
name: nouvelle-demo
description: Crée une démo de site pour un prospect dans sites/<slug>/. À utiliser quand on demande une démo, une maquette en ligne ou un site exemple pour un client.
---

# Instructions
1. ...
```

- **Dans claude.ai** : Paramètres → Capacités → activer « Exécution de code / création de fichiers », puis
  **Customize → Skills** → `+` → **Upload a skill** (le dossier compressé en **ZIP**).
- Les skills activés dans claude.ai se retrouvent aussi dans Claude Code avec le même compte (`/skills`).
- Garder `SKILL.md` sous ~500 lignes ; mettre les longues références dans des fichiers à côté.
- Exemple complet : `modeles/skills/nouvelle-demo/SKILL.md`. Skills officiels : dépôt **anthropics/skills**.

### Plugins — des paquets prêts à installer

Un plugin regroupe **skills, agents, hooks et serveurs MCP**. Le marketplace officiel **`claude-plugins-official`**
est ajouté automatiquement.

```
/plugin                                          → parcourir (onglet Discover)
/plugin install <plugin>@claude-plugins-official → installer (choisir la portée : user / project / local)
/plugin marketplace add <compte>/<depot>         → ajouter un autre marketplace (GitHub, URL, dossier)
/reload-plugins                                  → appliquer les changements
```

En terminal : `claude plugin list`, `claude plugin disable <plugin>@<marketplace>`, `claude plugin uninstall …`.

> **Sécurité :** un plugin peut exécuter du code sur ta machine (hooks, serveurs MCP). Lire le panneau de détails avant
> d'installer, comme pour n'importe quel logiciel.

### MCP — brancher Claude sur tes outils

MCP = une prise universelle entre Claude et un service (Supabase, GitHub, Figma, Notion, un navigateur…).

```bash
claude mcp add --transport http <nom> <url>             # serveur distant
claude mcp add <nom> -- npx -y <paquet-du-serveur>      # serveur local
claude mcp add --scope project ...                      # partagé avec l'équipe via .mcp.json
claude mcp list                                         # vérifier (✔ Connected)
```

Dans claude.ai : **Connecteurs** (annuaire sur claude.ai/directory).

---

## 7. Proposer des démos sans perdre d'argent

**Le système à 0 €/mois (le tien) :**

1. **Un seul dépôt public** `demos` + **GitHub Pages** (Settings → Pages → Source : GitHub Actions).
2. **Un seul domaine** acheté une fois, et un **sous-domaine** `demos.tondomaine.com` (DNS : `CNAME demos → <compte>.github.io`).
3. **Un dossier par démo** : `sites/<slug>/` → `https://demos.tondomaine.com/<slug>/`.
4. **Démos 100 % navigateur** : fausses données **présentées comme des exemples**, paiements **simulés**, espace admin
   qui enregistre dans le navigateur (`localStorage`). Aucun serveur, aucune facture.
5. **Lien privé** (`public: false` dans `demos.json`) pour un prospect, ou galerie publique pour LinkedIn.

**Combien coûte vraiment un projet :**

| Poste | Pour une démo | Pour un client signé |
|---|---|---|
| Hébergement | 0 € (GitHub Pages) | Payé par le client (compte à **son** nom) |
| Domaine | Ton domaine existant | Acheté **au nom du client** |
| Base de données | Aucune (données dans la page) | Supabase gratuit → Pro quand ça grandit |
| Serveur | Aucun | Railway / Render / VPS, refacturé |
| Ton temps | Le vrai coût : réutiliser des modèles et des skills | Inclus dans le devis |

**Les garde-fous :** limite de dépense (« usage limit ») sur Railway, plafond de dépense sur Supabase, alertes de
facturation partout, une seule carte dédiée aux outils, et supprimer les projets de test chaque mois.

---

## 8. Motion design pour le web

| Besoin | Outil |
|---|---|
| Petites animations (survol, apparition) | **CSS** : `transition`, `@keyframes`, animations au défilement (`animation-timeline: view()`), View Transitions |
| Animations pro au défilement | **GSAP** + **ScrollTrigger** (gratuit, **tous les plugins** inclus) + **Lenis** (défilement doux) |
| Composants React animés | **Motion** (ex-Framer Motion, motion.dev) |
| Animations dessinées légères | **Lottie** (fichiers JSON depuis After Effects, LottieFiles) |
| Animations interactives (boutons, personnages) | **Rive** |
| 3D sans code | **Spline** ; effets WebGL sans code : **Unicorn Studio** |
| 3D en code | **Three.js**, **React Three Fiber** |
| Vidéo générée par du code | **Remotion** (React → MP4 ; licence payante pour les entreprises de plus de 3 personnes), **HyperFrames** (HTML → vidéo) |
| Motion rapide pour réseaux sociaux | **Jitter**, **After Effects** |

**Règles :** 200–500 ms pour une interface ; animer seulement `transform` et `opacity` (fluide sur mobile) ;
une animation = une intention ; toujours respecter `prefers-reduced-motion`.

---

## 9. Les choses qu'on oublie (check-list)

**Avant de coder**
- [ ] Brief écrit et validé par le client (pour qui, quoi, écrans, données, délais)
- [ ] Domaine : vérifier qu'il est libre **et** que les comptes Instagram / TikTok du même nom existent
- [ ] Contenus du client (logo, textes, photos) demandés **dès le début**

**Pendant**
- [ ] `.gitignore` avec `.env` et `node_modules/` **avant** le premier commit
- [ ] Clés d'API dans `.env` (local) et dans les **variables d'environnement** de l'hébergeur, jamais dans le code
- [ ] Versions de librairies **fixées** (`gsap@3.15.0`, pas `gsap@latest`)
- [ ] Chemins **relatifs** si le site vit dans un sous-dossier
- [ ] Commit à chaque étape qui marche (pour pouvoir revenir en arrière)

**Avant de publier**
- [ ] Test sur un **vrai téléphone** (pas seulement l'émulateur)
- [ ] `<title>`, `description`, **Open Graph** (image 1200×630) → aperçu correct sur WhatsApp, LinkedIn, Instagram
      (tester avec opengraph.xyz et LinkedIn Post Inspector)
- [ ] Favicon + icône d'app (`apple-touch-icon`)
- [ ] Images en **WebP** compressées (Squoosh), `loading="lazy"`, texte `alt`
- [ ] **Lighthouse / PageSpeed Insights** ≥ 90 sur mobile
- [ ] Liens WhatsApp au format `https://wa.me/213XXXXXXXXX` (indicatif, sans le 0)
- [ ] Formulaires testés (on reçoit vraiment le message ?)
- [ ] `prefers-reduced-motion` respecté
- [ ] Politique de sécurité dans la page (`<meta http-equiv="Content-Security-Policy">`) sur GitHub Pages
- [ ] Supabase : **RLS activée** sur chaque table, clé secrète absente du front

**Après**
- [ ] HTTPS actif (cadenas)
- [ ] **Google Search Console** + sitemap envoyé
- [ ] Statistiques : Plausible, Umami ou Microsoft Clarity (gratuit, cartes de chaleur)
- [ ] Surveillance : UptimeRobot (alerte si le site tombe)
- [ ] **Sauvegardes** de la base (Supabase Pro, export régulier, ou instantané du VPS)
- [ ] **2FA** activée sur GitHub, l'hébergeur, le registraire de domaine, Supabase
- [ ] Pages légales : mentions légales, politique de confidentialité (RGPD pour l'Europe ; loi algérienne 18-07 sur les
      données personnelles)
- [ ] Domaine et comptes **au nom du client**, renouvellement automatique activé
- [ ] Guide d'utilisation remis + offre de maintenance mensuelle proposée

---

## 10. Commandes à garder sous la main

```bash
# Tester un site statique en local
python3 -m http.server 8000            # puis http://localhost:8000

# Projet JavaScript moderne
npm create vite@latest mon-app         # React, Vue, vanilla…
npm install                            # installer les dépendances
npm run dev                            # serveur de développement
npm run build                          # version de production

# Git
git status                             # qu'est-ce qui a changé ?
git log --oneline -10                  # les 10 derniers commits
git checkout -b essai                  # nouvelle branche
git restore <fichier>                  # annuler les modifs non commitées d'un fichier

# GitHub CLI
gh auth login
gh repo create mon-projet --public --source=. --push
gh search repos "portfolio" --sort=stars --limit 10

# Claude Code
claude                                 # démarrer
claude mcp list                        # serveurs MCP
claude plugin list                     # plugins installés
```
