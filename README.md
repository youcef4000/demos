# demos

Sites de démonstration pour prospects. Un dossier par démo dans `sites/`, un seul Worker Cloudflare pour tout servir.

En ligne sur **https://demos.bornzstudio.com** (domaine branché dans l'onglet **Domains** du Worker `demos`).

Miroir hors Cloudflare : **https://youcef4000.github.io/demos/** (GitHub Pages, même dossier `sites/`, publié à chaque push sur `main`). Utile quand un réseau n'arrive pas à joindre Cloudflare. Activation unique : **Settings → Pages → Source : GitHub Actions**.

| Adresse | Contenu |
|---|---|
| `/` | Galerie des démos marquées `public` dans `sites/demos.json` |
| `/<slug>/` | La démo du dossier `sites/<slug>/` |

## Mise en ligne (une seule fois)

Dans Cloudflare : **Workers & Pages → Create → Import a repository** → `youcef4000/demos`.

- Nom du Worker : `demos` (doit correspondre à `wrangler.jsonc`)
- Build command : vide
- Deploy command : `npx wrangler deploy`
- Root directory : `/`
- Branche de production : `main`

Ensuite, chaque push sur `main` met en ligne les nouvelles démos en une à deux minutes.

## Servir demos.bornzstudio.com par GitHub Pages plutôt que par Cloudflare

Si certains réseaux n'arrivent pas à joindre Cloudflare (`ERR_CONNECTION_TIMED_OUT`), on fait pointer
`demos.bornzstudio.com` vers GitHub Pages. L'adresse ne change pas, le Worker reste en secours sur
`demos.youcef-ny.workers.dev`.

1. **GitHub** → dépôt `demos` → **Settings → Pages** : Source **GitHub Actions** ; **Custom domain** :
   `demos.bornzstudio.com` → **Save**.
2. **Cloudflare** → Worker `demos` → **Domains** : retirer `demos.bornzstudio.com`
   (**⋯ → Remove**).
3. **Cloudflare** → `bornzstudio.com` → **DNS → Records → Add record** : type `CNAME`, nom `demos`,
   cible `youcef4000.github.io`, **Proxy status : DNS only** (nuage gris, obligatoire pour que
   GitHub crée le certificat HTTPS).
4. **GitHub → Settings → Pages** : attendre « DNS check successful », puis cocher **Enforce HTTPS**
   (certificat prêt en 15 à 60 minutes).

Chaque push sur `main` met ensuite à jour les deux hébergements.

## Serveur de Hooked Academy (`server/`)

La formation a un vrai serveur (inscriptions, comptes étudiants, contenus modifiés depuis l'espace équipe,
voix off, ressources, FAQ) :

- `server/plateforme.js` : le cœur, indépendant de l'hébergeur ;
- `server/index.mjs` + `server/Dockerfile` : la version VPS (Hostinger + Coolify), Node seul, base SQLite
  dans un volume `/data`. Mise en ligne : **DEPLOIEMENT-VPS.md** ;
- `worker/` : l'ancienne version Cloudflare (Durable Object), qui n'exécute du code que pour
  `/hooked-academy/api/*` et `/hooked-academy/media/*` ; les autres démos ne passent jamais par ce code.

Compte de l'équipe : créé à la première visite de l'espace équipe avec un code d'installation à usage
unique (100 bits). Seule son empreinte SHA-256 est dans `server/plateforme.js` (`SETUP`, ou la variable
`SETUP_HASH` du serveur) ; la remplacer désactive le compte existant (procédure « mot de passe perdu »).

Tester en local : `node server/index.mjs`, puis http://localhost:3000/admin/.

## Sarraf — carnet vocal du cambiste (`sites/sarraf/`)

Application installable (PWA) pour un cambiste : après chaque appel, il enregistre un mémo vocal ; l'application le
garde, le fait transcrire et décortiquer, puis affiche une fiche à vérifier (sommes, taux, par qui, à qui, bénéfice
net, reste à régler). Elle tient aussi la caisse (devises en stock, prix moyen), les soldes de chaque contact, les
échéances et le bilan. Adresse : `https://demos.bornzstudio.com/sarraf/` (privée, hors galerie).

- Les mémos, audios, fiches et règlements restent **dans le téléphone** (IndexedDB) ; sauvegarde complète en un fichier
  JSON et export CSV depuis **Réglages**.
- `worker/sarraf.js` (`/sarraf/api/*`) ne stocke rien : il transcrit l'audio avec ElevenLabs (`scribe_v2`) et le fait lire
  par Claude (`claude-opus-5-5`, réponse au format JSON imposé, relance automatique sur un modèle de secours si un filtre
  refuse). Sans serveur, l'application marche quand même : fiche à remplir à la main, lecture simple des mémos écrits.

Mise en service (une seule fois) : Cloudflare → Worker `demos` → **Settings → Variables and Secrets** → ajouter en
**Secret** :

| Nom | Valeur |
|---|---|
| `SARRAF_CODE` | un code d'accès long, saisi ensuite une fois dans **Réglages** de l'application |
| `ELEVENLABS_API_KEY` | clé API ElevenLabs (droit Speech to Text) |
| `ANTHROPIC_API_KEY` | clé API Anthropic |
| `SARRAF_MODELE` | facultatif : autre modèle Claude |

Sur le miroir GitHub Pages, l'application appelle l'adresse de secours `https://demos.youcef-ny.workers.dev/sarraf/api/`.

## Ajouter une démo

1. Créer `sites/<slug>/index.html` (et ses fichiers, avec des chemins relatifs).
2. Ajouter l'entrée dans `sites/demos.json`.
3. Pousser sur `main`.

Les consignes détaillées sont dans `CLAUDE.md`.
