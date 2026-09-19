import React, { useState } from 'react';
import { Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getFileUrl } from '../../utils/urlHelper';

export const VehicleImageGallery = ({
  images,
  vehicleName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const activeImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      className="flex flex-col gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E] rounded-sm p-1"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`${vehicleName} Image Gallery. Use Left and Right arrow keys to switch images.`}
    >
      {/* Main Image View */}
      <div className="relative aspect-16/10 bg-gray-900 border border-gray-200 rounded-sm overflow-hidden group shadow-md">
        <img
          key={activeImage}
          src={getFileUrl(activeImage)}
          alt={`${vehicleName} View ${selectedIndex + 1} of ${images.length}`}
          className="w-full h-full object-cover transition-all duration-300 animate-fadeIn motion-reduce:animate-none"
        />

        {/* Navigation Buttons for Quick Cycling */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#C8102E] text-white p-2 rounded-full opacity-90 hover:opacity-100 transition-all duration-200 focus:opacity-100 cursor-pointer z-10"
              aria-label="Previous vehicle image"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#C8102E] text-white p-2 rounded-full opacity-90 hover:opacity-100 transition-all duration-200 focus:opacity-100 cursor-pointer z-10"
              aria-label="Next vehicle image"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Fullscreen Zoom Trigger */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-4 right-4 bg-black/70 hover:bg-[#C8102E] text-white p-2.5 rounded-full transition-colors opacity-90 group-hover:opacity-100 cursor-pointer focus:ring-2 focus:ring-white z-10"
          title="Zoom View"
          aria-label="Expand image to fullscreen"
        >
          <Expand className="w-5 h-5" />
        </button>

        {/* Caption */}
        <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1 text-xs text-white uppercase tracking-wider font-semibold rounded-xs border border-gray-700">
          View {selectedIndex + 1} of {images.length}
        </div>
      </div>

      {/* Thumbnails List with Keyboard Focus */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3" role="tablist" aria-label="Vehicle image thumbnails">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={selectedIndex === idx}
              aria-label={`${vehicleName} thumbnail ${idx + 1}`}
              onClick={() => setSelectedIndex(idx)}
              className={`aspect-16/10 rounded-xs overflow-hidden border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
                selectedIndex === idx
                  ? 'border-[#C8102E] ring-2 ring-red-100 scale-102'
                  : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={getFileUrl(img)}
                alt={`${vehicleName} Thumbnail ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        title={`${vehicleName} - High Resolution View`}
        maxWidth="4xl"
      >
        <div className="aspect-16/10 bg-gray-950 rounded-sm overflow-hidden relative">
          <img
            src={getFileUrl(activeImage)}
            alt={vehicleName}
            className="w-full h-full object-contain"
          />
        </div>
      </Modal>
    </div>
  );
};
