const request = require('supertest');
const express = require('express');
const invoicesRouter = require('../routes/invoices'); // Podmień na właściwą ścieżkę
const db = require('../db');

// Mockowanie bazy danych
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/invoices', invoicesRouter);

describe('Invoices API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/invoices/all', () => {
    it('should return all invoices ordered by number', async () => {
      const mockInvoices = [
        { id: 1, number: '001', issued_at: '2023-01-01', recipient_name: 'Jan Kowalski' },
        { id: 2, number: '002', issued_at: '2023-01-02', recipient_name: 'Anna Nowak' },
      ];

      db.query.mockImplementation((query, callback) => {
        callback(null, mockInvoices);
      });

      const res = await request(app).get('/api/invoices/all');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockInvoices);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should handle db error', async () => {
      db.query.mockImplementation((query, callback) => {
        callback(new Error('DB Error'), null);
      });

      const res = await request(app).get('/api/invoices/all');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Błąd serwera' });
    });
  });

  describe('POST /api/invoices/create', () => {
    const validInvoice = {
      number: '003',
      issued_at: '2023-05-25',
      recipient_name: 'Krzysztof Nowak',
      recipient_address: 'ul. Testowa 5',
      recipient_nip: '1234567890',
      products: [
        { description: 'Produkt A', price: 100 },
        { description: 'Produkt B', price: 200 }
      ]
    };

    it('should create an invoice successfully', async () => {
      // Najpierw mockujemy wstawienie faktury
      db.query
        .mockImplementationOnce((query, values, callback) => {
          callback(null, { insertId: 10 });
        })
        // Następnie mockujemy wstawienie pozycji faktury
        .mockImplementationOnce((query, values, callback) => {
          callback(null);
        });

      const res = await request(app)
        .post('/api/invoices/create')
        .send(validInvoice);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: 'Faktura została utworzona pomyślnie.' });
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/invoices/create')
        .send({}); // puste ciało

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Wszystkie pola są wymagane.' });
    });

    it('should handle db error on invoice insertion', async () => {
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .post('/api/invoices/create')
        .send(validInvoice);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Błąd przy tworzeniu faktury.' });
    });

    it('should handle db error on invoice items insertion', async () => {
      db.query
        .mockImplementationOnce((query, values, callback) => {
          callback(null, { insertId: 11 });
        })
        .mockImplementationOnce((query, values, callback) => {
          callback(new Error('DB error'));
        });

      const res = await request(app)
        .post('/api/invoices/create')
        .send(validInvoice);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Błąd przy dodawaniu pozycji faktury.' });
    });
  });

  describe('GET /api/invoices/inventory-items', () => {
    it('should return inventory items', async () => {
      const items = [
        { id: 1, manufacturer: 'Dell', model: 'XPS 13', description: 'Laptop' },
        { id: 2, manufacturer: 'Apple', model: 'MacBook Pro', description: 'Laptop' },
      ];

      db.query.mockImplementation((query, callback) => {
        callback(null, items);
      });

      const res = await request(app).get('/api/invoices/inventory-items');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(items);
    });

    it('should handle error when fetching inventory items', async () => {
      db.query.mockImplementation((query, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/api/invoices/inventory-items');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Błąd serwera przy pobieraniu przedmiotów.' });
    });
  });

  describe('GET /api/invoices/:number', () => {
    it('should return invoice details with products', async () => {
      const invoiceNumber = '003';
      const mockResults = [
        {
          number: invoiceNumber,
          issued_at: '2023-05-25',
          recipient_name: 'Krzysztof Nowak',
          recipient_address: 'ul. Testowa 5',
          recipient_nip: '1234567890',
          description: 'Produkt A',
          price: 100
        },
        {
          number: invoiceNumber,
          issued_at: '2023-05-25',
          recipient_name: 'Krzysztof Nowak',
          recipient_address: 'ul. Testowa 5',
          recipient_nip: '1234567890',
          description: 'Produkt B',
          price: 200
        }
      ];

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      const res = await request(app).get(`/api/invoices/${encodeURIComponent(invoiceNumber)}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        number: invoiceNumber,
        issued_at: '2023-05-25',
        recipient_name: 'Krzysztof Nowak',
        recipient_address: 'ul. Testowa 5',
        recipient_nip: '1234567890',
        products: [
          { description: 'Produkt A', price: 100 },
          { description: 'Produkt B', price: 200 },
        ]
      });
    });

    it('should return 404 if invoice not found', async () => {
      db.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const res = await request(app).get('/api/invoices/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Faktura nie znaleziona' });
    });

    it('should handle db error', async () => {
      db.query.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/api/invoices/003');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Błąd serwera' });
    });
  });
});
