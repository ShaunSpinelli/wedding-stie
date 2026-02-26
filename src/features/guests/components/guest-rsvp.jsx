import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  CheckCircle,
  Loader2,
  Edit2,
  Globe,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation";
import { searchGuest, createGuest, updateGuest } from "@/services/api";
import { getGuestName } from "@/lib/invitation-storage";

export default function GuestRSVP() {
  const { uid } = useInvitation();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditMode] = useState(false);
  const [guest, setGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attending: "MAYBE",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Initial load: search by name from URL/Storage
  useEffect(() => {
    const initGuest = async () => {
      const storedName = getGuestName();
      if (storedName && uid) {
        setFormData((prev) => ({ ...prev, name: storedName }));
        try {
          const response = await searchGuest(uid, { name: storedName });
          if (response.success && response.data) {
            setGuest(response.data);
            setFormData({
              name: response.data.name,
              email: response.data.email || "",
              attending: response.data.attending,
            });
            setIsEditMode(false); // Show profile view first
          }
        } catch {
          console.log("Guest not found by name, allowing registration.");
          setIsEditMode(true); // Show form immediately for new guests
        }
      } else {
        setIsEditMode(true);
      }
      setLoading(false);
    };

    initGuest();
  }, [uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let activeGuest = guest;

      // Try search by email if name match failed
      if (!activeGuest && formData.email) {
        try {
          const searchResponse = await searchGuest(uid, {
            email: formData.email,
          });
          if (searchResponse.success && searchResponse.data) {
            activeGuest = searchResponse.data;
            setGuest(activeGuest);
          }
        } catch {
          // Proceed to create
        }
      }

      if (activeGuest) {
        const response = await updateGuest(uid, activeGuest.id, {
          name: formData.name,
          email: formData.email,
          attending: formData.attending,
        });
        if (response.success) {
          setGuest(response.data);
          setMessage({ type: "success", text: t("rsvp.form.success_update") });
          setIsEditMode(false);
        }
      } else {
        const response = await createGuest(uid, {
          name: formData.name,
          email: formData.email,
          attending: formData.attending,
        });
        if (response.success) {
          setGuest(response.data);
          setMessage({ type: "success", text: t("rsvp.form.success_create") });
          setIsEditMode(false);
        }
      }
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => {
        setMessage((prev) =>
          prev.type === "success" ? { type: "", text: "" } : prev,
        );
      }, 5000);
    }
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
      className="py-20 bg-theme-support-3/10 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
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
          <motion.h2 className="text-4xl md:text-5xl font-serif text-theme-accent">
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
                /* GUEST PROFILE VIEW */
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8 flex-1"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-theme-accent">
                        {guest.name}
                      </h3>
                      <p className="text-theme-main-2 font-medium flex items-center gap-2 italic">
                        <Sparkles className="w-4 h-4" />
                        {t(
                          `wishes.attendance.${guest.attending.toLowerCase()}`,
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="p-3 rounded-full bg-theme-main-1 text-theme-accent hover:bg-theme-main-2 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 border-t border-theme-support-1/10 pt-8">
                    <div className="flex items-center gap-4 text-theme-accent/70">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/50 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          {t("rsvp.form.label_email")}
                        </p>
                        <p className="font-medium">{guest.email || "—"}</p>
                      </div>
                    </div>

                    {guest.country && (
                      <div className="flex items-center gap-4 text-theme-accent/70">
                        <div className="w-10 h-10 rounded-xl bg-theme-support-3/50 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-theme-main-2" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                            Country
                          </p>
                          <p className="font-medium">{guest.country}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.text && message.type === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-theme-support-1/10 text-theme-accent p-4 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <p className="text-sm font-medium">{message.text}</p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* RSVP FORM VIEW */
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 flex-1"
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
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
                      className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 focus:ring-2 focus:ring-theme-main-2/10 transition-all outline-none text-theme-accent"
                      placeholder={t("rsvp.form.placeholder_name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
                      <Mail className="w-4 h-4" />
                      {t("rsvp.form.label_email")}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 focus:ring-2 focus:ring-theme-main-2/10 transition-all outline-none text-theme-accent"
                      placeholder={t("rsvp.form.placeholder_email")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {t("rsvp.form.label_attendance")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["ATTENDING", "MAYBE", "NOT_ATTENDING"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, attending: status })
                          }
                          className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                            formData.attending === status
                              ? "bg-theme-main-2 border-theme-main-2 text-white shadow-md"
                              : "bg-white border-theme-support-1/20 text-theme-accent/60 hover:border-theme-main-2/30"
                          }`}
                        >
                          {t(`wishes.attendance.${status.toLowerCase()}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-theme-accent text-white py-4 rounded-xl font-bold shadow-lg hover:bg-theme-accent/90 disabled:bg-theme-support-1/50 transition-all flex justify-center items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : null}
                      {saving
                        ? t("rsvp.form.btn_saving")
                        : t("rsvp.form.btn_save")}
                    </button>
                    {guest && (
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="w-full text-theme-accent/50 text-sm font-medium hover:text-theme-accent transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
