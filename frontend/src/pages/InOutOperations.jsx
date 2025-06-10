import { useEffect, useState } from 'react';
import axios from 'axios';
import Borrow from "../components/Borrow";
import Return from "../components/Return";
import ToService from "../components/ToService";
import FromService from "../components/FromService";
import TileButton from "../components/TileButton";
import { FaTools, FaUndo, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const Transactions = () => {
  const [action, setAction] = useState('');
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [damagedItems, setDamagedItems] = useState([]);

  const handleClick = (type) => {
    setAction(type);
    if (type === 'Return') {
      setIsReturnFormOpen(true);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3000/inout_operations/available')
      .then((response) => setAvailableItems(response.data))
      .catch((error) => console.error('Błąd przy pobieraniu dostępnych przedmiotów:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/inout_operations/borrowed')
      .then((response) => setBorrowedItems(response.data))
      .catch((error) => console.error('Błąd przy pobieraniu wypożyczonych przedmiotów:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/inout_operations/damaged')
      .then((response) => setDamagedItems(response.data))
      .catch((error) => console.error('Błąd przy pobieraniu przedmiotów w naprawie:', error));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100">
      <h1 className="text-5xl font-extrabold text-center mb-8 tracking-tight">Transactions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8 w-auto">
        <TileButton
          icon={<FaTools />}
          title="To Service"
          subtitle="Item Damage"
          iconColor="text-green-600"
          onClick={() => handleClick('IN')}
        />
        <TileButton
          icon={<FaUndo />}
          title="Return from Service"
          subtitle="Back from damaged"
          iconColor="text-red-500"
          onClick={() => handleClick('OUT')}
        />
        <TileButton
          icon={<FaArrowRight />}
          title="Borrow"
          subtitle="Get an item"
          iconColor="text-blue-500"
          onClick={() => setIsBorrowFormOpen(true)}
        />
        <TileButton
          icon={<FaArrowLeft />}
          title="Return"
          subtitle="Give back borrowed"
          iconColor="text-yellow-500"
          onClick={() => handleClick('Return')}
        />
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

      {/* To Service */}
      {action === 'IN' && (
        <ToService
          setAction={setAction}
          availableItems={availableItems}
          handleToServiceSuccess={(data) => console.log("ToService success:", data)}
        />
      )}

      {/* Return from Service */}
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