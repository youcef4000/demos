# Scripts de tournage — les écrans à filmer par Youcef

> Les leçons de la Formation Sites & Apps ont déjà leur vidéo animée (thème « code ») et leur texte de prompteur.
> Les sorties de terminal des leçons pratiques viennent de **vraies sessions** faites dans le cloud (Git, Vite 8, npm audit,
> Vitest, Lighthouse, serveur Node, curl).
> Ce qui demande **tes comptes** (GitHub, Supabase, Railway, claude.ai, Claude Code connecté) se filme sur ton PC.
> Ce fichier dit quoi filmer, clic par clic. Une vidéo filmée peut **remplacer** l'animation ou **s'ajouter** en ressource.

## Préparer ton poste (une fois)

| Réglage | Valeur |
|---|---|
| Logiciel | **OBS Studio** (gratuit) : scène « Écran » + micro |
| Image | 1920 × 1080, 30 images/s, MP4 |
| Navigateur | Un **profil Chrome dédié** aux tournages : sans favoris personnels, sans extensions, zoom 125 % |
| Comptes | Des **comptes de démo** (GitHub, Supabase, Railway), jamais tes comptes clients |
| Notifications | Windows : « Ne pas déranger » ; WhatsApp Web fermé |
| Dossier de travail | `C:\Users\Youcef\Documents\hooked-pratiques\` (ou `F:\Site vitrine claude code`) |
| Durée | Une prise de **2 à 4 minutes** par leçon ; mieux vaut deux prises courtes qu'une longue |

**Sécurité à l'écran** : ne montre jamais une clé, un mot de passe, une adresse e-mail perso ni un numéro de téléphone.
Les clés vont dans `.env` (jamais ouvert à l'écran). Si une clé apparaît par erreur : **révoque-la** après le tournage.

## Faire la pratique avec Claude Code sur ton PC (session locale)

Dans l'app Claude : **Code** → ouvrir le dossier de travail en **session locale**, puis colle ce prompt au début de chaque
tournage (il garde Claude dans le rythme de la formation) :

```
Tu m'aides à tourner une leçon pratique de la Formation Sites & Apps de Hooked Academy.
Leçon : [identifiant et titre, ex. dv4-l6 — Construire la vitrine avec Claude Code].
Règles : français, une étape à la fois, explique en une phrase ce que tu vas faire avant de le faire,
montre le plan avant de modifier des fichiers, n'affiche jamais de clé ni de mot de passe,
contenus d'exemple signalés comme tels (« Salon Amina (exemple) », numéro 213000000000).
On commence par : [première étape du script ci-dessous].
```

## Ajouter une vidéo filmée à une leçon

- **Remplacer l'animation** : dépose le MP4 dans `sites/hooked-academy/video/dev/<leçon>.mp4`, puis ajoute dans la leçon
  (fichier `data/programme-dev-1.js`, `-2.js` ou `-3.js`) : `video: 'video/dev/<leçon>.mp4', screen: true,`.
- **Garder l'animation et ajouter la vidéo** : si elle fait moins de 25 Mo, dépose-la dans `ressources/<leçon>/` (elle
  apparaît dans l'onglet Ressources) ; sinon, mets-la sur Drive et ajoute son lien dans `ressources/<leçon>/liens.txt`.
- **Voix off** des leçons animées : Admin → Studio voix off (le texte « à dire » s'affiche scène par scène).

---

## Module D03 — Le tour des plateformes (7 visites)

### dv3-l1 · Claude.ai : chat, projets, artefacts, skills, connecteurs
- **Préparer** : un projet vide « Salon Amina (exemple) ».
- **Filmer** : 1) la page d'accueil de Claude ; 2) Projets → nouveau projet → instructions (colle le prompt « Instructions
  de projet client » de la leçon) → ajouter un fichier brief ; 3) nouvelle conversation dans le projet : demander
  l'artefact d'aperçu ; 4) ouvrir l'artefact, le bouton Partager ; 5) Paramètres → Capacités → Customize → Skills ;
  6) Connecteurs (l'annuaire).
- **À dire** : un projet par client ; l'artefact se partage par lien ; les skills et connecteurs, on y revient en D12.

### dv3-l2 · Claude Code : l'agent qui construit avec toi
- **Filmer** : 1) terminal dans le dossier → `claude` ; 2) `/init` et le CLAUDE.md créé ; 3) **Shift + Tab** jusqu'au
  mode plan, demander un plan sans rien modifier ; 4) une demande de permission : la lire, l'accepter ; 5) `/clear` ;
  6) l'app de bureau (Code) et claude.ai/code (relié à GitHub).
- **À dire** : toujours dans le dossier du projet ; lire avant d'accepter ; mode plan d'abord.

### dv3-l3 · VS Code (et Cursor)
- **Filmer** : explorateur, éditeur, terminal intégré (Ctrl + \`), contrôle de source, installation de Prettier, ESLint,
  Error Lens, GitLens, extension Claude Code ; `code .` depuis le terminal.

### dv3-l4 · Git et GitHub : la visite
- **Filmer** : un dépôt (Code, Commits, Branches, Pull requests, Issues, Actions, Pages, Settings) ; Settings → Code
  security → **Secret scanning** et **Push protection** ; la 2FA du compte (sans montrer les codes).

### dv3-l5 · Supabase : la visite
- **Filmer** : nouveau projet (région Europe) ; Table Editor ; SQL Editor ; Authentication ; Storage ; Edge Functions ;
  **Advisors → Security** ; Project Settings → **API Keys** (montrer les noms des clés, **flouter les valeurs**).

### dv3-l6 · Vercel, Netlify, Cloudflare, Railway : la visite
- **Filmer** : sur Netlify ou Cloudflare : Add new project → Import GitHub → réglages de build → variables → Deploy ;
  sur Railway : New Project → Deploy from GitHub ; **Usage limit** (montrer où il se règle).

### dv3-l7 · Lovable, Bolt, v0, Replit
- **Filmer** : dans Lovable (ou Bolt) : coller le prompt « Premier prompt pour un générateur », générer la première page,
  relier GitHub, ouvrir le dépôt créé sur GitHub ; montrer le compteur de crédits.

---

## Pratiques qui demandent tes comptes

### dv4-l6 · Construire la vitrine avec Claude Code (session complète)
- **Préparer** : dossier vide `salon-amina`, avec `brief.md` et `CLAUDE.md` (modèles de la formation).
- **Filmer** : 1) `claude` → coller le « Prompt de construction de la vitrine » ; 2) lire le plan, corriger un point,
  valider ; 3) laisser construire ; 4) `python3 -m http.server 8000` (Windows : `py -m http.server 8000`) ;
  5) ouvrir http://localhost:8000, mode téléphone (Ctrl + Shift + M) ; 6) Lighthouse mobile.
- **Résultat attendu** : comme le site exemple de la formation (100 partout sur Lighthouse en mobile).

### dv5-l2 · Ton premier dépôt (jusqu'au push)
- **Filmer** : `git init -b main`, `git status`, `git add .`, `git commit -m "Première version du site"` (comme dans
  l'animation), puis sur github.com : New repository (sans README) → `git remote add origin …` → `git push -u origin main`
  → rafraîchir la page du dépôt. Variante : `gh auth login` puis `gh repo create salon-amina --public --source=. --push`.

### dv6-l2 · GitHub Pages pas à pas
- **Filmer** : Settings → Pages → Deploy from a branch → main / (root) → Save → onglet Actions → ouvrir l'adresse →
  envoyer le lien sur ton WhatsApp (aperçu).

### dv6-l4 · Un vrai serveur sur Railway
- **Préparer** : le dossier `mini-api` (server.js de la leçon) poussé sur GitHub.
- **Filmer** : Railway → New Project → Deploy from GitHub repo → Settings → Networking → Generate Domain → ouvrir
  `/api/sante` (réponse `{"ok":true}`) → Usage limit.

### dv7-l2 à dv7-l6 · Supabase de A à Z (une séance de tournage)
- **Filmer dans l'ordre** :
  1. **dv7-l2** SQL Editor : coller le SQL des tables `services` et `reservations` (leçon) → Run → Table Editor.
  2. **dv7-l3** dans le site : afficher la liste des services (variables dans `.env`, **jamais à l'écran**).
  3. **dv7-l4** Authentication → Providers → e-mail ; URL Configuration (site + localhost) ; créer 2 comptes de test.
  4. **dv7-l5** coller les politiques RLS → se connecter avec A, créer une réservation → se connecter avec B : la
     réservation de A n'apparaît pas → Advisors → Security.
  5. **dv7-l6** `claude mcp add --transport http supabase https://mcp.supabase.com/mcp` → `/mcp` → se connecter →
     « Liste mes tables et vérifie que la RLS est activée partout ».

### dv8-l8 · L'audit de sécurité avant mise en ligne
- **Filmer** : `git check-ignore -v .env`, `git grep -n -i "secret"`, puis dans Claude Code `/security-review`, lire le
  rapport, corriger un point. Optionnel : `gitleaks detect` si tu l'as installé (outil open source, GitHub gitleaks/gitleaks).

### dv9-l3 · La voie pro avec Claude Code
- **Filmer** : `npm create vite@latest mon-app -- --template react-ts` → `npm install` → `npm run dev` → ajouter
  CLAUDE.md et spec.md → premier écran en mode plan → commit.

### dv9-l4 · Paiement Chargily en mode test
- **Préparer** : compte Chargily Pay en **mode test** (dev.chargily.com).
- **Filmer** : la page checkout de la documentation, puis le paiement test de bout en bout et la ligne « payée » dans la
  table `paiements` (webhook reçu). **Aucune vraie carte, aucune vraie clé à l'écran.**

### dv12-l2 · Créer et installer un skill
- **Filmer** : copier `formations/sites-et-apps/modeles/skills/nouvelle-demo/` dans `%USERPROFILE%\.claude\skills\`,
  `/nouvelle-demo` dans Claude Code ; puis claude.ai → Customize → Skills → + → Upload a skill (ZIP) ; `/skills`.

### dv12-l3 et dv12-l4 · Plugins et MCP
- **Filmer** : `/plugin` → onglet Discover → installer un plugin du catalogue officiel (portée user) → `/reload-plugins`
  → `claude plugin list` ; `claude mcp add playwright -- npx @playwright/mcp@latest` → « teste le formulaire de mon site ».

### dv13-l2 · Le système de démos à 0 €
- **Filmer** : ton dépôt de démos (structure `sites/`, `demos.json`), une démo ajoutée, `git push`, l'onglet Actions,
  la démo en ligne sur ton sous-domaine. (C'est ton propre système : tu peux le montrer tel quel, sans clé.)
