#!/usr/bin/env bash
# Installe le VPS Ubuntu (Hostinger), en root : Hooked Academy et toutes les démos (dont Sarraf).
# Première fois :
#   curl -fsSL https://raw.githubusercontent.com/youcef4000/demos/main/server/installer-vps.sh | bash -s hooked-academy.tech
# Ensuite (ajouter les démos, changer une clé, réparer) :
#   bash /opt/hooked/demos/server/installer-vps.sh
#
# Ce que fait le script (on peut le relancer sans risque, rien n'est effacé) :
#  1. installe Docker et ouvre seulement les ports 22 (SSH), 80 et 443 ;
#  2. récupère le code depuis GitHub dans /opt/hooked/demos ;
#  3. demande une seule fois les clés de Sarraf (fichier /opt/hooked/demos.env, lisible par root seul) ;
#  4. lance les conteneurs : la plateforme Hooked Academy (données dans le volume « academy-data »),
#     le serveur des démos (dossier sites/ du dépôt, en lecture seule) et Caddy, qui gère le HTTPS ;
#  5. installe une mise à jour automatique : toutes les 2 minutes, si GitHub a du nouveau sur « main »,
#     les démos sont en ligne aussitôt, et les serveurs sont reconstruits seulement si leur code a changé.
# Variable facultative : DEMOS_DOMAIN (demos.bornzstudio.com par défaut).
set -euo pipefail

# Tout le script est lu avant de s'exécuter : il met à jour le dépôt qui le contient.
main() {
DIR=/opt/hooked
REPO=https://github.com/youcef4000/demos.git
DOMAIN="${1:-$(cat "$DIR/domaine-academy" 2>/dev/null || echo hooked-academy.tech)}"
DEMOS="${DEMOS_DOMAIN:-$(cat "$DIR/domaine-demos" 2>/dev/null || echo demos.bornzstudio.com)}"

[ "$(id -u)" = 0 ] || { echo "À lancer en root (ssh root@…)"; exit 1; }
ask() { local v; read -r -p "$1" v < /dev/tty; printf '%s' "$v"; }
ask_secret() { local v; read -r -s -p "$1" v < /dev/tty; echo > /dev/tty; printf '%s' "$v"; }
echo "==> Hooked Academy sur https://$DOMAIN, démos sur https://$DEMOS"

# 1. Docker et pare-feu
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installation de Docker"
  curl -fsSL https://get.docker.com | sh
fi
apt-get install -y -q git ufw openssl >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow 443/udp >/dev/null
ufw --force enable >/dev/null

# 2. Le code
mkdir -p "$DIR"
echo "$DOMAIN" > "$DIR/domaine-academy"
echo "$DEMOS" > "$DIR/domaine-demos"
if [ -d "$DIR/demos/.git" ]; then
  git -C "$DIR/demos" fetch -q origin main
  git -C "$DIR/demos" reset -q --hard origin/main
else
  git clone -q --depth 1 "$REPO" "$DIR/demos"
fi

# 3. Clés de Sarraf (saisies une seule fois ; à modifier avec : nano /opt/hooked/demos.env, puis relancer ce script)
ENV="$DIR/demos.env"
if [ ! -f "$ENV" ]; then
  EL='' AN='' CODE=''
  if (exec < /dev/tty) 2>/dev/null; then
    echo
    echo "==> Sarraf (carnet du cambiste) : clés de la transcription et de la lecture des mémos"
    echo "    Rien ne s'affiche quand tu tapes une clé ; Entrée pour la laisser vide (à ajouter plus tard)."
    EL=$(ask_secret "Clé ElevenLabs (Speech to Text) : ")
    AN=$(ask_secret "Clé Anthropic (sk-ant-…) : ")
    CODE=$(ask "Code d'accès de l'application (Entrée pour en créer un) : ")
  fi
  if [ -z "$AN" ] && [ -f "$DIR/hooked-lab.env" ]; then
    AN=$(sed -n 's/^ANTHROPIC_API_KEY=//p' "$DIR/hooked-lab.env")
    if [ -n "$AN" ]; then echo "    Clé Anthropic reprise de Hooked Lab."; fi
  fi
  [ -n "$CODE" ] || CODE=$(openssl rand -hex 10)
  umask 077
  cat > "$ENV" <<EOF
SARRAF_CODE=$CODE
ELEVENLABS_API_KEY=$EL
ANTHROPIC_API_KEY=$AN
EOF
  chmod 600 "$ENV"
  umask 022
  NOUVEAU_CODE=$CODE
fi

# 4. Conteneurs : plateforme + démos + Caddy (HTTPS)
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

$DEMOS {
  encode zstd gzip
  request_body {
    max_size 30MB
  }
  reverse_proxy demos:3000 {
    header_up X-Real-IP {remote_host}
  }
}
EOF
# Hooked Lab installé sur ce VPS (installer-hooked-lab.sh) : son site reste servi
[ -f "$DIR/Caddyfile.lab" ] && cat "$DIR/Caddyfile.lab" >> "$DIR/Caddyfile"

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
  demos:
    build:
      context: ./demos
      dockerfile: server/Dockerfile.demos
    restart: unless-stopped
    env_file: ./demos.env
    volumes:
      - ./demos/sites:/site:ro
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
      - demos
volumes:
  academy-data:
  caddy-data:
  caddy-config:
EOF

echo "==> Construction et démarrage (1 à 3 minutes)"
cd "$DIR"
docker compose up -d --build academy demos caddy
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1 || docker compose restart caddy

# 5. Mise à jour automatique depuis GitHub
cat > "$DIR/mettre-a-jour.sh" <<'EOF'
#!/usr/bin/env bash
# Met le VPS à jour quand la branche main de GitHub a changé (lancé toutes les 2 minutes) :
#  - démos (sites/) : en ligne dès que les fichiers sont à jour, rien à reconstruire ;
#  - Hooked Academy : reconstruite si son site ou son serveur a changé ;
#  - serveur des démos : reconstruit si server/ a changé.
set -euo pipefail
cd /opt/hooked
git -C demos fetch -q origin main
AVANT=$(git -C demos rev-parse HEAD)
APRES=$(git -C demos rev-parse origin/main)
[ "$AVANT" = "$APRES" ] && exit 0
CHANGES=$(git -C demos diff --name-only "$AVANT" "$APRES" 2>/dev/null || echo server/)
git -C demos reset -q --hard origin/main
if grep -qE '^(server/|sites/hooked-academy/)' <<< "$CHANGES"; then docker compose up -d --build academy; fi
if grep -qE '^server/' <<< "$CHANGES"; then docker compose up -d --build demos; fi
docker image prune -f >/dev/null
echo "$(date -Is) mis à jour : $(git -C demos log -1 --format=%s)"
EOF
chmod +x "$DIR/mettre-a-jour.sh"

cat > /etc/systemd/system/hooked-maj.service <<EOF
[Unit]
Description=Mise à jour de Hooked Academy et des démos depuis GitHub
[Service]
Type=oneshot
ExecStart=$DIR/mettre-a-jour.sh
EOF
cat > /etc/systemd/system/hooked-maj.timer <<'EOF'
[Unit]
Description=Mise à jour de Hooked Academy et des démos toutes les 2 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now hooked-maj.timer >/dev/null
systemctl restart hooked-maj.timer

ETAT=000
for _ in $(seq 20); do
  ETAT=$(docker compose exec -T demos node -e "fetch('http://127.0.0.1:3000/sante').then((r) => console.log(r.status)).catch(() => console.log(0))" 2>/dev/null || echo 0)
  [ "$ETAT" = 200 ] && break
  sleep 2
done
IP=$(curl -fsS -4 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')

echo
docker compose ps
echo
echo "==> Terminé. Serveur des démos : $ETAT (200 = prêt)."
echo "    https://$DOMAIN/            Hooked Academy (https://$DOMAIN/api/health doit afficher {\"ok\":true,...})"
echo "    https://$DEMOS/      toutes les démos, par exemple https://$DEMOS/sarraf/"
echo
echo "    Si $DEMOS affiche encore une page GitHub : dans le DNS de ${DEMOS#*.}, supprimer l'ancien"
echo "    enregistrement « ${DEMOS%%.*} » et ajouter : type A, nom ${DEMOS%%.*}, valeur $IP (sans proxy)."
if [ -n "${NOUVEAU_CODE:-}" ]; then
  echo
  echo "    Code d'accès de Sarraf (à saisir une fois dans Réglages de l'application, puis à garder pour toi) :"
  echo "        $NOUVEAU_CODE"
fi
echo "    Journal : cd $DIR && docker compose logs -f demos"
}

main "$@"
