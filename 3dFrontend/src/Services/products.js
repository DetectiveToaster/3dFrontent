import api from './api';

// Create products by type per new API
export async function create3DProduct(payload) {
  const body = {
    name: payload.name,
    product_type: '3d',
    quantity: payload.quantity,
    price: payload.price,
    discount: payload.discount,
    discounted_price: payload.discounted_price,
    height: payload.height,
    length: payload.length,
    width: payload.width,
    is_visible: payload.is_visible,
  };
  const res = await api.post('/products/3d', body);
  return res.data;
}

export async function createCardProduct(payload) {
  const body = {
    name: payload.name,
    product_type: 'card',
    quantity: payload.quantity,
    price: payload.price,
    discount: payload.discount,
    discounted_price: payload.discounted_price,
    series: payload.series,
    rarity: payload.rarity,
    condition: payload.condition,
    is_visible: payload.is_visible,
  };
  const res = await api.post('/products/card', body);
  return res.data;
}

export async function createManualProduct(payload) {
  const body = {
    name: payload.name,
    product_type: 'manual',
    quantity: payload.quantity,
    price: payload.price,
    discount: payload.discount,
    discounted_price: payload.discounted_price,
    page_count: payload.page_count,
    language: payload.language,
    format: payload.format,
    is_visible: payload.is_visible,
  };
  const res = await api.post('/products/manual', body);
  return res.data;
}

// Media
export async function uploadProductMedia({ product_id, media_type, file }) {
  const form = new FormData();
  form.append('product_id', String(product_id));
  form.append('media_type', media_type); // image | model | pdf
  form.append('file', file);
  const res = await api.post('/product_media/upload/', form);
  return res.data;
}

export async function listProductMedia(product_id) {
  const res = await api.get(`/product_media/product/${product_id}`);
  return res.data;
}

export async function createProductMediaJSON({ product_id, kind, filename, content_type, role }) {
  const body = { product_id, kind, filename, content_type };
  if (role) body.role = role;
  const res = await api.post('/product_media/', body);
  return res.data;
}

// Admin management helpers
export async function getAllProducts(params = {}) {
  const res = await api.get('/products/all', { params });
  return res.data;
}

export async function setProductVisibility(productId, isVisible) {
  const res = await api.patch(`/products/${productId}/visibility`, { is_visible: !!isVisible });
  return res.data;
}

export async function updateProductPrice(productId, price) {
  const res = await api.patch(`/products/${productId}/price`, { price: Number(price) });
  return res.data;
}

export async function applyProductDiscount(productId, mode, value) {
  const res = await api.patch(`/products/${productId}/discount`, { mode, value: Number(value) });
  return res.data;
}

export async function deleteProductMedia(mediaId) {
  const res = await api.delete(`/product_media/${mediaId}`);
  return res.data;
}
