import React from 'react';
import InventoryForm from '../components/InventoryForm';
import { addItem } from '../api/inventoryApi';
import { useNavigate } from 'react-router-dom';

const AddItem = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await addItem(data);
    navigate('/');
  };

  return <InventoryForm onSubmit={handleSubmit} />;
};

export default AddItem;
