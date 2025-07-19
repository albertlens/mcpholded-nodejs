#!/usr/bin/env node
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import express from 'express';
import { randomUUID } from 'node:crypto';
// Obtener el directorio del archivo actual y buscar .env en el directorio padre
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
// Cargar variables de entorno
dotenv.config({ path: envPath });
// Holded API Client
class HoldedClient {
    client;
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
    // Contacts
    async getContacts(page = 1) {
        const response = await this.client.get(`invoicing/v1/contacts?page=${page}`);
        return response.data;
    }
    async getContact(contactId) {
        const response = await this.client.get(`invoicing/v1/contacts/${contactId}`);
        return response.data;
    }
    async createContact(contactData) {
        const response = await this.client.post('invoicing/v1/contacts', contactData);
        return response.data;
    }
    async updateContact(contactId, contactData) {
        const response = await this.client.put(`invoicing/v1/contacts/${contactId}`, contactData);
        return response.data;
    }
    async deleteContact(contactId) {
        const response = await this.client.delete(`invoicing/v1/contacts/${contactId}`);
        return response.data;
    }
    // Products
    async getProducts(page = 1) {
        const response = await this.client.get(`invoicing/v1/products?page=${page}`);
        return response.data;
    }
    async getProduct(productId) {
        const response = await this.client.get(`invoicing/v1/products/${productId}`);
        return response.data;
    }
    async createProduct(productData) {
        const response = await this.client.post('invoicing/v1/products', productData);
        return response.data;
    }
    async updateProduct(productId, productData) {
        const response = await this.client.put(`invoicing/v1/products/${productId}`, productData);
        return response.data;
    }
    async deleteProduct(productId) {
        const response = await this.client.delete(`invoicing/v1/products/${productId}`);
        return response.data;
    }
    async updateProductStock(productId, stockData) {
        const response = await this.client.post(`invoicing/v1/products/${productId}/stock`, stockData);
        return response.data;
    }
    // Documents
    async getDocuments(docType, page = 1) {
        const response = await this.client.get(`invoicing/v1/documents/${docType}?page=${page}`);
        return response.data;
    }
    async getDocument(docType, documentId) {
        const response = await this.client.get(`invoicing/v1/documents/${docType}/${documentId}`);
        return response.data;
    }
    async createDocument(docType, documentData) {
        const response = await this.client.post(`invoicing/v1/documents/${docType}`, documentData);
        return response.data;
    }
    async updateDocument(docType, documentId, documentData) {
        const response = await this.client.put(`invoicing/v1/documents/${docType}/${documentId}`, documentData);
        return response.data;
    }
    async deleteDocument(docType, documentId) {
        const response = await this.client.delete(`invoicing/v1/documents/${docType}/${documentId}`);
        return response.data;
    }
    async sendDocument(docType, documentId, emailData) {
        const response = await this.client.post(`invoicing/v1/documents/${docType}/${documentId}/send`, emailData);
        return response.data;
    }
    // Invoices (documentos de tipo invoice)
    async getInvoices(page = 1) {
        return this.getDocuments('invoice', page);
    }
    async getInvoice(invoiceId) {
        return this.getDocument('invoice', invoiceId);
    }
    async createInvoice(invoiceData) {
        return this.createDocument('invoice', invoiceData);
    }
    async updateInvoice(invoiceId, invoiceData) {
        return this.updateDocument('invoice', invoiceId, invoiceData);
    }
    async deleteInvoice(invoiceId) {
        return this.deleteDocument('invoice', invoiceId);
    }
    async sendInvoice(invoiceId, emailData) {
        return this.sendDocument('invoice', invoiceId, emailData);
    }
    // Estimates/Quotes
    async getEstimates(page = 1) {
        return this.getDocuments('estimate', page);
    }
    async createEstimate(estimateData) {
        return this.createDocument('estimate', estimateData);
    }
    // Purchase Orders
    async getPurchaseOrders(page = 1) {
        return this.getDocuments('purchaseorder', page);
    }
    async createPurchaseOrder(purchaseData) {
        return this.createDocument('purchaseorder', purchaseData);
    }
    // Bookings
    async getBookingLocations() {
        const response = await this.client.get('crm/v1/bookings/locations');
        return response.data;
    }
    async getBookingSlots(locationId, serviceId, day) {
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
    async getBookings(page = 1) {
        const response = await this.client.get(`crm/v1/bookings?page=${page}`);
        return response.data;
    }
    async getBooking(bookingId) {
        const response = await this.client.get(`crm/v1/bookings/${bookingId}`);
        return response.data;
    }
    async createBooking(bookingData) {
        const response = await this.client.post('crm/v1/bookings', bookingData);
        return response.data;
    }
    async updateBooking(bookingId, bookingData) {
        const response = await this.client.put(`crm/v1/bookings/${bookingId}`, bookingData);
        return response.data;
    }
    async deleteBooking(bookingId) {
        const response = await this.client.delete(`crm/v1/bookings/${bookingId}`);
        return response.data;
    }
    // Services (necesario para bookings)
    async getServices(page = 1) {
        const response = await this.client.get(`invoicing/v1/services?page=${page}`);
        return response.data;
    }
    async getService(serviceId) {
        const response = await this.client.get(`invoicing/v1/services/${serviceId}`);
        return response.data;
    }
    async createService(serviceData) {
        const response = await this.client.post('invoicing/v1/services', serviceData);
        return response.data;
    }
}
// Create server
const server = new Server({
    name: 'holded-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Initialize Holded client
let holdedClient;
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
                            text: JSON.stringify(await holdedClient.getContacts(args?.page || 1), null, 2),
                        },
                    ],
                };
            case 'get_contact':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getContact(args?.contactId), null, 2),
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
                const { contactId, ...updateData } = args;
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
                            text: JSON.stringify(await holdedClient.deleteContact(args?.contactId), null, 2),
                        },
                    ],
                };
            // Product operations
            case 'get_products':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getProducts(args?.page || 1), null, 2),
                        },
                    ],
                };
            case 'get_product':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getProduct(args?.productId), null, 2),
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
                const { productId, ...productUpdateData } = args;
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
                            text: JSON.stringify(await holdedClient.deleteProduct(args?.productId), null, 2),
                        },
                    ],
                };
            case 'update_product_stock':
                const { productId: stockProductId, stock, warehouseId } = args;
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
                            text: JSON.stringify(await holdedClient.getInvoices(args?.page || 1), null, 2),
                        },
                    ],
                };
            case 'get_invoice':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getInvoice(args?.invoiceId), null, 2),
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
                const { invoiceId, ...invoiceUpdateData } = args;
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
                            text: JSON.stringify(await holdedClient.deleteInvoice(args?.invoiceId), null, 2),
                        },
                    ],
                };
            case 'send_invoice':
                const { invoiceId: sendInvoiceId, email, subject, message } = args;
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
                            text: JSON.stringify(await holdedClient.getDocuments(args?.docType, args?.page || 1), null, 2),
                        },
                    ],
                };
            case 'get_document':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getDocument(args?.docType, args?.documentId), null, 2),
                        },
                    ],
                };
            case 'create_document':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.createDocument(args?.docType, args?.documentData), null, 2),
                        },
                    ],
                };
            // Estimate operations
            case 'get_estimates':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getEstimates(args?.page || 1), null, 2),
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
                            text: JSON.stringify(await holdedClient.getBookingSlots(args?.locationId, args?.serviceId, args?.day), null, 2),
                        },
                    ],
                };
            case 'get_bookings':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getBookings(args?.page || 1), null, 2),
                        },
                    ],
                };
            case 'get_booking':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getBooking(args?.bookingId), null, 2),
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
                const { bookingId: updateBookingId, ...bookingUpdateData } = args;
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
                            text: JSON.stringify(await holdedClient.deleteBooking(args?.bookingId), null, 2),
                        },
                    ],
                };
            // Service operations
            case 'get_services':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getServices(args?.page || 1), null, 2),
                        },
                    ],
                };
            case 'get_service':
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(await holdedClient.getService(args?.serviceId), null, 2),
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
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof McpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new McpError(ErrorCode.InternalError, `Holded API error: ${errorMessage}`);
    }
});
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
            protocol: 'MCP Streamable HTTP (2025-06-18)',
            endpoints: {
                health: '/health',
                mcp: '/mcp (GET/POST/HEAD)',
                test: '/test',
                debug: '/debug'
            },
            mcp: {
                status: 'ready',
                tools: 'Available via Streamable HTTP connection'
            }
        });
    });
    // Endpoint de debug para ver sesiones activas
    app.get('/debug', (req, res) => {
        const activeTransports = Array.from(transports.entries()).map(([sessionId, transport]) => ({
            sessionId,
            hasTransport: !!transport,
            transportSessionId: transport.sessionId
        }));
        res.json({
            service: 'holded-mcp-server-debug',
            activeSessions: activeTransports.length,
            sessions: activeTransports,
            timestamp: new Date().toISOString()
        });
    });
    // Crear única instancia del servidor MCP que será reutilizada
    let mcpServerInstance = null;
    const getMCPServer = () => {
        if (mcpServerInstance) {
            return mcpServerInstance;
        }
        console.error(`[MCP] Creating MCP server instance (singleton)...`);
        // Crear única instancia del servidor MCP
        mcpServerInstance = new Server({
            name: 'holded-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        console.error(`[MCP] Configuring MCP server handlers...`);
        mcpServerInstance.setRequestHandler(ListToolsRequestSchema, async () => {
            console.error(`[MCP] *** ListTools request received ***`);
            console.error(`[MCP] Returning ${13} tools to Claude.ai`);
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
                                    description: 'The contact ID',
                                },
                            },
                            required: ['contactId'],
                        },
                    },
                    {
                        name: 'create_contact',
                        description: 'Create a new contact in Holded',
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
                                code: {
                                    type: 'string',
                                    description: 'Contact code/reference',
                                },
                                tradename: {
                                    type: 'string',
                                    description: 'Trade name',
                                },
                                vatnumber: {
                                    type: 'string',
                                    description: 'VAT number',
                                },
                                clientType: {
                                    type: 'string',
                                    description: 'Client type (client, provider, both)',
                                },
                            },
                            required: ['name'],
                        },
                    },
                    {
                        name: 'update_contact',
                        description: 'Update a contact in Holded',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                contactId: {
                                    type: 'string',
                                    description: 'The contact ID',
                                },
                                contactData: {
                                    type: 'object',
                                    description: 'Contact data to update',
                                    properties: {
                                        name: { type: 'string' },
                                        email: { type: 'string' },
                                        phone: { type: 'string' },
                                        tradename: { type: 'string' },
                                        vatnumber: { type: 'string' },
                                    },
                                },
                            },
                            required: ['contactId', 'contactData'],
                        },
                    },
                    {
                        name: 'delete_contact',
                        description: 'Delete a contact from Holded',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                contactId: {
                                    type: 'string',
                                    description: 'The contact ID',
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
                                    description: 'The product ID',
                                },
                            },
                            required: ['productId'],
                        },
                    },
                    {
                        name: 'create_product',
                        description: 'Create a new product in Holded',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Product name',
                                },
                                code: {
                                    type: 'string',
                                    description: 'Product code',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Product description',
                                },
                                sellPrice: {
                                    type: 'number',
                                    description: 'Selling price',
                                },
                                costPrice: {
                                    type: 'number',
                                    description: 'Cost price',
                                },
                                tax: {
                                    type: 'number',
                                    description: 'Tax percentage',
                                },
                                provider: {
                                    type: 'string',
                                    description: 'Provider contact ID',
                                },
                                category: {
                                    type: 'string',
                                    description: 'Product category',
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
                                    description: 'The invoice ID',
                                },
                            },
                            required: ['invoiceId'],
                        },
                    },
                    {
                        name: 'create_invoice',
                        description: 'Create a new invoice in Holded',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                contactId: {
                                    type: 'string',
                                    description: 'Client contact ID',
                                },
                                items: {
                                    type: 'array',
                                    description: 'Invoice items',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            productId: { type: 'string' },
                                            units: { type: 'number' },
                                            subtotal: { type: 'number' },
                                            discount: { type: 'number' },
                                            tax: { type: 'number' },
                                        },
                                    },
                                },
                                desc: {
                                    type: 'string',
                                    description: 'Invoice description',
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
                        description: 'Create a new booking in Holded',
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
        mcpServerInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
            console.error(`[MCP] Tool called: ${request.params.name}`);
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    // Contact operations
                    case 'get_contacts':
                        const contacts = await holdedClient.getContacts(args?.page || 1);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(contacts, null, 2),
                                },
                            ],
                        };
                    case 'get_contact':
                        const contact = await holdedClient.getContact(args?.contactId);
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
                        const updatedContact = await holdedClient.updateContact(args.contactId, args.contactData);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(updatedContact, null, 2),
                                },
                            ],
                        };
                    case 'delete_contact':
                        const deleteResult = await holdedClient.deleteContact(args.contactId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(deleteResult, null, 2),
                                },
                            ],
                        };
                    // Product operations
                    case 'get_products':
                        const products = await holdedClient.getProducts(args?.page || 1);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(products, null, 2),
                                },
                            ],
                        };
                    case 'get_product':
                        const product = await holdedClient.getProduct(args?.productId);
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
                        const invoices = await holdedClient.getInvoices(args?.page || 1);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(invoices, null, 2),
                                },
                            ],
                        };
                    case 'get_invoice':
                        const invoice = await holdedClient.getInvoice(args?.invoiceId);
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
                    case 'get_bookings':
                        const bookings = await holdedClient.getBookings(args?.page || 1);
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
                        const services = await holdedClient.getServices(args?.page || 1);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(services, null, 2),
                                },
                            ],
                        };
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                console.error(`Tool execution error: ${error}`);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new McpError(ErrorCode.InternalError, `Holded API error: ${errorMessage}`);
            }
        });
        console.error(`[MCP] MCP server configured successfully`);
        return mcpServerInstance;
    };
    // Mapas para manejar transportes por sesión - igual que el servidor "everything" oficial
    const transports = new Map();
    // Handler para POST requests - inicialización y comunicación MCP
    app.post('/mcp', async (req, res) => {
        console.error('Received MCP POST request');
        console.error('Headers:', JSON.stringify(req.headers, null, 2));
        console.error('Body:', req.body ? JSON.stringify(req.body, null, 2) : 'No body');
        try {
            // Verificar ID de sesión existente
            const sessionId = req.headers['mcp-session-id'];
            let transport;
            if (sessionId && transports.has(sessionId)) {
                // Reutilizar transporte existente
                transport = transports.get(sessionId);
                console.error(`[MCP] Reusing transport for session: ${sessionId}`);
            }
            else if (!sessionId) {
                // Nueva solicitud de inicialización - crear servidor MCP fresh
                const mcpServer = getMCPServer();
                console.error(`[MCP] Creating new transport for initialization...`);
                // Crear nuevo transporte con store de eventos en memoria
                const { InMemoryEventStore } = await import('@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js');
                const eventStore = new InMemoryEventStore();
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    eventStore, // Habilitar resumabilidad
                    onsessioninitialized: (sessionId) => {
                        console.error(`Session initialized with ID: ${sessionId}`);
                        transports.set(sessionId, transport);
                    }
                });
                // Configurar handler de cierre para limpiar transporte
                mcpServer.onclose = async () => {
                    const sid = transport.sessionId;
                    if (sid && transports.has(sid)) {
                        console.error(`Transport closed for session ${sid}, removing from transports map`);
                        transports.delete(sid);
                    }
                };
                // Conectar el transporte al servidor MCP ANTES de manejar la request
                await mcpServer.connect(transport);
                // Manejar la request inmediatamente y retornar
                await transport.handleRequest(req, res);
                return;
            }
            else {
                // Request inválida - sin ID de sesión o no inicialización  
                console.error(`[MCP] Invalid request: sessionId=${sessionId}, has transport=${transports.has(sessionId)}`);
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: req?.body?.id,
                });
                return;
            }
            // Manejar request con transporte existente
            await transport.handleRequest(req, res);
        }
        catch (error) {
            console.error('Error handling MCP request:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal server error',
                    },
                    id: req?.body?.id,
                });
            }
        }
    });
    // Handler para GET requests - streams SSE (usando soporte integrado de StreamableHTTP)
    app.get('/mcp', async (req, res) => {
        console.error('Received MCP GET request');
        console.error('GET Headers:', JSON.stringify(req.headers, null, 2));
        const sessionId = req.headers['mcp-session-id'];
        console.error(`[MCP] GET request - sessionId: ${sessionId}, has transport: ${sessionId ? transports.has(sessionId) : false}`);
        if (!sessionId || !transports.has(sessionId)) {
            console.error(`[MCP] GET - Invalid session: sessionId=${sessionId}, available sessions=${Array.from(transports.keys()).join(', ')}`);
            res.status(400).json({
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: 'Bad Request: No valid session ID provided',
                },
                id: req?.body?.id,
            });
            return;
        }
        // Verificar Last-Event-ID para resumabilidad
        const lastEventId = req.headers['last-event-id'];
        if (lastEventId) {
            console.error(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
        }
        else {
            console.error(`Establishing new SSE stream for session ${sessionId}`);
        }
        const transport = transports.get(sessionId);
        await transport.handleRequest(req, res);
    });
    // Handler para DELETE requests - terminación de sesión
    app.delete('/mcp', async (req, res) => {
        console.error('Received MCP DELETE request');
        console.error('DELETE Headers:', JSON.stringify(req.headers, null, 2));
        const sessionId = req.headers['mcp-session-id'];
        console.error(`[MCP] DELETE request - sessionId: ${sessionId}, has transport: ${sessionId ? transports.has(sessionId) : false}`);
        if (!sessionId || !transports.has(sessionId)) {
            console.error(`[MCP] DELETE - Invalid session: sessionId=${sessionId}, available sessions=${Array.from(transports.keys()).join(', ')}`);
            res.status(400).json({
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: 'Bad Request: No valid session ID provided',
                },
                id: req?.body?.id,
            });
            return;
        }
        console.error(`Received session termination request for session ${sessionId}`);
        try {
            const transport = transports.get(sessionId);
            await transport.handleRequest(req, res);
            // No eliminamos el transporte aquí - se eliminará en el handler onclose
        }
        catch (error) {
            console.error('Error handling session termination:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Error handling session termination',
                    },
                    id: req?.body?.id,
                });
            }
        }
    });
    const port = process.env.PORT || 3001;
    // Manejar cierre del servidor
    process.on('SIGINT', async () => {
        console.error('Shutting down server...');
        // Cerrar todos los transportes activos para limpiar recursos
        for (const [sessionId, transport] of transports) {
            try {
                console.error(`Closing transport for session ${sessionId}`);
                await transport.close();
                transports.delete(sessionId);
            }
            catch (error) {
                console.error(`Error closing transport for session ${sessionId}:`, error);
            }
        }
        console.error('Server shutdown complete');
        process.exit(0);
    });
    app.listen(port, () => {
        console.error(`MCP Streamable HTTP Server listening on port ${port}`);
        console.error(`Health endpoint: http://localhost:${port}/health`);
        console.error(`MCP endpoint: http://localhost:${port}/mcp`);
        console.error(`Test endpoint: http://localhost:${port}/test`);
        console.error(`Protocol: MCP Streamable HTTP (2025-06-18) - Compatible with Claude.ai`);
    });
}
// Start server for stdio (Claude Desktop, VS Code)
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Holded MCP server running on stdio');
}
runServer().catch(console.error);
