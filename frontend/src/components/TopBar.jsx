import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const TopBar = ({ userToken, setUserToken }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const showBackArrow = location.pathname !== "/" && location.pathname !== "/dashboard";

  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <span className="text-xl font-semibold flex items-center">
        {showBackArrow && (
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded hover:bg-blue-700 transition"
            aria-label="Wróć"
            type="button"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
        )}
      </span>
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-lg">Zalogowany jako: <span className="font-bold">{user.username}</span></span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  );
};

export default TopBar;