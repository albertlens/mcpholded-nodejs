#!/bin/bash

# Script de despliegue para servidor MCP de Holded
# Uso: ./deploy.sh [desarrollo|produccion]

set -e

ENVIRONMENT=${1:-desarrollo}
PROJECT_NAME="holded-mcp"
IMAGE_NAME="holded-mcp-server"

echo "🚀 Desplegando $PROJECT_NAME en modo: $ENVIRONMENT"

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

# Verificar puertos disponibles
echo "🔍 Verificando puertos disponibles..."
if netstat -tuln | grep -q ":3001 "; then
    echo "⚠️  Puerto 3001 está ocupado. Considera cambiar el puerto en docker-compose.yml"
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Construir imagen
echo "🔨 Construyendo imagen Docker..."
docker build -t $IMAGE_NAME:latest .

# Verificar variables de entorno
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado"
    exit 1
fi

# Parar contenedor existente si existe
echo "🛑 Parando contenedor existente..."
docker-compose down || true

# Iniciar servicios
echo "▶️  Iniciando servicios..."
if [ "$ENVIRONMENT" = "produccion" ]; then
    docker-compose up -d
else
    docker-compose up -d
    echo "📋 Logs en tiempo real (Ctrl+C para salir):"
    docker-compose logs -f
fi

echo "✅ Despliegue completado!"
echo "📊 Estado del contenedor:"
docker-compose ps

echo ""
echo "🔧 Comandos útiles:"
echo "  Ver logs:      docker-compose logs -f"
echo "  Parar:         docker-compose down"
echo "  Reiniciar:     docker-compose restart"
echo "  Estado:        docker-compose ps"
echo "  Shell:         docker-compose exec holded-mcp sh"
