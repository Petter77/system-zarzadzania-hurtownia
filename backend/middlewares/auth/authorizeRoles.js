// middlewares/auth/authorizeRoles.js
module.exports = (...allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.user?.role;
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Brak dostępu – rola nieautoryzowana.' });
      }
  
      next();
    };
  };
  