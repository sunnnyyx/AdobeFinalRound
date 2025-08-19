# ---------- build frontend ----------
FROM node:20-alpine AS fe
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- build backend ----------
FROM node:20-alpine AS be
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./

# bring in built frontend
RUN mkdir -p /app/backend/public
COPY --from=fe /app/frontend/dist /app/backend/public

# runtime
ENV PORT=8080
EXPOSE 8080

# envs that judges may pass (no defaults here)
# ADOBE_EMBED_API_KEY
# LLM_PROVIDER
# GEMINI_MODEL
# GOOGLE_APPLICATION_CREDENTIALS
# TTS_PROVIDER
# AZURE_TTS_KEY
# AZURE_TTS_ENDPOINT

CMD ["node", "src/server.js"]