# --- Base image ---
FROM node:18-alpine AS base
WORKDIR /app

# --- Build client ---
FROM base AS client-build
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build

# --- Build server ---
FROM base AS server-build
COPY server ./server
WORKDIR /app/server
RUN npm install || true

# --- Production image ---
FROM node:18-alpine AS prod
WORKDIR /app

# Copy server code
COPY --from=server-build /app/server ./server
# Copy built client static files
COPY --from=client-build /app/client/dist ./server/public

WORKDIR /app/server

# Install only production dependencies
RUN npm install --omit=dev || true

EXPOSE 5000
CMD ["npm", "run", "start"] 