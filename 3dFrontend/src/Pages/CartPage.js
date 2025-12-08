// src/pages/CartPage.js

import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import "../styles/CartPage.css";
import { useLanguage } from '../context/LanguageContext';
import { CONTACT_EMAIL } from '../config/showcase';

function CartPage() {
  const { t } = useLanguage();

  return (
    <div className="cart-page">
      <Helmet>
        <title>Your Cart - 3D Figures Store</title>
        <meta name="description" content="View and manage items in your shopping cart." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('yourCart')}</h2>
      <p style={{ maxWidth: 520 }}>
        This is a showcase-only release. Pricing and checkout are disabled.
        If you&apos;re interested in a piece, email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll follow up with details.
      </p>
      <Link to="/products">{t('continueShopping')}</Link>
    </div>
  );
}

export default CartPage;
