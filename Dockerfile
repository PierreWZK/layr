# Image de production pour Coolify. NODE_ENV n'est défini qu'à l'exécution :
# en variable de build, `npm ci` n'installerait pas les outils de build.
# Base Debian (pas alpine) : Chromium de Playwright exige glibc.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright MEDIA_DIR=/data/media
COPY --from=build /app/node_modules ./node_modules
# Chromium + ses dépendances système, à la version de Playwright du projet (captures de l'admin)
RUN npx playwright install --with-deps chromium && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/package.json ./
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/db ./db
COPY --from=build /app/scripts ./scripts
RUN mkdir -p /data/media && chown -R node:node /data /app/.next
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD node -e "fetch('http://127.0.0.1:3000/fr').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Migrations puis catalogue de départ (seulement si la base est vide), puis serveur
CMD ["sh", "-c", "node scripts/migrate.mjs && node scripts/seed-websites.mjs --if-empty && exec node_modules/.bin/next start"]
