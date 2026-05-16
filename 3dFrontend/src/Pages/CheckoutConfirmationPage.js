import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../styles/CheckoutPage.css';
import { formatCurrency } from '../utils/pricing';

function readStoredOrder() {
  try {
    const raw = sessionStorage.getItem('last_order_confirmation');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function CheckoutConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order || readStoredOrder();
  const estimate = order?.estimate || {};
  const currency = order?.currency || estimate.currency || 'EUR';
  const subtotal = order?.subtotal ?? estimate.subtotal;
  const shippingCost = order?.shipping_cost ?? estimate.shipping_cost;
  const totalCost = order?.total_cost ?? estimate.total_cost;

  return (
    <div className="checkout-page checkout-confirmation">
      <Helmet>
        <title>Order Confirmation - 3D Figures Store</title>
        <meta name="description" content="Manual payment order confirmation." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>Order confirmation</h2>
      {!order ? (
        <>
          <p>No recent order confirmation was found.</p>
          <Link to="/products">Back to products</Link>
        </>
      ) : (
        <>
          <div className="confirmation-panel">
            <p><strong>Order number:</strong> {order.order_number || `#${order.id}`}</p>
            <p><strong>Status:</strong> {order.status || 'AWAITING_PAYMENT'}</p>
            <p><strong>Payment status:</strong> {order.payment_status || 'PENDING'}</p>
            <p><strong>Payment method:</strong> {formatPaymentMethod(order.payment_method)}</p>
            {order.payment_reference && <p><strong>Payment reference:</strong> {order.payment_reference}</p>}
          </div>

          {order.payment_instructions && (
            <div className="confirmation-panel">
              <h3>Payment instructions</h3>
              <p>{order.payment_instructions}</p>
              <p>Use the order number or payment reference when paying by Bizum or bank transfer.</p>
            </div>
          )}

          <div className="order-summary">
            <h3>Totals</h3>
            <p><strong>Subtotal:</strong> {formatCurrency(subtotal, currency)}</p>
            <p><strong>Shipping:</strong> {formatCurrency(shippingCost, currency)}</p>
            <p><strong>Total:</strong> {formatCurrency(totalCost, currency)}</p>
            <p><strong>Currency:</strong> {currency}</p>
          </div>
          <Link to="/products">Back to products</Link>
        </>
      )}
    </div>
  );
}

function formatPaymentMethod(method) {
  if (method === 'bank_transfer') return 'Bank transfer';
  if (method === 'bizum') return 'Bizum';
  if (method === 'manual') return 'Manual';
  return method || 'Manual';
}

export default CheckoutConfirmationPage;
