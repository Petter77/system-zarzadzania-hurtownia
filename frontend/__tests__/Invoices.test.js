import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Invoices from '../src/pages/Invoices';

jest.mock('axios');
const mockedAxios = axios;

describe('Invoices component', () => {
  const mockInvoices = [
    { number: 'FV001', issued_at: '2024-05-01T00:00:00Z', recipient_name: 'Jan Kowalski' },
    { number: 'FV002', issued_at: '2024-05-02T00:00:00Z', recipient_name: 'Anna Nowak' },
  ];

  const mockInvoiceDetails = {
    number: 'FV001',
    issued_at: '2024-05-01T00:00:00Z',
    recipient_name: 'Jan Kowalski',
    recipient_address: 'ul. Testowa 5',
    recipient_nip: '1234567890',
    products: [
      { description: 'Produkt A', price: 100 },
      { description: 'Produkt B', price: 50 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial loading and display', () => {
    test('renders loading state initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(React.createElement(Invoices));
      expect(screen.getByText('ladowanie...')).toBeInTheDocument();
    });

    test('renders table headers correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockInvoices });
      render(React.createElement(Invoices));
      
      await waitFor(() => expect(screen.queryByText('Ładowanie...')).not.toBeInTheDocument());
      
      expect(screen.getByText('Numer faktury')).toBeInTheDocument();
      expect(screen.getByText('Data wystawienia')).toBeInTheDocument();
      expect(screen.getByText('Nazwa nabywcy')).toBeInTheDocument();
    });

    test('displays invoices after successful fetch', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockInvoices });
      render(React.createElement(Invoices));

      await waitFor(() => {
        expect(screen.getByText('FV001')).toBeInTheDocument();
        expect(screen.getByText('FV002')).toBeInTheDocument();
        expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
        expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/invoices/all');
    });

    test('displays empty table when no invoices', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(React.createElement(Invoices));

      await waitFor(() => expect(screen.queryByText('Ładowanie...')).not.toBeInTheDocument());
      
      // Table should exist but have no data rows
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByText('FV001')).not.toBeInTheDocument();
    });
  });

  describe('Create invoice form', () => {
    test('opens create form on button click', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(React.createElement(Invoices));

      await waitFor(() => expect(screen.queryByText('Ładowanie...')).not.toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /dodaj fakturę/i }));
      
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    test('closes create form on X button click', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(React.createElement(Invoices));

      await waitFor(() => expect(screen.queryByText(/ładowanie/i)).not.toBeInTheDocument());

      // Open form
      fireEvent.click(screen.getByRole('button', { name: /dodaj fakturę/i }));
      expect(screen.getByText('×')).toBeInTheDocument();

      // Close form
      fireEvent.click(screen.getByText('×'));
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });
  });

  describe('Invoice details', () => {
    test('fetches and displays invoice details when row clicked', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockInvoices });
      render(React.createElement(Invoices));

      await waitFor(() => screen.getByText('FV001'));

      mockedAxios.get.mockResolvedValueOnce({ data: mockInvoiceDetails });
      fireEvent.click(screen.getByText('FV001'));

      await waitFor(() => {
        expect(screen.getByText(/produkt a/i)).toBeInTheDocument();
        expect(screen.getByText(/produkt b/i)).toBeInTheDocument();
        expect(screen.getByText(/ul\. testowa 5/i)).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/invoices/FV001');
    });

    test('handles invoice details fetch error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockResolvedValueOnce({ data: mockInvoices });
      
      render(React.createElement(Invoices));
      await waitFor(() => screen.getByText('FV001'));

      mockedAxios.get.mockRejectedValueOnce(new Error('Details fetch failed'));
      fireEvent.click(screen.getByText('FV001'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Nie udało się pobrać szczegółów faktury:', 
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    test('handles initial fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      render(React.createElement(Invoices));

      await waitFor(() => {
        expect(screen.queryByText('Ładowanie...')).not.toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Błąd podczas pobierania faktur:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Date formatting', () => {
    test('formats dates correctly', async () => {
      const invoiceWithSpecificDate = [{
        number: 'FV003',
        issued_at: '2024-12-25T15:30:00Z',
        recipient_name: 'Test User'
      }];
      
      mockedAxios.get.mockResolvedValueOnce({ data: invoiceWithSpecificDate });
      render(React.createElement(Invoices));

      await waitFor(() => {
        // This will depend on your locale, adjust accordingly
        expect(screen.getByText(/25\.12\.2024|12\/25\/2024/)).toBeInTheDocument();
      });
    });
  });
});