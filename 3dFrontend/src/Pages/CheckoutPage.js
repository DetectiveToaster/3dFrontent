// src/pages/CheckoutPage.js

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Helmet } from 'react-helmet-async';
import PaypalCheckoutButton from "../Components/PaypalCheckoutButton";
import CreditCardCheckoutForm from "../Components/CreditCardCheckoutForm";
import "../styles/CheckoutPage.css";
import { useLanguage } from '../context/LanguageContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useConsent } from '../context/ConsentContext';
import { deriveCartCurrency, formatCurrency, getUnitPrice } from '../utils/pricing';

function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { allow } = useConsent();
  const [form, setForm] = useState({
    email: user?.email || "",
    address: user?.address || "",
  });
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("paypal");
  const { t } = useLanguage();

  const getProduct = (item) => item.product || item;
  const currency = deriveCartCurrency(cartItems);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const total = cartItems.reduce((sum, item) => {
    const unit = getUnitPrice(item);
    return sum + unit * item.quantity;
  }, 0);

  const handleSuccess = (info = {}) => {
    const orderNumber = info.orderNumber || info.order_id;
    const currencyCode = info.currency || currency;
    const parts = [`${t('paymentSuccess')}${currencyCode ? ` (${currencyCode})` : ''}`];
    if (orderNumber) {
      parts.push(`Order #: ${orderNumber}`);
    }
    setStatus(parts.join(' • '));
  };

  return (
    <div className="checkout-page">
      <Helmet>
        <title>Checkout - 3D Figures Store</title>
        <meta name="description" content="Complete your purchase securely." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('checkout')}</h2>
      <form>
        {!user && (
          <>
            <label>
              {t('email')}: <input name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              {t('address')}: <input name="address" value={form.address} onChange={handleChange} required />
            </label>
          </>
        )}
        {user && (
          <>
            <p>{t('email')}: <b>{form.email}</b></p>
            <p>{t('address')}: <input name="address" value={form.address} onChange={handleChange} required /></p>
          </>
        )}
        <div className="order-summary">
          <h3>{t('orderSummary')}</h3>
          <ul>
            {cartItems.map((item) => {
              const prod = getProduct(item);
              const unitPrice = getUnitPrice(item);
              const lineTotal = unitPrice * item.quantity;
              return (
                <li key={item.product_id}>
                  {prod.name} x {item.quantity} ({formatCurrency(lineTotal, currency)})
                </li>
              );
            })}
          </ul>
          <p><b>{t('total')}: {formatCurrency(total, currency)} ({currency})</b></p>
        </div>
        <div className="payment-method">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={method === "paypal"}
              onChange={() => setMethod("paypal")}
            />
            {t('paypal')}
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={method === "card"}
              onChange={() => setMethod("card")}
            />
            {t('creditCard')}
          </label>
        </div>
        {method === "paypal" ? (
          // Load PayPal script only on checkout and only when specifically needed.
          // Considered necessary to complete payment initiated by the user.
          <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test' }}>
            <PaypalCheckoutButton
              user={user}
              form={form}
              cartItems={cartItems}
              total={total}
              onSuccess={handleSuccess}
            />
          </PayPalScriptProvider>
        ) : (
          <CreditCardCheckoutForm
            user={user}
            form={form}
            cartItems={cartItems}
            total={total}
            onSuccess={handleSuccess}
          />
        )}
        {!allow('functional') && method !== 'paypal' && (
          <p style={{ marginTop: 8, fontSize: '0.9rem', color: '#555' }}>
            Note: Enabling functional cookies improves checkout experience (e.g., saved details).
          </p>
        )}
        {status && <div className="status">{status}</div>}
      </form>
    </div>
  );
}

export default CheckoutPage;
