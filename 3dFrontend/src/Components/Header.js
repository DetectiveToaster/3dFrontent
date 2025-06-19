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
        <nav className="nav-links">
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart ({cartItems.length})</Link>
          {user ? (
            <>
              <span className="user-greet">Hi, {user.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
    </header>
  );
}

export default Header;
