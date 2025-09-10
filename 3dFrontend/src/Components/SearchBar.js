// src/components/SearchBar.js

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchBar.css';
import { useLanguage } from '../context/LanguageContext';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!expanded) {
      // First click opens the input
      setExpanded(true);
      // Focus after expansion frame
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    if (!trimmed) {
      // Keep open and focus if empty
      inputRef.current?.focus();
      return;
    }
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    // Optionally collapse after submit
    // setExpanded(false);
  };

  // Collapse when clicking outside if there's no query
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        if (!query.trim()) setExpanded(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [query]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (!query.trim()) setExpanded(false);
      inputRef.current?.blur();
    }
  };

  return (
    <form
      ref={containerRef}
      className={`search-bar${expanded ? ' expanded' : ''}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <button
        type="submit"
        className="search-button"
        aria-label={t('search')}
        title={t('search')}
      >
        {/* Magnifying glass SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
      <input
        ref={inputRef}
        id="searchInput"
        className="search-input"
        type="text"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        aria-hidden={!expanded}
        tabIndex={expanded ? 0 : -1}
      />
    </form>
  );
}

export default SearchBar;
