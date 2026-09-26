import { apiFetch } from './api';

let teamCache = null;

export const teamService = {
  getCachedTeamMembers: () => teamCache,
  clearCache: () => {
    teamCache = null;
  },

  // GET team members (activeOnly = true for public site, false/all=true for admin)
  getTeamMembers: async (activeOnly = false, force = false) => {
    if (force) {
      teamCache = null;
    }
    try {
      const endpoint = activeOnly ? '/team?activeOnly=true' : '/team?all=true';
      const res = await apiFetch(endpoint);
      if (res && res.success && Array.isArray(res.data)) {
        if (activeOnly) teamCache = res.data;
        return res.data;
      }
    } catch (err) {
      console.warn('apiFetch getTeamMembers error:', err.message);
    }
    return activeOnly ? (teamCache || []) : [];
  },

  // Create team member profile (Admin protected)
  createTeamMember: async (data) => {
    teamCache = null;
    const res = await apiFetch('/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to create team member profile.');
  },

  // Update team member profile (Admin protected)
  updateTeamMember: async (id, data) => {
    teamCache = null;
    const res = await apiFetch(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to update team member profile.');
  },

  // Toggle active status (Admin protected)
  toggleTeamMember: async (id) => {
    teamCache = null;
    const res = await apiFetch(`/team/${id}/toggle`, {
      method: 'PUT',
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to toggle status.');
  },

  // Delete team member profile (Admin protected)
  deleteTeamMember: async (id) => {
    teamCache = null;
    const res = await apiFetch(`/team/${id}`, {
      method: 'DELETE',
    });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to delete team member profile.');
  },

  // Upload profile image file to server (Admin protected)
  uploadImageFile: async (file) => {
    teamCache = null;
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

export default teamService;

