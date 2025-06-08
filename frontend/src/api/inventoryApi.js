import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const getItems = () => api.get('/inventory/items');
export const addItem = (item) => api.post('/inventory/items', item);
export const updateItem = (id, item) => api.put(`/inventory/items/${id}`, item);
<<<<<<< HEAD
export const deleteItem = (id) => api.delete(`/inventory/items/${id}`);
=======
export const deleteItem = (id) => api.delete(`/inventory/items/${id}`);
>>>>>>> 9bedf9316420435ae0d19759be3edebef91cdac0
