import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  CheckCircle,
  Loader2,
  Edit2,
  Sparkles,
  Utensils,
  Users,
  Baby,
  AlertCircle,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { storeGuestName } from "@/lib/invitation-storage";
import { createGuest, updateGuest } from "@/services/api";

const FEEDBACK_GIFS = {
  happy:
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG95YTRlM3RqeXFvZW14MHljb3cwNnpwNnMxdmdjc25lcWw0dGdjZCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/OfkGZ5H2H3f8Y/giphy.gif",
  sad: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3FuaDhzYWV0eG9vcXp1NHl0NmI1OXducTl0ZWJobm81MWNtNWt0biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H6cmWzp6LGFvqjidB7/giphy.gif",
  confused:
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGM4cHhuamVuOTd6ZmRleHQ4a3JpandjMGllaHk0eDVocTBranozaSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ji6zzUZwNIuLS/giphy.gif",
};

export default function GuestRSVP({ useAltBg = false }) {
  const { uid, guest: globalGuest, setGuest: setGlobalGuest } = useInvitation();
  const { t } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditMode] = useState(true);
  const [guest, setLocalGuest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attending: "MAYBE",
    dietary_requirements: "",
    has_plus_one: false,
    plus_one_name: "",
    children_count: 0,
  });
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Sync with global guest state
  useEffect(() => {
    if (globalGuest) {
      setLocalGuest(globalGuest);
      setFormData({
        name: globalGuest.name || "",
        email: globalGuest.email || "",
        attending: globalGuest.attending || "MAYBE",
        dietary_requirements: globalGuest.dietary_requirements || "",
        has_plus_one: globalGuest.has_plus_one || false,
        plus_one_name: globalGuest.plus_one_name || "",
        children_count: globalGuest.children_count || 0,
      });
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  }, [globalGuest]);

  const handleAttendanceClick = (status) => {
    setFormData({ ...formData, attending: status });

    if (status === "ATTENDING") setModalType("happy");
    else if (status === "NOT_ATTENDING") setModalType("sad");
    else setModalType("confused");

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      let response;
      if (guest && guest.id) {
        // Update existing guest
        response = await updateGuest(uid, guest.id, formData);
      } else {
        // Create new guest
        response = await createGuest(uid, formData);
        if (response.success) {
          storeGuestName(formData.name);
        }
      }

      if (response.success) {
        setGlobalGuest(response.data);
        setIsEditMode(false);
        setMsg({
          type: "success",
          text:
            t("rsvp.form.success_msg") ||
            "Thank you! Your RSVP has been saved.",
        });
      } else {
        setMsg({
          type: "error",
          text: response.error || "Failed to save RSVP",
        });
      }
    } catch (err) {
      console.error("RSVP error:", err);
      setMsg({
        type: "error",
        text: "An error occurred while saving your RSVP.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="rsvp"
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: useAltBg ? "#F4F1EC" : "#FFFFFF" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <motion.span className="inline-block text-theme-main-2 font-medium uppercase tracking-widest text-sm">
            {t("rsvp.title")}
          </motion.span>
          <motion.h2 className="text-4xl md:text-5xl font-serif text-theme-main-2">
            {guest ? "Your Guest Details" : t("rsvp.subtitle")}
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-theme-support-1/20 shadow-xl min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              {!isEditing && guest ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8 flex-1 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-theme-main-2">
                        {guest.name}
                      </h3>
                      <p className="text-theme-main-3 font-medium flex items-center gap-2 italic">
                        <Sparkles className="w-4 h-4" />
                        {t(
                          `wishes.attendance.${guest.attending.toLowerCase()}`,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-theme-support-1/10 pt-8 flex-1">
                    <div className="flex items-center gap-4 text-theme-main-3">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/5 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          {t("rsvp.form.label_email")}
                        </p>
                        <p className="font-medium truncate max-w-[180px]">
                          {guest.email || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-theme-main-3">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/5 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          Plus One
                        </p>
                        <p className="font-medium">
                          {guest.has_plus_one
                            ? guest.plus_one_name || "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-theme-main-3">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/5 flex items-center justify-center flex-shrink-0">
                        <Baby className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          Children
                        </p>
                        <p className="font-medium">
                          {guest.children_count || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-theme-main-3">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/5 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          Dietary
                        </p>
                        <p className="font-medium truncate max-w-[180px]">
                          {guest.dietary_requirements || "None"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-theme-support-1/10">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="w-full py-4 bg-theme-main-1 text-theme-main-2 rounded-xl font-bold shadow-sm hover:bg-theme-main-2 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t("rsvp.form.btn_update_info")}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key={guest ? guest.id : "new"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 flex-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-theme-main-3 text-sm font-medium">
                        <User className="w-4 h-4" />
                        {t("rsvp.form.label_name")}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-main-2"
                        placeholder={t("rsvp.form.placeholder_name")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-theme-main-3 text-sm font-medium">
                        <Mail className="w-4 h-4" />
                        {t("rsvp.form.label_email")}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-main-2"
                        placeholder={t("rsvp.form.placeholder_email")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-theme-main-3 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {t("rsvp.form.label_attendance")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["ATTENDING", "MAYBE", "NOT_ATTENDING"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleAttendanceClick(status)}
                          className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${formData.attending === status ? "bg-theme-main-2 border-theme-main-2 text-white shadow-md" : "bg-white border-theme-support-1/20 text-theme-main-3/60 hover:border-theme-main-2/30"}`}
                        >
                          {t(`wishes.attendance.${status.toLowerCase()}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-theme-main-3 text-sm font-medium">
                        <Users className="w-4 h-4" />
                        Plus One
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, has_plus_one: true })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${formData.has_plus_one ? "bg-theme-main-2 border-theme-main-2 text-white shadow-md" : "bg-white border-theme-support-1/20 text-theme-main-3/60 hover:border-theme-main-2/30"}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              has_plus_one: false,
                              plus_one_name: "",
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${!formData.has_plus_one ? "bg-theme-main-2 border-theme-main-2 text-white shadow-md" : "bg-white border-theme-support-1/20 text-theme-main-3/60 hover:border-theme-main-2/30"}`}
                        >
                          No
                        </button>
                      </div>
                      {formData.has_plus_one && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2"
                        >
                          <input
                            type="text"
                            value={formData.plus_one_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                plus_one_name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-sm text-theme-main-2"
                            placeholder="Partner's Name"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-theme-main-3 text-sm font-medium">
                        <Baby className="w-4 h-4" />
                        Children Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.children_count}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            children_count: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-main-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-theme-main-3 text-sm font-medium">
                      <Utensils className="w-4 h-4" />
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
                      className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-main-2 h-24 resize-none"
                      placeholder="Allergies, vegetarian, etc."
                    />
                  </div>

                  {msg.text && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`p-4 rounded-xl flex items-center gap-3 text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-theme-support-3/10 text-theme-main-3 border border-theme-support-1/10"}`}
                    >
                      {msg.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      {msg.text}
                    </motion.div>
                  )}

                  <div className="pt-4 flex gap-3">
                    {guest && (
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 px-6 py-4 rounded-xl font-bold border border-theme-support-1/20 text-theme-main-3 hover:bg-theme-support-3/5 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-[2] bg-theme-main-2 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-theme-main-2/90 transition-all flex justify-center items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {t("rsvp.form.btn_save")}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Visual Feedback Modal */}
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
                <p className="text-theme-main-3 text-sm mb-6">
                  {t(`rsvp.form.feedback.${modalType}`)}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-theme-main-2 text-white rounded-xl font-bold shadow-md hover:bg-theme-main-2/90 transition-all"
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
