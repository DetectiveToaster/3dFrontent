// src/pages/ProductDetailPage.js

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import api from '../Services/api';
import { getMediaBlob } from '../Services/mediaCache';
import ThreeDViewer from '../Components/ThreeDViewer';
import ImageCarousel from '../Components/ImageCarousel';
import '../styles/ProductDetailPage.css';
import { useCart } from '../context/CartContext';
import ClipLoader from 'react-spinners/ClipLoader';
import { useLanguage } from '../context/LanguageContext';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [modelUrl, setModelUrl] = useState(null);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then(async (response) => {
        setProduct(response.data);
        const imgs = [];
        let modelBlobUrl = null;
        const mediaList = Array.isArray(response.data.media) ? response.data.media : [];
        for (const media of mediaList) {
          const kind = media.kind || media.media_type; // backward compat
          if (kind === 'image') {
            const blob = await getMediaBlob(media.id);
            imgs.push(URL.createObjectURL(blob));
          }
          if (kind === 'model' && !modelBlobUrl) {
            const blob = await getMediaBlob(media.id);
            modelBlobUrl = URL.createObjectURL(blob);
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

  // Register a product view once per session/id with a small debounce
  useEffect(() => {
    if (!id) return;
    const key = `viewed_product_${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch (_) {
      // sessionStorage may be unavailable; best-effort only
    }
    const timer = setTimeout(() => {
      api.post(`/products/${id}/view`).catch(() => {});
      try { sessionStorage.setItem(key, '1'); } catch (_) {}
    }, 800); // debounce ~0.8s to avoid quick back/forward double posts

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <div className="loading"><ClipLoader /></div>;

  return (
    <div className="product-detail-page">
      <Helmet>
        <title>{product ? `${product.name} - 3D Figures Store` : 'Product Details - 3D Figures Store'}</title>
        <meta
          name="description"
          content={product ? `Purchase ${product.name} and explore its features in detail.` : 'Detailed view of our product.'}
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
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
            <ThreeDViewer modelUrl={modelUrl} alt={`3D model of ${product.name}`} />
          </div>
        )}
      </div>
      <div className="product-details">
        <h2>{product.name}</h2>
        {(() => {
          const unit = Number(
            (product && (product.discounted_price ?? product.price)) ?? 0
          );
          return <p className="price">${unit.toFixed(2)}</p>;
        })()}
        {product && product.type === '3d' && (
          <ul className="specs">
            {product.height != null && <li>{t('height')}: {product.height} cm</li>}
            {product.length != null && <li>{t('length')}: {product.length} cm</li>}
            {product.width != null && <li>{t('width')}: {product.width} cm</li>}
          </ul>
        )}
        {product && product.type === 'card' && (
          <ul className="specs">
            {product.series && <li>Series: {product.series}</li>}
            {product.rarity && <li>Rarity: {product.rarity}</li>}
            {product.condition && <li>Condition: {product.condition}</li>}
          </ul>
        )}
        {product && product.type === 'manual' && (
          <ul className="specs">
            {product.page_count != null && <li>Pages: {product.page_count}</li>}
            {product.language && <li>Language: {product.language}</li>}
            {product.format && <li>Format: {product.format}</li>}
          </ul>
        )}
        <div style={{ marginTop: 20 }}>
          <label htmlFor="quantity-input">
            {t('quantity')}
            <input
              id="quantity-input"
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 50 }}
            />
          </label>
        <button onClick={() => addToCart(product, qty)}>{t('addToCart')}</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
