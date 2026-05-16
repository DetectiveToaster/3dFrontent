import api from './api';

export async function estimateManualShipping(payload) {
  const res = await api.post('/shipping/estimate', payload);
  return res.data;
}
