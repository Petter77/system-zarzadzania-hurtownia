import React, { useState, useEffect } from 'react';

const InventoryForm = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState(initialData || {
    manufacturer: '',
    model: '',
    code: '',
    quantity: 1,
    location: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-xl">
      {Object.keys(form).map(key => (
        <div key={key} className="mb-3">
          <label className="block font-semibold capitalize">{key}</label>
          <input
            name={key}
            value={form[key]}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      ))}
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Zapisz</button>
    </form>
  );
};

export default InventoryForm;
