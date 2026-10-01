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

## Ajouter une démo

1. Créer `sites/<slug>/index.html` (et ses fichiers, avec des chemins relatifs).
2. Ajouter l'entrée dans `sites/demos.json`.
3. Pousser sur `main`.

Les consignes détaillées sont dans `CLAUDE.md`.
