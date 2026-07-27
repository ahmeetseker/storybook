FROM node:24-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci

FROM dependencies AS build

ARG APP_ORIGIN=https://arsam.net
ENV VITE_APP_ORIGIN=$APP_ORIGIN
COPY . .
RUN npm run build:web

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=build --chown=node:node /app/apps/web/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --spider "http://127.0.0.1:${PORT}/health" || exit 1
CMD ["node", ".output/server/index.mjs"]
