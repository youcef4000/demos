#!/usr/bin/env bash
# Installe Hooked Academy sur un VPS Ubuntu (Hostinger), en une commande, en root :
#   curl -fsSL https://raw.githubusercontent.com/youcef4000/demos/main/server/installer-vps.sh | bash -s hooked-academy.tech
#
# Ce que fait le script (on peut le relancer sans risque) :
#  1. installe Docker et ouvre seulement les ports 22 (SSH), 80 et 443 ;
#  2. récupère le code depuis GitHub dans /opt/hooked/demos ;
#  3. lance deux conteneurs : la plateforme (server/Dockerfile, données dans le volume « academy-data »)
#     et Caddy, qui gère le HTTPS (certificat automatique) et relaie vers la plateforme ;
#  4. installe une mise à jour automatique : toutes les 5 minutes, si GitHub a du nouveau sur « main »,
#     la plateforme est reconstruite et relancée (les données restent).
set -euo pipefail

DOMAIN="${1:-hooked-academy.tech}"
DIR=/opt/hooked
REPO=https://github.com/youcef4000/demos.git

[ "$(id -u)" = 0 ] || { echo "À lancer en root (ssh root@…)"; exit 1; }
echo "==> Hooked Academy sur https://$DOMAIN"

# 1. Docker et pare-feu
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installation de Docker"
  curl -fsSL https://get.docker.com | sh
fi
apt-get install -y -q git ufw >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow 443/udp >/dev/null
ufw --force enable >/dev/null

# 2. Le code
mkdir -p "$DIR"
if [ -d "$DIR/demos/.git" ]; then
  git -C "$DIR/demos" fetch -q origin main
  git -C "$DIR/demos" reset -q --hard origin/main
else
  git clone -q --depth 1 "$REPO" "$DIR/demos"
fi

# 3. Conteneurs : plateforme + Caddy (HTTPS)
cat > "$DIR/Caddyfile" <<EOF
$DOMAIN {
  encode zstd gzip
  reverse_proxy academy:3000 {
    # L'adresse du visiteur vient de Caddy, jamais d'un en-tête envoyé par le visiteur
    header_up X-Real-IP {remote_host}
  }
}
www.$DOMAIN {
  redir https://$DOMAIN{uri} permanent
}
EOF

cat > "$DIR/docker-compose.yml" <<'EOF'
services:
  academy:
    build:
      context: ./demos
      dockerfile: server/Dockerfile
    restart: unless-stopped
    environment:
      TRUST_PROXY: "1"
    volumes:
      - academy-data:/data
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      - academy
volumes:
  academy-data:
  caddy-data:
  caddy-config:
EOF

echo "==> Construction et démarrage (1 à 3 minutes)"
cd "$DIR"
docker compose up -d --build

# 4. Mise à jour automatique depuis GitHub
cat > "$DIR/mettre-a-jour.sh" <<'EOF'
#!/usr/bin/env bash
# Reconstruit la plateforme quand la branche main de GitHub a changé (lancé toutes les 5 minutes).
set -euo pipefail
cd /opt/hooked
git -C demos fetch -q origin main
if [ "$(git -C demos rev-parse HEAD)" != "$(git -C demos rev-parse origin/main)" ]; then
  git -C demos reset -q --hard origin/main
  docker compose up -d --build academy
  docker image prune -f >/dev/null
  echo "$(date -Is) mis à jour : $(git -C demos log -1 --format=%s)"
fi
EOF
chmod +x "$DIR/mettre-a-jour.sh"

cat > /etc/systemd/system/hooked-maj.service <<EOF
[Unit]
Description=Mise à jour de Hooked Academy depuis GitHub
[Service]
Type=oneshot
ExecStart=$DIR/mettre-a-jour.sh
EOF
cat > /etc/systemd/system/hooked-maj.timer <<'EOF'
[Unit]
Description=Mise à jour de Hooked Academy toutes les 5 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now hooked-maj.timer >/dev/null

echo
docker compose ps
echo
echo "==> Terminé. Dans quelques minutes (le temps du certificat HTTPS) :"
echo "    https://$DOMAIN/            le site"
echo "    https://$DOMAIN/admin/      l'espace équipe (code d'installation la première fois)"
echo "    https://$DOMAIN/api/health  doit afficher {\"ok\":true,...}"
echo "    Journal : cd $DIR && docker compose logs -f"
