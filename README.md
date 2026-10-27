# demos (privé) — Hooked Academy

Les démos pour prospects ont déménagé dans le dépôt public **`youcef4000/bornz-demos`**, publié par GitHub Pages
sur **https://demos.bornzstudio.com** (une démo poussée sur `main` est en ligne une à deux minutes plus tard).

Ce dépôt reste privé : il contient Hooked Academy (contenus payants, serveur) et les démos retirées (`hors-ligne/`).

## Serveur de Hooked Academy (`server/`)

La formation a un vrai serveur (inscriptions, comptes étudiants, contenus modifiés depuis l'espace équipe,
voix off, ressources, FAQ), en ligne sur **https://hooked-academy.tech** :

- `server/plateforme.js` : le cœur, indépendant de l'hébergeur ;
- `server/index.mjs` + `server/Dockerfile` : Node seul, base SQLite dans le volume `academy-data` du VPS ;
- `server/installer-vps.sh` : installation du VPS Hostinger en une commande (Docker, Caddy pour le HTTPS,
  mise à jour automatique depuis `main` toutes les 5 minutes). Détails : **DEPLOIEMENT-VPS.md**.

Les anciens liens `https://demos.bornzstudio.com/hooked-academy/…` mènent à https://hooked-academy.tech (page 404
du dépôt `bornz-demos`).

Compte de l'équipe : créé à la première visite de l'espace équipe avec un code d'installation à usage
unique (100 bits). Seule son empreinte SHA-256 est dans `server/plateforme.js` (`SETUP`, ou la variable
`SETUP_HASH` du serveur) ; la remplacer désactive le compte existant (procédure « mot de passe perdu »).

Tester en local : `node server/index.mjs`, puis http://localhost:3000/admin/.
