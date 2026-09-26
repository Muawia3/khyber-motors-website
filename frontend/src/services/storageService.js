/**
 * LocalStorage Service for client-side state caching.
 */
const STORAGE_PREFIX = 'jac_dealership_cms_';

export const storageService = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading key ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing key ${key} to localStorage:`, error);
      return false;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error(`Error removing key ${key} from localStorage:`, error);
      return false;
    }
  },
};
