import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { InvitationCard } from "./invitation-card";
import { getAssetPath } from "@/utils/asset-path";

const LandingPage = ({ onOpenInvitation }) => {
  const { t } = useLanguage();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center z-0"
      style={{ backgroundColor: "#F4F1EC" }} // Matches the section background color
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-black/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
        
        {/* Interaction Area */}
        <div 
          className="relative flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={() => !isEnvelopeOpen && setIsEnvelopeOpen(true)}
        >
          {/* Invitation Card Clipping Container */}
          <div className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none ${isEnvelopeOpen ? "" : "overflow-hidden"}`}>
            {/* The Invitation Card */}
            <motion.div
              initial={{ y: 0, opacity: 0, scale: 0.8, zIndex: 10 }}
              animate={{
                y: isEnvelopeOpen 
                  ? [0, (window.innerWidth < 640 ? -200 : -350), 0] 
                  : 0,
                scale: isEnvelopeOpen ? (window.innerWidth < 640 ? 1.2 : 1.1) : 0.8,
                opacity: isEnvelopeOpen ? 1 : 0,
                zIndex: isEnvelopeOpen ? 40 : 10,
              }}
              transition={{
                y: { 
                  duration: 3.5, 
                  times: [0, 0.5, 1],
                  ease: "easeInOut",
                  delay: 0.2 
                },
                scale: { duration: 1.5, delay: 0.3 },
                opacity: { duration: 0.8, delay: 0.3 },
                zIndex: { delay: isEnvelopeOpen ? 1.2 : 0 }
              }}
              className="absolute w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] flex items-center justify-center"
            >
              <InvitationCard isEnvelopeOpen={isEnvelopeOpen} />
            </motion.div>
          </div>

          {/* Envelope Image Container */}
          <motion.div 
            initial={{ opacity: 1, zIndex: 20 }}
            animate={{ opacity: isEnvelopeOpen ? 0.2 : 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <img 
              src={getAssetPath("/images/green_envelope.png")} 
              alt="Envelope" 
              className="w-[600px] sm:w-[800px] md:w-[1000px] h-auto drop-shadow-2xl max-w-[150vw]"
            />
            
            {/* MS Seal Overlay */}
            <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <motion.div
                initial={false}
                animate={isEnvelopeOpen ? {
                  rotateX: -25,
                  y: -15,
                  opacity: 0,
                  transition: { duration: 1.5, ease: "easeOut" }
                } : {
                  rotateX: 0,
                  y: 0,
                  opacity: 1
                }}
                style={{ 
                  transformOrigin: "top",
                  transformStyle: "preserve-3d"
                }}
                className="w-32 h-32 sm:w-48 md:w-56 flex items-center justify-center"
              >
                <img 
                  src={getAssetPath("/images/ms-seal.png")} 
                  alt="Seal" 
                  className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]" 
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Proceed Button */}
          <AnimatePresence>
            {isEnvelopeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4.0, duration: 1, ease: "easeOut" }}
                className="absolute top-full -mt-8 sm:-mt-12 md:-mt-16 flex flex-col items-center w-full z-50"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInvitation();
                  }}
                  className="group relative bg-theme-main-2 text-white px-10 py-4 rounded-full font-serif text-lg tracking-wide shadow-2xl transition-all duration-300 whitespace-nowrap border-2 border-white/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span>{t("landing.open_invitation")}</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      →
                    </motion.span>
                  </span>
                  {/* Hover effect using Romantic color (Red) */}
                  <div className="absolute inset-0 bg-theme-romantic rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
