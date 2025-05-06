import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Auth({ setUserToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Wypełnij wszystkie pola!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });
      sessionStorage.setItem("user", JSON.stringify(res.data));
      setUserToken(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Logowanie</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Zaloguj się
        </button>
      </form>
    </div>
  );
}

export default Auth;
