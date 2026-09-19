/**
 * API client service for communicating with Node Express REST API.
 */
const API_BASE = '/api';

export const getToken = () => localStorage.getItem('jac_admin_jwt_token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('jac_admin_jwt_token', token);
  } else {
    localStorage.removeItem('jac_admin_jwt_token');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If uploading FormData, delete Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const rawText = await response.text().catch(() => '');
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText || `Server returned non-JSON response (${response.status})` };
      }
    }
  }

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    setToken(null);
    localStorage.removeItem('jac_admin_user');
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};
