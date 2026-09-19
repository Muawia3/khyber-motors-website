import { apiFetch } from './api';

/**
 * Normalizes vehicle category and subcategory to standard taxonomy.
 */
function normalizeVehicle(v) {
  if (!v) return null;
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
  }

  const normalizedObj = {
    ...v,
    category,
    subcategory,
    categoryLabel,
    shortDescription: v.tagline || v.shortDescription || v.overview || '',
    tagline: v.tagline || v.shortDescription || v.overview || '',
    fullDescription: v.overview || v.fullDescription || v.description || '',
    overview: v.overview || v.fullDescription || v.description || '',
    heroImage: v.heroImage || v.mainImage || '',
    mainImage: v.mainImage || v.heroImage || '',
    galleryImages: Array.isArray(v.gallery) ? v.gallery : Array.isArray(v.galleryImages) ? v.galleryImages : [],
    gallery: Array.isArray(v.gallery) ? v.gallery : Array.isArray(v.galleryImages) ? v.galleryImages : [],
    specs: specsObj,
    specsArray: Array.isArray(v.specs) ? v.specs : Object.entries(specsObj).map(([name, value]) => ({ name, value })),
    featuresArray: Array.isArray(v.features) ? v.features : Array.isArray(v.featuresArray) ? v.featuresArray : [],
    highlightsArray: Array.isArray(v.whyT9Benefits) ? v.whyT9Benefits : Array.isArray(v.highlightsArray) ? v.highlightsArray : [],
  };

  delete normalizedObj.price;
  delete normalizedObj.pricePKR;
  delete normalizedObj.priceFormatted;

  return normalizedObj;
}

export const vehicleService = {
  getVehicles: async () => {
    const res = await apiFetch('/vehicles');
    if (res && res.success && Array.isArray(res.data)) {
      return res.data.map(normalizeVehicle);
    }
    return [];
  },

  getVehicleById: async (id) => {
    try {
      const res = await apiFetch(`/vehicles/${id}`);
      if (res && res.success && res.data) {
        return normalizeVehicle(res.data);
      }
    } catch (err) {
      console.warn(`API getVehicleById(${id}) warning:`, err.message);
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
      console.warn(`API getVehicleBySlug(${slug}) warning:`, err.message);
    }
    const all = await vehicleService.getVehicles();
    return all.find((v) => v.slug === slug || String(v.id) === String(slug)) || null;
  },

  saveVehicle: async (vehicleData) => {
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
};
