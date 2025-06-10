const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const checkIfUserName = require('../middlewares/auth/checkIfUserName');
const authorizeRoles = require('../middlewares/auth/authorizeRoles');

const sanitizeUserData = (userData) => {
    if (!userData) return null;
    const sanitized = { ...userData };
    delete sanitized.password_hash;
    return sanitized;
};

const logUserOperation = (req, operationType, targetUserId, previousData, newData) => {
    if (!req.user || !req.user.user || !req.user.user.userId) {
        console.error('Error: User information not available in request');
        return;
    }

    const performedByUserId = req.user.user.userId;
    console.log('Debug - Logging operation with performedByUserId:', performedByUserId);

    const sql = `
        INSERT INTO audit_logs 
        (user_id, operation_type, data_id, data_type, previous_data, new_data)
        VALUES (?, ?, ?, 'USER', ?, ?)
    `;
    
    db.query(sql, [
        performedByUserId,
        operationType,
        targetUserId,
        previousData ? JSON.stringify(sanitizeUserData(previousData)) : null,
        newData ? JSON.stringify(sanitizeUserData(newData)) : null
    ], (err) => {
        if (err) console.error('Error logging user operation:', err);
    });
};

router.get('/all', authorizeRoles('manager'), (req, res) =>{
    db.query('SELECT * FROM users', (err, results) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({results})
    })
})

router.get('/all/:id', authorizeRoles('manager'), (req, res) =>{
    const {id} = req.params
    db.query('SELECT * FROM users WHERE id=?', [id], (err, result) =>{
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        res.status(200).json({result})
    })
})

router.get('/logged', (req, res) =>{
    res.status(200).json(req.user.user);
})

router.post('/create', authorizeRoles('manager'), checkIfUserName(true), async (req, res) => {
    const { username, password, role} = req.body
  
    if (!username || !password ||!role) return res.status(400).json({ error: 'Wypełnij wszystkie pola!' });
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      db.query('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)', 
        [username, hashedPassword, role], 
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Błąd serwera' });
          
          const newUserData = {
            id: result.insertId,
            username,
            role
          };
          logUserOperation(req, 'CREATE', result.insertId, null, newUserData);
          
          return res.status(201).json({ message: `Użytkownik został utworzony pomyślnie!` });
      });
    } catch (error) {
      return res.status(500).json({ error: 'Błąd serwera' });
    }
});

router.delete('/delete/:id', authorizeRoles('manager'), (req, res) =>{
    const targetUserId = req.params.id;
    
    db.query('SELECT * FROM users WHERE id=?', [targetUserId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }

        const userData = results[0];
        
        db.query('DELETE FROM users WHERE id=?', [targetUserId], (err) => {
            if (err) return res.status(500).json({ error: 'Błąd serwera' });
            
            logUserOperation(req, 'DELETE', targetUserId, userData, null);
            
            return res.status(200).json({message: 'Użytkownik został usunięty pomyślnie!' });
        });
    });
});

router.put('/update/:id', authorizeRoles('manager'), async (req, res) => {
    const targetUserId = req.params.id;
    const { username, password, role } = req.body;

    db.query('SELECT * FROM users WHERE id=?', [targetUserId], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera' });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }

        const previousData = results[0];
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

        values.push(targetUserId);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

        db.query(sql, values, (err, result) => {
            if (err) return res.status(500).json({ error: 'Błąd serwera' });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Dane nie zostały zaaktualizowane!.' });
            }
            db.query('SELECT * FROM users WHERE id=?', [targetUserId], (err, results) => {
                if (err) return res.status(500).json({ error: 'Błąd serwera' });
                
                logUserOperation(req, 'UPDATE', targetUserId, previousData, results[0]);
                
                return res.status(200).json({ message: 'Dane użytkownika zostały zaktualizowane pomyślnie!' });
            });
        });
    });
});

module.exports = router;

