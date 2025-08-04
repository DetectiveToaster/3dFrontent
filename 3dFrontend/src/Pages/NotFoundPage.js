import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Helmet>
        <title>404 - Page Not Found - 3D Figures Store</title>
        <meta name="description" content={t('pageNotFoundMessage')} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('pageNotFoundTitle')}</h2>
      <p>{t('pageNotFoundMessage')}</p>
    </div>
  );
}

export default NotFoundPage;
