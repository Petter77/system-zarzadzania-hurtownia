import React, { useState, useEffect, useMemo } from 'react';

function ItemsTab() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    id: '',
    instance_id: '',
    changed_by: '',
    operation_type: '',
    old_data: '',
    new_data: '',
    timestamp: ''
  });

  useEffect(() => {
    setData([]);
  
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/audit_item_instances/');
        const jsonData = await response.json();
  
        if (jsonData && jsonData.results && Array.isArray(jsonData.results)) {
          setData(jsonData.results);
        } else {
          console.error('Nieprawidłowy format odpowiedzi z API');
        }
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      }
    };
  
    fetchData();
  
    return () => {
      setData([]);
    };
  }, []);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filtered = filtered.filter((item) =>
          String(item[key]).toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const columns = ['id', 'instance_id', 'changed_by', 'operation_type', 'old_data', 'new_data', 'timestamp'];

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 cursor-pointer"
                onClick={() => handleSort(col)}
              >
                {col.toUpperCase()} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-2 py-1">
                <input
                  type="text"
                  value={filters[col]}
                  onChange={(e) => handleFilterChange(col, e.target.value)}
                  placeholder="Szukaj..."
                  className="w-full p-1 border border-gray-300 rounded"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={`item-${item.id}`} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{item.id}</td>
              <td className="border px-3 py-2">{item.instance_id}</td>
              <td className="border px-3 py-2">{item.changed_by}</td>
              <td className="border px-3 py-2">{item.operation_type}</td>
              <td className="border px-3 py-2">{item.old_data}</td>
              <td className="border px-3 py-2">{item.new_data}</td>
              <td className="border px-3 py-2">{new Date(item.timestamp).toLocaleString()}</td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-400">
                Brak wyników
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ItemsTab;
