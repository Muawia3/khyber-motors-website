/**
 * Utility to resolve file, image, and document URLs dynamically.
 * Works seamlessly in Development (Vite dev server) and Production deployments.
 */

export const getFileUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Return full URLs, data URIs, or blob URIs as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Ensure clean relative path with leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // Environment configured backend API base URL
  const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL;
  if (envApiUrl) {
    const cleanBase = envApiUrl.replace(/\/+$/, '');
    return `${cleanBase}${cleanPath}`;
  }

  // Only in local development on localhost, route uploaded files (/uploads/) to local backend server (port 5000)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && cleanPath.startsWith('/uploads')) {
    return `http://localhost:5000${cleanPath}`;
  }

  // For static public assets and Vercel static deployments, return clean relative path directly
  return cleanPath;
};
