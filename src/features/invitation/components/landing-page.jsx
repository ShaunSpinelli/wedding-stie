import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

const LandingPage = ({ onOpenInvitation }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden bg-theme-main-1"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-theme-main-1 via-theme-support-3/50 to-theme-main-1" />
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-theme-main-2/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-theme-support-1/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md lg:max-w-2xl"
        >
          {/* Card Container */}
          <div className="backdrop-blur-sm bg-white/60 p-6 sm:p-8 md:p-10 lg:p-16 rounded-3xl border border-theme-support-1/20 shadow-2xl">
            {/* Top Decorative Line */}
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="h-px w-12 sm:w-16 lg:w-24 bg-theme-support-1/30" />
              <div className="w-2 h-2 rounded-full bg-theme-main-2" />
              <div className="h-px w-12 sm:w-16 lg:w-24 bg-theme-support-1/30" />
            </div>

            {/* Date and Time */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row gap-4 mb-6 sm:mb-8 items-center justify-center"
            >
              <div className="inline-flex flex-col items-center space-y-1 bg-white/90 px-4 sm:px-6 py-2 sm:py-3 rounded-xl min-w-[160px] border border-theme-main-1">
                <Calendar className="w-5 h-5 text-theme-main-2" />
                <p className="text-theme-accent font-medium">
                  {t("wedding.displayDate")}
                </p>
              </div>

              <div className="inline-flex flex-col items-center space-y-1 bg-white/90 px-4 sm:px-6 py-2 sm:py-3 rounded-xl min-w-[160px] border border-theme-main-1">
                <Clock className="w-5 h-5 text-theme-main-2" />
                <p className="text-theme-accent font-medium">
                  {t("wedding.displayTime")}
                </p>
              </div>
            </motion.div>

            {/* Couple Names */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-theme-accent leading-tight">
                  {t("wedding.groomName")}
                  <span className="text-theme-main-2 mx-2 sm:mx-3 lg:mx-4">
                    &
                  </span>
                  {t("wedding.brideName")}
                </h1>
                <div className="h-px w-16 sm:w-24 lg:w-32 mx-auto bg-theme-main-2/30" />
              </div>
            </motion.div>

            {/* Open Invitation Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 sm:mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenInvitation}
                className="group relative w-full bg-theme-main-2 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-medium shadow-lg transition-all duration-200"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>{t("landing.open_invitation")}</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-theme-main-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
