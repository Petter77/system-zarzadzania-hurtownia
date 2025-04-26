const express = require('express');
const router = express.Router();
const db = require('../db');

// get all invoices with their items
router.get('/all', (req, res) => {
    const query = `
        SELECT 
            invoices.number, 
            invoices.issued_at, 
            invoice_items.description, 
            invoice_items.price 
        FROM invoices 
        INNER JOIN invoice_items ON invoices.id = invoice_items.invoice_id;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }
        const formattedResults = results.map(row => ({
            number: row.number,
            issued_at: row.issued_at,
            description: row.description,
            price: row.price
        }));

        res.status(200).json(formattedResults);
    });
});

module.exports = router;