import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Inventory() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ manufacturer: '', model: '', code: '', quantity: 0, location: '', description: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('ASC');

  useEffect(() => {
    fetchItems();
  }, [search, sortBy, order]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/items', {
        params: { search, sortBy, order },
      });
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/inventory/items', formData);
      fetchItems();
      setFormData({ manufacturer: '', model: '', code: '', quantity: 0, location: '', description: '' });
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/inventory/items/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Stan magazynu</h1>

      {/* Formularz dodawania nowego produktu */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Producent:</label>
          <input
            type="text"
            placeholder="Producent"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            required
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Model:</label>
          <input
            type="text"
            placeholder="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Kod:</label>
          <input
            type="text"
            placeholder="Kod"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Ilość:</label>
          <input
            type="number"
            placeholder="Ilość"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Lokalizacja:</label>
          <input
            type="text"
            placeholder="Lokalizacja"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Opis:</label>
          <textarea
            placeholder="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          ></textarea>
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Dodaj produkt
        </button>
      </form>

      {/* Wyszukiwanie */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Szukaj produktu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '300px',
          }}
        />
      </div>

      {/* Sortowanie */}
      <div style={{ marginBottom: '20px' }}>
        <label>Sortuj według: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="id">ID</option>
          <option value="manufacturer">Producent</option>
          <option value="model">Model</option>
          <option value="quantity">Ilość</option>
          <option value="location">Lokalizacja</option>
        </select>
        <button onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}>
          {order === 'ASC' ? 'Rosnąco' : 'Malejąco'}
        </button>
      </div>

      {/* Tabela */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Nazwa</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Kod</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Ilość</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Lokalizacja</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{item.manufacturer}</td>
              <td style={{ padding: '10px' }}>{item.code}</td>
              <td style={{ padding: '10px' }}>{item.quantity}</td>
              <td style={{ padding: '10px' }}>{item.location}</td>
              <td style={{ padding: '10px' }}>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;