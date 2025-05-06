import express from 'express';
import { getItems, addItem, updateItem, deleteItem } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/items', getItems); // Pobierz listę przedmiotów
router.post('/items', addItem); // Dodaj nowy przedmiot
router.put('/items/:id', updateItem); // Zaktualizuj przedmiot
router.delete('/items/:id', deleteItem); // Usuń przedmiot

export default router;