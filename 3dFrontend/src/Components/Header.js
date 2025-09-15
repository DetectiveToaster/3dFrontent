// src/components/header.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/authz';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function Header() {
    const { cartItems } = useCart();
    const { user, logout, loadingUser } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const { toggleTheme, theme } = useTheme();
    const { t, language, setLanguage } = useLanguage();

  return (
    <header className="header">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="logo">
        <Link to="/">YourLogo</Link>
      </div>
      <div className="search-area">
        <SearchBar />
      </div>
      <div className="header-controls">
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          \u2630
        </button>
        <nav id="primary-navigation" className={`nav-links${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
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
                {!loadingUser && isAdmin(user) && (
                  <li>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
                  </li>
                )}
                <li>
                  <button type="button" onClick={() => { setMenuOpen(false); logout(); }}>{t('logout')}</button>
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
          aria-label="Language"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => { toggleTheme(); setMenuOpen(false); }}
        >
          {theme === 'dark' ? t('lightMode') : t('darkMode')}
        </button>
      </div>
      </header>
  );
}

export default Header;
