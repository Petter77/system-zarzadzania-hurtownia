import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const AddInventoryItem = () => {
  const [form, setForm] = useState({
    manufacturer: "",
    device_type: "",
    model: "",
    description: "",
    location: "",
    invoice: "",
    serialNumbers: [""],
  });
  const [message, setMessage] = useState(null);
  const [descLocked, setDescLocked] = useState(false);
  const [lastFetched, setLastFetched] = useState({ manufacturer: "", device_type: "", model: "" });
  const [lastFetchedDesc, setLastFetchedDesc] = useState(undefined);
  const [serialErrors, setSerialErrors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const descRef = useRef(null);
  const addButtonRef = useRef(null);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [form.description, descLocked]);

  useEffect(() => {
    axios.get("http://localhost:3000/inventory/invoices")
      .then(res => setInvoices(res.data))
      .catch(() => setInvoices([]));
  }, []);

  const fetchDescription = async (manufacturer, device_type, model) => {
    try {
      const res = await axios.get("http://localhost:3000/inventory/description", {
        params: { manufacturer, device_type, model }
      });
      if (res.data && "description" in res.data) {
        setForm(f => ({ ...f, description: res.data.description || "" }));
        setDescLocked(true);
        setLastFetched({ manufacturer, device_type, model });
        setLastFetchedDesc(res.data.description);
      } else {
        setDescLocked(false);
        setLastFetched({ manufacturer: "", device_type: "", model: "" });
        setLastFetchedDesc(undefined);
      }
    } catch (err) {
      setDescLocked(false);
      setLastFetched({ manufacturer: "", device_type: "", model: "" });
      setLastFetchedDesc(undefined);
    }
  };

  const getDuplicateSerialIndexes = (serialNumbers) => {
    const counts = {};
    serialNumbers.forEach((sn, idx) => {
      const val = sn.trim();
      if (!val) return;
      if (!counts[val]) counts[val] = [];
      counts[val].push(idx);
    });
    return Object.values(counts)
      .filter(arr => arr.length > 1)
      .flat();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (["manufacturer", "device_type", "model"].includes(name)) {
        if (
          value !== lastFetched[name] ||
          updated.manufacturer !== lastFetched.manufacturer ||
          updated.device_type !== lastFetched.device_type ||
          updated.model !== lastFetched.model
        ) {
          setDescLocked(false);
          setForm(f => ({ ...f, description: "" }));
          setLastFetched({ manufacturer: "", device_type: "", model: "" });
          setLastFetchedDesc(undefined);
        }
        if (
          (name === "manufacturer" ? value : updated.manufacturer) &&
          (name === "device_type" ? value : updated.device_type) &&
          (name === "model" ? value : updated.model)
        ) {
          fetchDescription(
            name === "manufacturer" ? value : updated.manufacturer,
            name === "device_type" ? value : updated.device_type,
            name === "model" ? value : updated.model
          );
        }
      }
      return { ...updated };
    });
  };

  const handleSerialChange = (idx, value) => {
    const serialNumbers = [...form.serialNumbers];
    serialNumbers[idx] = value;
    setForm({ ...form, serialNumbers });

    const dupes = getDuplicateSerialIndexes(serialNumbers);
    setSerialErrors(dupes);
  };

  const addSerialField = () => {
    setForm(prev => {
      const updated = { ...prev, serialNumbers: [...prev.serialNumbers, ""] };
      return updated;
    });
    setTimeout(() => {
      if (addButtonRef.current) {
        addButtonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
  };

  const removeSerialField = (idx) => {
    const serialNumbers = [...form.serialNumbers];
    serialNumbers.splice(idx, 1);
    setForm({ ...form, serialNumbers });
    const dupes = getDuplicateSerialIndexes(serialNumbers);
    setSerialErrors(dupes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const serials = form.serialNumbers.map(s => s.trim()).filter(s => s !== "");
    const dupes = getDuplicateSerialIndexes(form.serialNumbers);
    setSerialErrors(dupes);
    if (dupes.length > 0) {
      setMessage("Numery seryjne muszą być unikalne.");
      return;
    }

    if (form.invoice && !invoices.includes(form.invoice)) {
      setMessage("Podany numer faktury nie istnieje w systemie.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/inventory/add-item", {
        manufacturer: form.manufacturer,
        device_type: form.device_type,
        model: form.model,
        description: form.description,
      });
      const itemId = res.data.itemId;

      await axios.post("http://localhost:3000/inventory/add-instances", {
        item_id: itemId,
        serialNumbers: serials,
        location: form.location,
        invoice: form.invoice || null,
      });

      setMessage("Sprzęt został dodany!");
      setForm({
        manufacturer: "",
        device_type: "",
        model: "",
        description: "",
        location: "",
        invoice: "",
        serialNumbers: [""],
      });
      setDescLocked(false);
      setLastFetched({ manufacturer: "", device_type: "", model: "" });
      setLastFetchedDesc(undefined);
      setSerialErrors([]);
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.existingSerials
      ) {
        setMessage(err.response.data.error);

        const existing = err.response.data.existingSerials;
        const errorIdxs = [];
        form.serialNumbers.forEach((sn, idx) => {
          if (existing.includes(sn.trim())) errorIdxs.push(idx);
        });
        setSerialErrors(errorIdxs);
      } else if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Błąd podczas dodawania sprzętu.");
      }
    }
  };

  const isErrorMessage = (msg) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return (
      lower.includes("błąd") ||
      lower.includes("nie istnieje") ||
      lower.includes("unikalne") ||
      lower.includes("istnieją") ||
      lower.includes("urządzenie o takich numerach seryjnych")
    );
  };

  return (
    <div className="flex flex-col items-center justify-start bg-gray-100 p-0">
      <h1 className="text-2xl font-bold mb-6 mt-10">Dodaj sprzęt do magazynu</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-6 w-full max-w-lg space-y-4 mb-16"
      >
        {message && (
          <div
            className={`text-center text-sm font-semibold mb-2 ${
              isErrorMessage(message) ? "text-red-600" : "text-blue-600"
            }`}
          >
            {message}
          </div>
        )}
        <div>
          <label className="block font-medium mb-1">Producent</label>
          <input
            type="text"
            name="manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="np. Cisco"
            required
            maxLength={100}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Typ urządzenia</label>
          <input
            type="text"
            name="device_type"
            value={form.device_type}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="np. switch, router, access point"
            required
            maxLength={50}
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
            placeholder="np. Catalyst 2960"
            required
            maxLength={100}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Opis</label>
          <textarea
            ref={descRef}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 resize-none"
            placeholder={lastFetchedDesc === "" ? "" : "np. Przełącznik warstwy 2, 24 porty"}
            maxLength={256}
            rows={4}
            disabled={descLocked || lastFetchedDesc !== undefined}
            style={{
              ...((descLocked || lastFetchedDesc !== undefined) ? { backgroundColor: "#f3f4f6", color: "#6b7280" } : {}),
              overflow: "hidden"
            }}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Faktura</label>
          <input
            type="text"
            name="invoice"
            value={form.invoice}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="np. FV/2023/001"
            maxLength={100}
            autoComplete="off"
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
            placeholder="np. Magazyn A"
            maxLength={100}
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
                className={`w-full border rounded px-2 py-1 ${serialErrors.includes(idx) ? "border-red-500" : ""}`}
                placeholder={`Numer seryjny #${idx + 1}`}
                required
                maxLength={100}
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
            ref={addButtonRef}
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