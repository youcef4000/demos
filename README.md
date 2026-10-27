# demos

Sites de démonstration pour prospects. Un dossier par démo dans `sites/`, tout est servi par le VPS Hostinger
(le même que Hooked Academy et Hooked Lab).

En ligne sur **https://demos.bornzstudio.com**.

| Adresse | Contenu |
|---|---|
| `/` | Galerie des démos marquées `public` dans `sites/demos.json` |
| `/<slug>/` | La démo du dossier `sites/<slug>/` |
| `/sarraf/api/*` | Le serveur de Sarraf (transcription et lecture des mémos, voir plus bas) |
| `/hooked-academy/*` | Renvoie vers https://hooked-academy.tech (la formation a son propre site) |

## Comment c'est servi

Sur le VPS, tout vit dans `/opt/hooked` (installé par `server/installer-vps.sh`) :

| Conteneur | Rôle |
|---|---|
| `demos` | `server/demos.mjs` : sert le dossier `sites/` du dépôt, avec les en-têtes de `sites/_headers`, et l'API de Sarraf |
| `academy` | `server/index.mjs` : Hooked Academy (comptes, inscriptions, base SQLite) |
| `hooked-lab` | Hooked Lab (dépôt séparé, `server/installer-hooked-lab.sh`) |
| `caddy` | Le HTTPS (certificats automatiques) pour chaque domaine |

Toutes les 2 minutes, le VPS récupère `main` sur GitHub : une démo poussée est en ligne aussitôt (le dossier
`sites/` est lu directement dans le dépôt), les serveurs ne sont reconstruits que si leur code change.

Mise en place, une seule fois, depuis le terminal du VPS (hPanel → VPS → **Terminal du navigateur**, ou `ssh root@…`) :

```bash
bash /opt/hooked/demos/server/installer-vps.sh
```

Le script demande les clés de Sarraf (voir plus bas), relance les conteneurs, puis affiche ce qu'il reste à faire
dans le DNS : l'enregistrement `demos` de `bornzstudio.com` doit être de type **A** et pointer vers l'adresse IP du
VPS (à la place de l'ancien `CNAME` vers GitHub Pages), sans proxy. Le certificat HTTPS arrive quelques minutes après.

Tester sur son ordinateur : `node server/demos.mjs`, puis http://localhost:3000/<slug>/.

## Serveur de Hooked Academy (`server/`)

La formation a un vrai serveur (inscriptions, comptes étudiants, contenus modifiés depuis l'espace équipe,
voix off, ressources, FAQ) :

- `server/plateforme.js` : le cœur, indépendant de l'hébergeur ;
- `server/index.mjs` + `server/Dockerfile` : Node seul, base SQLite dans le volume `academy-data`, en ligne sur
  https://hooked-academy.tech. Détails : **DEPLOIEMENT-VPS.md**.

Compte de l'équipe : créé à la première visite de l'espace équipe avec un code d'installation à usage
unique (100 bits). Seule son empreinte SHA-256 est dans `server/plateforme.js` (`SETUP`, ou la variable
`SETUP_HASH` du serveur) ; la remplacer désactive le compte existant (procédure « mot de passe perdu »).

Tester en local : `node server/index.mjs`, puis http://localhost:3000/admin/.

## Sarraf — carnet vocal du cambiste (`sites/sarraf/`)

Application installable (PWA) pour un cambiste : après chaque appel, il enregistre un mémo vocal ; l'application le
garde, le fait transcrire et décortiquer, puis affiche une fiche à vérifier (sommes, taux, par qui, à qui, bénéfice
net, reste à régler). Elle tient aussi la caisse (devises en stock, prix moyen), les soldes de chaque contact, les
échéances et le bilan. Adresse : `https://demos.bornzstudio.com/sarraf/` (privée, hors galerie).

- **Plusieurs pays** : chaque mémo a son pays (choisi à l'enregistrement, gardé pour les suivants) et la monnaie de
  ses prix (DA, DT, DH, €, TL, AED…). Caisse, prix moyen et bénéfice sont tenus par paire devise / monnaie ; le bilan
  se filtre par pays.
- Les mémos, audios, fiches et règlements restent **dans le téléphone** (IndexedDB) ; sauvegarde complète en un fichier
  JSON et export CSV depuis **Réglages**.
- `server/sarraf.js` (`/sarraf/api/*`) ne stocke rien : il transcrit l'audio avec ElevenLabs (`scribe_v2`) et le fait lire
  par Claude (`claude-opus-5-5`, réponse au format JSON imposé, relance automatique sur un modèle de secours si un filtre
  refuse). Sans serveur, l'application marche quand même : fiche à remplir à la main, lecture simple des mémos écrits.

Clés, dans `/opt/hooked/demos.env` sur le VPS (demandées par `installer-vps.sh` la première fois ; pour en changer :
`nano /opt/hooked/demos.env`, puis relancer le script) :

| Nom | Valeur |
|---|---|
| `SARRAF_CODE` | le code d'accès, saisi une fois dans **Réglages** de l'application (créé par le script si on n'en donne pas) |
| `ELEVENLABS_API_KEY` | clé API ElevenLabs (droit Speech to Text) |
| `ANTHROPIC_API_KEY` | clé API Anthropic (reprise de Hooked Lab si on la laisse vide) |
| `SARRAF_MODELE` | facultatif : autre modèle Claude |

## Ajouter une démo

1. Créer `sites/<slug>/index.html` (et ses fichiers, avec des chemins relatifs).
2. Ajouter l'entrée dans `sites/demos.json`.
3. Pousser sur `main`.

Les consignes détaillées sont dans `CLAUDE.md`.
