import React, { useEffect, useState } from 'react';
import { updateItem, getItems } from '../api/inventoryApi';
import InventoryForm from '../components/InventoryForm';
import { useNavigate, useParams } from 'react-router-dom';

const EditItem = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getItems().then(res => {
      const found = res.data.find(i => i.id === parseInt(id));
      setItem(found);
    });
  }, [id]);

  const handleSubmit = async (data) => {
    await updateItem(id, data);
    navigate('/');
  };

  return item ? <InventoryForm onSubmit={handleSubmit} initialData={item} /> : <div>Loading...</div>;
};

export default EditItem;
