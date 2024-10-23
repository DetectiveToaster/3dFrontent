// src/pages/ProductListPage.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import ProductGrid from '../components/ProductGrid';
import './ProductListPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const query = useQuery();
  const searchQuery = query.get('search') || '';
  const category = query.get('category') || '';

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (category) params.category = category;

    api
      .get('/products/', { params })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  }, [searchQuery, category]);

  return (
    <div className="product-list-page">
      <CategorySidebar />
      <div className="product-list-content">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

export default ProductListPage;
