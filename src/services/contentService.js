import { DEFAULT_HOMEPAGE_CONTENT } from '../data/homepage';
import { DEFAULT_ABOUT_CONTENT } from '../data/about';
import { SERVICES_DATA } from '../data/services';
import { DEFAULT_CONTACT_CONTENT } from '../data/dealership';
import { apiFetch } from './api';

let homeContentCache = null;

export const contentService = {
  getCachedHomepageContent: () => homeContentCache,

  // Homepage Content
  getHomepageContent: async () => {
    try {
      const res = await apiFetch('/content/home');
      if (res && res.success && res.data) {
        homeContentCache = res.data;
        return res.data;
      }
    } catch (err) {
      console.warn('API getHomepageContent warning:', err.message);
    }
    return homeContentCache || DEFAULT_HOMEPAGE_CONTENT;
  },

  saveHomepageContent: async (data) => {
    homeContentCache = null;
    const res = await apiFetch('/content/home', {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to save homepage content.');
  },

  // About Content
  getAboutContent: async () => {
    try {
      const res = await apiFetch('/content/about');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('API getAboutContent warning:', err.message);
    }
    return DEFAULT_ABOUT_CONTENT;
  },

  saveAboutContent: async (data) => {
    const res = await apiFetch('/content/about', {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to save about page content.');
  },

  // Services Content
  getServicesContent: async () => {
    try {
      const res = await apiFetch('/content/services');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('API getServicesContent warning:', err.message);
    }
    return SERVICES_DATA;
  },

  saveServicesContent: async (data) => {
    const res = await apiFetch('/content/services', {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to save services content.');
  },

  // Contact & Dealership/Footer Content
  getContactContent: async () => {
    try {
      const res = await apiFetch('/content/contact');
      if (res && res.success && res.data) {
        return { ...DEFAULT_CONTACT_CONTENT, ...res.data };
      }
    } catch (err) {
      console.warn('API getContactContent warning:', err.message);
    }
    return DEFAULT_CONTACT_CONTENT;
  },

  saveContactContent: async (data) => {
    const res = await apiFetch('/content/contact', {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    if (res && res.success && res.data) {
      return res.data;
    }
    throw new Error(res?.error || 'Failed to save contact/footer content.');
  },
};
