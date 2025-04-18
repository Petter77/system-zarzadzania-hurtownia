const db = require('../../db');

// Middleware for  checks if a username exists in the database
// Takes a boolean parameter `isLogin` to determine the context: 
// - true for registration
// - false for login
const checkIfUserName = (isLogin) => (req, res, next) =>{
    const {username} = req.body;
    if(!username) return res.status(400).json('Wypełnij wszystkie pola!');
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) =>{
        if (err) return res.status(500).json('Błąd serwera!'); 
        if(isLogin){
            if (result.length != 0) return res.status(409).json('Ten użytkownik już istnieje!');
        }else{
            if (!result.length) return res.status(401).json('Błędny login lub hasło!');
            req.user = result[0];
        }
        next();
    })
}

module.exports = checkIfUserName;