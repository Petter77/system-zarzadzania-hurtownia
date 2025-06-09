const request = require('supertest');
const express = require('express');
const routes = require('../routes/invoices');

// Mockujemy bazę danych
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const db = require('../db');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('Testy endpointów /faktury', () => {
  afterEach(() => {
    jest.clearAllMocks(); // resetujemy mock po każdym teście
  });

  test('GET /all – powinno zwrócić listę faktur', async () => {
    const mockInvoices = [
      { id: 1, number: 'FV001', issued_at: '2024-01-01', recipient_name: 'Klient A' },
      { id: 2, number: 'FV002', issued_at: '2024-02-01', recipient_name: 'Klient B' },
    ];

    db.query.mockImplementation((query, callback) => {
      callback(null, mockInvoices);
    });

    const res = await request(app).get('/all');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].number).toBe('FV001');
  });

  test('GET /inventory-items – powinno zwrócić dane magazynowe', async () => {
    const mockItems = [
      { id: 1, manufacturer: 'HP', model: '123', description: 'Laptop' },
    ];

    db.query.mockImplementation((query, callback) => {
      callback(null, mockItems);
    });

    const res = await request(app).get('/inventory-items');
    expect(res.status).toBe(200);
    expect(res.body[0].manufacturer).toBe('HP');
  });

  test('GET /:number – powinno zwrócić fakturę po numerze', async () => {
    const mockResults = [
      {
        number: 'FV123',
        issued_at: '2024-01-01',
        recipient_name: 'Klient X',
        recipient_address: 'ul. Testowa 1',
        recipient_nip: '1234567890',
        description: 'Produkt A',
        price: 99.99,
      },
    ];

    db.query.mockImplementation((query, values, callback) => {
      callback(null, mockResults);
    });

    const res = await request(app).get('/FV123');
    expect(res.status).toBe(200);
    expect(res.body.number).toBe('FV123');
    expect(res.body.products.length).toBe(1);
  });
});
