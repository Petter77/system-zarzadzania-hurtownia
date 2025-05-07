import { useEffect, useState } from "react";
import axios from 'axios';
import './index.css';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports';
import { Routes, Route, Navigate } from "react-router";
import Layout from "./Layout";

function App() {

  const [userToken, setUserToken] = useState(sessionStorage.getItem('user'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserLoggedIn = async () => {
      try {
        const res = await axios.get('http://localhost:3000/users/logged', {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
        setUser(null);
      }
    };
  
    if (userToken) {
      sessionStorage.setItem("user", userToken);
      getUserLoggedIn();
    } else {
      sessionStorage.removeItem("user");
      setUser(null);
    }
  }, [userToken]);

return (
    <Routes>
      <Route
        path="/auth"
        element={!userToken ? <Auth setUserToken={setUserToken} /> : <Navigate to="/dashboard" replace />}
      />
      <Route element={<Layout userToken={userToken} setUserToken={setUserToken} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {user && user.role === 'manager' && (
          <Route path="/manage-employees" element={<ManageUsers userToken={userToken} />} />
        )}

        {user && user.role !== 'manager' && (
          <Route path="/manage-employees" element={<Navigate to="/dashboard" replace />} />
        )}

{user && user.role === 'manager' && (
          <Route path="/reports" element={<Reports userToken={userToken} />} />
        )}

        {user && user.role !== 'manager' && (
          <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
        )}
      </Route>
    </Routes>
  );
}

export default App
