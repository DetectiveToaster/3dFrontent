import api from './api';

export function createPaypalOrder(amount, returnUrl, cancelUrl) {
  const payload = { amount };
  if (returnUrl) payload.return_url = returnUrl;
  if (cancelUrl) payload.cancel_url = cancelUrl;
  return api
    .post('/paypal/create-order', payload)
    .then((res) => res.data);
}

export function capturePaypalOrder(orderId) {
  return api
    .post('/paypal/capture-order', { order_id: orderId })
    .then((res) => res.data);
}
