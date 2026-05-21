import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { storeGuestName } from "@/lib/invitation-storage";
import { createGuest, updateGuest, searchGuest } from "@/services/api";
import { getAssetPath } from "@/utils/asset-path";

const FEEDBACK_GIFS = {
  happy:
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG95YTRlM3RqeXFvZW14MHljb3cwNnpwNnMxdmdjc25lcWw0dGdjZCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/OfkGZ5H2H3f8Y/giphy.gif",
  sad: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3FuaDhzYWV0eG9vcXp1NHl0NmI1OXducTl0ZWJobm81MWNtNWt0biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H6cmWzp6LGFvqjidB7/giphy.gif",
  confused:
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGM4cHhuamVuOTd6ZmRleHQ4a3JpandjMGllaHk0eDVocTBranozaSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ji6zzUZwNIuLS/giphy.gif",
};

export default function GuestRSVP() {
  const {
    uid,
    guest: globalGuest,
    setGuest: setGlobalGuest,
    hasFeature,
    logoutGuest,
  } = useInvitation();
  const { t } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guest, setLocalGuest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchError, setSearchError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attending: "MAYBE",
    dietary_requirements: "",
    additional_info: "",
    has_plus_one: false,
    plus_one_name: "",
    plus_guests_allowed: 0,
    plus_guests: [],
    children_count: 0,
    spotify_song_id: null,
  });

  // Load existing guest session
  useEffect(() => {
    if (globalGuest) {
      setLocalGuest(globalGuest);
      setIsEditing(false); // Default to read-only if guest exists
      setFormData({
        name: globalGuest.name || "",
        email: globalGuest.email || "",
        attending: globalGuest.attending || "MAYBE",
        dietary_requirements: globalGuest.dietary_requirements || "",
        additional_info: globalGuest.additional_info || "",
        has_plus_one: globalGuest.has_plus_one || false,
        plus_one_name: globalGuest.plus_one_name || "",
        plus_guests_allowed: globalGuest.plus_guests_allowed ?? 0,
        plus_guests: globalGuest.plus_guests || [],
        children_count: globalGuest.children_count ?? 0,
        spotify_song_id: globalGuest.spotify_song_id || null,
      });
    }
  }, [globalGuest]);

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    setLoading(true);
    setSearchError("");
    try {
      const response = await searchGuest(uid, { email: searchName.trim() });
      if (response.success) {
        setGlobalGuest(response.data);
        storeGuestName(response.data.name);
      } else {
        setSearchError(t("rsvp.not_found"));
      }
    } catch {
      setSearchError(t("rsvp.not_found"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { ...formData };
      let response;
      if (guest?.id) {
        response = await updateGuest(uid, guest.id, payload);
      } else {
        response = await createGuest(uid, payload);
      }

      if (response.success) {
        setGlobalGuest(response.data);
        setIsEditing(false);
        // Show visual feedback
        if (payload.attending === "ATTENDING") setModalType("happy");
        else if (payload.attending === "NOT_ATTENDING") setModalType("sad");
        else setModalType("confused");
        setShowModal(true);
      }
    } catch (err) {
      console.error("RSVP error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAttendanceClick = (status) => {
    setFormData({ ...formData, attending: status });
  };

  return (
    <section
      id="rsvp"
      className="py-12 md:py-24 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="font-handwritten text-6xl md:text-8xl text-[#bc2c1a] leading-none"
          >
            {t("rsvp.title")}
          </motion.h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden"
          >
            {/* Custom Background Image Layer */}
            <div className="absolute inset-0 z-0 bg-white" />
            {!isEditing && (
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${getAssetPath("/textures/rsvp-bg.png")})`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
            {/* Subtle inner depth */}
            <div className="absolute inset-0 z-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] pointer-events-none" />

            <div className="relative z-10 h-2 bg-theme-main-2/10 w-full" />

            <div className="relative z-10 p-12 md:p-24">
              <AnimatePresence mode="wait">
                {!guest ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-serif text-black uppercase tracking-[0.2em]">
                        {t("rsvp.subtitle")}
                      </h3>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                      }}
                      className="max-w-md mx-auto space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                          {t("rsvp.form.label_search")}
                        </label>
                        <input
                          type="email"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black text-lg font-serif"
                          placeholder={t("rsvp.form.placeholder_search")}
                          required
                        />
                      </div>

                      {searchError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-theme-main-2 text-sm italic text-center"
                        >
                          {searchError}
                        </motion.p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-black text-white uppercase tracking-[0.3em] text-xs font-bold hover:bg-theme-main-2 transition-all shadow-xl disabled:opacity-50"
                      >
                        {loading
                          ? t("rsvp.form.btn_saving")
                          : t("rsvp.form.btn_update_info")}
                      </button>
                    </form>
                  </motion.div>
                ) : !isEditing ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-black/5">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
                          {t("rsvp.your_details")}
                        </p>
                        <h3 className="text-3xl font-serif italic text-black">
                          {guest.name}
                        </h3>
                      </div>
                      <button
                        onClick={logoutGuest}
                        className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 hover:text-[#bc2c1a] transition-colors border-b border-transparent hover:border-[#bc2c1a]"
                      >
                        Not you?
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">
                            Attendance
                          </p>
                          <p className="text-xl font-serif text-black">
                            {t(
                              `wishes.attendance.${formData.attending.toLowerCase()}${
                                formData.plus_guests_allowed > 0 ||
                                globalGuest?.has_plus_one
                                  ? "_we"
                                  : ""
                              }`,
                            )}
                          </p>
                        </div>

                        {formData.email && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">
                              Email
                            </p>
                            <p className="text-lg font-serif text-black/80">
                              {formData.email}
                            </p>
                          </div>
                        )}

                        {(formData.plus_one_name ||
                          formData.plus_guests.length > 0) && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">
                              Plus Guests
                            </p>
                            <div className="space-y-1">
                              {formData.plus_one_name && (
                                <p className="text-lg font-serif text-black/80">
                                  {formData.plus_one_name}
                                </p>
                              )}
                              {formData.plus_guests.map((name, i) => (
                                <p
                                  key={i}
                                  className="text-lg font-serif text-black/80"
                                >
                                  {name}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-8">
                        {formData.dietary_requirements && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">
                              Dietary
                            </p>
                            <p className="text-lg font-serif text-black/80 italic">
                              {formData.dietary_requirements}
                            </p>
                          </div>
                        )}

                        {formData.additional_info && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">
                              Note
                            </p>
                            <p className="text-lg font-serif text-black/80 italic leading-relaxed">
                              &ldquo;{formData.additional_info}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-5 rounded-2xl bg-black text-white uppercase tracking-[0.3em] text-xs font-bold hover:bg-theme-main-2 transition-all shadow-xl"
                      >
                        Update Details
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-black/5">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
                          {t("rsvp.your_details")}
                        </p>
                        <h3 className="text-3xl font-serif italic text-black">
                          {guest.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 hover:text-black transition-colors"
                      >
                        Cancel Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                              {t("rsvp.form.guest_one")}
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif"
                            />
                          </div>

                          {formData.plus_guests_allowed > 0 &&
                            Array.from({
                              length: formData.plus_guests_allowed,
                            }).map((_, i) => (
                              <div key={i} className="space-y-2">
                                <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                                  {t("rsvp.form.guest_plus")} {i + 2}
                                </label>
                                <input
                                  type="text"
                                  value={formData.plus_guests[i] || ""}
                                  onChange={(e) => {
                                    const newPlusGuests = [
                                      ...formData.plus_guests,
                                    ];
                                    newPlusGuests[i] = e.target.value;
                                    setFormData({
                                      ...formData,
                                      plus_guests: newPlusGuests,
                                    });
                                  }}
                                  className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif"
                                  placeholder={t(
                                    "rsvp.form.placeholder_plus_one_name",
                                  )}
                                />
                              </div>
                            ))}

                          {!formData.plus_guests_allowed &&
                            globalGuest?.has_plus_one && (
                              <div className="space-y-2">
                                <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                                  {t("rsvp.form.guest_plus")} 2
                                </label>
                                <input
                                  type="text"
                                  value={formData.plus_one_name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      plus_one_name: e.target.value,
                                    })
                                  }
                                  className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif"
                                  placeholder={t(
                                    "rsvp.form.placeholder_plus_one_name",
                                  )}
                                />
                              </div>
                            )}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                              {t("rsvp.form.label_email")}
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif"
                              placeholder={t("rsvp.form.placeholder_email")}
                            />
                          </div>

                          {hasFeature("children") && (
                            <div className="space-y-2">
                              <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                                {t("rsvp.form.label_children")}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formData.children_count}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    children_count:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                            {t("rsvp.form.label_attendance")}
                          </label>
                          <div className="grid grid-cols-1 gap-3">
                            {["ATTENDING", "MAYBE", "NOT_ATTENDING"].map(
                              (status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleAttendanceClick(status)}
                                  className={`px-6 py-4 rounded-2xl text-xs font-bold border uppercase tracking-widest transition-all ${
                                    formData.attending === status
                                      ? "bg-black border-black text-white shadow-lg scale-[1.02]"
                                      : "bg-white border-black/5 text-black/40 hover:border-black/20"
                                  }`}
                                >
                                  {t(
                                    `wishes.attendance.${status.toLowerCase()}${
                                      formData.plus_guests_allowed > 0 ||
                                      globalGuest?.has_plus_one
                                        ? "_we"
                                        : ""
                                    }`,
                                  )}
                                </button>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                              Dietary Requirements
                            </label>
                            <textarea
                              value={formData.dietary_requirements}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dietary_requirements: e.target.value,
                                })
                              }
                              className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif h-24 resize-none"
                              placeholder={t("rsvp.form.placeholder_dietary")}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-black uppercase tracking-[0.1em] text-[10px] font-bold opacity-40 ml-1">
                              {t("rsvp.form.label_additional_info")}
                            </label>
                            <textarea
                              value={formData.additional_info}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  additional_info: e.target.value,
                                })
                              }
                              className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-gray-50/30 focus:bg-white focus:border-theme-main-2 transition-all outline-none text-black font-serif h-24 resize-none"
                              placeholder={t(
                                "rsvp.form.placeholder_additional_info",
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full py-6 rounded-2xl bg-black text-white uppercase tracking-[0.4em] text-sm font-bold hover:bg-theme-main-2 transition-all shadow-2xl disabled:opacity-50"
                      >
                        {saving
                          ? t("rsvp.form.btn_saving")
                          : t("rsvp.form.btn_save")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-2 max-w-sm w-full relative overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-black" />
              </button>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white flex items-center justify-center relative">
                <img
                  src={FEEDBACK_GIFS[modalType]}
                  alt={modalType}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 text-center">
                <p className="text-black text-sm mb-6">
                  {t(`rsvp.form.feedback.${modalType}`)}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-md hover:bg-theme-main-2 transition-all"
                >
                  {t("rsvp.form.feedback.btn_continue")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
