const express = require('express');
const router = express.Router();
const db = require('../db');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');

router.get('/', authorizeRoles('auditor'), (req, res) => {
    db.query('SELECT * FROM audit_logs WHERE data_type = "REPORT" ORDER BY timestamp DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({ results });
    });
});

module.exports = router; 