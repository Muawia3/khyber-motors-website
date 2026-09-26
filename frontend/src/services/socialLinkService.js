import { apiFetch } from './api';

export const socialLinkService = {
  // GET social links (activeOnly = true for public site, false for admin)
  getSocialLinks: async (activeOnly = false) => {
    try {
      const endpoint = activeOnly ? '/social-links?activeOnly=true' : '/social-links';
      const res = await apiFetch(endpoint);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('apiFetch getSocialLinks error:', err.message);
    }
    return [];
  },

  // Create social link (Admin protected)
  createSocialLink: async (data) => {
    const res = await apiFetch('/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to create social link.');
  },

  // Update social link (Admin protected)
  updateSocialLink: async (id, data) => {
    const res = await apiFetch(`/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to update social link.');
  },

  // Reorder social links (Admin protected)
  reorderSocialLinks: async (items) => {
    const res = await apiFetch('/social-links/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
    if (res && res.success) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to reorder social links.');
  },

  // Delete social link (Admin protected)
  deleteSocialLink: async (id) => {
    const res = await apiFetch(`/social-links/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to delete social link.');
  },
};
