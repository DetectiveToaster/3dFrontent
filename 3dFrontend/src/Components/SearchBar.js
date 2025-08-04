// src/components/SearchBar.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchBar.css';
import { useLanguage } from '../context/LanguageContext';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          id="searchInput"
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      <button type="submit">{t('search')}</button>
    </form>
  );
}

export default SearchBar;
