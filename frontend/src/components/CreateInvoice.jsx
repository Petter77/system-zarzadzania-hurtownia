import { useState } from "react";
import axios from "axios";

const CreateInvoice = ({ setIsCreateFormOpen, handleCreateInvoiceSuccess }) => {
  const [formData, setFormData] = useState({
    number: "",
    issued_at: "",
    description: "",
    price: "",
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.number || !formData.issued_at || !formData.description || !formData.price) {
      setMessage("Wszystkie pola są wymagane.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/invoices/create", {
        ...formData,
        price: parseFloat(formData.price), // upewniamy się, że cena jest liczbą
      });
      setMessage("Faktura została utworzona.");
      setFormData({ number: "", issued_at: "", description: "", price: "" });
      handleCreateInvoiceSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Błąd podczas tworzenia faktury.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <button
        type="button"
        onClick={() => setIsCreateFormOpen(false)}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
      >
        Zamknij
      </button>
      <h3 className="text-2xl font-semibold mb-4">Stwórz nową fakturę</h3>
      {message && <p className="text-red-500 text-center font-semibold mb-4">{message}</p>}

      <div className="mb-4">
        <label htmlFor="number" className="block text-gray-700 mb-2">Numer faktury:</label>
        <input
          type="text"
          name="number"
          id="number"
          value={formData.number}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="issued_at" className="block text-gray-700 mb-2">Data wystawienia:</label>
        <input
          type="date"
          name="issued_at"
          id="issued_at"
          value={formData.issued_at}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 mb-2">Opis:</label>
        <input
          type="text"
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="price" className="block text-gray-700 mb-2">Cena (zł):</label>
        <input
          type="number"
          step="0.01"
          name="price"
          id="price"
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
      >
        Utwórz fakturę
      </button>
    </form>
  );
};

export default CreateInvoice;
