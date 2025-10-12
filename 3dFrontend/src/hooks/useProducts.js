import { useEffect, useState } from 'react';
import api from '../Services/api';

/**
 * Fetches products from the public products endpoint.
 * Falls back to an empty list on error.
 */
export default function useProducts(options = {}) {
  const { skip = 0, limit = 48, enabled = true } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .get('/products/', { params: { skip, limit } })
      .then((response) => {
        if (!alive) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setData(list);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err);
        setData([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [enabled, skip, limit]);

  return { data, loading, error };
}
