# demos

Sites de démonstration pour prospects. Un dossier par démo dans `sites/`, un seul Worker Cloudflare pour tout servir.

En ligne sur **https://demos.bornzstudio.com** (domaine branché dans l'onglet **Domains** du Worker `demos`).

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

## Ajouter une démo

1. Créer `sites/<slug>/index.html` (et ses fichiers, avec des chemins relatifs).
2. Ajouter l'entrée dans `sites/demos.json`.
3. Pousser sur `main`.

Les consignes détaillées sont dans `CLAUDE.md`.
