import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";

export default function EntryEmailModal() {
  const { t } = useLanguage();
  const { showEmailModal, lookupGuest } = useInvitation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");

    const success = await lookupGuest(email.trim());

    if (!success) {
      setError(t("entry_modal.error_not_found"));
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {showEmailModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] p-8 md:p-12 max-w-lg w-full relative overflow-hidden shadow-2xl"
          >
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-theme-main-2/5 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/5 mb-2">
                  <Mail className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-4xl font-serif text-black italic">
                  {t("entry_modal.title")}
                </h2>
                <p className="text-black/60 text-base leading-relaxed max-w-sm mx-auto">
                  {t("entry_modal.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-black uppercase tracking-[0.2em] text-[10px] font-bold opacity-40 ml-1">
                    {t("entry_modal.label")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-5 rounded-2xl border border-black/5 bg-gray-50/50 focus:bg-white focus:border-black transition-all outline-none text-black text-lg font-serif"
                      placeholder={t("entry_modal.placeholder")}
                      required
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[#bc2c1a] text-xs italic ml-1"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-2xl bg-black text-white uppercase tracking-[0.4em] text-xs font-bold hover:bg-[#bc2c1a] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("entry_modal.loading")}
                    </>
                  ) : (
                    <>
                      {t("entry_modal.btn_continue")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
