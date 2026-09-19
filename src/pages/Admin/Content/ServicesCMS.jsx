import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CheckCircle2, AlertCircle, Wrench, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { contentService } from '../../../services/contentService';
import { SERVICES_DATA } from '../../../data/services';

export const ServicesCMS = () => {
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
        if (isMounted) {
          setServicesList(Array.isArray(data) && data.length > 0 ? data : SERVICES_DATA);
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
      await contentService.saveServicesContent(servicesList);
      setSaveSuccessMsg('Services content saved successfully.');
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
      title: 'New Service',
      badge: '3S Desk',
      description: 'Authorized 3S dealership service description.',
      details: 'Full service specifications and maintenance details.',
      features: ['Feature 1', 'Feature 2'],
      ctaText: 'Learn More',
      ctaLink: '/contact',
      iconName: 'Wrench',
    };
    setServicesList([...servicesList, newService]);
  };

  const handleRemoveService = (index) => {
    const updated = servicesList.filter((_, idx) => idx !== index);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
            Services Content Manager
          </h2>
          <p className="text-xs text-gray-500">
            Add, edit, or delete dealership service offerings displayed on the website.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleAddService}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Add Service
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
        {servicesList.map((service, idx) => (
          <Card key={service.id || idx} className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#C8102E]" />
                <h3 className="text-sm font-extrabold uppercase text-gray-900">
                  Service #{idx + 1}: {service.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveService(idx)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Service Title"
                value={service.title || ''}
                onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
              />

              <Input
                label="Badge Tag"
                value={service.badge || ''}
                onChange={(e) => handleServiceChange(idx, 'badge', e.target.value)}
              />
            </div>

            <Textarea
              label="Short Description"
              rows={2}
              value={service.description || ''}
              onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
            />

            <Textarea
              label="Expanded Modal Details"
              rows={3}
              value={service.details || ''}
              onChange={(e) => handleServiceChange(idx, 'details', e.target.value)}
            />
          </Card>
        ))}

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
