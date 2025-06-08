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
      inv.model,
      inv.description,
      inv.location AS item_location
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
          model: row.model,
          description: row.description,
          item_location: row.item_location,
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
  const { manufacturer, model, description, code, location } = req.body;
  const sql = `
    INSERT INTO inventory_items (manufacturer, model, description, code, location)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [manufacturer, model, description, code, location], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera przy dodawaniu sprzętu.' });
    res.json({ itemId: result.insertId });
  });
});

router.post('/add-instances', (req, res) => {
  const { item_id, serialNumbers, location } = req.body;
  if (!item_id) return res.status(400).json({ error: 'Brak item_id.' });

  const serials = (serialNumbers || []).map(s => s.trim()).filter(s => s !== "");
  if (serials.length !== new Set(serials).size) {
    return res.status(400).json({ error: "Numery seryjne muszą być unikalne." });
  }

  const values = serials.map(serial =>
    [item_id, serial, 'available', location || null]
  );

  if (values.length === 0) {
    return res.status(400).json({ error: "Musisz podać przynajmniej jeden numer seryjny." });
  }

  db.query(
    "INSERT INTO item_instances (item_id, serial_number, status, location) VALUES ?",
    [values],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Podany numer seryjny już istnieje w bazie." });
        }
        return res.status(500).json({ error: 'Błąd serwera przy dodawaniu instancji.' });
      }
      res.json({ message: 'Instancje dodane.' });
    }
  );
});

module.exports = router;