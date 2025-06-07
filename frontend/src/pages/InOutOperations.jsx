import { useEffect, useState } from 'react';
import axios from 'axios';
import Borrow from "../components/Borrow";
import Return from "../components/Return";

const Transactions = () => {
  const [action, setAction] = useState('');
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]); // <-- nowy state

  const handleClick = (type) => {
    setAction(type);
    console.log(`Action selected: ${type}`);

    if (type === 'Return') {
      setIsReturnFormOpen(true);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3000/inout_operations/available')
      .then((response) => {
        console.log("Dostępne przedmioty:", response.data);
        setAvailableItems(response.data);
      })
      .catch((error) => {
        console.error('Błąd przy pobieraniu dostępnych przedmiotów:', error);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/inout_operations/borrowed') // <-- nowe zapytanie
      .then((response) => {
        console.log("Wypożyczone przedmioty:", response.data);
        setBorrowedItems(response.data);
      })
      .catch((error) => {
        console.error('Błąd przy pobieraniu wypożyczonych przedmiotów:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleClick('IN')}
          className="px-6 py-3 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition"
        >
          IN
        </button>
        <button
          onClick={() => handleClick('OUT')}
          className="px-6 py-3 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition"
        >
          OUT
        </button>
        <button
          onClick={() => setIsBorrowFormOpen(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
        >
          Borrow
        </button>
        <button
          onClick={() => handleClick('Return')}
          className="px-6 py-3 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transition"
        >
          Return
        </button>
      </div>

      {action && <p className="mt-6 text-lg">You selected: <strong>{action}</strong></p>}

      {/* Borrow Modal */}
      {isBorrowFormOpen && (
        <Borrow
          setIsBorrowFormOpen={setIsBorrowFormOpen}
          handleBorrowInvoiceSuccess={(data) => console.log("Success:", data)}
          availableItems={availableItems}
        />
      )}

      {/* Return Modal */}
      {isReturnFormOpen && (
        <Return
          setIsReturnFormOpen={setIsReturnFormOpen}
          handleReturnInvoiceSuccess={(data) => console.log("Success:", data)}
          borrowedItems={borrowedItems}
        />
      )}
    </div>
  );
};

export default Transactions;
