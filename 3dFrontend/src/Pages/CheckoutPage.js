// src/pages/CheckoutPage.js

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { toast } from "react-toastify";
import "../styles/CheckoutPage.css";
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createGuestOrder, createUserOrder, buildOrderProducts } from '../Services/orders';
import { estimateManualShipping } from '../Services/shipping';
import { deriveCartCurrency, formatCurrency, getUnitPrice } from '../utils/pricing';

const DEFAULT_COUNTRY = 'ES';

function CheckoutPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const currency = deriveCartCurrency(cartItems, 'EUR');
  const products = useMemo(() => buildOrderProducts(cartItems), [cartItems]);
  const localSubtotal = cartItems.reduce((sum, item) => sum + getUnitPrice(item) * Number(item.quantity || 1), 0);

  const [form, setForm] = useState({
    guest_email: user?.email || '',
    phone: '',
    payment_method: 'bizum',
    customer_notes: '',
    shipping_address_line1: user?.address || '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country_code: DEFAULT_COUNTRY,
  });
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setEstimate(null);
  };

  const buildPayload = () => {
    const shippingSummary = [
      form.shipping_address_line1,
      form.shipping_address_line2,
      form.shipping_city,
      form.shipping_state,
      form.shipping_postal_code,
      form.shipping_country_code,
    ].filter(Boolean).join(', ');

    const payload = {
      currency,
      payment_method: form.payment_method,
      phone: form.phone || undefined,
      customer_notes: form.customer_notes || undefined,
      shipping_address_line1: form.shipping_address_line1 || undefined,
      shipping_address_line2: form.shipping_address_line2 || undefined,
      shipping_city: form.shipping_city || undefined,
      shipping_state: form.shipping_state || undefined,
      shipping_postal_code: form.shipping_postal_code || undefined,
      shipping_country_code: form.shipping_country_code || undefined,
      products,
    };

    if (!user) {
      payload.guest_email = form.guest_email;
      payload.guest_address = shippingSummary;
    }

    return payload;
  };

  const validate = () => {
    if (!products.length) {
      toast.warn('Your cart is empty');
      return false;
    }
    if (!user && !form.guest_email.trim()) {
      toast.warn('Email is required for guest checkout');
      return false;
    }
    if (!form.shipping_address_line1.trim() || !form.shipping_city.trim() || !form.shipping_postal_code.trim()) {
      toast.warn('Shipping address, city, and postal code are required');
      return false;
    }
    return true;
  };

  const requestEstimate = async () => {
    if (!validate()) return null;
    setEstimating(true);
    try {
      const data = await estimateManualShipping(buildPayload());
      setEstimate(data);
      return data;
    } catch (err) {
      console.error(err);
      toast.error('Failed to estimate shipping');
      return null;
    } finally {
      setEstimating(false);
    }
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const currentEstimate = estimate || await requestEstimate();
      if (!currentEstimate) return;
      const payload = buildPayload();
      const order = user ? await createUserOrder(payload) : await createGuestOrder(payload);
      const confirmation = { ...order, estimate: currentEstimate };
      sessionStorage.setItem('last_order_confirmation', JSON.stringify(confirmation));
      await clearCart();
      navigate('/checkout/confirmation', { state: { order: confirmation } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="checkout-page">
        <Helmet>
          <title>Checkout - 3D Figures Store</title>
          <meta name="description" content="Complete your purchase securely." />
          <link rel="canonical" href={window.location.href} />
        </Helmet>
        <h2>{t('checkout')}</h2>
        <p>Your cart is empty.</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  const quote = estimate || {};
  const quoteCurrency = quote.currency || currency;

  return (
    <div className="checkout-page checkout-wide">
      <Helmet>
        <title>Checkout - 3D Figures Store</title>
        <meta name="description" content="Complete your purchase securely." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('checkout')}</h2>
      <form onSubmit={submitOrder}>
        <section className="checkout-section">
          <h3>Contact</h3>
          {!user && (
            <label>Email
              <input name="guest_email" type="email" value={form.guest_email} onChange={onChange} required />
            </label>
          )}
          <label>Phone
            <input name="phone" value={form.phone} onChange={onChange} autoComplete="tel" />
          </label>
        </section>

        <section className="checkout-section">
          <h3>Shipping</h3>
          <div className="checkout-grid">
            <label>Address line 1
              <input name="shipping_address_line1" value={form.shipping_address_line1} onChange={onChange} required />
            </label>
            <label>Address line 2
              <input name="shipping_address_line2" value={form.shipping_address_line2} onChange={onChange} />
            </label>
            <label>City
              <input name="shipping_city" value={form.shipping_city} onChange={onChange} required />
            </label>
            <label>State / Province
              <input name="shipping_state" value={form.shipping_state} onChange={onChange} />
            </label>
            <label>Postal code
              <input name="shipping_postal_code" value={form.shipping_postal_code} onChange={onChange} required />
            </label>
            <label>Country code
              <input name="shipping_country_code" value={form.shipping_country_code} onChange={onChange} maxLength="2" />
            </label>
          </div>
        </section>

        <section className="checkout-section">
          <h3>Payment</h3>
          <label>Payment method
            <select name="payment_method" value={form.payment_method} onChange={onChange}>
              <option value="bizum">Bizum</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label>Customer notes
            <textarea name="customer_notes" value={form.customer_notes} onChange={onChange} rows="3" />
          </label>
        </section>

        <section className="order-summary">
          <h3>Order Summary</h3>
          <ul>
            {cartItems.map((item) => {
              const product = item.product || item;
              const productId = item.product_id ?? product.id ?? item.id;
              const quantity = Number(item.quantity || 1);
              return (
                <li key={productId}>
                  {product.name || `Product #${productId}`} x {quantity}
                </li>
              );
            })}
          </ul>
          <p><strong>Subtotal:</strong> {formatCurrency(quote.subtotal ?? localSubtotal, quoteCurrency)}</p>
          <p><strong>Shipping:</strong> {estimate ? formatCurrency(quote.shipping_cost, quoteCurrency) : 'Estimate required'}</p>
          <p><strong>Total:</strong> {estimate ? formatCurrency(quote.total_cost, quoteCurrency) : formatCurrency(localSubtotal, currency)}</p>
          {quote.estimated_delivery_days != null && (
            <p><strong>Estimated delivery:</strong> {quote.estimated_delivery_days} days</p>
          )}
        </section>

        <div className="checkout-actions">
          <button type="button" onClick={requestEstimate} disabled={estimating || submitting}>
            {estimating ? 'Estimating...' : 'Estimate shipping'}
          </button>
          <button type="submit" disabled={estimating || submitting}>
            {submitting ? 'Creating order...' : 'Place manual order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
