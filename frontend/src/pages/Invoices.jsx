import { useEffect, useState } from 'react';
import axios from 'axios';
import CreateInvoice from "../components/CreateInvoice";
import InvoicePreview from "../components/InvoicePreview";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleRowClick = async (number) => {
    try {
      const response = await axios.get(`http://localhost:3000/invoices/${encodeURIComponent(number)}`);
      setSelectedInvoice(response.data);
    } catch (error) {
      console.error('Nie udało się pobrać szczegółów faktury:', error);
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:3000/invoices/all');
        setInvoices(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania faktur:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInvoices();
  }, []);

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Faktury</h1>

      <button 
        onClick={() => setIsCreateFormOpen(true)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
      >
        Dodaj Fakturę
      </button>

      {isCreateFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-960  relative">
            <button
              onClick={() => setIsCreateFormOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <CreateInvoice setIsCreateFormOpen={setIsCreateFormOpen} />
          </div>
        </div>
      )}

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-left">Numer faktury</th>
            <th className="px-4 py-2 border-b text-left">Data wystawienia</th>
            <th className="px-4 py-2 border-b text-left">Nazwa nabywcy</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr
              key={index}
              onClick={() => handleRowClick(invoice.number)}
              className="cursor-pointer hover:bg-gray-100 transition"
            >
              <td>{invoice.number}</td>
              <td>{new Date(invoice.issued_at).toLocaleDateString()}</td>
              <td>{invoice.username}</td>
            </tr>
          ))}
        </tbody>

      </table>
      {selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
};

export default Invoices;
