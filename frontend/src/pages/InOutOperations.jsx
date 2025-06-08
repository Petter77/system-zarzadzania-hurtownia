import { useEffect, useState } from 'react';
import axios from 'axios';
import Borrow from "../components/Borrow";
import Return from "../components/Return";
import ToService from "../components/ToService";
import FromService from "../components/FromService";

const Transactions = () => {
  const [action, setAction] = useState('');
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [damagedItems, setDamagedItems] = useState([]); 

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
    axios.get('http://localhost:3000/inout_operations/borrowed') 
      .then((response) => {
        console.log("Wypożyczone przedmioty:", response.data);
        setBorrowedItems(response.data);
      })
      .catch((error) => {
        console.error('Błąd przy pobieraniu wypożyczonych przedmiotów:', error);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/inout_operations/damaged') 
      .then((response) => {
        console.log("Przedmioty w naprawie:", response.data);
        setDamagedItems(response.data); 
      })
      .catch((error) => {
        console.error('Błąd przy pobieraniu przedmiotów w naprawie:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Status urządzeń</h1>

      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => handleClick('IN')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <span className="text-xl font-semibold">Dodaj do serwisu</span>
          <span className="text-sm opacity-80">Naprawa</span>
        </button>

        <button
          onClick={() => handleClick('OUT')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <span className="text-xl font-semibold">Zwrot z serwisu</span>
          <span className="text-sm opacity-80">Naprawione</span>
        </button>

        <button
          onClick={() => setIsBorrowFormOpen(true)}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <span className="text-xl font-semibold">Wypożycz użądzenie</span>
          <span className="text-sm opacity-80"></span>
        </button>

        <button
          onClick={() => handleClick('Return')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <span className="text-xl font-semibold">Zwrot z wypozyczenia</span>
          <span className="text-sm opacity-80"></span>
        </button>
      </div>

      {/*action && <p className="mt-6 text-lg">You selected: <strong>{action}</strong></p>*/}

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

      {/* To Service */}
      {action === 'IN' && (
        <ToService
          setAction={setAction}
          availableItems={availableItems}
          handleToServiceSuccess={(data) => console.log("ToService success:", data)}
        />
      )}

      {/* Return from Service - opcjonalnie, jeśli masz odpowiedni komponent */}
       
      {action === 'OUT' && (
        <FromService
          setAction={setAction}
          itemsInService={damagedItems}
          handleFromServiceSuccess={(data) => console.log("FromService success:", data)}
        />
      )} 
      

    </div>
  );
};

export default Transactions;
