const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /inout_operations/borrow
router.post('/borrow', (req, res) => {
  console.log('REQ BODY CAŁY:', req.body);
  const { item_ids } = req.body;

  if (!Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'Brak danych do zapisania' });
  }

  const values = item_ids.map((instanceId) => [
    instanceId,
    'borrow',
    new Date(),
    1
  ]);

  const insertQuery = `
    INSERT INTO in_out_operations (instance_id, type, timestamp, quantity)
    VALUES ?
  `;

  db.query(insertQuery, [values], (insertErr, insertResult) => {
    if (insertErr) {
      console.error(' Błąd zapisu do bazy:', insertErr);
      return res.status(500).json({ error: 'Błąd serwera przy zapisie wypożyczenia' });
    }

    const updateQuery = `
      UPDATE item_instances
      SET status = 'borrowed'
      WHERE id IN (${item_ids.map(() => '?').join(',')})
    `;

    db.query(updateQuery, item_ids, (updateErr, updateResult) => {
      if (updateErr) {
        console.error(' Błąd aktualizacji statusu:', updateErr);
        return res.status(500).json({ error: 'Błąd przy aktualizacji statusu urządzeń' });
      }

      return res.status(201).json({
        message: 'Wypożyczenie zapisane, statusy zmienione na "damaged"',
        inserted: insertResult.affectedRows,
        updated: updateResult.affectedRows
      });
    });
  });
});

// POST /inout_operations/toService
router.post('/toService', (req, res) => {
  console.log('REQ BODY CAŁY:', req.body);
  const { item_ids, service_address } = req.body;

  if (!Array.isArray(item_ids) || item_ids.length === 0 || !service_address) {
    return res.status(400).json({ error: 'Brak danych do zapisania' });
  }

  const values = item_ids.map((instanceId) => [
    instanceId,
    'to_service',                  // <- zmieniono typ operacji
    new Date(),
    1,
    service_address                // <- dodano adres serwisu
  ]);

  const insertQuery = `
    INSERT INTO in_out_operations (instance_id, type, timestamp, quantity, service_destination)
    VALUES ?
  `;

  db.query(insertQuery, [values], (insertErr, insertResult) => {
    if (insertErr) {
      console.error('Błąd zapisu do bazy:', insertErr);
      return res.status(500).json({ error: 'Błąd serwera przy zapisie operacji serwisowej' });
    }

    const updateQuery = `
      UPDATE item_instances
      SET status = 'to_service'    -- <- zmieniono status na 'to_service'
      WHERE id IN (${item_ids.map(() => '?').join(',')})
    `;

    db.query(updateQuery, item_ids, (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Błąd aktualizacji statusu:', updateErr);
        return res.status(500).json({ error: 'Błąd przy aktualizacji statusu urządzeń' });
      }

      return res.status(201).json({
        message: 'Urządzenia dodane do serwisu, statusy zaktualizowane',
        inserted: insertResult.affectedRows,
        updated: updateResult.affectedRows
      });
    });
  });
});



// POST /inout_operations/return
router.post('/return', (req, res) => {
  console.log('REQ BODY CAŁY:', req.body);
  const { item_ids } = req.body;

  if (!Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'Brak danych do zapisania' });
  }

  const values = item_ids.map((instanceId) => [
    instanceId,
    'return',
    new Date(),
    1
  ]);

  const insertQuery = `
    INSERT INTO in_out_operations (instance_id, type, timestamp, quantity)
    VALUES ?
  `;

  db.query(insertQuery, [values], (insertErr, insertResult) => {
    if (insertErr) {
      console.error('Błąd zapisu do inout_operations:', insertErr);
      return res.status(500).json({ error: 'Błąd przy zapisie zwrotu' });
    }

    const updateQuery = `
      UPDATE item_instances
      SET status = 'available'
      WHERE id IN (?)
    `;

    db.query(updateQuery, [item_ids], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Błąd przy aktualizacji statusu:', updateErr);
        return res.status(500).json({ error: 'Błąd przy aktualizacji statusu urządzeń' });
      }

      return res.status(201).json({
        message: 'Zwrot zapisany i statusy zaktualizowane',
        inserted: insertResult.affectedRows,
        updated: updateResult.affectedRows
      });
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
