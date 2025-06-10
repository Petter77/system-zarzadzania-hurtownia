const express = require('express');
const router = express.Router();
const db = require('../db');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');
const checkToken = require('../middlewares/auth/checkToken');

router.get('/', checkToken, authorizeRoles('auditor'), (req, res) => {
    db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({ results });
    });
});

module.exports = router; 
