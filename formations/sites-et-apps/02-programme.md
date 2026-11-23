# Formation Sites & Apps — programme complet

> **Brouillon initial (23/11/2026).** La formation réelle est maintenant dans la plateforme : `sites/hooked-academy/data/programme-dev-*.js`
> (16 modules, 88 leçons). Vue d'ensemble à jour : `programme-plateforme.md`.

> **Créer, publier et vendre des sites web et des applications avec l'IA.**
> Pour les **débutants complets** (on part de zéro, sans jargon) et, dans chaque leçon, une partie
> **🔥 Niveau avancé** pour ceux qui ont déjà des bases.

| | |
|---|---|
| **Identifiant prévu** | `dev` · modules `D00` à `D12` · leçons `d1-l1`, `d1-l2`… |
| **Titre arabe** | تكوين المواقع والتطبيقات |
| **Couleur / icône** | `#5fd3b3` · `layout` (icônes existantes de la plateforme) |
| **Durée** | 13 modules · 66 leçons · ~7 semaines à raison d'1 h par jour |
| **Prérequis** | Un ordinateur (Windows, Mac ou Linux), une connexion Internet, une adresse e-mail |
| **À la fin** | 3 projets en ligne : un site vitrine, une application avec base de données, une démo vendable |

---

## Comment lire ce programme

Chaque leçon suit le même modèle que les formations Créative et IA de Hooked Academy, pour être convertie facilement :

| Bloc ici | Champ sur la plateforme |
|---|---|
| **Objectif** | `pitch` de la leçon / scène `title` |
| **À retenir** | `key` (3 points) et scènes de la vidéo |
| **Exercice** | `todo` (cases à cocher) |
| **Quiz** (✅ = bonne réponse) | `quiz` : `{ q, a, ok, why }` |
| **🔥 Niveau avancé** | encadré « Pour aller plus loin » (ou scène `checklist`) |

### Le fil rouge

Du module D03 au module D10, chaque élève construit **le projet d'un vrai commerce de son quartier** (restaurant,
salon de coiffure, salle de sport, boutique…) : d'abord le site vitrine, puis une application de réservation ou de
commande avec Supabase, puis la démo qu'il va **réellement présenter** au commerçant. À la fin, il a un portfolio et
peut-être son premier client.

### Deux vitesses

| Profil | Parcours |
|---|---|
| **Débutant complet** | Tout, dans l'ordre. Ne saute aucun exercice. |
| **A déjà des bases** (sait ce qu'est HTML, a déjà utilisé Git) | D00 → quiz de positionnement (fin de D00) → saute aux leçons marquées ★ de D01 à D04 → tout à partir de D05, en faisant toutes les parties 🔥 |

### Les 3 parties

| Partie | Modules | Promesse |
|---|---|---|
| **1. Les bases** | D00 à D04 | Comprendre le web, diriger l'IA, faire son premier site, ne plus jamais perdre son travail |
| **2. Construire et publier** | D05 à D08 | Mettre en ligne, ajouter une base de données, créer une vraie app, animer comme un pro |
| **3. Passer pro** | D09 à D12 | Booster Claude, vendre avec des démos, livrer un travail sûr et légal, projet final |

---

# PARTIE 1 — LES BASES

## D00 · Bienvenue et préparatifs

*icône `play` · Ce qui t'attend, les comptes à créer et l'installation de ton poste.*

### d0-l1 · Bienvenue dans la Formation Sites & Apps

**Objectif :** comprendre le parcours et la façon de travailler avec l'IA.

**À retenir**
- Le parcours : **comprendre → construire → publier → vendre**.
- Tu n'apprends pas à taper chaque ligne de code par cœur : tu apprends à **diriger l'IA comme un chef de projet**,
  à **lire** ce qu'elle produit et à **vérifier** que ça marche.
- L'IA écrit vite ; ce qui a de la valeur, c'est de savoir **quoi** demander, **repérer** les erreurs et **livrer**.

**Exercice**
- [ ] Crée un dossier `Projets` sur ton ordinateur : tous tes projets iront dedans
- [ ] Choisis le commerce de ton quartier qui sera ton **fil rouge** (note son nom, ce qu'il vend, s'il a un site)
- [ ] Écris en une phrase ce que tu veux savoir créer à la fin de la formation

**Quiz** — Qu'est-ce qui a le plus de valeur quand on code avec l'IA ?
- a) Taper du code plus vite que l'IA
- b) Savoir quoi demander, vérifier le résultat et livrer ✅
- c) Connaître toutes les fonctions JavaScript par cœur

*Pourquoi :* l'IA produit le code ; ton travail est de la guider, de contrôler et de livrer quelque chose qui marche.

**🔥 Niveau avancé :** tiens un **journal de bord** (`JOURNAL.md`) dans chaque projet : date, ce que tu as demandé à
l'IA, ce qui a marché, ce qui a cassé. Au bout d'un mois, c'est ta meilleure documentation — et une base pour écrire
tes propres skills (D09).

---

### d0-l2 · Les comptes à créer

**Objectif :** avoir tous les comptes prêts avant de commencer.

**À retenir**
- **Indispensables :** GitHub, Claude (Pro pour Claude Code), Google (pour Search Console et la connexion rapide),
  Supabase.
- **Plus tard :** un hébergeur (Vercel, Netlify, Cloudflare ou Railway), un registraire de domaine.
- **Sécurité dès le premier jour :** un gestionnaire de mots de passe (Bitwarden est gratuit) et la **double
  authentification (2FA)** sur GitHub et sur ta boîte mail.

**Exercice**
- [ ] Crée ton compte GitHub avec un nom professionnel (il apparaîtra dans les adresses de tes projets)
- [ ] Active la 2FA sur GitHub et sur ton e-mail
- [ ] Crée ton compte Supabase avec « Continue with GitHub »
- [ ] Si tu es étudiant : demande le **GitHub Student Developer Pack** (education.github.com/pack)

**Quiz** — Pourquoi choisir un nom GitHub professionnel ?
- a) C'est obligatoire
- b) Il apparaît dans les adresses de tes projets et de ton portfolio ✅
- c) Pour avoir plus d'étoiles

*Pourquoi :* `tonnom.github.io` sera souvent la première adresse que tu montres à un client.

**🔥 Niveau avancé :** crée une **organisation GitHub** gratuite pour ton activité (ex. `ton-studio`) et mets-y les
projets clients : tu sépares le perso du pro et tu peux inviter un collaborateur sans lui ouvrir tout ton compte.

---

### d0-l3 · Installer ton poste de travail

**Objectif :** installer les 5 outils de base et vérifier qu'ils marchent.

**À retenir**
- **VS Code** (éditeur), **Git** (historique), **Node.js LTS** (JavaScript hors du navigateur), **Chrome**
  (tests), **Claude Code** (l'agent qui code avec toi).
- Le **terminal** n'est pas dangereux : c'est une façon d'écrire des ordres à l'ordinateur. 5 commandes suffisent pour
  commencer : `cd` (aller dans un dossier), `ls` / `dir` (lister), `mkdir` (créer un dossier), `code .` (ouvrir dans
  VS Code), `claude` (lancer Claude Code).
- Installer Claude Code : `curl -fsSL https://claude.ai/install.sh | bash` (Mac, Linux) ou
  `irm https://claude.ai/install.ps1 | iex` (Windows PowerShell). Sans installation : l'application de bureau Claude ou
  **claude.ai/code** dans le navigateur.

**Exercice**
- [ ] Installe VS Code, Git, Node.js (version LTS) et Chrome
- [ ] Dans un terminal, tape `git --version`, `node --version`, `claude --version` : trois numéros doivent s'afficher
- [ ] Fais une capture d'écran des trois versions (preuve pour l'exercice)

**Quiz** — Que fait la commande `cd Projets` ?
- a) Elle supprime le dossier Projets
- b) Elle t'emmène dans le dossier Projets ✅
- c) Elle crée le dossier Projets

*Pourquoi :* `cd` = *change directory*, changer de dossier. Pour créer, c'est `mkdir`.

**🔥 Niveau avancé :** installe l'extension **GitLens**, la **GitHub CLI** (`gh`) et configure ton identité Git une
fois pour toutes : `git config --global user.name "Ton Nom"` et `git config --global user.email "ton@email"`. Sur
Windows, installe **WSL** pour avoir le même terminal que les tutos.

---

### d0-l4 · Organiser son travail comme un pro

**Objectif :** adopter des habitudes qui évitent 90 % des problèmes.

**À retenir**
- **Un projet = un dossier = un dépôt GitHub.** Jamais deux projets dans le même dossier.
- **Noms de dossiers** en minuscules, sans accents ni espaces : `salon-amina`, pas `Salon Amina (final) v2`.
- **Petites étapes :** une demande à l'IA = une fonctionnalité. Tu testes, tu sauvegardes (commit), tu continues.

**Exercice**
- [ ] Crée `Projets/fil-rouge-<nom-du-commerce>/`
- [ ] Dedans, crée un fichier `NOTES.md` avec : le nom du commerce, son adresse, ce qu'il vend, 3 idées pour son site
- [ ] Passe le **quiz de positionnement** ci-dessous

**Quiz de positionnement** (5 questions ; 4 bonnes réponses ou plus → parcours rapide)
1. Quelle balise HTML crée un lien ? → `<a>`
2. Que fait `git commit` ? → enregistre une sauvegarde nommée des modifications
3. Différence entre front-end et back-end ? → ce qui tourne dans le navigateur / ce qui tourne sur le serveur
4. Qu'est-ce qu'un DNS ? → l'annuaire qui relie un nom de domaine à un serveur
5. Où ne faut-il jamais mettre une clé d'API secrète ? → dans le code envoyé au navigateur ou sur GitHub

**🔥 Niveau avancé :** prépare un **dossier modèle** (`_modele-projet/`) avec ton `CLAUDE.md`, ton `.gitignore`, un
`README.md` vide et un `brief.md` (voir `modeles/`) : chaque nouveau projet démarre en le copiant.

---

## D01 · Comment marche le web (sans jargon)

*icône `globe` · Les notions qu'il faut comprendre pour parler à l'IA, à un client et à un hébergeur.*

### d1-l1 · Domaine, DNS, hébergeur, navigateur ★

**Objectif :** comprendre ce qui se passe quand on tape une adresse.

**À retenir**
- **Le domaine** (`salon-amina.com`) = l'enseigne. **L'hébergeur** = le local où sont les fichiers. **Le DNS** =
  l'annuaire qui dit « cette enseigne → ce local ».
- Le **navigateur** demande les fichiers au serveur, puis les affiche.
- **HTTPS** (le cadenas) = la communication est chiffrée. Aujourd'hui c'est gratuit et obligatoire.

**Exercice**
- [ ] Sur un site que tu connais, clique sur le cadenas et lis qui a délivré le certificat
- [ ] Va sur `dnschecker.org`, tape le domaine d'un site connu et regarde son enregistrement **A**
- [ ] Explique avec tes mots (3 phrases) ce qu'est un DNS, comme si tu parlais à ton commerçant

**Quiz** — Le DNS sert à…
- a) Stocker les images du site
- b) Relier un nom de domaine à l'adresse du serveur ✅
- c) Rendre le site plus rapide

*Pourquoi :* le DNS est l'annuaire du web : il traduit un nom en adresse.

**🔥 Niveau avancé :** apprends les enregistrements **A** (vers une adresse IP), **CNAME** (vers un autre nom),
**TXT** (vérifications, SPF), **MX** (e-mails). Ouvre les DevTools (F12) → onglet **Network**, recharge une page et
observe chaque fichier téléchargé, sa taille et son temps.

---

### d1-l2 · Front-end, back-end, base de données, API ★

**Objectif :** savoir où vit chaque partie d'une application.

**À retenir**
- Le restaurant : **la salle** = le front-end (ce que voit le client), **la cuisine** = le back-end (le travail
  caché), **le frigo** = la base de données, **le serveur qui prend la commande** = l'API.
- Un site vitrine n'a souvent **que** la salle. Une app de réservation a besoin des quatre.
- **Règle de sécurité :** tout ce qui est dans le front-end est **visible par tout le monde** (clic droit → code
  source). Les secrets vivent dans la cuisine.

**Exercice**
- [ ] Pour 3 applications que tu utilises (Yassir, Instagram, une banque), écris ce qui est front, back, base de données
- [ ] Ouvre le code source (Ctrl+U) d'un site et repère le HTML, le CSS et le JavaScript

**Quiz** — Où doit vivre une clé d'API payante ?
- a) Dans le JavaScript du site
- b) Dans le back-end ou une fonction serveur ✅
- c) Dans le HTML, en commentaire

*Pourquoi :* tout le front est lisible par n'importe qui.

**🔥 Niveau avancé :** comprends les échanges **JSON** : ouvre l'onglet Network sur une app web, filtre sur
« Fetch/XHR » et lis une réponse d'API. Découvre les codes HTTP (200 ok, 401 non connecté, 403 interdit, 404
introuvable, 500 erreur serveur) : ils aident énormément à déboguer.

---

### d1-l3 · Site statique, application web, application mobile ★

**Objectif :** choisir le bon type de projet pour chaque client.

**À retenir**

| Type | Exemple | Il faut |
|---|---|---|
| **Site statique** | Vitrine d'un restaurant, portfolio, landing page | HTML/CSS/JS, hébergement gratuit |
| **Application web** | Réservations, espace client, back-office | + base de données, comptes, souvent un serveur |
| **PWA** | Une app web installable sur l'écran d'accueil | + un manifeste et un service worker |
| **App mobile native** | App sur l'App Store / Google Play | Expo/React Native, comptes développeur payants |

- **80 % des commerçants ont besoin d'un site statique** bien fait + un bouton WhatsApp. Ne vends pas une app à
  quelqu'un qui a besoin d'une vitrine.

**Exercice**
- [ ] Pour ton fil rouge, décide : statique, app web, PWA ou mobile ? Justifie en 3 lignes dans `NOTES.md`

**Quiz** — Un salon de coiffure veut montrer ses prix et recevoir des messages WhatsApp. Il lui faut…
- a) Une app native sur les stores
- b) Un site statique avec un bouton WhatsApp ✅
- c) Un serveur dédié

*Pourquoi :* le besoin est simple ; une solution simple est moins chère, plus rapide et sans maintenance.

**🔥 Niveau avancé :** une **PWA** donne 80 % de l'effet « app » sans passer par les stores (icône, plein écran, hors
connexion). Hooked Academy en est une : regarde son `manifest.webmanifest` et son `sw.js`.

---

### d1-l4 · HTML, CSS, JavaScript : savoir les lire

**Objectif :** reconnaître les 3 langages et comprendre ce que l'IA écrit.

**À retenir**
- **HTML** = la structure (titres, textes, images, boutons). **CSS** = l'apparence (couleurs, tailles, mise en page).
  **JavaScript** = le comportement (clic, menu, formulaire, animations).
- Tu n'as pas besoin de tout savoir écrire, mais tu dois **savoir lire** : trouver où est le titre, changer une couleur,
  repérer un bouton.
- Les 10 balises qui reviennent partout : `header`, `nav`, `main`, `section`, `h1`/`h2`, `p`, `a`, `img`, `button`,
  `footer`.

**Exercice**
- [ ] Demande à Claude : « Crée une page HTML d'une seule section avec un titre, un texte et un bouton, et explique-moi
      chaque ligne comme à un débutant »
- [ ] Modifie toi-même la couleur du bouton et le texte du titre, sans l'IA
- [ ] Ouvre la page dans Chrome et fais clic droit → « Inspecter » sur le bouton

**Quiz** — Quel langage décide de la couleur d'un bouton ?
- a) HTML
- b) CSS ✅
- c) JavaScript

*Pourquoi :* CSS gère l'apparence ; HTML ne fait que dire « ici, il y a un bouton ».

**🔥 Niveau avancé :** maîtrise **Flexbox** et **Grid** (90 % des mises en page), les **variables CSS**
(`--couleur-principale`) et `clamp()` pour des tailles de texte qui s'adaptent à l'écran. Entraîne-toi sur
Flexbox Froggy et Grid Garden.

---

### d1-l5 · Les frameworks en une phrase (et quand s'en passer)

**Objectif :** ne plus être perdu face aux noms que l'IA propose.

**À retenir**

| Nom | En une phrase | Utile quand |
|---|---|---|
| **React** | Construire une interface en petits composants réutilisables | Apps avec beaucoup d'écrans |
| **Next.js** | React + pages + serveur, prêt pour la production | Sites et apps React sérieux |
| **Vite** | Démarrer et compiler un projet JS très vite | Base de beaucoup de projets |
| **Tailwind CSS** | Styliser avec des classes (`bg-black text-white`) | Aller vite, garder un design cohérent |
| **shadcn/ui** | Composants React prêts (boutons, formulaires) à copier | Back-offices, apps |
| **Astro** | Sites rapides et orientés contenu | Blogs, vitrines riches |
| **Expo** | Apps mobiles iOS/Android en React | App native |

- **Pas de framework** pour une vitrine ou une démo : HTML + CSS + JS suffisent, et ça se publie partout. C'est ce
  que tu fais pour les démos prospects.

**Exercice**
- [ ] Pour ton fil rouge, écris quelle pile tu choisis et pourquoi (vitrine : HTML/CSS/JS)

**Quiz** — Pour une vitrine de restaurant, le plus simple est…
- a) Next.js + base de données
- b) HTML, CSS et JavaScript ✅
- c) Une app Expo

*Pourquoi :* moins de pièces = moins de pannes, publication gratuite, l'IA le maîtrise parfaitement.

**🔥 Niveau avancé :** quand tu utilises un framework, demande toujours à l'IA d'utiliser la **dernière version
stable** et donne-lui la doc à jour (serveur MCP Context7 ou lien vers la doc officielle) : les modèles connaissent
parfois une ancienne syntaxe.

---

## D02 · Coder avec l'IA : les outils et la méthode

*icône `bot` · Choisir le bon outil, écrire de bons prompts de build, prendre en main Claude Code, déboguer.*

### d2-l1 · Le panorama des outils IA pour coder ★

**Objectif :** savoir quel outil utiliser pour quel travail.

**À retenir**

| Famille | Outils | Pour |
|---|---|---|
| **Chat** | Claude.ai (artefacts), ChatGPT | Comprendre, prototyper une page, expliquer une erreur |
| **Générateurs d'apps** | Lovable, Bolt, v0, Replit | Une app avec interface en quelques minutes, sans installation |
| **Éditeurs avec IA** | Cursor, Windsurf, VS Code + Copilot | Coder avec l'IA dans ton éditeur |
| **Agents** | **Claude Code** (terminal, bureau, web) | Projets réels : lit tout le projet, modifie, teste, publie |

- Les générateurs sont parfaits pour **démarrer et montrer** ; Claude Code est fait pour **construire, corriger et
  maintenir** un vrai projet.
- Les offres gratuites fonctionnent avec des **crédits** limités : planifie avant de cliquer.

**Exercice**
- [ ] Génère la même landing page pour ton fil rouge dans **deux** outils (ex. Claude.ai + Lovable)
- [ ] Compare : qualité du design, du texte, du code, facilité de modification. Note ton verdict

**Quiz** — Pour corriger un bug dans un projet de 40 fichiers, le meilleur outil est…
- a) Un chat sans accès aux fichiers
- b) Un agent comme Claude Code qui lit tout le projet ✅
- c) Un générateur d'images

*Pourquoi :* l'agent voit tous les fichiers, lance les commandes et vérifie le résultat.

**🔥 Niveau avancé :** combine les outils : prototype dans Lovable ou Bolt → **synchronise avec GitHub** → reprends le
projet dans Claude Code pour le nettoyer, le sécuriser et le maintenir. Tu gardes la vitesse du générateur et la
maîtrise de l'agent.

---

### d2-l2 · La méthode : brief → plan → petites étapes → vérifier → sauvegarder ★

**Objectif :** une méthode fiable, quel que soit l'outil.

**À retenir**
1. **Brief** : pour qui, pour quoi, quels écrans, quelles données (modèle : `modeles/brief-projet.md`).
2. **Plan** : demande d'abord un plan, relis-le, corrige-le, puis seulement fais construire.
3. **Petites étapes** : une fonctionnalité à la fois.
4. **Vérifier** : ouvre, clique, teste sur téléphone. L'IA peut dire « c'est fait » alors que ça ne marche pas.
5. **Sauvegarder** : un commit dès que ça marche.

**Exercice**
- [ ] Remplis le brief de ton fil rouge avec le modèle
- [ ] Demande un plan à l'IA à partir du brief (sans code) et corrige au moins 2 points du plan

**Quiz** — Quand l'IA dit « j'ai terminé, tout fonctionne », tu…
- a) Envoies au client
- b) Testes toi-même sur ordinateur et sur téléphone ✅
- c) Demandes à l'IA de confirmer

*Pourquoi :* seul un test réel prouve que ça marche.

**🔥 Niveau avancé :** écris des **critères d'acceptation** testables dans chaque demande (« le formulaire refuse un
numéro de moins de 10 chiffres », « la page fait moins de 1 Mo ») et demande à Claude d'écrire un test automatique
(Playwright) pour chacun.

---

### d2-l3 · Écrire un bon prompt de build

**Objectif :** obtenir du premier coup un résultat proche de ce que tu veux.

**À retenir** — un bon prompt de build contient 6 blocs :

```
CONTEXTE    : qui est le client, quel est le projet, ce qui existe déjà
OBJECTIF    : ce que tu veux maintenant (une seule chose)
CONTRAINTES : technologies, style, mobile d'abord, langue, ce qu'il ne faut PAS toucher
CONTENU     : textes, couleurs, polices, images (ou « contenu d'exemple présenté comme tel »)
CRITÈRES    : comment on saura que c'est réussi
FORMAT      : fichiers attendus, explications voulues ou non
```

- Plus le prompt est précis, moins tu dépenses de crédits et de temps en corrections.
- Donne des **exemples visuels** : une capture d'un site que tu aimes vaut 100 mots.

**Exercice**
- [ ] Écris le prompt de la page d'accueil de ton fil rouge avec les 6 blocs
- [ ] Lance-le, puis note ce qui manquait dans ton prompt (pour la prochaine fois)

**Quiz** — Le bloc « contraintes » sert à…
- a) Décrire les couleurs
- b) Dire à l'IA ce qu'elle doit respecter et ce qu'elle ne doit pas toucher ✅
- c) Raconter l'histoire du client

*Pourquoi :* sans contraintes, l'IA choisit à ta place (framework lourd, fichiers modifiés, style générique).

**🔥 Niveau avancé :** transforme tes meilleurs prompts en **modèles réutilisables**, puis en **skill** (D09) : la
méthode s'applique alors toute seule à chaque projet. Exemple existant : le skill `prompt-architect`.

---

### d2-l4 · Prendre en main Claude Code

**Objectif :** travailler avec un agent sur un vrai dossier.

**À retenir**
- Lance `claude` **dans le dossier du projet** : il voit uniquement ce dossier.
- `/init` crée **`CLAUDE.md`**, la mémoire du projet : règles, commandes, structure. Claude le relit à chaque session.
- **Shift + Tab** passe en **mode plan** : Claude propose un plan sans toucher aux fichiers. Valide, puis il exécute.
- Claude **demande la permission** avant les actions sensibles : lis avant d'accepter.
- `/clear` pour une nouvelle tâche, **Échap deux fois** pour revenir en arrière.
- Aussi dans l'**application de bureau** et sur **claude.ai/code** (dans le navigateur, relié à GitHub, même depuis
  le téléphone).

**Exercice**
- [ ] Dans le dossier du fil rouge, lance `claude` puis `/init`
- [ ] En mode plan, demande : « Crée la page d'accueil décrite dans brief.md, en HTML/CSS/JS, mobile d'abord »
- [ ] Valide le plan, laisse faire, ouvre la page dans Chrome

**Quiz** — À quoi sert `CLAUDE.md` ?
- a) À stocker les mots de passe
- b) À donner à Claude les règles et la mémoire du projet ✅
- c) À publier le site

*Pourquoi :* Claude relit ce fichier à chaque session ; c'est là que tu écris tes règles une fois pour toutes.

**🔥 Niveau avancé :** mets dans `CLAUDE.md` tes **règles non négociables** (chemins relatifs, pas de clé dans le front,
versions fixées, français par défaut…). Le `CLAUDE.md` de ce dépôt est un bon exemple. Utilise `/compact` sur les
longues sessions, et lance plusieurs sessions en parallèle sur des tâches indépendantes.

---

### d2-l5 · Déboguer avec l'IA : lire une erreur, ne pas paniquer

**Objectif :** sortir seul d'un blocage.

**À retenir**
- Une page blanche n'est pas « rien » : ouvre **F12 → Console**. L'erreur en rouge dit **quoi** et **où** (fichier,
  ligne).
- Donne à l'IA : **ce que tu as fait**, **ce que tu attendais**, **ce qui se passe**, **l'erreur exacte** (copiée, pas
  résumée), une **capture** si c'est visuel.
- Si l'IA tourne en rond après 2 essais : `/clear`, reformule, ou reviens au dernier commit qui marchait.

**Exercice**
- [ ] Casse volontairement ta page (supprime une accolade dans le JS), lis l'erreur dans la Console
- [ ] Demande la correction à l'IA avec le modèle « fait / attendu / obtenu / erreur »
- [ ] Teste la page sur ton téléphone avec le mode appareil de Chrome (Ctrl+Shift+M)

**Quiz** — Que faut-il donner à l'IA pour corriger un bug ?
- a) « Ça marche pas »
- b) Ce que tu as fait, ce que tu attendais, ce qui se passe et l'erreur exacte ✅
- c) Seulement une capture d'écran de la page entière

*Pourquoi :* l'erreur exacte et le contexte évitent les suppositions.

**🔥 Niveau avancé :** ajoute le serveur MCP **Playwright** (`claude mcp add playwright -- npx @playwright/mcp@latest`) :
Claude ouvre lui-même le navigateur, clique, lit la console et vérifie son travail.

---

## D03 · Ton premier site vitrine, de A à Z

*icône `layout` · Le site du fil rouge : structure qui convertit, design propre, images, SEO, qualité.*

### d3-l1 · La structure d'une page qui donne envie

**Objectif :** construire une page qui transforme un visiteur en client.

**À retenir** — l'ordre qui marche pour un commerce :
1. **Hero** : ce que c'est + pour qui + bouton d'action (« Réserver sur WhatsApp »)
2. **Preuves** : photos réelles, chiffres vrais, avis **réels** (jamais inventés)
3. **Offre** : services / menu / prix
4. **Comment ça marche** : 3 étapes
5. **FAQ** : les questions que le commerçant reçoit tous les jours
6. **Contact** : carte, horaires, WhatsApp, téléphone cliquable
- Le visiteur arrive **sur téléphone** (Instagram, WhatsApp) : le bouton d'action doit être visible sans défiler.

**Exercice**
- [ ] Dessine sur papier la page de ton fil rouge en 6 blocs (wireframe)
- [ ] Construis-la avec Claude Code, contenu d'exemple **marqué comme exemple**

**Quiz** — Que doit-on voir en premier sur mobile ?
- a) Le logo en très grand
- b) Ce que c'est, pour qui, et le bouton d'action ✅
- c) Les mentions légales

*Pourquoi :* en 3 secondes, le visiteur décide s'il reste.

**🔥 Niveau avancé :** ajoute des **liens WhatsApp pré-remplis** (`https://wa.me/213XXXXXXXXX?text=Bonjour%2C%20je%20voudrais%20réserver`),
des **données structurées** `LocalBusiness` (JSON-LD) pour Google, et un bouton d'appel flottant sur mobile.

---

### d3-l2 · Un design propre sans être designer

**Objectif :** un résultat pro avec des règles simples.

**À retenir**
- **2 polices maximum** (une pour les titres, une pour le texte) — Google Fonts, Fontshare.
- **1 couleur principale** + des neutres. Teste ta palette en direct sur **Realtime Colors**.
- **Espacements réguliers** (8, 16, 24, 32, 48 px) et beaucoup de vide : le vide fait « premium ».
- **Mobile d'abord** : on conçoit pour 375 px de large, puis on agrandit.
- S'inspirer : Awwwards, Godly, Land-book, Dribbble (liste complète dans `03-ressources.md`).

**Exercice**
- [ ] Choisis 2 polices et une couleur pour ton fil rouge, écris-les dans `CLAUDE.md` (section « Design »)
- [ ] Trouve 3 sites d'inspiration et donne leurs captures à Claude avec « inspire-toi du rythme et des espacements,
      pas du contenu »

**Quiz** — Combien de polices au maximum pour un site propre ?
- a) 2 ✅
- b) 5
- c) Une par section

*Pourquoi :* trop de polices = site amateur et plus lent.

**🔥 Niveau avancé :** crée un mini **design system** en variables CSS (`--couleur-1`, `--rayon`, `--espace-m`,
échelle typographique avec `clamp()`), un **mode sombre** avec `prefers-color-scheme`, et demande à Claude de ne
jamais écrire une couleur en dur hors des variables.

---

### d3-l3 · Images, vidéos et icônes

**Objectif :** un site beau **et** rapide.

**À retenir**
- Format **WebP** (ou AVIF), compressé avec **Squoosh** ; largeur max ~1600 px pour une image plein écran.
- `loading="lazy"` sur les images sous la ligne de flottaison, `width` et `height` renseignés, texte **`alt`**.
- Icônes : **Lucide**, **Phosphor**, **Iconify** (SVG légers).
- Photos libres : **Unsplash**, **Pexels**. Images générées par IA : **indiquer que ce sont des illustrations** tant
  que les vraies photos du commerce ne sont pas là.

**Exercice**
- [ ] Convertis toutes les images du fil rouge en WebP, chacune < 200 Ko
- [ ] Ajoute `alt`, `width`, `height` et `loading="lazy"` partout

**Quiz** — Le meilleur format pour une photo sur le web aujourd'hui ?
- a) PNG
- b) WebP ou AVIF ✅
- c) BMP

*Pourquoi :* à qualité égale, WebP/AVIF sont beaucoup plus légers.

**🔥 Niveau avancé :** utilise `<picture>` et `srcset` pour servir une image adaptée à chaque écran, et des
**vidéos en arrière-plan** muettes, en boucle, compressées (`ffmpeg`), avec une image de remplacement (`poster`).

---

### d3-l4 · SEO et aperçus de partage

**Objectif :** être trouvé sur Google et avoir un bel aperçu sur WhatsApp et LinkedIn.

**À retenir**
- `<title>` (≤ 60 caractères) et `<meta name="description">` (≤ 155 caractères) uniques par page.
- **Open Graph** : `og:title`, `og:description`, `og:image` (1200 × 630, adresse **complète**), `og:url`.
- **Un seul `h1`** par page, des `h2` pour les sections, des textes qui contiennent ce que les gens tapent
  (« coiffeur Oran », « restaurant traditionnel Alger »).
- Tester l'aperçu : **opengraph.xyz**, **LinkedIn Post Inspector**.

**Exercice**
- [ ] Ajoute title, description et Open Graph au fil rouge
- [ ] Crée l'image de partage 1200 × 630 (Canva ou Figma)
- [ ] Vérifie l'aperçu sur opengraph.xyz

**Quiz** — Pourquoi `og:image` doit être une adresse complète (`https://…`) ?
- a) C'est plus joli
- b) WhatsApp et LinkedIn lisent la page de l'extérieur et ne devinent pas les chemins relatifs ✅
- c) Pour le référencement Google uniquement

*Pourquoi :* les robots de partage ont besoin de l'adresse absolue de l'image.

**🔥 Niveau avancé :** `sitemap.xml`, `robots.txt`, balise `canonical`, `hreflang` pour un site multilingue
(français / arabe / anglais), fiche **Google Business Profile** du commerce reliée au site : c'est elle qui ramène le
plus de clients locaux.

---

### d3-l5 · Qualité : responsive, vitesse, accessibilité

**Objectif :** livrer un site qui passe les tests des pros.

**À retenir**
- **Lighthouse** (F12 → Lighthouse) ou **PageSpeed Insights** : vise **90+** sur mobile dans les 4 catégories.
- Tester sur un **vrai téléphone**, en 4G, en mode portrait **et** paysage.
- Accessibilité : contraste suffisant, textes de boutons clairs, navigation au clavier, `alt` sur les images.
- **`prefers-reduced-motion`** : certaines personnes désactivent les animations (vertiges) ; on respecte ce réglage.

**Exercice**
- [ ] Lance Lighthouse sur ton fil rouge, note les 4 scores
- [ ] Demande à Claude de corriger les points signalés, relance, note les nouveaux scores

**Quiz** — Le score Lighthouse à viser sur mobile ?
- a) 50
- b) 90 ou plus ✅
- c) Ça n'a pas d'importance

*Pourquoi :* un site lent perd ses visiteurs et son référencement.

**🔥 Niveau avancé :** surveille les **Core Web Vitals** (LCP, INP, CLS), précharge la police et l'image du hero
(`<link rel="preload">`), et ajoute une politique de sécurité `Content-Security-Policy` dans une balise `<meta>`.

---

## D04 · Git & GitHub : ne plus jamais perdre ton travail

*icône `layers` · Sauvegarder, revenir en arrière, collaborer, protéger les secrets, trouver des projets open source.*

### d4-l1 · Git expliqué simplement ★

**Objectif :** comprendre à quoi sert Git avant de taper une commande.

**À retenir**
- Git = des **points de sauvegarde** (commits) de ton projet. Tu peux revenir à n'importe lequel.
- **GitHub** = le coffre-fort en ligne de ces sauvegardes (+ collaboration, + publication).
- Le cycle : **modifier → `git add` (préparer) → `git commit` (sauvegarder) → `git push` (envoyer sur GitHub)**.
- Un bon message de commit dit **ce qui a changé** : « Ajoute le formulaire de réservation », pas « modif ».

**Exercice**
- [ ] Dans le dossier du fil rouge : `git init`, `git add .`, `git commit -m "Première version du site"`
- [ ] Modifie un texte, fais un 2e commit, puis tape `git log --oneline`

**Quiz** — Un commit, c'est…
- a) L'envoi du site au client
- b) Un point de sauvegarde nommé du projet ✅
- c) Un fichier de configuration

*Pourquoi :* chaque commit est un état du projet auquel tu peux revenir.

**🔥 Niveau avancé :** adopte des messages au format **Conventional Commits** (`feat:`, `fix:`, `docs:`), et demande
à Claude de faire les commits pour toi avec un message clair à chaque étape validée.

---

### d4-l2 · Relier son projet à GitHub ★

**Objectif :** mettre son projet en ligne sur GitHub.

**À retenir**
- Créer le dépôt sur github.com (**New repository**), **sans** README si le projet existe déjà en local.
- Relier et envoyer :
  ```bash
  git branch -M main
  git remote add origin https://github.com/<compte>/<projet>.git
  git push -u origin main
  ```
- Ou en une commande avec la GitHub CLI : `gh repo create <projet> --public --source=. --push`.
- Pour s'identifier : `gh auth login` (le plus simple) ou une clé SSH.
- **Public ou privé ?** Public = portfolio et GitHub Pages gratuit. Privé = projets clients.

**Exercice**
- [ ] Envoie ton fil rouge sur GitHub
- [ ] Sur github.com, ouvre l'onglet « Commits » et retrouve tes sauvegardes

**Quiz** — Que fait `git push` ?
- a) Récupère les modifications depuis GitHub
- b) Envoie tes commits vers GitHub ✅
- c) Supprime la branche

*Pourquoi :* push = pousser vers GitHub ; pull = tirer depuis GitHub.

**🔥 Niveau avancé :** relie GitHub à **claude.ai/code** : tu lances des tâches sur tes dépôts depuis ton téléphone,
Claude travaille dans le cloud sur une branche et ouvre une Pull Request que tu relis.

---

### d4-l3 · Branches et Pull Requests

**Objectif :** tester une idée sans casser ce qui marche.

**À retenir**
- `main` = la version qui marche (souvent celle en ligne).
- Une **branche** = un espace d'essai : `git checkout -b nouveau-menu`.
- Une **Pull Request** = « je propose de fusionner ma branche dans `main` », avec la liste des changements à relire.
- Beaucoup d'hébergeurs (Vercel, Netlify, Cloudflare) créent une **adresse d'aperçu** pour chaque branche : parfait
  pour montrer une modification au client avant de la publier.

**Exercice**
- [ ] Crée une branche `essai-couleurs`, change la couleur principale, commit, push
- [ ] Ouvre une Pull Request sur GitHub, relis les changements, fusionne-la

**Quiz** — Pourquoi travailler dans une branche ?
- a) Pour aller plus vite
- b) Pour essayer sans risquer la version qui marche ✅
- c) Parce que GitHub l'exige

*Pourquoi :* si l'essai rate, `main` n'a pas bougé.

**🔥 Niveau avancé :** installe l'application GitHub de Claude (`/install-github-app` dans Claude Code) : tu écris
`@claude` dans une issue ou une Pull Request et Claude répond, corrige ou relit le code directement sur GitHub.

---

### d4-l4 · Les secrets : `.gitignore`, `.env`, et quoi faire en cas de fuite

**Objectif :** ne jamais publier une clé d'API ou un mot de passe.

**À retenir**
- `.env` = fichier local des secrets (`SUPABASE_SECRET_KEY=…`). Il est listé dans **`.gitignore`** : Git l'ignore.
- `.env.example` = la même liste **sans les valeurs**, versionnée, pour savoir quoi remplir.
- Sur l'hébergeur : les secrets vont dans **Variables d'environnement** (Settings → Environment Variables).
- **En cas de fuite :** **révoquer la clé immédiatement** chez le fournisseur et en créer une nouvelle. Supprimer le
  commit ne suffit pas : des robots scannent GitHub en permanence.

**Exercice**
- [ ] Ajoute le `.gitignore` du modèle (`modeles/gitignore.txt`) à ton projet **avant** tout secret
- [ ] Crée un `.env` et un `.env.example`, vérifie avec `git status` que `.env` n'apparaît pas

**Quiz** — Tu as poussé une clé secrète sur GitHub par erreur. Première chose à faire ?
- a) Supprimer le dépôt
- b) Révoquer la clé chez le fournisseur et en créer une nouvelle ✅
- c) Faire un nouveau commit qui l'efface

*Pourquoi :* la clé a pu être copiée en quelques secondes ; seule sa révocation la rend inutile.

**🔥 Niveau avancé :** active la **protection des pushes** et le **secret scanning** (Settings → Code security) ; pour
un serveur qui doit lire un dépôt privé, utilise une **deploy key** en lecture seule plutôt que ton compte.

---

### d4-l5 · Trouver et réutiliser des projets open source

**Objectif :** ne pas réinventer la roue, en restant dans la légalité.

**À retenir**
- Recherche avancée GitHub :
  `landing page stars:>500 language:HTML pushed:>2026-01-01` ·
  `topic:supabase topic:nextjs stars:>1000` · `"dashboard" license:mit archived:false`.
- Explorer : **github.com/trending**, **github.com/topics**, les listes **awesome-…**, **ossinsight.io**,
  **grep.app** (chercher du code), **npmtrends.com** (comparer des librairies).
- **Vérifier avant d'utiliser :** licence (MIT/Apache = usage commercial ok ; **pas de licence = interdit**),
  dernière mise à jour, issues qui reçoivent des réponses, nombre de contributeurs.
- Bouton **« Use this template »** pour partir d'un dépôt modèle ; **Fork** pour contribuer.

**Exercice**
- [ ] Trouve 3 dépôts de templates de sites (étoiles > 500, mis à jour cette année, licence MIT)
- [ ] Pour chacun, note : licence, dernière mise à jour, ce que tu pourrais réutiliser

**Quiz** — Un dépôt sans fichier de licence…
- a) Peut être utilisé librement
- b) Ne donne pas le droit de réutiliser le code ✅
- c) Est forcément sous licence MIT

*Pourquoi :* sans licence, l'auteur garde tous les droits par défaut.

**🔥 Niveau avancé :** en ligne de commande, `gh search repos "portfolio" --language=html --sort=stars --limit 20` ;
regarde la **courbe d'étoiles** sur star-history.com (un projet qui monte vite = tendance) et demande à Claude
d'**auditer** un dépôt avant de l'utiliser (dépendances, scripts d'installation, sécurité).

---

# PARTIE 2 — CONSTRUIRE ET PUBLIER

## D05 · Mettre en ligne : les hébergeurs

*icône `route` · GitHub Pages, Vercel, Netlify, Cloudflare, Railway, Render, VPS — et le nom de domaine.*

### d5-l1 · Les familles d'hébergement (et lequel choisir)

**Objectif :** choisir l'hébergeur adapté sans payer pour rien.

**À retenir**

| Famille | Services | Pour |
|---|---|---|
| **Statique** | GitHub Pages, Cloudflare Pages, Netlify, Vercel | Vitrines, démos, fronts |
| **PaaS** (serveur géré) | Railway, Render, Koyeb, Fly.io | Serveur Node/Python, API, bot |
| **BaaS** (backend prêt) | Supabase, Firebase | Base de données + comptes + fichiers |
| **VPS** | Hostinger, Hetzner, OVH (+ Coolify / Dokploy) | Plusieurs apps, coût fixe, contrôle total |

- **Pas de serveur nécessaire → statique gratuit.** Données + comptes → statique + Supabase. Vrai serveur →
  Railway/Render. Beaucoup d'apps → VPS.
- Vercel Hobby est **gratuit mais non commercial** : un site client doit passer en Pro (ou aller ailleurs).

**Exercice**
- [ ] Pour 4 projets imaginaires (vitrine, boutique, app de réservation, bot Telegram), choisis l'hébergement et
      justifie

**Quiz** — Une vitrine sans base de données s'héberge au mieux…
- a) Sur un VPS à 20 $/mois
- b) Sur un hébergement statique gratuit ✅
- c) Sur Railway

*Pourquoi :* pas de serveur à faire tourner = pas besoin de payer un serveur.

**🔥 Niveau avancé :** pense **coût total** : le plan gratuit d'aujourd'hui peut devenir payant ; préfère les
solutions où tu peux **déménager** facilement (code standard, Docker, base Postgres exportable).

---

### d5-l2 · GitHub Pages pas à pas (la méthode des démos)

**Objectif :** publier gratuitement un site statique depuis GitHub.

**À retenir**
- Dépôt **public** → **Settings → Pages** → Source : *Deploy from a branch* (`main`, dossier `/root`) — ou
  *GitHub Actions* pour publier un sous-dossier.
- Adresse : `https://<compte>.github.io/<depot>/`. Chaque `git push` republie en 1 à 2 minutes.
- Le site vit dans un **sous-dossier** → **chemins relatifs** (`./style.css`, pas `/style.css`).
- Limites : site ≤ 1 Go, fichiers ≤ 100 Mo, pas de code serveur.

**Exercice**
- [ ] Publie ton fil rouge sur GitHub Pages
- [ ] Envoie le lien à ton téléphone par WhatsApp : l'aperçu s'affiche-t-il bien ?

**Quiz** — Pourquoi utiliser des chemins relatifs sur GitHub Pages ?
- a) C'est plus court
- b) Le site vit dans un sous-dossier (`/<depot>/`) ✅
- c) GitHub refuse les chemins absolus

*Pourquoi :* `/style.css` chercherait le fichier à la racine du domaine, pas dans le dossier du site.

**🔥 Niveau avancé :** **une seule** publication pour **toutes** tes démos : un dépôt `demos`, un dossier par démo, un
workflow GitHub Actions qui publie `sites/`, et un domaine personnalisé (`demos.tondomaine.com`). C'est exactement le
fonctionnement du dépôt de Hooked Academy (`.github/workflows/pages.yml`).

---

### d5-l3 · Vercel, Netlify, Cloudflare Pages

**Objectif :** publier un front moderne (React, Vite, Next.js) avec aperçus automatiques.

**À retenir**
- Le principe est le même partout : **New project → importer le dépôt GitHub → Deploy**. Ensuite, chaque push
  republie tout seul.
- Ils détectent le framework et règlent la commande de build (`npm run build`) et le dossier de sortie (`dist`).
- **Aperçus de branche** : chaque branche / Pull Request a sa propre adresse de test.
- Variables d'environnement à remplir dans l'interface (jamais dans le code).

| | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Point fort | Next.js | Formulaires, simplicité | Gratuit très généreux, réseau mondial |
| Gratuit pour un client ? | Non (Hobby = non commercial) | Oui, à crédits | Oui |

**Exercice**
- [ ] Crée une app avec `npm create vite@latest`, pousse-la sur GitHub, publie-la sur Netlify **ou** Cloudflare Pages
- [ ] Crée une branche, modifie un texte, ouvre l'adresse d'aperçu

**Quiz** — Où mettre la clé publique Supabase d'une app publiée sur Netlify ?
- a) Dans le README
- b) Dans les variables d'environnement du projet Netlify ✅
- c) Dans un commentaire du code

*Pourquoi :* les variables d'environnement sont injectées au build, sans les écrire dans le dépôt.

**🔥 Niveau avancé :** les variables exposées au navigateur ont un **préfixe** (`VITE_`, `NEXT_PUBLIC_`) : tout ce qui
a ce préfixe devient **public**. Jamais de clé secrète avec ce préfixe.

---

### d5-l4 · Railway (et ses alternatives) pour un serveur

**Objectif :** faire tourner un vrai serveur Node ou Python en ligne.

**À retenir**
- **Railway** : *New Project → Deploy from GitHub repo* → onglet **Variables** → *Settings → Networking →
  Generate Domain*. Ton serveur doit écouter sur `process.env.PORT`.
- Prix (nov. 2026) : essai de **5 $ offerts** (30 jours, sans carte), plan **Free** à 1 $ d'usage par mois (services
  mis en veille), plan **Hobby** à 5 $/mois avec usage inclus. **Règle une limite de dépense.**
- **Render** : *New → Web Service* ; gratuit mais le service **s'endort** après ~15 min sans visite (premier
  chargement lent), et la base Postgres gratuite est **supprimée après 30 jours**.
- Autres : Koyeb, Fly.io (plus d'offre gratuite pour les nouveaux comptes), Northflank.
- Toujours lire les **logs** (journaux) : c'est là que le serveur dit pourquoi il plante.

**Exercice**
- [ ] Demande à Claude un mini serveur Node (une route `/api/sante` qui répond `{ ok: true }`)
- [ ] Publie-le sur Railway ou Render, ouvre `/api/sante` depuis ton téléphone
- [ ] Trouve où se règle la limite de dépense et règle-la

**Quiz** — Ton serveur marche en local mais pas sur Railway. Premier réflexe ?
- a) Changer d'hébergeur
- b) Lire les logs du déploiement ✅
- c) Supprimer le projet et recommencer

*Pourquoi :* les logs indiquent l'erreur exacte (port, variable manquante, dépendance…).

**🔥 Niveau avancé :** ajoute un **Dockerfile** : ton app tourne alors à l'identique sur Railway, Render, Fly.io ou ton
propre VPS — tu n'es plus prisonnier d'un hébergeur. Ajoute une route de santé et une alerte UptimeRobot.

---

### d5-l5 · Nom de domaine et DNS

**Objectif :** relier `tonsite.com` à ton hébergement, avec HTTPS.

**À retenir**
- Acheter : **Cloudflare Registrar** (prix coûtant), **Namecheap**, **Porkbun**. Un `.dz` se demande via un
  registraire agréé par le **NIC.dz**, avec des justificatifs.
- Pour un client : le domaine est acheté **à son nom** (ou transféré à la livraison), renouvellement automatique.
- Relier : l'hébergeur te donne les enregistrements à créer — souvent un **CNAME** (`www` → `xxx.hosting.com`) et/ou
  un **A** (domaine nu → adresse IP).
- Un **sous-domaine** (`demos.tondomaine.com`) = un CNAME de plus, gratuit, illimité.
- Propagation : quelques minutes, parfois quelques heures. Puis HTTPS s'active tout seul.

**Exercice**
- [ ] Cherche 3 noms de domaine libres pour ton fil rouge (et vérifie le même nom sur Instagram)
- [ ] Si tu as un domaine : relie un sous-domaine à ton site GitHub Pages

**Quiz** — Pour pointer `demos.tondomaine.com` vers GitHub Pages, on crée…
- a) Un enregistrement MX
- b) Un enregistrement CNAME `demos` → `<compte>.github.io` ✅
- c) Un nouveau compte GitHub

*Pourquoi :* le CNAME dit « ce nom est un alias de cet autre nom ».

**🔥 Niveau avancé :** gère tous tes DNS chez **Cloudflare** (gratuit) même si le domaine est acheté ailleurs ; ajoute
**SPF**, **DKIM** et **DMARC** si le domaine envoie des e-mails, sinon ils finissent en spam.

---

### d5-l6 · 🔥 Le VPS : Docker, Caddy, Coolify (module avancé)

**Objectif :** comprendre quand et comment héberger soi-même plusieurs applications.

**À retenir**
- Un **VPS** = un ordinateur loué dans un datacenter (~5–20 $/mois), sur lequel tu fais tourner **autant d'apps que
  tu veux**.
- **Docker** emballe chaque app avec tout ce dont elle a besoin. **Caddy** gère le HTTPS automatiquement.
  **Coolify** ou **Dokploy** = un « Railway » gratuit installé sur ton VPS, avec interface.
- Tu deviens responsable : mises à jour, pare-feu (ports 22, 80, 443 seulement), sauvegardes, surveillance.
- Exemple réel : Hooked Academy et Hooked Lab tournent sur un VPS Hostinger (Docker + Caddy, mise à jour automatique
  depuis GitHub toutes les 5 minutes) — voir `DEPLOIEMENT-VPS.md`.

**Exercice**
- [ ] Lis `DEPLOIEMENT-VPS.md` et dessine le schéma : GitHub → VPS → Docker → Caddy → visiteur
- [ ] Liste ce que tu dois surveiller toi-même sur un VPS que Railway gérait pour toi

**Quiz** — Le principal avantage d'un VPS pour un freelance ?
- a) Zéro maintenance
- b) Un coût fixe pour héberger beaucoup d'apps ✅
- c) Il est toujours gratuit

*Pourquoi :* à partir de 3–4 apps avec serveur, un VPS coûte souvent moins cher que plusieurs PaaS.

**🔥 Niveau avancé :** clés SSH uniquement (mot de passe root désactivé), `ufw`, mises à jour automatiques de
sécurité, **instantanés** avant chaque grosse modification, sauvegardes de la base **hors du VPS** (ex. Cloudflare R2).

---

## D06 · Supabase : base de données, comptes, fichiers

*icône `box` · La « cuisine » de ton application, sans gérer de serveur.*

### d6-l1 · Qu'est-ce que Supabase ?

**Objectif :** comprendre ce que Supabase fait à ta place.

**À retenir**
- Supabase = **base PostgreSQL** + **Auth** (comptes) + **Storage** (fichiers) + **Realtime** (direct) +
  **Edge Functions** (petit code serveur), avec une interface claire.
- Plan gratuit : **2 projets actifs**, ~500 Mo de base par projet, et le projet **se met en pause après 7 jours sans
  activité** (on le relance depuis le tableau de bord). Plan Pro ≈ 25 $/mois, sans pause, avec sauvegardes.
- Alternatives : Firebase (Google), Appwrite, PocketBase (un seul fichier, à héberger soi-même), Neon (Postgres seul).

**Exercice**
- [ ] Crée un projet Supabase « fil-rouge » (région la plus proche de tes utilisateurs, ex. Europe)
- [ ] Note **où** sont l'URL du projet et les clés API (Project Settings → API Keys)

**Quiz** — Que se passe-t-il pour un projet gratuit inactif une semaine ?
- a) Il est supprimé
- b) Il est mis en pause et peut être relancé ✅
- c) Il devient payant

*Pourquoi :* le plan gratuit met en pause les projets inactifs ; d'où l'importance de prévenir avant une démo.

**🔥 Niveau avancé :** avant de montrer une démo branchée sur Supabase gratuit, **ouvre-la la veille** pour éviter la
pause ; pour un client réel, passe en Pro (ou héberge Postgres toi-même) dès qu'il y a des données importantes.

---

### d6-l2 · Concevoir ses tables

**Objectif :** organiser les données de ton app.

**À retenir**
- Une **table** = un tableau (comme Excel) : une ligne par élément, une colonne par information.
- Chaque table a un `id` ; les **relations** relient les tables (une réservation appartient à un client).
- Types courants : `text`, `int8`, `numeric` (prix), `boolean`, `timestamptz` (date + heure), `uuid`.
- Exemple fil rouge : `services (id, nom, prix, duree)` · `reservations (id, user_id, service_id, date, statut)`.

**Exercice**
- [ ] Écris sur papier les tables de ton fil rouge (3 tables maximum)
- [ ] Crée-les dans le **Table Editor**, ajoute 5 lignes d'exemple

**Quiz** — Pour stocker la date et l'heure d'un rendez-vous, le bon type est…
- a) `text`
- b) `timestamptz` ✅
- c) `boolean`

*Pourquoi :* un vrai type date permet de trier, filtrer et gérer les fuseaux horaires.

**🔥 Niveau avancé :** demande à Claude d'écrire le schéma en **SQL** (migrations dans `supabase/migrations/`) plutôt
que de cliquer : il est versionné dans Git et rejouable. Outil : la **Supabase CLI** (`supabase init`,
`supabase db push`).

---

### d6-l3 · Connecter le site à Supabase

**Objectif :** lire et écrire des données depuis ton front.

**À retenir**
```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(URL_DU_PROJET, CLE_PUBLISHABLE);

const { data, error } = await supabase.from('services').select('*').order('prix');
await supabase.from('reservations').insert({ service_id: 2, date: '2026-12-01T10:00:00+01:00' });
```
- Dans le navigateur : **uniquement** la clé **publishable** (`sb_publishable_…`, ancienne « anon »).
- Cette clé est publique par nature : **ce qui protège tes données, c'est la RLS** (leçon suivante).
- Toujours gérer `error` : afficher un message clair à l'utilisateur.

**Exercice**
- [ ] Affiche la liste des services de ta base sur la page du fil rouge
- [ ] Ajoute un formulaire qui enregistre une réservation, vérifie qu'elle apparaît dans le Table Editor

**Quiz** — La clé publishable est visible dans le code du site. Est-ce grave ?
- a) Oui, toujours
- b) Non, si la RLS est activée avec de bonnes règles ✅
- c) Non, jamais, quoi qu'il arrive

*Pourquoi :* la clé publique n'a que les droits que la RLS lui accorde.

**🔥 Niveau avancé :** génère les **types TypeScript** de ta base (`supabase gen types typescript`) pour que l'éditeur
te signale les fautes de colonnes, et utilise **Realtime** pour qu'une nouvelle réservation apparaisse en direct dans
le back-office.

---

### d6-l4 · Les comptes utilisateurs (Auth)

**Objectif :** permettre aux utilisateurs de créer un compte et de se connecter.

**À retenir**
- Méthodes : e-mail + mot de passe (`signUp`, `signInWithPassword`), **lien magique** (`signInWithOtp`),
  **Google** (`signInWithOAuth({ provider: 'google' })`).
- Régler les **URL de redirection** (Authentication → URL Configuration) : l'adresse de ton site en ligne **et**
  `http://localhost:…` pour les tests.
- Une table **`profiles`** (nom, téléphone, rôle) liée à `auth.users` pour les infos en plus.
- E-mails d'auth : personnaliser les modèles (français), et brancher un vrai service d'envoi (SMTP) avant la
  production.

**Exercice**
- [ ] Active l'inscription par e-mail, crée une page « Se connecter » sur le fil rouge
- [ ] Crée 2 comptes de test

**Quiz** — Le lien de confirmation renvoie vers `localhost` en production. Que régler ?
- a) Le code HTML
- b) Les URL de redirection dans Supabase Auth ✅
- c) Le DNS

*Pourquoi :* Supabase renvoie vers l'adresse configurée comme « Site URL ».

**🔥 Niveau avancé :** gère des **rôles** (client, employé, admin) dans `profiles` et utilise-les dans les règles RLS ;
pour un back-office, ajoute la **double authentification** (MFA) proposée par Supabase Auth.

---

### d6-l5 · La sécurité : Row Level Security (la leçon la plus importante)

**Objectif :** que chaque utilisateur ne voie et ne modifie que ce qui le concerne.

**À retenir**
```sql
alter table reservations enable row level security;

create policy "voir ses reservations" on reservations
  for select using ((select auth.uid()) = user_id);

create policy "creer ses reservations" on reservations
  for insert with check ((select auth.uid()) = user_id);
```
- **RLS activée sur chaque table**, sans exception. Supabase signale les tables non protégées (Security Advisor).
- RLS activée **sans règle** = personne ne peut rien lire (c'est sûr, mais l'app paraît vide : il faut écrire les
  règles).
- La clé **secrète** (`sb_secret_…`, ancienne « service_role ») **ignore la RLS** : uniquement côté serveur.

**Exercice**
- [ ] Active la RLS sur toutes tes tables et écris les règles du fil rouge
- [ ] Connecte-toi avec le compte A, puis le compte B : B ne doit **pas** voir les réservations de A

**Quiz** — Que se passe-t-il si une table n'a pas de RLS ?
- a) Rien de grave
- b) N'importe qui avec la clé publique peut la lire, voire la modifier ✅
- c) Supabase bloque automatiquement le site

*Pourquoi :* sans RLS, la clé publique donne accès à toute la table.

**🔥 Niveau avancé :** colonne `user_id uuid default auth.uid() references auth.users` (rempli automatiquement),
règles séparées pour `select` / `insert` / `update` / `delete`, et demande à Claude un **audit RLS** de toutes les
tables avant chaque mise en production.

---

### d6-l6 · Fichiers, Edge Functions et Claude branché sur Supabase

**Objectif :** compléter l'app : images, code serveur, et piloter Supabase avec Claude.

**À retenir**
- **Storage** : un *bucket* public (photos du site) ou privé (documents clients), avec des règles comme la RLS.
- **Edge Functions** : du code qui tourne chez Supabase avec tes **secrets** (paiement, envoi d'e-mail, appel à une
  API d'IA). Le front appelle la fonction ; la clé reste cachée.
- **Serveur MCP Supabase** : Claude lit ton schéma, écrit les tables, les règles et les migrations.
  ```bash
  claude mcp add --transport http supabase https://mcp.supabase.com/mcp
  ```
  puis `/mcp` dans Claude Code pour te connecter.

**Exercice**
- [ ] Crée un bucket `photos` public, envoie 3 images, affiche-les sur le site
- [ ] Branche le MCP Supabase et demande à Claude : « Liste mes tables et vérifie que la RLS est activée partout »

**Quiz** — Où appeler une API payante qui demande une clé secrète ?
- a) Dans le JavaScript du site
- b) Dans une Edge Function avec la clé en secret ✅
- c) Dans le HTML

*Pourquoi :* la fonction tourne côté serveur ; la clé n'est jamais envoyée au navigateur.

**🔥 Niveau avancé :** connecte le MCP Supabase en **lecture seule** et sur **un seul projet** quand tu travailles sur
des données réelles, et utilise les **branches** Supabase (ou un projet de test) pour ne jamais expérimenter sur la
base du client.

---

## D07 · Construire une vraie application

*icône `cube` · Du besoin du client à l'app en ligne : générateurs, Claude Code, paiement, e-mails, mobile.*

### d7-l1 · Du besoin à la fiche produit

**Objectif :** transformer une demande floue en plan clair.

**À retenir**
- La fiche produit (PRD) tient sur une page : **utilisateurs** (qui ?), **problème** (quoi ?), **fonctionnalités du
  MVP** (le minimum utile), **écrans**, **données**, **hors périmètre** (ce qu'on ne fait **pas** maintenant).
- Le **MVP** : la plus petite version qui rend service. On ajoute après, quand le client l'utilise.
- Faire valider la fiche **par écrit** avant de construire : c'est aussi la base du devis.

**Exercice**
- [ ] Écris la fiche produit de l'app de ton fil rouge (réservation, commande ou fidélité)
- [ ] Coupe-la en MVP (version 1) et version 2

**Quiz** — Le MVP, c'est…
- a) L'app avec toutes les fonctionnalités possibles
- b) La plus petite version qui rend vraiment service ✅
- c) Une maquette sans code

*Pourquoi :* livrer petit et vite permet d'apprendre du vrai usage.

**🔥 Niveau avancé :** ajoute les **user stories** (« En tant que client, je veux… afin de… ») et des critères
d'acceptation : Claude Code peut s'en servir directement comme plan et comme liste de tests.

---

### d7-l2 · La voie rapide : générateur d'app + Supabase

**Objectif :** une app fonctionnelle en une après-midi.

**À retenir**
- **Lovable** et **Bolt** savent se brancher à Supabase et créer tables, comptes et pages.
- Méthode : coller la fiche produit → générer → tester chaque écran → corriger par petites demandes.
- **Synchroniser avec GitHub** dès le début : le code t'appartient et tu peux le reprendre ailleurs.
- Limites : crédits, code parfois brouillon, sécurité à **vérifier** (RLS !).

**Exercice**
- [ ] Génère le MVP du fil rouge dans un générateur, relié à Supabase et à GitHub
- [ ] Vérifie la RLS de chaque table créée par l'outil

**Quiz** — Pourquoi relier le générateur à GitHub ?
- a) Pour avoir plus de crédits
- b) Pour posséder le code et pouvoir le reprendre avec d'autres outils ✅
- c) Ce n'est pas utile

*Pourquoi :* sans GitHub, ton projet est enfermé dans l'outil.

**🔥 Niveau avancé :** reprends le dépôt dans **Claude Code** et demande une **revue** : sécurité, RLS, code mort,
performances, accessibilité (`/code-review`). C'est souvent là qu'on trouve les vrais problèmes.

---

### d7-l3 · La voie pro : Claude Code de A à Z

**Objectif :** construire une app propre et maintenable.

**À retenir**
- Démarrer : `npm create vite@latest` (React + TypeScript) ou Next.js, puis **Tailwind** et **shadcn/ui**.
- Écrire `CLAUDE.md` **avant** de coder : pile technique, structure des dossiers, règles de sécurité, commandes.
- Travailler **écran par écran**, en mode plan, avec un commit à chaque étape.
- Demander des **tests** pour la logique importante (calcul de prix, disponibilités).

**Exercice**
- [ ] Recrée le MVP du fil rouge avec Claude Code, écran par écran
- [ ] Compare avec la version du générateur : lisibilité du code, vitesse, design

**Quiz** — Que mettre dans `CLAUDE.md` avant de coder une app ?
- a) Le mot de passe de la base
- b) La pile technique, la structure, les règles et les commandes ✅
- c) Rien, Claude devine

*Pourquoi :* Claude suit ces règles à chaque session ; tu évites de les répéter.

**🔥 Niveau avancé :** utilise des **sous-agents** (`/agents`) pour les tâches spécialisées (relecteur sécurité,
testeur), des **hooks** pour lancer automatiquement le formatage ou les tests après chaque modification, et plusieurs
sessions en parallèle sur des branches différentes.

---

### d7-l4 · Encaisser : paiements en Algérie et à l'international

**Objectif :** savoir comment faire payer, selon le pays du client.

**À retenir**
- **En Algérie :** **Chargily Pay** (cartes **CIB** et **Edahabia**), avec un mode test et des bibliothèques
  (JavaScript, PHP, Python…). Le paiement à la livraison et la commande WhatsApp restent très courants : prévois-les.
- **À l'international :** Stripe, Lemon Squeezy, Paddle — disponibles selon le **pays de l'entreprise** qui encaisse.
- Le principe est toujours le même : le **serveur** (Edge Function) crée le paiement avec la clé secrète, le client
  paie sur la page sécurisée, un **webhook** confirme le paiement à ton serveur.
- **Jamais** de validation de paiement uniquement côté navigateur.

**Exercice**
- [ ] Crée un compte en mode test chez Chargily Pay (ou Stripe), lis la page « checkout » de la doc
- [ ] Ajoute au fil rouge un bouton « Payer l'acompte » en **mode test**

**Quiz** — Qui doit confirmer qu'un paiement a réussi ?
- a) Le navigateur du client
- b) Le serveur, via le webhook du prestataire ✅
- c) Le client, par WhatsApp

*Pourquoi :* le navigateur peut être trafiqué ; le webhook vient directement du prestataire.

**🔥 Niveau avancé :** vérifie la **signature** de chaque webhook, rends le traitement **idempotent** (un même
paiement reçu deux fois n'est enregistré qu'une fois), et garde un journal des paiements dans une table dédiée.

---

### d7-l5 · Formulaires, e-mails et statistiques

**Objectif :** les petites briques qui font une app professionnelle.

**À retenir**
- **Formulaires sans serveur** pour un site statique : Tally, Formspree, Web3Forms.
- **E-mails automatiques** (confirmation, rappel) : Resend, Brevo — avec SPF/DKIM sur le domaine.
- **Statistiques** respectueuses : Plausible, Umami ; **Microsoft Clarity** (gratuit) pour voir les clics et les
  enregistrements de sessions ; Google Analytics si le client y tient.
- **Google Search Console** pour suivre le référencement.

**Exercice**
- [ ] Ajoute un formulaire de contact qui t'envoie vraiment un e-mail
- [ ] Installe un outil de statistiques sur le fil rouge et vérifie ta propre visite

**Quiz** — Tes e-mails automatiques arrivent en spam. Que vérifier en premier ?
- a) La couleur du bouton
- b) Les enregistrements SPF et DKIM du domaine ✅
- c) La taille du logo

*Pourquoi :* sans authentification du domaine, les boîtes mail se méfient.

**🔥 Niveau avancé :** envoie un **rappel automatique** la veille d'un rendez-vous (tâche planifiée : Supabase cron
ou GitHub Actions planifié) et un **lien WhatsApp** pré-rempli dans l'e-mail.

---

### d7-l6 · PWA et applications mobiles

**Objectif :** savoir proposer « une app » au bon prix.

**À retenir**
- **PWA** : ton app web + `manifest.webmanifest` (nom, icônes, couleurs) + **service worker** (hors connexion) +
  HTTPS → « Ajouter à l'écran d'accueil ». Aucune validation de store, aucun frais.
- **Expo (React Native)** : vraie app iOS/Android ; tester sur ton téléphone avec **Expo Go**
  (`npx create-expo-app@latest`) ; compiler pour les stores avec **EAS**.
- **Capacitor** : emballer une app web existante dans une app native.
- Coûts des stores : **Apple 99 $/an**, **Google Play 25 $ une fois** ; délais de validation à prévoir.

**Exercice**
- [ ] Transforme le fil rouge en PWA (manifest + icônes + service worker) et installe-le sur ton téléphone

**Quiz** — Le moyen le plus rapide et le moins cher d'avoir « une app » installable ?
- a) Une app native sur l'App Store
- b) Une PWA ✅
- c) Une app Windows

*Pourquoi :* une PWA s'installe depuis le navigateur, sans store ni frais.

**🔥 Niveau avancé :** notifications **push** web (supportées sur iPhone pour les PWA ajoutées à l'écran d'accueil),
mise à jour du service worker sans bloquer l'utilisateur, et `offline.html` pour une page hors connexion propre.

---

## D08 · Motion design pour le web

*icône `wand` · Des animations qui servent le message, fluides sur téléphone.*

### d8-l1 · Les principes d'une bonne animation

**Objectif :** animer avec intention, pas pour décorer.

**À retenir**
- **Une animation = une intention** : guider le regard, confirmer une action, raconter une étape.
- **Durées** : 150–300 ms pour une interface (survol, ouverture), 400–800 ms pour une apparition de section.
- **Easing** : `ease-out` pour ce qui entre, `ease-in` pour ce qui sort ; jamais `linear` pour un mouvement.
- **Performance** : animer **`transform`** et **`opacity`** uniquement (fluide même sur un téléphone d'entrée de
  gamme).
- **Accessibilité** : respecter `prefers-reduced-motion`.

**Exercice**
- [ ] Sur Awwwards ou Godly, trouve 3 sites animés et décris l'**intention** de chaque animation
- [ ] Liste les animations utiles pour ton fil rouge (3 maximum)

**Quiz** — Quelles propriétés animer pour rester fluide sur mobile ?
- a) `width` et `top`
- b) `transform` et `opacity` ✅
- c) `margin` et `height`

*Pourquoi :* elles sont calculées par la carte graphique, sans recalculer toute la page.

**🔥 Niveau avancé :** étudie les **12 principes de l'animation** (anticipation, chevauchement, ralenti…) et
applique-les à l'interface : un bouton qui « s'écrase » légèrement au clic paraît beaucoup plus vivant.

---

### d8-l2 · Animer en CSS (sans librairie)

**Objectif :** couvrir 70 % des besoins avec du CSS pur.

**À retenir**
```css
@media (prefers-reduced-motion: no-preference) {
  .apparait {
    animation: monte linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}
@keyframes monte { from { opacity: 0; transform: translateY(40px); } }
```
- `transition` pour les survols, `@keyframes` pour les boucles, **animations au défilement** (`animation-timeline`)
  sans JavaScript, **View Transitions** pour des changements de page fluides.
- Vérifier la compatibilité sur **caniuse.com** et prévoir un rendu correct sans l'animation.

**Exercice**
- [ ] Ajoute au fil rouge : survol des boutons + apparition des sections au défilement, en CSS uniquement

**Quiz** — Pourquoi mettre l'animation dans `@media (prefers-reduced-motion: no-preference)` ?
- a) Pour qu'elle soit plus rapide
- b) Pour ne l'activer que chez ceux qui n'ont pas demandé moins d'animations ✅
- c) C'est obligatoire en CSS

*Pourquoi :* on respecte le réglage d'accessibilité du visiteur.

**🔥 Niveau avancé :** combine les **View Transitions** entre pages d'un site statique (`@view-transition { navigation: auto; }`)
pour un effet « app » sans framework.

---

### d8-l3 · GSAP, ScrollTrigger et Lenis

**Objectif :** des animations au défilement de niveau agence.

**À retenir**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script>
  gsap.registerPlugin(ScrollTrigger);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.utils.toArray('.apparait').forEach((el) =>
      gsap.from(el, { y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' } }));
  }
</script>
```
- **GSAP** est gratuit, **plugins compris** (ScrollTrigger, SplitText, MorphSVG…).
- **Lenis** = défilement doux ; à combiner avec ScrollTrigger.
- **Toujours fixer la version** dans l'adresse du CDN (`gsap@3.15.0`).

**Exercice**
- [ ] Ajoute au fil rouge : titre du hero qui apparaît mot par mot (SplitText) + une section « épinglée » au défilement

**Quiz** — Pourquoi écrire `gsap@3.15.0` et pas `gsap@latest` ?
- a) C'est plus court
- b) Une nouvelle version ne peut pas casser le site sans prévenir ✅
- c) `latest` est payant

*Pourquoi :* une version fixée = un site qui se comporte toujours pareil.

**🔥 Niveau avancé :** `gsap.matchMedia()` pour des animations différentes sur mobile et ordinateur (et coupées en
mouvement réduit), **timelines** pour orchestrer une séquence, et `scrub` pour lier l'animation au doigt.

---

### d8-l4 · Lottie, Rive, Spline, Three.js

**Objectif :** connaître les outils pour aller plus loin que le CSS et GSAP.

**À retenir**

| Outil | Pour | Niveau |
|---|---|---|
| **Lottie** (LottieFiles) | Animations dessinées légères (icônes, illustrations) | Débutant |
| **Rive** | Animations **interactives** (boutons, mascottes qui réagissent) | Intermédiaire |
| **Spline** | Scènes **3D** sans code, intégrables en une ligne | Débutant |
| **Unicorn Studio** | Effets WebGL (dégradés, distorsions) sans code | Débutant |
| **Three.js** / **React Three Fiber** | 3D en code, configurateurs produits | Avancé |
| **Motion** (ex-Framer Motion) | Animations dans les apps React | Intermédiaire |

- La 3D est **lourde** : la réserver aux moments clés, prévoir une image de remplacement sur mobile.

**Exercice**
- [ ] Ajoute une animation Lottie (bibliothèque gratuite de LottieFiles) dans une section du fil rouge
- [ ] Teste le poids de la page avant / après dans l'onglet Network

**Quiz** — Pour une mascotte qui réagit au survol et au clic, l'outil le plus adapté est…
- a) Lottie
- b) Rive ✅
- c) Une vidéo MP4

*Pourquoi :* Rive gère des **états** et des interactions ; Lottie joue une animation.

**🔥 Niveau avancé :** charge la 3D **à la demande** (quand la section approche de l'écran) avec `IntersectionObserver`,
et limite la résolution du rendu sur mobile (`renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`).

---

### d8-l5 · La vidéo générée par le code

**Objectif :** produire des vidéos de démo et de réseaux sociaux à partir de code.

**À retenir**
- **Remotion** : des vidéos écrites en React, exportées en MP4 (gratuit pour les particuliers et les entreprises
  jusqu'à 3 personnes, licence payante au-delà).
- **HyperFrames** (HeyGen) : des vidéos en HTML, rendues en MP4.
- Les leçons animées de Hooked Academy sont elles-mêmes des scènes en HTML/JS rendues en vidéo
  (`tools/hooked-academy/`).
- Pour une démo client : enregistrer l'écran (Loom, Screen Studio, Cap) reste le plus rapide.

**Exercice**
- [ ] Enregistre une vidéo de 30 s de ton fil rouge sur téléphone (défilement + clic sur WhatsApp) pour Instagram

**Quiz** — L'intérêt d'une vidéo générée par le code ?
- a) Elle est toujours plus belle
- b) On peut en produire des dizaines de variantes automatiquement (prix, langues, produits) ✅
- c) Elle ne prend pas de place

*Pourquoi :* les données changent, le modèle de vidéo reste ; idéal pour les catalogues et les publicités.

**🔥 Niveau avancé :** génère une vidéo par produit à partir d'un fichier JSON (Remotion + données Supabase) ; c'est un
service que tu peux vendre aux boutiques en ligne.

---

### d8-l6 · S'inspirer sans copier

**Objectif :** trouver des idées et rester honnête.

**À retenir**
- Inspiration : **Awwwards**, **Godly**, **Codrops** (tutoriels d'effets avec le code), **CodePen**, **Dribbble**,
  **Mobbin** (écrans d'apps), **Land-book**, **Lapa Ninja**.
- **S'inspirer** d'un rythme, d'une idée d'animation, d'une mise en page : oui. **Copier** un design, un logo, des
  textes ou des images : non (droits d'auteur, et le client mérite son identité).
- Toujours vérifier la **licence** des polices, images, animations et extraits de code.

**Exercice**
- [ ] Crée un tableau d'inspiration (10 captures) pour le fil rouge, et écris pour chacune **ce que tu retiens**
      (pas « je copie ça »)

**Quiz** — Tu trouves un superbe site sur Awwwards. Tu peux…
- a) Copier son code et ses images pour ton client
- b) T'inspirer de son rythme et de ses idées, avec tes propres contenus ✅
- c) Changer juste le logo

*Pourquoi :* l'inspiration est libre, la copie ne l'est pas.

**🔥 Niveau avancé :** recrée un effet de Codrops **de zéro** avec Claude (sans regarder le code), puis compare : c'est
le meilleur exercice pour progresser en motion.

---

# PARTIE 3 — PASSER PRO

## D09 · Booster Claude : CLAUDE.md, skills, plugins, MCP

*icône `spark` · Faire de Claude un assistant qui connaît ta méthode, tes outils et tes clients.*

### d9-l1 · CLAUDE.md : la mémoire de chaque projet

**Objectif :** ne plus jamais répéter les mêmes consignes.

**À retenir**
- `CLAUDE.md` à la racine du projet : Claude le lit au début de chaque session.
- Y mettre : **ce qu'est le projet**, la **pile technique**, les **commandes** (lancer, tester, publier), les **règles**
  (sécurité, style, langue), ce qu'il ne faut **jamais** faire.
- Court et concret : des règles vérifiables, pas des romans.
- `~/.claude/CLAUDE.md` = tes règles **personnelles** pour tous les projets.

**Exercice**
- [ ] Lis le `CLAUDE.md` de ce dépôt et repère : règles, commandes, structure
- [ ] Écris celui du fil rouge à partir du modèle `modeles/CLAUDE-modele.md`

**Quiz** — Où mettre une règle qui vaut pour **tous** tes projets ?
- a) Dans chaque fichier HTML
- b) Dans `~/.claude/CLAUDE.md` ✅
- c) Dans le README du client

*Pourquoi :* le fichier personnel s'applique à toutes tes sessions.

**🔥 Niveau avancé :** quand Claude fait deux fois la même erreur, ajoute **une ligne** dans `CLAUDE.md` pour qu'elle ne
revienne jamais. Ton `CLAUDE.md` devient la somme de ton expérience.

---

### d9-l2 · Les skills : apprendre une méthode à Claude

**Objectif :** créer et installer tes propres skills.

**À retenir**
- Un skill = un dossier avec **`SKILL.md`** (+ scripts, modèles, exemples).
- En-tête obligatoire :
  ```markdown
  ---
  name: nouvelle-demo
  description: Crée une démo de site pour un prospect. À utiliser quand on demande une démo, une maquette en ligne ou un site exemple.
  ---
  ```
- Claude lit les **descriptions** de tous les skills et charge le bon **tout seul** ; tu peux aussi taper
  `/nouvelle-demo`.
- Emplacements : `~/.claude/skills/<nom>/` (perso), `.claude/skills/<nom>/` (projet, partagé via Git).
- **claude.ai** : Paramètres → Capacités (activer l'exécution de code) → **Customize → Skills** → `+` → *Upload a
  skill* (dossier en **ZIP**). Les skills de claude.ai se retrouvent dans Claude Code avec le même compte.
- Garder `SKILL.md` court (< 500 lignes) ; les longs documents dans des fichiers à côté.

**Exercice**
- [ ] Copie `modeles/skills/nouvelle-demo/` dans `~/.claude/skills/`, adapte-le, teste avec `/nouvelle-demo`
- [ ] Écris ton propre skill pour une tâche que tu répètes (ex. « audit Lighthouse + corrections »)

**Quiz** — Comment Claude sait-il qu'il doit utiliser un skill ?
- a) Il les charge tous à chaque message
- b) Grâce à la `description` du skill, qui dit quand l'utiliser ✅
- c) Il faut toujours taper son nom

*Pourquoi :* la description est le déclencheur ; elle doit dire **quoi** et **quand**.

**🔥 Niveau avancé :** `disable-model-invocation: true` pour un skill qui ne doit se lancer qu'à la main (publication,
envoi), `allowed-tools` pour pré-autoriser certaines commandes, des **scripts** dans le dossier du skill pour les
tâches mécaniques. Inspiration : le dépôt **anthropics/skills**.

---

### d9-l3 · Les plugins : installer des super-pouvoirs

**Objectif :** trouver, installer et gérer des plugins en sécurité.

**À retenir**
- Un plugin = un paquet de **skills, agents, hooks et serveurs MCP**, installé en une commande.
- Le marketplace officiel **`claude-plugins-official`** est déjà là :
  ```
  /plugin                                           → parcourir et installer
  /plugin install <plugin>@claude-plugins-official  → installer directement
  /plugin marketplace add <compte>/<depot>          → ajouter un autre catalogue
  ```
- À l'installation, choisir la **portée** : toi seul (user), tout le projet (project, partagé), ce dépôt seulement
  (local).
- Gérer : onglet *Installed* de `/plugin`, ou `claude plugin list / disable / uninstall`. Puis `/reload-plugins`.
- **Sécurité** : un plugin peut exécuter du code. Installer seulement depuis des sources de confiance, lire le détail.

**Exercice**
- [ ] Ouvre `/plugin`, parcours le catalogue officiel, installe un plugin utile (ex. revue de code, commits)
- [ ] Utilise-le sur le fil rouge, puis désactive-le et réactive-le

**Quiz** — Avant d'installer un plugin d'un inconnu, tu…
- a) L'installes, c'est sans risque
- b) Lis ce qu'il contient (hooks, serveurs MCP) et vérifies la source ✅
- c) Désactives ton antivirus

*Pourquoi :* un plugin peut lancer du code sur ta machine.

**🔥 Niveau avancé :** crée **ton propre marketplace** (un dépôt GitHub avec `.claude-plugin/marketplace.json`) pour
distribuer tes skills à tes élèves ou à ton équipe en une commande.

---

### d9-l4 · MCP et connecteurs : brancher Claude sur tes outils

**Objectif :** que Claude puisse agir sur Supabase, GitHub, Figma, un navigateur…

**À retenir**
- **MCP** = une prise universelle entre Claude et un service.
- Ajouter un serveur :
  ```bash
  claude mcp add --transport http <nom> <url>          # distant (ex. Supabase, Notion)
  claude mcp add <nom> -- npx -y <paquet>              # local (ex. Playwright)
  ```
  `--scope project` pour le partager via `.mcp.json` ; `/mcp` pour se connecter ; `claude mcp list` pour vérifier.
- Utiles pour le web : **Supabase**, **GitHub**, **Playwright** (navigateur), **Figma**, **Context7** (doc à jour des
  librairies).
- Dans **claude.ai** : les **Connecteurs** (annuaire sur claude.ai/directory).

**Exercice**
- [ ] Ajoute Playwright : `claude mcp add playwright -- npx @playwright/mcp@latest`
- [ ] Demande à Claude d'ouvrir ton fil rouge en ligne, de tester le formulaire et de te faire un rapport

**Quiz** — À quoi sert `--scope project` ?
- a) À rendre le serveur payant
- b) À partager le serveur MCP avec l'équipe via `.mcp.json` dans le dépôt ✅
- c) À le cacher

*Pourquoi :* le fichier `.mcp.json` est versionné ; chacun l'a en clonant le projet.

**🔥 Niveau avancé :** donne aux serveurs MCP le **minimum de droits** (lecture seule, un seul projet), jamais de jeton
écrit en clair dans `.mcp.json` (variables `${VAR}`), et retire ceux que tu n'utilises plus.

---

### d9-l5 · Les workflows avancés

**Objectif :** travailler comme une petite équipe avec Claude.

**À retenir**
- **Sous-agents** (`/agents`) : des assistants spécialisés (relecteur, testeur) avec leur propre contexte.
- **Hooks** (`/hooks`) : des actions automatiques (formater après chaque modification, bloquer l'écriture d'un
  fichier `.env`).
- **Sessions parallèles** : plusieurs tâches indépendantes en même temps, sur des branches différentes.
- **Claude Code sur le web** (claude.ai/code) : lancer une tâche depuis le téléphone, Claude ouvre une Pull Request.
- **Mode sans interface** : `claude -p "…"` dans un script ou GitHub Actions.

**Exercice**
- [ ] Crée un sous-agent « relecteur sécurité » et fais-lui relire ton fil rouge
- [ ] Lance une tâche depuis claude.ai/code sur ton téléphone, relis la Pull Request

**Quiz** — Un hook sert à…
- a) Écrire un meilleur prompt
- b) Déclencher automatiquement une action à un moment précis (avant / après une modification…) ✅
- c) Installer un thème

*Pourquoi :* les hooks rendent certaines règles **automatiques**, sans compter sur la mémoire de l'IA.

**🔥 Niveau avancé :** un hook qui lance les tests après chaque modification + un sous-agent relecteur avant chaque
commit = une qualité constante, même sur les projets bouclés à minuit.

---

## D10 · Proposer des démos sans perdre d'argent

*icône `handshake` · La démo qui fait signer, pour 0 € par mois.*

### d10-l1 · La stratégie de la démo

**Objectif :** montrer au prospect **son** site avant qu'il paie.

**À retenir**
- Le prospect n'achète pas « un site » : il achète **ce qu'il voit avec son nom dessus**.
- La démo utilise ses **vraies infos publiques** (nom, adresse, services, prix affichés) + des contenus **d'exemple
  présentés comme tels**.
- **Jamais** de faux avis, de faux chiffres, de faux logos de clients : la confiance est ton capital.
- Lien **privé** pour le prospect ; galerie **publique** (avec accord) pour LinkedIn et ton portfolio.

**Exercice**
- [ ] Liste 10 commerces de ta ville sans site (ou avec un site daté) : nom, contact, ce qu'ils vendent
- [ ] Choisis-en 1 pour ta première démo (ce peut être ton fil rouge)

**Quiz** — Dans une démo, peut-on écrire « 500 clients satisfaits » pour faire joli ?
- a) Oui, c'est une démo
- b) Non : jamais de faux chiffres ; on met un exemple clairement présenté comme tel ✅
- c) Oui, si le client ne regarde pas

*Pourquoi :* un faux chiffre découvert = un prospect perdu et une réputation abîmée.

**🔥 Niveau avancé :** fais une **analyse SEO** gratuite de son site actuel (Lighthouse, Search Console publique,
concurrents) et joins-la à la démo : tu arrives avec un diagnostic, pas seulement une maquette.

---

### d10-l2 · Le système à 0 €/mois

**Objectif :** publier des dizaines de démos sans payer d'hébergement.

**À retenir**
1. **Un dépôt public** `demos` sur GitHub + **GitHub Pages** (publication par GitHub Actions).
2. **Un domaine** à toi + un **sous-domaine** `demos.tondomaine.com` (un CNAME).
3. **Un dossier par démo** : `sites/<slug>/` → `https://demos.tondomaine.com/<slug>/`.
4. Un fichier `demos.json` qui liste les démos (titre, secteur, ville, public ou privé) et une page d'accueil
   galerie.
5. Une page `404.html` propre pour les liens cassés.
- Coût : le domaine (~10–15 $/an). Tout le reste est gratuit.
- Attention : dépôt **public** = code lisible par tous → aucune clé, aucune donnée réelle de client.

**Exercice**
- [ ] Monte ton propre système de démos (dépôt, Pages, sous-domaine) et publie ta première démo

**Quiz** — Que ne faut-il jamais mettre dans le dépôt public des démos ?
- a) Des images WebP
- b) Des clés d'API et des données réelles de clients ✅
- c) Un fichier `demos.json`

*Pourquoi :* tout le monde peut lire un dépôt public.

**🔥 Niveau avancé :** transforme la création d'une démo en **skill** (`modeles/skills/nouvelle-demo/`) : un message
(« démo pour le salon X à Oran ») → dossier créé, page construite, entrée ajoutée, publié.

---

### d10-l3 · Une démo « app » sans serveur

**Objectif :** montrer une application complète qui ne coûte rien à faire tourner.

**À retenir**
- Tout tourne **dans le navigateur** : données d'exemple dans un fichier JS, modifications enregistrées dans
  **`localStorage`** (chaque visiteur a sa propre copie).
- Les **paiements**, **e-mails** et **synchronisations** sont **simulés** (et affichés comme tels : « paiement simulé »).
- Un **espace admin** dans la démo (produits, commandes) impressionne beaucoup les commerçants.
- Après signature : on remplace le `localStorage` par Supabase ou un vrai serveur, **sans refaire l'interface**.

**Exercice**
- [ ] Ajoute à ta démo un mini espace admin qui modifie les prix (enregistrés dans `localStorage`)
- [ ] Ajoute un bouton « Réinitialiser la démo »

**Quiz** — Pourquoi `localStorage` est parfait pour une démo ?
- a) Il partage les données entre tous les visiteurs
- b) Chaque visiteur a sa copie, sans serveur ni coût ✅
- c) Il est plus sûr qu'une base de données

*Pourquoi :* zéro serveur, zéro facture, et un prospect ne voit pas les essais d'un autre.

**🔥 Niveau avancé :** sépare la **couche de données** (un fichier `store.js` avec des fonctions `lister()`,
`enregistrer()`) de l'interface : le jour de la signature, tu réécris seulement ce fichier pour parler à Supabase.

---

### d10-l4 · Le budget : ce qui est gratuit, ce qui coûte

**Objectif :** ne jamais être surpris par une facture.

**À retenir**

| Poste | Démo | Client signé |
|---|---|---|
| Hébergement | 0 € (GitHub Pages) | Au nom du client, refacturé ou payé par lui |
| Domaine | Ton sous-domaine | Acheté au nom du client |
| Base de données | Aucune | Supabase gratuit → Pro quand ça compte |
| Serveur | Aucun | Railway / Render / VPS |
| Outils IA | Ton abonnement Claude | Inclus dans ton prix |

- **Garde-fous** : limites de dépense (Railway), plafonds (Supabase), alertes de facturation, une carte dédiée,
  nettoyage mensuel des projets de test.
- Le vrai coût, c'est **ton temps** : modèles, skills et composants réutilisables le divisent par 3.

**Exercice**
- [ ] Fais le tableau de tes abonnements actuels (outil, prix, utilité réelle) et supprime ce qui ne sert pas
- [ ] Règle une alerte ou une limite de dépense sur chaque service qui en propose

**Quiz** — Qui doit posséder le compte d'hébergement d'un client ?
- a) Toi, pour garder le contrôle
- b) Le client (tu y es invité comme collaborateur) ✅
- c) Personne

*Pourquoi :* s'il part ou si tu arrêtes, son site ne disparaît pas ; et tu n'avances pas ses factures.

**🔥 Niveau avancé :** propose une **offre de maintenance** mensuelle qui inclut l'hébergement : tu gères les comptes
(au nom du client), tu factures un forfait fixe, tu as un revenu récurrent.

---

### d10-l5 · Présenter la démo et suivre le prospect

**Objectif :** transformer un lien en rendez-vous, puis en devis.

**À retenir**
- Envoyer : **une vidéo de 30–60 s** (écran du téléphone) + le lien + une phrase sur **son** bénéfice.
- Vérifier l'**aperçu WhatsApp / LinkedIn** avant d'envoyer (image, titre, description).
- **Relancer** une fois après 3 jours, une fois après 7 jours ; puis arrêter poliment.
- En rendez-vous : montrer sur **son** téléphone, laisser **toucher**, noter ses demandes.
- Préparer **3 offres** (vitrine / vitrine + admin / application) pour qu'il choisisse plutôt que d'hésiter.

**Exercice**
- [ ] Écris ton message d'envoi (WhatsApp) et ta relance
- [ ] Enregistre la vidéo de ta démo et envoie-la à 3 prospects

**Quiz** — Quel est le meilleur support pour envoyer une démo à un commerçant ?
- a) Un long e-mail technique
- b) Une courte vidéo + le lien + son bénéfice en une phrase ✅
- c) Le code source en pièce jointe

*Pourquoi :* il comprend en 30 secondes, sur son téléphone, entre deux clients.

**🔥 Niveau avancé :** ajoute des statistiques (Plausible, Clarity) sur la démo : tu sais **s'il l'a ouverte**, combien
de temps, et sur quelle section — le meilleur moment pour l'appeler.

---

### d10-l6 · De la démo au projet signé

**Objectif :** cadrer le projet pour être payé et livrer sereinement.

**À retenir**
- **Devis** basé sur la fiche produit (périmètre clair, ce qui est **hors** périmètre, nombre de retours inclus).
- **Acompte** avant de commencer (souvent 30 à 50 %).
- **Contenus** du client demandés tout de suite (logo, photos, textes) avec une date limite.
- **Livraison** : comptes au nom du client, guide d'utilisation, formation de 30 min, période de garantie.
- **Après** : maintenance, évolutions, demande d'avis **réel** et de recommandation.

**Exercice**
- [ ] Rédige ton modèle de devis (3 offres) et ta liste de livraison (`modeles/checklist-livraison.md`)

**Quiz** — Pourquoi écrire ce qui est « hors périmètre » dans le devis ?
- a) Pour faire plus long
- b) Pour éviter les demandes illimitées non payées ✅
- c) C'est une obligation légale

*Pourquoi :* ce qui n'est pas écrit sera demandé « gratuitement ».

**🔥 Niveau avancé :** facture les **évolutions** séparément (au forfait ou au temps), et garde un **journal des
demandes** du client : il justifie chaque facture et nourrit la V2.

---

## D11 · Livrer pro : sécurité, qualité, légal, maintenance

*icône `shield` · Ce qui sépare un bricoleur d'un professionnel.*

### d11-l1 · La check-list sécurité

**Objectif :** ne pas livrer de faille évidente.

**À retenir**
- **Secrets** : `.env` ignoré, variables d'environnement chez l'hébergeur, rien dans le front.
- **Supabase** : RLS partout, clé secrète uniquement côté serveur, Storage privé pour les documents.
- **Comptes** : 2FA sur GitHub, hébergeur, registraire, Supabase ; mots de passe uniques.
- **Dépendances** : `npm audit`, mises à jour régulières ; versions fixées sur les CDN.
- **Navigateur** : HTTPS, `Content-Security-Policy`, aucune donnée sensible dans `localStorage`.
- **Formulaires** : valider **côté serveur**, limiter les envois (anti-spam).

**Exercice**
- [ ] Passe la check-list sur ton fil rouge et corrige chaque point
- [ ] Demande à Claude une **revue de sécurité** du projet et traite les remarques

**Quiz** — Où valider les données d'un formulaire en priorité ?
- a) Seulement dans le navigateur
- b) Côté serveur (le navigateur peut être contourné) ✅
- c) Nulle part

*Pourquoi :* n'importe qui peut envoyer des données sans passer par ton formulaire.

**🔥 Niveau avancé :** utilise la commande `/security-review` de Claude Code avant chaque mise en production et active
Dependabot sur GitHub pour être prévenu des failles dans tes dépendances.

---

### d11-l2 · Tester avant de livrer

**Objectif :** livrer sans surprise.

**À retenir**
- **Test manuel** (check-list) : chaque page, chaque bouton, chaque formulaire, sur téléphone **et** ordinateur,
  Chrome **et** Safari.
- **Tests automatiques** : demander à Claude des tests **Playwright** pour les parcours clés (réserver, payer, se
  connecter).
- **Tester avec un vrai utilisateur** : donne le téléphone à quelqu'un et regarde-le, sans l'aider.

**Exercice**
- [ ] Écris la check-list de test du fil rouge (15 points)
- [ ] Fais tester ton app par une personne non technique et note où elle bloque

**Quiz** — Le test le plus révélateur ?
- a) Relire son propre code
- b) Regarder une vraie personne utiliser l'app sans l'aider ✅
- c) Demander à l'IA si tout va bien

*Pourquoi :* tu vois immédiatement ce qui n'est pas clair.

**🔥 Niveau avancé :** lance les tests Playwright automatiquement à chaque Pull Request avec **GitHub Actions** : une
modification qui casse un parcours ne peut plus être fusionnée.

---

### d11-l3 · Performance et référencement avancés

**Objectif :** un site rapide qui remonte sur Google.

**À retenir**
- **Core Web Vitals** : LCP (affichage du contenu principal), INP (réactivité), CLS (stabilité de la mise en page).
- Images optimisées, polices préchargées, JavaScript réduit au nécessaire.
- **Search Console** : envoyer le sitemap, suivre les requêtes, corriger les pages non indexées.
- **SEO local** : fiche Google Business Profile, nom/adresse/téléphone identiques partout, avis **réels** demandés aux
  clients.

**Exercice**
- [ ] Ajoute le fil rouge à Search Console et envoie le sitemap
- [ ] Note les 3 recherches que tu veux viser et vérifie qu'elles apparaissent dans tes textes

**Quiz** — Pour un commerce local, la source de clients Google la plus importante est souvent…
- a) La fiche Google Business Profile ✅
- b) Le nombre de pages du site
- c) Les mots-clés cachés en blanc

*Pourquoi :* elle apparaît dans Maps et en haut des recherches locales.

**🔥 Niveau avancé :** données structurées (`LocalBusiness`, `Product`, `FAQPage`), version multilingue avec
`hreflang` (français, arabe en RTL avec `dir="rtl"`, anglais), et suivi des positions mois par mois.

---

### d11-l4 · Le légal : données personnelles, mentions, licences

**Objectif :** protéger le client et te protéger.

**À retenir**
- **Mentions légales** (qui édite le site, qui l'héberge) et **politique de confidentialité** (quelles données, pour
  quoi, combien de temps, comment les supprimer).
- **Algérie** : loi **18-07** sur la protection des données personnelles (autorité : ANPDP). **Europe** : RGPD
  (bandeau cookies si traceurs non essentiels).
- **Licences** : polices, images, icônes, code open source — vérifier que l'usage commercial est permis.
- **Contrat** : qui possède le code, le design, le domaine à la fin du projet.

**Exercice**
- [ ] Rédige (avec Claude) la page « Mentions légales » et « Confidentialité » du fil rouge, puis relis-les
- [ ] Fais la liste des ressources externes du projet et leur licence

**Quiz** — Un formulaire collecte nom et téléphone. Il faut…
- a) Rien de spécial
- b) Une politique de confidentialité qui explique l'usage de ces données ✅
- c) Les publier sur le site

*Pourquoi :* collecter des données personnelles crée des obligations d'information.

**🔥 Niveau avancé :** minimise les données collectées, choisis une **région d'hébergement** cohérente avec les
clients (Europe pour des clients européens), et documente où vivent les données dans le guide de livraison.

---

### d11-l5 · Maintenance et surveillance

**Objectif :** que le site reste en ligne et à jour, et que ça te rapporte.

**À retenir**
- **Surveillance** : UptimeRobot ou Better Stack (alerte si le site tombe).
- **Sauvegardes** : export régulier de la base, instantanés du VPS, et un test de **restauration** de temps en temps.
- **Mises à jour** : dépendances, contenus, renouvellement du domaine.
- **Offre de maintenance** : forfait mensuel (hébergement + surveillance + petites modifications + rapport).

**Exercice**
- [ ] Mets une surveillance sur ton fil rouge et provoque une alerte (coupe le site 5 min)
- [ ] Rédige ton offre de maintenance en 5 lignes

**Quiz** — Une sauvegarde jamais testée…
- a) Est suffisante
- b) Peut ne pas marcher le jour où tu en as besoin ✅
- c) Est inutile

*Pourquoi :* on ne sait qu'une sauvegarde fonctionne qu'en la restaurant.

**🔥 Niveau avancé :** un rapport mensuel automatique (disponibilité, visites, Lighthouse) envoyé au client : il voit
la valeur de la maintenance et la renouvelle.

---

## D12 · Projet final et certificat

*icône `trophy` · Trois projets en ligne, un portfolio, et un premier client.*

### d12-l1 · Le brief du projet final

**Objectif :** livrer trois projets complets et publiés.

**À retenir** — les 3 livrables :

| Livrable | Exigences |
|---|---|
| **1. Site vitrine** (fil rouge) | En ligne sur un domaine ou sous-domaine, Lighthouse mobile ≥ 90, Open Graph, mentions légales |
| **2. Application** | Supabase avec Auth + **RLS vérifiée**, au moins un formulaire qui écrit en base, PWA installable |
| **3. Démo prospect** | Publiée, présentée à un **vrai** commerçant (message + vidéo), avec sa réponse |

- Chaque projet : dépôt GitHub propre, `README.md` (quoi, comment lancer, comment publier), `CLAUDE.md`.

**Exercice**
- [ ] Coche chaque exigence pour les 3 livrables
- [ ] Rédige une étude de cas (avant / après / résultat) pour ton portfolio

**Quiz** — Qu'est-ce qui rend un projet de portfolio crédible ?
- a) Beaucoup d'effets
- b) Un vrai besoin, un lien en ligne, et le résultat obtenu ✅
- c) Un code très long

*Pourquoi :* un client veut voir que tu résous des problèmes réels.

**🔥 Niveau avancé :** publie ton propre **skill** ou **plugin** utile (ex. audit de site local) sur GitHub et
partage-le : c'est un portfolio technique qui te distingue immédiatement.

---

### d12-l2 · Présenter son portfolio et trouver ses premiers clients

**Objectif :** transformer la formation en revenus.

**À retenir**
- Portfolio : **une page**, tes 3 projets (étude de cas courte + lien), tes offres, un bouton WhatsApp.
- **LinkedIn / Instagram** : publier chaque démo (vidéo 30 s + avant / après) ; une publication par semaine.
- **Prospection locale** : 10 commerces par semaine, une démo pour les plus prometteurs.
- **Spécialise-toi** (restaurants, salons, immobilier…) : une niche = des démos réutilisables et un discours précis.

**Exercice**
- [ ] Publie ton portfolio en ligne
- [ ] Publie ta première démo sur LinkedIn avec une vidéo
- [ ] Envoie 10 messages de prospection

**Quiz** — Pourquoi se spécialiser dans un secteur ?
- a) Pour avoir moins de clients
- b) Pour réutiliser ses démos et parler le langage de ses clients ✅
- c) Ce n'est pas utile

*Pourquoi :* chaque nouveau client du même secteur coûte moins de temps et te rend plus crédible.

**🔥 Niveau avancé :** construis une **démo modèle par secteur** que tu personnalises en une heure avec ton skill
`nouvelle-demo` : tu peux proposer une démo personnalisée le jour même du premier contact.

---

## Critères du certificat

- [ ] Les 66 leçons cochées et les quiz réussis
- [ ] Les 3 livrables du projet final en ligne et vérifiés par l'équipe
- [ ] Une démo réellement présentée à un commerçant (preuve : capture du message ou de la réponse)
- [ ] Un skill personnel créé et utilisé

---

## Annexe — Correspondance avec le format Hooked Academy

Pour ajouter cette formation sur la plateforme :

1. **Données** : créer `sites/hooked-academy/data/programme-dev.js` qui exporte `MODULES_DEV` (même structure que
   `MODULES_IA` dans `programme-ia.js` : `id`, `n`, `part`, `title`, `ar`, `color`, `icon`, `pitch`, `lessons[]`,
   et pour chaque leçon `id`, `n`, `title`, `ar`, `scenes[]`, `key[]`, `quiz[]`, `todo[]`).
2. **Formation** : ajouter `{ id: 'dev', code: 'D', title: 'Formation Sites & Apps', … }` dans `TRACKS` et ses
   parties dans `PARTS` (`data/programme.js`).
3. **Scènes animées** : écrire les scènes de chaque leçon (types `title`, `flow`, `compare`, `steps`, `checklist`,
   `quote`, `outro`) avec le texte `say` en darija pour la voix off.
4. **Accès** : ajouter la formation aux offres (`data/offres.js`) et aux packs côté serveur.
5. **Traductions** : anglais et arabe dans `data/i18n/`.
6. **Images** de leçon (`assets/img/lecons/d<module>-l<leçon>.webp`) et couverture (`couv-dev.webp`).
7. Tester avec `node server/index.mjs` **avant** de pousser sur `main` (le VPS se met à jour tout seul).
