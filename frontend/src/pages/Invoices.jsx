import { useEffect, useState } from 'react';
import axios from 'axios';
import CreateInvoice from "../components/CreateInvoice";
import InvoicePreview from "../components/InvoicePreview";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState("all");

  // Nowe stany dla filtrowania po numerze i dacie
  const [searchNumber, setSearchNumber] = useState('');
  const [searchDate, setSearchDate] = useState('');

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
      await axios.post(
        "http://localhost:3000/invoices/upload-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
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

      {/* Upload PDF */}
      <label className="custom-file-upload cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Zarchiwizuj fakturę (PDF)
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* Dodaj formularz */}
      <button 
        onClick={() => setIsCreateFormOpen(true)}
        className="ml-4 mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 focus:outline-none"
      >
        Dodaj Fakturę (formularz)
      </button>

      {/* Przyciski filtrowania */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Wszystkie
        </button>
        <button
          onClick={() => setFilter("withPdf")}
          className={`px-4 py-2 rounded ${filter === "withPdf" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Zarchiwizowane (PDF)
        </button>
        <button
          onClick={() => setFilter("withoutPdf")}
          className={`px-4 py-2 rounded ${filter === "withoutPdf" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Wystawione
        </button>
      </div>

      {/* Filtry po numerze i dacie */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Szukaj po numerze faktury"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto border border-gray-300 rounded-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-4 py-2 border-b text-left">Numer faktury</th>
              <th className="px-4 py-2 border-b text-left">Data</th>
              <th className="px-4 py-2 border-b text-left">Akcja</th>
            </tr>
          </thead>
          <tbody>
            {invoices
              .filter(invoice => {
                const matchesPdfFilter =
                  filter === "withPdf" ? invoice.has_pdf :
                  filter === "withoutPdf" ? !invoice.has_pdf : true;

                const matchesNumber = invoice.number
                  .toLowerCase()
                  .includes(searchNumber.toLowerCase());

                const matchesDate = searchDate
                  ? new Date(invoice.issued_at).toISOString().slice(0, 10) === searchDate
                  : true;

                return matchesPdfFilter && matchesNumber && matchesDate;
              })
              .map((invoice, index) => (
                <tr key={index} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-2 border-b">{invoice.number}</td>
                  <td className="px-4 py-2 border-b">{new Date(invoice.issued_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border-b">
                    {invoice.has_pdf ? (
                      <a
                        href={`http://localhost:3000/invoices/pdf/${invoice.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-100 text-black rounded-lg hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Pobierz PDF
                      </a>
                    ) : (
                      <button
                        onClick={() => handleRowClick(invoice.id)}
                        className="px-4 py-2 bg-green-100 text-black rounded-lg hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Podgląd
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Podgląd faktury */}
      {selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

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
    </div>
  );
};

export default Invoices;
