#!/bin/bash
# Script para actualizar el servidor MCP con soporte SSE

echo "🚀 Actualizando servidor MCP Holded con soporte SSE..."

# 1. Hacer commit y push de los cambios
echo "📦 Haciendo commit de los cambios..."
git add .
git commit -m "feat: añadir soporte SSE para Claude.ai web - endpoint /sse"
git push origin main

echo "⏳ Esperando 30 segundos para que GitHub Actions construya la imagen..."
sleep 30

# 2. Conectar al servidor y actualizar
echo "🔄 Conectando al servidor para actualizar..."
ssh root@robustdatasolutions.com << 'EOF'
cd /root/mcpholded

echo "📥 Actualizando imagen Docker..."
docker-compose -f docker-compose.server.yml pull

echo "🔄 Reiniciando contenedor..."
docker-compose -f docker-compose.server.yml down
docker-compose -f docker-compose.server.yml up -d

echo "✅ Verificando estado del contenedor..."
docker-compose -f docker-compose.server.yml ps

echo "🏥 Probando health check..."
sleep 5
curl -s https://mcpholded.robustdatasolutions.com/health | jq

echo "🔌 Probando endpoint SSE..."
curl -s -X POST https://mcpholded.robustdatasolutions.com/sse -H "Content-Type: application/json" --max-time 5

echo "📋 Logs del contenedor (últimas 20 líneas):"
docker-compose -f docker-compose.server.yml logs --tail=20 holded-mcp

EOF

echo "✨ ¡Actualización completada!"
echo ""
echo "🌐 Endpoints disponibles:"
echo "   Health Check: https://mcpholded.robustdatasolutions.com/health"
echo "   SSE (Claude.ai): https://mcpholded.robustdatasolutions.com/sse"
echo ""
echo "🔧 Para Claude.ai, usar la URL: https://mcpholded.robustdatasolutions.com/sse"
