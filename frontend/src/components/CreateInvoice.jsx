import { useState, useEffect } from "react";
import axios from "axios";

const CreateInvoice = ({ setIsCreateFormOpen, handleCreateInvoiceSuccess }) => {
  const [formData, setFormData] = useState({
    number: "",
    issued_at: "",
    recipient_name: "",
    recipient_address: "",
    recipient_nip: "",
    products: [{ instance_id: "", price: "" }],
  });

  const [message, setMessage] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:3000/invoices/inventory-items");
        setItems(res.data);
      } catch (error) {
        console.error("Błąd podczas pobierania przedmiotów:", error);
      }
    };
    fetchItems();
  }, []);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newProducts = [...formData.products];
      newProducts[index][name] = value;
      setFormData((prev) => ({ ...prev, products: newProducts }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { instance_id: "", price: "" }],
    }));
  };

  const handleRemoveProduct = (index) => {
    const newProducts = [...formData.products];
    newProducts.splice(index, 1);
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { number, issued_at, recipient_name, recipient_address } = formData;
    if (!number || !issued_at || !recipient_name || !recipient_address || formData.products.length === 0) {
      setMessage("Wszystkie pola są wymagane.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/invoices/create", {
        ...formData,
        products: formData.products.map((p) => {
          const selectedItem = items.find((item) => item.instance_id === parseInt(p.instance_id));
          return {
            instance_id: parseInt(p.instance_id),
            description: selectedItem ? `${selectedItem.manufacturer} ${selectedItem.model}` : "",
            price: parseFloat(p.price),
          };
        }),
      });

      setMessage("Faktura została utworzona.");
      setFormData({
        number: "",
        issued_at: "",
        recipient_name: "",
        recipient_address: "",
        recipient_nip: "",
        products: [{ instance_id: "", price: "" }],
      });

      if (handleCreateInvoiceSuccess) handleCreateInvoiceSuccess();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Błąd podczas tworzenia faktury.";
      setMessage(errorMsg);
    }
  };

  const totalPrice = formData.products.reduce(
    (acc, item) => acc + (parseFloat(item.price) || 0),
    0
  );
  
  const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const lines = content.split("\n").map((line) => line.trim());

    const newForm = {
      number: "",
      issued_at: "",
      recipient_name: "",
      recipient_address: "",
      recipient_nip: "",
      products: [],
    };

    let mode = null; // null | 'nabywca' | 'produkty'

    lines.forEach((line) => {
      if (line.startsWith("Faktura nr:")) {
        newForm.number = line.split("Faktura nr:")[1].trim();
      } else if (line.startsWith("Data wystawienia:")) {
        const date = line.split("Data wystawienia:")[1].trim();
        newForm.issued_at = new Date(date).toISOString().slice(0, 10);
      } else if (line.startsWith("Nabywca:")) {
        mode = "nabywca";
      } else if (line.startsWith("Produkty:")) {
        mode = "produkty";
      } else if (line.startsWith("Sprzedawca:")) {
        mode = null; // pomijamy dane sprzedawcy
      } else if (line.startsWith("Do zapłaty:")) {
        mode = null;
      } else if (mode === "nabywca") {
        if (!newForm.recipient_name) {
          newForm.recipient_name = line;
        } else if (!newForm.recipient_address) {
          newForm.recipient_address = line;
        } else if (!newForm.recipient_nip) {
          newForm.recipient_nip = line;
        }
      } else if (mode === "produkty") {
        const match = line.match(/^\d+\.\s+(.+)\s+-\s+(\d+(\.\d+)?)\s+zł$/);
        if (match) {
          const description = match[1];
          const price = parseFloat(match[2]);

          const matched = items.find(
            (i) => `${i.manufacturer} ${i.model}` === description
          );

          newForm.products.push({
            instance_id: matched ? matched.instance_id : "",
            price: price.toFixed(2),
          });
        }
      }
    });

    setFormData((prev) => ({
      ...prev,
      ...newForm,
    }));

    setMessage("Dane z pliku zostały wczytane.");
  };

  reader.readAsText(file);
};



  return (
    <div className="flex justify-center bg-gray-100 py-20 px-4">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="absolute top-6 left-6"
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-gray-300 shadow-lg p-10 rounded-md w-full max-w-[960px]"
      >
        <button
          type="button"
          onClick={() => setIsCreateFormOpen(false)}
          className="absolute top-6 right-6 text-red-600 font-bold hover:text-red-800"
        >
          Zamknij
        </button>

        <div className="flex justify-between items-start mb-10">
          <div className="text-3xl font-bold text-blue-700">LOGO</div>
          <div className="text-right">
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="font-semibold text-xl bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
              placeholder="Numer faktury"
            />
            <input
              type="date"
              name="issued_at"
              value={formData.issued_at}
              onChange={handleChange}
              className="text-sm text-gray-700 mt-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h4 className="font-semibold mb-2">Sprzedawca</h4>
            <p className="text-gray-600 text-sm">Sieciowi</p>
            <p className="text-gray-600 text-sm">Marsjańska √-1a</p>
            <p className="text-gray-600 text-sm">NIP: 0000000000</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Nabywca</h4>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              placeholder="Imię i nazwisko"
              className="text-sm text-gray-700 mt-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              name="recipient_address"
              value={formData.recipient_address}
              onChange={handleChange}
              placeholder="Adres"
              className="text-sm text-gray-700 mt-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              name="recipient_nip"
              value={formData.recipient_nip}
              onChange={handleChange}
              placeholder="NIP"
              className="text-sm text-gray-700 mt-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <table className="w-full text-sm text-left text-gray-700 mb-8 border-t border-b border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4">Lp</th>
              <th className="py-3 px-4">Nazwa</th>
              <th className="py-3 px-4">Cena netto (zł)</th>
              <th className="py-3 px-4">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {formData.products.map((product, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">
                  <select
                    name="instance_id"
                    value={product.instance_id}
                    onChange={(e) => handleChange(e, index)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Wybierz przedmiot</option>
                    {items.map((item) => (
                      <option key={item.instance_id} value={item.instance_id}>
                        {item.manufacturer} {item.model}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={product.price}
                    onChange={(e) => handleChange(e, index)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </td>
                <td className="py-2 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 font-bold hover:text-red-700"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={handleAddProduct}
          className="mb-6 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ➕ Dodaj pozycję
        </button>

        <div className="text-right mb-8">
          <p className="text-lg font-semibold">
            Do zapłaty: <span className="text-green-600">{totalPrice.toFixed(2)} zł</span>
          </p>
        </div>

        {message && (
          <p className="text-center text-red-500 font-semibold mb-6">{message}</p>
        )}

        

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
        >
          Utwórz fakturę
        </button>
      </form>
    </div>
  );
};

export default CreateInvoice;
