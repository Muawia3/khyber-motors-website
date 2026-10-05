import { apiFetch } from './api';

export const galleryService = {
  getGalleryItems: async (admin = false) => {
    try {
      const endpoint = admin ? '/gallery/all' : '/gallery';
      const res = await apiFetch(endpoint);
      return res?.success ? res.data : [];
    } catch (err) {
      console.error('Fetch gallery error:', err);
      return [];
    }
  },

  createGalleryItem: async (data) => {
    return apiFetch('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGalleryItem: async (id, data) => {
    return apiFetch(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGalleryItem: async (id) => {
    return apiFetch(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  reorderGalleryItems: async (items) => {
    return apiFetch('/gallery/reorder/bulk', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

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
