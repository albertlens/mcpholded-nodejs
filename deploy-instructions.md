# 🚀 Guía de Despliegue - Holded MCP Server

## Estructura del Servidor (Recomendada)

```
servidor/
├── docker-compose.yml          # Traefik + n8n (tu archivo actual)
├── .env                        # Variables globales
├── evolution-api/              # Tu directorio existente
│   ├── docker-compose.yml
│   └── .env
└── mcpholded/                  # Nuevo directorio (este servicio)
    ├── docker-compose.yml
    └── .env
```

## 1. Preparar el Repositorio en GitHub

```bash
# En tu máquina local (donde tienes el código)
git init
git add .
git commit -m "Initial commit: Holded MCP Server"

# Crear repositorio en GitHub: https://github.com/new
# Nombre: holded-mcp-server

# Conectar con tu repositorio
git remote add origin https://github.com/TU-USUARIO/holded-mcp-server.git
git branch -M main
git push -u origin main

# GitHub Actions construirá automáticamente la imagen Docker
```

## 2. Desplegar en tu Servidor

### Opción A: Script Automático (Recomendado)

```bash
# En tu servidor, desde el directorio raíz (donde tienes traefik)
wget https://raw.githubusercontent.com/TU-USUARIO/holded-mcp-server/main/deploy-mcpholded.sh
chmod +x deploy-mcpholded.sh
./deploy-mcpholded.sh
```

### Opción B: Manual

```bash
# En tu servidor, desde el directorio raíz
mkdir mcpholded
cd mcpholded

# Crear .env
cat > .env << 'EOF'
HOLDED_API_KEY=419a585f2267c947550fd577d6b17350
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
TZ=Europe/Madrid
EOF

# Descargar docker-compose
wget https://raw.githubusercontent.com/TU-USUARIO/holded-mcp-server/main/docker-compose.server.yml -O docker-compose.yml

# Ejecutar
docker-compose up -d
```

## 3. Configurar DNS

Añade este registro en tu proveedor de DNS:
```
mcpholded.robustdatasolutions.com -> IP_DE_TU_SERVIDOR
```

## 4. Verificar Funcionamiento

```bash
# Verificar que está corriendo
cd mcpholded
docker-compose ps

# Ver logs
docker-compose logs -f

# Probar health check
curl https://mcpholded.robustdatasolutions.com/health
```

## 5. Comandos de Mantenimiento

```bash
# Desde el directorio mcpholded/

# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicio
docker-compose restart

# Parar servicio
docker-compose down

# Actualizar a nueva versión
docker-compose pull && docker-compose up -d

# Acceder al contenedor
docker-compose exec holded-mcp sh

# Ver uso de recursos
docker stats holded-mcp-server
```

## 6. Troubleshooting

### Problema: No se conecta a Traefik
```bash
# Verificar que Traefik esté corriendo
docker ps | grep traefik

# Verificar red de Traefik
docker network ls | grep traefik_default

# Si la red no existe, reiniciar Traefik
cd .. && docker-compose restart traefik
```

### Problema: Certificado SSL
```bash
# Verificar logs de Traefik
cd .. && docker-compose logs traefik | grep mcpholded

# El certificado puede tardar unos minutos en generarse
```

### Problema: API Key incorrecta
```bash
# Editar .env
cd mcpholded
nano .env
# Cambiar HOLDED_API_KEY=tu_nueva_key

# Reiniciar
docker-compose restart
```

## 7. Backup y Restore

### Backup
```bash
# Backup de configuración
tar -czf mcpholded-backup-$(date +%Y%m%d).tar.gz mcpholded/
```

### Restore
```bash
# Restaurar configuración
tar -xzf mcpholded-backup-YYYYMMDD.tar.gz
cd mcpholded
docker-compose up -d
```

## URLs del Servicio

- **Aplicación**: https://mcpholded.robustdatasolutions.com
- **Health Check**: https://mcpholded.robustdatasolutions.com/health
- **Logs**: `docker-compose logs -f` desde el directorio mcpholded/
