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

module.exports = router;