import { apiFetch } from './api';

let heroImagesCache = null;

export const heroImageService = {
  getCachedHeroImages: () => heroImagesCache,

  // GET hero images (activeOnly = true for public site, false for admin)
  getHeroImages: async (activeOnly = false) => {
    try {
      const endpoint = activeOnly ? '/hero-images?activeOnly=true' : '/hero-images';
      const res = await apiFetch(endpoint);
      if (res && res.success && Array.isArray(res.data)) {
        if (activeOnly) heroImagesCache = res.data;
        return res.data;
      }
    } catch (err) {
      console.warn('apiFetch getHeroImages error:', err.message);
    }
    return activeOnly ? (heroImagesCache || []) : [];
  },

  // Create hero image (Admin protected)
  createHeroImage: async (data) => {
    const res = await apiFetch('/hero-images', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to create hero image.');
  },

  // Update hero image (Admin protected)
  updateHeroImage: async (id, data) => {
    const res = await apiFetch(`/hero-images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to update hero image.');
  },

  // Reorder hero images (Admin protected)
  reorderHeroImages: async (items) => {
    const res = await apiFetch('/hero-images/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to reorder hero images.');
  },

  // Delete hero image (Admin protected)
  deleteHeroImage: async (id) => {
    const res = await apiFetch(`/hero-images/${id}`, {
      method: 'DELETE',
    });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to delete hero image.');
  },

  // Upload image file to server (Admin protected)
  uploadImageFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/upload/single', {
      method: 'POST',
      body: formData,
    });

    if (res && res.success && (res.data?.url || res.url)) {
      return res.data?.url || res.url;
    }
    throw new Error(res?.error || 'Image file upload failed.');
  },
};

export default heroImageService;
