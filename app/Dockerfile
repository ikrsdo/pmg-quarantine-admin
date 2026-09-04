# Stage 1: build the frontend static assets
FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: production image - single Express process serves both /api/*
# and the built frontend as static files (see backend/src/server.js).
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY backend/src ./src
COPY --from=frontend-build /build/frontend/dist ./public

# Run as the non-root user node:22-alpine already ships, instead of root.
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
