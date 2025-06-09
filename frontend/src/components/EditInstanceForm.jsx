import React, { useEffect, useRef } from "react";

const EditInstanceForm = ({
  form,
  onChange,
  onCancel,
  onSubmit,
  message,
  device
}) => {
  const descRef = useRef(null);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [device?.description]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
    setTimeout(() => {
      if (typeof message === "string" && message.includes("Zapisano")) {
        alert("Edycja egzemplarza zakończona sukcesem!");
      }
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-xl font-bold mb-4 text-blue-600">Edytuj egzemplarz</h2>
      {message && <div className="mb-2 text-blue-600">{message}</div>}
      {device && (
        <div className="space-y-2 mb-2">
          <div>
            <label className="block font-medium mb-1">Producent</label>
            <input
              type="text"
              value={device.manufacturer}
              className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
              disabled
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Typ urządzenia</label>
            <input
              type="text"
              value={device.device_type}
              className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
              disabled
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Model</label>
            <input
              type="text"
              value={device.model}
              className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
              disabled
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Opis</label>
            <textarea
              ref={descRef}
              value={device.description}
              className="w-full border rounded px-2 py-1 resize-none bg-gray-100 text-gray-700"
              rows={4}
              style={{ overflow: "hidden", minHeight: "96px" }}
              disabled
              tabIndex={-1}
            />
          </div>
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Numer seryjny</label>
        <input
          type="text"
          name="serial_number"
          value={form.serial_number}
          onChange={onChange}
          className="w-full border rounded px-2 py-1"
          required
          maxLength={100}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Stan</label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full border rounded px-2 py-1"
          required
        >
          <option value="available">Dostępny</option>
          <option value="borrowed">Wypożyczony</option>
          <option value="damaged">Uszkodzony</option>
          <option value="archived">Zarchiwizowany</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Lokalizacja</label>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={onChange}
          className="w-full border rounded px-2 py-1"
          maxLength={100}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onCancel}
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zapisz
        </button>
      </div>
    </form>
  );
};

export default EditInstanceForm;