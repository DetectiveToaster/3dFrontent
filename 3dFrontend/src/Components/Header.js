// src/components/header.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { cartItems } = useCart();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">YourLogo</Link>
      </div>
      <SearchBar />
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        \u2630
      </button>
        <nav className={`nav-links${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <ul>
            <li>
              <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
            </li>
            <li>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartItems.length})</Link>
            </li>
            {user ? (
              <>
                <li className="user-greet">
                  <span>Hi, {user.email}</span>
                </li>
                <li>
                  <button onClick={() => { setMenuOpen(false); logout(); }}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                </li>
                <li>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
    </header>
  );
}

export default Header;
