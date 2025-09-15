// src/components/ProductCard.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';
import { getMediaBlob } from '../Services/mediaCache';

function ProductCard({ product }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const mediaList = product && Array.isArray(product.media) ? product.media : [];
    const imageMedia = mediaList.find(m => (m.kind || m.media_type) === 'image');
    if (imageMedia) {
      getMediaBlob(imageMedia.id)
        .then(blob => setImageUrl(URL.createObjectURL(blob)))
        .catch(() => setImageUrl('/placeholder.jpg'));
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
      {(() => {
        const unit = Number(
          (product && (product.discounted_price ?? product.price)) ?? 0
        );
        return <p>${unit.toFixed(2)}</p>;
      })()}
    </div>
  );
}

export default ProductCard;
