import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { contentService } from '../../../services/contentService';
import { DEFAULT_ABOUT_CONTENT } from '../../../data/about';

export const AboutCMS = () => {
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'About Content CMS | Admin CMS';
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await contentService.getAboutContent();
        if (isMounted) {
          setContent(data || DEFAULT_ABOUT_CONTENT);
        }
      } catch (err) {
        console.error('Error loading About CMS content:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to load About Us content from API.');
          setContent(DEFAULT_ABOUT_CONTENT);
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
      await contentService.saveAboutContent(content);
      setSaveSuccessMsg('About page content updated successfully.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save About CMS error:', err);
      setErrorMsg(err.message || 'Failed to save About page content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading About Us Content...</span>
      </div>
    );
  }

  const heroData = content?.hero || DEFAULT_ABOUT_CONTENT.hero;
  const whoWeAreData = content?.whoWeAre || DEFAULT_ABOUT_CONTENT.whoWeAre;
  const commitmentData = content?.commitment || DEFAULT_ABOUT_CONTENT.commitment;
  const missionData = content?.mission ?? DEFAULT_ABOUT_CONTENT.mission;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
          About Us Content Manager
        </h2>
        <p className="text-xs text-gray-500">
          Manage dealership introduction text, core values, mission statement, and commitment.
        </p>
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
        {/* Page Hero Header */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#C8102E]" /> Hero & Overview Section
          </h3>

          <Input
            label="Hero Title"
            value={heroData.title || ''}
            onChange={(e) =>
              setContent({
                ...content,
                hero: { ...heroData, title: e.target.value },
              })
            }
          />

          <Textarea
            label="Hero Subtitle"
            rows={2}
            value={heroData.subtitle || ''}
            onChange={(e) =>
              setContent({
                ...content,
                hero: { ...heroData, subtitle: e.target.value },
              })
            }
          />
        </Card>

        {/* Who We Are */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            Who We Are Section
          </h3>

          <Input
            label="Section Heading"
            value={whoWeAreData.heading || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...whoWeAreData, heading: e.target.value },
              })
            }
          />

          <Textarea
            label="Section Description"
            rows={4}
            value={whoWeAreData.description || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...whoWeAreData, description: e.target.value },
              })
            }
          />

          <Textarea
            label="Official Notice / Disclaimer"
            rows={2}
            value={whoWeAreData.notice || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...whoWeAreData, notice: e.target.value },
              })
            }
          />
        </Card>

        {/* Mission & Commitment */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            Mission & Commitment Statements
          </h3>

          <Textarea
            label="Mission Statement"
            rows={3}
            value={missionData || ''}
            onChange={(e) => setContent({ ...content, mission: e.target.value })}
          />

          <Input
            label="Commitment Heading"
            value={commitmentData.heading || ''}
            onChange={(e) =>
              setContent({
                ...content,
                commitment: { ...commitmentData, heading: e.target.value },
              })
            }
          />

          <Textarea
            label="Commitment Description"
            rows={3}
            value={commitmentData.description || ''}
            onChange={(e) =>
              setContent({
                ...content,
                commitment: { ...commitmentData, description: e.target.value },
              })
            }
          />
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            size="md"
            leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            {saving ? 'Saving...' : 'Save About Content'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AboutCMS;
