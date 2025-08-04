// src/components/header.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function Header() {
    const { cartItems } = useCart();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const { toggleTheme, theme } = useTheme();
    const { t, language, setLanguage } = useLanguage();

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">YourLogo</Link>
      </div>
      <SearchBar />
      <div className="header-controls">
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
              <Link to="/products" onClick={() => setMenuOpen(false)}>{t('products')}</Link>
            </li>
            <li>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>{`${t('cart')} (${cartItems.length})`}</Link>
            </li>
            {user ? (
              <>
                <li className="user-greet">
                  <span>{t('hi')}, {user.email}</span>
                </li>
                <li>
                  <button onClick={() => { setMenuOpen(false); logout(); }}>{t('logout')}</button>
                </li>
              </>
            ) : (
              <>
                <li>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>{t('login')}</Link>
                </li>
                <li>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>{t('register')}</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <select
          className="language-select"
          value={language}
          onChange={(e) => { setLanguage(e.target.value); setMenuOpen(false); }}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <button
          className="theme-toggle"
          onClick={() => { toggleTheme(); setMenuOpen(false); }}
        >
          {theme === 'dark' ? t('lightMode') : t('darkMode')}
        </button>
      </div>
      </header>
  );
}

export default Header;
