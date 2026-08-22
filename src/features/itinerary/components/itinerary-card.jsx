import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/asset-path";

export default function ItineraryCard({
  frontImage,
  isFlipped = false,
  onFlip,
  alt = "Itinerary Event",
}) {
  const cardBackImage = getAssetPath("/images/card-back.png");

  const handleClick = () => {
    // Only flip if not already flipped (one-way reveal)
    if (!isFlipped && onFlip) {
      onFlip();
    }
  };

  return (
    <div className="relative w-full aspect-[2/3] max-w-sm mx-auto [perspective:1400px]">
      <motion.div
        className={`w-full h-full relative [transform-style:preserve-3d] transition-shadow duration-500 rounded-xl sm:rounded-2xl md:rounded-3xl ${
          !isFlipped ? "cursor-pointer" : "cursor-default"
        }`}
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          duration: 0.85,
          ease: [0.23, 1, 0.32, 1], // Smooth natural 3D flip deceleration curve
        }}
        whileHover={
          !isFlipped
            ? {
                y: -10,
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.25 },
              }
            : {}
        }
        whileTap={!isFlipped ? { scale: 0.98 } : {}}
        onClick={handleClick}
      >
        {/* BACK OF CARD (Visible initially at 0deg) */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(0deg)] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gray-50 border border-black/5">
          <img
            src={cardBackImage}
            alt="Card Back"
            className="w-full h-full object-cover select-none pointer-events-none transform scale-[1.05]"
            loading="lazy"
          />

          {/* Floating 'Tap to reveal' Prompt Badge (Positioned higher, no icon) */}
          <div className="absolute inset-x-0 bottom-8 sm:bottom-12 md:bottom-14 flex justify-center items-center z-10 pointer-events-none px-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.88, 1, 0.88] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#FAF8F5]/90 border border-[#bc2c1a]/30 shadow-md backdrop-blur-sm flex items-center justify-center text-[#bc2c1a] text-[8px] min-[360px]:text-[9px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase"
            >
              <span className="whitespace-nowrap">Tap to reveal</span>
            </motion.div>
          </div>
        </div>

        {/* FRONT OF CARD (Visible after 180deg flip) */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-md sm:shadow-xl border border-black/5 bg-gray-50">
          <img
            src={frontImage}
            alt={alt}
            className="w-full h-full object-cover select-none pointer-events-none transform scale-[1.05]"
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>
  );
}
