#!/bin/bash
# Script rápido de despliegue para tu servidor

echo "🚀 Desplegando Holded MCP Server..."

# Crear directorio si no existe
mkdir -p ~/mcpholded
cd ~/mcpholded

# Descargar docker-compose si no existe
if [ ! -f "docker-compose.yml" ]; then
    echo "📥 Descargando docker-compose.yml..."
    wget -O docker-compose.yml https://raw.githubusercontent.com/albertlens/mcpholded-nodejs/main/docker-compose.server.yml
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando .env..."
    cat > .env << 'EOF'
HOLDED_API_KEY=419a585f2267c947550fd577d6b17350
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
TZ=Europe/Madrid
EOF
fi

# Verificar que Traefik esté corriendo
if ! docker ps | grep -q "traefik"; then
    echo "❌ Traefik no está corriendo. Ejecuta primero el docker-compose principal."
    exit 1
fi

# Desplegar
echo "▶️  Desplegando..."
docker-compose down 2>/dev/null || true
docker-compose pull
docker-compose up -d

echo "✅ Desplegado! Verifica en: https://mcpholded.robustdatasolutions.com"
