import { useEffect, useState } from "react";
import axios from "axios";
import CreateUserForm from "../components/CreateUserForm";
import EditUserForm from "../components/EditUserForm";

const ManageUsers = ({ userToken }) => {
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isUserCreated, setIsUserCreated] = useState(false); // Stan do śledzenia stworzenia użytkownika

  const getAllusers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/all", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUsers(res.data.results);
    } catch (err) {
      console.log(err);
      setMessage("Błąd podczas pobierania użytkowników.");
    }
  };

  useEffect(() => {
    getAllusers();
  }, [users]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/users/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      getAllusers();
      setMessage("Użytkownik został usunięty pomyślnie");
    } catch (err) {
      console.log(err);
      setMessage("Błąd podczas usuwania użytkownika.");
    }
  };

  const handleEdit = (id) => {
    setUserId(id);
    setIsEditFormOpen(true);
  };

  const closeModal = () => {
    setIsCreateFormOpen(false);
    setIsEditFormOpen(false);
  };

  const handleCreateUserSuccess = () => {
    setIsCreateFormOpen(false);
    setIsUserCreated(true); // Ustalamy, że użytkownik został stworzony
    setMessage("Użytkownik został utworzony pomyślnie!");
    setTimeout(() => {
      setIsUserCreated(false); // Resetujemy komunikat po kilku sekundach
    }, 5000); // Komunikat znika po 5 sekundach
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Lista użytkowników</h2>
      <button
        onClick={() => setIsCreateFormOpen(true)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Utwórz nowego użytkownika
      </button>
      {message && (
        <p
          className={`mb-4 text-center font-semibold ${
            isUserCreated ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
      {!users ? (
        <p className="text-center text-gray-500">Brak użytkowników w systemie</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300 mb-6">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left text-gray-700">ID</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Login</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Rola</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 border-b">{user.id}</td>
                <td className="px-4 py-2 border-b">{user.username}</td>
                <td className="px-4 py-2 border-b">{user.role}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(isCreateFormOpen || isEditFormOpen) && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            {isCreateFormOpen ? (
              <CreateUserForm
                setIsCreateFormOpen={setIsCreateFormOpen}
                handleCreateUserSuccess={handleCreateUserSuccess}
              />
            ) : (
              <EditUserForm setIsEditFormOpen={setIsEditFormOpen} userId={userId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
