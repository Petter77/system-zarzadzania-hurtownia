const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /inout_operations/borrow
router.post('/borrow', (req, res) => {
    console.log('Otrzymane item_ids:', req.body.item_ids);
  const { item_ids } = req.body; 

  if (!Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'Brak danych do zapisania' });
  }

  const values = item_ids.map((instanceId) => [
    instanceId,           // instance_id
    'borrow',             // type
    new Date(),           // timestamp
    1                     // quantity na sztywno
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
      inv.description,
      ii.serial_number
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

// GET /inout_operations/borrowed
router.get('/borrowed', (req, res) => {
  const query = `
    SELECT 
      ii.*, 
      inv.manufacturer, 
      inv.model, 
      inv.description,
      ii.serial_number
    FROM 
      item_instances AS ii
    JOIN 
      inventory_items AS inv ON ii.item_id = inv.id
    WHERE 
      ii.status = 'borrowed'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Błąd podczas pobierania dostępnych przedmiotów:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    return res.status(200).json(results);
  });
});

// GET /inout_operations/damaged
router.get('/damaged', (req, res) => {
  const query = `
    SELECT 
      ii.*, 
      inv.manufacturer, 
      inv.model, 
      inv.description,
      ii.serial_number
    FROM 
      item_instances AS ii
    JOIN 
      inventory_items AS inv ON ii.item_id = inv.id
    WHERE 
      ii.status = 'damaged'
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
