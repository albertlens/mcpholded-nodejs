#!/bin/bash

echo "🔧 Solucionando problemas de Docker en el servidor..."

# 1. Parar y eliminar contenedores relacionados
echo "📦 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.server.yml down --remove-orphans

# 2. Eliminar contenedores huérfanos específicos
echo "🧹 Limpiando contenedores huérfanos..."
docker container prune -f
docker ps -a | grep holded-mcp | awk '{print $1}' | xargs -r docker rm -f

# 3. Eliminar imágenes locales corruptas
echo "🗑️ Eliminando imágenes locales..."
docker images | grep mcpholded-nodejs | awk '{print $3}' | xargs -r docker rmi -f
docker images | grep ghcr.io/albertlens/mcpholded-nodejs | awk '{print $3}' | xargs -r docker rmi -f

# 4. Limpiar caché de Docker
echo "🧽 Limpiando caché de Docker..."
docker system prune -f
docker volume prune -f

# 5. Forzar descarga de imagen nueva
echo "⬇️ Descargando imagen fresca..."
docker pull ghcr.io/albertlens/mcpholded-nodejs:latest

# 6. Verificar la imagen
echo "🔍 Verificando imagen descargada..."
docker inspect ghcr.io/albertlens/mcpholded-nodejs:latest > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Imagen verificada correctamente"
else
    echo "❌ Error: La imagen no se descargó correctamente"
    exit 1
fi

# 7. Reiniciar Docker daemon si es necesario
echo "🔄 Reiniciando Docker daemon..."
sudo systemctl restart docker
sleep 10

# 8. Intentar levantar el servicio
echo "🚀 Levantando servicio..."
docker-compose -f docker-compose.server.yml up -d

# 9. Verificar estado
echo "📊 Verificando estado..."
sleep 5
docker-compose -f docker-compose.server.yml ps
docker logs holded-mcp-server --tail 20

echo "✅ Proceso completado. Verifica el estado del contenedor arriba."
