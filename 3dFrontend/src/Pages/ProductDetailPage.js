// src/pages/ProductDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ThreeDViewer from '../components/ThreeDViewer';
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((response) => setProduct(response.data))
      .catch((error) => console.error('Error fetching product:', error));
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail-page">
      <div className="product-visual">
        <ThreeDViewer modelPath={product.modelUrl} />
      </div>
      <div className="product-details">
        <h2>{product.name}</h2>
        <p className="price">${product.selling_cost.toFixed(2)}</p>
        <p>{product.description || 'No description available.'}</p>
        <ul className="specs">
          <li>Height: {product.height} cm</li>
          <li>Length: {product.length} cm</li>
          <li>Depth: {product.depth} cm</li>
        </ul>
        {/* Future implementation: Add to Cart button */}
        {/* <button className="add-to-cart">Add to Cart</button> */}
      </div>
    </div>
  );
}

export default ProductDetailPage;
