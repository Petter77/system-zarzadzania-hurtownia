import { useState } from 'react';
import axios from 'axios';

const Borrow = ({ setIsBorrowFormOpen, availableItems }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [serviceAddress, setServiceAddress] = useState('');

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? undefined : { quantity: 1 }
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Pobieramy tylko id wybranych instancji
  const selectedIds = Object.entries(selectedItems)
    .filter(([_, val]) => val !== undefined)
    .map(([itemId]) => parseInt(itemId));

  //console.log('Wysyłane id:', selectedIds);

  try {
    console.log('Wysyłane ID (typeof):', selectedIds.map(id => [id, typeof id]));


    const response = await axios.post(
      'http://localhost:3000/inout_operations/borrow',
      { item_ids: selectedIds,
        service_address: serviceAddress
      }  
    );

    console.log('Wypożyczenia zapisane:', response.data);
    alert('Wypożyczenie zapisane pomyślnie!');
    setIsBorrowFormOpen(false);
  } catch (error) {
    console.error('Błąd przy wypożyczaniu:', error);
    alert('Błąd przy wypożyczaniu urządzeń.');
  }
};

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex justify-center items-center z-50 p-8">
      <div className="bg-white border border-gray-300 shadow-lg p-10 rounded-md w-[960px] relative flex flex-col max-h-[90vh] overflow-auto">
        <button
          onClick={() => setIsBorrowFormOpen(false)}
          className="absolute top-6 right-6 text-red-600 font-bold hover:text-red-800 text-lg"
        >
          Zamknij
        </button>
    <h2 className="text-3xl font-bold text-blue-700 mb-8">Wypożycz dostępne urządzenia</h2>

    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      {/* Kontener tabeli z przewijaniem */}
      <div className="overflow-auto flex-1 border border-gray-200 rounded-md">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-center">Zaznacz</th>
              <th className="px-4 py-2">Producent</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Numer Seryjny</th>
              <th className="px-4 py-2">Opis</th>
            </tr>
          </thead>
          <tbody>
            {availableItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  Brak dostępnych urządzeń do wyporzyczenia.
                </td>
              </tr>
            ) : (
              availableItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!selectedItems[item.id]}
                      onChange={() => handleCheckboxChange(item.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{item.manufacturer}</td>
                  <td className="px-4 py-2">{item.model}</td>
                  <td className="px-4 py-2">{item.serial_number}</td>
                  <td className="px-4 py-2">{item.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
            <div className="mt-6">
        <label htmlFor="service-address" className="block text-sm font-medium text-gray-700 mb-2">
          Adres serwisu
        </label>
        <input
          type="text"
          id="service-address"
          value={serviceAddress}
          onChange={(e) => setServiceAddress(e.target.value)}
          placeholder="Wpisz adres serwisu, np. SerwisTech, ul. Przykładowa 123, Warszawa"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      {/* Przycisk zatwierdzenia */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition"
        >
          Zatwierdź wypożyczenie
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default Borrow;
