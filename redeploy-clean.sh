#!/bin/bash

# Script para forzar redepliegue completo y limpiar cache
set -e

echo "🧹 Limpieza completa y redepliegue..."

# Variables
CONTAINER_NAME="mcpholded-server"
IMAGE_NAME="mcpholded-mcp"

# 1. Parar y eliminar TODO lo anterior
echo "🛑 Parando y eliminando todo contenido anterior..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true
docker rmi $IMAGE_NAME || true
docker system prune -f

# 2. Limpiar directorio y obtener código fresco
echo "📦 Obteniendo código completamente fresco..."
rm -rf /var/www/mcpholded
mkdir -p /var/www/mcpholded
cd /var/www/mcpholded
git clone https://github.com/albertlens/mcpholded-nodejs.git .

# 3. Construir desde cero
echo "🔨 Construyendo imagen desde cero..."
docker build --no-cache -t $IMAGE_NAME .

# 4. Desplegar
echo "🚀 Desplegando nuevo contenedor..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 3000:3000 \
    -e NODE_ENV=production \
    $IMAGE_NAME

# 5. Verificar
echo "⏳ Esperando inicio del servidor..."
sleep 15

if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Servidor funcionando correctamente!"
else
    echo "❌ Error en el servidor"
    docker logs $CONTAINER_NAME --tail 30
    exit 1
fi

echo "✅ Redepliegue completo exitoso!"
