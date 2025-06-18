import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import api from '../Services/api';
import { useCart } from '../context/CartContext';

function PaypalCheckoutButton({ user, form, cartItems, total, onSuccess }) {
  const { clearCart } = useCart();

  const createOrder = () => {
    const payload = {
      total_cost: total,
      products: cartItems.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    };
    if (user) {
      payload.user_id = user.id;
      payload.address = form.address;
    } else {
      payload.guest_email = form.email;
      payload.guest_address = form.address;
    }
    return api.post('/payments/create-paypal-order', payload)
      .then(res => res.data.orderID);
  };

  const onApproveHandler = (data) => {
    return api.post('/payments/capture-paypal-order', { orderID: data.orderID })
      .then(() => {
        clearCart();
        if (onSuccess) onSuccess();
      });
  };

  return (
    <PayPalButtons
      createOrder={() => createOrder()}
      onApprove={onApproveHandler}
    />
  );
}

export default PaypalCheckoutButton;
