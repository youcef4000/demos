# Le VPS Hostinger : Hooked Academy (et Hooked Lab)

Le VPS sert https://hooked-academy.tech et https://hooked-lab.com. Docker fait tourner un conteneur par site,
Caddy s'occupe du HTTPS. Les sites ne s'endorment jamais et leurs données restent sur le disque du VPS.
Les démos pour prospects ne passent pas par le VPS : elles sont publiées par GitHub Pages depuis ce dépôt.

> **Sécurité** — mots de passe et clés se tapent **uniquement** dans le terminal du VPS ou chez Hostinger.
> Jamais dans un chat, jamais dans une capture d'écran, jamais dans le dépôt GitHub.

| Pièce | Rôle |
|---|---|
| `server/installer-vps.sh` | Installe ou répare le VPS en une commande (on peut le relancer sans risque). |
| `server/index.mjs` + `server/Dockerfile` | Conteneur `academy` : Hooked Academy et sa base SQLite (volume `academy-data`). |
| `server/installer-hooked-lab.sh` | Ajoute Hooked Lab à côté (dépôt séparé). |
| `/opt/hooked` | Sur le VPS : le dépôt (`demos/`), les clés de Hooked Lab (`hooked-lab.env`), le `Caddyfile`. |

---

## 1. Installation

Hostinger → **VPS** → **Terminal du navigateur** (ou `ssh root@<adresse IP>`), puis :

```bash
bash /opt/hooked/demos/server/installer-vps.sh hooked-academy.tech
```

Le script installe Docker, ouvre seulement les ports 22, 80 et 443, lance la plateforme et Caddy, et installe la
mise à jour automatique : toutes les 5 minutes, si `main` a changé sur GitHub, la plateforme est reconstruite
(les données restent).

Vérification : https://hooked-academy.tech/api/health répond `{"ok":true,...}`.
Journal : `cd /opt/hooked && docker compose logs -f academy`.

## 2. Compte de l'équipe

Ouvre `https://hooked-academy.tech/admin/`, saisis le **code d'installation** (donné à part, une seule fois), ton
identifiant (ton e-mail) et un mot de passe que tu n'utilises nulle part ailleurs.

Mot de passe perdu : demande un nouveau code d'installation. Son empreinte va dans `server/plateforme.js` (`SETUP`) ;
l'ancien compte est désactivé et tu en recrées un.

## 3. Sauvegardes

- La plateforme copie sa base chaque jour dans le volume `academy-data` (`sauvegardes/`, 14 jours gardés).
- Espace équipe → **Réglages** → **Exporter (JSON)** : une copie lisible sur ton ordinateur, de temps en temps.
- Hostinger → VPS → **Instantanés** : une image complète du VPS avant une grosse modification.

---

## Tester sur ton ordinateur (facultatif)

```bash
node server/index.mjs
```

puis http://localhost:3000/. Les données vont dans `data/` (ignoré par Git).
