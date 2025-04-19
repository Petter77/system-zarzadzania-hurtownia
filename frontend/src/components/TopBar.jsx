import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ userToken, setUserToken }) => {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUserToken(null);
    setResults(null);
    navigate('/auth');
  };

  const getUserData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users/logged', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setResults(res.data);
    } catch (error) {
      console.error('Błąd podczas pobierania danych użytkownika:', error);
      handleLogout();
    }
  };

  useEffect(() => {
    if (userToken) {
      getUserData();
    }
  }, [userToken]);

  return (
    <>
      <div>
        <span>TopBar</span>
        {results && <span> | Zalogowany jako: {results.username}</span>}
        {results && <button onClick={handleLogout}>Wyloguj się</button>}
      </div>
    </>
  );
};

export default TopBar;
