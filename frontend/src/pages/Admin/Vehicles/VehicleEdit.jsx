import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { VehicleImageUploader } from '../../../components/admin/VehicleImageUploader';
import { BrochureUploader } from '../../../components/admin/BrochureUploader';
import { SpecificationEditor } from '../../../components/admin/SpecificationEditor';
import { FeatureEditor } from '../../../components/admin/FeatureEditor';
import { HighlightsEditor } from '../../../components/admin/HighlightsEditor';
import { vehicleService } from '../../../services/vehicleService';
import { validateRequired } from '../../../utils/validation';

export const VehicleEdit = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const queryCategory = searchParams.get('category');
  const querySubcategory = searchParams.get('subcategory');

  const [formData, setFormData] = useState({
    name: '',
    brand: 'JAC',
    category: queryCategory || 'jac-t9',
    subcategory: querySubcategory || 'hunter',
    subSubcategory: null,
    displayOrder: 1,
    categoryLabel: 'JAC T9',
    modelYear: '2026',
    status: 'Published',
    shortDescription: '',
    fullDescription: '',
    heroImage: '',
    galleryImages: [],
    brochureUrl: '',
    specsArray: [
      { name: 'Engine', value: '2.0L Turbo Diesel' },
      { name: 'Transmission', value: '8-Speed Automatic' },
      { name: 'Fuel Type', value: 'Diesel' },
      { name: 'Power', value: '168 HP @ 3600 RPM' },
      { name: 'Torque', value: '410 Nm @ 1500-2500 RPM' },
      { name: 'Payload Capacity', value: '1,000 kg' },
    ],
    featuresArray: [
      { title: 'Infotainment System', description: 'Touchscreen with smartphone connectivity' },
      { title: 'Panoramic Camera', description: 'Surround view monitoring and parking sensors' },
      { title: 'Ergonomic Seats', description: 'Multi-way adjustable seating' },
    ],
    highlightsArray: [
      { title: 'Capability', description: 'Engineered for demanding terrain and heavy commercial payloads.' },
      { title: 'Comfort', description: 'Refined cabin layout with durable acoustic insulation.' },
    ],
    seoTitle: '',
    metaDescription: '',
    slug: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [seoExpanded, setSeoExpanded] = useState(false);

  // Load existing vehicle/product if editing
  useEffect(() => {
    let isMounted = true;
    const loadVehicle = async () => {
      if (isEditing) {
        document.title = 'Edit Product | Admin CMS';
        try {
          const existing = await vehicleService.getVehicleById(id);
          if (existing && isMounted) {
            const specsArr = Array.isArray(existing.specsArray)
              ? existing.specsArray
              : existing.specs
              ? Object.entries(existing.specs).map(([name, val]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
                  value: String(val),
                }))
              : [];

            const featuresArr = Array.isArray(existing.featuresArray)
              ? existing.featuresArray
              : Array.isArray(existing.features)
              ? existing.features.map((f) => (typeof f === 'string' ? { title: f, description: '' } : f))
              : [];

            const highlightsArr = Array.isArray(existing.highlightsArray)
              ? existing.highlightsArray
              : Array.isArray(existing.whyT9Benefits)
              ? existing.whyT9Benefits.map((b) => (typeof b === 'string' ? { title: b, description: '' } : b))
              : Array.isArray(existing.highlights)
              ? existing.highlights
              : [];

            const cat = (existing.category || '').toLowerCase();
            let category = cat;
            if (cat === 'passengers' || cat === 'pickups') category = 'jac-t9';
            if (cat === 'trucks' || cat === 'commercial') {
              category = existing.brand === 'Dongfeng' || existing.slug?.includes('dongfeng') ? 'dongfeng' : 'jac-commercial';
            }

            setFormData({
              name: existing.name || '',
              brand: existing.brand || (category === 'dongfeng' ? 'Dongfeng' : 'JAC'),
              category: category || 'jac-t9',
              subcategory: existing.subcategory || null,
              subSubcategory: existing.subSubcategory || null,
              displayOrder: existing.displayOrder ?? 1,
              categoryLabel: existing.categoryLabel || 'Product',
              modelYear: existing.modelYear || '2026',
              status: existing.status || 'Published',
              shortDescription: existing.tagline || existing.shortDescription || '',
              fullDescription: existing.overview || existing.fullDescription || '',
              heroImage: existing.heroImage || existing.mainImage || '',
              galleryImages: Array.isArray(existing.gallery) ? existing.gallery : (Array.isArray(existing.galleryImages) ? existing.galleryImages : []),
              brochureUrl: existing.brochureUrl || '',
              specsArray: specsArr,
              featuresArray: featuresArr,
              highlightsArray: highlightsArr,
              seoTitle: existing.seoTitle || existing.name || '',
              metaDescription: existing.metaDescription || '',
              slug: existing.slug || '',
            });
          }
        } catch (err) {
          console.error('Failed to load product details for edit:', err);
          if (isMounted) setSaveErrorMsg('Failed to load product data.');
        }
      } else {
        document.title = 'Add New Product | Admin CMS';
      }
    };

    loadVehicle();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    updateFormField('name', val);

    if (!isEditing && (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      updateFormField('slug', generatedSlug);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!validateRequired(formData.name)) {
      errors.name = 'Product name is required.';
    }
    if (!validateRequired(formData.category)) {
      errors.category = 'Category selection is required.';
    }
    if (!validateRequired(formData.shortDescription)) {
      errors.shortDescription = 'Short description is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (targetStatus = null) => {
    if (!validateForm()) {
      setSaveErrorMsg('Please fill in all required fields indicated in red.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    const statusToApply = targetStatus || formData.status;

    const specsObject = {};
    (formData.specsArray || []).forEach((item) => {
      if (item.name && item.name.trim()) {
        specsObject[item.name.trim()] = item.value || '';
      }
    });

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand,
      category: formData.category,
      subcategory: formData.subcategory,
      subSubcategory: formData.subSubcategory,
      displayOrder: parseInt(formData.displayOrder, 10) || 1,
      categoryLabel: formData.categoryLabel,
      modelYear: formData.modelYear,
      status: statusToApply,
      tagline: formData.shortDescription.trim(),
      shortDescription: formData.shortDescription.trim(),
      overview: formData.fullDescription.trim(),
      fullDescription: formData.fullDescription.trim(),
      heroImage: formData.heroImage,
      mainImage: formData.heroImage,
      gallery: formData.galleryImages,
      galleryImages: formData.galleryImages,
      brochureUrl: formData.brochureUrl || '',
      brochureAvailable: Boolean(formData.brochureUrl),
      specs: specsObject,
      specsArray: formData.specsArray,
      features: formData.featuresArray,
      featuresArray: formData.featuresArray,
      whyT9Benefits: formData.highlightsArray,
      highlightsArray: formData.highlightsArray,
      slug: (formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)+/g, ''),
      seoTitle: formData.seoTitle || formData.name,
      metaDescription: formData.metaDescription || '',
    };

    try {
      if (isEditing) {
        await vehicleService.updateVehicle(id, payload);
        setSaveSuccessMsg(`Product "${formData.name}" updated successfully.`);
      } else {
        const created = await vehicleService.saveVehicle(payload);
        setSaveSuccessMsg(`Product "${created?.name || formData.name}" created successfully.`);
        if (created?.id) {
          setTimeout(() => {
            navigate(`/admin/products/${created.id}/edit`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      setSaveErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (isEditing) {
      navigate(`/admin/products/${id}/preview`);
    } else {
      alert('Please save draft or publish product first to preview.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xs border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
                {isEditing ? `Edit Product: ${formData.name}` : 'Add New Product'}
              </h2>
              <StatusBadge status={formData.status} />
            </div>
            <p className="text-xs text-gray-500 font-mono">
              /products/{formData.slug || 'new-model'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Toast Notifications */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main CMS Form Grid */}
      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            1. Basic Product Information & Hierarchy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g. JAC T9 Hunter"
              required
              value={formData.name}
              onChange={handleNameChange}
              error={formErrors.name}
            />

            <Select
              label="Brand"
              required
              value={formData.brand}
              onChange={(e) => updateFormField('brand', e.target.value)}
              options={[
                { value: 'JAC', label: 'JAC Motors' },
                { value: 'Dongfeng', label: 'Dongfeng' },
              ]}
            />

            <Select
              label="Product Category"
              required
              value={formData.category}
              onChange={(e) => {
                const cat = e.target.value;
                let sub = 'hunter';
                let label = 'JAC T9';
                let brand = 'JAC';
                if (cat === 'jac-commercial') {
                  sub = 'x200';
                  label = 'JAC Commercial';
                  brand = 'JAC';
                } else if (cat === 'dongfeng') {
                  sub = 'heavy';
                  label = 'Dongfeng Heavy';
                  brand = 'Dongfeng';
                }
                setFormData((prev) => ({
                  ...prev,
                  category: cat,
                  brand,
                  subcategory: sub,
                  subSubcategory: cat === 'dongfeng' ? 'prime-movers' : null,
                  categoryLabel: label,
                }));
              }}
              options={[
                { value: 'jac-t9', label: '1. JAC T9' },
                { value: 'jac-commercial', label: '2. JAC Commercial' },
                { value: 'dongfeng', label: '3. Dongfeng' },
              ]}
            />
          </div>

          {/* Subcategory selectors based on selected category */}
          {formData.category === 'jac-t9' && (
            <div className="animate-fadeIn">
              <Select
                label="JAC T9 Model Subcategory"
                value={formData.subcategory || 'hunter'}
                onChange={(e) => updateFormField('subcategory', e.target.value)}
                options={[
                  { value: 'hunter', label: 'Hunter' },
                  { value: 'frison', label: 'Frison' },
                ]}
              />
            </div>
          )}

          {formData.category === 'jac-commercial' && (
            <div className="animate-fadeIn">
              <Select
                label="Commercial Model Subcategory"
                value={formData.subcategory || 'x200'}
                onChange={(e) => updateFormField('subcategory', e.target.value)}
                options={[
                  { value: 'x200', label: 'X200 (1.15-Ton)' },
                  { value: '1020', label: '1020 (3.5-Ton)' },
                  { value: '1042', label: '1042 (14-Foot)' },
                  { value: '1091', label: '1091 (17-Foot)' },
                  { value: '1120', label: '1120 (20-Foot)' },
                ]}
              />
            </div>
          )}

          {formData.category === 'dongfeng' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              <Select
                label="Dongfeng Subcategory"
                value={formData.subcategory || 'heavy'}
                onChange={(e) => {
                  const sub = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    subcategory: sub,
                    subSubcategory: sub === 'heavy' ? 'prime-movers' : null,
                    categoryLabel: sub === 'heavy' ? 'Dongfeng Heavy' : 'Dongfeng Light',
                  }));
                }}
                options={[
                  { value: 'heavy', label: 'Heavy' },
                  { value: 'light', label: 'Light' },
                ]}
              />

              {formData.subcategory === 'heavy' && (
                <Select
                  label="Heavy Sub-Subcategory"
                  value={formData.subSubcategory || 'prime-movers'}
                  onChange={(e) => updateFormField('subSubcategory', e.target.value)}
                  options={[
                    { value: 'prime-movers', label: 'Prime Movers' },
                    { value: 'rigid', label: 'Rigid' },
                  ]}
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Display Order (Reordering)"
              type="number"
              placeholder="1"
              value={formData.displayOrder ?? 1}
              onChange={(e) => updateFormField('displayOrder', parseInt(e.target.value, 10) || 1)}
            />

            <Input
              label="Model Year"
              placeholder="2026"
              value={formData.modelYear}
              onChange={(e) => updateFormField('modelYear', e.target.value)}
            />

            <Select
              label="Publishing Status"
              value={formData.status}
              onChange={(e) => updateFormField('status', e.target.value)}
              options={[
                { value: 'Published', label: 'Published (Live)' },
                { value: 'Available', label: 'Available (In Showroom)' },
                { value: 'Sold', label: 'Sold' },
                { value: 'Coming Soon', label: 'Coming Soon' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Hidden', label: 'Hidden' },
              ]}
            />
          </div>

          <Input
            label="Short Description / Tagline"
            placeholder="e.g. Flagship 4x4 double cabin engineered for tough mountain terrain."
            required
            value={formData.shortDescription}
            onChange={(e) => updateFormField('shortDescription', e.target.value)}
            error={formErrors.shortDescription}
          />

          <Textarea
            label="Full Detailed Description"
            placeholder="Write full product overview, interior comfort features, engine capabilities..."
            rows={4}
            value={formData.fullDescription}
            onChange={(e) => updateFormField('fullDescription', e.target.value)}
          />
        </Card>

        {/* Section 2: Product Images & Brochure */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            2. Product Media & Brochure Uploader
          </h3>

          <VehicleImageUploader
            mainImage={formData.heroImage}
            gallery={formData.galleryImages}
            onMainImageChange={(url) => updateFormField('heroImage', url)}
            onGalleryChange={(urls) => updateFormField('galleryImages', urls)}
          />

          <div className="pt-4 border-t border-gray-100">
            <BrochureUploader
              brochureUrl={formData.brochureUrl}
              onBrochureChange={(url) => updateFormField('brochureUrl', url)}
              vehicleName={formData.name || 'Product'}
            />
          </div>
        </Card>

        {/* Section 3: Dynamic Technical Specifications */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            3. Dynamic Technical Specifications
          </h3>

          <SpecificationEditor
            specifications={formData.specsArray}
            onChange={(newSpecs) => updateFormField('specsArray', newSpecs)}
          />
        </Card>

        {/* Section 4: Dynamic Product Features */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            4. Dynamic Features & Equipment
          </h3>

          <FeatureEditor
            features={formData.featuresArray}
            onChange={(newFeatures) => updateFormField('featuresArray', newFeatures)}
          />
        </Card>

        {/* Section 5: Key Highlights */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            5. Key Product Highlights
          </h3>

          <HighlightsEditor
            highlights={formData.highlightsArray}
            onChange={(newHighlights) => updateFormField('highlightsArray', newHighlights)}
          />
        </Card>

        {/* Section 6: SEO Settings */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <div
            className="flex items-center justify-between cursor-pointer select-none border-b border-gray-100 pb-2"
            onClick={() => setSeoExpanded(!seoExpanded)}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C8102E]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                6. SEO Settings & Custom URL Slug
              </h3>
            </div>
            {seoExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>

          {seoExpanded && (
            <div className="space-y-4 pt-2 animate-fadeIn">
              <Input
                label="URL Slug"
                placeholder="e.g. t9-hunter"
                value={formData.slug}
                onChange={(e) => updateFormField('slug', e.target.value)}
                helperText={`Public URL: /products/${formData.slug}`}
              />

              <Input
                label="SEO Page Title"
                placeholder="JAC T9 Double Cabin 4x4 Pickup Truck"
                value={formData.seoTitle}
                onChange={(e) => updateFormField('seoTitle', e.target.value)}
              />

              <Textarea
                label="Meta Description"
                placeholder="Discover official specifications, features, and quote request for JAC T9."
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => updateFormField('metaDescription', e.target.value)}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Section 7: Sticky Bottom Publishing Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#111827] text-white border-t-2 border-[#C8102E] p-4 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Current Status:</span>
            <StatusBadge status={formData.status} />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSave('Draft')}
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Draft'}
            </Button>

            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSaving}
                onClick={handlePreview}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Preview
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSave('Published')}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              className="uppercase font-bold tracking-wider"
            >
              {isSaving ? 'Saving...' : 'Publish Product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleEdit;
