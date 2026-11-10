# Cabinet d'expertise comptable — V1

Site public, application (associé, collaborateur, client) et agents IA pour un cabinet d'expertise comptable en Algérie,
construits à partir des mémos vocaux du client.

- **Démo en ligne** (données fictives, tout dans le navigateur) : `sites/cabinet-expert-comptable/`,
  publiée sur https://demos.bornzstudio.com/cabinet-expert-comptable/
- **Version réelle** (ce dossier) : serveur Node 22, base SQLite, agents Claude, envoi des e-mails. **Jamais publié**
  par GitHub Pages ; il s'installe sur le serveur du cabinet.

| Dossier | Contenu |
|---|---|
| `docs/` | 01 transcriptions des mémos, 02 analyse des besoins, 03 architecture, 04 abonnements, 05 guide utilisateur, 06 livraison |
| `agents/` | Prompt système, schéma de sortie et fiche de chaque agent (`lecteur_pieces`, `imputation_scf`) |
| `src/` | Serveur (`serveur.js`), base SQLite (`base.js`), sessions et mots de passe (`securite.js`), agents Claude (`agents.js`), e-mails (`envoi.js`), outils (`outils-cli.js`) |
| `public/` | Copie du site et de l'application de la démo, **même code** (`npm run front` la met à jour, un test vérifie l'égalité) |
| `test/` | `npm test` : noyau métier, routes et droits, serveur réel (22 tests) |
| `deploiement/` | Service systemd et configuration Caddy (HTTPS) |

## Installer en local

Node 22.13 ou plus récent (SQLite est intégré à Node).

```bash
cd projets/cabinet-expert-comptable
```

```bash
npm ci
```

```bash
cp .env.example .env
```

Pour un essai en http sur le poste : mettre `SESSION_SECURE=0` et `AGENTS=simulation` dans `.env`, puis charger les
données de démonstration et démarrer :

```bash
npm run demo
```

```bash
npm start
```

Ouvrir http://127.0.0.1:8790/ (site) et http://127.0.0.1:8790/app/ (application). Comptes de démonstration : voir
`docs/06_livraison.md`.

## Mettre en service au cabinet

1. Serveur : option A (ICOSNET, en Algérie, recommandée) ou B (Hostinger, Union européenne) — voir `docs/03_architecture.md`
   et `docs/04_abonnements.md`. Ubuntu 24.04.
2. Nom de domaine : enregistrement DNS `A` vers l'adresse IP du serveur.
3. Sur le serveur, en administrateur :

```bash
sudo apt-get update && sudo apt-get install -y git caddy
```

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs
```

```bash
sudo useradd --system --create-home --home-dir /opt/cabinet cabinet
```

4. Copier ce dossier dans `/opt/cabinet` (par `git clone` du dépôt privé du cabinet, ou `scp`), puis :

```bash
cd /opt/cabinet && sudo -u cabinet npm ci && sudo -u cabinet cp .env.example .env
```

5. Remplir `.env` : messagerie SMTP du cabinet ; `AGENTS=desactive` tant que l'autorisation de transfert de l'ANPDP
   n'est pas obtenue (option A), `AGENTS=claude` et `ANTHROPIC_API_KEY` ensuite.
6. Créer le compte de l'associé (le mot de passe provisoire s'affiche une fois) :

```bash
sudo -u cabinet npm run compte -- associe associe@domaine-du-cabinet.dz "Nom de l'associé"
```

7. Service et HTTPS : copier `deploiement/cabinet.service` dans `/etc/systemd/system/` et `deploiement/Caddyfile` dans
   `/etc/caddy/Caddyfile` (remplacer le domaine), puis :

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now cabinet && sudo systemctl reload caddy
```

8. Se connecter, changer les paramètres (Paramètres : textes du site, coordonnées, format d'export PC Compta), créer
   les dossiers et les comptes des collaborateurs et des clients.

## Sécurité

- Toute page interne et toute route de l'API exigent une session ; les droits par rôle sont vérifiés à chaque appel par
  le noyau (`public/app/noyau/api.js`) : un client ne voit que son dossier, un collaborateur son portefeuille.
- Mots de passe hachés (scrypt), cookie `HttpOnly`, `Secure`, `SameSite=Strict`, 8 h ; blocage 15 minutes après 5 échecs ;
  en-tête `x-cabinet` exigé sur toute écriture (protection CSRF) ; en-têtes de sécurité (CSP, `X-Frame-Options`, HSTS).
- Pièces stockées hors du dossier public, servies seulement aux personnes qui ont accès au dossier ; formats contrôlés
  (JPEG, PNG, WebP, GIF, PDF), 15 Mo au plus.
- `.env` et `donnees/` ne sont jamais commités. Sauvegarde SQLite quotidienne gardée 30 jours dans
  `donnees/sauvegardes/` ; à copier chaque semaine hors du serveur.
- Aucune action sortante sans validation humaine : voir `agents/README.md`.

## Tests

```bash
npm test
```
