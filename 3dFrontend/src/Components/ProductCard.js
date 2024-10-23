// src/components/ProductCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={product.imageUrl || '/placeholder.jpg'} alt={product.name} />
        <h4>{product.name}</h4>
      </Link>
      <p>${product.selling_cost.toFixed(2)}</p>
    </div>
  );
}

export default ProductCard;
