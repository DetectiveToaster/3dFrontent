import React, { useState } from 'react';
import api from '../Services/api';
import { useCart } from '../context/CartContext';

function CreditCardCheckoutForm({ user, form, cartItems, total, onSuccess }) {
  const { clearCart } = useCart();
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        total_cost: total,
        products: cartItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
        card,
      };
      if (user) {
        payload.user_id = user.id;
        payload.address = form.address;
      } else {
        payload.guest_email = form.email;
        payload.guest_address = form.address;
      }
      await api.post('/payments/charge-card', payload);
      clearCart();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="credit-card-form" onSubmit={handleSubmit}>
      <label>
        Name on Card:
        <input
          name="name"
          value={card.name}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Card Number:
        <input
          name="number"
          value={card.number}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Expiry Date (MM/YY):
        <input
          name="expiry"
          value={card.expiry}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        CVC:
        <input
          name="cvc"
          value={card.cvc}
          onChange={handleChange}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

export default CreditCardCheckoutForm;
