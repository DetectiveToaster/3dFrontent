// src/pages/CheckoutPage.js

import React from "react";
import { Helmet } from 'react-helmet-async';
import "../styles/CheckoutPage.css";
import { useLanguage } from '../context/LanguageContext';
import { CONTACT_EMAIL } from '../config/showcase';

function CheckoutPage() {
  const { t } = useLanguage();

  return (
    <div className="checkout-page">
      <Helmet>
        <title>Checkout - 3D Figures Store</title>
        <meta name="description" content="Complete your purchase securely." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('checkout')}</h2>
      <p style={{ maxWidth: 560 }}>
        This deployment is a product showcase only. Checkout and pricing are disabled.
        Email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the item you like,
        and we&apos;ll share availability and pricing details.
      </p>
      <p>
        <a href="/products">Back to products</a>
      </p>
    </div>
  );
}

export default CheckoutPage;
