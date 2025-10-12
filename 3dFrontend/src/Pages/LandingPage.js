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

  const highlightedCount = highlighted.length;
  const showcaseCount = highlightedShowcase.length;
  const heroStatValue = highlightedCount ? highlightedCount.toString().padStart(1, '0') : '0';
  const heroStatLabel = highlightedCount === 1 ? 'highlight' : 'highlights';
  const ribbonItems = ['Collector Figures', 'Premium Resin', 'Hand-Painted', 'Limited Runs'];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Home - 3D Figures Store</title>
        <meta name="description" content={t('discover')} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <section className="landing-hero">
        <div className="landing-hero__ribbon" aria-hidden="true">
          {ribbonItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="landing-hero__content">
          <span className="landing-hero__eyebrow">Premium 3D Drops</span>
          <h1>{t('welcome')}</h1>
          <p className="landing-hero__lead">{t('discover')}</p>
          <div className="landing-hero__actions">
            <Link to="/products" className="landing-cta landing-cta--primary">
              {t('shopNow')}
            </Link>
            <Link to="/products" className="landing-cta landing-cta--ghost">
              {t('exploreModels')}
            </Link>
          </div>
        </div>
        <div className="landing-hero__stat" aria-live="polite">
          <span className="landing-hero__stat-value">{heroStatValue}</span>
          <span className="landing-hero__stat-label">{heroStatLabel}</span>
        </div>
      </section>

      <section className="landing-toolbar" aria-label="Highlight overview">
        <div className="landing-toolbar__filters">
          <span className="toolbar-pill">All products</span>
          <span className="toolbar-pill toolbar-pill--ghost">
            {showcaseCount > 0 ? `${showcaseCount} live previews` : 'Awaiting previews'}
          </span>
        </div>
        <Link to="/products" className="landing-toolbar__cta">
          Browse catalog
        </Link>
      </section>

      <section className="landing-featured">
        <header className="landing-featured__header">
          <h2>{t('featuredModels')}</h2>
          <p>{t('experience')}</p>
        </header>

        {loadingHighlights || loadingModels ? (
          <p className="landing-featured__state muted">Loading highlighted models...</p>
        ) : highlightedShowcase.length > 0 ? (
          <>
            <div className="landing-featured__grid">
              {highlightedShowcase.map(({ product, modelUrl }) => (
                <article key={product.id} className="landing-featured__card">
                  <div className="landing-featured__viewer">
                    <ThreeDViewer
                      modelUrl={modelUrl}
                      style={{ width: '100%', height: '360px' }}
                      alt={`3D model of ${product.name}`}
                    />
                  </div>
                  <div className="landing-featured__meta">
                    <Link to={`/products/${product.id}`} className="landing-featured__link">
                      {product.name}
                    </Link>
                    <span className="landing-featured__price">{formatPrice(product)}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="landing-featured__cta">
              <Link to="/products" className="landing-cta landing-cta--primary">
                {t('exploreModels')}
              </Link>
            </div>
          </>
        ) : highlighted.length > 0 ? (
          <p className="landing-featured__state muted">
            Highlighted products currently lack 3D previews.
          </p>
        ) : (
          <p className="landing-featured__state muted">No products currently available.</p>
        )}
      </section>
    </div>
  );
}

export default LandingPage;
