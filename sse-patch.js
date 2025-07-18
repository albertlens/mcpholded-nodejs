# Parche para añadir SSE al servidor MCP existente
# Este código se añadiría al index.ts después del servidor HTTP existente

import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';

// Añadir después del servidor HTTP existente para health checks
if (process.env.NODE_ENV === 'production') {
  const app = express();
  
  // Health check existente
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'holded-mcp-server'
    });
  });

  // NUEVO: Endpoint SSE para Claude.ai
  app.post('/sse', async (req, res) => {
    console.error('SSE connection attempt from Claude.ai');
    
    // Configurar SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    try {
      // Crear transporte SSE
      const transport = new SSEServerTransport('/sse', res);
      
      // Conectar el servidor MCP al transporte SSE
      await server.connect(transport);
      
      console.error('SSE transport connected successfully');
      
    } catch (error) {
      console.error('SSE connection error:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // Manejar OPTIONS para CORS
  app.options('/sse', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.error(`Health check server running on port ${port}`);
    console.error(`SSE endpoint available at: /sse`);
  });
}
