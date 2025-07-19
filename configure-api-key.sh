#!/bin/bash

# Script para configurar API Key de Holded de forma segura
set -e

echo "🔑 Configurando API Key de Holded..."

# Solicitar API Key al usuario
read -p "Ingresa tu API Key de Holded: " HOLDED_API_KEY

if [ -z "$HOLDED_API_KEY" ]; then
    echo "❌ API Key no puede estar vacía"
    exit 1
fi

# Variables
CONTAINER_NAME="mcpholded-server"
IMAGE_NAME="mcpholded-mcp"

echo "🛑 Parando contenedor actual..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

echo "🚀 Desplegando con nueva API Key..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e HOLDED_API_KEY="$HOLDED_API_KEY" \
    $IMAGE_NAME

echo "⏳ Esperando inicio del servidor..."
sleep 10

if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Servidor funcionando con nueva API Key!"
    echo "🔍 Probando conexión con Holded..."
    docker logs $CONTAINER_NAME --tail 20
else
    echo "❌ Error en el servidor"
    docker logs $CONTAINER_NAME --tail 30
    exit 1
fi

echo "✅ API Key configurada exitosamente!"
