import React, { useState } from "react";
import axios from "axios";

const AddInventoryItem = () => {
  const [form, setForm] = useState({
    manufacturer: "",
    model: "",
    description: "",
    code: "",
    location: "",
    serialNumbers: [""],
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSerialChange = (idx, value) => {
    const serialNumbers = [...form.serialNumbers];
    serialNumbers[idx] = value;
    setForm({ ...form, serialNumbers });
  };

  const addSerialField = () => {
    setForm({ ...form, serialNumbers: [...form.serialNumbers, ""] });
  };

  const removeSerialField = (idx) => {
    const serialNumbers = [...form.serialNumbers];
    serialNumbers.splice(idx, 1);
    setForm({ ...form, serialNumbers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const serials = form.serialNumbers.map(s => s.trim()).filter(s => s !== "");
    if (serials.length !== new Set(serials).size) {
      setMessage("Numery seryjne muszą być unikalne.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/inventory/add-item", {
        manufacturer: form.manufacturer,
        model: form.model,
        description: form.description,
        code: form.code,
        location: form.location,
      });
      const itemId = res.data.itemId;

      await axios.post("http://localhost:3000/inventory/add-instances", {
        item_id: itemId,
        serialNumbers: serials,
        location: form.location,
      });

      setMessage("Sprzęt został dodany!");
      setForm({
        manufacturer: "",
        model: "",
        description: "",
        code: "",
        location: "",
        serialNumbers: [""],
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Błąd podczas dodawania sprzętu.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-6 pt-10">
      <h1 className="text-2xl font-bold mb-6 mt-2">Dodaj sprzęt do magazynu</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-6 w-full max-w-lg space-y-4"
      >
        {message && (
          <div className="text-center text-sm font-semibold text-blue-600 mb-2">{message}</div>
        )}
        <div>
          <label className="block font-medium mb-1">Producent</label>
          <input
            type="text"
            name="manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Model</label>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Opis</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Kod</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Lokalizacja</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Numery seryjne (każda sztuka osobno)</label>
          {form.serialNumbers.map((sn, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={sn}
                onChange={e => handleSerialChange(idx, e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder={`Numer seryjny #${idx + 1}`}
                required
              />
              {form.serialNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSerialField(idx)}
                  className="ml-2 text-red-500 font-bold"
                  title="Usuń pole"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSerialField}
            className="mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Dodaj kolejną sztukę
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700"
        >
          Dodaj sprzęt
        </button>
      </form>
    </div>
  );
};

export default AddInventoryItem;