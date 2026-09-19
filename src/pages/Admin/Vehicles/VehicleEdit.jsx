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
    category: 'passengers',
    subcategory: null,
    categoryLabel: 'Passenger',
    modelYear: '2026',
    status: 'Published',
    shortDescription: '',
    fullDescription: '',
    heroImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
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
      { title: '10.4-inch Infotainment Screen', description: 'Apple CarPlay & Android Auto integration' },
      { title: '360-Degree HD Camera', description: 'Blindspot monitoring and parking sensors' },
      { title: 'Leather Upholstery', description: '8-way power adjustable seats' },
    ],
    highlightsArray: [
      { title: 'Capability', description: 'Engineered for demanding terrain and heavy commercial payloads.' },
      { title: 'Comfort', description: 'Spacious 5-seater cabin with luxury finishes.' },
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

  // Load existing vehicle if editing
  useEffect(() => {
    let isMounted = true;
    const loadVehicle = async () => {
      if (isEditing) {
        document.title = 'Edit Vehicle | Admin CMS';
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

            setFormData({
              name: existing.name || '',
              category: existing.category || 'passengers',
              subcategory: existing.subcategory || null,
              categoryLabel: existing.categoryLabel || 'Passenger',
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
              seoTitle: existing.seoTitle || '',
              metaDescription: existing.metaDescription || '',
              slug: existing.slug || '',
            });
          }
        } catch (err) {
          console.error('Error loading vehicle:', err);
        }
      } else {
        document.title = 'Add New Vehicle | Admin CMS';
        if (queryCategory) {
          const cat = queryCategory === 'trucks' ? 'trucks' : 'passengers';
          const subcat = cat === 'trucks' ? (querySubcategory === 'light' ? 'light' : 'heavy') : null;
          const catLabel = cat === 'passengers' ? 'Passenger' : (subcat === 'heavy' ? 'Heavy Truck' : 'Light Truck');

          setFormData((prev) => ({
            ...prev,
            category: cat,
            subcategory: subcat,
            categoryLabel: catLabel,
          }));
        }
      }
    };

    loadVehicle();
    return () => {
      isMounted = false;
    };
  }, [id, isEditing, queryCategory, querySubcategory]);

  // Input change helper using functional state update to prevent stale closures
  const updateFormField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Auto-generate URL slug when name changes
  const handleNameChange = (e) => {
    const newName = e.target.value;
    const generatedSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: isEditing ? prev.slug : (prev.slug || generatedSlug),
      seoTitle: prev.seoTitle || newName,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!validateRequired(formData.name)) {
      errors.name = 'Vehicle Name is required';
    }
    if (!validateRequired(formData.category)) {
      errors.category = 'Vehicle Category is required';
    }
    if (formData.category === 'trucks') {
      if (!formData.subcategory || (formData.subcategory !== 'heavy' && formData.subcategory !== 'light')) {
        errors.subcategory = 'Truck Type (Heavy or Light) is required for trucks';
      }
    }
    if (!validateRequired(formData.shortDescription)) {
      errors.shortDescription = 'Short Description is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (targetStatus = 'Published') => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        categoryLabel: formData.categoryLabel,
        modelYear: formData.modelYear,
        status: targetStatus,
        shortDescription: formData.shortDescription,
        tagline: formData.shortDescription,
        fullDescription: formData.fullDescription,
        description: formData.fullDescription,
        overview: formData.fullDescription,
        heroImage: formData.heroImage,
        mainImage: formData.heroImage,
        galleryImages: formData.galleryImages,
        gallery: formData.galleryImages,
        brochureUrl: formData.brochureUrl,
        brochureAvailable: Boolean(formData.brochureUrl),
        specsArray: formData.specsArray,
        specs: formData.specsArray,
        featuresArray: formData.featuresArray,
        features: formData.featuresArray,
        highlightsArray: formData.highlightsArray,
        whyT9Benefits: formData.highlightsArray,
        seoTitle: formData.seoTitle,
        metaDescription: formData.metaDescription,
        slug: formData.slug,
      };

      if (isEditing) {
        const updated = await vehicleService.updateVehicle(id, payload);
        if (updated) {
          setFormData((prev) => ({
            ...prev,
            name: updated.name || prev.name,
            category: updated.category || prev.category,
            subcategory: updated.subcategory || prev.subcategory,
            categoryLabel: updated.categoryLabel || prev.categoryLabel,
            status: updated.status || targetStatus,
            shortDescription: updated.shortDescription || updated.tagline || prev.shortDescription,
            fullDescription: updated.fullDescription || updated.overview || prev.fullDescription,
            heroImage: updated.heroImage || updated.mainImage || prev.heroImage,
            galleryImages: updated.galleryImages || updated.gallery || prev.galleryImages,
            brochureUrl: updated.brochureUrl || prev.brochureUrl,
            slug: updated.slug || prev.slug,
            stockStatus: updated.stockStatus || prev.stockStatus,
            stockQuantity: updated.stockQuantity ?? prev.stockQuantity,
          }));
          setSaveSuccessMsg(`Vehicle "${updated.name}" saved successfully to PostgreSQL database.`);
        }
      } else {
        const created = await vehicleService.saveVehicle(payload);
        setSaveSuccessMsg(`Vehicle "${created?.name || formData.name}" created successfully.`);
        if (created?.id) {
          setTimeout(() => {
            navigate(`/admin/vehicles/${created.id}/edit`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Save vehicle error:', err);
      setSaveErrorMsg(err.message || 'Failed to save vehicle.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (isEditing) {
      navigate(`/admin/vehicles/${id}/preview`);
    } else {
      alert('Please save draft or publish vehicle first to preview.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/vehicles"
            className="p-2 rounded-xs border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
                {isEditing ? `Edit Vehicle: ${formData.name}` : 'Add New Vehicle'}
              </h2>
              <StatusBadge status={formData.status} />
            </div>
            <p className="text-xs text-gray-500 font-mono">
              /vehicles/{formData.slug || 'new-model'}
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
            1. Basic Vehicle Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Vehicle Name"
              placeholder="e.g. JAC T9 4x4"
              required
              value={formData.name}
              onChange={handleNameChange}
              error={formErrors.name}
            />

            <Select
              label="Vehicle Category"
              required
              value={formData.category}
              onChange={(e) => {
                const cat = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  category: cat,
                  subcategory: cat === 'trucks' ? 'heavy' : null,
                  categoryLabel: cat === 'passengers' ? 'Passenger' : 'Heavy Truck',
                }));
              }}
              options={[
                { value: 'passengers', label: 'Passenger Vehicle' },
                { value: 'trucks', label: 'Commercial Truck' },
              ]}
            />
          </div>

          {formData.category === 'trucks' && (
            <div className="animate-fadeIn">
              <Select
                label="Truck Subcategory Type"
                value={formData.subcategory || 'heavy'}
                onChange={(e) => {
                  const sub = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    subcategory: sub,
                    categoryLabel: sub === 'heavy' ? 'Heavy Truck' : 'Light Truck',
                  }));
                }}
                error={formErrors.subcategory}
                options={[
                  { value: 'heavy', label: 'Heavy Truck' },
                  { value: 'light', label: 'Light Truck' },
                ]}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="Write full vehicle overview, interior comfort features, engine capabilities..."
            rows={4}
            value={formData.fullDescription}
            onChange={(e) => updateFormField('fullDescription', e.target.value)}
          />
        </Card>

        {/* Section 2: Vehicle Images */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            2. Vehicle Media & Gallery Uploader
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
              vehicleName={formData.name || 'Vehicle'}
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

        {/* Section 4: Dynamic Vehicle Features */}
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
            5. Key Vehicle Highlights
          </h3>

          <HighlightsEditor
            highlights={formData.highlightsArray}
            onChange={(newHighlights) => updateFormField('highlightsArray', newHighlights)}
          />
        </Card>

        {/* Section 6: SEO Settings (Collapsible Accordion) */}
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
                placeholder="e.g. jac-t9"
                value={formData.slug}
                onChange={(e) => updateFormField('slug', e.target.value)}
                helperText={`Public URL: /vehicles/${formData.slug}`}
              />

              <Input
                label="SEO Page Title"
                placeholder="JAC T9 Double Cabin 4x4 Pickup Truck"
                value={formData.seoTitle}
                onChange={(e) => updateFormField('seoTitle', e.target.value)}
              />

              <Textarea
                label="Meta Description"
                placeholder="Discover official specifications, features, and test drive booking for JAC T9."
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
              {isSaving ? 'Saving to Database...' : 'Publish Vehicle'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
