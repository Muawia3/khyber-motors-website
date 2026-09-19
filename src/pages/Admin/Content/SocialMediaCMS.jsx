import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Modal } from '../../../components/ui/Modal';
import { socialLinkService } from '../../../services/socialLinkService';
import { SocialIcon } from '../../../components/common/SocialIcons';

const ALLOWED_PLATFORMS = ['TikTok', 'Instagram', 'Facebook', 'WhatsApp'];

const PLATFORM_PRESETS = [
  { name: 'TikTok', icon: 'TikTok', placeholder: 'https://tiktok.com/@khybermotors' },
  { name: 'Instagram', icon: 'Instagram', placeholder: 'https://instagram.com/khybermotors' },
  { name: 'Facebook', icon: 'Facebook', placeholder: 'https://facebook.com/khybermotors' },
  { name: 'WhatsApp', icon: 'WhatsApp', placeholder: 'https://wa.me/923000000000' },
];

export const SocialMediaCMS = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add / Edit Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formPlatform, setFormPlatform] = useState('TikTok');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('TikTok');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Delete Modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await socialLinkService.getSocialLinks(false);
      // Filter strictly to the 4 allowed platforms
      const filtered = (data || []).filter((item) =>
        ALLOWED_PLATFORMS.some((p) => p.toLowerCase() === (item.platform || '').toLowerCase())
      );
      setLinks(filtered);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load social media links.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Social Media Management | Admin CMS';
    fetchLinks();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormPlatform('TikTok');
    setFormUrl('https://tiktok.com/@khybermotors');
    setFormIcon('TikTok');
    setFormIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormPlatform(item.platform || 'TikTok');
    setFormUrl(item.url || '');
    setFormIcon(item.icon || item.platform || 'TikTok');
    setFormIsActive(item.isActive !== false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSelectPreset = (preset) => {
    setFormPlatform(preset.name);
    setFormIcon(preset.icon);
    setFormUrl(preset.placeholder);
  };

  const validateUrl = (urlStr) => {
    if (!urlStr || !urlStr.trim()) return 'URL is required.';
    const trimmed = urlStr.trim();
    if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('http://wa.me/')) return null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'URL must start with http:// or https://';
      }
    } catch {
      return 'Please enter a valid URL (e.g. https://tiktok.com/@yourhandle)';
    }
    return null;
  };

  const handleSaveModalForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formPlatform.trim()) {
      setFormError('Platform selection is required.');
      return;
    }

    const isAllowed = ALLOWED_PLATFORMS.some(
      (p) => p.toLowerCase() === formPlatform.trim().toLowerCase()
    );

    if (!isAllowed) {
      setFormError('Only TikTok, Instagram, Facebook, and WhatsApp are supported.');
      return;
    }

    const urlErr = validateUrl(formUrl);
    if (urlErr) {
      setFormError(urlErr);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await socialLinkService.updateSocialLink(editingId, {
          platform: formPlatform,
          url: formUrl,
          icon: formIcon || formPlatform,
          isActive: formIsActive,
        });
        setSuccessMsg('Social link updated successfully.');
      } else {
        await socialLinkService.createSocialLink({
          platform: formPlatform,
          url: formUrl,
          icon: formIcon || formPlatform,
          isActive: formIsActive,
          displayOrder: links.length,
        });
        setSuccessMsg('New social platform added successfully.');
      }
      setIsModalOpen(false);
      fetchLinks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to save social link.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = await socialLinkService.updateSocialLink(item.id, {
        isActive: !item.isActive,
      });
      setLinks((prev) => prev.map((l) => (l.id === item.id ? updated : l)));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle status.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const newArr = [...links];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    const reorderPayload = newArr.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    setLinks(newArr);

    try {
      await socialLinkService.reorderSocialLinks(reorderPayload);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to persist reordering.');
      fetchLinks();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await socialLinkService.deleteSocialLink(deleteId);
      setSuccessMsg('Social platform deleted successfully.');
      setDeleteId(null);
      fetchLinks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete platform.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/admin" className="hover:text-[#C8102E]">
              Admin
            </Link>
            <span>/</span>
            <span>Content</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Social Media</span>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#C8102E]" /> Social Media Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage official TikTok, Instagram, Facebook, and WhatsApp channels displayed across the website.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="bg-[#C8102E] hover:bg-red-700 text-white flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
        >
          <Plus className="w-4 h-4" /> Add Social Platform
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main List */}
      <Card className="p-6 bg-white border border-gray-200/80 shadow-xs">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
            <span className="text-xs font-medium">Loading social media channels...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-3">
            <Share2 className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No social channels configured yet.</p>
            <p className="text-xs text-gray-400">Click "Add Social Platform" above to add TikTok, Instagram, Facebook, or WhatsApp.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 px-2">
              <span>Platform Channels ({links.length})</span>
              <span>Actions & Ordering</span>
            </div>

            <div className="divide-y divide-gray-100">
              {links.map((item, index) => (
                <div
                  key={item.id}
                  className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xs transition-colors ${
                    item.isActive ? 'hover:bg-gray-50/80' : 'bg-gray-50/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xs flex items-center justify-center shrink-0 border border-gray-200">
                      <SocialIcon name={item.platform} icon={item.icon} className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{item.platform}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-widest ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-[#C8102E] font-mono flex items-center gap-1 max-w-md truncate"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Order buttons */}
                    <div className="flex items-center bg-gray-100 rounded-xs border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-gray-400 px-1 border-x border-gray-200">
                        {item.displayOrder + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === links.length - 1}
                        className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Active toggle */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(item)}
                      className="text-xs px-2.5 py-1"
                    >
                      {item.isActive ? 'Disable' : 'Enable'}
                    </Button>

                    {/* Edit button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(item)}
                      className="text-xs px-2.5 py-1 flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>

                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(item.id)}
                      className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Social Platform' : 'Add Social Platform'}
      >
        <form onSubmit={handleSaveModalForm} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Select Platform
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORM_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 border rounded-xs text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    formPlatform === p.name
                      ? 'border-[#C8102E] bg-red-50/50 text-[#C8102E]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                  }`}
                >
                  <SocialIcon name={p.name} icon={p.icon} className="w-5 h-5" />
                  <span className="truncate max-w-full">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Platform Name
            </label>
            <select
              value={formPlatform}
              onChange={(e) => {
                setFormPlatform(e.target.value);
                setFormIcon(e.target.value);
              }}
              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xs focus:ring-1 focus:ring-[#C8102E] outline-none font-semibold"
            >
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>

          <Input
            label="Profile / Channel URL"
            placeholder="e.g. https://tiktok.com/@khybermotors"
            type="url"
            required
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />

          <div className="pt-2">
            <Checkbox
              id="formIsActive"
              label="Enable this platform on public website"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Create Platform'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete Social Link"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete this social media channel? It will be removed from the public website footer and contact pages.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

