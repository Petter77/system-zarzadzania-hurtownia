import express from 'express';
import {
  getItems,
  addItem,
  updateItem,
  deleteItem
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/items', getItems);           // Pobierz listę produktów
router.post('/items', addItem);           // Dodaj produkt
router.put('/items/:id', updateItem);     // Edytuj produkt
router.delete('/items/:id', deleteItem);  // Usuń produkt

export default router;