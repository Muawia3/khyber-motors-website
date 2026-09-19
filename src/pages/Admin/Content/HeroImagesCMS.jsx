import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Loader2,
  Layers,
  ChevronRight,
  Link as LinkIcon,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/common/Badge';
import { heroImageService } from '../../../services/heroImageService';
import { getFileUrl } from '../../../utils/urlHelper';

export const HeroImagesCMS = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Add New Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newImageForm, setNewImageForm] = useState({
    url: '',
    title: '',
    altText: '',
    isActive: true,
  });

  // Delete Confirm Modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    document.title = 'Hero Image Management | Admin CMS';
    loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    setLoading(true);
    try {
      const list = await heroImageService.getHeroImages(false);
      setHeroImages(list || []);
    } catch (err) {
      console.error('Failed to load hero images:', err);
      setSaveErrorMsg('Failed to load hero images from database.');
    } finally {
      setLoading(false);
    }
  };

  // Upload new image file
  const handleFileUpload = async (e, isNew = true, targetId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSaveErrorMsg('');
    try {
      const uploadedUrl = await heroImageService.uploadImageFile(file);

      if (isNew) {
        setNewImageForm((prev) => ({
          ...prev,
          url: uploadedUrl,
          altText: prev.altText || file.name.split('.')[0],
        }));
      } else if (targetId) {
        setHeroImages((prev) =>
          prev.map((img) => (img.id === targetId ? { ...img, url: uploadedUrl } : img))
        );
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setSaveErrorMsg(err.message || 'Image file upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add new Hero Image submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newImageForm.url.trim()) {
      setSaveErrorMsg('Please provide an image URL or upload an image file.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMsg('');
    try {
      const created = await heroImageService.createHeroImage({
        url: newImageForm.url.trim(),
        title: newImageForm.title.trim() || 'JAC Hero Banner',
        altText: newImageForm.altText.trim() || 'JAC Commercial Vehicle',
        isActive: newImageForm.isActive,
        displayOrder: heroImages.length,
      });

      setHeroImages((prev) => [...prev, created]);
      setIsAddModalOpen(false);
      setNewImageForm({ url: '', title: '', altText: '', isActive: true });
      setSaveSuccessMsg('New Hero Image uploaded and added successfully!');
    } catch (err) {
      console.error('Add Hero Image error:', err);
      setSaveErrorMsg(err.message || 'Failed to add hero image.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // Move image up/down in display order
  const moveImage = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= heroImages.length) return;

    const updated = [...heroImages];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    // Re-assign displayOrder
    const reordered = updated.map((img, idx) => ({ ...img, displayOrder: idx }));
    setHeroImages(reordered);
  };

  // Toggle active status
  const toggleActive = (id) => {
    setHeroImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isActive: !img.isActive } : img))
    );
  };

  // Update text fields
  const updateField = (id, field, value) => {
    setHeroImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img))
    );
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setIsSaving(true);
    try {
      await heroImageService.deleteHeroImage(deleteTargetId);
      setHeroImages((prev) => prev.filter((img) => img.id !== deleteTargetId));
      setSaveSuccessMsg('Hero Image deleted permanently from database.');
    } catch (err) {
      console.error('Delete hero image error:', err);
      setSaveErrorMsg(err.message || 'Failed to delete hero image.');
    } finally {
      setIsSaving(false);
      setDeleteTargetId(null);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // Save all reordering and field updates to PostgreSQL
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      // 1. Update individual fields
      const updatePromises = heroImages.map((img) =>
        heroImageService.updateHeroImage(img.id, {
          url: img.url,
          title: img.title,
          altText: img.altText,
          isActive: img.isActive,
          displayOrder: img.displayOrder,
        })
      );
      await Promise.all(updatePromises);

      // 2. Persist reordering
      const reorderPayload = heroImages.map((img, idx) => ({
        id: img.id,
        displayOrder: idx,
      }));
      await heroImageService.reorderHeroImages(reorderPayload);

      setSaveSuccessMsg('All Hero Image changes saved successfully to PostgreSQL database!');
    } catch (err) {
      console.error('Save all hero images error:', err);
      setSaveErrorMsg(err.message || 'Failed to save changes to database.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span>Content</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span>Homepage</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C8102E]" />
            <span className="text-[#C8102E] font-bold">Hero Images</span>
          </nav>
          <h2 className="text-xl font-extrabold uppercase text-gray-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#C8102E]" />
            Homepage Hero Image Manager
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload, reorder, enable/disable, preview, and update homepage hero slider images stored in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadHeroImages}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Hero Image
          </Button>
        </div>
      </div>

      {/* Toast Feedback Messages */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main Image List Grid */}
      {loading ? (
        <div className="py-20 text-center bg-white border border-gray-200 rounded-sm">
          <Loader2 className="w-8 h-8 text-[#C8102E] animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
            Loading Hero Images from PostgreSQL...
          </p>
        </div>
      ) : heroImages.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-gray-200 space-y-4">
          <Layers className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 uppercase">No Hero Images Configured</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Upload your first hero image file or paste an image URL to feature on the homepage slider.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add First Hero Image
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {heroImages.map((img, index) => (
            <Card
              key={img.id}
              className={`p-5 border transition-all ${
                img.isActive
                  ? 'bg-white border-gray-200 shadow-xs hover:border-gray-400'
                  : 'bg-gray-50/70 border-gray-200 opacity-75'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Reorder & Display Order Badge */}
                <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-2">
                  <span className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-mono font-bold">
                    #{index + 1}
                  </span>
                  <div className="flex lg:flex-col gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveImage(index, 'up')}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === heroImages.length - 1}
                      onClick={() => moveImage(index, 'down')}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle Left: Image Preview Thumbnail */}
                <div className="lg:col-span-4 relative aspect-16/10 bg-gray-900 rounded-xs overflow-hidden border border-gray-300 group shadow-2xs">
                  <img
                    src={getFileUrl(img.url)}
                    alt={img.altText || img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant={img.isActive ? 'red' : 'gray'}>
                      {img.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Replace Image Upload Overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold uppercase tracking-wider cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Replace Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false, img.id)}
                    />
                  </label>
                </div>

                {/* Middle Right: Editable Meta Fields */}
                <div className="lg:col-span-5 space-y-3">
                  <Input
                    label="Headline / Image Title"
                    value={img.title || ''}
                    onChange={(e) => updateField(img.id, 'title', e.target.value)}
                    placeholder="e.g. Flagship JAC T9 4x4 Pickup"
                  />

                  <Input
                    label="Alt Text (SEO)"
                    value={img.altText || ''}
                    onChange={(e) => updateField(img.id, 'altText', e.target.value)}
                    placeholder="e.g. JAC T9 pickup truck driving on highway"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => updateField(img.id, 'url', e.target.value)}
                      className="flex-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-xs font-mono truncate"
                      placeholder="Image URL..."
                    />
                  </div>
                </div>

                {/* Right: Actions & Toggle */}
                <div className="lg:col-span-2 flex lg:flex-col justify-end lg:items-end gap-3 border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={img.isActive}
                      onChange={() => toggleActive(img.id)}
                      className="w-4 h-4 text-[#C8102E] rounded-xs border-gray-300 focus:ring-[#C8102E]"
                    />
                    <span>{img.isActive ? 'Active' : 'Disabled'}</span>
                  </label>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setDeleteTargetId(img.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Persistent Save Floating / Bottom Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-200 bg-white p-4 rounded-xs border shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold">
              Total Hero Images: <strong>{heroImages.length}</strong> ({heroImages.filter((i) => i.isActive).length} Active)
            </span>
            <Button
              variant="primary"
              size="md"
              disabled={isSaving}
              onClick={handleSaveAll}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              className="uppercase font-bold tracking-wider"
            >
              {isSaving ? 'Saving Changes...' : 'Save All Hero Configuration'}
            </Button>
          </div>
        </div>
      )}

      {/* Add New Hero Image Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload & Add New Hero Image"
        subtitle="Upload an image file from your device or paste a direct image URL."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* File Upload Box */}
          <div className="p-4 border-2 border-dashed border-gray-300 hover:border-[#C8102E] bg-gray-50 rounded-xs text-center space-y-2 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="text-xs text-gray-600">
              <label className="font-bold text-[#C8102E] hover:underline cursor-pointer">
                <span>Click to upload image file</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, true)}
                />
              </label>
              <span> or enter direct URL below</span>
            </div>
            {isUploading && (
              <p className="text-xs font-bold text-[#C8102E] flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image to storage...
              </p>
            )}
          </div>

          <Input
            label="Image URL"
            value={newImageForm.url}
            onChange={(e) => setNewImageForm({ ...newImageForm, url: e.target.value })}
            placeholder="https://example.com/hero-image.jpg or /uploads/filename.jpg"
            required
          />

          {newImageForm.url && (
            <div className="aspect-16/10 bg-gray-900 rounded-xs overflow-hidden border border-gray-300">
              <img src={getFileUrl(newImageForm.url)} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <Input
            label="Headline / Title (Optional)"
            value={newImageForm.title}
            onChange={(e) => setNewImageForm({ ...newImageForm, title: e.target.value })}
            placeholder="e.g. Flagship JAC T9 4x4 Double Cabin Pickup"
          />

          <Input
            label="Alt Text (SEO)"
            value={newImageForm.altText}
            onChange={(e) => setNewImageForm({ ...newImageForm, altText: e.target.value })}
            placeholder="e.g. JAC T9 4x4 pickup truck"
          />

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newImageForm.isActive}
              onChange={(e) => setNewImageForm({ ...newImageForm, isActive: e.target.checked })}
              className="w-4 h-4 text-[#C8102E] rounded-xs border-gray-300 focus:ring-[#C8102E]"
            />
            <span>Enable immediately on website hero section</span>
          </label>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSaving || isUploading}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Hero Image
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Hero Image"
        maxWidth="sm"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete this hero image? It will be removed permanently from PostgreSQL.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HeroImagesCMS;
