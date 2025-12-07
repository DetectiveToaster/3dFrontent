import React, { useRef } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { capturePaypalOrder, createPaypalOrderFromOrderId } from '../Services/paypal';
import { createGuestOrder, createUserOrder, buildGuestProducts } from '../Services/orders';
import api from '../Services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { deriveCartCurrency } from '../utils/pricing';

function PaypalCheckoutButton({ user, form, cartItems, total, onSuccess }) {
  const { clearCart } = useCart();
  const created = useRef({ orderId: null, paypalOrderId: null });
  const currency = deriveCartCurrency(cartItems);

  const createOrder = async () => {
    try {
      // Avoid duplicate order creation
      if (created.current.paypalOrderId) return created.current.paypalOrderId;

      // 1) Create internal order (user vs guest)
      let internalOrder;
      const shipping = { address: form?.address || user?.address || '' };
      if (user) {
        internalOrder = await createUserOrder({
          userId: user.id,
          totalCost: total,
          status: 'PENDING',
          currency,
          shipping,
        });
      } else {
        const products = buildGuestProducts(cartItems);
        internalOrder = await createGuestOrder({
          email: form.email,
          address: form.address,
          totalCost: total,
          status: 'PENDING',
          products,
          currency,
          shipping,
        });
      }
      created.current.orderId = internalOrder.id;
      created.current.orderNumber = internalOrder.order_number || internalOrder.orderNumber;
      created.current.currency = internalOrder.currency || currency;

      // 2) Create PayPal order from internal order id
      const pp = await createPaypalOrderFromOrderId(internalOrder.id);
      created.current.paypalOrderId = pp.id || pp.order_id || pp.paypal_order_id;
      return created.current.paypalOrderId;
    } catch (err) {
      console.error('Failed to create order', err);
      toast.error('Failed to create order');
      throw err;
    }
  };

  const onApproveHandler = (data) => {
    return capturePaypalOrder(data.orderID)
      .then(async () => {
        // Clear cart: guest clears local; user clears backend cart
        if (user) {
          try {
            const res = await api.get('/cart/');
            const items = Array.isArray(res.data) ? res.data : [];
            await Promise.all(items.map((i) => api.delete(`/cart/${i.id}`)));
          } catch (e) {
            console.warn('Failed clearing user cart', e);
          }
        } else {
          clearCart();
        }
        toast.success('Payment successful');
        if (onSuccess) {
          onSuccess({
            orderId: created.current.orderId,
            orderNumber: created.current.orderNumber,
            currency: created.current.currency || currency,
          });
        }
      })
      .catch((err) => {
        console.error('Capture failed', err);
        toast.error('Payment capture failed');
        throw err;
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
