#!/bin/bash

# Script de despliegue completo para servidor MCP Holded (sin git)
set -e

echo "🚀 Desplegando servidor MCP Holded..."

# Variables
PROJECT_DIR="holded-mcp-server"
GITHUB_ZIP_URL="https://github.com/albertlens/mcpholded-nodejs/archive/main.zip"
SERVICE_NAME="holded-mcp-server"
PORT=3000

# 1. Parar proceso anterior si existe
echo "🛑 Parando procesos anteriores..."
pkill -f "holded-mcp-server" || true
pm2 stop $SERVICE_NAME || true
pm2 delete $SERVICE_NAME || true

# 2. Limpiar directorio anterior
echo "🧹 Limpiando instalación anterior..."
rm -rf $PROJECT_DIR
rm -f main.zip

# 3. Descargar código desde GitHub
echo "📦 Descargando código desde GitHub..."
wget $GITHUB_ZIP_URL -O main.zip

# Verificar que unzip está instalado
if ! command -v unzip &> /dev/null; then
    echo "📦 Instalando unzip..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y unzip
    elif command -v yum &> /dev/null; then
        sudo yum install -y unzip
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y unzip
    else
        echo "❌ No se pudo instalar unzip automáticamente"
        echo "   Instala unzip manualmente y ejecuta el script de nuevo"
        exit 1
    fi
fi

unzip -q main.zip
mv mcpholded-nodejs-main $PROJECT_DIR
rm main.zip

# 4. Entrar al directorio del proyecto
cd $PROJECT_DIR

# 5. Verificar que Node.js está instalado
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js instalado: $NODE_VERSION"

# 6. Instalar dependencias
echo "📚 Instalando dependencias..."
npm install

# 7. Configurar archivo .env
echo "⚙️ Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env || echo "# Holded MCP Server Configuration
HOLDED_API_KEY=YOUR_HOLDED_API_KEY
PORT=$PORT" > .env
fi

echo "📝 IMPORTANTE: Configura tu API key de Holded en el archivo .env"
echo "   Edita el archivo: nano .env"
echo "   Cambia: HOLDED_API_KEY=YOUR_HOLDED_API_KEY"
echo "   Por:    HOLDED_API_KEY=tu_api_key_real"

# 8. Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

# 9. Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# 10. Configurar PM2 para iniciar en boot
echo "🔧 Configurando PM2..."
pm2 startup || true

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
pm2 start ecosystem.config.js
pm2 save

# 13. Verificar que el servicio está corriendo
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
    echo "   Configurar:   nano .env"
    echo ""
    echo "🎯 Para Claude.ai usa: https://tu-dominio.com/mcp"
else
    echo "❌ Error: El servidor no está respondiendo"
    echo "🔍 Verificando logs..."
    pm2 logs $SERVICE_NAME --lines 10
    exit 1
fi
