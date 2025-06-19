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

  // Attach token to axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    localStorage.setItem('auth_token', res.data.token);
  };

  const register = async (email, password) => {
    const res = await api.post('/auth/register/', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    localStorage.setItem('auth_token', res.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
