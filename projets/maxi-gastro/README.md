# Le Passe — moteur de synchronisation Maxi Gastro

Fournisseurs (API, flux XML, CSV) → **base centrale + règles + Claude** → Shopify (maxigastro.fr) → marketplaces (METRO…).
Démo et étude : `sites/maxi-gastro-le-passe/` (https://demos.bornzstudio.com/maxi-gastro-le-passe/ une fois publiée).

Ce dossier **n'est pas publié** par GitHub Pages et ne tourne pas sur le VPS de Hooked Academy. Il est destiné au serveur
de Maxi Gastro (ou à un dépôt privé qui lui appartient). Aucune clé ici : tout passe par `.env`.

## Ce qui est fait, ce qui reste à brancher

| Brique | État |
|---|---|
| Noyau de règles (`src/noyau/`) | Fait et testé. **Identique au code exécuté dans la démo** (`npm run noyau` le recopie, un test vérifie l'égalité). |
| Base centrale SQLite | Faite : offres, produits, correspondances Shopify, verrous, historique des prix, file de validation, envois, journal. |
| equip.me | Connecteur écrit d'après la spécification publique (Dealers API 1.0.4). **À valider avec une vraie clé** : noms des champs métriques, entrepôts utiles, limite d'appels. |
| Tefcold | Lecteur de flux XML « à plat ». **À ajuster** sur le vrai flux (le lien se demande au service client Tefcold). |
| Cuistance (CSV) | Fait : séparateur, encodage Excel, colonnes reconnues par leur nom, fichier inconnu refusé. **À vérifier** sur un vrai envoi (le fichier n'a pas encore été transmis). |
| Combisteel, Diamond | En attente de leur documentation d'API. |
| Shopify | Fait (Admin GraphQL 2026-10) : lecture du catalogue, création en brouillon (`productSet`), prix (`productVariantsBulkUpdate`), stock (`inventorySetQuantities` avec `changeFromQuantity` et clé d'idempotence). Mode à blanc. |
| Claude | Fait : consigne en cache, sortie JSON imposée, contrôle des chiffres, lots de nuit (−50 %), repli automatique si le modèle décline. |
| METRO | Pas encore : d'abord les EAN (0 sur 2 131 produits aujourd'hui). Ensuite connecteur direct ou agrégateur branché sur Shopify. |

## Installer

```bash
cd projets/maxi-gastro
```

```bash
npm install
```

```bash
cp .env.exemple .env
```

Node 22.13 ou plus récent (SQLite est intégré à Node, rien d'autre à installer). Remplir `.env`.

## Mettre en route (une seule fois)

1. Remplir la base sans rien décider : `npm run passe -- synchro tefcold --lecture-seule`
2. Relier les 2 131 produits Shopify existants aux références fournisseurs (EAN, sinon référence nettoyée : « 15844.0 » = « 15844 ») : `npm run passe -- relier`
3. Relire le rapport : `npm run passe -- rapport`
4. Première vraie synchro, **à blanc** : `npm run passe -- synchro tefcold` puis `npm run passe -- envoyer --a-blanc` et relire `sortie/shopify-a-blanc.jsonl`.
5. Quand tout est juste : `npm run passe -- envoyer`.

## Au quotidien

```bash
npm run passe -- synchro equipme --envoyer
```

```bash
npm run passe -- import cuistance chemin/vers/stock.csv --envoyer
```

```bash
npm run passe -- passe
```

```bash
npm run passe -- passe valider 12
```

```bash
npm run passe -- verrou ref:tefcold:15844
```

```bash
npm run passe -- fiches lancer --limite=300
```

Règles commerciales : `config/regles.json` (coefficient par fournisseur, par catégorie, croisé, par produit ; arrondi ;
seuil au-delà duquel un prix attend une validation ; familles jamais importées ; marge plancher marketplaces).

Ce qui part tout seul : les stocks, les variations de prix sous le seuil. Ce qui attend au passe : les grosses variations,
les nouveaux produits, les fiches rédigées par Claude. Ce qui ne bouge jamais : les prix verrouillés.

## n8n

Le serveur (`npm run serveur`, port 8787, écoute sur 127.0.0.1) est appelé par n8n avec l'en-tête
`Authorization: Bearer <PASSE_JETON>`. Importer les workflows de `n8n/`, puis créer une fois l'identifiant
**Header Auth** « Le Passe (jeton) » et, pour Cuistance, l'identifiant IMAP de la boîte qui reçoit le fichier.

- `01-synchro-fournisseurs.json` : toutes les 30 minutes, equip.me puis Tefcold, envoi à Shopify, rapport.
- `02-csv-cuistance-mail.json` : un mail non lu de Cuistance arrive, la pièce jointe part au Passe.
- `03-fiches-claude-nuit.json` : lot Claude à 2 h, fiches rangées au passe à 6 h.

Pourquoi un moteur à côté de n8n : n8n déclenche et transporte très bien ; l'historique de milliers de prix, les verrous
et les règles fines sont plus sûrs dans un code testé (`npm test`).

## Claude

- Modèle `claude-opus-5-5` (variable `CLAUDE_MODELE`), effort `medium` (`CLAUDE_EFFORT`).
- La consigne (`src/noyau/prompt-fiche.js`) interdit d'inventer, impose une source par caractéristique, écarte les
  mots-clés qui ne décrivent pas le produit. Le moteur revérifie chaque chiffre contre les données fournisseur.
- Mots-clés : exporter les requêtes de la Search Console dans `config/mots-cles.csv` (première colonne = requête).
- Coût estimé : ≈ 0,03 $ par fiche en lot (2 $ / 10 $ par million de jetons, ≈ 4 000 jetons lus, 2 000 écrits). À mesurer sur le pilote.

## Sécurité

- `.env`, `donnees/` et `sortie/` ne sont jamais commités.
- Le serveur refuse de démarrer sans jeton long, compare le jeton en temps constant, n'écoute que sur 127.0.0.1 par défaut.
- Une synchro à la fois (une relance n8n pendant une synchro reçoit 409).
- Les envois Shopify passent par une file : une coupure ne perd rien, rien n'est envoyé deux fois.

## Tests

```bash
npm test
```

27 tests : règles de prix, plancher Buy Box, EAN, doublons, CSV Windows-1252, connecteur equip.me (réponses simulées
au format de la spécification), flux XML, synchro de bout en bout, exclusions, Shopify à blanc, garde-fous Claude.
