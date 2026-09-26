import { apiFetch } from './api.js';

const VISITOR_ID_KEY = 'km_visitor_id';

export function getOrCreateVisitorId() {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId || typeof visitorId !== 'string') {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch (err) {
    return `v_anon_${Date.now()}`;
  }
}

export const analyticsService = {
  trackPageView: async (path) => {
    try {
      if (!path || typeof path !== 'string') return;
      const cleanPath = path.trim().toLowerCase();
      // Strict rule: Do NOT count Admin panel visits or API requests
      if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api')) {
        return;
      }

      const visitorId = getOrCreateVisitorId();
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, visitorId }),
      });
    } catch (err) {
      console.warn('PageView tracking notice:', err);
    }
  },

  getAnalyticsStats: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      const res = await apiFetch(`/analytics/stats${queryString}`);
      if (res && res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch analytics stats:', err);
      return null;
    }
  },

  resetAnalytics: async (period, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/analytics/reset${queryString}`, {
        method: 'DELETE',
      });
      return res;
    } catch (err) {
      console.error('Failed to reset analytics:', err);
      throw err;
    }
  },
};
