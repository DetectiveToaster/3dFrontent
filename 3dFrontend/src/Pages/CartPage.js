// src/pages/CartPage.js

import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import "../styles/CartPage.css";
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { deriveCartCurrency, formatCurrency, getUnitPrice } from '../utils/pricing';

function CartPage() {
  const { t } = useLanguage();
  const { cartItems, updateCartItem, removeCartItem } = useCart();
  const currency = deriveCartCurrency(cartItems, 'EUR');
  const subtotal = cartItems.reduce((sum, item) => sum + getUnitPrice(item) * Number(item.quantity || 1), 0);

  const updateQuantity = (item, value) => {
    const quantity = Number(value);
    const productId = item.product_id ?? item.product?.id ?? item.id;
    if (!productId || Number.isNaN(quantity)) return;
    if (quantity <= 0) {
      removeCartItem(productId);
      return;
    }
    updateCartItem(productId, quantity);
  };

  return (
    <div className="cart-page">
      <Helmet>
        <title>Your Cart - 3D Figures Store</title>
        <meta name="description" content="View and manage items in your shopping cart." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('yourCart')}</h2>
      {cartItems.length === 0 ? (
        <>
          <p>Your cart is empty.</p>
          <Link to="/products">{t('continueShopping')}</Link>
        </>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const product = item.product || item;
                const productId = item.product_id ?? product.id ?? item.id;
                const quantity = Number(item.quantity || 1);
                const unitPrice = getUnitPrice(item);
                return (
                  <tr key={productId}>
                    <td>
                      <Link to={`/products/${productId}`}>{product.name || `Product #${productId}`}</Link>
                    </td>
                    <td>{formatCurrency(unitPrice, currency)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => updateQuantity(item, e.target.value)}
                        aria-label={`Quantity for ${product.name || productId}`}
                      />
                    </td>
                    <td>{formatCurrency(unitPrice * quantity, currency)}</td>
                    <td>
                      <button type="button" onClick={() => removeCartItem(productId)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="cart-summary">
            <strong>Subtotal:</strong> {formatCurrency(subtotal, currency)}
          </div>
          <div className="cart-actions">
            <Link to="/products">{t('continueShopping')}</Link>
            <Link className="checkout-link" to="/checkout">Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
