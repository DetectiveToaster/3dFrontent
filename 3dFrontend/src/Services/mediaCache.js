import { get, set, del } from 'idb-keyval';
import api from './api';

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function fetchMediaBlob(id) {
  const response = await api.get(`/media/${id}`, { responseType: 'blob' });
  return response.data;
}

export async function getMediaBlob(id) {
  const key = `media-${id}`;
  try {
    const cached = await get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.blob;
    }
    if (cached) {
      await del(key);
    }
  } catch (err) {
    console.warn('Media cache read failed', err);
  }

  const blob = await fetchMediaBlob(id);
  try {
    await set(key, { blob, timestamp: Date.now() });
  } catch (err) {
    console.warn('Media cache write failed', err);
  }
  return blob;
}

export async function clearMediaCache() {
  // Not used currently, but provided for manual invalidation if needed
  // Iterate through keys and remove expired entries
  const now = Date.now();
  const keys = await (await import('idb-keyval')).keys();
  await Promise.all(
    keys
      .filter((k) => typeof k === 'string' && k.startsWith('media-'))
      .map(async (k) => {
        const item = await get(k);
        if (!item || now - item.timestamp >= CACHE_DURATION) {
          await del(k);
        }
      })
  );
}
