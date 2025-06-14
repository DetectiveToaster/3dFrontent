// src/pages/CheckoutPage.js

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../Services/api";
import "../styles/CheckoutPage.css";

function CheckoutPage(props) {
  const user = props.user || null;
  const { cartItems, clearCart } = useCart();
  const [form, setForm] = useState({
    email: user?.email || "",
    address: user?.address || "",
  });
  const [status, setStatus] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const getProduct = (item) => item.product || item;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const total = cartItems.reduce((sum, item) =>
    sum + (getProduct(item).selling_cost * item.quantity), 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    try {
      if (user) {
        // User order
        await api.post("/orders/", {
          user_id: user.id,
          total_cost: total,
          status: "pending",
          products: cartItems.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        });
      } else {
        // Guest order
        await api.post("/guest_orders/", {
          guest_email: form.email,
          guest_address: form.address,
          total_cost: total,
          status: "pending",
          products: cartItems.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        });
      }
      setStatus("Order placed successfully!");
      clearCart();
    } catch (err) {
      setStatus("Error placing order. Please try again.");
    }
    setPlacingOrder(false);
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        {!user && (
          <>
            <label>
              Email: <input name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Address: <input name="address" value={form.address} onChange={handleChange} required />
            </label>
          </>
        )}
        {user && (
          <>
            <p>Email: <b>{form.email}</b></p>
            <p>Address: <input name="address" value={form.address} onChange={handleChange} required /></p>
          </>
        )}
        <div className="order-summary">
          <h3>Order Summary</h3>
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
          <p><b>Total: ${total.toFixed(2)}</b></p>
        </div>
        <button type="submit" disabled={placingOrder}>{placingOrder ? "Placing..." : "Place Order"}</button>
        {status && <div className="status">{status}</div>}
      </form>
    </div>
  );
}

export default CheckoutPage;
