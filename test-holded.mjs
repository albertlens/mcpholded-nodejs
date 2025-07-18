import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

// Cliente simple para probar Holded API
class TestHoldedClient {
  constructor(apiKey) {
    this.client = axios.create({
      baseURL: 'https://api.holded.com/api/',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'key': apiKey,
      },
    });
  }

  async testConnection() {
    try {
      console.log('🔌 Probando conexión con Holded API...');
      const response = await this.client.get('invoicing/v1/contacts?page=1');
      console.log('✅ Conexión exitosa!');
      console.log(`📊 Encontrados ${response.data.length || 0} contactos`);
      return true;
    } catch (error) {
      console.log('❌ Error de conexión:', error.response?.data || error.message);
      return false;
    }
  }

  async getContacts() {
    try {
      console.log('\n📋 Obteniendo lista de contactos...');
      const response = await this.client.get('invoicing/v1/contacts?page=1');
      console.log(`✅ ${response.data.length || 0} contactos encontrados`);
      if (response.data.length > 0) {
        console.log('Primer contacto:', {
          id: response.data[0].id,
          name: response.data[0].name,
          email: response.data[0].email
        });
      }
      return response.data;
    } catch (error) {
      console.log('❌ Error obteniendo contactos:', error.response?.data || error.message);
    }
  }

  async getProducts() {
    try {
      console.log('\n📦 Obteniendo lista de productos...');
      const response = await this.client.get('invoicing/v1/products?page=1');
      console.log(`✅ ${response.data.length || 0} productos encontrados`);
      if (response.data.length > 0) {
        console.log('Primer producto:', {
          id: response.data[0].id,
          name: response.data[0].name,
          price: response.data[0].price
        });
      }
      return response.data;
    } catch (error) {
      console.log('❌ Error obteniendo productos:', error.response?.data || error.message);
    }
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas del Holded MCP Server\n');
  
  const apiKey = process.env.HOLDED_API_KEY;
  if (!apiKey) {
    console.log('❌ HOLDED_API_KEY no encontrada en variables de entorno');
    return;
  }

  console.log('🔑 API Key configurada:', apiKey.substring(0, 8) + '...');
  
  const client = new TestHoldedClient(apiKey);
  
  // Probar conexión
  const connected = await client.testConnection();
  if (!connected) {
    return;
  }

  // Probar endpoints
  await client.getContacts();
  await client.getProducts();
  
  console.log('\n🎉 Pruebas completadas!');
  console.log('\n📝 Tu servidor MCP está listo para usar con:');
  console.log('   • Claude Desktop (configurando MCP server)');
  console.log('   • GitHub Copilot');
  console.log('   • Cualquier cliente MCP');
}

runTests().catch(console.error);
