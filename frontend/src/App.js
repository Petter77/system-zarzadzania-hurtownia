import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryList from './components/InventoryList';
import AddItem from './components/AddItem';
import EditItem from './components/EditItem';

function App() {
  return (
    <Router>
      <div>
        <h1>Warehouse Management</h1>
        <Routes>
          <Route path="/" element={<InventoryList />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/edit/:id" element={<EditItem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;