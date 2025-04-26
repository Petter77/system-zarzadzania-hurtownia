const express = require('express');
const router = express.Router();
const db = require('../db');

// // get all invoices with their items
// router.get('/all', (req, res) => {
//     const query = `
//         SELECT 
//             invoices.number, 
//             invoices.issued_at, 
//             invoice_items.description, 
//             invoice_items.price 
//         FROM invoices 
//         INNER JOIN invoice_items ON invoices.id = invoice_items.invoice_id;
//     `;

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Błąd serwera' });
//         }
//         const formattedResults = results.map(row => ({
//             number: row.number,
//             issued_at: row.issued_at,
//             description: row.description,
//             price: row.price
//         }));

//         res.status(200).json(formattedResults);
//     });
// });

// get all invoices with their grouped items
router.get('/all', (req, res) => {
    const query = `
        SELECT 
            invoices.id,
            invoices.number, 
            invoices.issued_at, 
            invoice_items.description, 
            invoice_items.price 
        FROM invoices 
        INNER JOIN invoice_items ON invoices.id = invoice_items.invoice_id
        ORDER BY invoices.number;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        const groupedInvoices = {};

        results.forEach(row => {
            if (!groupedInvoices[row.number]) {
                groupedInvoices[row.number] = {
                    number: row.number,
                    issued_at: row.issued_at,
                    descriptions: [],
                    totalPrice: 0
                };
            }
            groupedInvoices[row.number].descriptions.push(row.description);
            groupedInvoices[row.number].totalPrice += Number(row.price); // <-- ważne!
        });

        res.status(200).json(Object.values(groupedInvoices));
    });
});


//create invoice
router.post('/create', (req, res) => {
    const { number, issued_at, description, price } = req.body;

    if (!number || !issued_at || !description || !price) {
        return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    }

    const insertInvoiceQuery = `INSERT INTO invoices (number, issued_at) VALUES (?, ?)`;
    
    db.query(insertInvoiceQuery, [number, issued_at], (err, invoiceResult) => {
        if (err) {
            console.error('Błąd przy tworzeniu faktury:', err);
            return res.status(500).json({ error: 'Błąd przy tworzeniu faktury.' });
        }

        const invoiceId = invoiceResult.insertId; // ID nowo stworzonej faktury

        const insertItemQuery = `INSERT INTO invoice_items (invoice_id, description, price) VALUES (?, ?, ?)`;
        
        db.query(insertItemQuery, [invoiceId, description, price], (err, itemResult) => {
            if (err) {
                console.error('Błąd przy dodawaniu pozycji faktury:', err);
                return res.status(500).json({ error: 'Błąd przy dodawaniu pozycji faktury.' });
            }

            res.status(201).json({ message: 'Faktura została utworzona pomyślnie.' });
        });
    });
});

module.exports = router;