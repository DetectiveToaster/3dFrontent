import api from './api';

export async function listAdminOrders(params = {}) {
  const res = await api.get('/admin/orders', { params });
  return res.data;
}

export async function getAdminOrder(orderId) {
  const res = await api.get(`/admin/orders/${orderId}`);
  return res.data;
}

export async function getAdminOrderByNumber(orderNumber) {
  const res = await api.get(`/admin/orders/by-number/${orderNumber}`);
  return res.data;
}

export async function updateAdminOrder(orderId, payload) {
  const res = await api.patch(`/admin/orders/${orderId}`, payload);
  return res.data;
}

export async function markOrderPaid(orderId) {
  const res = await api.post(`/admin/orders/${orderId}/mark-paid`);
  return res.data;
}

export async function markOrderPaymentReceived(orderId, payload = {}) {
  const res = await api.patch(`/admin/orders/${orderId}/payment-received`, payload);
  return res.data;
}

export async function moveOrderToProduction(orderId, payload = {}) {
  const res = await api.patch(`/admin/orders/${orderId}/move-to-production`, payload);
  return res.data;
}

export async function markOrderReady(orderId, payload = {}) {
  const res = await api.patch(`/admin/orders/${orderId}/ready`, payload);
  return res.data;
}

export async function markOrderShipped(orderId, payload = {}) {
  const res = await api.patch(`/admin/orders/${orderId}/shipped`, payload);
  return res.data;
}

export async function cancelOrder(orderId, payload = {}) {
  const res = await api.patch(`/admin/orders/${orderId}/cancel`, payload);
  return res.data;
}
