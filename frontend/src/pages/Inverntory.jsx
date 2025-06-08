import React, { useEffect, useState } from "react";
import axios from "axios";

const statusColors = {
  available: "bg-green-100 text-green-800",
  borrowed: "bg-yellow-100 text-yellow-800",
  damaged: "bg-red-100 text-red-800",
  archived: "bg-gray-200 text-gray-700",
};

const statusLabels = {
  available: "Dostępny",
  borrowed: "Wypożyczony",
  damaged: "Uszkodzony",
  archived: "Zarchiwizowany",
};

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [filters, setFilters] = useState({
    manufacturer: "",
    model: "",
    status: "",
    location: "",
    serial: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/inventory/stock")
      .then(res => setStock(res.data))
      .catch(() => setStock([]));
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const handleClick = (e) => {
      const panel = document.getElementById("filter-panel");
      const btn = document.getElementById("filter-toggle-btn");
      if (
        panel &&
        !panel.contains(e.target) &&
        btn &&
        !btn.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilters]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredStock = stock
    .filter(item =>
      (!filters.manufacturer || item.manufacturer?.toLowerCase().startsWith(filters.manufacturer.toLowerCase())) &&
      (!filters.model || item.model?.toLowerCase().startsWith(filters.model.toLowerCase()))
    )
    .map(item => ({
      ...item,
      instances: item.instances.filter(inst =>
        (!filters.status || (inst.status && statusLabels[inst.status] === filters.status)) &&
        (!filters.location || (inst.location && inst.location.toLowerCase().startsWith(filters.location.toLowerCase()))) &&
        (!filters.serial || (inst.serial_number && inst.serial_number.toLowerCase().startsWith(filters.serial.toLowerCase())))
      )
    }))
    .filter(item => item.instances.length > 0);

  const toggleExpand = idx => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="container mx-auto p-6 flex flex-row gap-6 relative">
      <button
        id="filter-toggle-btn"
        className="fixed top-1/2 right-0 z-30 bg-blue-600 text-white rounded-l px-3 py-2 shadow-lg focus:outline-none transition-transform"
        style={{ transform: showFilters ? "translateX(0)" : "translateX(0)" }}
        onClick={() => setShowFilters(f => !f)}
        aria-label={showFilters ? "Ukryj filtry" : "Pokaż filtry"}
      >
        {showFilters ? "→" : "←"}
      </button>

      <div
        id="filter-panel"
        className={`fixed right-0 h-full w-80 max-w-full bg-white shadow-lg z-20 transition-transform duration-300 ease-in-out
        ${showFilters ? "translate-x-0" : "translate-x-full"}`}
        style={{
          minWidth: "300px",
          top: "72px",
          height: "calc(100% - 72px)"
        }}
      >
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4">Filtruj</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Producent</label>
            <input
              type="text"
              name="manufacturer"
              value={filters.manufacturer}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1"
              placeholder="np. Cisco"
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1"
              placeholder="np. XR500"
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Stan</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Wszystkie</option>
              <option value="Dostępny">Dostępny</option>
              <option value="Wypożyczony">Wypożyczony</option>
              <option value="Uszkodzony">Uszkodzony</option>
              <option value="Zarchiwizowany">Zarchiwizowany</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Lokalizacja</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1"
              placeholder="np. Magazyn A"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numer seryjny</label>
            <input
              type="text"
              name="serial"
              value={filters.serial}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1"
              placeholder="np. CISCO"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Producent</th>
              <th className="px-4 py-2 border-b">Model</th>
              <th className="px-4 py-2 border-b">Ilość</th>
              <th className="px-4 py-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((item, idx) => (
              <React.Fragment key={item.manufacturer + item.model}>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    {item.manufacturer ?? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak producenta</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {item.model ?? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak modelu</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b text-center">{item.instances.length}</td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-xl"
                      aria-label="Rozwiń szczegóły"
                    >
                      {expanded[idx] ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>
                {expanded[idx] && (
                  <tr>
                    <td colSpan={4} className="bg-gray-100 px-4 py-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-2 py-1">Numer seryjny</th>
                            <th className="px-2 py-1">Stan</th>
                            <th className="px-2 py-1">Lokalizacja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.instances.map((inst, i) => (
                            <React.Fragment key={inst.serial_number || i}>
                              <tr>
                                <td className="px-2 py-1">
                                  {inst.serial_number
                                    ? inst.serial_number
                                    : <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak numeru</span>
                                  }
                                </td>
                                <td className="px-2 py-1">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    inst.status
                                      ? statusColors[inst.status] || "bg-gray-100 text-gray-700"
                                      : "bg-gray-300 text-gray-700"
                                  }`}>
                                    {inst.status
                                      ? statusLabels[inst.status] || inst.status
                                      : "Nieznany"}
                                  </span>
                                </td>
                                <td className="px-2 py-1">
                                  {inst.location
                                    ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{inst.location}</span>
                                    : <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak lokalizacji</span>
                                  }
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={3}>
                                  <hr className="border-t border-gray-300 my-1" />
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;