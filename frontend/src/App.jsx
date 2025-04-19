import { useEffect, useState } from "react";
import './index.css';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import { Routes, Route, Navigate } from "react-router";
import Layout from "./Layout";

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
      <Routes>
      <Route path="/auth" element={!userToken ? <Auth setUserToken={setUserToken} /> : <Navigate to="/dashboard" replace />} />
      <Route element={<Layout userToken={userToken} setUserToken={setUserToken} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manageUsers" element={<ManageUsers />} />
      </Route>
      </Routes>
    </>
  )
}

export default App
