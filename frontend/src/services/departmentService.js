import { apiFetch } from './api';

export const departmentService = {
  // GET department contacts (activeOnly = true for public site, false/all=true for admin)
  getDepartments: async (activeOnly = false) => {
    try {
      const endpoint = activeOnly ? '/departments?activeOnly=true' : '/departments?all=true';
      const res = await apiFetch(endpoint);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('apiFetch getDepartments error:', err.message);
    }
    return [];
  },

  // Create department (Admin protected)
  createDepartment: async (data) => {
    const res = await apiFetch('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to create department contact.');
  },

  // Update department (Admin protected)
  updateDepartment: async (id, data) => {
    const res = await apiFetch(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to update department contact.');
  },

  // Delete department (Admin protected)
  deleteDepartment: async (id) => {
    const res = await apiFetch(`/departments/${id}`, {
      method: 'DELETE',
    });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to delete department contact.');
  },
};

export default departmentService;
