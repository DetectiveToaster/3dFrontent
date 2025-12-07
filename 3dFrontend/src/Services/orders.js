import api from './api';
import { deriveCartCurrency, getItemCurrency, getUnitPrice } from '../utils/pricing';

export async function createUserOrder({
  userId,
  totalCost,
  status = 'PENDING',
  currency,
  shipping,
  orderNumber,
}) {
  const payload = {
    total_cost: totalCost,
    status,
    currency,
    shipping: shipping || null,
  };
  if (userId) payload.user_id = userId;
  if (orderNumber) payload.order_number = orderNumber;
  const res = await api.post('/orders/', payload);
  return res.data; // expects { id, ... }
}

export async function createGuestOrder({
  email,
  address,
  totalCost,
  status = 'PENDING',
  products,
  currency,
  shipping,
  orderNumber,
}) {
  const payload = {
    guest_email: email,
    guest_address: address,
    total_cost: totalCost,
    status,
    products: products.map((p) => ({
      product_id: p.product_id,
      quantity: p.quantity,
      unit_price: p.unit_price,
      currency: p.currency || currency,
    })),
    currency,
    shipping: shipping || null,
  };
  if (orderNumber) payload.order_number = orderNumber;
  const res = await api.post('/guest_orders/', payload);
  return res.data; // expects { id, ... }
}

export function buildGuestProducts(cartItems) {
  const currency = deriveCartCurrency(cartItems);
  return cartItems.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: getUnitPrice(item),
    currency: getItemCurrency(item, currency),
  }));
}
