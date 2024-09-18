import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import ManageOrders from './components/ManageOrders';
import AddProducts from './components/AddProducts';

function App() {
  const [selectedStore, setSelectedStore] = useState('');

  return (
    <Router>
      <div className="App">
        <nav>
          <h1>TP Admin</h1>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="store-select"
          >
            <option value="MDP">CAR SHED</option>
          </select>
          <div className="nav-links">
            <Link to="/add-products">Add Products</Link>
            <Link to="/manage-orders">Manage Orders</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/add-products" element={<AddProducts />} />
          <Route path="/manage-orders" element={<ManageOrders />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
