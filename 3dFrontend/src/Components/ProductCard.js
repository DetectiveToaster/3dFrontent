// src/components/ProductCard.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';
import { getMediaBlob } from '../Services/mediaCache';

function ProductCard({ product }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (product.media && product.media.length > 0) {
      // Find first image-type media
      const imageMedia = product.media.find(m => m.media_type === 'image');
      if (imageMedia) {
        // Fetch image with caching
        getMediaBlob(imageMedia.id)
          .then(blob => setImageUrl(URL.createObjectURL(blob)))
          .catch(() => setImageUrl('/placeholder.jpg'));
      } else {
        setImageUrl('/placeholder.jpg');
      }
    } else {
      setImageUrl('/placeholder.jpg');
    }
    // Clean up object URL on unmount
    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); };
    // eslint-disable-next-line
  }, [product]);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img loading="lazy" src={imageUrl || '/placeholder.jpg'} alt={product.name} />
        <h4>{product.name}</h4>
      </Link>
      <p>${parseFloat(product.selling_cost).toFixed(2)}</p>
    </div>
  );
}

export default ProductCard;
