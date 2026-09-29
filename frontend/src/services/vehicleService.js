import { apiFetch } from './api';
import { VEHICLES_DATA, PRODUCT_HIERARCHY } from '../data/vehicles';

/**
 * Normalizes vehicle / product category, subcategory, specs, and image fields to standard taxonomy.
 */
function normalizeVehicle(v) {
  if (!v) return null;
  const defaultMatch = VEHICLES_DATA.find(
    (d) => d.slug === v.slug || String(d.id) === String(v.id) || d.id === v.id
  );

  const rawCat = (v.category || '').toLowerCase().trim();
  const slug = (v.slug || '').toLowerCase().trim();
  const rawSub = (v.subcategory || '').toLowerCase().trim();

  let brand = v.brand || defaultMatch?.brand;
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

  let subcategory = v.subcategory ? v.subcategory.toLowerCase().trim() : defaultMatch?.subcategory || null;
  let subSubcategory = v.subSubcategory ? v.subSubcategory.toLowerCase().trim() : defaultMatch?.subSubcategory || null;

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

  const displayOrder = v.displayOrder !== undefined ? v.displayOrder : (defaultMatch?.displayOrder ?? 99);

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

  // Guaranteed persistent image fallback hierarchy
  const mainImage = (v.mainImage && v.mainImage.trim()) || (v.heroImage && v.heroImage.trim()) || defaultMatch?.mainImage || defaultMatch?.heroImage || '';
  const heroImage = (v.heroImage && v.heroImage.trim()) || (v.mainImage && v.mainImage.trim()) || defaultMatch?.heroImage || defaultMatch?.mainImage || '';

  let gallery = Array.isArray(v.gallery) && v.gallery.length > 0
    ? v.gallery
    : Array.isArray(v.galleryImages) && v.galleryImages.length > 0
    ? v.galleryImages
    : (defaultMatch?.gallery || [mainImage].filter(Boolean));

  const normalizedObj = {
    ...v,
    brand,
    category,
    subcategory,
    subSubcategory,
    displayOrder,
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
    brochureAvailable: v.brochureAvailable ?? defaultMatch?.brochureAvailable ?? Boolean(v.brochureUrl || defaultMatch?.brochureUrl),
    brochureUrl: v.brochureUrl || defaultMatch?.brochureUrl || '',
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
    if (!vehiclesMemoryCache) {
      vehiclesMemoryCache = VEHICLES_DATA.map(normalizeVehicle).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
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
        const normalized = res.data.map(normalizeVehicle).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        vehiclesMemoryCache = normalized;
        return vehiclesMemoryCache;
      }
    } catch (err) {
      console.warn('[vehicleService] API getVehicles warning:', err.message);
    }

    if (!vehiclesMemoryCache) {
      vehiclesMemoryCache = VEHICLES_DATA.map(normalizeVehicle).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
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
    try {
      const res = await apiFetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      });
      if (res && res.success && res.data) {
        return normalizeVehicle(res.data);
      }
    } catch (err) {
      console.warn('[vehicleService] saveVehicle API warning:', err);
    }

    // Fallback local creation
    const newProduct = normalizeVehicle({
      id: 'local-' + Date.now(),
      ...vehicleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!vehiclesMemoryCache) {
      vehiclesMemoryCache = VEHICLES_DATA.map(normalizeVehicle);
    }
    vehiclesMemoryCache.push(newProduct);
    return newProduct;
  },

  updateVehicle: async (id, updatedData) => {
    vehiclesMemoryCache = null;
    try {
      const res = await apiFetch(`/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      if (res && res.success && res.data) {
        return normalizeVehicle(res.data);
      }
    } catch (err) {
      console.warn('[vehicleService] updateVehicle API warning:', err);
    }

    // Fallback local update
    const all = await vehicleService.getVehicles();
    const index = all.findIndex((v) => String(v.id) === String(id) || v.slug === id);
    if (index !== -1) {
      all[index] = normalizeVehicle({ ...all[index], ...updatedData, updatedAt: new Date().toISOString() });
      vehiclesMemoryCache = all;
      return all[index];
    }
    throw new Error('Vehicle not found to update.');
  },

  reorderVehicles: async (items) => {
    try {
      await apiFetch('/vehicles/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      console.warn('Reorder API warning, applied locally:', err);
    }
    if (vehiclesMemoryCache) {
      items.forEach((item) => {
        const found = vehiclesMemoryCache.find((v) => String(v.id) === String(item.id) || v.slug === item.id);
        if (found) {
          found.displayOrder = item.displayOrder;
        }
      });
      vehiclesMemoryCache.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return true;
  },

  deleteVehicle: async (id) => {
    vehiclesMemoryCache = null;
    try {
      const res = await apiFetch(`/vehicles/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        return true;
      }
    } catch (err) {
      console.warn('[vehicleService] deleteVehicle API warning:', err);
    }

    const all = await vehicleService.getVehicles();
    vehiclesMemoryCache = all.filter((v) => String(v.id) !== String(id) && v.slug !== id);
    return true;
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
