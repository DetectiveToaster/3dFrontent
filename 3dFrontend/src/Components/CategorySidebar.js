// src/components/CategorySidebar.js

import React, { useEffect, useState } from 'react';
import api from '../Services/api';
import '../styles/CategorySidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function CategorySidebar() {
  const [categories, setCategories] = useState([]);
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

  const handleCategoryClick = (categoryId) => {
    if (categoryId === selectedCategory) {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    navigate(`/products?${params.toString()}`);
  };

  return (
    <aside className="category-sidebar">
      <h3>{t('categories')}</h3>
      <ul>
        <li className={!selectedCategory ? 'active' : ''}>
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') && handleCategoryClick(null)
            }
          >
            {t('all')}
          </button>
        </li>
        {categories.map((category) => (
          <li
            key={category.id}
            className={selectedCategory === category.id.toString() ? 'active' : ''}
          >
            <button
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                handleCategoryClick(category.id)
              }
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CategorySidebar;
