import { apiFetch } from './api';
import { PRODUCT_HIERARCHY, PRODUCTS } from '../data/vehicles';

/**
 * Normalizes vehicle / product fields from the PostgreSQL database into a standard frontend shape.
 * Real database data is the primary source of truth, with reliable fallback to real catalog assets.
 */
function normalizeVehicle(v) {
  if (!v) return null;

  const rawCat = (v.category || '').toLowerCase().trim();
  const slug = (v.slug || '').toLowerCase().trim();
  const rawSub = (v.subcategory || '').toLowerCase().trim();

  let brand = v.brand;
  if (!brand) {
    if (rawCat.includes('dongfeng') || slug.includes('dongfeng')) {
      brand = 'Dongfeng';
    } else {
      brand = 'JAC';
    }
  }

  let category = 'jac-t9';
  if (brand === 'Dongfeng' || rawCat.includes('dongfeng')) {
    category = 'dongfeng';
  } else if (
    rawCat === 'jac-commercial' ||
    rawCat === 'commercial' ||
    rawCat === 'trucks' ||
    rawCat === 'truck' ||
    ['x200', '1020', '1042', '1091', '1120'].includes(rawSub) ||
    ['jac-x200', 'jac-1020', 'jac-1042', 'jac-1091', 'jac-1120'].includes(slug)
  ) {
    category = 'jac-commercial';
  } else {
    category = 'jac-t9';
  }

  const subcategory = v.subcategory ? v.subcategory.toLowerCase().trim() : null;
  const subSubcategory = v.subSubcategory ? v.subSubcategory.toLowerCase().trim() : null;

  let categoryLabel = v.categoryLabel;
  if (!categoryLabel) {
    if (category === 'jac-t9') {
      categoryLabel = 'JAC T9';
    } else if (category === 'jac-commercial') {
      categoryLabel = 'JAC Commercial';
    } else if (category === 'dongfeng') {
      categoryLabel = subcategory === 'heavy' ? 'Dongfeng Heavy' : 'Dongfeng Light';
    }
  }

  const displayOrder = v.displayOrder !== undefined ? v.displayOrder : 99;

  // Real specifications object from database
  let specsObj = {};
  if (v.specs) {
    if (typeof v.specs === 'object' && !Array.isArray(v.specs)) {
      specsObj = v.specs;
    } else if (typeof v.specs === 'string') {
      try {
        specsObj = JSON.parse(v.specs);
      } catch {
        specsObj = {};
      }
    } else if (Array.isArray(v.specs)) {
      v.specs.forEach((item) => {
        if (item && item.name) {
          specsObj[item.name] = item.value;
        }
      });
    }
  }

  // Real images with reliable catalog fallback
  const fallbackProduct = PRODUCTS.find((p) => p.slug === slug || p.id === v.id);
  const mainImage = (v.mainImage && v.mainImage.trim()) || (v.heroImage && v.heroImage.trim()) || fallbackProduct?.mainImage || '';
  const heroImage = (v.heroImage && v.heroImage.trim()) || (v.mainImage && v.mainImage.trim()) || fallbackProduct?.heroImage || fallbackProduct?.mainImage || '';

  let gallery = [];
  if (Array.isArray(v.gallery) && v.gallery.length > 0) {
    gallery = v.gallery.filter(Boolean);
  } else if (typeof v.gallery === 'string') {
    try {
      const parsed = JSON.parse(v.gallery);
      if (Array.isArray(parsed)) gallery = parsed.filter(Boolean);
    } catch {}
  }
  if (gallery.length === 0 && (mainImage || heroImage)) {
    gallery = [mainImage || heroImage].filter(Boolean);
  }
  if (gallery.length === 0 && fallbackProduct?.gallery?.length > 0) {
    gallery = fallbackProduct.gallery;
  }

  // Real features list from database only
  let features = [];
  if (Array.isArray(v.features)) {
    features = v.features;
  } else if (typeof v.features === 'string') {
    try {
      const parsed = JSON.parse(v.features);
      if (Array.isArray(parsed)) features = parsed;
    } catch {}
  }

  // Real highlights from database only
  let highlights = [];
  if (Array.isArray(v.whyT9Benefits)) {
    highlights = v.whyT9Benefits;
  } else if (Array.isArray(v.highlightsArray)) {
    highlights = v.highlightsArray;
  } else if (typeof v.whyT9Benefits === 'string') {
    try {
      const parsed = JSON.parse(v.whyT9Benefits);
      if (Array.isArray(parsed)) highlights = parsed;
    } catch {}
  }

  const normalizedObj = {
    ...v,
    brand,
    category,
    subcategory,
    subSubcategory,
    displayOrder,
    categoryLabel,
    shortDescription: v.tagline || v.shortDescription || v.overview || '',
    tagline: v.tagline || v.shortDescription || v.overview || '',
    fullDescription: v.overview || v.fullDescription || v.description || '',
    overview: v.overview || v.fullDescription || v.description || '',
    heroImage,
    mainImage,
    galleryImages: gallery,
    gallery: gallery,
    specs: specsObj,
    specsArray: Array.isArray(v.specsArray) && v.specsArray.length > 0
      ? v.specsArray
      : Object.entries(specsObj).map(([name, value]) => ({ name, value: String(value) })),
    featuresArray: features,
    features: features,
    highlightsArray: highlights,
    whyT9Benefits: highlights,
    brochureAvailable: Boolean(v.brochureUrl && v.brochureUrl.trim()),
    brochureUrl: v.brochureUrl || '',
  };

  // Strictly omit prices across the entire application
  delete normalizedObj.price;
  delete normalizedObj.pricePKR;
  delete normalizedObj.priceFormatted;
  delete normalizedObj.formattedPrice;
  delete normalizedObj.priceLabel;

  return normalizedObj;
}

let vehiclesMemoryCache = null;

export const vehicleService = {
  getHierarchy: () => PRODUCT_HIERARCHY,

  getCachedVehicles: () => {
    if (vehiclesMemoryCache && vehiclesMemoryCache.length > 0) {
      return vehiclesMemoryCache;
    }
    return PRODUCTS;
  },

  clearCache: () => {
    vehiclesMemoryCache = null;
  },

  getVehicles: async (force = false, view = 'cards') => {
    if (force || !vehiclesMemoryCache) {
      try {
        const endpoint = view ? `/vehicles?view=${view}` : '/vehicles';
        const res = await apiFetch(endpoint);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiVehicles = res.data.map(normalizeVehicle).filter(Boolean);
          const merged = [...apiVehicles];
          merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          vehiclesMemoryCache = merged;
          return vehiclesMemoryCache;
        }
      } catch (err) {
        console.warn('[vehicleService] API getVehicles warning:', err.message);
      }
      if (!vehiclesMemoryCache) {
        vehiclesMemoryCache = [];
      }
    }
    return vehiclesMemoryCache || [];
  },

  getVehicleCards: async (force = false) => {
    return vehicleService.getVehicles(force, 'cards');
  },

  getVehicleById: async (id) => {
    try {
      const res = await apiFetch(`/vehicles/${id}`);
      if (res && res.success && res.data) {
        return normalizeVehicle(res.data);
      }
    } catch (err) {
      console.warn(`[vehicleService] getVehicleById(${id}) warning:`, err.message);
    }
    const all = await vehicleService.getVehicles();
    return all.find((v) => String(v.id) === String(id) || v.slug === id) || null;
  },

  getVehicleBySlug: async (slug) => {
    try {
      const res = await apiFetch(`/vehicles/${slug}`);
      if (res && res.success && res.data) {
        return normalizeVehicle(res.data);
      }
    } catch (err) {
      console.warn(`[vehicleService] getVehicleBySlug(${slug}) warning:`, err.message);
    }
    const all = await vehicleService.getVehicles();
    return all.find((v) => v.slug === slug || String(v.id) === String(slug)) || null;
  },

  saveVehicle: async (vehicleData) => {
    vehiclesMemoryCache = null;
    const res = await apiFetch('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
    if (res && res.success && res.data) {
      vehiclesMemoryCache = null;
      return normalizeVehicle(res.data);
    }
    throw new Error(res?.error || 'Failed to create vehicle in database.');
  },

  updateVehicle: async (id, updatedData) => {
    vehiclesMemoryCache = null;
    const res = await apiFetch(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    if (res && res.success && res.data) {
      vehiclesMemoryCache = null;
      return normalizeVehicle(res.data);
    }
    throw new Error(res?.error || 'Failed to update vehicle in database.');
  },

  reorderVehicles: async (items) => {
    try {
      await apiFetch('/vehicles/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      console.warn('Reorder API warning:', err);
    }
    vehiclesMemoryCache = null;
    return true;
  },

  deleteVehicle: async (id) => {
    vehiclesMemoryCache = null;
    const res = await apiFetch(`/vehicles/${id}`, { method: 'DELETE' });
    if (res && res.success) {
      vehiclesMemoryCache = null;
      return true;
    }
    throw new Error(res?.error || 'Failed to delete vehicle.');
  },

  duplicateVehicle: async (id) => {
    const source = await vehicleService.getVehicleById(id);
    if (!source) throw new Error('Source product not found.');

    const duplicatePayload = {
      ...source,
      name: `${source.name} - Copy`,
      slug: `${source.slug}-copy-${Math.floor(Math.random() * 10000)}`,
      status: 'Draft',
    };
    delete duplicatePayload.id;
    delete duplicatePayload.createdAt;
    delete duplicatePayload.updatedAt;

    return vehicleService.saveVehicle(duplicatePayload);
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch('/upload/single', {
      method: 'POST',
      body: formData,
    });
    if (res && res.success && res.data?.url) {
      return res.data.url;
    }
    throw new Error(res?.error || 'File upload failed.');
  },

  uploadFileInChunks: async (file, onProgress) => {
    const CHUNK_SIZE = 2 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = 'file-' + Date.now() + '-' + Math.round(Math.random() * 1e6);

    let finalUrl = null;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const blobChunk = file.slice(start, end);

      const chunkBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blobChunk);
      });

      const res = await apiFetch('/upload/chunk', {
        method: 'POST',
        body: JSON.stringify({
          uploadId,
          chunkIndex: i,
          totalChunks,
          chunkData: chunkBase64,
          filename: file.name,
          mimeType: file.type,
        }),
      });

      if (!res || !res.success) {
        throw new Error(res?.error || `Chunk ${i + 1}/${totalChunks} failed`);
      }

      if (res.data?.url) {
        finalUrl = res.data.url;
      }

      if (typeof onProgress === 'function') {
        const percent = Math.round(((i + 1) / totalChunks) * 100);
        onProgress(percent);
      }
    }

    if (!finalUrl) {
      throw new Error('Chunked upload did not return final URL');
    }

    return finalUrl;
  },
};

export const productService = vehicleService;
export default vehicleService;
