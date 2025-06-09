import { useState } from 'react';
import axios from 'axios';

const FromService = ({ setAction, itemsInService, handleFromServiceSuccess }) => {
  const [selectedItems, setSelectedItems] = useState({});

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? undefined : { quantity: 1 }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedIds = Object.entries(selectedItems)
      .filter(([_, val]) => val !== undefined)
      .map(([itemId]) => parseInt(itemId));

    if (selectedIds.length === 0) {
      alert('Wybierz przynajmniej jedno urządzenie.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/inout_operations/fromService',
        { item_ids: selectedIds }
      );

      console.log('Urządzenia przywrócone z naprawy:', response.data);
      alert('Urządzenia zostały przywrócone z naprawy.');
      handleFromServiceSuccess?.(response.data);
      setAction('');
    } catch (error) {
      console.error('Błąd przy przywracaniu z naprawy:', error);
      alert('Wystąpił błąd przy aktualizacji.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex justify-center items-center z-50 p-8">
      <div className="bg-white border border-gray-300 shadow-lg p-10 rounded-md w-[960px] relative flex flex-col max-h-[90vh] overflow-auto">
        <button
          onClick={() => setAction('')}
          className="absolute top-6 right-6 text-red-600 font-bold hover:text-red-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-green-700 mb-8">Przywróć urządzenia z naprawy</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <table className="w-full text-sm text-left border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-center">Zaznacz</th>
                <th className="px-4 py-2">Producent</th>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2">Opis</th>
              </tr>
            </thead>
            <tbody>
              {itemsInService.map((item) => (
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
                  <td className="px-4 py-2">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition"
            >
              Zatwierdź przywrócenie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FromService;
