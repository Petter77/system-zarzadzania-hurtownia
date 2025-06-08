const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');

// get all users
router.get('/getAllUsers', authorizeRoles('manager'), (req, res) => {
    db.query('SELECT id, username FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({ results });
    });
});

// get inventory reports
router.get('/getReportsInventory', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM `reports` WHERE type = 0', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

// get invoices reports
router.get('/getReportsInvoices', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM `reports` WHERE type = 1', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

// get user by user id in db
router.get('/userDetails/:id', authorizeRoles('manager'), (req, res) =>{
  const {id} = req.params
  db.query('SELECT * FROM users WHERE id=?', [id], (err, result) =>{
      if (err) return res.status(500).json({ error: 'Błąd serwera' });
      res.status(200).json({ user: result[0] });
  })
})

// get unique producer, model and localization for create report form
router.get('/getDataForCreate', authorizeRoles('manager'), (req, res) => {
    const data = {};
  
    db.query('SELECT DISTINCT manufacturer FROM inventory_items;', (err, result) => {
      if (err) return res.status(500).json({ error: 'Błąd serwera' });
      data.manufacturers = result.map(row => row.manufacturer);
  
      db.query('SELECT DISTINCT model FROM inventory_items;', (err, result) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        data.models = result.map(row => row.model);
  
        db.query('SELECT DISTINCT location FROM item_instances;', (err, result) => {
          if (err) return res.status(500).json({ error: 'Błąd serwera' });
          data.locations = result.map(row => row.location);
  
          res.status(200).json(data);
        });
      });
    });
  });

// create report and assign items to it 
router.post('/createReport', authorizeRoles('manager'), (req, res) => {
  const userId = req.user?.user?.userId;
  const { reportName, localizations, models, producers, statuses } = req.body;

  if (!reportName) return res.sendStatus(400);

  // sprawdzenie czy taka nazwa już istnieje
  db.query("SELECT * FROM `reports` WHERE `title` = ?", [reportName], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (result.length > 0) {
      return res.status(409).json({ error: 'Raport o takiej nazwie już istnieje!' });
    }

    // jeżeli nie, idź dalej
    db.query(
      "INSERT INTO `reports` (`title`, `created_by`, `created_at`) VALUES (?, ?, current_timestamp())",
      [reportName, userId],
      (err, reportResult) => {
        if (err) return res.sendStatus(500);

        const reportId = reportResult.insertId;

        // Budowanie dynamicznego zapytania
        let sql = `
          SELECT ii.id
          FROM item_instances ii
          JOIN inventory_items inv ON ii.item_id = inv.id
        `;
        const filters = [];
        const params = [];

        if (localizations && localizations.length > 0) {
          filters.push(`ii.location IN (${localizations.map(() => '?').join(',')})`);
          params.push(...localizations);
        }
        if (models && models.length > 0) {
          filters.push(`inv.model IN (${models.map(() => '?').join(',')})`);
          params.push(...models);
        }
        if (producers && producers.length > 0) {
          filters.push(`inv.manufacturer IN (${producers.map(() => '?').join(',')})`);
          params.push(...producers);
        }
        if (statuses && statuses.length > 0) {
          filters.push(`ii.status IN (${statuses.map(() => '?').join(',')})`);
          params.push(...statuses);
        }

        if (filters.length > 0) {
          sql += ' WHERE ' + filters.join(' AND ');
        }

        // Pobierz urządzenia spełniające filtry
        db.query(sql, params, (err, items) => {
          if (err) return res.status(500).json({ error: 'Błąd serwera', details: err });

          if (!items.length) return res.sendStatus(201); // raport bez urządzeń

          // Przypisz urządzenia do raportu
          const values = items.map(item => [reportId, item.id, reportName]);
          db.query(
            "INSERT INTO report_items (report_id, instance_id, remarks) VALUES ?",
            [values],
            (err) => {
              if (err) return res.status(500).json({ error: 'Błąd przypisywania urządzeń', details: err });
              res.sendStatus(201);
            }
          );
        });
      }
    );
  });
});

// get report items
router.get('/getReportItems/:reportId', authorizeRoles('manager'), (req, res) => {
  const { reportId } = req.params;
  const sql = `
    SELECT 
      ri.instance_id,
      ii.serial_number,
      ii.status,
      ii.location,
      inv.manufacturer,
      inv.model
    FROM report_items ri
    JOIN item_instances ii ON ri.instance_id = ii.id
    JOIN inventory_items inv ON ii.item_id = inv.id
    WHERE ri.report_id = ?;
  `;
  db.query(sql, [reportId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.status(200).json({ results });
  });
});

// create invoices report and assign invoices to it 
router.post('/createReportInvoices', authorizeRoles('manager'), (req, res) => {
  const userId = req.user?.user?.userId;
  const { reportName, startDate, finishDate, users} = req.body;

  if (!reportName) return res.sendStatus(400);

  // sprawdzenie czy taka nazwa już istnieje
  db.query("SELECT * FROM `reports` WHERE `title` = ?", [reportName], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (result.length > 0) {
      return res.status(409).json({ error: 'Raport o takiej nazwie już istnieje!' });
    }

    // jeżeli nie, idź dalej
    db.query(
      "INSERT INTO `reports` (`title`, `created_by`, `created_at`, `type`) VALUES (?, ?, current_timestamp(), 1)",
      [reportName, userId],
      (err, reportResult) => {
        if (err) return res.sendStatus(500);

        const reportId = reportResult.insertId;

        // Budowanie dynamicznego zapytania
        let sql = `SELECT id FROM invoices`;
        const filters = [];
        const params = [];

        if (startDate) {
          filters.push("issued_at >= ?");
          params.push(startDate);
        }
        if (finishDate) {
          filters.push("issued_at <= ?");
          params.push(finishDate);
        }
        if (users && Array.isArray(users) && users.length > 0) {
          filters.push(`issued_by IN (${users.map(() => '?').join(',')})`);
          params.push(...users);
        }
        if (filters.length > 0) {
          sql += " WHERE " + filters.join(" AND ");
        }

        db.query(sql, params, (err, invoices) => {
          if (err) return res.status(500).json({ error: 'Błąd serwera', details: err });

          if (!invoices.length) return res.sendStatus(201); // raport bez faktur

          // przypisz faktury do raportu
          const values = invoices.map(inv => [reportId, inv.id]);
          db.query(
            "INSERT INTO report_invoices (report_id, invoice_id) VALUES ?",
            [values],
            (err) => {
              if (err) return res.status(500).json({ error: 'Błąd przypisywania faktur', details: err });
              res.sendStatus(201);
            }
          );
        });
      }
    );
  });
});

// get report invoices
router.get('/getReportInvoices/:reportId', authorizeRoles('manager'), (req, res) => {
  const { reportId } = req.params;
  const sql = `
    SELECT
      ri.invoice_id AS id,
      i.number,
      i.issued_by,
      i.issued_at,
      u.username
    FROM report_invoices ri
    JOIN invoices i ON ri.invoice_id = i.id
    JOIN users u ON i.issued_by = u.id
    WHERE ri.report_id = ?;
  `;
  db.query(sql, [reportId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.status(200).json({ results });
  });
});


module.exports = router;

