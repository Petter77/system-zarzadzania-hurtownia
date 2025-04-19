const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkIfUserName = require('../middlewares/auth/checkIfUserName');

const SECRET_KEY = 'secret';

// login user with checkIfusername middleware for check if username is busy or username exists in db
router.post('/login', checkIfUserName(false), async (req, res) =>{
    const hashedPassword = req.user.password_hash;
    const {password} = req.body;
    
    if(!password) return res.status(400).json('Wypełnij wszystkie pola!');
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) return res.status(401).json('Błędny login lub hasło!');

    const userId = req.user.id;
    const username = req.user.username
    const role = req.user.role;

    const user = {
      userId,
      username,
      role
    }

    const token = jwt.sign({user}, SECRET_KEY, {expiresIn: "1h"});

    res.status(200).json(token);
})

module.exports = router;
