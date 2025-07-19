#!/bin/bash

# Script de despliegue simple del servidor MCP Holded
# Uso: bash deploy-simple.sh

set -e

echo "🚀 Iniciando despliegue del servidor MCP Holded..."

# Variables
APP_DIR="/var/www/mcpholded"
REPO_URL="https://github.com/albertlens/mcpholded-nodejs.git"
CONTAINER_NAME="mcpholded-server"
IMAGE_NAME="mcpholded-mcp"
PORT=3000

echo "📁 Preparando directorio de aplicación..."
mkdir -p $APP_DIR
cd $APP_DIR

echo "📦 Clonando/actualizando repositorio..."
if [ -d ".git" ]; then
    git pull origin main
else
    git clone $REPO_URL .
fi

echo "🐳 Deteniendo contenedor anterior (si existe)..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

echo "🔨 Construyendo nueva imagen Docker..."
docker build -t $IMAGE_NAME .

echo "🚀 Iniciando nuevo contenedor..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:3000 \
    -e NODE_ENV=production \
    $IMAGE_NAME

echo "⏳ Esperando que el servidor se inicie..."
sleep 15

echo "🔍 Verificando estado del servidor..."
if curl -f http://localhost:$PORT/health; then
    echo "✅ Servidor desplegado correctamente!"
    echo "🌐 URL: http://localhost:$PORT"
    echo "🔗 MCP URL: http://localhost:$PORT/mcp"
    echo "🌐 Producción: https://mcpholded.robustdatasolutions.com"
    echo "🔗 MCP Producción: https://mcpholded.robustdatasolutions.com/mcp"
else
    echo "❌ Error: El servidor no responde"
    echo "Logs del contenedor:"
    docker logs $CONTAINER_NAME --tail 50
    exit 1
fi

echo "📋 Estado del contenedor:"
docker ps | grep $CONTAINER_NAME

echo ""
echo "🔧 Comandos útiles:"
echo "  Ver logs:        docker logs $CONTAINER_NAME -f"
echo "  Parar:           docker stop $CONTAINER_NAME"
echo "  Eliminar:        docker rm $CONTAINER_NAME"
echo "  Reiniciar:       docker restart $CONTAINER_NAME"
echo "  Entrar al shell: docker exec -it $CONTAINER_NAME sh"

echo "🎉 Despliegue completado exitosamente!"
