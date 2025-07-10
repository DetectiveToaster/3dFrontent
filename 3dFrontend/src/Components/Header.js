// src/components/header.js

import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { cartItems } = useCart();
    const { user, logout } = useAuth();
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">YourLogo</Link>
      </div>
      <SearchBar />
        <nav className="nav-links" aria-label="Main navigation">
          <ul>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/cart">Cart ({cartItems.length})</Link>
            </li>
            {user ? (
              <>
                <li className="user-greet">
                  <span>Hi, {user.email}</span>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
    </header>
  );
}

export default Header;
