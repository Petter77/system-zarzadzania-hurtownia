import { useEffect, useState } from "react";
import axios from "axios";

const EditUserForm = ({ userId, setIsEditFormOpen }) => {
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState(null);

  const userToken = sessionStorage.getItem("user");

  useEffect(() => {
    const getUserById = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/users/all/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        const user = res.data.result[0];

        setFormData({
          username: user.username,
          password: user.password_hash,
          role: user.role,
        });
      } catch (err) {
        console.error(err);
        setMessage("Błąd podczas pobierania danych użytkownika.");
      }
    };

    getUserById();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:3000/users/update/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsEditFormOpen(false);
    } catch (err) {
      console.error(err);
      setMessage("Błąd podczas aktualizacji użytkownika.");
    }
  };

  if (!formData) return <p>Ładowanie danych użytkownika...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <button
        type="button"
        onClick={() => setIsEditFormOpen(false)}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
      >
        Zamknij
      </button>
      <h3 className="text-2xl font-semibold mb-4">Edytuj użytkownika</h3>
      {message && <p className="text-red-500 text-center font-semibold mb-4">{message}</p>}

      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 mb-2">Login:</label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-2">Hasło:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="role" className="block text-gray-700 mb-2">Rola:</label>
        <select
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="auditor">Auditor</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
      >
        Zapisz
      </button>
    </form>
  );
};

export default EditUserForm;
