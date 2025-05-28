import React, { useEffect, useState } from 'react';
import axios from 'axios';

function InventoryTable() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('manufacturer');
  const [order, setOrder] = useState('ASC');
  const [editId, setEditId] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [showSort, setShowSort] = useState(false);

  const [newItem, setNewItem] = useState({
    manufacturer: '',
    model: '',
    code: '',
    quantity: 0,
    location: '',
    description: '',
  });

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [search, sortBy, order]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${apiUrl}/inventory/items`, {
        params: { search, sortBy, order }
      });
      setItems(res.data);
    } catch (err) {
      alert('Błąd pobierania danych');
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/inventory/items`, newItem);
      setNewItem({
        manufacturer: '',
        model: '',
        code: '',
        quantity: 0,
        location: '',
        description: '',
      });
      fetchItems();
    } catch (err) {
      alert('Błąd dodawania sprzętu');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/inventory/items/${id}`);
      fetchItems();
    } catch (err) {
      alert('Błąd usuwania sprzętu');
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditedItem(item);
  };

  const handleEditChange = (e) => {
    setEditedItem({ ...editedItem, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${apiUrl}/inventory/items/${id}`, editedItem);
      setEditId(null);
      fetchItems();
    } catch (err) {
      alert('Błąd zapisu zmian');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Stan magazynu</h2>

      <input
        type="text"
        placeholder="Szukaj..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <button onClick={() => setShowSort(!showSort)} style={{ marginLeft: 10 }}>
        Sortuj
      </button>
      {showSort && (
        <div style={{ margin: '10px 0' }}>
          <label>
            Sortuj według:&nbsp;
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ marginRight: 10 }}
            >
              <option value="manufacturer">Producent (A-Z)</option>
              <option value="model">Model (A-Z)</option>
              <option value="code">Kod (A-Z)</option>
              <option value="quantity">Ilość</option>
              <option value="location">Lokalizacja (A-Z)</option>
            </select>
          </label>
          <label>
            Kierunek:&nbsp;
            <select
              value={order}
              onChange={e => setOrder(e.target.value)}
            >
              <option value="ASC">Rosnąco</option>
              <option value="DESC">Malejąco</option>
            </select>
          </label>
        </div>
      )}

      <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Producent</th>
            <th>Model</th>
            <th>Kod</th>
            <th>Ilość</th>
            <th>Lokalizacja</th>
            <th>Opis</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item =>
            editId === item.id ? (
              <tr key={item.id}>
                <td><input name="manufacturer" value={editedItem.manufacturer} onChange={handleEditChange} /></td>
                <td><input name="model" value={editedItem.model} onChange={handleEditChange} /></td>
                <td><input name="code" value={editedItem.code} onChange={handleEditChange} /></td>
                <td><input name="quantity" type="number" value={editedItem.quantity} onChange={handleEditChange} /></td>
                <td><input name="location" value={editedItem.location} onChange={handleEditChange} /></td>
                <td><input name="description" value={editedItem.description} onChange={handleEditChange} /></td>
                <td>
                  <button onClick={() => handleSave(item.id)}>Zapisz</button>
                  <button onClick={() => setEditId(null)}>Anuluj</button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.manufacturer}</td>
                <td>{item.model}</td>
                <td>{item.code}</td>
                <td>{item.quantity}</td>
                <td>{item.location}</td>
                <td>{item.description}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edytuj</button>
                  <button onClick={() => handleDelete(item.id)}>Usuń</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: 20 }}>Dodaj nowy sprzęt</h3>
      <form onSubmit={handleAdd} style={{ display: 'grid', gap: 10, maxWidth: 400 }}>
        <input name="manufacturer" placeholder="Producent" value={newItem.manufacturer} onChange={handleChange} required />
        <input name="model" placeholder="Model" value={newItem.model} onChange={handleChange} required />
        <input name="code" placeholder="Kod" value={newItem.code} onChange={handleChange} required />
        <input name="quantity" type="number" placeholder="Ilość" value={newItem.quantity} onChange={handleChange} required />
        <input name="location" placeholder="Lokalizacja" value={newItem.location} onChange={handleChange} />
        <textarea name="description" placeholder="Opis" value={newItem.description} onChange={handleChange}></textarea>
        <button type="submit">Zapisz</button>
      </form>
    </div>
  );
}

export default InventoryTable;