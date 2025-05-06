import React, { useState } from 'react';
import axios from 'axios';

function OperationForm() {
  const [formData, setFormData] = useState({
    instance_id: '',
    type: 'in',
    quantity: 1,
    remarks: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Pobierz token JWT
      const response = await axios.post('http://localhost:3000/api/operation', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Operation added successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to add operation.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Instance ID:
        <input type="text" name="instance_id" value={formData.instance_id} onChange={handleChange} required />
      </label>
      <label>
        Type:
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="in">In</option>
          <option value="out">Out</option>
          <option value="borrow">Borrow</option>
          <option value="return">Return</option>
        </select>
      </label>
      <label>
        Quantity:
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
      </label>
      <label>
        Remarks:
        <textarea name="remarks" value={formData.remarks} onChange={handleChange}></textarea>
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default OperationForm;