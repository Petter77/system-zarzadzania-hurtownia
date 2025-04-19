const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const checkIfUserName = require('../middlewares/auth/checkIfUserName');

// get all users
router.get('/all', (req, res) =>{
    db.query('SELECT * FROM users', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

// get user by user id in db
router.get('/all/:id', (req, res) =>{
    const {id} = req.params
    db.query('SELECT * FROM users WHERE id=?', [id], (err, result) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({result})
    })
})

// get all data about actual logged in user
router.get('/logged', (req, res) =>{
    res.status(200).json(req.user.user);
})

//create new user
router.post('/create', checkIfUserName(true), async (req, res) => {
    const { username, password, role} = req.body
  
    if (!username || !password ||!role) return res.status(400).json({ error: 'Wypełnij wszystkie pola!' });
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      db.query('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)', [username, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        return res.status(201).json({ message: `Użytkownik został utworzony pomyślnie!` });
      });
    } catch (error) {
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  });

// delete user by id
router.delete('/delete/:id', (req, res) =>{
    const {id} = req.params
    db.query('DELETE FROM users WHERE id=?', [id], (err) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        return res.status(200).json({message: 'Użytkownik został usunięty pomyślnie!' })
    })
})

// update user by id
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;

    const fields = [];
    const values = [];

    if (username) {
        fields.push('username = ?');
        values.push(username);
    }

    if (password) {
        fields.push('password_hash = ?');
        const hashedPassword = await bcrypt.hash(password, 10)
        values.push(hashedPassword);
    }

    if (role) {
        fields.push('role = ?');
        values.push(role);
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dane nie zostały zaaktualizowane!.' });
        }

        return res.status(200).json({ message: 'Dane użytkownika zostały zaktualizowane pomyślnie!' });
    });
});

module.exports = router;
