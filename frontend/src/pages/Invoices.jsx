import { useEffect, useState } from 'react';
import axios from 'axios';
import CreateInvoice from "../components/CreateInvoice";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const addInvoices = () => {
    //adding Invoices
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:3000/invoices/all'); // <-- popraw URL
        setInvoices(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania faktur:', error);
      } finally {
        setLoading(false);
      }
    };

    

    fetchInvoices();
  }, []);

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div>
      <h1>Faktury</h1><button onClick={() => setIsCreateFormOpen(true)}>Dodaj Fakture</button>
      <table>
        <thead>
          <tr>
            <th>Numer faktury</th>
            <th>Data wystawienia</th>
            <th>Opis</th>
            <th>Cena</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.number}</td>
              <td>{new Date(invoice.issued_at).toLocaleDateString()}</td>
              <td>{invoice.description}</td>
              <td>{invoice.price} zł</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
