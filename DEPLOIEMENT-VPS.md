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

## 4. Pixel Meta (publicités Facebook / Instagram)

Le pixel est chargé seulement sur les pages publiques (`/` et `/ia/`) par `/meta-pixel.js`, que le serveur construit
avec la variable d'environnement `META_PIXEL_ID`. L'ID n'est jamais écrit dans le dépôt. Sans ID, rien n'est envoyé
et le site marche comme avant.

Dans le terminal du VPS, une seule fois (remplace `123456789012345` par l'ID du pixel, Gestionnaire d'événements Meta) :

```bash
grep -v '^META_PIXEL_ID=' /opt/hooked/.env 2>/dev/null > /opt/hooked/.env.tmp; echo 'META_PIXEL_ID=123456789012345' >> /opt/hooked/.env.tmp; mv /opt/hooked/.env.tmp /opt/hooked/.env
bash /opt/hooked/demos/server/installer-vps.sh hooked-academy.tech
```

Vérification : https://hooked-academy.tech/meta-pixel.js affiche `fbq('init', '…')` avec ton ID.
Pour changer d'ID : même commande avec le nouvel ID. Pour couper le pixel : supprime la ligne de `/opt/hooked/.env`
et relance l'installateur.

Événements envoyés (`sites/hooked-academy/assets/js/suivi.js`) :

| Événement | Quand |
|---|---|
| `PageView` | à chaque page publique |
| `ViewContent` | « Voir une leçon » / lecture de la leçon démo (landing), clic sur « Essayer le compte démo » (`content_name` : `Leçon démo` ou `Compte démo`) |
| `Lead` | après une inscription acceptée par le serveur, jamais au simple clic : `content_name` = la formule, `value` = son prix en DA, `currency: 'DZD'` |

Liens des publicités : `?plan=creative|ia|sites|pack2|pack3` présélectionne la formule du formulaire
(`pack2` = Créative + IA, `pack3` = pack complet), `?lang=fr|en|ar` ouvre la page dans la langue, et
`utm_source`, `utm_campaign`, `utm_content` sont gardés pendant la visite puis enregistrés avec l'inscription.
Exemple : `https://hooked-academy.tech/?lang=ar&plan=pack2&utm_source=facebook&utm_campaign=lancement&utm_content=video-1`.
Une ancre (`#inscription`, `#formation-dev`…) dans un lien de publicité est ignorée : la page s'ouvre en haut.

Écran vidéo d'arrivée (`sites/hooked-academy/assets/js/gate.js`) : à la première visite de `/` ou `/ia/`, la vidéo de
présentation s'affiche par-dessus le site flouté ; le bouton « voir la formation » se débloque après 45 s de lecture
réelle (`GATE_SECONDS`), ou tout de suite si la vidéo ne démarre pas (10 s), échoue ou si le réseau est coupé.
Vidéo et image : `GATE_VIDEO_SRC` et `GATE_VIDEO_POSTER` en tête du fichier (une vidéo 9:16 marche aussi).
Un visiteur qui a débloqué l'écran ne le revoit pas ; `?gate=0` le coupe (pour tester la page).
Pixel : `VideoGatePlay` (lancement), `VideoGate50` (moitié de la vidéo), `VideoGateUnlock` (clic sur le bouton débloqué).

---

## Tester sur ton ordinateur (facultatif)

```bash
node server/index.mjs
```

puis http://localhost:3000/. Les données vont dans `data/` (ignoré par Git).
