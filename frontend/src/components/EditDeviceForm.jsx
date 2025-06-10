import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const EditDeviceForm = ({
  form,
  onChange,
  onCancel,
  onSubmit,
  message,
  count,
  originalManufacturer,
  originalDeviceType,
  originalModel
}) => {
  const descRef = useRef(null);
  const [descLocked, setDescLocked] = useState(false);

  useEffect(() => {
    let ignore = false;

    const isOriginal =
      form.manufacturer === originalManufacturer &&
      form.device_type === originalDeviceType &&
      form.model === originalModel;

    if (isOriginal) {
      setDescLocked(false);
      return;
    }

    const fetchDescription = async () => {
      if (
        form.manufacturer &&
        form.device_type &&
        form.model
      ) {
        try {
          const res = await axios.get("http://localhost:3000/inventory/description", {
            params: {
              manufacturer: form.manufacturer,
              device_type: form.device_type,
              model: form.model,
            }
          });
          if (!ignore) {
            if (res.data && res.data.description !== undefined) {
              setDescLocked(true);
              if (res.data.description !== form.description) {
                onChange({ target: { name: "description", value: res.data.description } });
              }
            } else {
              setDescLocked(false);
            }
          }
        } catch {
          if (!ignore) setDescLocked(false);
        }
      } else {
        setDescLocked(false);
      }
    };
    fetchDescription();
    return () => { ignore = true; };
  }, [form.manufacturer, form.device_type, form.model, originalManufacturer, originalDeviceType, originalModel]);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [form.description]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
    setTimeout(() => {
      if (typeof message === "string" && message.includes("Zapisano")) {
        alert("Edycja sprzętu zakończona sukcesem!");
      }
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-xl font-bold mb-4 text-blue-600">Edytuj sprzęt</h2>
      {message && <div className="mb-2 text-blue-600">{message}</div>}
      <div>
        <label className="block font-medium mb-1">Producent</label>
        <input
          type="text"
          name="manufacturer"
          value={form.manufacturer}
          onChange={onChange}
          className="w-full border rounded px-2 py-1"
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
          onChange={onChange}
          className="w-full border rounded px-2 py-1"
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
          onChange={onChange}
          className="w-full border rounded px-2 py-1"
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
          onChange={onChange}
          className="w-full border rounded px-2 py-1 resize-none"
          maxLength={256}
          rows={4}
          style={{
            overflow: "hidden",
            minHeight: "96px",
          }}
          disabled={descLocked}
        />
        {descLocked && (
          <div className="text-xs text-gray-500 mt-1">
            Opis został automatycznie uzupełniony na podstawie producenta, typu i modelu i nie można go edytować.
          </div>
        )}
      </div>
      {typeof count === "number" && (
        <div className="mt-2 text-blue-700 font-semibold">
          Ilość urządzeń do edycji: <span>{count}</span>
        </div>
      )}
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

export default EditDeviceForm;