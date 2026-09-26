import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Info, Loader2, Plus, Trash2, Building2, ShieldCheck, Sparkles, Users } from 'lucide-react';
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
        if (isMounted && data) {
          setContent({
            ...DEFAULT_ABOUT_CONTENT,
            ...data,
            hero: { ...DEFAULT_ABOUT_CONTENT.hero, ...(data.hero || {}) },
            whoWeAre: { ...DEFAULT_ABOUT_CONTENT.whoWeAre, ...(data.whoWeAre || {}) },
            facilityOverview: Array.isArray(data.facilityOverview) ? data.facilityOverview : [
              { title: '3S Integrated Facility', description: 'Sales showroom, aftersales service workshop, and genuine parts counter under one roof.' },
              { title: 'Diagnostic & Service Machinery', description: 'Computerized diagnostic bay tools, hydraulic vehicle lifts, and alignment stations.' },
              { title: 'Customer Hospitality Lounge', description: 'Air-conditioned executive waiting lounge with transparent workshop view and refreshments.' }
            ],
            commitment: {
              heading: data.commitment?.heading || 'Our Commitment to Quality & Transparency',
              cards: Array.isArray(data.commitment?.cards) ? data.commitment.cards : [
                { title: 'Authentic Manufacturer Parts', description: 'We utilize only 100% genuine factory OEM parts and approved lubricants, ensuring safety, durability, and factory warranty compliance.', iconName: 'ShieldCheck' },
                { title: 'Transparent Operations', description: 'Every vehicle consultation, cost estimate, and maintenance recommendation is communicated clearly without hidden charges or unverified fees.', iconName: 'Building2' },
                { title: 'Professional Standards', description: 'Our technicians and sales advisors undergo continuous technical training according to standard JAC Motors operational guidelines.', iconName: 'Wrench' }
              ]
            },
            whyUs: {
              heading: data.whyUs?.heading || 'Why Customers Choose Us',
              advantages: Array.isArray(data.whyUs?.advantages) ? data.whyUs.advantages : [
                { title: 'Full 3S Facility Integration', description: 'Consolidated showroom sales, after-sales service, and spare parts under a single facility for simplified customer management.' },
                { title: 'Commercial Fleet Expertise', description: 'Specialized fleet consultation for logistics businesses, commercial haulers, and corporate organizations.' },
                { title: 'Warranty Claim Support', description: 'Official factory warranty handling, diagnostic reporting, and replacement part processing for covered components.' },
                { title: 'Direct Helpline & Support Desk', description: 'Dedicated telephone and digital help channels for prompt customer assistance and service appointment scheduling.' }
              ]
            },
            teamStructure: {
              heading: data.teamStructure?.heading || 'Our Professional Team Structure',
              subtitle: data.teamStructure?.subtitle || 'Departmental overview with placeholder management roles ready for verified staff designations.',
              departments: Array.isArray(data.teamStructure?.departments) ? data.teamStructure.departments : [
                { title: 'Dealership Management', role: 'Executive Direction', description: 'Oversees facility operations, manufacturer compliance, and customer satisfaction standards.' },
                { title: 'Sales & Fleet Advisory', role: 'Commercial Consultants', description: 'Guides individual buyers and corporate clients through vehicle selection, options, and test drives.' },
                { title: 'Service & Workshop Engineers', role: 'Technical Operations', description: 'Certified mechanics executing computerized diagnostics, maintenance, and major overhauls.' },
                { title: 'Customer Support Desk', role: 'Client Relations', description: 'Handles appointments, phone inquiries, warranty documentation, and customer feedback.' }
              ]
            },
            location: {
              heading: data.location?.heading || 'Dealership Address & Operating Schedule',
              schedule: data.location?.schedule || 'Showroom Hours: Mon – Sat (9:00 AM – 7:00 PM)'
            },
            cta: {
              heading: data.cta?.heading || 'Ready to Experience JAC Performance?',
              subtitle: data.cta?.subtitle || 'Visit our showroom to inspect our commercial vehicle lineup or speak with a representative today.'
            }
          });
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
      setSaveSuccessMsg('About page content saved successfully to database.');
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
          About Us Content Manager
        </h2>
        <p className="text-xs text-gray-500">
          Manage dealership introduction text, facility features, core principles, team structure, and CTA.
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
        {/* 1. Page Hero Header */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#C8102E]" /> 1. Page Hero Header
          </h3>

          <Input
            label="Hero Title"
            value={content.hero?.title || ''}
            onChange={(e) =>
              setContent({
                ...content,
                hero: { ...content.hero, title: e.target.value },
              })
            }
          />

          <Textarea
            label="Hero Subtitle"
            rows={2}
            value={content.hero?.subtitle || ''}
            onChange={(e) =>
              setContent({
                ...content,
                hero: { ...content.hero, subtitle: e.target.value },
              })
            }
          />
        </Card>

        {/* 2. Section 1: Who We Are */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C8102E]" /> 2. Section 1 — Who We Are
          </h3>

          <Input
            label="Section Heading"
            value={content.whoWeAre?.heading || content.whoWeAre?.title || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...content.whoWeAre, heading: e.target.value, title: e.target.value },
              })
            }
          />

          <Textarea
            label="Primary Paragraph (Description)"
            rows={3}
            value={content.whoWeAre?.description || content.whoWeAre?.content1 || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...content.whoWeAre, description: e.target.value, content1: e.target.value },
              })
            }
          />

          <Textarea
            label="Secondary Paragraph (Facility & Location Details)"
            rows={3}
            value={content.whoWeAre?.paragraph2 || content.whoWeAre?.content2 || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...content.whoWeAre, paragraph2: e.target.value, content2: e.target.value },
              })
            }
          />

          <Textarea
            label="Official Notice / Disclaimer Text"
            rows={2}
            value={content.whoWeAre?.notice || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whoWeAre: { ...content.whoWeAre, notice: e.target.value },
              })
            }
          />

          {/* Facility Overview Bullet Points */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Facility Overview Bullet Points ({content.facilityOverview?.length || 0} Items)
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  setContent({
                    ...content,
                    facilityOverview: [
                      ...(content.facilityOverview || []),
                      { title: 'New Facility Highlight', description: 'Description of facility equipment or lounge.' },
                    ],
                  })
                }
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Bullet
              </Button>
            </div>

            {(content.facilityOverview || []).map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Item #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.facilityOverview.filter((_, i) => i !== idx);
                      setContent({ ...content, facilityOverview: updated });
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <Input
                  label="Title"
                  value={item.title || ''}
                  onChange={(e) => {
                    const updated = [...content.facilityOverview];
                    updated[idx].title = e.target.value;
                    setContent({ ...content, facilityOverview: updated });
                  }}
                />
                <Input
                  label="Description"
                  value={item.description || ''}
                  onChange={(e) => {
                    const updated = [...content.facilityOverview];
                    updated[idx].description = e.target.value;
                    setContent({ ...content, facilityOverview: updated });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Section 2: Core Principles / Commitment */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C8102E]" /> 3. Section 2 — Core Principles & Commitment
          </h3>

          <Input
            label="Section Heading"
            value={content.commitment?.heading || ''}
            onChange={(e) =>
              setContent({
                ...content,
                commitment: { ...content.commitment, heading: e.target.value },
              })
            }
          />

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Commitment Cards ({content.commitment?.cards?.length || 0} Cards)
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  setContent({
                    ...content,
                    commitment: {
                      ...content.commitment,
                      cards: [
                        ...(content.commitment?.cards || []),
                        { title: 'New Core Principle', description: 'Core principle detail statement.', iconName: 'ShieldCheck' },
                      ],
                    },
                  })
                }
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Card
              </Button>
            </div>

            {(content.commitment?.cards || []).map((card, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Card #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.commitment.cards.filter((_, i) => i !== idx);
                      setContent({ ...content, commitment: { ...content.commitment, cards: updated } });
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <Input
                  label="Card Title"
                  value={card.title || ''}
                  onChange={(e) => {
                    const updated = [...content.commitment.cards];
                    updated[idx].title = e.target.value;
                    setContent({ ...content, commitment: { ...content.commitment, cards: updated } });
                  }}
                />
                <Textarea
                  label="Card Description"
                  rows={2}
                  value={card.description || ''}
                  onChange={(e) => {
                    const updated = [...content.commitment.cards];
                    updated[idx].description = e.target.value;
                    setContent({ ...content, commitment: { ...content.commitment, cards: updated } });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 4. Section 3: Why Customers Choose Us */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8102E]" /> 4. Section 3 — Advantages (Why Choose Us)
          </h3>

          <Input
            label="Section Heading"
            value={content.whyUs?.heading || ''}
            onChange={(e) =>
              setContent({
                ...content,
                whyUs: { ...content.whyUs, heading: e.target.value },
              })
            }
          />

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Advantage Items ({content.whyUs?.advantages?.length || 0} Items)
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  setContent({
                    ...content,
                    whyUs: {
                      ...content.whyUs,
                      advantages: [
                        ...(content.whyUs?.advantages || []),
                        { title: 'New Advantage', description: 'Details about dealership advantage.' },
                      ],
                    },
                  })
                }
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Advantage
              </Button>
            </div>

            {(content.whyUs?.advantages || []).map((adv, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Advantage #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.whyUs.advantages.filter((_, i) => i !== idx);
                      setContent({ ...content, whyUs: { ...content.whyUs, advantages: updated } });
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <Input
                  label="Title"
                  value={adv.title || ''}
                  onChange={(e) => {
                    const updated = [...content.whyUs.advantages];
                    updated[idx].title = e.target.value;
                    setContent({ ...content, whyUs: { ...content.whyUs, advantages: updated } });
                  }}
                />
                <Textarea
                  label="Description"
                  rows={2}
                  value={adv.description || ''}
                  onChange={(e) => {
                    const updated = [...content.whyUs.advantages];
                    updated[idx].description = e.target.value;
                    setContent({ ...content, whyUs: { ...content.whyUs, advantages: updated } });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 5. Section 4: Team Structure / Departments */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C8102E]" /> 5. Section 4 — Organizational Departments
          </h3>

          <Input
            label="Section Heading"
            value={content.teamStructure?.heading || ''}
            onChange={(e) =>
              setContent({
                ...content,
                teamStructure: { ...content.teamStructure, heading: e.target.value },
              })
            }
          />

          <Input
            label="Section Subtitle"
            value={content.teamStructure?.subtitle || ''}
            onChange={(e) =>
              setContent({
                ...content,
                teamStructure: { ...content.teamStructure, subtitle: e.target.value },
              })
            }
          />

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Department Cards ({content.teamStructure?.departments?.length || 0} Cards)
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  setContent({
                    ...content,
                    teamStructure: {
                      ...content.teamStructure,
                      departments: [
                        ...(content.teamStructure?.departments || []),
                        { title: 'New Department', role: 'Role / Designation', description: 'Department responsibilities description.' },
                      ],
                    },
                  })
                }
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Department
              </Button>
            </div>

            {(content.teamStructure?.departments || []).map((dept, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Department #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.teamStructure.departments.filter((_, i) => i !== idx);
                      setContent({ ...content, teamStructure: { ...content.teamStructure, departments: updated } });
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Department Title"
                    value={dept.title || ''}
                    onChange={(e) => {
                      const updated = [...content.teamStructure.departments];
                      updated[idx].title = e.target.value;
                      setContent({ ...content, teamStructure: { ...content.teamStructure, departments: updated } });
                    }}
                  />
                  <Input
                    label="Role / Designation Badge"
                    value={dept.role || ''}
                    onChange={(e) => {
                      const updated = [...content.teamStructure.departments];
                      updated[idx].role = e.target.value;
                      setContent({ ...content, teamStructure: { ...content.teamStructure, departments: updated } });
                    }}
                  />
                </div>
                <Textarea
                  label="Description"
                  rows={2}
                  value={dept.description || ''}
                  onChange={(e) => {
                    const updated = [...content.teamStructure.departments];
                    updated[idx].description = e.target.value;
                    setContent({ ...content, teamStructure: { ...content.teamStructure, departments: updated } });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 6. Section 5 & 6: Location & CTA */}
        <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            6. Location & Bottom Call to Action
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location Section Heading"
              value={content.location?.heading || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  location: { ...content.location, heading: e.target.value },
                })
              }
            />

            <Input
              label="Operating Schedule Text"
              value={content.location?.schedule || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  location: { ...content.location, schedule: e.target.value },
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CTA Banner Heading"
              value={content.cta?.heading || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  cta: { ...content.cta, heading: e.target.value },
                })
              }
            />

            <Input
              label="CTA Banner Subtitle"
              value={content.cta?.subtitle || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  cta: { ...content.cta, subtitle: e.target.value },
                })
              }
            />
          </div>
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
