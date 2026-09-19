import { apiFetch } from './api';

export const notificationService = {
  // GET notifications
  getNotifications: async (limit = 30) => {
    try {
      const res = await apiFetch(`/notifications?limit=${limit}`);
      if (res && res.success) {
        return {
          notifications: res.data || [],
          unreadCount: res.unreadCount || 0,
        };
      }
    } catch (err) {
      console.warn('apiFetch getNotifications error:', err.message);
    }
    return { notifications: [], unreadCount: 0 };
  },

  // GET unread count
  getUnreadCount: async () => {
    try {
      const res = await apiFetch('/notifications/unread-count');
      if (res && res.success && typeof res.count === 'number') {
        return res.count;
      }
    } catch (err) {
      console.warn('apiFetch getUnreadCount error:', err.message);
    }
    return 0;
  },

  // Mark single as read
  markAsRead: async (id) => {
    const res = await apiFetch(`/notifications/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    if (res && res.success) {
      return res;
    }
    throw new Error(res?.error || 'Failed to mark notification as read.');
  },

  // Mark all as read
  markAllAsRead: async () => {
    const res = await apiFetch('/notifications/read-all', {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to mark all notifications as read.');
  },

  // Delete notification
  deleteNotification: async (id) => {
    const res = await apiFetch(`/notifications/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    if (res && res.success) {
      return res;
    }
    throw new Error(res?.error || 'Failed to delete notification.');
  },
};
