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

function getNumericPrice(product) {
  if (!product) return 0;
  const value = product.discounted_price ?? product.price;
  return Number(value ?? 0);
}

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const query = useQuery();
  const navigate = useNavigate();
  const searchQuery = query.get('search') || '';
  const category = query.get('category') || '';
  const sort = query.get('sort') || 'featured';
  const page = Math.max(1, parseInt(query.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(query.get('limit') || '12', 10));
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
    const v = Math.max(1, parseInt(e.target.value || '12', 10));
    updateQuery({ page: 1, limit: v });
  };
  const changeSort = (e) => {
    updateQuery({ sort: e.target.value, page: 1 });
  };

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const items = [...products];
    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
      case 'price-desc':
        return items.sort((a, b) => getNumericPrice(b) - getNumericPrice(a));
      case 'alpha':
        return items.sort((a, b) => {
          const nameA = (a?.name || '').toLowerCase();
          const nameB = (b?.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      default:
        return items;
    }
  }, [products, sort]);

  const activeFilters = [];
  if (searchQuery) {
    activeFilters.push(`Search: "${searchQuery}"`);
  }
  if (category) {
    activeFilters.push(`Category ${category}`);
  }

  const startRange = sortedProducts.length ? (skip + 1) : 0;
  const endRange = skip + sortedProducts.length;

  const heroTitle = searchQuery ? `Results for "${searchQuery}"` : 'Collector Figures Gallery';
  const heroSubtitle = searchQuery
    ? 'See what we found across our collection.'
    : 'Premium resin statues and collectibles rendered in full 3D detail.';

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
      <section className="product-list-hero">
        <div className="product-list-hero__content">
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </div>
        <div className="product-list-hero__count">
          {sortedProducts.length > 0 ? `${startRange}-${endRange}` : '0'}
          <span>items</span>
        </div>
      </section>
      <nav className="product-list-toolbar" aria-label="Product filters and sorting">
        <div className="product-list-toolbar__filters">
          {activeFilters.length > 0 ? (
            activeFilters.map((label) => (
              <span key={label} className="toolbar-pill">{label}</span>
            ))
          ) : (
            <span className="toolbar-pill toolbar-pill--ghost">All products</span>
          )}
        </div>
        <div className="product-list-toolbar__controls">
          <label className="toolbar-control" htmlFor="sort-select">
            Sort
            <select id="sort-select" value={sort} onChange={changeSort}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="alpha">Name A-Z</option>
            </select>
          </label>
          <label className="toolbar-control" htmlFor="limit-select">
            Per page
            <select id="limit-select" value={String(limit)} onChange={changeLimit}>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
            </select>
          </label>
        </div>
      </nav>
      <div className="product-list-content">
        {loading ? (
          <div className="product-list-loading">
            <ClipLoader size={48} />
          </div>
        ) : (
          <ProductGrid products={sortedProducts} />
        )}
      </div>
      <div className="pagination-controls">
        <button className="pagination-button" onClick={goPrev} disabled={page <= 1}>Previous</button>
        <span className="pagination-status">Page {page}</span>
        <button className="pagination-button" onClick={goNext} disabled={!hasMore}>Next</button>
      </div>
    </div>
  );
}

export default ProductListPage;
