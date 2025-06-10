import React, { useEffect, useRef, useState } from "react";
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

const TOPBAR_HEIGHT = 72;

function TruncatedCell({ children, className = "", titleText, ...props }) {
  const ref = useRef(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setShowTitle(el.scrollWidth > el.clientWidth);
  }, [children, titleText]);

  return (
    <td
      ref={ref}
      className={`truncate ${className}`}
      {...(showTitle && titleText ? { title: titleText } : {})}
      {...props}
    >
      {children}
    </td>
  );
}

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [filters, setFilters] = useState({
    manufacturer: "",
    device_type: "",
    model: "",
    status: "",
    location: "",
    serial: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("manufacturer");
  const [sortDir, setSortDir] = useState("asc");
  const [panelTop, setPanelTop] = useState(TOPBAR_HEIGHT);

  useEffect(() => {
    axios.get("http://localhost:3000/inventory/stock")
      .then(res => setStock(res.data))
      .catch(() => setStock([]));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setPanelTop(Math.max(TOPBAR_HEIGHT - scrollY, 0));
      if (typeof window.updateTopBarPosition === "function") {
        window.updateTopBarPosition(Math.max(TOPBAR_HEIGHT - scrollY, 0));
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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

  const handleSort = key => {
    if (sortBy === key) {
      setSortDir(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const filteredStock = stock
    .filter(item =>
      (!filters.manufacturer || item.manufacturer?.toLowerCase().startsWith(filters.manufacturer.toLowerCase())) &&
      (!filters.device_type || item.device_type?.toLowerCase().includes(filters.device_type.toLowerCase())) &&
      (!filters.model || item.model?.toLowerCase().startsWith(filters.model.toLowerCase()))
    )
    .map(item => ({
      ...item,
      quantity: item.instances.length,
      instances: item.instances.filter(inst =>
        (!filters.status || (inst.status && statusLabels[inst.status] === filters.status)) &&
        (!filters.location || (inst.location && inst.location.toLowerCase().startsWith(filters.location.toLowerCase()))) &&
        (!filters.serial || (inst.serial_number && inst.serial_number.toLowerCase().startsWith(filters.serial.toLowerCase())))
      )
    }))
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleExpand = idx => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="container mx-auto p-6 flex flex-row gap-6 relative">
      <button
        id="filter-toggle-btn"
        className="fixed bottom-4 right-0 z-30 bg-blue-600 text-white rounded-l px-3 py-2 shadow-lg focus:outline-none transition-transform hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
        style={{ transform: showFilters ? "translateX(0)" : "translateX(0)", cursor: "pointer" }}
        onClick={() => setShowFilters(f => !f)}
        aria-label={showFilters ? "Ukryj filtry" : "Pokaż filtry"}
      >
        <span style={{ fontSize: "1.3em", marginRight: "0.4em", cursor: "grab" }}>☰</span>
        {showFilters ? "→" : "←"}
      </button>

      <div
        id="filter-panel"
        className={`fixed right-0 z-20 bg-white shadow-lg transition-transform duration-300 ease-in-out
        ${showFilters ? "translate-x-0" : "translate-x-full"}`}
        style={{
          minWidth: "300px",
          width: "20rem",
          maxWidth: "100vw",
          top: `${panelTop}px`,
          bottom: 0,
          height: "auto",
          maxHeight: "none"
        }}
      >
        <div className="p-6 h-full overflow-y-auto">
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
            <label className="block text-sm font-medium mb-1">Typ urządzenia</label>
            <input
              type="text"
              name="device_type"
              value={filters.device_type}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1"
              placeholder="np. switch"
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
              <th className="px-4 py-2 border-b text-left max-w-[180px]">
                Producent
                <button
                  className="ml-1 text-lg align-middle"
                  onClick={() => handleSort("manufacturer")}
                  title="Sortuj"
                >
                  {sortBy === "manufacturer"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.3em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left max-w-[140px]">
                Typ
                <button
                  className="ml-1 text-lg align-middle"
                  onClick={() => handleSort("device_type")}
                  title="Sortuj"
                >
                  {sortBy === "device_type"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.3em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left max-w-[220px]">
                Model
                <button
                  className="ml-1 text-lg align-middle"
                  onClick={() => handleSort("model")}
                  title="Sortuj"
                >
                  {sortBy === "model"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.3em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left max-w-[220px]">Opis</th>
              <th className="px-4 py-2 border-b text-left w-20" style={{ whiteSpace: "nowrap" }}>
                Ilość
                <button
                  className="ml-1 text-lg"
                  onClick={e => { e.stopPropagation(); handleSort("quantity"); }}
                  title="Sortuj"
                  style={{ verticalAlign: "middle", lineHeight: 1, display: "inline" }}
                >
                  {sortBy === "quantity"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.3em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((item, idx) => (
              <React.Fragment key={item.manufacturer + item.model}>
                <tr
                  className={`bg-white transition-colors ${
                    item.instances.length > 0
                      ? "cursor-pointer " + (showFilters ? "hover:bg-gray-200" : "hover:bg-blue-50")
                      : "cursor-default"
                  }`}
                  onClick={() => {
                    if (item.instances.length > 0) toggleExpand(idx);
                  }}
                >
                  <TruncatedCell className="px-4 py-2 border-b max-w-[180px]" titleText={item.manufacturer}>
                    {item.manufacturer ?? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak producenta</span>
                    )}
                  </TruncatedCell>
                  <TruncatedCell className="px-4 py-2 border-b max-w-[140px]" titleText={item.device_type}>
                    {item.device_type ?? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak typu</span>
                    )}
                  </TruncatedCell>
                  <TruncatedCell className="px-4 py-2 border-b max-w-[220px]" titleText={item.model}>
                    {item.model ?? (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak modelu</span>
                    )}
                  </TruncatedCell>
                  <TruncatedCell className="px-4 py-2 border-b max-w-[220px]" titleText={item.description}>
                    {item.description && item.description.trim() !== ""
                      ? item.description
                      : (
                        <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                          Brak opisu
                        </span>
                      )
                    }
                  </TruncatedCell>
                  <td className="px-4 py-2 border-b text-left w-20">{item.instances.length}</td>
                  <td className="px-4 py-2 border-b text-center w-12">
                    {item.instances.length > 0 ? (
                      <span className="text-xl select-none pointer-events-none">
                        {expanded[idx] ? "▲" : "▼"}
                      </span>
                    ) : null}
                  </td>
                </tr>
                {item.instances.length > 0 && expanded[idx] && (
                  <tr>
                    <td colSpan={6} className="bg-gray-100 px-4 py-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left w-1/4 max-w-[180px]">Numer seryjny</th>
                            <th className="px-2 py-1 text-left w-1/4 max-w-[120px]">Stan</th>
                            <th className="px-2 py-1 text-left w-1/4 max-w-[180px]">Lokalizacja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.instances.map((inst, i) => (
                            <React.Fragment key={inst.serial_number || i}>
                              <tr>
                                <TruncatedCell className="px-2 py-1 w-1/4 max-w-[180px]" titleText={inst.serial_number}>
                                  {inst.serial_number
                                    ? inst.serial_number
                                    : <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak numeru</span>
                                  }
                                </TruncatedCell>
                                <TruncatedCell className="px-2 py-1 w-1/4 max-w-[120px]" titleText={inst.status ? statusLabels[inst.status] || inst.status : "Nieznany"}>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    inst.status
                                      ? statusColors[inst.status] || "bg-gray-100 text-gray-700"
                                      : "bg-gray-300 text-gray-700"
                                  }`}>
                                    {inst.status
                                      ? statusLabels[inst.status] || inst.status
                                      : "Nieznany"}
                                  </span>
                                </TruncatedCell>
                                <TruncatedCell className="px-2 py-1 w-1/4 max-w-[180px]" titleText={inst.location || "Brak lokalizacji"}>
                                  {inst.location
                                    ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{inst.location}</span>
                                    : <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak lokalizacji</span>
                                  }
                                </TruncatedCell>
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