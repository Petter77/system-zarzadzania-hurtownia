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

module.exports = router;

