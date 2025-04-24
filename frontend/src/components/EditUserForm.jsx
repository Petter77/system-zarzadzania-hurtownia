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
          },
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
  }, []);

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
        },
      );

      setIsEditFormOpen(false);
    } catch (err) {
      console.error(err);
      setMessage("Błąd podczas aktualizacji użytkownika.");
    }
  };
  if (!formData) return <p>Ładowanie danych użytkownika...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={() => setIsEditFormOpen(false)}>
        Zamknij
      </button>
      <h3>Edytuj użytkownika</h3>
      {message && <p style={{ color: "red" }}>{message}</p>}

      <div>
        <label>Login:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Hasło:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Rola:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="auditor">Auditor</option>
        </select>
      </div>

      <button type="submit">Zapisz</button>
    </form>
  );
};

export default EditUserForm;
