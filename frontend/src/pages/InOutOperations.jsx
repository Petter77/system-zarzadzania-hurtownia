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

  // --- Funkcje pobierające dane ---
  const fetchAvailableItems = () => {
    return axios.get('http://localhost:3000/inout_operations/available')
      .then((res) => setAvailableItems(res.data))
      .catch((err) => console.error('Błąd przy pobieraniu dostępnych:', err));
  };

  const fetchBorrowedItems = () => {
    return axios.get('http://localhost:3000/inout_operations/borrowed')
      .then((res) => setBorrowedItems(res.data))
      .catch((err) => console.error('Błąd przy pobieraniu wypożyczonych:', err));
  };

  const fetchDamagedItems = () => {
    return axios.get('http://localhost:3000/inout_operations/damaged')
      .then((res) => setDamagedItems(res.data))
      .catch((err) => console.error('Błąd przy pobieraniu uszkodzonych:', err));
  };

  // --- Odśwież wszystkie dane jednocześnie ---
  const refreshData = async () => {
    await Promise.all([
      fetchAvailableItems(),
      fetchBorrowedItems(),
      fetchDamagedItems(),
    ]);
  };

  useEffect(() => {
    refreshData();
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
          <span className="text-xl font-semibold">Wypożycz urządzenie</span>
        </button>

        <button
          onClick={() => handleClick('Return')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <span className="text-xl font-semibold">Zwrot z wypożyczenia</span>
        </button>
      </div>

      {/* --- Modale --- */}

      {isBorrowFormOpen && (
        <Borrow
          setIsBorrowFormOpen={setIsBorrowFormOpen}
          availableItems={availableItems}
          handleBorrowInvoiceSuccess={(data) => {
            console.log("Borrow success:", data);
            refreshData();
          }}
        />
      )}

      {isReturnFormOpen && (
        <Return
          setIsReturnFormOpen={setIsReturnFormOpen}
          borrowedItems={borrowedItems}
          handleReturnInvoiceSuccess={(data) => {
            console.log("Return success:", data);
            refreshData();
          }}
        />
      )}

      {action === 'IN' && (
        <ToService
          setAction={setAction}
          availableItems={availableItems}
          handleToServiceSuccess={(data) => {
            console.log("ToService success:", data);
            refreshData();
          }}
        />
      )}

      {action === 'OUT' && (
        <FromService
          setAction={setAction}
          itemsInService={damagedItems}
          handleFromServiceSuccess={(data) => {
            console.log("FromService success:", data);
            refreshData();
          }}
        />
      )}
    </div>
  );
};

export default Transactions;
