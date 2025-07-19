import 'dotenv/config';
import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolResult, GetPromptResult, isInitializeRequest, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryEventStore } from '@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js';
import cors from 'cors';
import axios from 'axios';

// Holded API client
class HoldedClient {
  private apiKey: string;
  private baseUrl = 'https://api.holded.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(method: string, endpoint: string, data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'key': this.apiKey
    };
    
    console.log(`🔥 HOLDED API REQUEST:`, {
      method,
      url,
      headers: { ...headers, key: this.apiKey ? `[${this.apiKey.substring(0,8)}...]` : 'MISSING' },
      dataLength: data ? JSON.stringify(data).length : 0
    });

    try {
      const response = await axios({
        method,
        url,
        headers,
        data
      });
      
      console.log(`✅ HOLDED API RESPONSE:`, {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataLength: JSON.stringify(response.data).length
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ HOLDED API ERROR:`, {
        url,
        method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorMessage: error.message,
        responseData: error.response?.data ? JSON.stringify(error.response.data).substring(0, 500) : 'No response data'
      });
      throw error;
    }
  }

  // Contact operations
  async getContacts(page = 1) {
    return this.request('GET', `/invoicing/v1/contacts?page=${page}`);
  }

  async getContact(contactId: string) {
    return this.request('GET', `/invoicing/v1/contacts/${contactId}`);
  }

  async createContact(contactData: any) {
    return this.request('POST', '/invoicing/v1/contacts', contactData);
  }

  async updateContact(contactId: string, contactData: any) {
    return this.request('PUT', `/invoicing/v1/contacts/${contactId}`, contactData);
  }

  async deleteContact(contactId: string) {
    return this.request('DELETE', `/invoicing/v1/contacts/${contactId}`);
  }

  // Product operations
  async getProducts(page = 1) {
    return this.request('GET', `/catalog/v1/products?page=${page}`);
  }

  async getProduct(productId: string) {
    return this.request('GET', `/catalog/v1/products/${productId}`);
  }

  async createProduct(productData: any) {
    return this.request('POST', '/catalog/v1/products', productData);
  }

  // Invoice operations
  async getInvoices(page = 1) {
    return this.request('GET', `/invoicing/v1/documents/invoice?page=${page}`);
  }

  async getInvoice(invoiceId: string) {
    return this.request('GET', `/invoicing/v1/documents/invoice/${invoiceId}`);
  }

  async createInvoice(invoiceData: any) {
    return this.request('POST', '/invoicing/v1/documents/invoice', invoiceData);
  }

  // Booking operations (usando appointments ya que bookings no existe en API v1)
  async getBookings(page = 1) {
    return this.request('GET', `/calendar/v1/appointments?page=${page}`);
  }

  async createBooking(bookingData: any) {
    return this.request('POST', '/calendar/v1/appointments', bookingData);
  }

  // Service operations
  async getServices(page = 1) {
    return this.request('GET', `/catalog/v1/services?page=${page}`);
  }
}

// Initialize Holded client
const holdedClient = new HoldedClient(process.env.HOLDED_API_KEY || 'demo-key');

// Create MCP server with Holded tools
const getServer = () => {
  const server = new McpServer({
    name: 'holded-mcp-server',
    version: '1.0.0'
  }, { 
    capabilities: { 
      logging: {},
      tools: {}
    } 
  });

  // Contact tools
  server.tool('get_contacts', 'Get all contacts from Holded', {
    page: z.number().optional().describe('Page number for pagination')
  }, async ({ page = 1 }): Promise<CallToolResult> => {
    console.log(`🔧 MCP TOOL CALLED: get_contacts with page=${page}`);
    try {
      const contacts = await holdedClient.getContacts(page);
      console.log(`✅ get_contacts SUCCESS: Got ${Array.isArray(contacts) ? contacts.length : 'unknown'} items`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(contacts, null, 2)
        }]
      };
    } catch (error: any) {
      console.error(`❌ get_contacts FAILED: ${error.message}`);
      return {
        content: [{
          type: 'text',
          text: `Error fetching contacts: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('get_contact', 'Get a specific contact by ID', {
    contactId: z.string().describe('The contact ID')
  }, async ({ contactId }): Promise<CallToolResult> => {
    try {
      const contact = await holdedClient.getContact(contactId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(contact, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching contact: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('create_contact', 'Create a new contact in Holded', {
    name: z.string().describe('Contact name'),
    email: z.string().optional().describe('Contact email'),
    phone: z.string().optional().describe('Contact phone'),
    code: z.string().optional().describe('Contact code/reference'),
    tradename: z.string().optional().describe('Trade name'),
    vatnumber: z.string().optional().describe('VAT number'),
    clientType: z.string().optional().describe('Client type (client, provider, both)')
  }, async (args): Promise<CallToolResult> => {
    try {
      const contact = await holdedClient.createContact(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(contact, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error creating contact: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('update_contact', 'Update a contact in Holded', {
    contactId: z.string().describe('The contact ID'),
    contactData: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      tradename: z.string().optional(),
      vatnumber: z.string().optional()
    }).describe('Contact data to update')
  }, async ({ contactId, contactData }): Promise<CallToolResult> => {
    try {
      const contact = await holdedClient.updateContact(contactId, contactData);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(contact, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error updating contact: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('delete_contact', 'Delete a contact from Holded', {
    contactId: z.string().describe('The contact ID')
  }, async ({ contactId }): Promise<CallToolResult> => {
    try {
      const result = await holdedClient.deleteContact(contactId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error deleting contact: ${error.message}`
        }],
        isError: true
      };
    }
  });

  // Product tools
  server.tool('get_products', 'Get all products from Holded', {
    page: z.number().optional().describe('Page number for pagination')
  }, async ({ page = 1 }): Promise<CallToolResult> => {
    try {
      const products = await holdedClient.getProducts(page);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(products, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching products: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('get_product', 'Get a specific product by ID', {
    productId: z.string().describe('The product ID')
  }, async ({ productId }): Promise<CallToolResult> => {
    try {
      const product = await holdedClient.getProduct(productId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(product, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching product: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('create_product', 'Create a new product in Holded', {
    name: z.string().describe('Product name'),
    code: z.string().optional().describe('Product code'),
    description: z.string().optional().describe('Product description'),
    sellPrice: z.number().optional().describe('Selling price'),
    costPrice: z.number().optional().describe('Cost price'),
    tax: z.number().optional().describe('Tax percentage'),
    provider: z.string().optional().describe('Provider contact ID'),
    category: z.string().optional().describe('Product category')
  }, async (args): Promise<CallToolResult> => {
    try {
      const product = await holdedClient.createProduct(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(product, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error creating product: ${error.message}`
        }],
        isError: true
      };
    }
  });

  // Invoice tools
  server.tool('get_invoices', 'Get all invoices from Holded', {
    page: z.number().optional().describe('Page number for pagination')
  }, async ({ page = 1 }): Promise<CallToolResult> => {
    try {
      const invoices = await holdedClient.getInvoices(page);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(invoices, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching invoices: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('get_invoice', 'Get a specific invoice by ID', {
    invoiceId: z.string().describe('The invoice ID')
  }, async ({ invoiceId }): Promise<CallToolResult> => {
    try {
      const invoice = await holdedClient.getInvoice(invoiceId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(invoice, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching invoice: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('create_invoice', 'Create a new invoice in Holded', {
    contactId: z.string().describe('Client contact ID'),
    items: z.array(z.object({
      productId: z.string().optional(),
      units: z.number().optional(),
      subtotal: z.number().optional(),
      discount: z.number().optional(),
      tax: z.number().optional()
    })).describe('Invoice items'),
    desc: z.string().optional().describe('Invoice description'),
    notes: z.string().optional().describe('Invoice notes')
  }, async (args): Promise<CallToolResult> => {
    try {
      const invoice = await holdedClient.createInvoice(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(invoice, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error creating invoice: ${error.message}`
        }],
        isError: true
      };
    }
  });

  // Booking tools
  server.tool('get_bookings', 'Get all bookings from Holded', {
    page: z.number().optional().describe('Page number for pagination')
  }, async ({ page = 1 }): Promise<CallToolResult> => {
    try {
      const bookings = await holdedClient.getBookings(page);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(bookings, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching bookings: ${error.message}`
        }],
        isError: true
      };
    }
  });

  server.tool('create_booking', 'Create a new booking in Holded', {
    locationId: z.string().describe('Location ID for the booking'),
    contactId: z.string().describe('Contact ID for the booking'),
    serviceId: z.string().describe('Service ID for the booking'),
    startDate: z.string().describe('Start date and time (ISO format)'),
    endDate: z.string().describe('End date and time (ISO format)'),
    status: z.string().optional().describe('Booking status (confirmed, pending, cancelled)')
  }, async (args): Promise<CallToolResult> => {
    try {
      const booking = await holdedClient.createBooking(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(booking, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error creating booking: ${error.message}`
        }],
        isError: true
      };
    }
  });

  // Service tools
  server.tool('get_services', 'Get all services from Holded', {
    page: z.number().optional().describe('Page number for pagination')
  }, async ({ page = 1 }): Promise<CallToolResult> => {
    try {
      const services = await holdedClient.getServices(page);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(services, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching services: ${error.message}`
        }],
        isError: true
      };
    }
  });

  return server;
};

const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id']
}));

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// MCP POST endpoint
app.post('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  
  if (sessionId) {
    console.log(`Received MCP request for session: ${sessionId}`);
  } else {
    console.log('Request body:', req.body);
  }

  try {
    let transport: StreamableHTTPServerTransport;
    
    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      const eventStore = new InMemoryEventStore();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        eventStore, // Enable resumability
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID when session is initialized
          console.log(`Session initialized with ID: ${sessionId}`);
          transports[sessionId] = transport;
        }
      });

      // Set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}, removing from transports map`);
          delete transports[sid];
        }
      };

      // Connect the transport to the MCP server
      const server = getServer();
      await server.connect(transport);

      await transport.handleRequest(req, res, req.body);
      return; // Already handled
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    // Handle the request with existing transport - no need to reconnect
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Handle GET requests for SSE streams
app.get('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Establishing SSE stream for session ${sessionId}`);
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'holded-mcp-server'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error: any) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`Holded MCP Server listening on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  
  console.log('Server shutdown complete');
  process.exit(0);
});
