import { apiFetch } from './api';

export const reviewService = {
  // GET reviews (activeOnly = true for public site, false for admin)
  getReviews: async (activeOnly = false) => {
    try {
      const endpoint = activeOnly ? '/reviews?activeOnly=true' : '/reviews?all=true';
      const res = await apiFetch(endpoint);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('apiFetch getReviews error:', err.message);
    }
    return [];
  },

  // Create review (Admin protected)
  createReview: async (data) => {
    const res = await apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to create review.');
  },

  // Update review (Admin protected)
  updateReview: async (id, data) => {
    const res = await apiFetch(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to update review.');
  },

  // Delete review (Admin protected)
  deleteReview: async (id) => {
    const res = await apiFetch(`/reviews/${id}`, {
      method: 'DELETE',
    });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to delete review.');
  },

  // Upload avatar file to server
  uploadAvatarFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/upload/single', {
      method: 'POST',
      body: formData,
    });

    if (res && res.success && (res.data?.url || res.url)) {
      return res.data?.url || res.url;
    }
    throw new Error(res?.error || 'Avatar image file upload failed.');
  },
};

export default reviewService;
