import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Upload,
  User,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { reviewService } from '../../../services/reviewService';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Delete Modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await reviewService.getReviews(false);
      setReviews(data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load customer reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Customer Reviews Management | Admin CMS';
    fetchReviews();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCustomerName('');
    setAvatarUrl('');
    setRating(5);
    setReviewText('');
    setReviewDate(new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    setDisplayOrder(reviews.length);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setCustomerName(item.customerName || '');
    setAvatarUrl(item.avatarUrl || '');
    setRating(item.rating || 5);
    setReviewText(item.reviewText || '');
    setReviewDate(item.reviewDate || '');
    setDisplayOrder(typeof item.displayOrder === 'number' ? item.displayOrder : 0);
    setIsActive(item.isActive !== false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFormError('');
    try {
      const uploadedUrl = await reviewService.uploadAvatarFile(file);
      setAvatarUrl(uploadedUrl);
    } catch (err) {
      setFormError(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }

    if (!reviewText.trim()) {
      setFormError('Review text is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        rating: Number(rating),
        reviewText: reviewText.trim(),
        reviewDate: reviewDate ? reviewDate.trim() : null,
        displayOrder: Number(displayOrder),
        isActive,
      };

      if (editingId) {
        await reviewService.updateReview(editingId, payload);
        setSuccessMsg('Customer review updated successfully.');
      } else {
        await reviewService.createReview(payload);
        setSuccessMsg('New customer review added successfully.');
      }
      setIsModalOpen(false);
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to save review.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = await reviewService.updateReview(item.id, {
        isActive: !item.isActive,
      });
      setReviews((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle review status.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= reviews.length) return;

    const newArr = [...reviews];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    setReviews(newArr);

    try {
      await reviewService.updateReview(newArr[index].id, { displayOrder: index });
      await reviewService.updateReview(newArr[targetIdx].id, { displayOrder: targetIdx });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to persist reordering.');
      fetchReviews();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await reviewService.deleteReview(deleteId);
      setSuccessMsg('Review deleted successfully.');
      setDeleteId(null);
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete review.');
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
            <span className="text-gray-900 font-semibold">Customer Reviews</span>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C8102E]" /> Customer Reviews Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage verified customer feedback and ratings displayed on the public homepage.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="bg-[#C8102E] hover:bg-red-700 text-white flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
        >
          <Plus className="w-4 h-4" /> Add Verified Review
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

      {/* Main Reviews Table / List */}
      <Card className="p-6 bg-white border border-gray-200/80 shadow-xs">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
            <span className="text-xs font-medium">Loading customer reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-3">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No customer reviews created yet.</p>
            <p className="text-xs text-gray-400">Click "Add Verified Review" above to add your first customer testimonial.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 px-2">
              <span>Customer Review ({reviews.length})</span>
              <span>Actions & Status</span>
            </div>

            <div className="divide-y divide-gray-100">
              {reviews.map((item, index) => (
                <div
                  key={item.id}
                  className={`py-4 px-3 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xs transition-colors ${
                    item.isActive ? 'hover:bg-gray-50/80' : 'bg-gray-50/50 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Customer Image Avatar */}
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.customerName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#C8102E]/10 text-[#C8102E] font-bold flex items-center justify-center shrink-0 border border-[#C8102E]/20 text-sm">
                        {item.customerName ? item.customerName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900">{item.customerName}</span>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>

                        {item.reviewDate && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {item.reviewDate}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-widest ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {item.isActive ? 'Published' : 'Hidden'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed max-w-2xl line-clamp-2 italic">
                        "{item.reviewText}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Display Order Controls */}
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
                      <span className="text-[10px] font-mono text-gray-400 px-1.5 border-x border-gray-200">
                        {item.displayOrder + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === reviews.length - 1}
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
                      className="text-xs px-2.5 py-1 flex items-center gap-1"
                    >
                      {item.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {item.isActive ? 'Hide' : 'Show'}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Customer Review' : 'Add Verified Customer Review'}
      >
        <form onSubmit={handleSaveForm} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="e.g. Tariq Khan"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Star Rating (1–5)
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-300 rounded-xs">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        starVal <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-700 ml-auto mr-2">{rating} / 5 Stars</span>
              </div>
            </div>
          </div>

          {/* Avatar Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Customer Photo / Avatar (Optional)
            </label>

            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Customer Avatar Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <Input
                  placeholder="Paste photo URL or upload file below..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />

                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors border border-gray-300">
                  {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Review Date (Optional)"
              placeholder="e.g. September 2026"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
            />

            <Input
              label="Display Order"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>

          <Textarea
            label="Customer Review Text"
            placeholder="Enter exact feedback shared by customer..."
            rows={4}
            required
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#C8102E] rounded border-gray-300 focus:ring-[#C8102E]"
              />
              <span>Publish this review on the public homepage</span>
            </label>
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
              disabled={saving || uploadingAvatar}
              className="bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Create Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete Review"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete this customer review? It will be permanently removed.
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

export default AdminReviews;
