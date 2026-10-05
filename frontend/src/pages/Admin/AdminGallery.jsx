import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, GripVertical, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { galleryService } from '../../services/galleryService';
import { uploadService } from '../../services/uploadService';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    imageUrl: '',
    isActive: true,
  });
  
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchItems = async () => {
    try {
      const data = await galleryService.getGalleryItems(true);
      setItems(data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Gallery Management | Admin CRM';
    fetchItems();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        shortDescription: item.shortDescription || '',
        imageUrl: item.imageUrl,
        isActive: item.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        shortDescription: '',
        imageUrl: '',
        isActive: true,
      });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert('Title is required');
    if (!formData.imageUrl && !selectedFile) return alert('Image is required');

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        const uploadRes = await uploadService.uploadFile(selectedFile);
        if (uploadRes && uploadRes.success) {
          finalImageUrl = uploadRes.url;
        } else {
          alert('Image upload failed');
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        await galleryService.updateGalleryItem(editingId, payload);
      } else {
        await galleryService.createGalleryItem(payload);
      }

      await fetchItems();
      handleCloseModal();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save gallery item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await galleryService.deleteGalleryItem(id);
        await fetchItems();
      } catch (err) {
        alert('Failed to delete item');
      }
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await galleryService.updateGalleryItem(item.id, { ...item, isActive: !item.isActive });
      await fetchItems();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const moveItem = async (index, direction) => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    } else {
      return;
    }

    const updatedOrder = newItems.map((item, i) => ({ id: item.id, displayOrder: i }));
    setItems(newItems);

    try {
      await galleryService.reorderGalleryItems(updatedOrder);
    } catch (err) {
      console.error('Reorder error', err);
      fetchItems();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 uppercase">Gallery Management</h2>
          <p className="text-xs text-gray-500">Manage company photos, events, and showroom images.</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus className="w-4 h-4" />}>
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <Card key={item.id} className={`overflow-hidden flex flex-col ${!item.isActive ? 'opacity-60' : ''}`}>
            <div className="relative aspect-video bg-gray-100">
              <SafeImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 bg-white/80 rounded-sm hover:bg-white disabled:opacity-50"
                  title="Move Up"
                >
                  <GripVertical className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1.5 bg-white/80 rounded-sm hover:bg-white disabled:opacity-50"
                  title="Move Down"
                >
                  <GripVertical className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <button
                  onClick={() => handleToggleStatus(item)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 ${
                    item.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {item.isActive ? (
                    <><CheckCircle2 className="w-3 h-3" /> Published</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Hidden</>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 text-sm uppercase truncate">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">
                {item.shortDescription || 'No description provided'}
              </p>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Gallery Item' : 'Add New Gallery Item'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Image Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g. Showroom Grand Opening"
          />
          
          <Textarea
            label="Short Description (Optional)"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="Briefly describe the image..."
            rows={2}
          />
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Image Upload
            </label>
            <div className="mt-1 flex items-center gap-4">
              {formData.imageUrl && !selectedFile && (
                <div className="w-16 h-16 rounded-sm overflow-hidden border border-gray-200">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-sm file:border-0
                    file:text-xs file:font-semibold
                    file:bg-red-50 file:text-[#C8102E]
                    hover:file:bg-red-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-[#C8102E] focus:ring-[#C8102E]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
