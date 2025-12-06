import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../Services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loadingUser, setLoadingUser] = useState(false);

  // Attach token to axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Helper to refresh user profile on demand
  const refreshUser = async () => {
    if (!token) return null;
    setLoadingUser(true);
    try {
      const meRes = await api.get('/users/me/');
      setUser(meRes.data);
      localStorage.setItem('auth_user', JSON.stringify(meRes.data));
      return meRes.data;
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
      }
      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  // Refresh user profile on mount or when token changes
  useEffect(() => {
    let canceled = false;
    async function run() {
      if (!token) return;
      setLoadingUser(true);
      try {
        const meRes = await api.get('/users/me/');
        if (canceled) return;
        setUser(meRes.data);
        localStorage.setItem('auth_user', JSON.stringify(meRes.data));
      } catch (err) {
        if (err?.response?.status === 401) {
          logout();
        }
      } finally {
        if (!canceled) setLoadingUser(false);
      }
    }
    run();
    return () => { canceled = true; };
  }, [token]);

  const login = async (email, password) => {
    // OAuth2 Password flow: POST /token (x-www-form-urlencoded)
    const body = new URLSearchParams({ username: email, password });
    const tokenRes = await api.post('/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const accessToken = tokenRes.data?.access_token;
    setToken(accessToken);
    localStorage.setItem('auth_token', accessToken);

    // Attach token and fetch user profile
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    const meRes = await api.get('/users/me/');
    setUser(meRes.data);
    localStorage.setItem('auth_user', JSON.stringify(meRes.data));
  };

  const register = async (email, password, address = '') => {
    // Create user per API spec
    await api.post('/users/', { email, password, address });
    // Then log in to obtain token and profile
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loadingUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
