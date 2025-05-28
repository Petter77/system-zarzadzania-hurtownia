import React, { useEffect, useState } from 'react';
import { getItems, deleteItem } from '../api/inventoryApi';
import { useNavigate } from 'react-router-dom';

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const response = await getItems();
    setItems(response.data);
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista przedmiotów</h2>
      <button onClick={() => navigate('/add')} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
        Dodaj nowy
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Producent</th><th>Model</th><th>Kod</th><th>Ilość</th><th>Lokalizacja</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b">
              <td>{item.manufacturer}</td>
              <td>{item.model}</td>
              <td>{item.code}</td>
              <td>{item.quantity}</td>
              <td>{item.location}</td>
              <td>
                <button onClick={() => navigate(`/edit/${item.id}`)} className="text-blue-500">Edytuj</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 ml-2">Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;
