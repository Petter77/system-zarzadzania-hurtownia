import { useEffect, useState } from 'react';
import axios from 'axios';
import CreateInvoice from "../components/CreateInvoice";
import InvoicePreview from "../components/InvoicePreview";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/invoices/all');
      setInvoices(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania faktur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  
  const handleRowClick = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/invoices/${id}`);
      setSelectedInvoice(response.data);
    } catch (error) {
      console.error('Nie udało się pobrać szczegółów faktury:', error);
    }
  };

  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Wybierz plik PDF.");
      return;
    }

    const number = prompt("Podaj numer faktury:");
    if (!number) {
      alert("Numer faktury jest wymagany.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("number", number);

    try {
      const response = await axios.post(
        "http://localhost:3000/invoices/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Plik PDF został przesłany pomyślnie.");
      fetchInvoices(); 
    } catch (error) {
      console.error("Błąd podczas wysyłania pliku PDF:", error);
      alert("Nie udało się przesłać pliku.");
    }
  };

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Faktury</h1>

      
      <label className="custom-file-upload cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Wybierz plik PDF
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      
      <button 
        onClick={() => setIsCreateFormOpen(true)}
        className="ml-4 mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 focus:outline-none"
      >
        Dodaj Fakturę (formularz)
      </button>

      {/* Formularz dodawania */}
      {isCreateFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-960 relative">
            <button
              onClick={() => setIsCreateFormOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <CreateInvoice
              setIsCreateFormOpen={setIsCreateFormOpen}
              onInvoiceCreated={fetchInvoices}
            />
          </div>
        </div>
      )}

      {/* Tabela faktur */}
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
  <tr>
    <th className="px-4 py-2 border-b text-left">Numer faktury</th>
    <th className="px-4 py-2 border-b text-left">Data wystawienia</th>
    <th className="px-4 py-2 border-b text-left">Akcja</th>
  </tr>
</thead>

<tbody>
  {invoices.map((invoice, index) => (
    <tr
      key={index}
      className="hover:bg-gray-100 transition"
    >
      <td>{invoice.number}</td>
      <td>{new Date(invoice.issued_at).toLocaleDateString()}</td>

      <td>
        {invoice.has_pdf ? (
          
          <a
            href={`http://localhost:3000/invoices/pdf/${invoice.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Pobierz PDF
          </a>
        ) : (
          
          <button
            onClick={() => handleRowClick(invoice.id)}
            className="text-green-600 hover:underline"
          >
            Podgląd
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>
      </table>

      {/* Podgląd faktury */}
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
