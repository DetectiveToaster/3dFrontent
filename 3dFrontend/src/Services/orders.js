import api from './api';

export async function createUserOrder(payload) {
  const res = await api.post('/orders/', payload);
  return res.data;
}

export async function createGuestOrder(payload) {
  const res = await api.post('/guest_orders/', payload);
  return res.data;
}

export function buildOrderProducts(cartItems) {
  return cartItems.map((item) => ({
    product_id: item.product_id ?? item.product?.id ?? item.id,
    quantity: Number(item.quantity || 1),
  }));
}
