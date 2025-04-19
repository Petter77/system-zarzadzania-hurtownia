const jwt = require('jsonwebtoken');

const checkToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp!' });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Błąd autoryzacji!' });
    }
}

module.exports = checkToken;
