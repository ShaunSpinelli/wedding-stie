import { motion } from "framer-motion";
import PlayingCardBack from "./playing-card-back";

export default function ItineraryCard({
  index = 1,
  frontImage,
  isFlipped = false,
  onFlip,
  alt = "Itinerary Event",
}) {
  const handleClick = () => {
    // Only flip if not already flipped (one-way reveal)
    if (!isFlipped && onFlip) {
      onFlip();
    }
  };

  return (
    <div className="relative w-full aspect-[2/3] max-w-sm mx-auto [perspective:1400px]">
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] transition-shadow duration-500 rounded-3xl"
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
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(0deg)] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <PlayingCardBack index={index} />
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
