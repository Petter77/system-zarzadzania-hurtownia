const express = require('express');
const router = express.Router();
const db = require('../db');
const checkToken = require('../middlewares/auth/checkToken');

// POST /inout_operations/borrow
router.post('/borrow', checkToken, (req, res) => {
  const { items } = req.body; // [{ item_id, quantity, item }, ...]
    console.log("Dziala endpoint");
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Brak danych do zapisania' });
  }

  const values = items.map((entry) => [
    entry.item.id,          // instance_id
    'borrow',               // type
    new Date(),             // timestamp (SQL datetime)
    1                       // quantity (na sztywno 1)
  ]);

  const query = `
    INSERT INTO inout_operations (instance_id, type, timestamp, quantity)
    VALUES ?
  `;

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Błąd zapisu do bazy:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    return res.status(201).json({
      message: 'Wypożyczenie zapisane',
      inserted: result.affectedRows
    });
  });
});

// GET /inout_operations/available
router.get('/available', (req, res) => {
  const query = `
    SELECT 
      ii.*, 
      inv.manufacturer, 
      inv.model, 
      inv.description
    FROM 
      item_instances AS ii
    JOIN 
      inventory_items AS inv ON ii.item_id = inv.id
    WHERE 
      ii.status = 'available'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Błąd podczas pobierania dostępnych przedmiotów:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    return res.status(200).json(results);
  });
});

module.exports = router;
