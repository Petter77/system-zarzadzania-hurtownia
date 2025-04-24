import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ userToken, setUserToken }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUserToken(null);
    setUser(null);
    navigate('/auth');
  };

  const getUserData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users/logged', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUser(res.data);
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
        {user && <span> | Zalogowany jako: {user.username}</span>}
        {user && <button onClick={handleLogout}>Wyloguj się</button>}
      </div>
    </>
  );
};

export default TopBar;
