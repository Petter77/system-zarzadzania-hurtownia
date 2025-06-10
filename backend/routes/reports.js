const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');

const logReportOperation = (userId, operationType, reportId, reportData) => {
  const sql = `
    INSERT INTO audit_logs 
    (user_id, operation_type, data_id, data_type, previous_data, new_data)
    VALUES (?, ?, ?, 'REPORT', ?, ?)
  `;

  const values = [
    userId,
    operationType,
    reportId,
    null,
    JSON.stringify(reportData)
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Błąd podczas logowania operacji raportu:', err);
    }
  });
};

router.get('/getAllUsers', authorizeRoles('manager'), (req, res) => {
    db.query('SELECT id, username FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({ results });
    });
});

router.get('/getReportsInventory', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM `reports` WHERE type = 0', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

router.get('/getReportsInvoices', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM `reports` WHERE type = 1', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

router.get('/getReportsInOut', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM `reports` WHERE type = 2', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

router.get('/userDetails/:id', authorizeRoles('manager'), (req, res) =>{
  const {id} = req.params
  db.query('SELECT * FROM users WHERE id=?', [id], (err, result) =>{
      if (err) return res.status(500).json({ error: 'Błąd serwera' });
      res.status(200).json({ user: result[0] });
  })
})


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

router.post('/createReport', authorizeRoles('manager'), (req, res) => {
  const userId = req.user?.user?.userId;
  const { reportName, localizations, models, producers, statuses } = req.body;

  if (!reportName) return res.sendStatus(400);

  db.query("SELECT * FROM `reports` WHERE `title` = ?", [reportName], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (result.length > 0) {
      return res.status(409).json({ error: 'Raport o takiej nazwie już istnieje!' });
    }

    db.query(
      "INSERT INTO `reports` (`title`, `created_by`, `created_at`, `type`) VALUES (?, ?, current_timestamp(), 0)",
      [reportName, userId],
      (err, reportResult) => {
        if (err) return res.sendStatus(500);

        const reportId = reportResult.insertId;

        logReportOperation(userId, 'CREATE', reportId, {
          title: reportName,
          type: 0,
          filters: {
            localizations,
            models,
            producers,
            statuses
          }
        });

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

        db.query(sql, params, (err, items) => {
          if (err) return res.status(500).json({ error: 'Błąd serwera', details: err });

          if (!items.length) return res.sendStatus(201);

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

router.get('/getReportItems/:reportId', authorizeRoles('manager'), (req, res) => {
  const { reportId } = req.params;
  const userId = req.user?.user?.userId;

  logReportOperation(userId, 'VIEW', reportId, { reportId });

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

router.post('/createReportInvoices', authorizeRoles('manager'), (req, res) => {
  const userId = req.user?.user?.userId;
  const { reportName, startDate, finishDate, users} = req.body;

  if (!reportName) return res.sendStatus(400);

  db.query("SELECT * FROM `reports` WHERE `title` = ?", [reportName], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (result.length > 0) {
      return res.status(409).json({ error: 'Raport o takiej nazwie już istnieje!' });
    }

    db.query(
      "INSERT INTO `reports` (`title`, `created_by`, `created_at`, `type`) VALUES (?, ?, current_timestamp(), 1)",
      [reportName, userId],
      (err, reportResult) => {
        if (err) return res.sendStatus(500);

        const reportId = reportResult.insertId;

        logReportOperation(userId, 'CREATE', reportId, {
          title: reportName,
          type: 1,
          filters: {
            startDate,
            finishDate,
            users
          }
        });

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

          if (!invoices.length) return res.sendStatus(201);

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

router.get('/getReportInvoices/:reportId', authorizeRoles('manager'), (req, res) => {
  const { reportId } = req.params;
  const userId = req.user?.user?.userId;

  logReportOperation(userId, 'VIEW', reportId, { reportId });

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

router.post('/createReportInOut', authorizeRoles('manager'), (req, res) => {
  const userId = req.user?.user?.userId;
  const { reportName, startDate, finishDate, performedBy, types} = req.body;

  if (!reportName) return res.sendStatus(400);

  db.query("SELECT * FROM `reports` WHERE `title` = ?", [reportName], (err, result) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    if (result.length > 0) {
      return res.status(409).json({ error: 'Raport o takiej nazwie już istnieje!' });
    }

    db.query(
      "INSERT INTO `reports` (`title`, `created_by`, `created_at`, `type`) VALUES (?, ?, current_timestamp(), 2)",
      [reportName, userId],
      (err, reportResult) => {
        if (err) return res.sendStatus(500);

        const reportId = reportResult.insertId;

        logReportOperation(userId, 'CREATE', reportId, {
          title: reportName,
          type: 2,
          filters: {
            startDate,
            finishDate,
            performedBy,
            types
          }
        });

        let sql = `SELECT id FROM in_out_operations`;
        const filters = [];
        const params = [];

        if (startDate) {
          filters.push("timestamp >= ?");
          params.push(startDate);
        }
        if (finishDate) {
          filters.push("timestamp <= ?");
          params.push(finishDate);
        }
        if (performedBy && Array.isArray(performedBy) && performedBy.length > 0) {
          filters.push(`performed_by IN (${performedBy.map(() => '?').join(',')})`);
          params.push(...performedBy);
        }
        if (types && Array.isArray(types) && types.length > 0) {
          filters.push(`type IN (${types.map(() => '?').join(',')})`);
          params.push(...types);
        }
        if (filters.length > 0) {
          sql += " WHERE " + filters.join(" AND ");
        }

        db.query(sql, params, (err, inoutops) => {
          if (err) return res.status(500).json({ error: 'Błąd serwera', details: err });

          if (!inoutops.length) return res.sendStatus(201);

          const values = inoutops.map(inv => [reportId, inv.id]);
          db.query(
            "INSERT INTO report_inout (report_id, inout_id) VALUES ?",
            [values],
            (err) => {
              if (err) return res.status(500).json({ error: 'Błąd przypisywania operacji', details: err });
              res.sendStatus(201);
            }
          );
        });
      }
    );
  });
});

router.get('/getReportInOut/:reportId', authorizeRoles('manager'), (req, res) => {
  const { reportId } = req.params;
  const userId = req.user?.user?.userId;

  logReportOperation(userId, 'VIEW', reportId, { reportId });

  const sql = `
    SELECT
      ri.inout_id AS id,
      ops.type,
      u.username,
      ins.serial_number, 
      ops.service_destination AS destination,
      ops.timestamp
    FROM report_inout ri
    JOIN in_out_operations ops ON ri.inout_id = ops.id
    JOIN users u ON ops.performed_by = u.id
    JOIN item_instances ins ON ops.instance_id = ins.id
    WHERE ri.report_id = ?
    ORDER BY ops.timestamp;
  `;
  db.query(sql, [reportId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.status(200).json({ results });
  });
});

router.post('/logReportDownload', authorizeRoles('manager'), (req, res) => {
  const userId = req.user?.user?.userId;
  const { reportId, reportType, fileName } = req.body;

  logReportOperation(userId, 'DOWNLOAD', reportId, {
    reportId,
    reportType,
    fileName
  });

  res.sendStatus(200);
});

module.exports = router;

