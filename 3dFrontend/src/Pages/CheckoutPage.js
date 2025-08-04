// src/pages/CheckoutPage.js

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Helmet } from 'react-helmet-async';
import PaypalCheckoutButton from "../Components/PaypalCheckoutButton";
import CreditCardCheckoutForm from "../Components/CreditCardCheckoutForm";
import "../styles/CheckoutPage.css";
import { useLanguage } from '../context/LanguageContext';

function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [form, setForm] = useState({
    email: user?.email || "",
    address: user?.address || "",
  });
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("paypal");
  const { t } = useLanguage();

  const getProduct = (item) => item.product || item;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const total = cartItems.reduce((sum, item) =>
    sum + (getProduct(item).selling_cost * item.quantity), 0
  );

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
              return (
                <li key={item.product_id}>
                  {prod.name} x {item.quantity} (${(prod.selling_cost * item.quantity).toFixed(2)})
                </li>
              );
            })}
          </ul>
          <p><b>{t('total')}: ${total.toFixed(2)}</b></p>
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
          <PaypalCheckoutButton
            user={user}
            form={form}
            cartItems={cartItems}
            total={total}
            onSuccess={() => setStatus(t('paymentSuccess'))}
          />
        ) : (
          <CreditCardCheckoutForm
            user={user}
            form={form}
            cartItems={cartItems}
            total={total}
            onSuccess={() => setStatus(t('paymentSuccess'))}
          />
        )}
        {status && <div className="status">{status}</div>}
      </form>
    </div>
  );
}

export default CheckoutPage;
