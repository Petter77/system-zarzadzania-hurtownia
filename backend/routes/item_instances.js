const express = require('express');
const router = express.Router();
const db = require('../db');
const { logOperation } = require('../utils/logger');

// GET /item_instances
router.get('/', (req, res) => {
  db.query('SELECT * FROM item_instances', (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.json(results);
  });
});

// POST /item_instances
router.post('/', (req, res) => {
  const { item_id, serial_number, status, location } = req.body;
  
  db.query('INSERT INTO item_instances (item_id, serial_number, status, location) VALUES (?, ?, ?, ?)',
    [item_id, serial_number, status, location],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Błąd serwera' });
      
      // Logowanie operacji tworzenia
      logOperation(
        1, // Tymczasowo używamy ID 1 dla systemu
        'item_instance',
        result.insertId,
        'create',
        null,
        { item_id, serial_number, status, location }
      );
      
      res.status(201).json({ id: result.insertId });
    }
  );
});

// PUT /item_instances/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { item_id, serial_number, status, location } = req.body;

  // Pobierz stare dane przed aktualizacją
  db.query('SELECT * FROM item_instances WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (results.length === 0) return res.status(404).json({ error: 'Instancja przedmiotu nie znaleziona' });

    const previousData = results[0];

    db.query('UPDATE item_instances SET item_id = ?, serial_number = ?, status = ?, location = ? WHERE id = ?',
      [item_id, serial_number, status, location, id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });

        // Logowanie operacji aktualizacji
        logOperation(
          1, // Tymczasowo używamy ID 1 dla systemu
          'item_instance',
          id,
          'update',
          previousData,
          { item_id, serial_number, status, location }
        );

        res.json({ message: 'Zaktualizowano instancję przedmiotu' });
      }
    );
  });
});

// DELETE /item_instances/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Pobierz dane przed usunięciem
  db.query('SELECT * FROM item_instances WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (results.length === 0) return res.status(404).json({ error: 'Instancja przedmiotu nie znaleziona' });

    const previousData = results[0];

    db.query('DELETE FROM item_instances WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Błąd serwera' });

      // Logowanie operacji usuwania
      logOperation(
        1, // Tymczasowo używamy ID 1 dla systemu
        'item_instance',
        id,
        'delete',
        previousData,
        null
      );

      res.json({ message: 'Usunięto instancję przedmiotu' });
    });
  });
});

module.exports = router; 