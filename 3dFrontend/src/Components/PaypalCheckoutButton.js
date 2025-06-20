import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { createPaypalOrder, capturePaypalOrder } from '../Services/paypal';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function PaypalCheckoutButton({ user, form, cartItems, total, onSuccess }) {
  const { clearCart } = useCart();

  const createOrder = () => {
    return createPaypalOrder(total)
      .then((data) => data.id);
  };

  const onApproveHandler = (data) => {
    return capturePaypalOrder(data.orderID)
      .then(() => {
        clearCart();
        toast.success('Payment successful');
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
