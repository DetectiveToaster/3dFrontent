// src/components/header.js

import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">YourLogo</Link>
      </div>
      <SearchBar />
      <nav className="nav-links">
        <Link to="/products">Products</Link>
        {/* Future links like Cart, Login can be added here */}
      </nav>
    </header>
  );
}

export default Header;
