/**
 * Utility to resolve file, image, and document URLs dynamically.
 * Works seamlessly across Desktop, Mobile browsers (local network IP), and Production deployments.
 */

export const getFileUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;

  let trimmed = url.trim();
  if (!trimmed) return fallback;

  // 1. Data URIs and Blob URIs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 2. Strip hardcoded localhost / 127.0.0.1 origins from DB records or API responses so mobile devices don't fail
  trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');

  // 3. Return external HTTP/HTTPS URLs (e.g. Cloudinary, Wikimedia, S3)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 4. Ensure clean relative path with leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // 5. Environment configured backend API base URL (for decoupled production setups)
  const envApiUrl = typeof import.meta !== 'undefined' && import.meta?.env
    ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL)
    : undefined;
  if (envApiUrl) {
    const cleanBase = envApiUrl.replace(/\/+$/, '');
    return `${cleanBase}${cleanPath}`;
  }

  // 6. Return clean relative path directly (handled by Vite dev proxy on local network & Vercel serverless)
  return cleanPath;
};

