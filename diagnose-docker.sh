#!/bin/bash

echo "🔍 Diagnóstico de Docker para Holded MCP Server"
echo "=============================================="

# Información del sistema
echo -e "\n📋 Información del sistema:"
echo "Fecha: $(date)"
echo "Usuario: $(whoami)"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"

# Estado de Docker
echo -e "\n🐳 Estado del servicio Docker:"
sudo systemctl status docker --no-pager -l

# Contenedores relacionados
echo -e "\n📦 Contenedores relacionados con Holded MCP:"
docker ps -a | grep -E "(holded|mcp)" || echo "No se encontraron contenedores relacionados"

# Imágenes relacionadas
echo -e "\n🖼️ Imágenes relacionadas:"
docker images | grep -E "(mcpholded|ghcr.io/albertlens)" || echo "No se encontraron imágenes relacionadas"

# Estado de la red
echo -e "\n🌐 Redes de Docker:"
docker network ls | grep root_default || echo "Red root_default no encontrada"

# Espacio en disco
echo -e "\n💾 Espacio en disco:"
df -h /var/lib/docker

# Logs recientes de Docker
echo -e "\n📝 Logs recientes de Docker (últimas 10 líneas):"
sudo journalctl -u docker.service --no-pager -n 10

# Verificar archivo docker-compose
echo -e "\n📄 Verificando archivos de configuración:"
if [ -f "docker-compose.server.yml" ]; then
    echo "✅ docker-compose.server.yml existe"
    echo "Contenido del servicio holded-mcp:"
    grep -A 20 "holded-mcp:" docker-compose.server.yml | head -n 20
else
    echo "❌ docker-compose.server.yml no encontrado"
fi

# Verificar variables de entorno
echo -e "\n🔐 Variables de entorno:"
if [ -f ".env" ]; then
    echo "✅ Archivo .env existe"
    echo "Variables configuradas (sin mostrar valores):"
    grep -E "^[A-Z_]+" .env | cut -d= -f1 || echo "No se encontraron variables"
else
    echo "❌ Archivo .env no encontrado"
fi

# Test de conectividad a GitHub Container Registry
echo -e "\n🔗 Test de conectividad a GitHub Container Registry:"
if curl -s -f -m 10 https://ghcr.io > /dev/null; then
    echo "✅ Conectividad a ghcr.io OK"
else
    echo "❌ Sin conectividad a ghcr.io"
fi

echo -e "\n✅ Diagnóstico completado"
