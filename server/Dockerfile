# Image de Hooked Academy pour le VPS (installer-vps.sh) : Node seul, aucune dépendance à installer.
# Construite depuis la racine du dépôt (contexte « / », Dockerfile « server/Dockerfile »).
# Données (base SQLite, sauvegardes) dans /data : le volume « academy-data ».
FROM node:24-bookworm-slim

WORKDIR /app
COPY server ./server
COPY sites/hooked-academy ./site

ENV NODE_ENV=production \
    PORT=3000 \
    SITE_DIR=/app/site \
    DATA_DIR=/data \
    TRUST_PROXY=1

RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME /data
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.mjs"]
