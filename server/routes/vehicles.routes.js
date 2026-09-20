import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const parseVehicleFields = (vehicle) => {
  if (!vehicle) return null;
  const stockQty = vehicle.stockQuantity ?? 0;
  const stockStat = vehicle.stockStatus || (stockQty > 0 ? 'in_stock' : 'out_of_stock');

  return {
    ...vehicle,
    stockQuantity: stockQty,
    stockStatus: stockStat,
    gallery: typeof vehicle.gallery === 'string' ? JSON.parse(vehicle.gallery || '[]') : vehicle.gallery,
    specs: typeof vehicle.specs === 'string' ? JSON.parse(vehicle.specs || '{}') : vehicle.specs,
    features: typeof vehicle.features === 'string' ? JSON.parse(vehicle.features || '[]') : vehicle.features,
    whyT9Benefits: typeof vehicle.whyT9Benefits === 'string' ? JSON.parse(vehicle.whyT9Benefits || '[]') : vehicle.whyT9Benefits,
    colorOptions: typeof vehicle.colorOptions === 'string' ? JSON.parse(vehicle.colorOptions || '[]') : vehicle.colorOptions,
  };
};

const stringifyIfNeeded = (val, fallback = '[]') => {
  if (typeof val === 'string') return val;
  if (val === undefined || val === null) return fallback;
  return JSON.stringify(val);
};

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, status } = req.query;

    const where = {};
    if (category && category.toUpperCase() !== 'ALL') {
      where.category = category.toUpperCase();
    }
    if (subcategory) {
      where.subcategory = subcategory.toUpperCase();
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fullTitle: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const formatted = vehicles.map(parseVehicleFields);
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Fetch vehicles error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/vehicles/:slugOrId
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;

    let vehicle = await prisma.vehicle.findUnique({
      where: { slug: slugOrId },
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.findUnique({
        where: { id: slugOrId },
      });
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    }

    return res.json({ success: true, data: parseVehicleFields(vehicle) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/vehicles (Admin protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const body = req.body;

    if (!body.name || !body.category) {
      return res.status(400).json({ success: false, error: 'Vehicle name and category are required.' });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let stockQuantity = Math.max(0, parseInt(body.stockQuantity, 10) || 0);
    let stockStatus = body.stockStatus;
    if (stockQuantity === 0) {
      stockStatus = 'out_of_stock';
    } else if (stockQuantity > 0 && (!stockStatus || stockStatus === 'out_of_stock')) {
      stockStatus = 'in_stock';
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        name: body.name,
        fullTitle: body.fullTitle || body.name,
        slug,
        tagline: body.tagline || '',
        category: body.category.toUpperCase(),
        subcategory: body.subcategory ? body.subcategory.toUpperCase() : null,
        categoryLabel: body.categoryLabel || null,
        status: body.status || 'Published',
        stockStatus: stockStatus || 'out_of_stock',
        stockQuantity: stockQuantity || 0,
        isFlagship: Boolean(body.isFlagship),
        isNew: Boolean(body.isNew),
        mainImage: body.mainImage || '',
        heroImage: body.heroImage || '',
        altText: body.altText || body.name,
        gallery: stringifyIfNeeded(body.gallery, '[]'),
        specs: stringifyIfNeeded(body.specs, '{}'),
        features: stringifyIfNeeded(body.features, '[]'),
        whyT9Benefits: stringifyIfNeeded(body.whyT9Benefits, '[]'),
        colorOptions: stringifyIfNeeded(body.colorOptions, '[]'),
        overview: body.overview || '',
        warranty: body.warranty || '',
        brochureAvailable: body.brochureAvailable ?? true,
        brochureUrl: body.brochureUrl || null,
        seoTitle: body.seoTitle || body.name,
        metaDescription: body.metaDescription || '',
      },
    });

    return res.status(201).json({ success: true, data: parseVehicleFields(newVehicle) });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/vehicles/:id/stock (Admin protected - dedicated stock management)
router.put('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let { stockStatus, stockQuantity } = req.body;

    let existing = await prisma.vehicle.findUnique({ where: { id } }).catch(() => null);
    if (!existing) {
      existing = await prisma.vehicle.findUnique({ where: { slug: id } }).catch(() => null);
    }
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    }

    if (stockQuantity !== undefined) {
      stockQuantity = Math.max(0, parseInt(stockQuantity, 10) || 0);
      if (stockQuantity === 0) {
        stockStatus = 'out_of_stock';
      } else if (stockQuantity > 0 && (!stockStatus || stockStatus === 'out_of_stock')) {
        stockStatus = 'in_stock';
      }
    } else if (stockStatus === 'out_of_stock') {
      stockQuantity = 0;
    }

    const updated = await prisma.vehicle.update({
      where: { id: existing.id },
      data: {
        ...(stockStatus !== undefined && { stockStatus }),
        ...(stockQuantity !== undefined && { stockQuantity }),
      },
    });

    return res.json({ success: true, data: parseVehicleFields(updated) });
  } catch (error) {
    console.error('Update vehicle stock error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/vehicles/:id (Admin protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    let existing = await prisma.vehicle.findUnique({ where: { id } }).catch(() => null);
    if (!existing) {
      existing = await prisma.vehicle.findUnique({ where: { slug: id } }).catch(() => null);
    }
    if (!existing && body.slug) {
      existing = await prisma.vehicle.findUnique({ where: { slug: body.slug } }).catch(() => null);
    }
    if (!existing && body.name) {
      existing = await prisma.vehicle.findFirst({
        where: { name: { contains: body.name, mode: 'insensitive' } },
      }).catch(() => null);
    }

    // Fallback: If vehicle row is not found in database, create it dynamically
    if (!existing) {
      const slug = body.slug || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'vehicle-' + Date.now());
      const newVehicle = await prisma.vehicle.create({
        data: {
          name: body.name || 'JAC Vehicle',
          fullTitle: body.fullTitle || body.name || 'JAC Vehicle',
          slug,
          tagline: body.tagline || body.shortDescription || '',
          category: (body.category || 'PASSENGERS').toUpperCase(),
          subcategory: body.subcategory ? body.subcategory.toUpperCase() : null,
          categoryLabel: body.categoryLabel || null,
          status: body.status || 'Published',
          stockStatus: body.stockStatus || 'in_stock',
          stockQuantity: body.stockQuantity ?? 1,
          isFlagship: Boolean(body.isFlagship),
          isNew: Boolean(body.isNew),
          mainImage: body.mainImage || body.heroImage || '',
          heroImage: body.heroImage || body.mainImage || '',
          altText: body.altText || body.name || '',
          gallery: stringifyIfNeeded(body.gallery || body.galleryImages, '[]'),
          specs: stringifyIfNeeded(body.specs || body.specsArray, '{}'),
          features: stringifyIfNeeded(body.features || body.featuresArray, '[]'),
          whyT9Benefits: stringifyIfNeeded(body.whyT9Benefits || body.highlightsArray, '[]'),
          colorOptions: stringifyIfNeeded(body.colorOptions, '[]'),
          overview: body.overview || body.fullDescription || '',
          warranty: body.warranty || '',
          brochureAvailable: body.brochureAvailable ?? true,
          brochureUrl: body.brochureUrl || null,
          seoTitle: body.seoTitle || body.name || '',
          metaDescription: body.metaDescription || '',
        },
      });
      return res.json({ success: true, data: parseVehicleFields(newVehicle) });
    }

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.fullTitle !== undefined) updateData.fullTitle = body.fullTitle || body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.overview !== undefined) updateData.overview = body.overview;
    if (body.description !== undefined) updateData.overview = body.description;
    if (body.category !== undefined) updateData.category = body.category.toUpperCase();
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory ? body.subcategory.toUpperCase() : null;
    if (body.categoryLabel !== undefined) updateData.categoryLabel = body.categoryLabel;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isFlagship !== undefined) updateData.isFlagship = Boolean(body.isFlagship);
    if (body.isNew !== undefined) updateData.isNew = Boolean(body.isNew);
    if (body.mainImage !== undefined) updateData.mainImage = body.mainImage;
    if (body.heroImage !== undefined) updateData.heroImage = body.heroImage;
    if (body.altText !== undefined) updateData.altText = body.altText;

    if (body.stockQuantity !== undefined) {
      let qty = Math.max(0, parseInt(body.stockQuantity, 10) || 0);
      updateData.stockQuantity = qty;
      if (qty === 0) {
        updateData.stockStatus = 'out_of_stock';
      } else if (body.stockStatus) {
        updateData.stockStatus = body.stockStatus;
      } else {
        updateData.stockStatus = 'in_stock';
      }
    } else if (body.stockStatus !== undefined) {
      updateData.stockStatus = body.stockStatus;
      if (body.stockStatus === 'out_of_stock') {
        updateData.stockQuantity = 0;
      }
    }

    const galleryData = body.gallery || body.galleryImages;
    if (galleryData !== undefined) updateData.gallery = stringifyIfNeeded(galleryData, '[]');

    const specsData = body.specs || body.specsArray;
    if (specsData !== undefined) updateData.specs = stringifyIfNeeded(specsData, '{}');

    const featuresData = body.features || body.featuresArray;
    if (featuresData !== undefined) updateData.features = stringifyIfNeeded(featuresData, '[]');

    const benefitsData = body.whyT9Benefits || body.highlightsArray;
    if (benefitsData !== undefined) updateData.whyT9Benefits = stringifyIfNeeded(benefitsData, '[]');

    if (body.colorOptions !== undefined) updateData.colorOptions = stringifyIfNeeded(body.colorOptions, '[]');
    if (body.warranty !== undefined) updateData.warranty = body.warranty;
    if (body.brochureAvailable !== undefined) updateData.brochureAvailable = Boolean(body.brochureAvailable);
    if (body.brochureUrl !== undefined) updateData.brochureUrl = body.brochureUrl;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;

    const updated = await prisma.vehicle.update({
      where: { id: existing.id },
      data: updateData,
    });

    return res.json({ success: true, data: parseVehicleFields(updated) });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/vehicles/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    }

    await prisma.vehicle.delete({ where: { id } });
    return res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
