import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { setAdminSecret, verifyAdmin } from "@/services/api";

export default function AdminLogin({ onLoginSuccess }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secret) return;

    setLoading(true);
    setError("");

    try {
      setAdminSecret(secret);
      const response = await verifyAdmin();
      if (response.success) {
        onLoginSuccess();
      }
    } catch {
      setError("Invalid admin secret key");
      setAdminSecret(""); // Clear failed secret
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-support-3/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-theme-support-1/20 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-theme-main-1 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-theme-main-2" />
            </div>
            <h1 className="text-2xl font-serif text-theme-accent font-bold">
              Admin Access
            </h1>
            <p className="text-theme-accent/60 text-sm">
              Please enter your secret key to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-theme-support-1/20 focus:border-theme-main-2 focus:ring-2 focus:ring-theme-main-2/10 transition-all outline-none text-center text-lg tracking-widest"
                placeholder="••••••••"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 text-theme-main-3 text-sm justify-center bg-theme-main-3/5 p-3 rounded-xl border border-theme-main-3/10"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-accent text-white py-4 rounded-xl font-bold shadow-lg hover:bg-theme-accent/90 disabled:bg-theme-support-1/50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-theme-accent/50 text-sm hover:text-theme-accent transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Invitation
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
