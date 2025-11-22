import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import UserAuth from './components/UserAuth';
import ARViewer from './components/ARViewer';
import Home from './pages/Home';
import Products from './pages/Products';
import TryOn from './pages/TryOn';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import { getToken, decodeToken } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLoginClick={() => setShowAuth(true)} onLogout={handleLogout} />
        {showAuth && <UserAuth onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/try-on" element={<TryOn />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/" />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
