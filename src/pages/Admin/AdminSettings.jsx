import React, { useState, useEffect } from 'react';
import { Building2, Phone, Clock, Bell, CheckCircle2, AlertCircle, Save, Globe, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { contentService } from '../../services/contentService';
import { DEFAULT_CONTACT_CONTENT } from '../../data/dealership';
import { useContact } from '../../context/useContact';

export const AdminSettings = () => {
  const { updateContactData } = useContact();
  const [activeTab, setActiveTab] = useState('profile');
  const [contactData, setContactData] = useState(DEFAULT_CONTACT_CONTENT);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    leadAssignments: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Dealership Settings | Admin CRM';
    let isMounted = true;
    const loadContent = async () => {
      try {
        const data = await contentService.getContactContent();
        if (data && isMounted) {
          setContactData((prev) => ({
            ...prev,
            ...data,
            social: {
              facebook: data.social?.facebook || prev.social?.facebook || '',
              instagram: data.social?.instagram || prev.social?.instagram || '',
              whatsapp: data.social?.whatsapp || prev.social?.whatsapp || '',
              linkedin: data.social?.linkedin || prev.social?.linkedin || '',
              youtube: data.social?.youtube || prev.social?.youtube || '',
            },
          }));
        }
      } catch (err) {
        console.warn('Failed loading contact content:', err);
      }
    };
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (key, val) => {
    setContactData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const updateSocialField = (key, val) => {
    setContactData((prev) => ({
      ...prev,
      social: {
        ...(prev.social || {}),
        [key]: val,
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const updated = await contentService.saveContactContent(contactData);
      if (updated) {
        setContactData((prev) => ({
          ...prev,
          ...updated,
        }));
        updateContactData(updated);
        setSaveSuccessMsg('Contact & Footer configuration saved successfully to PostgreSQL database!');
      }
    } catch (err) {
      console.error('Save Contact Settings Error:', err);
      setSaveErrorMsg(err.message || 'Failed to save configuration to database.');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccessMsg('');
      }, 5000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
          Dealership Settings & Configuration
        </h2>
        <p className="text-xs text-gray-500">
          Configure dealership profile information, public contact numbers, footer text, social links, operating hours, and admin alerts.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-xs p-1 gap-1 border shadow-2xs">
        {[
          { id: 'profile', label: 'Dealership Profile', icon: Building2 },
          { id: 'contact', label: 'Contact & Footer Info', icon: Phone },
          { id: 'social', label: 'Social Media Links', icon: Globe },
          { id: 'hours', label: 'Business Hours', icon: Clock },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Save Toast Feedback */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center gap-2 text-xs text-red-800 font-bold animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Tab Panels */}
      <Card className="p-6 border border-gray-200/80 bg-white shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                Dealership Facility Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Dealership Name"
                  value={contactData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                />

                <Input
                  label="Short Name / Alias"
                  value={contactData.shortName || ''}
                  onChange={(e) => updateField('shortName', e.target.value)}
                />
              </div>

              <Input
                label="Status Designation"
                value={contactData.status || ''}
                onChange={(e) => updateField('status', e.target.value)}
              />

              <Input
                label="Dealership Tagline"
                value={contactData.tagline || ''}
                onChange={(e) => updateField('tagline', e.target.value)}
              />

              <Textarea
                label="Public Footer Text / Description"
                rows={3}
                value={contactData.footerText || ''}
                onChange={(e) => updateField('footerText', e.target.value)}
                helperText="This text appears on the main public website footer across all pages."
              />
            </div>
          )}

          {/* Contact Section */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                Public Contact Numbers & Desk Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="General Landline Phone"
                  value={contactData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                />

                <Input
                  label="WhatsApp Number"
                  value={contactData.whatsapp || ''}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sales Desk Direct"
                  value={contactData.salesDirect || ''}
                  onChange={(e) => updateField('salesDirect', e.target.value)}
                />

                <Input
                  label="3S Service Desk Direct"
                  value={contactData.serviceDirect || ''}
                  onChange={(e) => updateField('serviceDirect', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Email Address"
                  value={contactData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                />

                <Input
                  label="Sales Email"
                  value={contactData.salesEmail || ''}
                  onChange={(e) => updateField('salesEmail', e.target.value)}
                />
              </div>

              <Textarea
                label="Physical Address"
                value={contactData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Social Media Links Section */}
          {activeTab === 'social' && (
            <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                Social Media Links & Channels
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Facebook Page URL"
                  placeholder="https://facebook.com/khybermotors"
                  value={contactData.social?.facebook || ''}
                  onChange={(e) => updateSocialField('facebook', e.target.value)}
                />

                <Input
                  label="Instagram Page URL"
                  placeholder="https://instagram.com/khybermotors"
                  value={contactData.social?.instagram || ''}
                  onChange={(e) => updateSocialField('instagram', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="WhatsApp Direct Chat URL"
                  placeholder="https://wa.me/923000000000"
                  value={contactData.social?.whatsapp || ''}
                  onChange={(e) => updateSocialField('whatsapp', e.target.value)}
                />

                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/company/khybermotors"
                  value={contactData.social?.linkedin || ''}
                  onChange={(e) => updateSocialField('linkedin', e.target.value)}
                />
              </div>

              <Input
                label="YouTube Channel URL"
                placeholder="https://youtube.com/khybermotors"
                value={contactData.social?.youtube || ''}
                onChange={(e) => updateSocialField('youtube', e.target.value)}
              />
            </div>
          )}

          {/* Business Hours Section */}
          {activeTab === 'hours' && (
            <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                Showroom & Workshop Hours
              </h3>

              {(contactData.businessHours || []).map((h, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={`Days Range #${i + 1}`}
                    value={h.days || ''}
                    onChange={(e) => {
                      const updated = [...(contactData.businessHours || [])];
                      updated[i] = { ...updated[i], days: e.target.value };
                      updateField('businessHours', updated);
                    }}
                  />
                  <Input
                    label={`Operating Hours #${i + 1}`}
                    value={h.hours || ''}
                    onChange={(e) => {
                      const updated = [...(contactData.businessHours || [])];
                      updated[i] = { ...updated[i], hours: e.target.value };
                      updateField('businessHours', updated);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                Admin Notification Preferences
              </h3>

              <div className="space-y-3 pt-2">
                <Checkbox
                  id="emailAlerts"
                  label="Receive instant email alerts for new lead submissions"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, emailAlerts: e.target.checked }))}
                />

                <Checkbox
                  id="smsAlerts"
                  label="Receive SMS alerts for priority customer inquiries"
                  checked={notifications.smsAlerts}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, smsAlerts: e.target.checked }))}
                />

                <Checkbox
                  id="leadAssignments"
                  label="Notify sales representatives upon lead reassignment"
                  checked={notifications.leadAssignments}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, leadAssignments: e.target.checked }))}
                />
              </div>
            </div>
          )}

          {/* Form Save Trigger */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              className="uppercase font-bold tracking-wider"
            >
              {isSaving ? 'Saving to Database...' : 'Save Configuration Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
