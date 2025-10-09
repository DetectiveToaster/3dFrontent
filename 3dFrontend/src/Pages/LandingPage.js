// src/pages/LandingPage.js

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ThreeDViewer from '../Components/ThreeDViewer';
import '../styles/LandingPage.css';
import { useLanguage } from '../context/LanguageContext';
import api from '../Services/api';
import { getMediaBlob } from '../Services/mediaCache';

function LandingPage() {
  const { t } = useLanguage();
  const [highlighted, setHighlighted] = useState([]);
  const [highlightedShowcase, setHighlightedShowcase] = useState([]);
  const [loadingHighlights, setLoadingHighlights] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const params = { limit: 8, skip: 0 };
    setLoadingHighlights(true);
    api
      .get('/products/highlighted', { params })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setHighlighted(items);
      })
      .catch(() => setHighlighted([]))
      .finally(() => setLoadingHighlights(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateModels() {
      if (!highlighted || highlighted.length === 0) {
        setHighlightedShowcase([]);
        setLoadingModels(false);
        return;
      }

      setLoadingModels(true);
      const models = [];

      for (const product of highlighted) {
        const mediaList = Array.isArray(product.media) ? product.media : [];
        const modelMedia = mediaList.find(
          (m) => (m.kind || m.media_type) === 'model'
        );
        if (!modelMedia) continue;

        try {
          const blob = await getMediaBlob(modelMedia.id);
          const url = URL.createObjectURL(blob);
          models.push({ product, modelUrl: url });
          if (models.length === 3) break;
        } catch (err) {
          console.warn('LandingPage: failed to load model', product?.id, err);
        }
      }

      if (cancelled) {
        models.forEach(({ modelUrl }) => URL.revokeObjectURL(modelUrl));
        return;
      }

      setHighlightedShowcase(models);
      setLoadingModels(false);
    }

    hydrateModels();

    return () => {
      cancelled = true;
    };
  }, [highlighted]);

  useEffect(() => {
    return () => {
      highlightedShowcase.forEach(({ modelUrl }) => URL.revokeObjectURL(modelUrl));
    };
  }, [highlightedShowcase]);

  const formatPrice = (product) => {
    const unit = Number(
      (product && (product.discounted_price ?? product.price)) ?? 0
    );
    return `$${unit.toFixed(2)}`;
  };

  return (
    <div className="landing-page">
      <Helmet>
        <title>Home - 3D Figures Store</title>
        <meta name="description" content={t('discover')} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="hero">
        <h1>{t('welcome')}</h1>
        <p>{t('discover')}</p>
        <Link to="/products" className="cta-button">
          {t('shopNow')}
        </Link>
      </div>

      <section className="featured-highlighted">
        <h2>{t('featuredModels')}</h2>
        <p>{t('experience')}</p>
        {loadingHighlights || loadingModels ? (
          <p className="muted">Loading highlighted models...</p>
        ) : highlightedShowcase.length > 0 ? (
          <>
            <div className="highlighted-showcases">
              {highlightedShowcase.map(({ product, modelUrl }) => (
                <article key={product.id} className="highlighted-showcase-card">
                  <ThreeDViewer
                    modelUrl={modelUrl}
                    style={{ maxWidth: '420px', height: '420px' }}
                    alt={`3D model of ${product.name}`}
                  />
                  <div className="highlighted-info">
                    <Link to={`/products/${product.id}`} className="highlighted-link">
                      {product.name}
                    </Link>
                    <span className="price-tag">{formatPrice(product)}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="cta-wrapper">
              <Link to="/products" className="cta-button">
                {t('exploreModels')}
              </Link>
            </div>
          </>
        ) : highlighted.length > 0 ? (
          <p className="muted">Highlighted products currently lack 3D previews.</p>
        ) : (
          <p className="muted">No products currently available.</p>
        )}
      </section>
    </div>
  );
}

export default LandingPage;
