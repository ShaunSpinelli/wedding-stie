import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/asset-path";
import { Sparkles } from "lucide-react";

export default function PlayingCardBack({ index = 1 }) {
  return (
    <div className="relative w-full h-full bg-[#FAF8F5] p-3 sm:p-4 rounded-3xl border border-black/10 flex flex-col justify-between select-none cursor-pointer overflow-hidden shadow-xl">
      {/* Texture Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply z-20"
        style={{
          backgroundImage: `url('${getAssetPath("/textures/oldpaper.webp")}')`,
          backgroundSize: "cover",
        }}
      />

      {/* Decorative Ornate Inset Border */}
      <div className="relative w-full h-full rounded-2xl border-2 border-[#bc2c1a]/30 p-2 sm:p-3 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-[#FAF8F5]">
        {/* Diamond Lattice Pattern Background (SVG) */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id={`card-lattice-${index}`}
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="24" height="24" fill="none" />
                <path
                  d="M 0 12 L 24 12 M 12 0 L 12 24"
                  stroke="#bc2c1a"
                  strokeWidth="1"
                />
                <circle cx="12" cy="12" r="2" fill="#bc2c1a" />
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
        <div className="relative z-10 flex justify-between items-center text-[#bc2c1a]/80 px-1">
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-wider">
              N° {index}
            </span>
            <span className="text-[10px] tracking-widest font-serif opacity-70">
              ♠
            </span>
          </div>
          <span className="font-serif tracking-[0.25em] text-[9px] uppercase opacity-70 font-semibold">
            Shaun & Manon
          </span>
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-wider">
              N° {index}
            </span>
            <span className="text-[10px] tracking-widest font-serif opacity-70">
              ♠
            </span>
          </div>
        </div>

        {/* Centerpiece Monogram Medallion */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-[50%] border-2 border-[#bc2c1a]/40 bg-[#FAF8F5]/90 backdrop-blur-sm flex flex-col items-center justify-center p-3 shadow-inner">
            {/* Outer dotted ring */}
            <div className="absolute inset-1.5 rounded-[50%] border border-dashed border-[#bc2c1a]/30 pointer-events-none" />

            <span className="text-[#bc2c1a]/60 text-xs tracking-[0.2em] font-serif uppercase mb-0.5">
              Weekend
            </span>
            <span className="font-handwritten text-4xl sm:text-5xl text-[#bc2c1a] leading-none py-1">
              S & M
            </span>
            <span className="text-[#bc2c1a]/70 font-serif text-[10px] tracking-[0.25em] font-bold uppercase mt-0.5">
              May 2027
            </span>
            <span className="text-[#bc2c1a]/40 text-[8px] tracking-wider uppercase font-serif mt-1">
              France
            </span>
          </div>

          {/* Interactive Prompt Badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-4 px-3 py-1 rounded-full bg-[#bc2c1a]/10 border border-[#bc2c1a]/20 flex items-center gap-1.5 text-[#bc2c1a] text-[10px] font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3 h-3" />
            <span>Tap to reveal</span>
          </motion.div>
        </div>

        {/* Bottom Footer / Corner Emblems (Inverted for Playing Card Symmetry) */}
        <div className="relative z-10 flex justify-between items-center text-[#bc2c1a]/80 px-1 rotate-180">
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-wider">
              N° {index}
            </span>
            <span className="text-[10px] tracking-widest font-serif opacity-70">
              ♠
            </span>
          </div>
          <span className="font-serif tracking-[0.25em] text-[9px] uppercase opacity-70 font-semibold">
            Shaun & Manon
          </span>
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-wider">
              N° {index}
            </span>
            <span className="text-[10px] tracking-widest font-serif opacity-70">
              ♠
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
