---
name: nouvelle-demo
description: Crée une démo de site vitrine pour un prospect dans un dépôt de démos publié par GitHub Pages (un dossier sites/<slug>/ par démo, entrée dans sites/demos.json). À utiliser quand on demande une démo, une maquette en ligne, un site exemple ou un prototype à montrer à un commerçant ou à un client.
---

# Nouvelle démo prospect

Tu crées une démo statique (HTML, CSS, JS), mobile d'abord, publiée par GitHub Pages dans un sous-dossier.

## 1. Rassembler les informations

Demande ce qui manque, en une seule fois :
- Nom du commerce, secteur, ville
- Ce qu'il vend (services, menu, produits, prix publics)
- Coordonnées publiques (téléphone, WhatsApp, adresse, horaires, réseaux)
- Couleurs ou ambiance souhaitées ; sinon propose-en deux
- Lien public (`public: true`) ou privé (`public: false`)

## 2. Choisir le slug

Minuscules, sans accents, avec des tirets : `salon-amina-oran`. Vérifie que `sites/<slug>/` n'existe pas.

## 3. Construire

Dans `sites/<slug>/` :
- `index.html` : hero (ce que c'est, pour qui, bouton WhatsApp), preuves, offre, étapes, FAQ, contact
- Chemins **relatifs** uniquement (`./style.css`, `img/photo.webp`)
- Librairies depuis `cdn.jsdelivr.net` avec une version fixée (ex. `gsap@3.15.0`)
- `<title>`, `description`, Open Graph avec adresses complètes, `canonical`
- Images en WebP, `alt`, `loading="lazy"` sous la ligne de flottaison
- Lien WhatsApp `https://wa.me/<indicatif><numéro sans le 0>?text=<message encodé>`
- `prefers-reduced-motion` respecté
- `<meta http-equiv="Content-Security-Policy">` adaptée aux sources utilisées

## 4. Règles de contenu (non négociables)

- Informations réelles uniquement si elles sont **publiques**
- Tout contenu inventé est **présenté comme un exemple** (« Exemple d'avis », « Photo d'illustration »)
- Jamais de faux avis, de faux chiffres ni de faux logos de clients
- Aucune clé d'API, aucune donnée personnelle de client : le dépôt est public

## 5. Enregistrer la démo

Ajoute dans `sites/demos.json` :

```json
{ "slug": "<slug>", "title": "<Nom>", "sector": "<secteur>", "city": "<ville>", "color": "<#couleur>", "public": false }
```

## 6. Vérifier avant de rendre la main

- Lancer `python3 -m http.server 8000 -d sites` et ouvrir `http://localhost:8000/<slug>/`
- Vérifier l'affichage en 375 px de large, aucune erreur dans la console
- Donner l'adresse finale : `https://<domaine-des-demos>/<slug>/`
- Ne pas pousser sans accord explicite de l'utilisateur
