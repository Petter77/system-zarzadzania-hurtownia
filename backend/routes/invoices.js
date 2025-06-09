const express = require('express');
const router = express.Router();
const db = require('../db');


// get all invoices
router.get('/all', (req, res) => {
    const query = `
        SELECT 
            invoices.id,
            invoices.number, 
            invoices.issued_at,
            users.username
        FROM invoices 
        JOIN users ON users.id = invoices.issued_by
        ORDER BY invoices.number;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        // Nie trzeba grupować, jeśli każdy rekord to jedna faktura
        res.status(200).json(results);
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


// get invoices details
router.get('/:number', (req, res) => {
    const number = decodeURIComponent(req.params.number);
  
    const query = `
      SELECT 
        invoices.number, 
        invoices.issued_at, 
        invoices.recipient_name,
        invoices.recipient_address,
        invoices.recipient_nip,
        invoice_items.description,
        invoice_items.price
      FROM invoices 
      LEFT JOIN invoice_items ON invoices.id = invoice_items.invoice_id
      WHERE invoices.number = ?
    `;
  
    db.query(query, [number], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Błąd serwera' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Faktura nie znaleziona' });
      }
  
      const invoice = {
        number: results[0].number,
        issued_at: results[0].issued_at,
        recipient_name: results[0].recipient_name,
        recipient_address: results[0].recipient_address,
        recipient_nip: results[0].recipient_nip,
        products: results.map(row => ({
          description: row.description,
          price: row.price
        }))
      };
  
      res.status(200).json(invoice);
    });
  });
  
  

module.exports = router;