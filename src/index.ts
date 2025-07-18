#!/usr/bin/env node
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import express from 'express';

// Obtener el directorio del archivo actual y buscar .env en el directorio padre
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

// Cargar variables de entorno
dotenv.config({ path: envPath });

// Holded API Client
class HoldedClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.holded.com/api/',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'key': apiKey,
      },
    });
  }

  // Contacts
  async getContacts(page: number = 1) {
    const response = await this.client.get(`invoicing/v1/contacts?page=${page}`);
    return response.data;
  }

  async getContact(contactId: string) {
    const response = await this.client.get(`invoicing/v1/contacts/${contactId}`);
    return response.data;
  }

  async createContact(contactData: any) {
    const response = await this.client.post('invoicing/v1/contacts', contactData);
    return response.data;
  }

  async updateContact(contactId: string, contactData: any) {
    const response = await this.client.put(`invoicing/v1/contacts/${contactId}`, contactData);
    return response.data;
  }

  async deleteContact(contactId: string) {
    const response = await this.client.delete(`invoicing/v1/contacts/${contactId}`);
    return response.data;
  }

  // Products
  async getProducts(page: number = 1) {
    const response = await this.client.get(`invoicing/v1/products?page=${page}`);
    return response.data;
  }

  async getProduct(productId: string) {
    const response = await this.client.get(`invoicing/v1/products/${productId}`);
    return response.data;
  }

  async createProduct(productData: any) {
    const response = await this.client.post('invoicing/v1/products', productData);
    return response.data;
  }

  async updateProduct(productId: string, productData: any) {
    const response = await this.client.put(`invoicing/v1/products/${productId}`, productData);
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.client.delete(`invoicing/v1/products/${productId}`);
    return response.data;
  }

  async updateProductStock(productId: string, stockData: any) {
    const response = await this.client.post(`invoicing/v1/products/${productId}/stock`, stockData);
    return response.data;
  }

  // Documents
  async getDocuments(docType: string, page: number = 1) {
    const response = await this.client.get(`invoicing/v1/documents/${docType}?page=${page}`);
    return response.data;
  }

  async getDocument(docType: string, documentId: string) {
    const response = await this.client.get(`invoicing/v1/documents/${docType}/${documentId}`);
    return response.data;
  }

  async createDocument(docType: string, documentData: any) {
    const response = await this.client.post(`invoicing/v1/documents/${docType}`, documentData);
    return response.data;
  }

  async updateDocument(docType: string, documentId: string, documentData: any) {
    const response = await this.client.put(`invoicing/v1/documents/${docType}/${documentId}`, documentData);
    return response.data;
  }

  async deleteDocument(docType: string, documentId: string) {
    const response = await this.client.delete(`invoicing/v1/documents/${docType}/${documentId}`);
    return response.data;
  }

  async sendDocument(docType: string, documentId: string, emailData: any) {
    const response = await this.client.post(`invoicing/v1/documents/${docType}/${documentId}/send`, emailData);
    return response.data;
  }

  // Invoices (documentos de tipo invoice)
  async getInvoices(page: number = 1) {
    return this.getDocuments('invoice', page);
  }

  async getInvoice(invoiceId: string) {
    return this.getDocument('invoice', invoiceId);
  }

  async createInvoice(invoiceData: any) {
    return this.createDocument('invoice', invoiceData);
  }

  async updateInvoice(invoiceId: string, invoiceData: any) {
    return this.updateDocument('invoice', invoiceId, invoiceData);
  }

  async deleteInvoice(invoiceId: string) {
    return this.deleteDocument('invoice', invoiceId);
  }

  async sendInvoice(invoiceId: string, emailData: any) {
    return this.sendDocument('invoice', invoiceId, emailData);
  }

  // Estimates/Quotes
  async getEstimates(page: number = 1) {
    return this.getDocuments('estimate', page);
  }

  async createEstimate(estimateData: any) {
    return this.createDocument('estimate', estimateData);
  }

  // Purchase Orders
  async getPurchaseOrders(page: number = 1) {
    return this.getDocuments('purchaseorder', page);
  }

  async createPurchaseOrder(purchaseData: any) {
    return this.createDocument('purchaseorder', purchaseData);
  }

  // Bookings
  async getBookingLocations() {
    const response = await this.client.get('crm/v1/bookings/locations');
    return response.data;
  }

  async getBookingSlots(locationId: string, serviceId?: string, day?: string) {
    let url = `crm/v1/bookings/locations/${locationId}/slots`;
    const params = new URLSearchParams();
    
    if (serviceId) {
      params.append('serviceId', serviceId);
    }
    if (day) {
      params.append('day', day);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await this.client.get(url);
    return response.data;
  }

  async getBookings(page: number = 1) {
    const response = await this.client.get(`crm/v1/bookings?page=${page}`);
    return response.data;
  }

  async getBooking(bookingId: string) {
    const response = await this.client.get(`crm/v1/bookings/${bookingId}`);
    return response.data;
  }

  async createBooking(bookingData: any) {
    const response = await this.client.post('crm/v1/bookings', bookingData);
    return response.data;
  }

  async updateBooking(bookingId: string, bookingData: any) {
    const response = await this.client.put(`crm/v1/bookings/${bookingId}`, bookingData);
    return response.data;
  }

  async deleteBooking(bookingId: string) {
    const response = await this.client.delete(`crm/v1/bookings/${bookingId}`);
    return response.data;
  }

  // Services (necesario para bookings)
  async getServices(page: number = 1) {
    const response = await this.client.get(`invoicing/v1/services?page=${page}`);
    return response.data;
  }

  async getService(serviceId: string) {
    const response = await this.client.get(`invoicing/v1/services/${serviceId}`);
    return response.data;
  }

  async createService(serviceData: any) {
    const response = await this.client.post('invoicing/v1/services', serviceData);
    return response.data;
  }
}

// Create server
const server = new Server(
  {
    name: 'holded-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Holded client
let holdedClient: HoldedClient;

// Get API key from environment
const apiKey = process.env.HOLDED_API_KEY;
if (!apiKey) {
  console.error('HOLDED_API_KEY environment variable is required');
  process.exit(1);
}

holdedClient = new HoldedClient(apiKey);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Contact tools
      {
        name: 'get_contacts',
        description: 'Get all contacts from Holded',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_contact',
        description: 'Get a specific contact by ID',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'Contact ID',
            },
          },
          required: ['contactId'],
        },
      },
      {
        name: 'create_contact',
        description: 'Create a new contact',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Contact name',
            },
            email: {
              type: 'string',
              description: 'Contact email',
            },
            phone: {
              type: 'string',
              description: 'Contact phone',
            },
            address: {
              type: 'string',
              description: 'Contact address',
            },
            vatNumber: {
              type: 'string',
              description: 'VAT number',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_contact',
        description: 'Update an existing contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'Contact ID',
            },
            name: {
              type: 'string',
              description: 'Contact name',
            },
            email: {
              type: 'string',
              description: 'Contact email',
            },
            phone: {
              type: 'string',
              description: 'Contact phone',
            },
            address: {
              type: 'string',
              description: 'Contact address',
            },
            vatNumber: {
              type: 'string',
              description: 'VAT number',
            },
          },
          required: ['contactId'],
        },
      },
      {
        name: 'delete_contact',
        description: 'Delete a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'Contact ID',
            },
          },
          required: ['contactId'],
        },
      },
      
      // Product tools
      {
        name: 'get_products',
        description: 'Get all products from Holded',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_product',
        description: 'Get a specific product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'create_product',
        description: 'Create a new product',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Product name',
            },
            sku: {
              type: 'string',
              description: 'Product SKU',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            tax: {
              type: 'number',
              description: 'Tax percentage',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_product',
        description: 'Update an existing product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID',
            },
            name: {
              type: 'string',
              description: 'Product name',
            },
            sku: {
              type: 'string',
              description: 'Product SKU',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            tax: {
              type: 'number',
              description: 'Tax percentage',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'delete_product',
        description: 'Delete a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'update_product_stock',
        description: 'Update product stock',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID',
            },
            stock: {
              type: 'number',
              description: 'New stock quantity',
            },
            warehouseId: {
              type: 'string',
              description: 'Warehouse ID',
            },
          },
          required: ['productId', 'stock'],
        },
      },

      // Invoice tools
      {
        name: 'get_invoices',
        description: 'Get all invoices from Holded',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_invoice',
        description: 'Get a specific invoice by ID',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'Invoice ID',
            },
          },
          required: ['invoiceId'],
        },
      },
      {
        name: 'create_invoice',
        description: 'Create a new invoice',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'Contact ID',
            },
            items: {
              type: 'array',
              description: 'Invoice items',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  units: { type: 'number' },
                  price: { type: 'number' },
                  tax: { type: 'number' },
                  sku: { type: 'string' },
                },
              },
            },
            date: {
              type: 'string',
              description: 'Invoice date (YYYY-MM-DD)',
            },
            dueDate: {
              type: 'string',
              description: 'Due date (YYYY-MM-DD)',
            },
            notes: {
              type: 'string',
              description: 'Invoice notes',
            },
          },
          required: ['contactId', 'items'],
        },
      },
      {
        name: 'update_invoice',
        description: 'Update an existing invoice',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'Invoice ID',
            },
            contactId: {
              type: 'string',
              description: 'Contact ID',
            },
            items: {
              type: 'array',
              description: 'Invoice items',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  units: { type: 'number' },
                  price: { type: 'number' },
                  tax: { type: 'number' },
                  sku: { type: 'string' },
                },
              },
            },
            date: {
              type: 'string',
              description: 'Invoice date (YYYY-MM-DD)',
            },
            dueDate: {
              type: 'string',
              description: 'Due date (YYYY-MM-DD)',
            },
            notes: {
              type: 'string',
              description: 'Invoice notes',
            },
          },
          required: ['invoiceId'],
        },
      },
      {
        name: 'delete_invoice',
        description: 'Delete an invoice',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'Invoice ID',
            },
          },
          required: ['invoiceId'],
        },
      },
      {
        name: 'send_invoice',
        description: 'Send an invoice by email',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'Invoice ID',
            },
            email: {
              type: 'string',
              description: 'Recipient email',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            message: {
              type: 'string',
              description: 'Email message',
            },
          },
          required: ['invoiceId', 'email'],
        },
      },

      // Document tools
      {
        name: 'get_documents',
        description: 'Get documents by type (invoice, estimate, purchase, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            docType: {
              type: 'string',
              description: 'Document type: invoice, salesreceipt, creditnote, salesorder, proform, waybill, estimate, purchase, purchaseorder, purchaserefund',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
          required: ['docType'],
        },
      },
      {
        name: 'get_document',
        description: 'Get a specific document by type and ID',
        inputSchema: {
          type: 'object',
          properties: {
            docType: {
              type: 'string',
              description: 'Document type',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
          },
          required: ['docType', 'documentId'],
        },
      },
      {
        name: 'create_document',
        description: 'Create a new document',
        inputSchema: {
          type: 'object',
          properties: {
            docType: {
              type: 'string',
              description: 'Document type',
            },
            documentData: {
              type: 'object',
              description: 'Document data',
            },
          },
          required: ['docType', 'documentData'],
        },
      },

      // Estimate tools
      {
        name: 'get_estimates',
        description: 'Get all estimates/quotes from Holded',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'create_estimate',
        description: 'Create a new estimate/quote',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'Contact ID',
            },
            items: {
              type: 'array',
              description: 'Estimate items',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  units: { type: 'number' },
                  price: { type: 'number' },
                  tax: { type: 'number' },
                  sku: { type: 'string' },
                },
              },
            },
            date: {
              type: 'string',
              description: 'Estimate date (YYYY-MM-DD)',
            },
            validUntil: {
              type: 'string',
              description: 'Valid until date (YYYY-MM-DD)',
            },
            notes: {
              type: 'string',
              description: 'Estimate notes',
            },
          },
          required: ['contactId', 'items'],
        },
      },

      // Booking tools
      {
        name: 'get_booking_locations',
        description: 'Get all booking locations from Holded',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_booking_slots',
        description: 'Get available slots for a specific booking location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID',
            },
            serviceId: {
              type: 'string',
              description: 'Specific service ID (optional)',
            },
            day: {
              type: 'string',
              description: 'Specific day in yyyy-mm-dd format (optional)',
            },
          },
          required: ['locationId'],
        },
      },
      {
        name: 'get_bookings',
        description: 'Get all bookings from Holded',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_booking',
        description: 'Get a specific booking by ID',
        inputSchema: {
          type: 'object',
          properties: {
            bookingId: {
              type: 'string',
              description: 'Booking ID',
            },
          },
          required: ['bookingId'],
        },
      },
      {
        name: 'create_booking',
        description: 'Create a new booking',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID for the booking',
            },
            contactId: {
              type: 'string',
              description: 'Contact ID for the booking',
            },
            serviceId: {
              type: 'string',
              description: 'Service ID for the booking',
            },
            startDate: {
              type: 'string',
              description: 'Start date and time (ISO format)',
            },
            endDate: {
              type: 'string',
              description: 'End date and time (ISO format)',
            },
            notes: {
              type: 'string',
              description: 'Booking notes',
            },
            status: {
              type: 'string',
              description: 'Booking status (confirmed, pending, cancelled)',
            },
          },
          required: ['locationId', 'contactId', 'serviceId', 'startDate', 'endDate'],
        },
      },
      {
        name: 'update_booking',
        description: 'Update an existing booking',
        inputSchema: {
          type: 'object',
          properties: {
            bookingId: {
              type: 'string',
              description: 'Booking ID',
            },
            locationId: {
              type: 'string',
              description: 'Location ID for the booking',
            },
            contactId: {
              type: 'string',
              description: 'Contact ID for the booking',
            },
            serviceId: {
              type: 'string',
              description: 'Service ID for the booking',
            },
            startDate: {
              type: 'string',
              description: 'Start date and time (ISO format)',
            },
            endDate: {
              type: 'string',
              description: 'End date and time (ISO format)',
            },
            notes: {
              type: 'string',
              description: 'Booking notes',
            },
            status: {
              type: 'string',
              description: 'Booking status (confirmed, pending, cancelled)',
            },
          },
          required: ['bookingId'],
        },
      },
      {
        name: 'delete_booking',
        description: 'Delete a booking',
        inputSchema: {
          type: 'object',
          properties: {
            bookingId: {
              type: 'string',
              description: 'Booking ID',
            },
          },
          required: ['bookingId'],
        },
      },

      // Service tools (needed for bookings)
      {
        name: 'get_services',
        description: 'Get all services from Holded',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_service',
        description: 'Get a specific service by ID',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: {
              type: 'string',
              description: 'Service ID',
            },
          },
          required: ['serviceId'],
        },
      },
      {
        name: 'create_service',
        description: 'Create a new service',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Service name',
            },
            description: {
              type: 'string',
              description: 'Service description',
            },
            price: {
              type: 'number',
              description: 'Service price',
            },
            tax: {
              type: 'number',
              description: 'Tax percentage',
            },
            duration: {
              type: 'number',
              description: 'Service duration in minutes',
            },
          },
          required: ['name'],
        },
      },
    ],
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Contact operations
      case 'get_contacts':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getContacts((args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'get_contact':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getContact((args as any)?.contactId), null, 2),
            },
          ],
        };

      case 'create_contact':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createContact(args), null, 2),
            },
          ],
        };

      case 'update_contact':
        const { contactId, ...updateData } = args as any;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.updateContact(contactId, updateData), null, 2),
            },
          ],
        };

      case 'delete_contact':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.deleteContact((args as any)?.contactId), null, 2),
            },
          ],
        };

      // Product operations
      case 'get_products':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getProducts((args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'get_product':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getProduct((args as any)?.productId), null, 2),
            },
          ],
        };

      case 'create_product':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createProduct(args), null, 2),
            },
          ],
        };

      case 'update_product':
        const { productId, ...productUpdateData } = args as any;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.updateProduct(productId, productUpdateData), null, 2),
            },
          ],
        };

      case 'delete_product':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.deleteProduct((args as any)?.productId), null, 2),
            },
          ],
        };

      case 'update_product_stock':
        const { productId: stockProductId, stock, warehouseId } = args as any;
        const stockData = { stock: { warehouseId, stock } };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.updateProductStock(stockProductId, stockData), null, 2),
            },
          ],
        };

      // Invoice operations
      case 'get_invoices':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getInvoices((args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'get_invoice':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getInvoice((args as any)?.invoiceId), null, 2),
            },
          ],
        };

      case 'create_invoice':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createInvoice(args), null, 2),
            },
          ],
        };

      case 'update_invoice':
        const { invoiceId, ...invoiceUpdateData } = args as any;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.updateInvoice(invoiceId, invoiceUpdateData), null, 2),
            },
          ],
        };

      case 'delete_invoice':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.deleteInvoice((args as any)?.invoiceId), null, 2),
            },
          ],
        };

      case 'send_invoice':
        const { invoiceId: sendInvoiceId, email, subject, message } = args as any;
        const emailData = { email, subject, message };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.sendInvoice(sendInvoiceId, emailData), null, 2),
            },
          ],
        };

      // Document operations
      case 'get_documents':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getDocuments((args as any)?.docType, (args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'get_document':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getDocument((args as any)?.docType, (args as any)?.documentId), null, 2),
            },
          ],
        };

      case 'create_document':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createDocument((args as any)?.docType, (args as any)?.documentData), null, 2),
            },
          ],
        };

      // Estimate operations
      case 'get_estimates':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getEstimates((args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'create_estimate':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createEstimate(args), null, 2),
            },
          ],
        };

      // Booking operations
      case 'get_booking_locations':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getBookingLocations(), null, 2),
            },
          ],
        };

      case 'get_booking_slots':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getBookingSlots(
                (args as any)?.locationId,
                (args as any)?.serviceId,
                (args as any)?.day
              ), null, 2),
            },
          ],
        };

      case 'get_bookings':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getBookings((args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'get_booking':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getBooking((args as any)?.bookingId), null, 2),
            },
          ],
        };

      case 'create_booking':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createBooking(args), null, 2),
            },
          ],
        };

      case 'update_booking':
        const { bookingId: updateBookingId, ...bookingUpdateData } = args as any;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.updateBooking(updateBookingId, bookingUpdateData), null, 2),
            },
          ],
        };

      case 'delete_booking':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.deleteBooking((args as any)?.bookingId), null, 2),
            },
          ],
        };

      // Service operations
      case 'get_services':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getServices((args as any)?.page || 1), null, 2),
            },
          ],
        };

      case 'get_service':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.getService((args as any)?.serviceId), null, 2),
            },
          ],
        };

      case 'create_service':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await holdedClient.createService(args), null, 2),
            },
          ],
        };

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Holded API error: ${errorMessage}`
    );
  }
});

// Añadir servidor HTTP con SSE para Claude.ai y health checks
import { createServer } from 'http';

if (process.env.NODE_ENV === 'production') {
  const app = express();
  
  // Middleware CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Middleware para parsear JSON
  app.use(express.json());

  // Middleware para timeout de requests
  app.use((req, res, next) => {
    // Solo aplicar timeout a endpoints que no sean SSE
    if (!req.path.includes('/sse')) {
      res.setTimeout(30000, () => {
        console.error('Request timeout');
        if (!res.headersSent) {
          res.status(408).json({ error: 'Request timeout' });
        }
      });
    }
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'holded-mcp-server'
    });
  });

  // Endpoint de test para verificar conectividad MCP
  app.get('/test', (req, res) => {
    res.json({
      service: 'holded-mcp-server',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        sse: '/sse (GET/POST)',
        test: '/test'
      },
      mcp: {
        status: 'ready',
        tools: 'Available via SSE connection'
      }
    });
  });

  // SSE endpoint para Claude.ai - Soporta tanto GET como POST
  const handleSSE = async (req: any, res: any) => {
    console.error(`[SSE] Connection request from Claude.ai - Method: ${req.method}`);
    console.error(`[SSE] Headers:`, req.headers);
    console.error(`[SSE] User-Agent: ${req.headers['user-agent']}`);
    
    // Manejar HEAD requests para health checks de MCP
    if (req.method === 'HEAD') {
      console.error(`[SSE] HEAD request detected - responding with SSE headers`);
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-protocol-version',
        'mcp-protocol-version': '2025-06-18'
      });
      res.end();
      return;
    }
    
    // Si es POST, leer el body antes de proceder
    if (req.method === 'POST') {
      console.error(`[SSE] POST request detected, reading body...`);
      let body = '';
      
      // Usar Promise con timeout para evitar colgarse
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.error(`[SSE] Body read timeout, proceeding without body`);
            resolve(void 0);
          }, 2000); // 2 segundos timeout
          
          req.on('data', (chunk: any) => {
            body += chunk.toString();
            console.error(`[SSE] Received chunk: ${chunk.length} bytes`);
          });
          
          req.on('end', () => {
            clearTimeout(timeout);
            console.error(`[SSE] POST body received: ${body}`);
            resolve(void 0);
          });
          
          req.on('error', (error: any) => {
            clearTimeout(timeout);
            console.error(`[SSE] Error reading body:`, error);
            resolve(void 0); // Continuar aunque haya error
          });
        });
      } catch (error) {
        console.error(`[SSE] Body processing error:`, error);
      }
    }
    
    try {
      console.error(`[SSE] Creating new MCP server instance...`);
      
      // Crear un nuevo servidor MCP para cada conexión SSE
      const mcpServer = new Server(
        {
          name: 'holded-mcp-server',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      console.error(`[SSE] Configuring MCP server handlers...`);
      
      // Configurar handlers para este servidor específico - incluir TODAS las herramientas
      mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
        console.error('[SSE] Tools list requested via SSE');
        return {
          tools: [
            // Contact tools
            {
              name: 'get_contacts',
              description: 'Get all contacts from Holded',
              inputSchema: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    description: 'Page number for pagination',
                    default: 1,
                  },
                },
              },
            },
            {
              name: 'get_contact',
              description: 'Get a specific contact by ID',
              inputSchema: {
                type: 'object',
                properties: {
                  contactId: {
                    type: 'string',
                    description: 'Contact ID',
                  },
                },
                required: ['contactId'],
              },
            },
            {
              name: 'create_contact',
              description: 'Create a new contact',
              inputSchema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Contact name',
                  },
                  email: {
                    type: 'string',
                    description: 'Contact email',
                  },
                  phone: {
                    type: 'string',
                    description: 'Contact phone',
                  },
                  address: {
                    type: 'string',
                    description: 'Contact address',
                  },
                  vatNumber: {
                    type: 'string',
                    description: 'VAT number',
                  },
                },
                required: ['name'],
              },
            },
            {
              name: 'update_contact',
              description: 'Update an existing contact',
              inputSchema: {
                type: 'object',
                properties: {
                  contactId: {
                    type: 'string',
                    description: 'Contact ID',
                  },
                  name: {
                    type: 'string',
                    description: 'Contact name',
                  },
                  email: {
                    type: 'string',
                    description: 'Contact email',
                  },
                  phone: {
                    type: 'string',
                    description: 'Contact phone',
                  },
                  address: {
                    type: 'string',
                    description: 'Contact address',
                  },
                  vatNumber: {
                    type: 'string',
                    description: 'VAT number',
                  },
                },
                required: ['contactId'],
              },
            },
            {
              name: 'delete_contact',
              description: 'Delete a contact',
              inputSchema: {
                type: 'object',
                properties: {
                  contactId: {
                    type: 'string',
                    description: 'Contact ID',
                  },
                },
                required: ['contactId'],
              },
            },
            
            // Product tools
            {
              name: 'get_products',
              description: 'Get all products from Holded',
              inputSchema: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    description: 'Page number for pagination',
                    default: 1,
                  },
                },
              },
            },
            {
              name: 'get_product',
              description: 'Get a specific product by ID',
              inputSchema: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    description: 'Product ID',
                  },
                },
                required: ['productId'],
              },
            },
            {
              name: 'create_product',
              description: 'Create a new product',
              inputSchema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Product name',
                  },
                  sku: {
                    type: 'string',
                    description: 'Product SKU',
                  },
                  price: {
                    type: 'number',
                    description: 'Product price',
                  },
                  tax: {
                    type: 'number',
                    description: 'Tax percentage',
                  },
                  description: {
                    type: 'string',
                    description: 'Product description',
                  },
                },
                required: ['name'],
              },
            },

            // Invoice tools
            {
              name: 'get_invoices',
              description: 'Get all invoices from Holded',
              inputSchema: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    description: 'Page number for pagination',
                    default: 1,
                  },
                },
              },
            },
            {
              name: 'get_invoice',
              description: 'Get a specific invoice by ID',
              inputSchema: {
                type: 'object',
                properties: {
                  invoiceId: {
                    type: 'string',
                    description: 'Invoice ID',
                  },
                },
                required: ['invoiceId'],
              },
            },
            {
              name: 'create_invoice',
              description: 'Create a new invoice',
              inputSchema: {
                type: 'object',
                properties: {
                  contactId: {
                    type: 'string',
                    description: 'Contact ID',
                  },
                  items: {
                    type: 'array',
                    description: 'Invoice items',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        units: { type: 'number' },
                        price: { type: 'number' },
                        tax: { type: 'number' },
                        sku: { type: 'string' },
                      },
                    },
                  },
                  date: {
                    type: 'string',
                    description: 'Invoice date (YYYY-MM-DD)',
                  },
                  dueDate: {
                    type: 'string',
                    description: 'Due date (YYYY-MM-DD)',
                  },
                  notes: {
                    type: 'string',
                    description: 'Invoice notes',
                  },
                },
                required: ['contactId', 'items'],
              },
            },

            // Booking tools
            {
              name: 'get_booking_locations',
              description: 'Get all booking locations from Holded',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            {
              name: 'get_bookings',
              description: 'Get all bookings from Holded',
              inputSchema: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    description: 'Page number for pagination',
                    default: 1,
                  },
                },
              },
            },
            {
              name: 'create_booking',
              description: 'Create a new booking',
              inputSchema: {
                type: 'object',
                properties: {
                  locationId: {
                    type: 'string',
                    description: 'Location ID for the booking',
                  },
                  contactId: {
                    type: 'string',
                    description: 'Contact ID for the booking',
                  },
                  serviceId: {
                    type: 'string',
                    description: 'Service ID for the booking',
                  },
                  startDate: {
                    type: 'string',
                    description: 'Start date and time (ISO format)',
                  },
                  endDate: {
                    type: 'string',
                    description: 'End date and time (ISO format)',
                  },
                  notes: {
                    type: 'string',
                    description: 'Booking notes',
                  },
                  status: {
                    type: 'string',
                    description: 'Booking status (confirmed, pending, cancelled)',
                  },
                },
                required: ['locationId', 'contactId', 'serviceId', 'startDate', 'endDate'],
              },
            },

            // Service tools
            {
              name: 'get_services',
              description: 'Get all services from Holded',
              inputSchema: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    description: 'Page number for pagination',
                    default: 1,
                  },
                },
              },
            },
          ],
        };
      });

      console.error(`[SSE] Configuring CallTool handler...`);

      mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
        console.error(`[SSE] Tool called: ${request.params.name}`);
        const { name, arguments: args } = request.params;

        try {
          switch (name) {
            // Contact operations
            case 'get_contacts':
              const contacts = await holdedClient.getContacts((args as any)?.page || 1);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(contacts, null, 2),
                  },
                ],
              };

            case 'get_contact':
              const contact = await holdedClient.getContact((args as any)?.contactId);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(contact, null, 2),
                  },
                ],
              };

            case 'create_contact':
              const newContact = await holdedClient.createContact(args);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(newContact, null, 2),
                  },
                ],
              };

            case 'update_contact':
              const { contactId, ...updateData } = args as any;
              const updatedContact = await holdedClient.updateContact(contactId, updateData);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(updatedContact, null, 2),
                  },
                ],
              };

            case 'delete_contact':
              const deletedContact = await holdedClient.deleteContact((args as any)?.contactId);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(deletedContact, null, 2),
                  },
                ],
              };

            // Product operations
            case 'get_products':
              const products = await holdedClient.getProducts((args as any)?.page || 1);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(products, null, 2),
                  },
                ],
              };

            case 'get_product':
              const product = await holdedClient.getProduct((args as any)?.productId);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(product, null, 2),
                  },
                ],
              };

            case 'create_product':
              const newProduct = await holdedClient.createProduct(args);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(newProduct, null, 2),
                  },
                ],
              };

            // Invoice operations
            case 'get_invoices':
              const invoices = await holdedClient.getInvoices((args as any)?.page || 1);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(invoices, null, 2),
                  },
                ],
              };

            case 'get_invoice':
              const invoice = await holdedClient.getInvoice((args as any)?.invoiceId);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(invoice, null, 2),
                  },
                ],
              };

            case 'create_invoice':
              const newInvoice = await holdedClient.createInvoice(args);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(newInvoice, null, 2),
                  },
                ],
              };

            // Booking operations
            case 'get_booking_locations':
              const locations = await holdedClient.getBookingLocations();
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(locations, null, 2),
                  },
                ],
              };

            case 'get_bookings':
              const bookings = await holdedClient.getBookings((args as any)?.page || 1);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(bookings, null, 2),
                  },
                ],
              };

            case 'create_booking':
              const newBooking = await holdedClient.createBooking(args);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(newBooking, null, 2),
                  },
                ],
              };

            // Service operations
            case 'get_services':
              const services = await holdedClient.getServices((args as any)?.page || 1);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(services, null, 2),
                  },
                ],
              };

            default:
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${name}`
              );
          }
        } catch (error) {
          console.error(`Tool execution error: ${error}`);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new McpError(
            ErrorCode.InternalError,
            `Holded API error: ${errorMessage}`
          );
        }
      });
      
      console.error(`[SSE] Creating SSE transport...`);
      
      // Crear transporte SSE
      const transport = new SSEServerTransport('/sse', res);
      
      console.error(`[SSE] Setting up connection handlers...`);
      
      // Manejar desconexión del cliente
      req.on('close', () => {
        console.error('[SSE] Client disconnected');
        transport.close?.();
      });
      
      req.on('error', (error: any) => {
        console.error('[SSE] Request error:', error);
        transport.close?.();
      });
      
      console.error(`[SSE] Connecting MCP server to transport...`);
      
      // Conectar el servidor MCP al transporte SSE
      await mcpServer.connect(transport);
      
      console.error('[SSE] Transport connected successfully for Claude.ai');
      console.error('[SSE] MCP server is now ready to receive messages');
      
      // Mantener la conexión viva hasta que se cierre
      // El transporte SSE maneja automáticamente los mensajes MCP
      
    } catch (error) {
      console.error('SSE connection error:', error);
      
      // Solo enviar respuesta de error si no se han enviado headers
      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    }
  };

  // Soportar tanto GET como POST para el endpoint SSE
  app.get('/sse', handleSSE);
  app.post('/sse', handleSSE);
  app.head('/sse', handleSSE);

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.error(`Health check and SSE server running on port ${port}`);
    console.error(`Health endpoint: http://localhost:${port}/health`);
    console.error(`SSE endpoint: http://localhost:${port}/sse`);
  });
}

// Start server for stdio (Claude Desktop, VS Code)
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Holded MCP server running on stdio');
}

runServer().catch(console.error);