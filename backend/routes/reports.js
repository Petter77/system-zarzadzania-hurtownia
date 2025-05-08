const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');

// get all reports
router.get('/getReports', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM `reports` WHERE 1', (err, results) =>{
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
  console.log({ localizations, models, producers, statuses });

  if (!reportName) return res.sendStatus(400);

  // tworzenie raportu
  db.query(
    "INSERT INTO `reports` (`title`, `created_by`, `created_at`) VALUES (?, ?, current_timestamp())",
    [reportName, userId],
    (err, reportResult) => {
      if (err) return res.sendStatus(500);

      const reportId = reportResult.insertId;

      //budowanie dynamicznego zapytania
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

      //pobierz urządzenia spełniające filtry
      db.query(sql, params, (err, items) => {
        console.log(items);
        if (err) return res.status(500).json({ error: 'Błąd serwera', details: err });

        if (!items.length) return res.sendStatus(201); // raport bez urządzeń

        //przypisz urządzenia do raportu
        const values = items.map(item => [reportId, item.id, reportName]);
        console.log('values: ',values);
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

module.exports = router;

