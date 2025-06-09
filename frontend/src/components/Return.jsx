import { useState } from 'react';
import axios from 'axios';

const Return = ({ setIsReturnFormOpen, handleReturnInvoiceSuccess, borrowedItems }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? undefined : { quantity: 1 },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const itemIds = Object.keys(selectedItems).filter((id) => selectedItems[id]);

    if (itemIds.length === 0) {
      setError('Musisz wybrać przynajmniej jeden przedmiot do zwrotu.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/inout_operations/return', {
        item_ids: itemIds,
      });

      console.log('Zwrot udany:', response.data);
      handleReturnInvoiceSuccess(response.data);
      setIsReturnFormOpen(false); // zamyka okno
    } catch (err) {
      console.error('Błąd przy zwrocie:', err);
      setError('Wystąpił błąd podczas przetwarzania zwrotu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex justify-center items-center z-50 p-8">
  <div className="bg-white border border-gray-300 shadow-lg p-10 rounded-md w-[960px] relative flex flex-col max-h-[90vh]">
    <button
      onClick={() => setIsReturnFormOpen(false)}
      className="absolute top-6 right-6 text-red-600 font-bold hover:text-red-800"
    >
      Zamknij
    </button>

    <h2 className="text-3xl font-bold text-blue-700 mb-6">Zwróć wypożyczone urządzenia</h2>

    {error && (
      <div className="text-red-600 font-semibold mb-4">{error}</div>
    )}

    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="overflow-auto flex-1 border border-gray-200 rounded-md">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Zaznacz</th>
              <th className="px-4 py-2">Producent</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Numer Seryjny</th>
              <th className="px-4 py-2">Opis</th>
            </tr>
          </thead>
          <tbody>
            {borrowedItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  Brak dostępnych urządzeń do zwrotu.
                </td>
              </tr>
            ) : (
              borrowedItems.map((item) => (
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

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 text-white font-semibold rounded-md shadow transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Przetwarzanie...' : 'Zatwierdź Zwrot'}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default Return;
