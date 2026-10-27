#!/usr/bin/env bash
# Installe Hooked Lab sur le VPS, à côté de Hooked Academy (installer-vps.sh doit avoir tourné avant), en root.
# Les dépôts sont privés : /opt/hooked/demos se met à jour avec sa propre clé de déploiement, puis :
#   bash /opt/hooked/demos/server/installer-hooked-lab.sh
#
#  1. clé de déploiement GitHub (lecture seule) pour le dépôt privé hooked-lab ;
#  2. réglages et clés secrètes saisis ici, dans le terminal (fichier /opt/hooked/hooked-lab.env, lisible par root seul) ;
#  3. (facultatif) reprise des données depuis le bucket Cloudflare R2 « hooked-lab-donnees » ;
#  4. conteneur hooked-lab (Next.js, ffmpeg, yt-dlp ; données dans /opt/hooked/hooked-lab-data) derrière Caddy (HTTPS) ;
#  5. mise à jour automatique depuis GitHub toutes les 5 minutes.
# On peut le relancer : rien n'est effacé, les clés déjà saisies sont gardées.
set -euo pipefail

DOMAIN="${1:-hooked-lab.com}"
DIR=/opt/hooked
KEY=/root/.ssh/hooked_lab_deploy
export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

[ "$(id -u)" = 0 ] || { echo "À lancer en root."; exit 1; }
[ -f "$DIR/docker-compose.yml" ] || { echo "Installe d'abord Hooked Academy (installer-vps.sh)."; exit 1; }
ask() { local v; read -r -p "$1" v < /dev/tty; printf '%s' "$v"; }
ask_secret() { local v; read -r -s -p "$1" v < /dev/tty; echo > /dev/tty; printf '%s' "$v"; }

# 1. Accès au dépôt privé
mkdir -p /root/.ssh && chmod 700 /root/.ssh
if [ ! -f "$KEY" ]; then
  ssh-keygen -q -t ed25519 -N '' -C "vps-hooked-lab" -f "$KEY"
fi
if [ ! -d "$DIR/hooked-lab/.git" ]; then
  echo
  echo "==> Ajoute cette clé sur GitHub : dépôt hooked-lab → Settings → Deploy keys → Add deploy key"
  echo "    (titre : VPS, NE PAS cocher « Allow write access »), puis reviens ici."
  echo
  cat "$KEY.pub"
  echo
  ask "Appuie sur Entrée quand c'est fait… " >/dev/null
  git clone -q --depth 1 git@github.com:youcef4000/hooked-lab.git "$DIR/hooked-lab"
fi

# 2. Réglages et clés (saisis une seule fois)
ENV="$DIR/hooked-lab.env"
if [ ! -f "$ENV" ]; then
  echo
  echo "==> Clés de Hooked Lab (rien ne s'affiche quand tu tapes ; Entrée pour laisser vide)"
  A=$(ask_secret "Clé Anthropic (sk-ant-…) : ")
  G=$(ask_secret "Clé Groq (gsk_…) : ")
  SK=$(ask_secret "Clé secrète Stripe (sk_live_…) : ")
  WH=$(ask_secret "Secret du webhook Stripe (whsec_…) : ")
  AE=$(ask "E-mail de l'admin Hooked Lab : ")
  AP=$(ask_secret "Mot de passe de l'admin Hooked Lab : ")
  MP=$(ask "Meta Pixel ID (facultatif) : ")
  TP=$(ask "TikTok Pixel ID (facultatif) : ")
  umask 077
  cat > "$ENV" <<EOF
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATA_DIR=/app/data
TRANSCRIBER=groq
SITE_URL=https://$DOMAIN
NEXT_MANUAL_SIG_HANDLE=1
DELAI_ARRET_S=100
ANTHROPIC_API_KEY=$A
GROQ_API_KEY=$G
STRIPE_SECRET_KEY=$SK
STRIPE_WEBHOOK_SECRET=$WH
ADMIN_EMAIL=$AE
ADMIN_MOT_DE_PASSE=$AP
ADMIN_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
META_PIXEL_ID=$MP
TIKTOK_PIXEL_ID=$TP
EOF
  chmod 600 "$ENV"
  echo "    Enregistré dans $ENV (à modifier avec : nano $ENV, puis relancer ce script)."
fi

# 3. Données depuis Cloudflare R2 (comptes, crédits, paiements, analyses)
mkdir -p "$DIR/hooked-lab-data"
if [ ! -f "$DIR/hooked-lab-data/.repris-de-r2" ]; then
  echo
  if [ "$(ask "Récupérer les données de Hooked Lab depuis Cloudflare R2 ? (o/n) ")" = "o" ]; then
    echo "    Cloudflare → R2 → Manage R2 API Tokens → Create API token (Object Read only, bucket hooked-lab-donnees)."
    ID=$(ask "Account ID Cloudflare : ")
    AK=$(ask "Access Key ID : ")
    SA=$(ask_secret "Secret Access Key : ")
    docker run --rm -v "$DIR/hooked-lab-data:/data" \
      -e RCLONE_CONFIG_R2_TYPE=s3 -e RCLONE_CONFIG_R2_PROVIDER=Cloudflare \
      -e RCLONE_CONFIG_R2_ACCESS_KEY_ID="$AK" -e RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$SA" \
      -e RCLONE_CONFIG_R2_ENDPOINT="https://$ID.r2.cloudflarestorage.com" \
      rclone/rclone copy r2:hooked-lab-donnees /data --stats-one-line --stats 10s
    date -Is > "$DIR/hooked-lab-data/.repris-de-r2"
    echo "    Données copiées dans $DIR/hooked-lab-data."
  fi
fi

# 4. Conteneur + HTTPS
cat > "$DIR/docker-compose.override.yml" <<'EOF'
services:
  hooked-lab:
    build:
      context: ./hooked-lab
    restart: unless-stopped
    env_file: ./hooked-lab.env
    volumes:
      - ./hooked-lab-data:/app/data
    stop_grace_period: 2m
EOF
# Bloc Caddy gardé à part : installer-vps.sh le remet dans le Caddyfile s'il est relancé.
cat > "$DIR/Caddyfile.lab" <<EOF

$DOMAIN {
  encode zstd gzip
  request_body {
    max_size 200MB
  }
  reverse_proxy hooked-lab:3000 {
    # Adresse et pays du visiteur : jamais ceux qu'il enverrait lui-même (limites anti-abus, devise)
    header_up X-Real-IP {remote_host}
    header_up -Cf-Connecting-Ip
    header_up -True-Client-Ip
    header_up -Cf-Ipcountry
    header_up -X-Hkl-Pays
    header_up -X-Hkl-Config
  }
}
www.$DOMAIN {
  redir https://$DOMAIN{uri} permanent
}
EOF
if ! grep -q "^$DOMAIN {" "$DIR/Caddyfile"; then
  cat "$DIR/Caddyfile.lab" >> "$DIR/Caddyfile"
fi
echo
echo "==> Construction de Hooked Lab (5 à 10 minutes la première fois)"
cd "$DIR"
docker compose up -d --build hooked-lab
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1 || docker compose restart caddy

# 5. Mise à jour automatique
cat > "$DIR/maj-hooked-lab.sh" <<EOF
#!/usr/bin/env bash
# Reconstruit Hooked Lab quand la branche main de GitHub a changé (toutes les 5 minutes).
set -euo pipefail
export GIT_SSH_COMMAND="$GIT_SSH_COMMAND"
cd $DIR
git -C hooked-lab fetch -q origin main
if [ "\$(git -C hooked-lab rev-parse HEAD)" != "\$(git -C hooked-lab rev-parse origin/main)" ]; then
  git -C hooked-lab reset -q --hard origin/main
  docker compose up -d --build hooked-lab
  docker image prune -f >/dev/null
  echo "\$(date -Is) Hooked Lab mis à jour : \$(git -C hooked-lab log -1 --format=%s)"
fi
EOF
chmod +x "$DIR/maj-hooked-lab.sh"
cat > /etc/systemd/system/hooked-lab-maj.service <<EOF
[Unit]
Description=Mise à jour de Hooked Lab depuis GitHub
[Service]
Type=oneshot
ExecStart=$DIR/maj-hooked-lab.sh
EOF
cat > /etc/systemd/system/hooked-lab-maj.timer <<'EOF'
[Unit]
Description=Mise à jour de Hooked Lab toutes les 5 minutes
[Timer]
OnBootSec=3min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now hooked-lab-maj.timer >/dev/null

CODE=000
for _ in $(seq 30); do
  CODE=$(docker compose exec -T hooked-lab curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/sante || true)
  [ "$CODE" = 200 ] && break
  sleep 2
done
echo
docker compose ps
echo
echo "==> Hooked Lab répond sur le VPS : $CODE (200 = prêt)."
echo "    Étape suivante : faire pointer $DOMAIN vers ce VPS (voir le guide)."
echo "    Journal : cd $DIR && docker compose logs -f hooked-lab"
