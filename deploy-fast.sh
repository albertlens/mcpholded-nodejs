#!/bin/bash

# Script de despliegue RÁPIDO para servidor MCP Holded (optimizado)
set -e

echo "🚀 Desplegando servidor MCP Holded (versión rápida)..."

# Variables
PROJECT_DIR="holded-mcp-server"
GITHUB_ZIP_URL="https://github.com/albertlens/mcpholded-nodejs/archive/main.zip"
SERVICE_NAME="holded-mcp-server"
PORT=3000

# Configurar para evitar pantallas interactivas desde el inicio
export DEBIAN_FRONTEND=noninteractive

# 1. Parar proceso anterior si existe (sin PM2 por ahora)
echo "🛑 Parando procesos anteriores..."
pkill -f "holded-mcp-server" || true
pkill -f "node.*index.js" || true

# 2. Limpiar directorio anterior
echo "🧹 Limpiando instalación anterior..."
rm -rf $PROJECT_DIR
rm -f main.zip

# 3. Instalar unzip rápidamente si no existe
if ! command -v unzip &> /dev/null; then
    echo "📦 Instalando unzip..."
    sudo -E apt-get install -y -qq unzip --no-install-recommends
fi

# 4. Descargar código desde GitHub
echo "📦 Descargando código desde GitHub..."
wget -q $GITHUB_ZIP_URL -O main.zip
unzip -q main.zip
mv mcpholded-nodejs-main $PROJECT_DIR
rm main.zip

# 5. Entrar al directorio del proyecto
cd $PROJECT_DIR

# 6. Instalar Node.js usando snap (más rápido que apt)
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js con snap (más rápido)..."
    sudo snap install node --classic
    # Verificar instalación
    export PATH=$PATH:/snap/bin
    hash -r
fi

NODE_VERSION=$(node --version 2>/dev/null || echo "Error getting version")
echo "✅ Node.js: $NODE_VERSION"

# 7. Instalar dependencias
echo "📚 Instalando dependencias..."
npm install --silent

# 8. Configurar archivo .env
echo "⚙️ Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || echo "# Holded MCP Server Configuration
HOLDED_API_KEY=YOUR_HOLDED_API_KEY
PORT=$PORT" > .env
fi

echo "📝 IMPORTANTE: Configura tu API key de Holded:"
echo "   nano $PWD/.env"
echo "   Cambia: HOLDED_API_KEY=YOUR_HOLDED_API_KEY"
echo "   Por:    HOLDED_API_KEY=tu_api_key_real"

# 9. Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

# 10. Instalar PM2 globalmente
echo "📦 Instalando PM2..."
npm install -g pm2 --silent

# 11. Crear configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'build/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    }
  }]
};
EOF

# 12. Iniciar el servicio
echo "🚀 Iniciando servicio..."
pm2 start ecosystem.config.js 2>/dev/null || pm2 restart $SERVICE_NAME
pm2 save

# 13. Configurar PM2 para iniciar en boot
echo "🔧 Configurando PM2 startup..."
pm2 startup | grep -E "sudo.*pm2" | bash 2>/dev/null || true

# 14. Verificar que el servicio está corriendo
echo "🔍 Verificando servicio..."
sleep 3

if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
    echo "✅ ¡Servidor MCP desplegado exitosamente!"
    echo ""
    echo "🌐 Endpoints disponibles:"
    echo "   Health Check: http://localhost:$PORT/health"
    echo "   MCP Endpoint: http://localhost:$PORT/mcp"
    echo ""
    echo "📊 Estado del servicio:"
    pm2 status
    echo ""
    echo "📝 Comandos útiles:"
    echo "   Ver logs:     pm2 logs $SERVICE_NAME"
    echo "   Reiniciar:    pm2 restart $SERVICE_NAME"
    echo "   Parar:        pm2 stop $SERVICE_NAME"
    echo "   Configurar:   nano $PWD/.env"
    echo ""
    echo "🎯 Para Claude.ai usa: https://tu-dominio.com/mcp"
else
    echo "❌ Error: El servidor no está respondiendo en puerto $PORT"
    echo "🔍 Verificando logs..."
    pm2 logs $SERVICE_NAME --lines 10 || echo "PM2 no disponible, verificando manualmente..."
    echo "🔍 Intentando iniciar manualmente para debug..."
    cd $PROJECT_DIR && node build/index.js &
    sleep 2
    curl -f http://localhost:$PORT/health || echo "Servidor no responde"
fi

echo ""
echo "🎉 ¡Despliegue completado!"
echo "📍 Directorio: $PWD"
echo "⚙️  Recuerda configurar tu API key de Holded en el archivo .env"
