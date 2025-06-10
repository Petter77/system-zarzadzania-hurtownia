import React, { useState, useEffect, useMemo } from 'react';
import { diffJson } from 'diff';

function UsersTab() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    id: '',
    timestamp: '',
    user_id: '',
    operation_type: '',
    data_id: '',
    data_type: '',
    previous_data: '',
    new_data: ''
  });

  useEffect(() => {
    setData([]);

    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('user');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch('http://localhost:3000/audit_logs/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            console.error('Brak uprawnień do wyświetlenia logów audytu');
          } else {
            console.error(`Błąd serwera: ${response.status}`);
          }
          return;
        }

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
        filtered = filtered.filter((log) => {
          if (key === 'timestamp') {
            return new Date(log[key]).toLocaleString().toLowerCase().includes(filters[key].toLowerCase());
          }
          return String(log[key]).toLowerCase().includes(filters[key].toLowerCase());
        });
      }
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (sortConfig.key === 'timestamp') {
          const dateA = new Date(aVal);
          const dateB = new Date(bVal);
          if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

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

  const auditLogColumns = [
    'timestamp',
    'user_id',
    'operation_type',
    'data_type',
    'data_id',
    'changes'
  ];

  const renderJsonDiff = (previousData, newData) => {
    if (!previousData && !newData) return null;
    
    const prevJson = previousData ? JSON.parse(previousData) : {};
    const newJson = newData ? JSON.parse(newData) : {};
    
    const differences = diffJson(prevJson, newJson);
    
    return (
      <div className="text-xs break-words max-w-xs overflow-auto whitespace-pre font-mono">
        {differences.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? 'bg-green-100 text-green-800'
                : part.removed
                ? 'bg-red-100 text-red-800'
                : ''
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {auditLogColumns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 cursor-pointer"
                onClick={() => handleSort(col)}
              >
                {col.toUpperCase().replace('_', ' ')} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
          <tr>
            {auditLogColumns.map((col) => (
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
          {filteredData.map((log) => (
            <tr key={`log-${log.id}`} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="border px-3 py-2">{log.user_id}</td>
              <td className="border px-3 py-2">{log.operation_type}</td>
              <td className="border px-3 py-2">{log.data_type}</td>
              <td className="border px-3 py-2">{log.data_id}</td>
              <td className="border px-3 py-2">
                {renderJsonDiff(log.previous_data, log.new_data)}
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={auditLogColumns.length} className="text-center py-4">
                Brak danych do wyświetlenia
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTab;
