import api from './api';

export function createPaypalOrder(amount, returnUrl, cancelUrl) {
  const payload = { amount };
  if (returnUrl) payload.return_url = returnUrl;
  if (cancelUrl) payload.cancel_url = cancelUrl;
  return api
    .post('/paypal/create-order', payload)
    .then((res) => res.data);
}

export function createPaypalOrderFromOrderId(orderId) {
  return api
    .post(`/paypal/order/${orderId}`)
    .then((res) => res.data);
}

export function capturePaypalOrder(paypalOrderId) {
  return api
    .post(`/paypal/capture-order/${paypalOrderId}`)
    .then((res) => res.data);
}
