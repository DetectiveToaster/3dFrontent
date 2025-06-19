// src/pages/CheckoutPage.js

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import PaypalCheckoutButton from "../Components/PaypalCheckoutButton";
import CreditCardCheckoutForm from "../Components/CreditCardCheckoutForm";
import "../styles/CheckoutPage.css";

function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [form, setForm] = useState({
    email: user?.email || "",
    address: user?.address || "",
  });
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("paypal");

  const getProduct = (item) => item.product || item;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const total = cartItems.reduce((sum, item) =>
    sum + (getProduct(item).selling_cost * item.quantity), 0
  );

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <form>
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
        <div className="payment-method">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={method === "paypal"}
              onChange={() => setMethod("paypal")}
            />
            PayPal
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={method === "card"}
              onChange={() => setMethod("card")}
            />
            Credit Card
          </label>
        </div>
        {method === "paypal" ? (
          <PaypalCheckoutButton
            user={user}
            form={form}
            cartItems={cartItems}
            total={total}
            onSuccess={() => setStatus("Payment successful!")}
          />
        ) : (
          <CreditCardCheckoutForm
            user={user}
            form={form}
            cartItems={cartItems}
            total={total}
            onSuccess={() => setStatus("Payment successful!")}
          />
        )}
        {status && <div className="status">{status}</div>}
      </form>
    </div>
  );
}

export default CheckoutPage;
