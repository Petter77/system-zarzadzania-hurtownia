import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Auth({setUserToken}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        if (!username || !password) {
          setError('Wypełnij wszystkie pola!');
          return;
        }
    
        try {
          const res = await axios.post('http://localhost:3000/auth/login', {
            username, 
            password,
          });
          sessionStorage.setItem('user', JSON.stringify(res.data))
          setUserToken(res.data);
          navigate('/dashboard');
        } catch (err) {
          setError(err.response.data);
        }
      };

    return ( 
        <form onSubmit={handleSubmit}>
        <h2>Logowanie</h2>
  
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
  
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
  
        {error && <p>{error}</p>}
  
        <button type="submit">Zaloguj się</button>
      </form>
     );
}

export default Auth;
