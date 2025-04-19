import { useEffect, useState } from "react";
import './index.css';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import TopBar from './components/TopBar';
import { Routes, Route } from "react-router";

function App() {

  const [userToken, setUserToken] = useState(sessionStorage.getItem('user'));

  useEffect(() => {
    if (userToken) {
      sessionStorage.setItem("user", userToken);
    } else {
      sessionStorage.removeItem("user");
    }
  }, [userToken]);

  return(
    <>
    <TopBar setUserToken={setUserToken} />
     <Routes>
      <Route path="/" element={userToken ? <Dashboard /> : <Auth />} />
      <Route path="/dashboard" element={userToken ? <Dashboard  /> : <Auth />} />
      <Route path="/auth" element={!userToken ? <Auth setUserToken={setUserToken} /> : <Dashboard />} />
      <Route path="/manageUsers" element={!userToken ? <Auth setUserToken={setUserToken} /> : <ManageUsers />} />
    </Routes>
    </>
  )
}

export default App
