const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stock', (req, res) => {
  const sql = `
    SELECT 
      ii.id AS instance_id,
      ii.serial_number,
      ii.status,
      ii.location AS instance_location,
      inv.id AS item_id,
      inv.manufacturer,
      inv.device_type,
      inv.model,
      inv.description
    FROM item_instances ii
    JOIN inventory_items inv ON ii.item_id = inv.id
    ORDER BY inv.manufacturer, inv.model, ii.serial_number
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });

    const grouped = {};
    rows.forEach(row => {
      const key = `${row.manufacturer}|${row.model}`;
      if (!grouped[key]) {
        grouped[key] = {
          manufacturer: row.manufacturer,
          device_type: row.device_type,
          model: row.model,
          description: row.description,
          instances: [],
        };
      }
      grouped[key].instances.push({
        serial_number: row.serial_number,
        status: row.status,
        location: row.instance_location,
      });
    });

    const result = Object.values(grouped).map(group => ({
      ...group,
      quantity: group.instances.length,
    }));

    res.json(result);
  });
});

router.post('/add-item', (req, res) => {
  const { manufacturer, device_type, model, description } = req.body;
  const selectSql = `
    SELECT id FROM inventory_items
    WHERE manufacturer = ? AND device_type = ? AND model = ? AND description = ?
    LIMIT 1
  `;
  db.query(selectSql, [manufacturer, device_type, model, description], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera przy sprawdzaniu sprzętu.' });
    if (results.length > 0) {
      return res.json({ itemId: results[0].id });
    }
    const insertSql = `
      INSERT INTO inventory_items (manufacturer, device_type, model, description)
      VALUES (?, ?, ?, ?)
    `;
    db.query(insertSql, [manufacturer, device_type, model, description], (err, result) => {
      if (err) return res.status(500).json({ error: 'Błąd serwera przy dodawaniu sprzętu.' });
      res.json({ itemId: result.insertId });
    });
  });
});

router.post('/add-instances', (req, res) => {
  const { item_id, serialNumbers, location } = req.body;
  if (!item_id || !serialNumbers || !Array.isArray(serialNumbers) || serialNumbers.length === 0) {
    return res.status(400).json({ error: "Brak wymaganych danych." });
  }

  const checkSql = `
    SELECT serial_number FROM item_instances
    WHERE serial_number IN (${serialNumbers.map(() => '?').join(',')})
  `;
  db.query(checkSql, serialNumbers, (err, results) => {
    if (err) return res.status(500).json({ error: "Błąd serwera przy sprawdzaniu numerów seryjnych." });
    if (results.length > 0) {
      const existing = results.map(r => r.serial_number).join(', ');
      return res.status(400).json({ error: `Numery seryjne już istnieją: ${existing}` });
    }

    const values = serialNumbers.map(sn => [item_id, sn, location || null]);
    const insertSql = `
      INSERT INTO item_instances (item_id, serial_number, location)
      VALUES ?
    `;
    db.query(insertSql, [values], (err, result) => {
      if (err) return res.status(500).json({ error: "Błąd serwera przy dodawaniu instancji." });
      res.json({ success: true, added: result.affectedRows });
    });
  });
});

router.get('/description', (req, res) => {
  const { manufacturer, device_type, model } = req.query;
  if (!manufacturer || !device_type || !model) {
    return res.status(400).json({ error: "Brak wymaganych parametrów." });
  }
  db.query(
    "SELECT description FROM inventory_items WHERE manufacturer = ? AND device_type = ? AND model = ? LIMIT 1",
    [manufacturer, device_type, model],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Błąd serwera." });
      if (results.length === 0) return res.json({});
      res.json({ description: results[0].description });
    }
  );
});

router.post('/edit-item', (req, res) => {
  const { old, updated } = req.body;
  if (!old || !updated) {
    return res.status(400).json({ error: "Brak wymaganych danych." });
  }
  const updateSql = `
    UPDATE inventory_items
    SET manufacturer = ?, device_type = ?, model = ?, description = ?
    WHERE manufacturer = ? AND device_type = ? AND model = ?
  `;
  db.query(
    updateSql,
    [
      updated.manufacturer,
      updated.device_type,
      updated.model,
      updated.description,
      old.manufacturer,
      old.device_type,
      old.model
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Błąd serwera przy edycji sprzętu." });
      res.json({ success: true, changedRows: result.changedRows });
    }
  );
});

router.post('/edit-instance', (req, res) => {
  const { old_serial_number, updated } = req.body;
  if (!old_serial_number || !updated) {
    return res.status(400).json({ error: "Brak wymaganych danych." });
  }
  const updateSql = `
    UPDATE item_instances
    SET serial_number = ?, status = ?, location = ?
    WHERE serial_number = ?
  `;
  db.query(
    updateSql,
    [
      updated.serial_number,
      updated.status,
      updated.location,
      old_serial_number
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Błąd serwera przy edycji egzemplarza." });
      res.json({ success: true, changedRows: result.changedRows });
    }
  );
});

router.post('/delete-instance', (req, res) => {
  const { serial_number } = req.body;
  if (!serial_number) {
    return res.status(400).json({ error: "Brak numeru seryjnego." });
  }
  const deleteSql = `DELETE FROM item_instances WHERE serial_number = ?`;
  db.query(deleteSql, [serial_number], (err, result) => {
    if (err) return res.status(500).json({ error: "Błąd serwera przy usuwaniu egzemplarza." });
    res.json({ success: true, affectedRows: result.affectedRows });
  });
});

router.post('/delete-device', (req, res) => {
  const { manufacturer, device_type, model } = req.body;
  if (!manufacturer || !device_type || !model) {
    return res.status(400).json({ error: "Brak wymaganych danych." });
  }
  db.query(
    "SELECT id FROM inventory_items WHERE manufacturer = ? AND device_type = ? AND model = ? LIMIT 1",
    [manufacturer, device_type, model],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Błąd serwera." });
      if (results.length === 0) return res.status(404).json({ error: "Nie znaleziono urządzenia." });
      const itemId = results[0].id;
      db.query(
        "DELETE FROM item_instances WHERE item_id = ?",
        [itemId],
        (err) => {
          if (err) return res.status(500).json({ error: "Błąd serwera przy usuwaniu egzemplarzy." });
          db.query(
            "DELETE FROM inventory_items WHERE id = ?",
            [itemId],
            (err2, result2) => {
              if (err2) return res.status(500).json({ error: "Błąd serwera przy usuwaniu sprzętu." });
              res.json({ success: true, affectedRows: result2.affectedRows });
            }
          );
        }
      );
    }
  );
});

module.exports = router;