import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:3000/auth/login';

    try {
      const response = await axios.post(url, {
        username: login,
        password: password,
      });

      sessionStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data); // Ustawiamy obiekt, nie string
      setLogin('');
      setPassword('');
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data || 'Błąd logowania');
    }
  };

  return (
    <div className="loginForm">
      <form onSubmit={handleSubmit}>
        <label htmlFor="login">Login:</label>
        <input
          type="text"
          id="login"
          name="login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Wpisz swój login"
          required
        />

        <label htmlFor="password">Hasło:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wpisz swoje hasło"
          required
        />

        <button type="submit">Zaloguj się</button>
      </form>
      {message && <p className="error">{message}</p>}
    </div>
  );
}

export default Login