import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { updateGuest } from "@/services/api";
import VenueGalleryModal from "./venue-gallery-modal";

export default function Accommodation() {
  const { t, language } = useLanguage();
  const {
    uid,
    guest: globalGuest,
    setGuest: setGlobalGuest,
    setShowEmailModal,
  } = useInvitation();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [savingWeekend, setSavingWeekend] = useState(false);
  const [savingExtraNight, setSavingExtraNight] = useState(false);
  const [weekendChoice, setWeekendChoice] = useState(null);
  const [extraNightChoice, setExtraNightChoice] = useState(null);
  const [savedWeekendToast, setSavedWeekendToast] = useState(false);
  const [savedExtraNightToast, setSavedExtraNightToast] = useState(false);

  // Sync state with identified guest
  useEffect(() => {
    if (globalGuest) {
      setWeekendChoice(
        globalGuest.staying_onsite || globalGuest.stayingOnsite || null,
      );
      setExtraNightChoice(
        globalGuest.staying_extra_night ||
          globalGuest.stayingExtraNight ||
          null,
      );
    }
  }, [globalGuest]);

  const amenities = t("accommodation.amenities") || [];

  const handleSelectWeekend = async (value) => {
    if (!globalGuest?.id) {
      setShowEmailModal(true);
      return;
    }

    setWeekendChoice(value);
    setSavingWeekend(true);
    try {
      const payload = {
        staying_onsite: value,
        language,
      };
      const response = await updateGuest(uid, globalGuest.id, payload);
      if (response.success) {
        setGlobalGuest(response.data);
        setSavedWeekendToast(true);
        setTimeout(() => setSavedWeekendToast(false), 2500);
      }
    } catch (err) {
      console.error("Failed to update accommodation preference:", err);
    } finally {
      setSavingWeekend(false);
    }
  };

  const handleSelectExtraNight = async (value) => {
    if (!globalGuest?.id) {
      setShowEmailModal(true);
      return;
    }

    setExtraNightChoice(value);
    setSavingExtraNight(true);
    try {
      const payload = {
        staying_extra_night: value,
        language,
      };
      const response = await updateGuest(uid, globalGuest.id, payload);
      if (response.success) {
        setGlobalGuest(response.data);
        setSavedExtraNightToast(true);
        setTimeout(() => setSavedExtraNightToast(false), 2500);
      }
    } catch (err) {
      console.error("Failed to update extra night preference:", err);
    } finally {
      setSavingExtraNight(false);
    }
  };

  return (
    <section
      id="accommodation"
      className="scroll-mt-12 md:scroll-mt-20 py-12 md:py-20 px-4 bg-[#FAF8F5] relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-handwritten text-5xl md:text-7xl lg:text-8xl text-[#bc2c1a] leading-tight"
          >
            {t("accommodation.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-700 font-serif text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {t("accommodation.intro_1")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 font-serif text-sm sm:text-base max-w-2xl mx-auto leading-relaxed pt-1"
          >
            {t("accommodation.intro_2")}
          </motion.p>
        </div>

        {/* Accommodation Amenities & Highlights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-black/5 space-y-8"
        >
          <div className="space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl text-gray-900 font-medium">
              {t("accommodation.includes_title")}
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-2">
              {Array.isArray(amenities) &&
                amenities.map((item, idx) => {
                  const text = typeof item === "string" ? item : item.text;
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc2c1a] mt-2 flex-shrink-0" />
                      <span className="text-gray-700 font-serif text-sm sm:text-base leading-relaxed">
                        {text}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Pricing Highlight */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#f5eee6] border border-[#e8dcd0] text-center">
            <p className="font-serif text-base sm:text-lg text-gray-900 font-medium tracking-wide">
              {t("accommodation.pricing")}
            </p>
          </div>

          {/* Single Photo Gallery Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#bc2c1a] border-2 border-[#bc2c1a]/40 hover:border-[#bc2c1a] hover:bg-[#bc2c1a] hover:text-white transition-all text-xs sm:text-sm font-medium shadow-sm hover:shadow-md group"
            >
              <ImageIcon
                size={18}
                className="transition-transform group-hover:scale-110 flex-shrink-0"
              />
              <span>
                {t("accommodation.gallery_button") ||
                  "Click here to see a few examples of the rooms and the venue outside"}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Question 1: Weekend Stay Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-black/5 space-y-6"
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-lg sm:text-2xl text-gray-900 font-medium">
              {t("accommodation.question_weekend")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Option YES */}
            <button
              type="button"
              onClick={() => handleSelectWeekend("YES")}
              disabled={savingWeekend}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${
                weekendChoice === "YES"
                  ? "border-[#bc2c1a] bg-[#FAF8F5] shadow-md"
                  : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    weekendChoice === "YES"
                      ? "border-[#bc2c1a] bg-[#bc2c1a] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {weekendChoice === "YES" && (
                    <Check size={12} strokeWidth={3} />
                  )}
                </div>
                <span className="font-serif text-sm sm:text-base text-gray-900 font-medium">
                  {t("accommodation.options_weekend.yes")}
                </span>
              </div>
            </button>

            {/* Option NO */}
            <button
              type="button"
              onClick={() => handleSelectWeekend("NO")}
              disabled={savingWeekend}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${
                weekendChoice === "NO"
                  ? "border-[#bc2c1a] bg-[#FAF8F5] shadow-md"
                  : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    weekendChoice === "NO"
                      ? "border-[#bc2c1a] bg-[#bc2c1a] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {weekendChoice === "NO" && (
                    <Check size={12} strokeWidth={3} />
                  )}
                </div>
                <span className="font-serif text-sm sm:text-base text-gray-900 font-medium">
                  {t("accommodation.options_weekend.no")}
                </span>
              </div>
            </button>
          </div>

          {/* Feedback Status */}
          <div className="flex items-center justify-end min-h-[24px]">
            {savingWeekend && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-sans">
                <Loader2 size={14} className="animate-spin" />
                {t("accommodation.status_saving")}
              </span>
            )}
            {savedWeekendToast && (
              <span className="inline-flex items-center gap-1 text-xs text-[#bc2c1a] font-medium font-sans animate-fade-in">
                <Check size={14} strokeWidth={2.5} />
                {t("accommodation.status_saved")}
              </span>
            )}
          </div>
        </motion.div>

        {/* Question 2: Optional Extra Sunday Night (Only shown if user chose YES for weekend stay) */}
        <AnimatePresence>
          {weekendChoice === "YES" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-black/5 space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#bc2c1a]">
                  {t("accommodation.extra_night_title")}
                </span>
                <p className="text-gray-700 font-serif text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {t("accommodation.extra_night_description")}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <h4 className="font-serif text-base sm:text-lg text-gray-900 font-medium text-center sm:text-left">
                  {t("accommodation.question_extra_night")}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Extra Night YES */}
                  <button
                    type="button"
                    onClick={() => handleSelectExtraNight("YES")}
                    disabled={savingExtraNight}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${
                      extraNightChoice === "YES"
                        ? "border-[#bc2c1a] bg-[#FAF8F5] shadow-md"
                        : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          extraNightChoice === "YES"
                            ? "border-[#bc2c1a] bg-[#bc2c1a] text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {extraNightChoice === "YES" && (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-serif text-sm sm:text-base text-gray-900 font-medium">
                        {t("accommodation.options_extra_night.yes")}
                      </span>
                    </div>
                  </button>

                  {/* Extra Night NO */}
                  <button
                    type="button"
                    onClick={() => handleSelectExtraNight("NO")}
                    disabled={savingExtraNight}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${
                      extraNightChoice === "NO"
                        ? "border-[#bc2c1a] bg-[#FAF8F5] shadow-md"
                        : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          extraNightChoice === "NO"
                            ? "border-[#bc2c1a] bg-[#bc2c1a] text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {extraNightChoice === "NO" && (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-serif text-sm sm:text-base text-gray-900 font-medium">
                        {t("accommodation.options_extra_night.no")}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Extra Night Feedback Status */}
                <div className="flex items-center justify-end min-h-[24px]">
                  {savingExtraNight && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-sans">
                      <Loader2 size={14} className="animate-spin" />
                      {t("accommodation.status_saving")}
                    </span>
                  )}
                  {savedExtraNightToast && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#bc2c1a] font-medium font-sans animate-fade-in">
                      <Check size={14} strokeWidth={2.5} />
                      {t("accommodation.status_saved")}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gallery Lightbox Modal */}
      <VenueGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </section>
  );
}
