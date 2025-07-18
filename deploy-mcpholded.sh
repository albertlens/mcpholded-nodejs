#!/bin/bash

# ========================================
# Script de despliegue para Holded MCP Server
# ========================================
# Este script debe ejecutarse desde el directorio raíz del servidor

set -e

echo "🚀 Desplegando Holded MCP Server en directorio separado..."

# Crear directorio mcpholded si no existe
if [ ! -d "mcpholded" ]; then
    echo "📁 Creando directorio mcpholded..."
    mkdir mcpholded
fi

cd mcpholded

# Verificar que el directorio principal tiene Traefik corriendo
echo "🔍 Verificando que Traefik esté corriendo..."
if ! docker ps | grep -q "traefik"; then
    echo "❌ Traefik no está corriendo. Ejecuta primero el docker-compose principal."
    exit 1
fi

# Verificar que la red traefik_default existe
echo "🔍 Verificando red de Traefik..."
if ! docker network ls | grep -q "traefik_default"; then
    echo "❌ Red traefik_default no encontrada. Verifica tu configuración de Traefik."
    exit 1
fi

# Descargar archivos si no existen
if [ ! -f "docker-compose.yml" ]; then
    echo "📥 Descargando docker-compose.yml..."
    curl -s -o docker-compose.yml https://raw.githubusercontent.com/TU-USUARIO/holded-mcp-server/main/docker-compose.server.yml
fi

if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << 'EOF'
# HOLDED MCP SERVER - Environment Variables
HOLDED_API_KEY=419a585f2267c947550fd577d6b17350
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
TZ=Europe/Madrid
EOF
    echo "⚠️  Recuerda actualizar HOLDED_API_KEY en .env si es necesario"
fi

# Verificar que la imagen esté disponible
echo "🔍 Verificando imagen Docker..."
docker pull ghcr.io/tu-usuario/holded-mcp-server:latest

# Parar contenedor existente si existe
echo "🛑 Parando contenedor existente..."
docker-compose down 2>/dev/null || true

# Iniciar servicio
echo "▶️  Iniciando Holded MCP Server..."
docker-compose up -d

# Verificar estado
echo "📊 Verificando estado..."
sleep 5
docker-compose ps

# Verificar health check
echo "🏥 Esperando health check..."
sleep 10
if docker-compose ps | grep -q "healthy\|Up"; then
    echo "✅ Holded MCP Server desplegado correctamente!"
    echo "🌐 Disponible en: https://mcpholded.robustdatasolutions.com"
    echo "🏥 Health check: https://mcpholded.robustdatasolutions.com/health"
else
    echo "❌ Problema en el despliegue. Verificando logs..."
    docker-compose logs
fi

echo ""
echo "🔧 Comandos útiles:"
echo "  Ver logs:      cd mcpholded && docker-compose logs -f"
echo "  Reiniciar:     cd mcpholded && docker-compose restart"
echo "  Parar:         cd mcpholded && docker-compose down"
echo "  Estado:        cd mcpholded && docker-compose ps"
