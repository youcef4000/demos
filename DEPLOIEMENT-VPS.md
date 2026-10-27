# Le VPS Hostinger : Hooked Academy et toutes les démos

Un seul VPS sert tout : https://hooked-academy.tech, https://demos.bornzstudio.com (toutes les démos, dont Sarraf)
et https://hooked-lab.com. Docker fait tourner un conteneur par site, Caddy s'occupe du HTTPS. Les sites ne
s'endorment jamais et leurs données restent sur le disque du VPS.

> **Sécurité** — mots de passe et clés se tapent **uniquement** dans le terminal du VPS ou chez Hostinger.
> Jamais dans un chat, jamais dans une capture d'écran, jamais dans le dépôt GitHub.

| Pièce | Rôle |
|---|---|
| `server/installer-vps.sh` | Installe ou répare le VPS en une commande (on peut le relancer sans risque). |
| `server/demos.mjs` + `server/Dockerfile.demos` | Conteneur `demos` : le dossier `sites/` du dépôt et l'API de Sarraf (`server/sarraf.js`). |
| `server/index.mjs` + `server/Dockerfile` | Conteneur `academy` : Hooked Academy et sa base SQLite (volume `academy-data`). |
| `server/installer-hooked-lab.sh` | Ajoute Hooked Lab à côté (dépôt séparé). |
| `/opt/hooked` | Sur le VPS : le dépôt (`demos/`), les clés (`demos.env`, `hooked-lab.env`), le `Caddyfile`. |

---

## 1. Lancer l'installation

Hostinger → **VPS** → **Terminal du navigateur** (ou `ssh root@<adresse IP>`), puis :

```bash
bash /opt/hooked/demos/server/installer-vps.sh
```

Sur un VPS neuf (rien dans `/opt/hooked`) :

```bash
curl -fsSL https://raw.githubusercontent.com/youcef4000/demos/main/server/installer-vps.sh | bash -s hooked-academy.tech
```

La première fois, le script demande les clés de Sarraf (rien ne s'affiche quand on tape, Entrée pour laisser vide) :
clé ElevenLabs, clé Anthropic (reprise de Hooked Lab si on la laisse vide) et code d'accès de l'application (créé
s'il n'est pas donné). Il les range dans `/opt/hooked/demos.env`, lisible par root seul, et affiche le code d'accès
à la fin : c'est lui qu'on saisit une fois dans **Sarraf → Réglages**.

Changer une clé plus tard : `nano /opt/hooked/demos.env`, puis relancer le script.

## 2. Le nom de domaine des démos

Dans le DNS de **bornzstudio.com** (chez le fournisseur du domaine) :

- supprimer l'ancien enregistrement `demos` (un `CNAME` vers `youcef4000.github.io`) ;
- ajouter : type **A**, nom **demos**, valeur = l'adresse IP du VPS (le script l'affiche à la fin), **sans proxy**.

Quelques minutes plus tard, Caddy obtient le certificat et https://demos.bornzstudio.com/ affiche la galerie.
Tant que l'ancien enregistrement existe, la page « There isn't a GitHub Pages site here » reste affichée.

## 3. Les mises à jour

Toutes les 2 minutes, le VPS regarde `main` sur GitHub (`/opt/hooked/mettre-a-jour.sh`) :

- une démo modifiée dans `sites/` est en ligne aussitôt, sans redémarrage ;
- si `server/` change, les conteneurs `demos` et `academy` sont reconstruits ;
- si `sites/hooked-academy/` change, le conteneur `academy` est reconstruit.

Journal : `cd /opt/hooked && docker compose logs -f demos` (ou `academy`, `caddy`).
Vérification : https://demos.bornzstudio.com/sante répond `ok`, https://hooked-academy.tech/api/health répond
`{"ok":true,...}`.

## 4. Hooked Academy : compte de l'équipe

Ouvre `https://hooked-academy.tech/admin/`, saisis le **code d'installation** (donné à part, une seule fois), ton
identifiant (ton e-mail) et un mot de passe que tu n'utilises nulle part ailleurs.

Mot de passe perdu : demande un nouveau code d'installation. Son empreinte va dans `server/plateforme.js` (`SETUP`) ;
l'ancien compte est désactivé et tu en recrées un.

## 5. Sauvegardes

- Hooked Academy copie sa base chaque jour dans le volume `academy-data` (`sauvegardes/`, 14 jours gardés).
- Espace équipe → **Réglages** → **Exporter (JSON)** : une copie lisible sur ton ordinateur, de temps en temps.
- Sarraf ne garde rien sur le serveur : chaque téléphone fait sa propre sauvegarde (**Réglages → Sauvegarder tout**).
- Hostinger → VPS → **Instantanés** : une image complète du VPS avant une grosse modification.

---

## Tester sur ton ordinateur (facultatif)

```bash
node server/demos.mjs      # toutes les démos : http://localhost:3000/
node server/index.mjs      # Hooked Academy : http://localhost:3000/ (données dans data/, ignoré par Git)
```
