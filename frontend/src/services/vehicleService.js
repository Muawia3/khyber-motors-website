import { apiFetch } from './api';
import { VEHICLES_DATA } from '../data/vehicles';

/**
 * Normalizes vehicle category, subcategory, specs, and image fields to standard taxonomy.
 */
function normalizeVehicle(v) {
  if (!v) return null;
  const defaultMatch = VEHICLES_DATA.find(
    (d) => d.slug === v.slug || String(d.id) === String(v.id) || d.id === v.id
  );

  let category = v.category ? v.category.toLowerCase() : 'passengers';
  if (category === 'pickups' || category === 'pickup' || category === 'passenger' || category === 'passengers') {
    category = 'passengers';
  } else if (category === 'commercial' || category === 'commercial vehicle' || category === 'truck' || category === 'trucks') {
    category = 'trucks';
  }

  let subcategory = v.subcategory ? v.subcategory.toLowerCase() : null;
  if (category === 'passengers') {
    subcategory = null;
  } else if (category === 'trucks' && !subcategory) {
    subcategory = 'heavy';
  }

  let categoryLabel = v.categoryLabel;
  if (!categoryLabel) {
    if (category === 'passengers') {
      categoryLabel = 'Passenger';
    } else if (category === 'trucks') {
      categoryLabel = subcategory === 'heavy' ? 'Heavy Truck' : 'Light Truck';
    }
  }

  // Ensure specs object format
  let specsObj = {};
  if (v.specs) {
    if (typeof v.specs === 'object' && !Array.isArray(v.specs)) {
      specsObj = v.specs;
    } else if (Array.isArray(v.specs)) {
      v.specs.forEach((item) => {
        if (item && item.name) {
          const key = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
          specsObj[key] = item.value;
          specsObj[item.name] = item.value;
        }
      });
    }
  } else if (defaultMatch?.specs) {
    specsObj = defaultMatch.specs;
  }

  // Guaranteed persistent Cloudinary image fallback hierarchy
  const mainImage = (v.mainImage && v.mainImage.trim()) || (v.heroImage && v.heroImage.trim()) || defaultMatch?.mainImage || defaultMatch?.heroImage || '';
  const heroImage = (v.heroImage && v.heroImage.trim()) || (v.mainImage && v.mainImage.trim()) || defaultMatch?.heroImage || defaultMatch?.mainImage || '';

  let gallery = Array.isArray(v.gallery) && v.gallery.length > 0
    ? v.gallery
    : Array.isArray(v.galleryImages) && v.galleryImages.length > 0
    ? v.galleryImages
    : (defaultMatch?.gallery || [mainImage].filter(Boolean));

  const normalizedObj = {
    ...v,
    category,
    subcategory,
    categoryLabel,
    shortDescription: v.tagline || v.shortDescription || v.overview || defaultMatch?.tagline || '',
    tagline: v.tagline || v.shortDescription || v.overview || defaultMatch?.tagline || '',
    fullDescription: v.overview || v.fullDescription || v.description || defaultMatch?.overview || '',
    overview: v.overview || v.fullDescription || v.description || defaultMatch?.overview || '',
    heroImage,
    mainImage,
    galleryImages: gallery,
    gallery: gallery,
    specs: specsObj,
    specsArray: Array.isArray(v.specs) ? v.specs : Object.entries(specsObj).map(([name, value]) => ({ name, value })),
    featuresArray: Array.isArray(v.features) ? v.features : Array.isArray(v.featuresArray) ? v.featuresArray : defaultMatch?.features || [],
    highlightsArray: Array.isArray(v.whyT9Benefits) ? v.whyT9Benefits : Array.isArray(v.highlightsArray) ? v.highlightsArray : defaultMatch?.whyT9Benefits || [],
  };

  delete normalizedObj.price;
  delete normalizedObj.pricePKR;
  delete normalizedObj.priceFormatted;

  return normalizedObj;
}

let vehiclesMemoryCache = null;

export const vehicleService = {
  getCachedVehicles: () => {
    if (!vehiclesMemoryCache) {
      vehiclesMemoryCache = VEHICLES_DATA.map(normalizeVehicle);
    }
    return vehiclesMemoryCache;
  },

  clearCache: () => {
    vehiclesMemoryCache = null;
  },

  getVehicles: async (force = false, view = 'cards') => {
    if (force) {
      vehiclesMemoryCache = null;
    }
    try {
      const endpoint = view ? `/vehicles?view=${view}` : '/vehicles';
      const res = await apiFetch(endpoint);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeVehicle);
        vehiclesMemoryCache = normalized;

        if (import.meta.env.DEV) {
          console.log(`[vehicleService] API response (${endpoint}) -> count: ${normalized.length}`);
          const t9Hunter = normalized.find((v) => v.slug === 't9-hunter');
          const t9Frison = normalized.find((v) => v.slug === 't9-frison');
          console.log(`[vehicleService] T9 Hunter mainImage: "${t9Hunter?.mainImage}"`);
          console.log(`[vehicleService] T9 Frison mainImage: "${t9Frison?.mainImage}"`);
        }

        return vehiclesMemoryCache;
      }
    } catch (err) {
      console.warn('[vehicleService] API getVehicles warning:', err.message);
    }

    if (!vehiclesMemoryCache) {
      vehiclesMemoryCache = VEHICLES_DATA.map(normalizeVehicle);
    }
    return vehiclesMemoryCache;
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
    return all.find((v) => String(v.id) === String(id) || v.slug === String(id)) || null;
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
      return normalizeVehicle(res.data);
    }
    throw new Error(res?.error || 'Failed to save vehicle.');
  },

  updateVehicle: async (id, updatedData) => {
    vehiclesMemoryCache = null;
    const res = await apiFetch(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    if (res && res.success && res.data) {
      return normalizeVehicle(res.data);
    }
    throw new Error(res?.error || 'Failed to update vehicle.');
  },

  deleteVehicle: async (id) => {
    vehiclesMemoryCache = null;
    const res = await apiFetch(`/vehicles/${id}`, { method: 'DELETE' });
    if (res && res.success) {
      return true;
    }
    throw new Error(res?.error || 'Failed to delete vehicle.');
  },

  duplicateVehicle: async (id) => {
    const source = await vehicleService.getVehicleById(id);
    if (!source) throw new Error('Source vehicle not found.');

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
          filename: file.name,
          fileType: file.type || 'application/pdf',
          chunkData: chunkBase64,
        }),
      });

      if (!res || !res.success) {
        throw new Error(res?.error || `Chunk ${i + 1} of ${totalChunks} upload failed.`);
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      if (res.completed && res.url) {
        finalUrl = res.url;
      }
    }

    if (!finalUrl) {
      throw new Error('Chunked upload completed but server returned empty file URL.');
    }

    return finalUrl;
  },
};
