const express = require('express');
const router = express.Router();
const db = require('../db');


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


// create invoice
router.post('/create', (req, res) => {
    console.log("Odebrano dane z frontendu:", req.body); // <-- DODANE LOGOWANIE

    const {
        number,
        issued_at,
        recipient_name,
        recipient_address,
        recipient_nip,
        products
    } = req.body;

    if (
        !number ||
        !issued_at ||
        !recipient_name ||
        !recipient_address ||
        !products ||
        !Array.isArray(products) ||
        products.length === 0
    ) {
        return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    }

    const insertInvoiceQuery = `
        INSERT INTO invoices (number, issued_at, recipient_name, recipient_address, recipient_nip)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        insertInvoiceQuery,
        [number, issued_at, recipient_name, recipient_address, recipient_nip],
        (err, invoiceResult) => {
            if (err) {
                console.error('Błąd przy tworzeniu faktury:', err);
                return res.status(500).json({ error: 'Błąd przy tworzeniu faktury.' });
            }

            const invoiceId = invoiceResult.insertId;

            const insertItemsQuery = `
                INSERT INTO invoice_items (invoice_id, description, price)
                VALUES ?
            `;

            const itemValues = products.map(product => [
                invoiceId,
                product.description,
                product.price,
            ]);

            db.query(insertItemsQuery, [itemValues], (err) => {
                if (err) {
                    console.error('Błąd przy dodawaniu pozycji faktury:', err);
                    return res.status(500).json({ error: 'Błąd przy dodawaniu pozycji faktury.' });
                }

                res.status(201).json({ message: 'Faktura została utworzona pomyślnie.' });
            });
        }
    );
});



// GET /api/inventory-items
router.get('/inventory-items', (req, res) => {
    db.query("SELECT id, manufacturer, model, description FROM inventory_items", (err, items) => {
      if (err) {
        console.error("Błąd podczas pobierania przedmiotów:", err);
        return res.status(500).json({ error: 'Błąd serwera przy pobieraniu przedmiotów.' });
      }
      res.json(items);
    });
  });
  

module.exports = router;