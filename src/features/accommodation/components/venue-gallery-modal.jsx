import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getAssetPath } from "@/utils/asset-path";

const GALLERY_IMAGES = [
  getAssetPath("/images/rooms/Image1.jpg"),
  getAssetPath("/images/rooms/2.jpg"),
  getAssetPath("/images/rooms/3.jpg"),
  getAssetPath("/images/rooms/5.jpg"),
  getAssetPath("/images/rooms/6.jpg"),
  getAssetPath("/images/rooms/7.jpg"),
  getAssetPath("/images/rooms/8.jpg"),
  getAssetPath("/images/rooms/11.jpg"),
  getAssetPath("/images/rooms/12.jpg"),
  getAssetPath("/images/rooms/room-extra-1.png"),
  getAssetPath("/images/rooms/room-extra-2.png"),
  getAssetPath("/images/rooms/room-extra-3.png"),
  getAssetPath("/images/rooms/room-extra-4.png"),
  getAssetPath("/images/rooms/room-extra-5.png"),
  getAssetPath("/images/rooms/room-extra-6.png"),
  getAssetPath("/images/rooms/room-extra-7.png"),
  getAssetPath("/images/rooms/room-extra-8.png"),
];

export default function VenueGalleryModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1,
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1,
    );
  };

  const currentImageSrc = GALLERY_IMAGES[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-sm"
            aria-label="Close gallery"
          >
            <X size={20} />
          </button>

          {/* Main Image Display */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={currentImageSrc}
                alt={`Room photo ${currentIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-contain select-none"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>

            {/* Slide Indicator Badge */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium tracking-widest backdrop-blur-sm border border-white/10">
              {currentIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="p-3 sm:p-4 bg-[#141414] border-t border-white/10 flex gap-2 sm:gap-3 overflow-x-auto justify-center">
            {GALLERY_IMAGES.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex-shrink-0 w-14 sm:w-20 h-10 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? "border-[#bc2c1a] scale-105 shadow-md opacity-100"
                    : "border-transparent opacity-50 hover:opacity-90"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
