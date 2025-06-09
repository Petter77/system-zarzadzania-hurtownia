import React, { useState, useEffect, useMemo } from 'react';

function UsersTab() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    id: '',
    user_id: '',
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
        const response = await fetch('http://localhost:3000/audit_users/');
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
        filtered = filtered.filter((user) =>
          String(user[key]).toLowerCase().includes(filters[key].toLowerCase())
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

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {['id', 'user_id', 'changed_by', 'operation_type', 'old_data', 'new_data', 'timestamp'].map((col) => (
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
            {['id', 'user_id', 'changed_by', 'operation_type', 'old_data', 'new_data', 'timestamp'].map((col) => (
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
          {filteredData.map((user) => (
            <tr key={`user-${user.id}`} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{user.id}</td>
              <td className="border px-3 py-2">{user.user_id}</td>
              <td className="border px-3 py-2">{user.changed_by}</td>
              <td className="border px-3 py-2">{user.operation_type}</td>
              <td className="border px-3 py-2">{user.old_data}</td>
              <td className="border px-3 py-2">{user.new_data}</td>
              <td className="border px-3 py-2">{new Date(user.timestamp).toLocaleString()}</td>
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

export default UsersTab;
