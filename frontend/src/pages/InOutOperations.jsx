import { useEffect, useState } from 'react';
import axios from 'axios';
import Borrow from "../components/Borrow";
import Return from "../components/Return";
import ToService from "../components/ToService";
import FromService from "../components/FromService";
import { FaTools, FaUndo, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const tileData = [
  {
    key: 'IN',
    title: 'Wyślij do serwisu',
    subtitle: '',
    icon: <FaTools className="text-5xl mb-4 text-red-600" />,
    bg: "bg-white",
    border: "hover:bg-red-50",
  },
  {
    key: 'OUT',
    title: 'Zwrot z serwisu',
    subtitle: '',
    icon: <FaUndo className="text-5xl mb-4 text-green-600" />,
    bg: "bg-white",
    border: "hover:bg-green-50",
  },
  {
    key: 'BORROW',
    title: 'Wypożycz urządzenie',
    subtitle: '',
    icon: <FaArrowRight className="text-5xl mb-4 text-blue-600" />,
    bg: "bg-white",
    border: "hover:bg-blue-50",
  },
  {
    key: 'RETURN',
    title: 'Zwrot z wypożyczenia',
    subtitle: '',
    icon: <FaArrowLeft className="text-5xl mb-4 text-yellow-600" />,
    bg: "bg-white",
    border: "hover:bg-yellow-50",
  },
];

const Transactions = () => {
  const [action, setAction] = useState('');
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [damagedItems, setDamagedItems] = useState([]);

  const handleTileClick = (key) => {
    setAction('');
    if (key === 'IN') setAction('IN');
    else if (key === 'OUT') setAction('OUT');
    else if (key === 'BORROW') setIsBorrowFormOpen(true);
    else if (key === 'RETURN') setIsReturnFormOpen(true);
  };

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
    <div className="flex flex-col items-center bg-gray-100 p-0 pt-10">
      <h1 className="text-3xl font-bold mb-8 mt-4">System przyjęć/wydań</h1>
      <div className="flex justify-center w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tileData.map(tile => (
            <div
              key={tile.key}
              className={`cursor-pointer rounded-xl shadow-lg p-10 flex flex-col items-center justify-center transition w-72 h-48 ${tile.bg} ${tile.border}`}
              onClick={() => handleTileClick(tile.key)}
            >
              {tile.icon}
              <span className="text-xl font-semibold">{tile.title}</span>
            </div>
          ))}
        </div>
      </div>
      {isBorrowFormOpen && (
        <Borrow
          setIsBorrowFormOpen={setIsBorrowFormOpen}
          availableItems={availableItems}
          handleBorrowInvoiceSuccess={(data) => {
            refreshData();
          }}
        />
      )}
      {isReturnFormOpen && (
        <Return
          setIsReturnFormOpen={setIsReturnFormOpen}
          borrowedItems={borrowedItems}
          handleReturnInvoiceSuccess={(data) => {
            refreshData();
          }}
        />
      )}
      {action === 'IN' && (
        <ToService
          setAction={setAction}
          availableItems={availableItems}
          handleToServiceSuccess={(data) => {
            refreshData();
          }}
        />
      )}
      {action === 'OUT' && (
        <FromService
          setAction={setAction}
          itemsInService={damagedItems}
          handleFromServiceSuccess={(data) => {
            refreshData();
          }}
        />
      )}
    </div>
  );
};

export default Transactions;