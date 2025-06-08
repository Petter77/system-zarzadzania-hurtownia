const express = require('express');
const router = express.Router();

// Przykładowa trasa (możesz dodać własne)
router.get('/', (req, res) => {
  res.json({ message: 'Invoices endpoint (placeholder)' });
});

module.exports = router;