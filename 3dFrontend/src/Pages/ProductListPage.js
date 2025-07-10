// src/pages/ProductListPage.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../Services/api';
import ProductGrid from '../Components/ProductGrid';
import '../styles/ProductListPage.css';
import ClipLoader from 'react-spinners/ClipLoader';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const searchQuery = query.get('search') || '';
  const category = query.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (category) params.category = category;

    api
      .get('/products/', { params })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error))
      .finally(() => setLoading(false));
  }, [searchQuery, category]);

  return (
    <div className="product-list-page">
      <Helmet>
        <title>Products - 3D Figures Store</title>
        <meta
          name="description"
          content="Browse our selection of 3D printed figures."
        />
      </Helmet>
      <div className="product-list-content">
        {loading ? <ClipLoader /> : <ProductGrid products={products} />}
      </div>
    </div>
  );
}

export default ProductListPage;
