import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, CheckCircle2, Home, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { contentService } from '../../../services/contentService';
import { vehicleService } from '../../../services/vehicleService';

export const HomepageCMS = () => {
  const [content, setContent] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    document.title = 'Homepage CMS | Admin CMS';
    let isMounted = true;
    const load = async () => {
      const [list, data] = await Promise.all([
        vehicleService.getVehicles(),
        contentService.getHomepageContent(),
      ]);
      if (isMounted) {
        if (list) setVehicles(list);
        if (data) setContent(data);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await contentService.saveHomepageContent(content);
      setSaveSuccessMsg('Homepage content updated successfully.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const toggleFeaturedVehicle = (vId) => {
    const current = content.featuredVehicleIds || [];
    const updated = current.includes(vId)
      ? current.filter((id) => id !== vId)
      : [...current, vId];

    setContent({ ...content, featuredVehicleIds: updated });
  };

  if (!content) {
    return <div className="p-8 text-center font-bold text-gray-500">Loading Homepage Content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
            Homepage Content Manager
          </h2>
          <p className="text-xs text-gray-500">
            Manage homepage hero text, CTAs, hero background images, and featured vehicles selection.
          </p>
        </div>

        <Link to="/admin/content/homepage/hero-images">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ImageIcon className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Manage Hero Images
          </Button>
        </Link>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Configuration */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Home className="w-4 h-4 text-[#C8102E]" /> Hero Banner Content
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Eyebrow Tagline"
              value={content.hero.eyebrow}
              onChange={(e) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, eyebrow: e.target.value },
                })
              }
            />

            <Input
              label="Hero Headline"
              value={content.hero.title}
              onChange={(e) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, title: e.target.value },
                })
              }
            />
          </div>

          <Textarea
            label="Supporting Description"
            rows={2}
            value={content.hero.description}
            onChange={(e) =>
              setContent({
                ...content,
                hero: { ...content.hero, description: e.target.value },
              })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary CTA Text"
              value={content.hero.primaryCtaText}
              onChange={(e) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, primaryCtaText: e.target.value },
                })
              }
            />

            <Input
              label="Secondary CTA Text"
              value={content.hero.secondaryCtaText}
              onChange={(e) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, secondaryCtaText: e.target.value },
                })
              }
            />
          </div>

          <Input
            label="Hero Image URL"
            value={content.hero.heroImage}
            onChange={(e) =>
              setContent({
                ...content,
                hero: { ...content.hero, heroImage: e.target.value },
              })
            }
          />
        </Card>

        {/* Featured Pickup Selection */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8102E]" /> Featured Pickup Section
          </h3>

          <p className="text-xs text-gray-600">
            Select a published vehicle to spotlight in the main Featured Pickup section on the homepage:
          </p>

          <div className="max-w-md">
            <label htmlFor="featured-pickup-select" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Featured Pickup Vehicle
            </label>
            <select
              id="featured-pickup-select"
              value={
                vehicles.find(
                  (v) => v.id === content.featuredPickupId || v.slug === content.featuredPickupId
                )?.id || ''
              }
              onChange={(e) =>
                setContent({
                  ...content,
                  featuredPickupId: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xs text-xs font-medium text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E]"
            >
              <option value="">-- None (No Featured Pickup) --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.categoryLabel || v.category})
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Featured Vehicles Selection */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8102E]" /> Featured Vehicles Section
          </h3>

          <p className="text-xs text-gray-600">
            Check which vehicles should appear on the homepage Featured Vehicles carousel:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {vehicles.map((v) => {
              const isChecked = (content.featuredVehicleIds || []).includes(v.id);
              return (
                <div
                  key={v.id}
                  className={`p-3 border rounded-xs flex items-center gap-3 transition-colors ${
                    isChecked ? 'bg-red-50/50 border-[#C8102E]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Checkbox
                    id={`feat-${v.id}`}
                    checked={isChecked}
                    onChange={() => toggleFeaturedVehicle(v.id)}
                    label={v.name}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            Save Homepage Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
