// src/pages/CartPage.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { useCart } from "../context/CartContext";
import "../styles/CartPage.css";
import { useLanguage } from '../context/LanguageContext';

function CartPage() {
  const { cartItems, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getProduct = (item) => item.product || item; // fallback for user/guest

  const total = cartItems.reduce((sum, item) =>
    sum + (getProduct(item).selling_cost * item.quantity), 0
  );

  return (
    <div className="cart-page">
      <Helmet>
        <title>Your Cart - 3D Figures Store</title>
        <meta name="description" content="View and manage items in your shopping cart." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('yourCart')}</h2>
      {cartItems.length === 0 ? (
        <p>{t('cartEmpty')}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t('product')}</th><th>{t('qty')}</th><th>{t('unitPrice')}</th><th>{t('subtotal')}</th><th></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => {
              const prod = getProduct(item);
              return (
                <tr key={item.product_id}>
                  <td>{prod.name}</td>
                  <td>
                    <label htmlFor={`qty-${item.product_id}`} className="sr-only">
                      {`Quantity for ${prod.name}`}
                    </label>
                    <input
                      id={`qty-${item.product_id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      aria-label={`Quantity for ${prod.name}`}
                      onChange={e => updateCartItem(item.product_id, parseInt(e.target.value))}
                      style={{ width: 50 }}
                    />
                  </td>
                  <td>${parseFloat(prod.selling_cost).toFixed(2)}</td>
                  <td>${(prod.selling_cost * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeCartItem(item.product_id)}>{t('remove')}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="cart-summary">
        <p>{t('total')}: <b>${total.toFixed(2)}</b></p>
        {cartItems.length > 0 && (
          <button onClick={() => navigate("/checkout")}>{t('proceedCheckout')}</button>
        )}
      </div>
      <Link to="/products">{t('continueShopping')}</Link>
    </div>
  );
}

export default CartPage;
