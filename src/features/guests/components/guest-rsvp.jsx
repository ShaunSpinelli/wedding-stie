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
import { getGuestName } from "@/lib/invitation-storage";

const FEEDBACK_GIFS = {
  happy: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG95YTRlM3RqeXFvZW14MHljb3cwNnpwNnMxdmdjc25lcWw0dGdjZCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/OfkGZ5H2H3f8Y/giphy.gif",
  sad: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3FuaDhzYWV0eG9vcXp1NHl0NmI1OXducTl0ZWJobm81MWNtNWt0biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H6cmWzp6LGFvqjidB7/giphy.gif",
  confused: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGM4cHhuamVuOTd6ZmRleHQ4a3JpandjMGllaHk0eDVocTBranozaSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ji6zzUZwNIuLS/giphy.gif"
};

export default function GuestRSVP({ useAltBg = false }) {
  const { uid, setGuest: setGlobalGuest } = useInvitation();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false); 
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

  useEffect(() => {
    setLoading(false);
    setIsEditMode(true);
  }, [uid, setGlobalGuest]);

  const handleAttendanceClick = (status) => {
    setFormData({ ...formData, attending: status });
    
    if (status === "ATTENDING") setModalType("happy");
    else if (status === "NOT_ATTENDING") setModalType("sad");
    else setModalType("confused");
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "success", text: "RSVP Test: Form submission mock success!" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-theme-main-2 animate-spin" />
      </div>
    );
  }

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
            {t("rsvp.subtitle")}
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
                  className="space-y-8 flex-1"
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
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="p-3 rounded-full bg-theme-main-1 text-theme-main-2 hover:bg-theme-main-2 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-theme-support-1/10 pt-8">
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

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-theme-main-2 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-theme-main-2/90 transition-all flex justify-center items-center gap-2"
                    >
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
