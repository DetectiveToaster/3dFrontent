// src/pages/LandingPage.js

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ThreeDViewer from '../Components/ThreeDViewer';
import '../styles/LandingPage.css';
import { useLanguage } from '../context/LanguageContext';
import api from '../Services/api';
import ProductGrid from '../Components/ProductGrid';
import ProductCarousel from '../Components/ProductCarousel';

function LandingPage() {
  const modelUrl =
    "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  const { t } = useLanguage();
  const [highlighted, setHighlighted] = useState([]);

  useEffect(() => {
    // Fetch backend-scored highlighted products for the landing grid
    const params = { limit: 8, skip: 0 };
    api.get('/products/highlighted', { params })
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : [];
        setHighlighted(items);
      })
      .catch(() => setHighlighted([]));
  }, []);
  return (
    <div className="landing-page">
      <Helmet>
        <title>Home - 3D Figures Store</title>
        <meta
          name="description"
          content={t('discover')}
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="hero">
        <h1>{t('welcome')}</h1>
        <p>{t('discover')}</p>
        <Link to="/products" className="cta-button">
          {t('shopNow')}
        </Link>
      </div>
      <section className="featured-model">
        <h2>{t('featuredModels')}</h2>
        <div className="showcases">
          <ThreeDViewer
            modelUrl={modelUrl}
            style={{ maxWidth: "600px", height: "500px" }}
            alt="Featured 3D model"
          />
          <ThreeDViewer
            modelUrl={modelUrl}
            style={{ maxWidth: "600px", height: "500px" }}
            alt="Featured 3D model"
          />
          <ThreeDViewer
            modelUrl={modelUrl}
            style={{ maxWidth: "600px", height: "500px" }}
            alt="Featured 3D model"
          />
        </div>
        <p>{t('experience')}</p>
        <Link to="/products" className="cta-button">
          {t('exploreModels')}
        </Link>
      </section>

      <section className="available-now" style={{ marginTop: '2rem' }}>
        <h2>Highlighted</h2>
        {highlighted.length > 0 ? (
          <>
            <ProductCarousel products={highlighted} title="Highlighted products" />
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/products" className="cta-button">View All Products</Link>
            </div>
          </>
        ) : (
          <p className="muted">No products currently available.</p>
        )}
      </section>
    </div>
  );
}

export default LandingPage;
