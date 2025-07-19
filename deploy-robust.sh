#!/bin/bash

# Script de despliegue robusto para servidor MCP Holded
# Maneja actualizaciones, limpieza y despliegue completo

set -e

echo "🚀 Iniciando despliegue robusto del servidor MCP Holded..."

# Variables
APP_DIR="/var/www/mcpholded"
REPO_URL="https://github.com/albertlens/mcpholded-nodejs.git"
CONTAINER_NAME="mcpholded-server"
IMAGE_NAME="mcpholded-mcp"
PORT=3000
BACKUP_DIR="/var/backups/mcpholded"

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 1. LIMPIEZA PREVIA
log "🧹 Limpiando instalación anterior..."

# Parar contenedor existente
if docker ps -q --filter "name=$CONTAINER_NAME" | grep -q .; then
    log "⏹️ Parando contenedor existente: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
fi

# Eliminar contenedor existente
if docker ps -aq --filter "name=$CONTAINER_NAME" | grep -q .; then
    log "🗑️ Eliminando contenedor existente: $CONTAINER_NAME"
    docker rm $CONTAINER_NAME
fi

# Eliminar imagen anterior (opcional, libera espacio)
if docker images -q $IMAGE_NAME | grep -q .; then
    log "🗑️ Eliminando imagen anterior: $IMAGE_NAME"
    docker rmi $IMAGE_NAME || log "⚠️ No se pudo eliminar imagen anterior (puede estar en uso)"
fi

# 2. PREPARAR DIRECTORIO
log "📁 Preparando directorio de aplicación..."

# Hacer backup de configuraciones anteriores si existen
if [ -d "$APP_DIR" ]; then
    log "💾 Haciendo backup de configuración anterior..."
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r $APP_DIR $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || log "⚠️ Sin backup previo"
fi

# Crear directorio fresh
sudo mkdir -p $APP_DIR
cd $APP_DIR

# 3. OBTENER CÓDIGO
log "📦 Obteniendo código desde GitHub..."
if [ -d ".git" ]; then
    log "🔄 Actualizando repositorio existente..."
    git fetch --all
    git reset --hard origin/main
    git pull origin main
else
    log "📥 Clonando repositorio nuevo..."
    git clone $REPO_URL .
fi

# Mostrar último commit
log "📝 Último commit: $(git log -1 --oneline)"

# 4. CONSTRUIR IMAGEN
log "🔨 Construyendo nueva imagen Docker..."
docker build -t $IMAGE_NAME .

# Verificar que la imagen se construyó correctamente
if ! docker images -q $IMAGE_NAME | grep -q .; then
    log "❌ Error: La imagen no se construyó correctamente"
    exit 1
fi

# 5. DESPLEGAR CONTENEDOR
log "🚀 Desplegando nuevo contenedor..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:3000 \
    -e NODE_ENV=production \
    --label "version=$(git rev-parse --short HEAD)" \
    --label "deployed=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    $IMAGE_NAME

# 6. VERIFICAR DESPLIEGUE
log "⏳ Esperando que el servidor se inicie..."
sleep 15

# Verificar que el contenedor esté corriendo
if ! docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" | grep -q $CONTAINER_NAME; then
    log "❌ Error: El contenedor no está corriendo"
    log "📋 Logs del contenedor:"
    docker logs $CONTAINER_NAME --tail 20
    exit 1
fi

# Verificar health endpoint
log "🔍 Verificando health endpoint..."
for i in {1..6}; do
    if curl -f -s http://localhost:$PORT/health > /dev/null; then
        log "✅ Health check exitoso!"
        break
    else
        if [ $i -eq 6 ]; then
            log "❌ Error: Health check falló después de 6 intentos"
            log "📋 Logs del contenedor:"
            docker logs $CONTAINER_NAME --tail 30
            exit 1
        fi
        log "⏳ Intento $i/6 - Esperando 10s más..."
        sleep 10
    fi
done

# 7. MOSTRAR ESTADO FINAL
log "✅ ¡Despliegue completado exitosamente!"

echo ""
echo "📊 ESTADO FINAL:"
echo "=================="
echo "🌐 URLs disponibles:"
echo "   • Local:       http://localhost:$PORT"
echo "   • Health:      http://localhost:$PORT/health"
echo "   • MCP:         http://localhost:$PORT/mcp"
echo "   • Producción:  https://mcpholded.robustdatasolutions.com"
echo "   • MCP Prod:    https://mcpholded.robustdatasolutions.com/mcp"
echo ""

echo "📋 Información del contenedor:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🏷️ Información de versión:"
docker inspect $CONTAINER_NAME --format '{{range $key, $value := .Config.Labels}}{{$key}}: {{$value}}{{"\n"}}{{end}}' | grep -E "(version|deployed)"

echo ""
echo "🔧 Comandos útiles para futuras actualizaciones:"
echo "   • Ver logs:        docker logs $CONTAINER_NAME -f"
echo "   • Reiniciar:       docker restart $CONTAINER_NAME"  
echo "   • Parar:           docker stop $CONTAINER_NAME"
echo "   • Estado:          docker ps | grep $CONTAINER_NAME"
echo "   • Health check:    curl http://localhost:$PORT/health"
echo "   • Actualizar:      bash $(pwd)/deploy-robust.sh"

echo ""
echo "🎯 Para usar con Claude.ai:"
echo "   URL: https://mcpholded.robustdatasolutions.com/mcp"
echo "   Protocolo: Streamable HTTP"

log "🎉 Despliegue robusto completado!"
