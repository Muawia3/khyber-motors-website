import React, { useState, useEffect } from 'react';
import { apiFetch, getToken, setToken } from '../services/api';
import { AuthContext } from './AuthContextObject';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/auth/me');
        if (res && res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('jac_admin_user', JSON.stringify(res.data));
        } else {
          setToken(null);
          setUser(null);
          localStorage.removeItem('jac_admin_user');
        }
      } catch (err) {
        console.warn('Auth verification failed:', err.message);
        setToken(null);
        setUser(null);
        localStorage.removeItem('jac_admin_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('jac_admin_user');
    };

    window.addEventListener('jac_admin_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('jac_admin_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res && res.success && res.data) {
        const { token, user: userData } = res.data;
        setToken(token);
        setUser(userData);
        localStorage.setItem('jac_admin_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, error: res?.error || 'Invalid email or password.' };
    } catch (err) {
      return { success: false, error: err.message || 'Authentication failed.' };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API notice:', e.message);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('jac_admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
