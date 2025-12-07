// Utility helpers for working with cart prices and currencies

export function getUnitPrice(item) {
  if (!item) return 0;
  // Prefer explicit unit price if present (e.g., locked-in line item)
  const raw =
    item.unit_price ??
    item?.product?.unit_price ??
    item?.product?.discounted_price ??
    item?.product?.price ??
    item.discounted_price ??
    item.price;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

export function getItemCurrency(item, fallback = 'USD') {
  const code =
    item?.currency ||
    item?.product?.currency ||
    fallback;
  return typeof code === 'string' && code.trim() ? code : fallback;
}

export function deriveCartCurrency(cartItems, fallback = 'USD') {
  if (!Array.isArray(cartItems)) return fallback;
  for (const item of cartItems) {
    const code = getItemCurrency(item, null);
    if (code) return code;
  }
  return fallback;
}

export function formatCurrency(amount, currency = 'USD') {
  const value = Number(amount ?? 0);
  const safeCurrency = currency || 'USD';
  if (!Number.isFinite(value)) return `$0.00`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (err) {
    return `$${value.toFixed(2)}`;
  }
}
