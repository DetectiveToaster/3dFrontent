// src/pages/LandingPage.js

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ThreeDViewer from '../Components/ThreeDViewer';
import '../styles/LandingPage.css';
import { useLanguage } from '../context/LanguageContext';

function LandingPage() {
  const modelUrl =
    "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  const { t } = useLanguage();
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
    </div>
  );
}

export default LandingPage;
