import api from './api';

export async function createUserOrder({ userId, totalCost, status = 'PENDING' }) {
  const payload = { total_cost: totalCost, status };
  if (userId) payload.user_id = userId;
  const res = await api.post('/orders/', payload);
  return res.data; // expects { id, ... }
}

export async function createGuestOrder({ email, address, totalCost, status = 'PENDING', products }) {
  const payload = {
    guest_email: email,
    guest_address: address,
    total_cost: totalCost,
    status,
    products: products.map(p => ({ product_id: p.product_id, quantity: p.quantity })),
  };
  const res = await api.post('/guest_orders/', payload);
  return res.data; // expects { id, ... }
}

export function buildGuestProducts(cartItems) {
  return cartItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
}

