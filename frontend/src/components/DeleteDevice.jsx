import React, { useEffect, useRef } from "react";

const DeleteDevice = ({ device, onCancel, onDelete, message }) => {
  const descRef = useRef(null);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [device.description]);

  const handleDelete = () => {
    const count = device.instances?.length ?? 0;
    const msg = `Czy na pewno chcesz usunąć to urządzenie wraz ze wszystkimi egzemplarzami?\nLiczba egzemplarzy do usunięcia: ${count}\nTej operacji nie można cofnąć.`;
    if (window.confirm(msg)) {
      onDelete();
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4 text-red-700">Usuń sprzęt</h2>
      {message && <div className="mb-2 text-red-600">{message}</div>}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block font-medium mb-1">Producent</label>
          <input
            type="text"
            value={device.manufacturer}
            className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
            disabled
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Typ urządzenia</label>
          <input
            type="text"
            value={device.device_type}
            className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
            disabled
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Model</label>
          <input
            type="text"
            value={device.model}
            className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
            disabled
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
          />
        </div>
        <div className="mt-2 text-red-700 font-semibold">
          Ilość urządzeń do usunięcia: {device.instances?.length ?? 0}
        </div>
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
          type="button"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleDelete}
        >
          Usuń
        </button>
      </div>
    </div>
  );
};

export default DeleteDevice;