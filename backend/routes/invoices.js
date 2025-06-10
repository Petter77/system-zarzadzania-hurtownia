const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');



const upload = multer({ storage: multer.memoryStorage() });

//save pdf in database
router.post('/upload-pdf', upload.single('pdf'), (req, res) => {
  const fileBuffer = req.file?.buffer;

  if (!fileBuffer) {
    return res.status(400).json({ error: 'Nie przesłano pliku PDF.' });
  }

  const now = new Date();

  const query = `
    INSERT INTO invoices (issued_at, pdf)
    VALUES (?, ?)
  `;

  db.query(query, [now, fileBuffer], (err, result) => {
    if (err) {
      console.error("Błąd podczas zapisywania faktury z PDF:", err);
      return res.status(500).json({ error: 'Błąd serwera.' });
    }

    res.status(201).json({
      message: 'Faktura z PDF została utworzona.',
      invoiceId: result.insertId,
    });
  });
});


// get all invoices
router.get('/all', (req, res) => {
    const query = `
        SELECT 
            invoices.id,
            invoices.number, 
            invoices.issued_at,
            recipient_name
        FROM invoices 
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
                if (err.code === 'ER_DUP_ENTRY') {
                  return res.status(400).json({ error: 'Faktura o tym numerze już istnieje.' });
                }
                console.error('Błąd przy tworzeniu faktury:', err);
                return res.status(500).json({ error: 'Błąd przy tworzeniu faktury.' });
              }


            const invoiceId = invoiceResult.insertId;

            const insertItemsQuery = `
                  INSERT INTO invoice_items (invoice_id, instance_id, description, price)
                  VALUES ${products.map(() => '(?, ?, ?, ?)').join(', ')}
              `;

              const itemValues = products.flatMap(product => [
                  invoiceId,
                  product.instance_id,
                  product.description,
                  product.price,
              ]);
              console.log("Zapytanie:", insertItemsQuery);
              console.log("Wartości:", itemValues);
              db.query(insertItemsQuery, itemValues, (err) => {
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
  const query = `
    SELECT 
      item_instances.id AS instance_id,
      item_instances.serial_number,
      item_instances.status,
      item_instances.location,
      inventory_items.manufacturer,
      inventory_items.model,
      inventory_items.description
    FROM item_instances
    JOIN inventory_items ON item_instances.item_id = inventory_items.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Błąd podczas pobierania instancji przedmiotów:", err);
      return res.status(500).json({ error: 'Błąd serwera przy pobieraniu instancji przedmiotów.' });
    }
    res.json(results);
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
      WHERE invoices.id = ?
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

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Wybierz plik PDF.");
    return;
  }

  const formData = new FormData();
  formData.append("pdf", file); // "pdf" to nazwa pola, którą Twój backend powinien obsłużyć

  try {
    const response = await axios.post(
      "http://localhost:3000/invoices/upload-pdf",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    alert("Plik PDF został przesłany pomyślnie.");
    console.log("Odpowiedź:", response.data);
  } catch (error) {
    console.error("Błąd podczas wysyłania pliku PDF:", error);
    alert("Nie udało się przesłać pliku.");
  }
};
  
  

module.exports = router;