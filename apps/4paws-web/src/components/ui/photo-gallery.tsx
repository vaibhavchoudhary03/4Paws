/**
 * PHOTO GALLERY COMPONENT - Display and manage animal photos
 * 
 * PURPOSE:
 * Provides a responsive gallery for displaying animal photos with lightbox,
 * primary photo selection, and photo management.
 * 
 * KEY FEATURES:
 * 1. RESPONSIVE GALLERY
 *    - Grid layout that adapts to screen size
 *    - Thumbnail navigation
 *    - Primary photo highlighting
 * 
 * 2. LIGHTBOX FUNCTIONALITY
 *    - Full-screen photo viewing
 *    - Navigation between photos
 *    - Zoom and pan capabilities
 * 
 * 3. PHOTO MANAGEMENT
 *    - Set primary photo
 *    - Delete photos
 *    - Reorder photos (future enhancement)
 * 
 * USER WORKFLOWS:
 * - Staff: View and manage animal photos
 * - Adopters: Browse photos for adoption decisions
 * - Volunteers: Quick photo reference
 * 
 * TECHNICAL NOTES:
 * - Uses CSS Grid for responsive layout
 * - Modal-based lightbox implementation
 * - Keyboard navigation support
 */

import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { X, Star, Trash2, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  onPhotosChange?: (photos: string[]) => void;
  onSetPrimary?: (index: number) => void;
  primaryIndex?: number;
  editable?: boolean;
  className?: string;
}

export default function PhotoGallery({ 
  photos, 
  onPhotosChange, 
  onSetPrimary, 
  primaryIndex = 0,
  editable = false,
  className = ""
}: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ============================================================================
  // LIGHTBOX FUNCTIONALITY - Full-screen photo viewing
  // ============================================================================

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // ============================================================================
  // PHOTO MANAGEMENT - Delete and set primary
  // ============================================================================

  const handleDeletePhoto = (index: number) => {
    if (onPhotosChange) {
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    }
  };

  const handleSetPrimary = (index: number) => {
    if (onSetPrimary) {
      onSetPrimary(index);
    }
  };

  // ============================================================================
  // KEYBOARD NAVIGATION - Arrow keys and escape
  // ============================================================================

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!lightboxOpen) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevPhoto();
        break;
      case 'ArrowRight':
        nextPhoto();
        break;
    }
  };

  // ============================================================================
  // RENDER HELPERS - Empty state and loading
  // ============================================================================

  if (photos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <ZoomIn className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">No photos available</p>
        <p className="text-sm text-muted-foreground">
          {editable ? 'Upload photos to get started' : 'Photos will appear here when added'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(index)}
                />
                
                {/* Primary Photo Badge */}
                {index === primaryIndex && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                {editable && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {index !== primaryIndex && onSetPrimary && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(index);
                          }}
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      )}
                      {onPhotosChange && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            {/* Close Button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-4 right-4 z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Main Photo */}
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} of {photos.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      index === currentIndex ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
