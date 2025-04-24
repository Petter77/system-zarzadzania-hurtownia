import { useState } from "react";
import axios from "axios";

const CreateUserForm = ({ setIsCreateFormOpen }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userToken = sessionStorage.getItem("user");

    if (!formData.username || !formData.password) {
      setMessage("Wszystkie pola są wymagane.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/users/create", formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      setMessage("Użytkownik został utworzony.");
      setFormData({ username: "", password: "", role: "user" });
    } catch (err) {
      console.error(err);
      setMessage("Błąd podczas tworzenia użytkownika.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button onClick={() => setIsCreateFormOpen(false)}>Zamknij</button>
      <h3>Stwórz nowego użytkownika</h3>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <div>
        <label>Nazwa użytkownika:</label>
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

      <button type="submit">Utwórz</button>
    </form>
  );
};

export default CreateUserForm;
