// src/pages/CartPage.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/CartPage.css";

function CartPage() {
  const { cartItems, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  const getProduct = (item) => item.product || item; // fallback for user/guest

  const total = cartItems.reduce((sum, item) =>
    sum + (getProduct(item).selling_cost * item.quantity), 0
  );

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th><th></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => {
              const prod = getProduct(item);
              return (
                <tr key={item.product_id}>
                  <td>{prod.name}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateCartItem(item.product_id, parseInt(e.target.value))}
                      style={{ width: 50 }}
                    />
                  </td>
                  <td>${parseFloat(prod.selling_cost).toFixed(2)}</td>
                  <td>${(prod.selling_cost * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeCartItem(item.product_id)}>Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="cart-summary">
        <p>Total: <b>${total.toFixed(2)}</b></p>
        {cartItems.length > 0 && (
          <button onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
        )}
      </div>
      <Link to="/products">Continue Shopping</Link>
    </div>
  );
}

export default CartPage;
