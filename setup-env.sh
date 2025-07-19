#!/bin/bash

# Script para configurar archivo .env de forma interactiva
set -e

echo "🔑 Configuración de API Key de Holded"
echo "===================================="
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio del proyecto"
    echo "Cambia a: cd /var/www/mcpholded"
    exit 1
fi

# Hacer backup de .env existente si existe
if [ -f ".env" ]; then
    echo "💾 Haciendo backup del .env existente..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "Para obtener tu API Key de Holded:"
echo "1. Ve a tu panel de Holded"
echo "2. Configuración → API → API Keys"
echo "3. Crear nueva API Key o copiar la existente"
echo "4. Asegurar permisos para: contactos, productos, facturas, citas, servicios"
echo ""

# Solicitar API Key
read -p "Ingresa tu API Key de Holded: " HOLDED_API_KEY

if [ -z "$HOLDED_API_KEY" ]; then
    echo "❌ API Key no puede estar vacía"
    exit 1
fi

# Crear archivo .env
echo "📝 Creando archivo .env..."
cat > .env << EOF
# Configuración del Servidor MCP Holded
NODE_ENV=production
PORT=3000

# API Key de Holded
HOLDED_API_KEY=$HOLDED_API_KEY

# Configuración adicional
DEBUG=false
LOG_LEVEL=info
EOF

# Asegurar permisos
chmod 600 .env

echo "✅ Archivo .env creado exitosamente!"
echo "🔒 Permisos asegurados (solo lectura para propietario)"
echo ""
echo "📋 Configuración actual:"
echo "NODE_ENV=production"
echo "PORT=3000"
echo "HOLDED_API_KEY=[CONFIGURADA]"
echo ""
echo "Ahora puedes ejecutar el despliegue con:"
echo "bash redeploy-clean.sh"
