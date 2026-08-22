import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/asset-path";
import { Sparkles } from "lucide-react";

export default function PlayingCardBack({ index = 1 }) {
  return (
    <div className="relative w-full h-full bg-[#FAF8F5] p-1.5 min-[380px]:p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl md:rounded-3xl border border-black/10 flex flex-col justify-between select-none cursor-pointer overflow-hidden shadow-md sm:shadow-xl">
      {/* Texture Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply z-20"
        style={{
          backgroundImage: `url('${getAssetPath("/textures/oldpaper.webp")}')`,
          backgroundSize: "cover",
        }}
      />

      {/* Decorative Ornate Inset Border */}
      <div className="relative w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl border sm:border-2 border-[#bc2c1a]/30 p-1 min-[380px]:p-1.5 sm:p-2.5 md:p-3 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-[#FAF8F5]">
        {/* Diamond Lattice Pattern Background (SVG) */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id={`card-lattice-${index}`}
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="20" height="20" fill="none" />
                <path
                  d="M 0 10 L 20 10 M 10 0 L 10 20"
                  stroke="#bc2c1a"
                  strokeWidth="0.8"
                />
                <circle cx="10" cy="10" r="1.5" fill="#bc2c1a" />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={`url(#card-lattice-${index})`}
            />
          </svg>
        </div>

        {/* Top Header / Corner Emblems */}
        <div className="relative z-10 flex justify-between items-center text-[#bc2c1a]/80 px-1 sm:px-1.5">
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif font-bold text-[10px] min-[360px]:text-xs sm:text-sm">
              N°{index}
            </span>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-serif opacity-70">
              ♠
            </span>
          </div>
          <span className="font-serif tracking-[0.18em] sm:tracking-[0.25em] text-[8px] min-[360px]:text-[9px] sm:text-[10px] md:text-xs uppercase opacity-70 font-semibold truncate max-w-[60%] sm:max-w-none text-center">
            Shaun & Manon
          </span>
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif font-bold text-[10px] min-[360px]:text-xs sm:text-sm">
              N°{index}
            </span>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-serif opacity-70">
              ♠
            </span>
          </div>
        </div>

        {/* Centerpiece Monogram Medallion */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-1">
          <div className="relative w-20 h-28 min-[360px]:w-24 min-[360px]:h-32 sm:w-32 sm:h-40 md:w-36 md:h-44 rounded-[50%] border sm:border-2 border-[#bc2c1a]/40 bg-[#FAF8F5]/90 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-3 shadow-inner">
            {/* Outer dotted ring */}
            <div className="absolute inset-1 sm:inset-1.5 rounded-[50%] border border-dashed border-[#bc2c1a]/30 pointer-events-none" />

            <span className="text-[#bc2c1a]/60 text-[7px] min-[360px]:text-[8px] sm:text-[10px] md:text-xs tracking-[0.15em] font-serif uppercase leading-none">
              Weekend
            </span>
            <span className="font-handwritten text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl text-[#bc2c1a] leading-none py-1">
              S & M
            </span>
            <span className="text-[#bc2c1a]/70 font-serif text-[7px] min-[360px]:text-[8px] sm:text-[10px] md:text-xs tracking-wider font-bold uppercase leading-none mt-0.5">
              May 2027
            </span>
            <span className="text-[#bc2c1a]/40 text-[6px] min-[360px]:text-[7px] sm:text-[8px] md:text-[9px] tracking-wider uppercase font-serif mt-0.5">
              France
            </span>
          </div>

          {/* Interactive Prompt Badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-2 min-[360px]:mt-3 sm:mt-4 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#bc2c1a]/10 border border-[#bc2c1a]/20 flex items-center gap-1 sm:gap-1.5 text-[#bc2c1a] text-[8px] min-[360px]:text-[9px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Tap to reveal</span>
          </motion.div>
        </div>

        {/* Bottom Footer / Corner Emblems (Inverted for Playing Card Symmetry) */}
        <div className="relative z-10 flex justify-between items-center text-[#bc2c1a]/80 px-1 sm:px-1.5 rotate-180">
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif font-bold text-[10px] min-[360px]:text-xs sm:text-sm">
              N°{index}
            </span>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-serif opacity-70">
              ♠
            </span>
          </div>
          <span className="font-serif tracking-[0.18em] sm:tracking-[0.25em] text-[8px] min-[360px]:text-[9px] sm:text-[10px] md:text-xs uppercase opacity-70 font-semibold truncate max-w-[60%] sm:max-w-none text-center">
            Shaun & Manon
          </span>
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif font-bold text-[10px] min-[360px]:text-xs sm:text-sm">
              N°{index}
            </span>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-serif opacity-70">
              ♠
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
