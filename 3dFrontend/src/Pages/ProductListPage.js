// src/pages/ProductListPage.js

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [hasMore, setHasMore] = useState(false);
  const query = useQuery();
  const navigate = useNavigate();
  const searchQuery = query.get('search') || '';
  const category = query.get('category') || '';
  const page = Math.max(1, parseInt(query.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(query.get('limit') || '10', 10));
  const skip = useMemo(() => (page - 1) * limit, [page, limit]);

  useEffect(() => {
    setLoading(true);
    const params = { skip, limit };
    if (searchQuery) params.search = searchQuery;
    if (category) params.category = category;

    api
      .get('/products/', { params })
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : [];
        setProducts(items);
        setHasMore(items.length === limit);
      })
      .catch((error) => console.error('Error fetching products:', error))
      .finally(() => setLoading(false));
  }, [searchQuery, category, skip, limit]);

  const updateQuery = (next) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') params.delete(k);
      else params.set(k, String(v));
    });
    navigate(`/products?${params.toString()}`);
  };

  const goPrev = () => { if (page > 1) updateQuery({ page: page - 1, limit }); };
  const goNext = () => { if (hasMore) updateQuery({ page: page + 1, limit }); };
  const changeLimit = (e) => {
    const v = Math.max(1, parseInt(e.target.value || '10', 10));
    updateQuery({ page: 1, limit: v });
  };

  return (
    <div className="product-list-page">
      <Helmet>
        <title>Products - 3D Figures Store</title>
        <meta
          name="description"
          content="Browse our selection of 3D printed figures."
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="product-list-content">
        {loading ? <ClipLoader /> : <ProductGrid products={products} />}
      </div>
      <div className="pagination-controls">
        <button className="pagination-button" onClick={goPrev} disabled={page <= 1}>Previous</button>
        <span>Page {page}</span>
        <button className="pagination-button" onClick={goNext} disabled={!hasMore}>Next</button>
        <label className="per-page-label">
          Per page:
          <select className="per-page-select" value={String(limit)} onChange={changeLimit}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default ProductListPage;
