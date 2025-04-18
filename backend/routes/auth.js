const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkIfUserName = require('../middlewares/auth/checkIfUserName');

const SECRET_KEY = 'secret';

// login user with checkIfUserName middleware for check if username is busy or username exists in db
router.post('/login', checkIfUserName(false), async (req, res) =>{
    const hashedPassword = req.user.password;
    const {UserPassword} = req.body;
    
    if(!UserPassword) return res.status(400).json('Wypełnij wszystkie pola!');
    const isPasswordMatch = await bcrypt.compare(UserPassword, hashedPassword);
    if (!isPasswordMatch) return res.status(401).json('Błędny login lub hasło!');
    const UserID = req.user.id;
    const UserName = req.user.login
    const rola = req.user.rola;
    // zrobic obiekt w ktorym bedzie token, userid i username
    // ten obiekt zapisac w sesji na frontendzie, wtedy frontend bedzie mial username bez koniecznosci zapytania
    // na backendzie uwzglednic ze w tokenie jest obiekt a sam token to pole tego obiektu
    const token = jwt.sign({UserID}, SECRET_KEY, {expiresIn: "1h"});
    const user = {
      token,
      UserID,
      UserName,
      rola
    }
    res.status(200).json(user);
})

module.exports = router;
