import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLoginClick, onLogout }) => {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="logo">ARtify</Link>
        <ul className="nav-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Products</Link></li>
          <li><Link to="/try-on" className={location.pathname === '/try-on' ? 'active' : ''}>Try On</Link></li>
          {user && <>
            <li><Link to="/cart" className={location.pathname === '/cart' ? 'active' : ''}>Cart</Link></li>
            <li><Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>Orders</Link></li>
            {user.role === 'admin' && <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link></li>}
          </>}
        </ul>
        <div className="auth-buttons">
          {user ? (<div style={{display:'flex',alignItems:'center',gap:'1rem'}}><span>Hello, {user.name}</span><button onClick={onLogout} className="btn btn-outline">Logout</button></div>) : (<button onClick={onLoginClick} className="btn btn-primary">Login</button>)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
