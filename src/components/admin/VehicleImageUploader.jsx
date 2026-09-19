import React, { useRef, useState } from 'react';
import { Upload, X, Star, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { vehicleService } from '../../services/vehicleService';
import { getFileUrl } from '../../utils/urlHelper';

export const VehicleImageUploader = ({
  mainImage,
  gallery = [],
  onMainImageChange,
  onGalleryChange,
}) => {
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Handle Main Image file selection & direct server upload
  const handleMainFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMain(true);
      setUploadError('');
      const uploadedUrl = await vehicleService.uploadFile(file);
      if (uploadedUrl) {
        onMainImageChange(uploadedUrl);
      } else {
        throw new Error('Failed to upload image file to server.');
      }
    } catch (err) {
      console.error('Main image upload error:', err);
      setUploadError(err.message || 'Failed to upload main image file.');
    } finally {
      setIsUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  // Handle Gallery files selection & direct server upload
  const handleGalleryFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setUploadError('');
      const uploadPromises = files.map((file) => vehicleService.uploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      const validUrls = uploadedUrls.filter(Boolean);
      if (validUrls.length > 0) {
        onGalleryChange([...gallery, ...validUrls]);
      }
    } catch (err) {
      console.error('Gallery images upload error:', err);
      setUploadError(err.message || 'Failed to upload one or more gallery images.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Remove single gallery image
  const handleRemoveGalleryImage = (indexToRemove) => {
    const updated = gallery.filter((_, idx) => idx !== indexToRemove);
    onGalleryChange(updated);
  };

  // Set selected gallery image as Main image
  const handleSetAsMain = (imageUrl) => {
    const updatedGallery = gallery.filter((url) => url !== imageUrl);
    if (mainImage && !updatedGallery.includes(mainImage)) {
      updatedGallery.push(mainImage);
    }
    onMainImageChange(imageUrl);
    onGalleryChange(updatedGallery);
  };

  const resolvedMainImage = getFileUrl(mainImage);

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={mainInputRef}
        onChange={handleMainFileSelect}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleGalleryFilesSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Image Section */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          Main Featured Vehicle Image <span className="text-[#C8102E]">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Main Image Preview Box */}
          <div className="md:col-span-8 bg-gray-900 aspect-16/9 rounded-xs overflow-hidden relative border border-gray-300 shadow-inner group">
            {resolvedMainImage ? (
              <>
                <img
                  src={resolvedMainImage}
                  alt="Main vehicle preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-current" /> Main Image
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <ImageIcon className="w-12 h-12 mb-2 text-gray-600" />
                <p className="text-xs font-semibold text-gray-300">No Main Image Selected</p>
                <p className="text-[11px] text-gray-500 mt-1">Upload high-resolution vehicle exterior shot</p>
              </div>
            )}
          </div>

          {/* Upload Button Controls */}
          <div className="md:col-span-4 space-y-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              disabled={isUploadingMain}
              onClick={() => mainInputRef.current?.click()}
              leftIcon={
                isUploadingMain ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C8102E]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#C8102E]" />
                )
              }
            >
              {isUploadingMain ? 'Uploading...' : (mainImage ? 'Change Main Image' : 'Upload Main Image')}
            </Button>
            {mainImage && (
              <button
                type="button"
                onClick={() => onMainImageChange('')}
                className="text-xs text-red-600 hover:text-red-700 font-semibold underline block w-full text-center"
              >
                Clear Main Image
              </button>
            )}
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Recommended ratio: 16:9 or 16:10. Supports JPG, PNG, WebP image formats. Saved to persistent server storage.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Vehicle Gallery Images
            </label>
            <p className="text-[11px] text-gray-500">
              Upload exterior angles, interior cockpit, cargo bed, and engine bay photos.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="xs"
            disabled={isUploadingGallery}
            onClick={() => galleryInputRef.current?.click()}
            leftIcon={
              isUploadingGallery ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )
            }
          >
            {isUploadingGallery ? 'Uploading Gallery...' : '+ Add Gallery Images'}
          </Button>
        </div>

        {/* Gallery Thumbnails Grid */}
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {gallery.map((url, idx) => {
              const isMain = url === mainImage;
              const resolvedGalleryUrl = getFileUrl(url);
              return (
                <div
                  key={idx}
                  className={`relative aspect-16/10 rounded-xs overflow-hidden border-2 bg-gray-900 group ${
                    isMain ? 'border-[#C8102E] ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={resolvedGalleryUrl}
                    alt={`Gallery preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetAsMain(url)}
                        className="bg-white text-gray-900 text-[10px] font-bold py-1 px-1.5 rounded-xs hover:bg-[#C8102E] hover:text-white transition-colors"
                      >
                        Set as Main
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xs text-center text-xs text-gray-500">
            No gallery images uploaded yet. Click "+ Add Gallery Images" to select photos.
          </div>
        )}
      </div>
    </div>
  );
};
