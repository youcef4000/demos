# Mettre Hooked Academy en ligne sur le VPS (Hostinger + Coolify)

Hooked Academy tourne sur le VPS Hostinger, avec Coolify : un tableau de bord dans le navigateur qui
construit le site depuis GitHub, le met en ligne avec le HTTPS, et le met à jour à chaque envoi sur
`main`. Rien à installer sur ton ordinateur. Le site ne s'endort jamais et ses données restent sur le disque.

> **Sécurité** — mots de passe et clés se tapent **uniquement** dans Coolify, Hostinger ou Cloudflare.
> Jamais dans un chat, jamais dans une capture d'écran, jamais dans le dépôt GitHub.

| Pièce | Rôle |
|---|---|
| `server/Dockerfile` | L'image : Node 24, le site (`sites/hooked-academy`) et son serveur (`server/`). Aucune dépendance. |
| `server/index.mjs` | Sert les pages (en-têtes de sécurité, compression) et l'API ; protège les voix off des leçons payantes. |
| `server/plateforme.js` | Le cœur : comptes, inscriptions, contenus, fichiers, FAQ, limites de tentatives. |
| Volume `/data` | La base SQLite (`academy.sqlite`) et ses sauvegardes quotidiennes (`sauvegardes/`, 14 jours). |

---

## 1. Le VPS

Hostinger → **VPS** → plan **KVM 2**, emplacement **France**, système **Applications → Coolify**.
Choisis un mot de passe root solide et garde-le pour toi.

Quand le VPS est prêt, note son **adresse IP** (hPanel → VPS → Aperçu).

## 2. Ouvrir Coolify

Ouvre `http://<adresse IP>:8000` (ou le lien Coolify du tableau de bord Hostinger) et crée le compte
administrateur de Coolify (e-mail + mot de passe solide). Coolify propose ensuite de régler le serveur
« localhost » : accepte.

## 3. Brancher GitHub

Coolify → **Sources** → **+ Add** → **GitHub App** → suis les étapes. Sur GitHub, installe l'application
sur ton compte et autorise les dépôts `demos` et `hooked-lab`.

Avec l'application GitHub, chaque envoi sur `main` redéploie le site tout seul.

## 4. Le nom de domaine

Cloudflare → **hooked-lab.com** → **DNS** → **Records** → **Add record** :

- Type **A**, nom **academy**, adresse IPv4 = l'IP du VPS ;
- **Proxy status : DNS only** (nuage gris). Cloudflare ne fait plus qu'indiquer l'adresse : c'est le VPS
  qui répond.

## 5. Créer le site dans Coolify

Coolify → **Projects** → **+ Add** (nom : `Hooked`) → environnement **production** → **+ New** →
**Private Repository (with GitHub App)** → dépôt **demos**, branche **main**.

Réglages :

| Champ | Valeur |
|---|---|
| Build Pack | **Dockerfile** |
| Base Directory | `/` |
| Dockerfile Location | `/server/Dockerfile` |
| Ports Exposes | `3000` |
| Domains | `https://academy.hooked-lab.com` |

Puis **Storages** → **+ Add** → **Volume Mount** : nom `hooked-academy-data`, chemin **`/data`**.
Sans ce volume, les comptes et les inscriptions seraient perdus à chaque mise à jour.

Aucune variable d'environnement n'est nécessaire.

**Deploy**. La première construction prend une à deux minutes ; Coolify crée le certificat HTTPS dès que
le nom de domaine pointe vers le VPS.

Vérification : `https://academy.hooked-lab.com/api/health` répond `{"ok":true,"setup":true}`.

## 6. Créer le compte de l'équipe

Ouvre `https://academy.hooked-lab.com/admin/`, saisis le **code d'installation** (donné à part, une seule
fois), ton identifiant (ton e-mail) et un mot de passe que tu n'utilises nulle part ailleurs.

Mot de passe perdu : demande un nouveau code d'installation. Son empreinte va dans la variable
`SETUP_HASH` de Coolify (ou dans `server/plateforme.js`) ; l'ancien compte est désactivé et tu en recrées un.

## 7. Sauvegardes

- Le serveur copie la base chaque jour dans `/data/sauvegardes` (14 jours gardés).
- Espace équipe → **Réglages** → **Exporter (JSON)** : une copie lisible sur ton ordinateur, de temps en temps.
- Hostinger → VPS → **Instantanés** : une image complète du VPS avant une grosse modification.

---

## Tester sur ton ordinateur (facultatif)

```bash
node server/index.mjs
```

puis http://localhost:3000/. Les données vont dans `data/` (ignoré par Git).
