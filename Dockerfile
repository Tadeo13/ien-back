# ─── Backend — Node.js 20 Alpine ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (capa cacheada)
COPY package*.json ./
RUN npm ci --only=production

# Copia el código fuente
COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/server.js"]
