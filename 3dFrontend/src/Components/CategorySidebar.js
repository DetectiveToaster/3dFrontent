// src/components/CategorySidebar.js

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../Services/api';
import '../styles/CategorySidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function CategorySidebar() {
  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTray, setShowTray] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(new URLSearchParams(window.location.search).get('category'));
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get('category');

  useEffect(() => {
    api
      .get('/categories/')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setShowTray(true);
    }
  }, [selectedCategory]);

  const categoryItems = useMemo(() => {
    const items = [
      {
        value: null,
        key: 'all',
        label: t('all'),
        isActive: !selectedCategory,
      },
    ];

    categories.forEach((category) => {
      const value = String(category.id);
      items.push({
        value,
        key: value,
        label: category.name,
        isActive: selectedCategory === value,
      });
    });

    return items;
  }, [categories, selectedCategory, t]);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, closeSidebar]);

  const handleCategoryClick = (value) => {
    const isAll = value === null;
    const isSameSelection =
      (isAll && !selectedCategory) || (!isAll && selectedCategory === value);

    if (isAll || isSameSelection) {
      params.delete('category');
    } else {
      params.set('category', value);
    }

    params.delete('page');
    navigate(`/products?${params.toString()}`);
    setShowTray(true);
    closeSidebar();
  };

  const renderCategoryList = (layout) => (
    <ul className={`category-list category-list--${layout}`}>
      {categoryItems.map((item) => (
        <li key={item.key} className={item.isActive ? 'active' : ''}>
          <button
            type="button"
            onClick={() => handleCategoryClick(item.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryClick(item.value);
              }
            }}
            aria-pressed={item.isActive}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`category-sidebar ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
    >
      <button
        type="button"
        className="category-sidebar__toggle"
        onClick={toggleSidebar}
        aria-haspopup="true"
        aria-label={isExpanded ? t('closeCategories') : t('openCategories')}
        aria-expanded={isExpanded}
      >
        <span aria-hidden="true" className="category-sidebar__toggle-icon" />
        <span className="category-sidebar__toggle-label">{t('categories')}</span>
      </button>

      <div className="category-sidebar__panel" aria-hidden={!isExpanded}>
        <h3>{t('categories')}</h3>
        {renderCategoryList('vertical')}
      </div>

      {showTray && (
        <div
          className={`category-sidebar__tray${showTray ? ' is-visible' : ''}`}
          aria-hidden={isExpanded}
        >
          {renderCategoryList('horizontal')}
        </div>
      )}
    </aside>
  );
}

export default CategorySidebar;
