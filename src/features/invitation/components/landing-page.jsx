import { useState } from "react";
import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/asset-path";
import { useLanguage } from "@/lib/language-context";

const LandingPage = ({ onOpenInvitation }) => {
  const { t } = useLanguage();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  const handleEnvelopeClick = () => {
    if (!isEnvelopeOpen) {
      setIsEnvelopeOpen(true);
      // Immediately start the transition to the main invitation
      // A small delay (100ms) to ensure the envelope "opening" state is set and animations begin
      setTimeout(() => {
        onOpenInvitation();
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center z-[100]"
      style={{ backgroundColor: "#F4F1EC" }}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-black/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
        {/* Interaction Area */}
        <motion.div
          className="relative flex flex-col items-center justify-center cursor-pointer select-none max-h-[90vh]"
          onClick={handleEnvelopeClick}
          animate={{
            opacity: isEnvelopeOpen ? 0 : 1,
            scale: isEnvelopeOpen ? 1.1 : 1,
            filter: isEnvelopeOpen ? "blur(10px)" : "blur(0px)",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Envelope Image Container */}
          <div className="relative">
            <img
              src={getAssetPath("/images/green_envelope.png")}
              alt="Envelope"
              className="w-[600px] sm:w-[700px] md:w-[800px] h-auto drop-shadow-2xl max-w-[150vw]"
            />

            {/* MS Seal Overlay */}
            <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <motion.div
                initial={false}
                animate={
                  isEnvelopeOpen
                    ? {
                        rotateX: -45,
                        y: -20,
                        opacity: 0,
                        transition: { duration: 0.6, ease: "easeOut" },
                      }
                    : {
                        rotateX: 0,
                        y: 0,
                        opacity: 1,
                      }
                }
                style={{
                  transformOrigin: "top",
                  transformStyle: "preserve-3d",
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
          </div>

          {/* Tap to Open Hint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="-mt-12 sm:-mt-16 md:-mt-20 text-center relative z-20"
          >
            <p className="font-handwritten text-3xl md:text-4xl text-black/60 drop-shadow-sm">
              {t("landing.tap_to_open")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
