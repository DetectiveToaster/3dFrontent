// src/pages/ProductDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../Services/api';
import { getMediaBlob } from '../Services/mediaCache';
import ThreeDViewer from '../Components/ThreeDViewer';
import ImageCarousel from '../Components/ImageCarousel';
import '../styles/ProductDetailPage.css';
import { useCart } from '../context/CartContext';
import ClipLoader from 'react-spinners/ClipLoader';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [modelUrl, setModelUrl] = useState(null);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then(async (response) => {
        setProduct(response.data);
        // Fetch all image blobs
        const imgs = [];
        let modelBlobUrl = null;
        if (response.data.media && response.data.media.length > 0) {
          for (const media of response.data.media) {
            if (media.media_type === "image") {
              const blob = await getMediaBlob(media.id);
              imgs.push(URL.createObjectURL(blob));
            }
            if (media.media_type === "model" && !modelBlobUrl) {
              const blob = await getMediaBlob(media.id);
              modelBlobUrl = URL.createObjectURL(blob);
            }
          }
        }
        setImages(imgs);
        setModelUrl(modelBlobUrl);
      })
      .catch((error) => console.error('Error fetching product:', error))
      .finally(() => setLoading(false));

    // Clean up blob URLs on unmount
    return () => {
      images.forEach(url => URL.revokeObjectURL(url));
      if (modelUrl) URL.revokeObjectURL(modelUrl);
    };
    // eslint-disable-next-line
  }, [id]);

  if (loading) return <div className="loading"><ClipLoader /></div>;

  return (
    <div className="product-detail-page">
      <div className="product-visual">
        {/* Images displayed as a carousel */}
        {images.length > 0 && (
          <div className="product-images">
            <ImageCarousel images={images} altPrefix={product.name} />
          </div>
        )}
        {/* 3D Viewer */}
        {modelUrl && (
          <div className="product-3dviewer">
            <ThreeDViewer modelUrl={modelUrl} />
          </div>
        )}
      </div>
      <div className="product-details">
        <h2>{product.name}</h2>
        <p className="price">${parseFloat(product.selling_cost).toFixed(2)}</p>
        <ul className="specs">
          <li>Height: {product.height} cm</li>
          <li>Length: {product.length} cm</li>
          <li>Depth: {product.depth} cm</li>
        </ul>
        <div style={{ marginTop: 20 }}>
          <label htmlFor="quantity-input">
            Quantity
            <input
              id="quantity-input"
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 50 }}
            />
          </label>
        <button onClick={() => addToCart(product, qty)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
