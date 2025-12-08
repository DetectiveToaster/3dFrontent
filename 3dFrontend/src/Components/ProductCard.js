// src/components/ProductCard.js

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';
import { getMediaBlob } from '../Services/mediaCache';
import ThreeDViewer, { preloadModel } from './ThreeDViewer';
import { pickMediaByRole, sortMediaList } from '../utils/media';
import { SHOWCASE_MODE } from '../config/showcase';

function formatPrice(product) {
  const value = Number((product && (product.discounted_price ?? product.price)) ?? 0);
  if (!Number.isFinite(value)) {
    return '$0.00';
  }
  const currency = typeof product?.currency === 'string' ? product.currency : 'USD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (err) {
    return `$${value.toFixed(2)}`;
  }
}

function ProductCard({ product }) {
  const productId = product?.id;
  const productPath = productId ? `/products/${productId}` : '/products';

  const mediaList = useMemo(
    () => sortMediaList(product && Array.isArray(product.media) ? product.media : []),
    [product]
  );

  const imageMedia = useMemo(
    () => pickMediaByRole(mediaList, 'image'),
    [mediaList]
  );
  const modelMedia = useMemo(
    () => pickMediaByRole(mediaList, 'model'),
    [mediaList]
  );

  const [imageUrl, setImageUrl] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const [hasHover, setHasHover] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let nextUrl = null;

    if (!imageMedia) {
      setImageUrl('/placeholder.jpg');
      return undefined;
    }

    getMediaBlob(imageMedia.id)
      .then((blob) => {
        if (cancelled) return;
        nextUrl = URL.createObjectURL(blob);
        setImageUrl((prev) => {
          if (prev && prev !== '/placeholder.jpg') {
            URL.revokeObjectURL(prev);
          }
          return nextUrl;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setImageUrl('/placeholder.jpg');
        }
      });

    return () => {
      cancelled = true;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [imageMedia]);

  const ensureModelLoaded = useCallback(async () => {
    if (!modelMedia || modelUrl || loadingModel || modelError) {
      return;
    }
    setLoadingModel(true);
    try {
      const blob = await getMediaBlob(modelMedia.id);
      const url = URL.createObjectURL(blob);
      try {
        await preloadModel(url);
      } catch (preloadErr) {
        console.warn('ProductCard: model preloading failed', productId, preloadErr);
      }
      setModelUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });
      setModelError(false);
    } catch (error) {
      console.warn('ProductCard: failed to load model', productId, error);
      setModelError(true);
    } finally {
      setLoadingModel(false);
    }
  }, [modelMedia, modelUrl, loadingModel, modelError, productId]);

  useEffect(
    () => () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    },
    [modelUrl]
  );

  const handleEnter = useCallback(() => {
    setHasHover(true);
    ensureModelLoaded();
  }, [ensureModelLoaded]);

  const handleLeave = useCallback(() => {
    setHasHover(false);
  }, []);

  const priceLabel = formatPrice(product);
  const showViewer = hasHover && modelUrl && !modelError;

  return (
    <article className={`product-card${modelMedia ? ' product-card--has-model' : ''}`}>
      <Link
        to={productPath}
        className="product-card__link"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        <div className="product-card__media">
          {showViewer ? (
            <div className="product-card__viewer">
              <ThreeDViewer
                className="three-d-viewer--compact"
                modelUrl={modelUrl}
                height="100%"
                style={{ minHeight: '100%' }}
                alt={`3D preview of ${product?.name ?? 'product'}`}
              />
            </div>
          ) : (
            <img
              loading="lazy"
              src={imageUrl || '/placeholder.jpg'}
              alt={product?.name || 'Product preview'}
            />
          )}
          {loadingModel && !modelUrl && hasHover && (
            <div className="product-card__loading">Loading 3D preview...</div>
          )}
          {modelError && hasHover && (
            <div className="product-card__loading product-card__loading--error">
              3D preview unavailable
            </div>
          )}
        </div>
        <footer className="product-card__meta">
          <span className="product-card__name">{product?.name}</span>
          {!SHOWCASE_MODE && <span className="product-card__price">{priceLabel}</span>}
        </footer>
      </Link>
    </article>
  );
}

export default ProductCard;
