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
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { searchGuest, createGuest, updateGuest } from "@/services/api";
import { getGuestName } from "@/lib/invitation-storage";

export default function GuestRSVP() {
  const { uid, setGuest: setGlobalGuest } = useInvitation();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditMode] = useState(false);
  const [guest, setLocalGuest] = useState(null);
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
    const initGuest = async () => {
      const storedName = getGuestName();
      if (storedName && uid) {
        setFormData((prev) => ({ ...prev, name: storedName }));
        try {
          const response = await searchGuest(uid, { name: storedName });
          if (response.success && response.data) {
            const g = response.data;
            setLocalGuest(g);
            setGlobalGuest(g); // Sync to context
            setFormData({
              name: g.name || "",
              email: g.email || "",
              attending: g.attending || "MAYBE",
              dietary_requirements: g.dietary_requirements || "",
              has_plus_one: g.has_plus_one === true,
              plus_one_name: g.plus_one_name || "",
              children_count: g.children_count || 0,
            });
            setIsEditMode(false);
          }
        } catch {
          setIsEditMode(true);
        }
      } else {
        setIsEditMode(true);
      }
      setLoading(false);
    };

    initGuest();
  }, [uid, setGlobalGuest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      let activeGuest = guest;
      if (!activeGuest && formData.email) {
        try {
          const searchResponse = await searchGuest(uid, {
            email: formData.email,
          });
          if (searchResponse.success && searchResponse.data) {
            activeGuest = searchResponse.data;
            setLocalGuest(activeGuest);
            setGlobalGuest(activeGuest);
          }
        } catch {
          /* proceed */
        }
      }

      const payload = {
        name: formData.name,
        email: formData.email || "",
        attending: formData.attending,
        dietary_requirements: formData.dietary_requirements || "",
        has_plus_one: formData.has_plus_one,
        plus_one_name: formData.has_plus_one ? formData.plus_one_name : "",
        children_count: parseInt(formData.children_count) || 0,
      };

      if (activeGuest) {
        const response = await updateGuest(uid, activeGuest.id, payload);
        if (response.success) {
          const updated = response.data;
          setLocalGuest(updated);
          setGlobalGuest(updated);
          setMsg({ type: "success", text: t("rsvp.form.success_update") });
          setIsEditMode(false);
        }
      } else {
        const response = await createGuest(uid, payload);
        if (response.success) {
          const created = response.data;
          setLocalGuest(created);
          setGlobalGuest(created);
          setMsg({ type: "success", text: t("rsvp.form.success_create") });
          setIsEditMode(false);
        }
      }
    } catch {
      setMsg({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
      setTimeout(
        () =>
          setMsg((prev) =>
            prev.type === "success" ? { type: "", text: "" } : prev,
          ),
        5000,
      );
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-theme-support-1/10 pt-8">
                    <div className="flex items-center gap-4 text-theme-accent/70">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/50 flex items-center justify-center flex-shrink-0">
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
                    <div className="flex items-center gap-4 text-theme-accent/70">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/50 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          {t("rsvp.form.label_dietary")}
                        </p>
                        <p className="font-medium truncate max-w-[180px]">
                          {guest.dietary_requirements || "None"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-theme-accent/70">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/50 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          {t("rsvp.form.label_plus_one")}
                        </p>
                        <p className="font-medium">
                          {guest.has_plus_one ? guest.plus_one_name : "No"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-theme-accent/70">
                      <div className="w-10 h-10 rounded-xl bg-theme-support-3/50 flex items-center justify-center flex-shrink-0">
                        <Baby className="w-5 h-5 text-theme-main-2" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          {t("rsvp.form.label_children")}
                        </p>
                        <p className="font-medium">
                          {guest.children_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {msg.text && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl flex items-center gap-3 ${msg.type === "success" ? "bg-theme-support-1/10 text-theme-accent" : "bg-theme-main-3/10 text-theme-main-3"}`}
                    >
                      {msg.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <p className="text-sm font-medium">{msg.text}</p>
                    </motion.div>
                  )}
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
                        className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-accent"
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
                        className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-accent"
                        placeholder={t("rsvp.form.placeholder_email")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
                      <Utensils className="w-4 h-4" />
                      {t("rsvp.form.label_dietary")}
                    </label>
                    <textarea
                      value={formData.dietary_requirements}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dietary_requirements: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-accent resize-none h-20"
                      placeholder={t("rsvp.form.placeholder_dietary")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
                        <Users className="w-4 h-4" />
                        {t("rsvp.form.label_plus_one")}
                      </label>
                      <div className="flex gap-4 p-1 bg-theme-support-3/30 rounded-xl">
                        {[true, false].map((val) => (
                          <button
                            key={val.toString()}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, has_plus_one: val })
                            }
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.has_plus_one === val ? "bg-theme-main-2 text-white shadow-sm" : "text-theme-accent/40"}`}
                          >
                            {val ? "YES" : "NO"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
                        <Baby className="w-4 h-4" />
                        {t("rsvp.form.label_children")}
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
                        className="w-full px-4 py-2 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-accent"
                      />
                    </div>
                  </div>

                  {formData.has_plus_one && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-theme-accent/70 text-sm font-medium">
                        <User className="w-4 h-4 opacity-50" />
                        {t("rsvp.form.label_plus_one_name")}
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
                        className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 transition-all outline-none text-theme-accent"
                        placeholder={t("rsvp.form.placeholder_plus_one_name")}
                      />
                    </motion.div>
                  )}

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
                          className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${formData.attending === status ? "bg-theme-main-2 border-theme-main-2 text-white shadow-md" : "bg-white border-theme-support-1/20 text-theme-accent/60 hover:border-theme-main-2/30"}`}
                        >
                          {t(`wishes.attendance.${status.toLowerCase()}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Feedback Message */}
                  {msg.text && msg.type === "error" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-theme-main-3/10 text-theme-main-3 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-medium">{msg.text}</p>
                    </motion.div>
                  )}

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
