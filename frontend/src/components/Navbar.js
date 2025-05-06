import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/operations">Operations</Link></li>
        <li><Link to="/inventory">Inventory</Link></li> {/* Dodano link do Inventory */}
      </ul>
    </nav>
  );
}

export default Navbar;