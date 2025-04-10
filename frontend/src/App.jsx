import './App.scss'
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Admin from './pages/Admin'
import { useEffect, useState } from 'react';
import LogoutButton from './components/LogoutButton/LogoutButton';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  if(user && user.rola === 'Administrator'){
    console.log('Admin')
  }

  return (
    <div className="app">
      {
        user ? <LogoutButton setUser={setUser}/> : null 
      }
      <div className="main-content">
        <Routes>
          <Route path='/' element={!user ? <Login setUser={setUser}/> : <Dashboard />} />
          <Route path='/login' element={user ? <Navigate to="/" /> : <Login setUser={setUser}/>} />
          <Route path='/dashboard' element={!user ? <Navigate to="/login" /> : <Dashboard />} />
          {/* Naprawic */}
          <Route 
            path='/admin' 
            element={(user && user.rola === 'Administrator') ? <Admin /> : <Navigate to="/dashboard" />} 
          />
        </Routes>
      </div>
    </div>
  );
}



export default App
