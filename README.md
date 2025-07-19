# Servidor MCP Holded

Servidor MCP (Model Context Protocol) para integrar las APIs de Holded con Claude.ai, basado en el ejemplo oficial `simpleStreamableHttp.ts` del SDK de TypeScript.

## 🚀 Características

- **13 herramientas de Holded API**:
  - 📞 **Contactos**: get, create, update, delete
  - 📦 **Productos**: get, create, update, delete  
  - 🧾 **Facturas**: get, create, update
  - 📅 **Citas**: get, create
  - 🔧 **Servicios**: get

- **Protocolo MCP Streamable HTTP** con compatibilidad completa con Claude.ai
- **Arquitectura basada en ejemplo oficial** del SDK de TypeScript
- **Gestión de sesiones** automática
- **Validación de esquemas** con Zod
- **Dockerización** para despliegue sencillo

## 🛠 Instalación Local

### Prerrequisitos
- Node.js 18+
- NPM o Yarn
- Git

### Pasos
```bash
# Clonar repositorio
git clone https://github.com/albertlens/mcpholded-nodejs.git
cd mcpholded-nodejs

# Instalar dependencias
npm install

# Construir proyecto
npm run build

# Iniciar servidor
npm start
```

El servidor estará disponible en: http://localhost:3000

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
