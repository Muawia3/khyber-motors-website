import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { galleryService } from '../../services/galleryService';
import { SafeImage } from '../../components/common/SafeImage';

export const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    document.title = 'Gallery | Khyber Motors';
    const fetchGallery = async () => {
      try {
        const data = await galleryService.getGalleryItems();
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch gallery items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 sm:py-16">
      <Container size="xl" className="space-y-12">
        <SectionHeading
          badge="Our Visuals"
          title="Company Gallery"
          subtitle="Explore showroom achievements, events, activities, facilities, and more."
          align="center"
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C8102E]"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-sm">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 uppercase">No Images Found</h3>
            <p className="text-sm text-gray-500 mt-1">Check back later for exciting gallery updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm truncate uppercase">{item.title}</h3>
                  {item.shortDescription && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.shortDescription}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setSelectedImage(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="relative w-full max-w-5xl flex flex-col items-center justify-center animate-fadeIn">
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-sm shadow-2xl"
            />
            <div className="w-full max-w-3xl mt-6 text-center text-white bg-black/50 p-4 rounded-sm backdrop-blur-md">
              <h3 className="text-xl font-bold uppercase tracking-wide">{selectedImage.title}</h3>
              {selectedImage.shortDescription && (
                <p className="text-sm text-gray-300 mt-2">{selectedImage.shortDescription}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
