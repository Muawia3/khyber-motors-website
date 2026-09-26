import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CheckCircle2, AlertCircle, Wrench, Loader2, ArrowUp, ArrowDown, Eye, EyeOff, Phone, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { contentService } from '../../../services/contentService';
import { SERVICES_DATA } from '../../../data/services';

export const ServicesCMS = () => {
  const [hero, setHero] = useState({
    title: 'Professional Support Beyond the Sale',
    subtitle: 'From double cabin vehicle sales to certified after-sales service, genuine spare parts, and vehicle maintenance, our team ensures complete operational reliability.',
  });
  const [workshopInfo, setWorkshopInfo] = useState({
    title: '3S Workshop Hours',
    hours: 'Monday – Saturday: 8:30 AM – 5:30 PM\nSunday: Emergency Service Only',
    phoneLabel: 'Service Direct',
    emergencyPhone: '+92 300 7654321',
  });
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Services CMS | Admin CMS';
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await contentService.getServicesContent();
        if (isMounted && data) {
          if (Array.isArray(data)) {
            setServicesList(data.length > 0 ? data : SERVICES_DATA);
          } else if (data.services && Array.isArray(data.services)) {
            if (data.hero) setHero(data.hero);
            if (data.workshopInfo) setWorkshopInfo(data.workshopInfo);
            setServicesList(data.services.length > 0 ? data.services : SERVICES_DATA);
          } else {
            setServicesList(SERVICES_DATA);
          }
        }
      } catch (err) {
        console.error('Error loading Services CMS content:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to load Services content from API.');
          setServicesList(SERVICES_DATA);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        hero,
        workshopInfo,
        services: servicesList.map((srv, idx) => ({
          ...srv,
          displayOrder: idx + 1,
          features: Array.isArray(srv.features)
            ? srv.features
            : typeof srv.features === 'string'
            ? srv.features.split('\n').map((f) => f.trim()).filter(Boolean)
            : [],
        })),
      };

      await contentService.saveServicesContent(payload);
      setSaveSuccessMsg('Services page content saved successfully to database.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save Services CMS error:', err);
      setErrorMsg(err.message || 'Failed to save Services content.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = () => {
    const newService = {
      id: `srv-${Date.now()}`,
      slug: `service-${Date.now()}`,
      title: 'New Dealership Service',
      badge: '3S Service Desk',
      description: 'Comprehensive dealership service description for vehicle owners and fleet operators.',
      details: 'Full service specifications, factory maintenance protocols, and diagnostic details.',
      features: ['Factory OEM certified diagnostic scan', 'Comprehensive health report & warranty check'],
      ctaText: 'Inquire Now',
      ctaLink: '/contact',
      iconName: 'Wrench',
      isActive: true,
      displayOrder: servicesList.length + 1,
    };
    setServicesList([...servicesList, newService]);
  };

  const handleRemoveService = (index) => {
    const updated = servicesList.filter((_, idx) => idx !== index);
    setServicesList(updated);
  };

  const handleMoveService = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= servicesList.length) return;
    const updated = [...servicesList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setServicesList(updated);
  };

  const handleServiceChange = (index, key, val) => {
    const updated = servicesList.map((srv, idx) => {
      if (idx === index) {
        return { ...srv, [key]: val };
      }
      return srv;
    });
    setServicesList(updated);
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Services Content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
            Services Content Manager
          </h2>
          <p className="text-xs text-gray-500">
            Edit, reorder, add, or unpublish core dealership service offerings.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleAddService}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Add New Service
        </Button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Services Page Hero Header */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            1. Services Page Hero Header
          </h3>

          <Input
            label="Page Hero Title"
            value={hero.title || ''}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
          />

          <Textarea
            label="Page Hero Subtitle"
            rows={2}
            value={hero.subtitle || ''}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
          />
        </Card>

        {/* Workshop Operating Hours & Days */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C8102E]" /> 2. 3S Workshop Operating Hours & Schedule
          </h3>

          <Input
            label="Section Heading Title"
            value={workshopInfo.title || ''}
            onChange={(e) => setWorkshopInfo({ ...workshopInfo, title: e.target.value })}
            placeholder="3S Workshop Hours"
          />

          <Textarea
            label="Operating Hours & Days (Multiline Text)"
            rows={3}
            value={workshopInfo.hours || ''}
            onChange={(e) => setWorkshopInfo({ ...workshopInfo, hours: e.target.value })}
            placeholder="Monday – Saturday: 8:30 AM – 5:30 PM&#10;Sunday: Emergency Service Only"
            helperText="Specify workshop operating days and timing line by line."
          />
        </Card>

        {/* Individual Services Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
            3. Dealership Services List ({servicesList.length} Items)
          </h3>

          {servicesList.map((service, idx) => {
            const featuresText = Array.isArray(service.features)
              ? service.features.join('\n')
              : service.features || '';

            return (
              <Card key={service.id || idx} className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#C8102E]" />
                    <h4 className="text-sm font-extrabold uppercase text-gray-900">
                      Service #{idx + 1}: {service.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider ${
                        service.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {service.isActive !== false ? 'Published' : 'Unpublished (Hidden)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveService(idx, -1)}
                      className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === servicesList.length - 1}
                      onClick={() => handleMoveService(idx, 1)}
                      className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleServiceChange(idx, 'isActive', !(service.isActive !== false))}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer ml-2"
                    >
                      {service.isActive !== false ? <EyeOff className="w-3.5 h-3.5 text-gray-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                      {service.isActive !== false ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Service Title"
                    value={service.title || ''}
                    onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                  />

                  <Input
                    label="Badge Tag / Category"
                    value={service.badge || ''}
                    onChange={(e) => handleServiceChange(idx, 'badge', e.target.value)}
                  />

                  <Select
                    label="Icon"
                    value={service.iconName || 'Wrench'}
                    onChange={(e) => handleServiceChange(idx, 'iconName', e.target.value)}
                    options={[
                      { value: 'Car', label: 'Car (Sales)' },
                      { value: 'ShieldCheck', label: 'ShieldCheck (After-Sales)' },
                      { value: 'PackageCheck', label: 'PackageCheck (Parts)' },
                      { value: 'Wrench', label: 'Wrench (Maintenance)' },
                      { value: 'Headphones', label: 'Headphones (Support)' },
                    ]}
                  />
                </div>

                <Textarea
                  label="Short Card Description"
                  rows={2}
                  value={service.description || ''}
                  onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                />

                <Textarea
                  label="Expanded Learn More Modal Details"
                  rows={3}
                  value={service.details || ''}
                  onChange={(e) => handleServiceChange(idx, 'details', e.target.value)}
                />

                <Textarea
                  label="Key Features (One feature per line)"
                  rows={3}
                  value={featuresText}
                  onChange={(e) => handleServiceChange(idx, 'features', e.target.value.split('\n'))}
                  helperText="Enter each feature on a separate new line."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Button CTA Text"
                    value={service.ctaText || ''}
                    onChange={(e) => handleServiceChange(idx, 'ctaText', e.target.value)}
                  />

                  <Input
                    label="Button CTA Link"
                    value={service.ctaLink || ''}
                    onChange={(e) => handleServiceChange(idx, 'ctaLink', e.target.value)}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            size="md"
            leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            {saving ? 'Saving...' : 'Save Services Content'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServicesCMS;
