const express = require('express');
const router = express.Router();
const db = require('../db');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');
router.get('/', (req, res) =>{
    db.query('SELECT * FROM audit_in_out_operations', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

module.exports = router;