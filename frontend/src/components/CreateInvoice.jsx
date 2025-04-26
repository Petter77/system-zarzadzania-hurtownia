import { useState } from "react";
import axios from "axios";

const CreateInvoice = ({ onClose, onInvoiceCreated }) => {
  const [number, setNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/invoices/create", {
        number,
        issued_at: issuedAt,
        description,
        price: parseFloat(price),
      });
      onInvoiceCreated(); // np. odświeżenie listy
      onClose(); // zamknij formularz
    } catch (error) {
      console.error("Błąd podczas tworzenia faktury:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4 font-semibold">Utwórz nową fakturę</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Numer faktury"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          value={issuedAt}
          onChange={(e) => setIssuedAt(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Cena"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded"
          step="0.01"
          required
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Zapisz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
