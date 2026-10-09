# -----------------------------------------------------------------------------
# Integration image.
#
# Gladys sandbox constraints:
# - rootfs mounted READ-ONLY -> never write outside /data
# - a single writable volume: /data
# - runs as a non-root user
# - multi-arch image (linux/amd64 + linux/arm64), see .github/workflows/release.yml
# -----------------------------------------------------------------------------
FROM node:24-alpine

# dumb-init: handles signals (SIGTERM) correctly for a graceful shutdown.
RUN apk add --no-cache dumb-init

WORKDIR /app

# Production dependencies first (better build cache).
# If package-lock.json is committed, the install is reproducible (npm ci).
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && npm cache clean --force

COPY index.js gladys-assistant-integration.json ./

ENV NODE_ENV=production
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]

USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
