import axios from 'axios';

async function testPagination() {
    console.log('🚀 Iniciando prueba de paginación...\n');

    // Simular conexión MCP
    const baseURL = 'http://localhost:3000';
    
    try {
        // Primero verificar que el servidor esté funcionando
        console.log('1️⃣ Verificando estado del servidor...');
        const health = await axios.get(`${baseURL}/health`);
        console.log('✅ Servidor funcionando:', health.data);
        console.log('');

        // Preparar datos de prueba para simular cliente MCP
        const mcpRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
                name: "get_all_contacts",
                arguments: {
                    maxPerPage: 5  // Usar un número pequeño para ver múltiples páginas
                }
            }
        };

        console.log('2️⃣ Enviando petición de prueba MCP...');
        console.log('📦 Request:', JSON.stringify(mcpRequest, null, 2));
        console.log('');

        // Esta petición fallará por el auth, pero deberíamos ver los logs del servidor
        try {
            const response = await axios.post(`${baseURL}/mcp`, mcpRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Respuesta MCP:', response.data);
        } catch (error) {
            console.log('⚠️  Error esperado (sin auth):', error.response?.data || error.message);
        }

        console.log('\n3️⃣ Verificar logs del servidor para ver los controles de paginación...');
        console.log('👀 Los logs deberían mostrar:');
        console.log('   - Request recibido');
        console.log('   - Parámetros de paginación (maxPerPage: 5)');
        console.log('   - Detalles del proceso de paginación');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testPagination();
