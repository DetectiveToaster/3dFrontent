// src/components/header.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/authz';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function Header() {
  const { user, logout, loadingUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleTheme, theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`header ${menuOpen ? 'is-menu-open' : ''}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="header__brand">
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span className="menu-toggle__icon" aria-hidden="true" />
        </button>
        <div className="logo">
          <Link to="/" onClick={closeMenu}>YourLogo</Link>
        </div>
      </div>

      <div className="header__search">
        <SearchBar />
      </div>

      <div className="header__actions">
        <nav
          id="primary-navigation"
          className={`header__nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          <ul>
            <li>
              <Link to="/new" onClick={closeMenu}>Showcase</Link>
            </li>
            <li>
              <Link to="/products" onClick={closeMenu}>{t('products')}</Link>
            </li>
            {user ? (
              <>
                <li className="header__user">
                  <span>{t('hi')}, {user.email}</span>
                </li>
                {!loadingUser && isAdmin(user) && (
                  <li>
                    <Link to="/admin" onClick={closeMenu}>Admin</Link>
                  </li>
                )}
                <li>
                  <button type="button" onClick={() => { closeMenu(); logout(); }}>{t('logout')}</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={closeMenu}>{t('login')}</Link>
                </li>
                <li>
                  <Link to="/register" onClick={closeMenu}>{t('register')}</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="header__utility">
          <select
            className="language-select"
            value={language}
            onChange={(e) => { setLanguage(e.target.value); closeMenu(); }}
            aria-label="Language"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => { toggleTheme(); closeMenu(); }}
          >
            {theme === 'dark' ? t('lightMode') : t('darkMode')}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
