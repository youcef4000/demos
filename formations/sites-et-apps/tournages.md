# Scripts de tournage — les écrans à filmer par Youcef

> Les leçons de la Formation Sites & Apps ont déjà leur vidéo animée (thème « code ») et leur texte de prompteur.
> **100 % vibe coding** : à l'écran, on ne tape **aucune commande** et on n'ouvre **aucun éditeur de code**. Tout se fait
> dans l'application Claude (onglet **Code**) ou dans Codex, par des demandes en français, puis on vérifie le résultat
> (aperçu, téléphone, GitHub, tableau de bord du service).
> Ce qui demande **tes comptes** (GitHub, Supabase, Railway, claude.ai) se filme sur ton PC.
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

## Faire la pratique avec Claude Code sur ton PC

Dans l'app Claude : **Code** → ouvrir le dossier de travail, puis colle ce prompt au début de chaque tournage (il garde
Claude dans le rythme de la formation) :

```
Tu m'aides à tourner une leçon pratique de la Formation Sites & Apps de Hooked Academy.
Leçon : [identifiant et titre, ex. dv4-l6 — Construire la vitrine avec Claude Code].
Règles : français, une étape à la fois, explique en une phrase ce que tu vas faire avant de le faire,
montre le plan avant de modifier des fichiers, n'affiche jamais de clé ni de mot de passe,
contenus d'exemple signalés comme tels (« Salon Amina (exemple) », numéro 213000000000).
Tu fais toi-même les installations et les commandes : moi, je ne tape rien.
On commence par : [première étape du script ci-dessous].
```

## Ajouter une vidéo filmée à une leçon

- **Les 3 vidéos de présentation (D00)** : dépose le MP4 dans `sites/hooked-academy/video/`, puis dans
  `data/videos-ecran.js` remplis `video` (ex. `'video/dev-presentation.mp4'`) et `d` (durée en secondes) de l'entrée
  `devPlateforme`, `devFormation` ou `devProjet`. Tant que `video` est vide, la leçon affiche « Vidéo bientôt disponible ».
- **Remplacer l'animation d'une leçon** : dépose le MP4 dans `sites/hooked-academy/video/dev/<leçon>.mp4`, puis ajoute
  dans la leçon (fichier `data/programme-dev-1.js`, `-2.js` ou `-3.js`) : `video: 'video/dev/<leçon>.mp4', screen: true,`.
- **Garder l'animation et ajouter la vidéo** : si elle fait moins de 25 Mo, dépose-la dans `ressources/<leçon>/` (elle
  apparaît dans l'onglet Ressources) ; sinon, mets-la sur Drive et ajoute son lien dans `ressources/<leçon>/liens.txt`.
- **Voix off** des leçons animées : Admin → Studio voix off (le texte « à dire » s'affiche scène par scène).

---

## Module D00 — Les 3 vidéos de présentation (à tourner en premier)

Ce sont les **3 premières vidéos** de la formation : les seules ouvertes au compte démo et avant l'inscription.

### dv0-l5 · Présentation de la plateforme Hooked Academy
- **Filmer** : la connexion ; l'accueil de l'espace élève ; les trois formations et la progression ; la page Ressources ;
  l'aide Claude (poser une vraie question sur une leçon) ; l'installation sur le téléphone.
- **À dire** : tout est au même endroit ; la progression est gardée ; l'aide Claude répond à toute heure.

### dv0-l6 · Visite de la Formation Sites & Apps
- **Filmer** : la liste des modules (D00 à D15) ; une leçon animée ; sous la vidéo : l'essentiel, les cartes mémo,
  l'exercice, le quiz ; l'onglet Prompts (copier un prompt, compléter les crochets, le coller dans Claude Code).
- **À dire** : on n'apprend pas à taper du code, on apprend à diriger l'IA ; les leçons « Pratique » se font avec la vidéo.

### dv0-l7 · Le projet final et ton certificat
- **Filmer** : le module D15, le brief du projet final, comment rendre les liens, le retour de l'équipe, le certificat.
- **À dire** : trois projets en ligne (vitrine, application, démo) ; le certificat vient après la validation.

### dv0-l3 · Installer Claude Code ou Codex (pratique)
- **Filmer** : claude.ai/download → installer l'app → se connecter → onglet **Code** → choisir le dossier « Projets » →
  coller la « Première demande à ton agent » (leçon) → lire chaque demande de permission, autoriser l'installation de Git.
  Variante : l'app Codex, même demande.
- **À dire** : pas d'éditeur, pas de commande ; l'agent installe ce qui manque, toi tu lis et tu autorises.

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
- **Filmer** : 1) l'app Claude → **Code** → ouvrir le dossier ; 2) taper `/init` dans la zone de message et montrer le
  CLAUDE.md créé ; 3) passer en **mode plan**, demander un plan sans rien modifier ; 4) une demande de permission : la
  lire, l'accepter ; 5) revenir en arrière sur une modification ; 6) claude.ai/code (relié à GitHub) et l'app mobile.
- **À dire** : toujours dans le dossier du projet ; lire avant d'accepter ; mode plan d'abord.

### dv3-l3 · Codex : l'autre agent
- **Filmer** : l'app Codex → ouvrir le même dossier → donner la même demande qu'à Claude Code → comparer ; Codex dans
  ChatGPT relié à GitHub ; le fichier AGENTS.md.
- **À dire** : même méthode avec les deux ; un agent peut relire le travail de l'autre.

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
- **Filmer** : 1) coller le « Prompt de construction de la vitrine » ; 2) lire le plan, corriger un point, valider ;
  3) laisser construire ; 4) « Lance l'aperçu du site et ouvre-le » ; 5) l'aperçu en largeur téléphone, puis sur ton
  vrai téléphone ; 6) « Lance Lighthouse en mode mobile ».
- **Résultat attendu** : comme le site exemple de la formation (100 partout sur Lighthouse en mobile).

### dv5-l2 · Ton premier dépôt, sans une commande
- **Filmer** : 1) « Transforme ce dossier en dépôt Git et fais une première sauvegarde… » ; 2) « Crée un dépôt privé
  salon-amina sur mon compte GitHub et envoie-y le projet » → la page GitHub s'ouvre → **Authorize** ; 3) sur github.com,
  rafraîchir le dépôt : fichiers, onglet Commits, aucun `.env`, dépôt privé.

### dv5-l3 · Essayer, fusionner, revenir en arrière
- **Filmer** : « Sur une branche à part, essaie une version violette » → aperçu → « fusionne » → « Le client préfère le
  vert : annule l'essai violet sans effacer l'historique » → l'onglet Commits sur GitHub (le revert).

### dv6-l2 · GitHub Pages pas à pas
- **Filmer** : Settings → Pages → Deploy from a branch → main / (root) → Save (ou « Configure la publication automatique
  sur GitHub Pages ») → onglet Actions → ouvrir l'adresse → envoyer le lien sur ton WhatsApp (aperçu).

### dv6-l4 · Un serveur en ligne sur Railway
- **Filmer** : la demande à l'agent (« Crée une petite API qui renvoie les créneaux libres… prépare-la pour Railway et
  envoie-la sur GitHub ») → Railway → New Project → Deploy from GitHub repo → Settings → Networking → Generate Domain →
  ouvrir `/api/sante` sur le téléphone → Usage limit.

### dv7-l2 à dv7-l6 · Supabase de A à Z (une séance de tournage)
- **Filmer dans l'ordre** :
  1. **dv7-l2** écrire les tables en français dans `brief.md` (services, reservations) et les faire relire par Claude.
  2. **dv7-l3** l'app Claude → connecteurs → **Supabase** → se connecter, un seul projet ; puis « Avec le connecteur
     Supabase, crée les tables de brief.md… affiche les services et enregistre les réservations » → Table Editor.
  3. **dv7-l4** « Ajoute l'inscription et la connexion par lien magique… » → Authentication → URL Configuration ;
     créer 2 comptes de test.
  4. **dv7-l5** décrire les règles en français → l'agent active la RLS → se connecter avec A, créer une réservation →
     se connecter avec B : la réservation de A n'apparaît pas → Advisors → Security.
  5. **dv7-l6** « Avec le connecteur Supabase, en lecture seule : liste mes tables et vérifie que la RLS est activée
     partout ».

### dv8-l8 · L'audit de sécurité avant mise en ligne
- **Filmer** : « Vérifie que .env est ignoré et qu'aucun secret n'est sauvegardé, puis les en-têtes de sécurité du site en
  ligne » ; puis `/security-review` dans la zone de message de Claude Code ; lire le rapport, faire corriger un point.

### dv9-l3 · Construire l'application avec ton agent
- **Filmer** : « Lis spec.md. Crée le projet de l'application (Next.js, Tailwind, Supabase)… installe tout toi-même…
  montre-moi l'aperçu » → l'aperçu → premier écran en mode plan → test sur téléphone → « sauvegarde ».

### dv9-l4 · Paiement Chargily en mode test
- **Préparer** : compte Chargily Pay en **mode test** (dev.chargily.com).
- **Filmer** : la demande à l'agent, puis le paiement test de bout en bout et la ligne « payée » dans la table
  `paiements` (webhook reçu). **Aucune vraie carte, aucune vraie clé à l'écran.**

### dv10-l2 · Faire écrire des tests par l'IA
- **Filmer** : « Écris des tests pour le calcul du prix… lance-les » → 3 tests réussis → « Ajoute un code promo, puis
  relance tous les tests » → le test qui attrape l'erreur → la correction.

### dv12-l2 · Créer et installer un skill
- **Filmer** : copier `formations/sites-et-apps/modeles/skills/nouvelle-demo/` dans `%USERPROFILE%\.claude\skills\`,
  `/nouvelle-demo` dans Claude Code ; puis claude.ai → Customize → Skills → + → Upload a skill (ZIP) ; `/skills`.

### dv12-l3 et dv12-l4 · Plugins et MCP
- **Filmer** : `/plugin` → onglet Discover → installer un plugin du catalogue officiel (portée « moi seulement ») →
  `/reload-plugins` ; « Ajoute le serveur MCP Playwright à ce projet… » → `/mcp` → « teste le formulaire de mon site ».

### dv13-l2 · Le système de démos à 0 €
- **Filmer** : ton dépôt de démos (structure `sites/`, `demos.json`), « Ajoute la démo salon-amina à demos.json en
  privé, puis publie-la », l'onglet Actions, la démo en ligne sur ton sous-domaine. (C'est ton propre système : tu peux le
  montrer tel quel, sans clé.)
