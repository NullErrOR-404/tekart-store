import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  productName: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  activeIndex,
  onChangeIndex,
  productName
}) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom settings when active image index changes or when modal closes/opens
  useEffect(() => {
    setScale(1);
  }, [activeIndex, isOpen]);

  // Handle keyboard events (Esc to close, Left/Right arrows to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, images.length]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    if (images.length <= 1) return;
    const nextIdx = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    onChangeIndex(nextIdx);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    const nextIdx = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    onChangeIndex(nextIdx);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  // Zoom using mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.25;
    setScale(prev => {
      return e.deltaY < 0 ? Math.min(prev + zoomFactor, 4) : Math.max(prev - zoomFactor, 1);
    });
  };

  // Double tap/click to zoom toggle (1x <-> 2.5x)
  const handleDoubleTap = () => {
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Calculate drag constraints dynamically based on image size and scale
  // This prevents dragging the image out of view
  const maxDragX = Math.max(0, (scale - 1) * window.innerWidth / 2);
  const maxDragY = Math.max(0, (scale - 1) * window.innerHeight / 2);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md select-none touch-none"
        ref={containerRef}
      >
        {/* Top bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-left space-y-0.5">
            <h3 className="font-display font-bold text-sm text-white md:text-base line-clamp-1">
              {productName}
            </h3>
            <p className="text-xs text-tk-text-tertiary">
              Image {activeIndex + 1} of {images.length}
            </p>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 md:gap-4 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
            <button
              onClick={handleZoomOut}
              disabled={scale === 1}
              className={`p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:hover:bg-transparent`}
              title="Zoom Out"
            >
              <ZoomOut className="h-4.5 w-4.5" />
            </button>
            <span className="text-xs font-mono font-medium text-white/90 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale === 4}
              className={`p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:hover:bg-transparent`}
              title="Zoom In"
            >
              <ZoomIn className="h-4.5 w-4.5" />
            </button>
            {scale > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1 rounded-full text-tk-blue-bright hover:text-white hover:bg-white/10 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 border border-white/10 text-white/80 hover:text-white hover:bg-white/20 hover:scale-105 transition-all shadow-sm"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main image container */}
        <div 
          className="flex-1 w-full relative flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
        >
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white hover:scale-105 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white hover:scale-105 transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Interactive Image */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <motion.img
              key={activeIndex}
              src={images[activeIndex]}
              alt={`${productName} zoomed view ${activeIndex + 1}`}
              className={`max-w-full max-h-[75vh] object-contain select-none pointer-events-auto ${
                scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
              }`}
              animate={{
                scale: scale,
                x: scale === 1 ? 0 : undefined,
                y: scale === 1 ? 0 : undefined
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              drag={scale > 1}
              dragConstraints={{
                left: -maxDragX,
                right: maxDragX,
                top: -maxDragY,
                bottom: maxDragY
              }}
              dragElastic={0.15}
              onDoubleClick={handleDoubleTap}
            />
          </div>
        </div>

        {/* Thumbnails row / Bottom navigation */}
        {images.length > 1 && (
          <div className="w-full px-6 py-6 z-10 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
            <div className="flex gap-2 max-w-full overflow-x-auto py-1 px-2 no-scrollbar bg-white/5 rounded-2xl border border-white/5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => onChangeIndex(idx)}
                  className={`relative w-14 aspect-[4/5] rounded-lg overflow-hidden border shrink-0 transition-all ${
                    idx === activeIndex
                      ? 'border-tk-blue-bright ring-2 ring-tk-blue-bright scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
