# Multi-stage build para optimizar tamaño
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias (incluidas dev)
RUN npm ci

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

# Instalar wget para health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copiar solo archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S holded -u 1001

# Crear directorio para logs y health check endpoint
RUN mkdir -p logs && chown -R holded:nodejs /app
USER holded

# Exponer puerto
EXPOSE 3001

# Health check mejorado
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Comando por defecto
CMD ["node", "dist/index.js"]
