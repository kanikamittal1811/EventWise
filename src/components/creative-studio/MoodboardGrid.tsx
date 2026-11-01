import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Maximize2, Tag, Calendar, Image as ImageIcon, X } from 'lucide-react';
import { useImages } from '../../hooks/useImages';
import { formatBytes, formatDate } from '../../utils/formatters';
import { StoredImage, ImageMetadata } from '../../types/image';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const MoodboardGrid: React.FC = () => {
  const { images, loading, deleteImage, getFullImage } = useImages();
  const [activeImage, setActiveImage] = useState<StoredImage | null>(null);
  const [loadingActive, setLoadingActive] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeImage && !loadingActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImage(null);
        setLoadingActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [activeImage, loadingActive]);

  const handleOpenImage = async (meta: ImageMetadata, e: React.MouseEvent<HTMLElement>) => {
    triggerRef.current = e.currentTarget;
    setLoadingActive(true);
    try {
      const full = await getFullImage(meta.id);
      setActiveImage(full);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActive(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading visual moodboard..." />;
  }

  if (images.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-charcoal-600 bg-background-subtle/50 rounded-2xl border border-charcoal-100">
        No images added to this event workspace yet. Upload concept photos above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden hover:shadow-card transition-all"
          >
            {/* Accessible Thumbnail trigger */}
            <button
              type="button"
              onClick={(e) => handleOpenImage(img, e)}
              aria-label={`View full image: ${img.caption || img.fileName}`}
              className="w-full text-left aspect-square bg-background-subtle flex flex-col items-center justify-center cursor-pointer p-4 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <ImageIcon className="w-8 h-8 text-charcoal-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-charcoal-600 mt-2 text-center line-clamp-1">
                {img.caption || img.fileName}
              </span>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center"
              >
                <span className="bg-white/95 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" aria-hidden="true" /> View
                </span>
              </div>
            </button>

            {/* Metadata footer */}
            <div className="p-3 border-t border-charcoal-100 flex items-center justify-between text-[11px] text-charcoal-600">
              <div>
                <span className="font-semibold text-charcoal block truncate max-w-[120px]">
                  {img.caption || img.fileName}
                </span>
                <span className="text-[10px] text-charcoal-500">
                  {img.width}×{img.height} • {formatBytes(img.sizeBytes)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(img.id);
                }}
                title="Delete image"
                aria-label={`Delete image ${img.caption || img.fileName}`}
                className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal for full image */}
      {(activeImage || loadingActive) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm"
        >
          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-charcoal-100 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setActiveImage(null);
                setLoadingActive(false);
              }}
              aria-label="Close image preview"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-charcoal-100 hover:bg-charcoal-200 text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors z-10"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {loadingActive ? (
              <LoadingSpinner message="Retrieving Base64 image payload from Realtime Database..." />
            ) : activeImage ? (
              <div className="space-y-4">
                <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-charcoal-950">
                  <img
                    src={activeImage.base64Data}
                    alt={activeImage.caption || `Uploaded moodboard concept ${activeImage.fileName}`}
                    className="max-h-[65vh] w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-charcoal-600 gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal">
                      {activeImage.caption || activeImage.fileName}
                    </h4>
                    <p className="text-[11px] text-charcoal-500">
                      Uploaded on {formatDate(new Date(activeImage.createdAt).toISOString())}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-background-subtle px-2.5 py-1 rounded-lg border border-charcoal-200">
                      {activeImage.width} × {activeImage.height} px
                    </span>
                    <span className="bg-background-subtle px-2.5 py-1 rounded-lg border border-charcoal-200">
                      {formatBytes(activeImage.sizeBytes)} Base64
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

