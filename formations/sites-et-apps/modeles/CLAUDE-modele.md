# <Nom du projet> — <une phrase : ce que c'est et pour qui>

> Modèle à copier à la racine de chaque projet **sous le nom `CLAUDE.md`**, puis à compléter.
> (Nommé `CLAUDE-modele.md` ici pour que Claude ne le prenne pas pour les règles de ce dossier.)
> Claude le relit au début de chaque session : écris des règles **courtes et vérifiables**.

## Le projet

- Client : <nom du commerce>, <ville> — <ce qu'il vend>
- Objectif : <ex. recevoir des réservations sur WhatsApp et en ligne>
- Public : <ex. clients 20–45 ans, arrivent depuis Instagram, sur téléphone>
- Langues : français par défaut ; <arabe (RTL) / anglais si demandé>

## Pile technique

- <ex. HTML, CSS, JavaScript sans framework> / <ex. React + Vite + Tailwind + Supabase>
- Librairies chargées depuis `cdn.jsdelivr.net` avec une **version fixée** (ex. `gsap@3.15.0`)
- Hébergement : <GitHub Pages / Netlify / Railway / VPS>

## Commandes

```bash
python3 -m http.server 8000     # tester en local (site statique) → http://localhost:8000
npm run dev                      # (projet Vite) serveur de développement
npm run build                    # (projet Vite) version de production
```

## Structure

| Dossier / fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `css/`, `js/`, `img/` | Styles, scripts, images (WebP) |
| `supabase/migrations/` | Schéma de la base, en SQL |

## Design

- Polices : <titres> / <texte>
- Couleur principale : <#xxxxxx> ; neutres : <#…>
- Mobile d'abord (375 px), puis tablette et ordinateur
- Toutes les couleurs et tailles passent par les variables CSS de `:root`

## Règles

- Chemins **relatifs** uniquement (`./css/style.css`, jamais `/css/style.css`)
- Aucune clé secrète dans le code du navigateur ni dans le dépôt ; secrets dans `.env` (ignoré par Git)
- Supabase : **RLS activée sur chaque table** ; la clé secrète n'existe que côté serveur
- Contenus d'exemple **présentés comme tels** : pas de faux avis, de faux chiffres ni de faux logos
- `<title>`, `description` et Open Graph renseignés sur chaque page
- Respecter `prefers-reduced-motion` ; animer seulement `transform` et `opacity`
- Une fonctionnalité à la fois ; montrer le plan avant les grosses modifications
- Après chaque étape qui marche : commit avec un message clair

## À ne jamais faire

- Supprimer ou renommer des fichiers sans le dire
- Ajouter une dépendance sans expliquer pourquoi
- Pousser sur `main` sans que le site ait été testé sur mobile
