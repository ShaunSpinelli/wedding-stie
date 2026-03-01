import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export const Envelope = ({ children, isOpen, onOpen }) => {
  const { t } = useLanguage();

  const textureStyle = {
    backgroundImage: "url('/textures/oldpaper.webp')",
    backgroundSize: "cover",
    backgroundBlendMode: "multiply",
  };

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer overflow-visible`}
      onClick={onOpen}
    >
      <div 
        className="relative flex items-center justify-center transition-all duration-1000"
        style={{ 
          width: window.innerWidth < 640 ? "320px" : window.innerWidth < 768 ? "450px" : "550px",
          height: window.innerWidth < 640 ? "220px" : window.innerWidth < 768 ? "300px" : "380px",
          perspective: "1200px" 
        }}
      >
        <div className="absolute inset-0">
          {/* Back of the envelope */}
          <div 
            className="absolute inset-0 bg-theme-main-3 rounded-xl shadow-2xl overflow-hidden"
            style={textureStyle}
          >
            <div className="absolute inset-0 bg-theme-main-3/40 mix-blend-multiply" />
          </div>

          {/* The Card Container - clips the card when closed, pops to front when open */}
          <motion.div 
            animate={{ zIndex: isOpen ? 40 : 10 }}
            transition={{ delay: isOpen ? 2.5 : 0 }}
            className={`absolute inset-0 ${isOpen ? "" : "overflow-hidden rounded-xl"}`}
          >
            {/* The Card */}
            <motion.div
              initial={{ y: 0, scale: 0.9, opacity: 0 }}
              animate={{
                y: isOpen 
                  ? [0, (window.innerWidth < 640 ? -200 : -350), 0] // Returns to center
                  : 0,
                scale: isOpen ? 1.05 : 0.9,
                opacity: 1,
              }}
              transition={{
                y: {
                  duration: 3.6,
                  times: [0, 0.45, 1],
                  ease: "easeInOut",
                  delay: isOpen ? 0.8 : 0,
                },
                scale: {
                  type: "spring",
                  stiffness: 20,
                  damping: 15,
                  delay: isOpen ? 0.8 : 0,
                },
                opacity: {
                  duration: 0.6,
                  delay: isOpen ? 0.8 : 0
                }
              }}
              className="absolute inset-0 flex items-center justify-center px-4"
            >
              <div className="pointer-events-auto relative">
                {children}
              </div>
            </motion.div>
          </motion.div>

          {/* Front of the envelope (Lower part and sides) */}
          <div className="absolute inset-0 z-20 overflow-hidden rounded-xl pointer-events-none">
            {/* Left triangle */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 bg-theme-main-2 shadow-[4px_0_12px_rgba(0,0,0,0.15)]"
              style={{ 
                ...textureStyle,
                clipPath: "polygon(0 0, 101% 50%, 0 100%)",
                backgroundColor: "var(--theme-main-2)"
              }}
            >
               <div className="absolute inset-0 bg-theme-main-2/20 mix-blend-multiply" />
            </div>
            {/* Right triangle */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 bg-theme-main-2 shadow-[-4px_0_12px_rgba(0,0,0,0.15)]"
              style={{ 
                ...textureStyle,
                clipPath: "polygon(100% 0, -1% 50%, 100% 100%)",
                backgroundColor: "var(--theme-main-2)"
              }}
            >
               <div className="absolute inset-0 bg-theme-main-2/20 mix-blend-multiply" />
            </div>
            {/* Bottom triangle */}
            <div
              className="absolute inset-x-0 bottom-0 h-full bg-theme-main-1 shadow-[0_-5px_15px_rgba(0,0,0,0.08)]"
              style={{ 
                ...textureStyle,
                clipPath: "polygon(0 100%, 50% 50%, 100% 100%)",
                backgroundColor: "var(--theme-main-1)"
              }}
            >
               <div className="absolute inset-0 bg-theme-main-1/20 mix-blend-multiply" />
            </div>
          </div>

          {/* Top flap */}
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ 
              rotateX: isOpen ? 180 : 0,
              zIndex: isOpen ? 5 : 30
            }}
            transition={{ 
              duration: 1.6,
              ease: "easeInOut" 
            }}
            style={{ 
              transformOrigin: "top",
              transformStyle: "preserve-3d"
            }}
            className="absolute inset-x-0 top-0 h-1/2"
          >
            <div
              className="w-full h-full bg-theme-main-2 shadow-2xl relative"
              style={{ 
                ...textureStyle,
                clipPath: "polygon(0 0, 50% 101%, 100% 0)",
                backfaceVisibility: "hidden",
                backgroundColor: "var(--theme-main-2)"
              }}
            >
               <div className="absolute inset-0 bg-theme-main-2/20 mix-blend-multiply" />
            </div>
          </motion.div>

          {/* Custom MS Seal Image with Peeling Effect */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
            <motion.div
              initial={false}
              animate={isOpen ? {
                rotateX: -85,
                y: -60,
                opacity: 0,
                transition: { duration: 1.2, ease: "easeIn" }
              } : {
                rotateX: 0,
                y: 0,
                opacity: 1
              }}
              style={{ 
                transformOrigin: "top",
                transformStyle: "preserve-3d"
              }}
              className="w-24 h-24 sm:w-40 sm:h-40 flex items-center justify-center"
            >
              <img 
                src="/images/ms-seal.png" 
                alt="Seal" 
                className="w-full h-full object-contain drop-shadow-2xl" 
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Instructions */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-theme-accent font-serif tracking-widest text-sm uppercase text-center whitespace-nowrap"
          >
            {t("landing.click_to_open")}
          </motion.div>
          <div className="w-px h-8 bg-theme-main-2/50" />
        </motion.div>
      )}
    </div>
  );
};
