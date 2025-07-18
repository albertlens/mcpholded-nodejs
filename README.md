# Holded MCP Server

Servidor MCP (Model Context Protocol) para integración con la API de Holded.

## 🚀 Despliegue con Docker

### Opción A: Usar imagen pre-construida desde GitHub Registry

```bash
# 1. Crear directorio y archivo de variables
mkdir holded-mcp && cd holded-mcp
echo "HOLDED_API_KEY=tu_api_key_aqui" > .env

# 2. Descargar docker-compose
curl -O https://raw.githubusercontent.com/tu-usuario/holded-mcp-server/main/docker-compose.server.yml

# 3. Ejecutar
docker-compose -f docker-compose.server.yml up -d
```

### Opción B: Construir localmente

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/holded-mcp-server.git
cd holded-mcp-server

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu HOLDED_API_KEY

# 3. Construir y ejecutar
docker-compose up -d
```

## 🌐 Configuración de Subdominio

El servidor está configurado para funcionar con:
- **Dominio**: `mcpholded.robustdatasolutions.com`
- **Puerto interno**: 3001
- **Health check**: `/health`

### Con Traefik
El archivo `docker-compose.server.yml` incluye las labels de Traefik necesarias.

### Con nginx-proxy
Usar `docker-compose.nginx.yml` si usas nginx-proxy + letsencrypt.

## 📋 Variables de Entorno

```bash
# Requeridas
HOLDED_API_KEY=tu_api_key_de_holded

# Opcionales
PORT=3001
NODE_ENV=production
```

## 🔧 Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicio
docker-compose restart

# Parar servicio
docker-compose down

# Actualizar imagen
docker-compose pull && docker-compose up -d

# Acceder al contenedor
docker-compose exec holded-mcp sh
```

## 📊 Monitoreo

- **Health check**: `https://mcpholded.robustdatasolutions.com/health`
- **Logs**: `docker-compose logs holded-mcp`
- **Métricas**: El contenedor reporta su estado via health checks

## 🔧 Integración con tu Stack

### Si ya tienes Traefik/nginx-proxy:

1. Añade el servicio a tu `docker-compose.yml` existente
2. Asegúrate de usar la misma red (`traefik-public` o `nginx-proxy`)
3. Ajusta el puerto si hay conflictos

### Red existente:
```yaml
networks:
  tu-red-existente:
    external: true
```

## 🛠️ Desarrollo Local

```bash
npm install
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
.
├── src/
│   └── index.ts          # Servidor MCP principal
├── Dockerfile            # Imagen Docker optimizada
├── docker-compose.yml    # Para desarrollo local
├── docker-compose.server.yml  # Para servidor con Traefik
├── docker-compose.nginx.yml   # Para servidor con nginx-proxy
└── .github/workflows/    # CI/CD automático
```
