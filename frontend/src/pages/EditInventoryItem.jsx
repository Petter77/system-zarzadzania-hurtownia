import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import EditDeviceForm from "../components/EditDeviceForm";
import EditInstanceForm from "../components/EditInstanceForm";
import DeleteDevice from "../components/DeleteDevice";
import DeleteInstance from "../components/DeleteInstance";

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

const EditInventoryItem = () => {
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

  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMessage, setEditMessage] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);

  useEffect(() => {
    if (editItem || deleteItem) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [editItem, deleteItem]);

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

  const handleEditItem = (item) => {
    setEditItem({ type: "item", item });
    setEditForm({
      manufacturer: item.manufacturer,
      device_type: item.device_type,
      model: item.model,
      description: item.description,
    });
    setEditMessage(null);
  };

  const handleEditInstance = (item, inst) => {
    setEditItem({ type: "instance", item, inst });
    setEditForm({
      serial_number: inst.serial_number,
      status: inst.status,
      location: inst.location,
    });
    setEditMessage(null);
  };

  const handleEditCancel = () => {
    setEditItem(null);
    setEditForm({});
    setEditMessage(null);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditMessage(null);

    try {
      if (editItem.type === "item") {
        await axios.post("http://localhost:3000/inventory/edit-item", {
          old: {
            manufacturer: editItem.item.manufacturer,
            device_type: editItem.item.device_type,
            model: editItem.item.model,
          },
          updated: {
            manufacturer: editForm.manufacturer,
            device_type: editForm.device_type,
            model: editForm.model,
            description: editForm.description,
          }
        });
        const count = editItem?.item?.instances?.length || 1;
        alert(`Edycja sprzętu dla ${count} urządzeń zakończona sukcesem!`);
        setEditItem(null);
        setEditForm({});
        axios.get("http://localhost:3000/inventory/stock")
          .then(res => setStock(res.data))
          .catch(() => setStock([]));
      } else if (editItem.type === "instance") {
        await axios.post("http://localhost:3000/inventory/edit-instance", {
          old_serial_number: editItem.inst.serial_number,
          updated: {
            serial_number: editForm.serial_number,
            status: editForm.status,
            location: editForm.location,
          }
        });
        setEditMessage("Zapisano zmiany.");
        alert("Edycja egzemplarza zakończona sukcesem!");
        setEditItem(null);
        setEditForm({});
        axios.get("http://localhost:3000/inventory/stock")
          .then(res => setStock(res.data))
          .catch(() => setStock([]));
      }
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.duplicateSerials
      ) {
        setEditMessage(
          "Nie można zedytować sprzętu, ponieważ występują powielone numery seryjne wśród egzemplarzy."
        );
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.includes("Numer seryjny już istnieje dla tego producenta")
      ) {
        setEditMessage("Numer seryjny już istnieje dla tego producenta.");
      } else if (err.response && err.response.data && err.response.data.error) {
        setEditMessage(err.response.data.error);
      } else {
        setEditMessage("Błąd podczas zapisu.");
      }
    }
  };

  const handleDeleteInstance = (item, inst) => {
    setDeleteItem({ type: "instance", item, inst });
    setDeleteMessage(null);
  };

  const handleDeleteDevice = (item) => {
    setDeleteItem({ type: "device", item });
    setDeleteMessage(null);
  };

  const handleDeleteCancel = () => {
    setDeleteItem(null);
    setDeleteMessage(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteMessage(null);
    try {
      if (deleteItem.type === "instance") {
        await axios.post("http://localhost:3000/inventory/delete-instance", {
          serial_number: deleteItem.inst.serial_number
        });
        alert("Egzemplarz został usunięty.");
      } else if (deleteItem.type === "device") {
        await axios.post("http://localhost:3000/inventory/delete-device", {
          manufacturer: deleteItem.item.manufacturer,
          device_type: deleteItem.item.device_type,
          model: deleteItem.item.model
        });
        alert("Sprzęt wraz z egzemplarzami został usunięty.");
      }
      setDeleteMessage("Usunięto.");
      setDeleteItem(null);
      axios.get("http://localhost:3000/inventory/stock")
        .then(res => setStock(res.data))
        .catch(() => setStock([]));
    } catch (err) {
      setDeleteMessage("Błąd podczas usuwania.");
      alert("Błąd podczas usuwania.");
    }
  };

  return (
    <div className="container mx-auto p-6 flex flex-row gap-6 relative bg-gray-100">
      <button
        id="filter-toggle-btn"
        className="fixed bottom-4 right-0 z-30 bg-blue-600 text-white rounded-l px-3 py-2 shadow-lg focus:outline-none transition-transform hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
        style={{ transform: showFilters ? "translateX(0)" : "translateX(0)", cursor: "pointer" }}
        onClick={() => setShowFilters(f => !f)}
        aria-label={showFilters ? "Ukryj filtry" : "Pokaż filtry"}
        type="button"
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
                  tabIndex={-1}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  {sortBy === "manufacturer"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.1em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left max-w-[140px]">
                Typ
                <button
                  className="ml-1 text-lg align-middle"
                  onClick={() => handleSort("device_type")}
                  title="Sortuj"
                  tabIndex={-1}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  {sortBy === "device_type"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.1em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left max-w-[220px]">
                Model
                <button
                  className="ml-1 text-lg align-middle"
                  onClick={() => handleSort("model")}
                  title="Sortuj"
                  tabIndex={-1}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  {sortBy === "model"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.1em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left max-w-[220px]">Opis</th>
              <th className="px-4 py-2 border-b text-left w-20" style={{ whiteSpace: "nowrap" }}>
                Ilość
                <button
                  className="ml-1 text-lg align-middle"
                  onClick={() => handleSort("quantity")}
                  title="Sortuj"
                  tabIndex={-1}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  {sortBy === "quantity"
                    ? (sortDir === "asc" ? "▲" : "▼")
                    : <span style={{fontSize: "1.1em", lineHeight: 1}}>⇅</span>}
                </button>
              </th>
              <th className="px-4 py-2 border-b text-left w-24">Akcja</th>
              <th className="px-4 py-2 border-b text-left w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((item, idx) => (
              <React.Fragment key={item.manufacturer + item.model}>
                <tr
                  className={`bg-white transition-colors ${
                    item.instances.length > 0
                      ? "cursor-pointer hover:bg-blue-50"
                      : "cursor-default"
                  }`}
                  onClick={() => {
                    if (item.instances.length > 0) toggleExpand(idx);
                  }}
                >
                  <TruncatedCell className="px-4 py-2 border-b max-w-[180px]" titleText={item.manufacturer}>
                    {item.manufacturer}
                  </TruncatedCell>
                  <TruncatedCell className="px-4 py-2 border-b max-w-[140px]" titleText={item.device_type}>
                    {item.device_type}
                  </TruncatedCell>
                  <TruncatedCell className="px-4 py-2 border-b max-w-[220px]" titleText={item.model}>
                    {item.model}
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
                  <td className="px-4 py-2 border-b text-left w-24">
                    <button
                      className="text-blue-600 font-bold mr-2 hover:text-blue-800 hover:underline hover:cursor-pointer transition-colors"
                      onClick={e => { e.stopPropagation(); handleEditItem(item); }}
                      style={{ cursor: "pointer" }}
                    >
                      Edytuj
                    </button>
                    <button
                      className="text-red-600 font-bold hover:text-red-800 hover:underline hover:cursor-pointer transition-colors"
                      onClick={e => { e.stopPropagation(); handleDeleteDevice(item); }}
                      style={{ cursor: "pointer" }}
                    >
                      Usuń
                    </button>
                  </td>
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
                    <td colSpan={7} className="bg-gray-100 px-4 py-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left w-1/4 max-w-[180px]">Numer seryjny</th>
                            <th className="px-2 py-1 text-left w-1/4 max-w-[120px]">Stan</th>
                            <th className="px-2 py-1 text-left w-1/4 max-w-[180px]">Lokalizacja</th>
                            <th className="px-2 py-1 text-left w-24">Akcja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.instances.map((inst, i) => (
                            <React.Fragment key={inst.serial_number || i}>
                              <tr>
                                <TruncatedCell className="px-2 py-1 w-1/4 max-w-[180px]" titleText={inst.serial_number}>
                                  {inst.serial_number}
                                </TruncatedCell>
                                <TruncatedCell className="px-2 py-1 w-1/4 max-w-[120px]" titleText={statusLabels[inst.status] || inst.status}>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[inst.status] || "bg-gray-100 text-gray-700"}`}>
                                    {statusLabels[inst.status] || inst.status}
                                  </span>
                                </TruncatedCell>
                                <TruncatedCell className="px-2 py-1 w-1/4 max-w-[180px]" titleText={inst.location}>
                                  {inst.location
                                    ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{inst.location}</span>
                                    : <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Brak lokalizacji</span>
                                  }
                                </TruncatedCell>
                                <td className="px-2 py-1 w-24">
                                  <button
                                    className="text-blue-600 font-bold mr-2 hover:text-blue-800 hover:underline hover:cursor-pointer transition-colors"
                                    onClick={e => { e.stopPropagation(); handleEditInstance(item, inst); }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    Edytuj
                                  </button>
                                  <button
                                    className="text-red-600 font-bold hover:text-red-800 hover:underline hover:cursor-pointer transition-colors"
                                    onClick={e => { e.stopPropagation(); handleDeleteInstance(item, inst); }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    Usuń
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={4}>
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
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-white-900 bg-opacity-40 backdrop-blur"></div>
          <div className="relative bg-white rounded shadow p-6 w-full max-w-lg flex flex-col">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700"
              onClick={handleEditCancel}
              title="Zamknij"
            >×</button>
            {editItem.type === "item" ? (
              <EditDeviceForm
                form={editForm}
                onChange={handleEditFormChange}
                onCancel={handleEditCancel}
                onSubmit={handleEditSubmit}
                message={editMessage}
                count={editItem?.item?.instances?.length}
                originalManufacturer={editItem?.item?.manufacturer}
                originalDeviceType={editItem?.item?.device_type}
                originalModel={editItem?.item?.model}
              />
            ) : (
              <EditInstanceForm
                form={editForm}
                onChange={handleEditFormChange}
                onCancel={handleEditCancel}
                onSubmit={handleEditSubmit}
                message={editMessage}
                device={editItem?.item}
              />
            )}
          </div>
        </div>
      )}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-white-900 bg-opacity-40 backdrop-blur"></div>
          <div className="relative bg-white rounded shadow p-6 w-full max-w-lg flex flex-col">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700"
              onClick={handleDeleteCancel}
              title="Zamknij"
            >×</button>
            {deleteItem.type === "device" ? (
              <DeleteDevice
                device={deleteItem.item}
                onCancel={handleDeleteCancel}
                onDelete={handleDeleteConfirm}
                message={deleteMessage}
              />
            ) : (
              <DeleteInstance
                device={deleteItem.item}
                instance={deleteItem.inst}
                onCancel={handleDeleteCancel}
                onDelete={handleDeleteConfirm}
                message={deleteMessage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditInventoryItem;