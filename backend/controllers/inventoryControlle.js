import { Op } from 'sequelize'; // Import operatorów SequelizeAdd commentMore actions
import { Op } from 'sequelize'; 
import { InventoryItem } from '../models/index.js';

// Pobierz listę produktów z opcjami wyszukiwania i sortowania
export const getItems = async (req, res) => {
  const { search, sortBy = 'id', order = 'ASC' } = req.query; // Pobierz parametry zapytania
  const { search, sortBy = 'id', order = 'ASC' } = req.query; 
  try {
    const where = search
      ? {
          [Op.or]: [
            { manufacturer: { [Op.like]: `%${search}%` } },
            { model: { [Op.like]: `%${search}%` } },
            { code: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const items = await InventoryItem.findAll({
      where,
      order: [[sortBy, order.toUpperCase()]], // Sortowanie
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Dodaj nowy produkt
export const addItem = async (req, res) => {
  const { manufacturer, model, code, quantity, location, description } = req.body;
  try {
    const newItem = await InventoryItem.create({
      manufacturer,
      model,
      code,
      quantity,
      location,
      description,
    });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
};

// Zaktualizuj istniejący produkt
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { manufacturer, model, code, quantity, location, description } = req.body;
  try {
    const item = await InventoryItem.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.manufacturer = manufacturer;
    item.model = model;
    item.code = code;
    item.quantity = quantity;
    item.location = location;
    item.description = description;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Usuń produkt
export const deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await InventoryItem.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await item.destroy();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }