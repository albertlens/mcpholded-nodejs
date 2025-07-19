# Instrucciones de Despliegue - Servidor MCP Holded

## 🚀 Resumen del Proyecto

Hemos creado un **servidor MCP funcional** basado en el ejemplo oficial `simpleStreamableHttp.ts` del SDK de TypeScript. Este servidor:

✅ **Funciona localmente** - Probado y verificado en puerto 3000  
✅ **13 herramientas de Holded** integradas correctamente  
✅ **Código actualizado** en GitHub  
✅ **Dockerfile optimizado** para producción  
✅ **Script de despliegue** automatizado  

## 📋 Pasos para Despliegue en Servidor

### 1. Conectar al Servidor
```bash
ssh root@mcpholded.robustdatasolutions.com
```

### 2. Ejecutar el Script de Despliegue
```bash
# Descargar y ejecutar script
curl -o deploy.sh https://raw.githubusercontent.com/albertlens/mcpholded-nodejs/main/deploy-simple.sh
chmod +x deploy.sh
bash deploy.sh
```

### 3. Verificar el Despliegue
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep mcpholded

# Probar health endpoint
curl http://localhost:3000/health

# Ver logs del contenedor
docker logs mcpholded-server -f
```

### 4. Configurar Proxy Reverso (Nginx)

El servidor debería configurarse para que sea accesible en:
- https://mcpholded.robustdatasolutions.com
- https://mcpholded.robustdatasolutions.com/mcp

Configuración Nginx ejemplo:
```nginx
server {
    listen 80;
    server_name mcpholded.robustdatasolutions.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 URLs Finales Esperadas

Después del despliegue exitoso:

- **Servidor Principal**: https://mcpholded.robustdatasolutions.com
- **Health Check**: https://mcpholded.robustdatasolutions.com/health
- **MCP Endpoint**: https://mcpholded.robustdatasolutions.com/mcp

## 🎯 Prueba con Claude.ai

Una vez desplegado, configurar en Claude.ai:

1. Ir a configuración de servidores MCP
2. Agregar servidor:
   - **Nombre**: Holded MCP Server
   - **URL**: `https://mcpholded.robustdatasolutions.com/mcp`
   - **Protocolo**: Streamable HTTP

## 📊 Herramientas Disponibles

El servidor incluye estas 13 herramientas:

### Contactos (4)
- `holded_get_contacts` - Lista contactos
- `holded_create_contact` - Crear contacto  
- `holded_update_contact` - Actualizar contacto
- `holded_delete_contact` - Eliminar contacto

### Productos (4)  
- `holded_get_products` - Lista productos
- `holded_create_product` - Crear producto
- `holded_update_product` - Actualizar producto  
- `holded_delete_product` - Eliminar producto

### Facturas (3)
- `holded_get_invoices` - Lista facturas
- `holded_create_invoice` - Crear factura
- `holded_update_invoice` - Actualizar factura

### Citas (2)
- `holded_get_appointments` - Lista citas
- `holded_create_appointment` - Crear cita

### Servicios (1)
- `holded_get_services` - Lista servicios

## 🔄 Estado Actual

- ✅ **Código Completo**: Servidor MCP funcional basado en ejemplo oficial
- ✅ **Local Testing**: Probado exitosamente en puerto 3000  
- ✅ **GitHub Updated**: Último commit subido correctamente
- ✅ **Docker Ready**: Dockerfile optimizado y funcional
- ⏳ **Despliegue Pendiente**: Listo para desplegar en servidor

## 🚨 Siguiente Paso Crítico

**DESPLEGAR EN EL SERVIDOR** usando el script automatizado y verificar que funcione con Claude.ai.

El servidor está **técnicamente completo** y **listo para producción**.

---

## 💡 Notas Importantes

1. **Basado en Ejemplo Oficial**: El código usa exactamente el mismo patrón que el ejemplo `simpleStreamableHttp.ts` que funciona con Claude.ai
2. **Probado Localmente**: El servidor responde correctamente en local
3. **13 Tools Integradas**: Todas las herramientas de Holded están implementadas
4. **Health Check**: Endpoint `/health` para monitoreo
5. **Script Automatizado**: Despliegue con un solo comando

¡El proyecto está **listo para despliegue final**! 🎉
