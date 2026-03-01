import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { Envelope } from "./envelope";
import { InvitationCard } from "./invitation-card";

const LandingPage = ({ onOpenInvitation }) => {
  const { t } = useLanguage();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-theme-main-1 flex items-center justify-center">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-theme-main-1 via-theme-support-3/50 to-theme-main-1 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-theme-main-2/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-theme-support-1/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 pt-12 pb-12">
        <Envelope isOpen={isEnvelopeOpen} onOpen={() => setIsEnvelopeOpen(true)}>
          <div className="flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{ 
                scale: isEnvelopeOpen ? 1 : 0.85,
                opacity: 1
              }}
              transition={{ delay: isEnvelopeOpen ? 0.8 : 0, duration: 1 }}
              className="w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px]"
            >
              <InvitationCard isEnvelopeOpen={isEnvelopeOpen} />
            </motion.div>
            
            <AnimatePresence>
              {isEnvelopeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.5, duration: 1 }}
                  className="absolute top-full mt-12 flex flex-col items-center gap-4 w-full"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInvitation();
                    }}
                    className="group relative bg-theme-main-2 text-white px-8 py-3 rounded-full font-serif text-lg tracking-wide shadow-2xl transition-all duration-300 whitespace-nowrap"
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
                    <div className="absolute inset-0 bg-theme-main-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Envelope>
      </div>
    </div>
  );
};

export default LandingPage;
