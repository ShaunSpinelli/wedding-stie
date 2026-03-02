import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import Marquee from "@/components/ui/marquee";
import {
  Calendar,
  Clock,
  ChevronDown,
  User,
  MessageCircle,
  Send,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatEventDate } from "@/lib/format-event-date";
import { useInvitation } from "@/features/invitation";
import { fetchWishes, createWish, checkWishSubmitted } from "@/services/api";
import { getGuestName } from "@/lib/invitation-storage";
import { useLanguage } from "@/lib/language-context";

// Mock wishes for FE-only test
const MOCK_WISHES = [
  { id: 1, name: "Shaun", message: "Can't wait for the big day! It's going to be amazing.", attendance: "ATTENDING", created_at: new Date().toISOString() },
  { id: 2, name: "Manon", message: "So happy for us! ❤️", attendance: "ATTENDING", created_at: new Date().toISOString() },
  { id: 3, name: "Family Friend", message: "Congratulations to the beautiful couple!", attendance: "ATTENDING", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, name: "Best Man", message: "Preparing the speech already. You guys are the best.", attendance: "ATTENDING", created_at: new Date(Date.now() - 3600000).toISOString() }
];

export default function Wishes({ useAltBg = false }) {
  const { uid } = useInvitation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [newWish, setNewWish] = useState("");
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isNameFromInvitation, setIsNameFromInvitation] = useState(false);
  const [hasSubmittedWish, setHasSubmittedWish] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedWish, setSelectedWish] = useState(null);

  // Get guest name from localStorage
  useEffect(() => {
    const storedGuestName = getGuestName();
    if (storedGuestName) {
      setGuestName(storedGuestName);
      setIsNameFromInvitation(true);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const options = [
    { value: "ATTENDING", label: t("wishes.attendance.attending") },
    { value: "NOT_ATTENDING", label: t("wishes.attendance.not_attending") },
    { value: "MAYBE", label: t("wishes.attendance.maybe") },
  ];

  // Fetch wishes (DISABLED for FE-only deployment - Using MOCK_WISHES)
  const {
    data: wishes = MOCK_WISHES,
    isLoading = false,
    error = null,
  } = { data: MOCK_WISHES, isLoading: false, error: null };

  const createWishMutation = { 
    isPending: false, 
    mutate: (data) => {
      setHasSubmittedWish(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleSubmitWish = async (e) => {
    e.preventDefault();
    if (!newWish.trim() || !guestName.trim()) return;

    createWishMutation.mutate({
      name: guestName.trim(),
      message: newWish.trim(),
      attendance: attendance || "MAYBE",
    });
  };

  const getAttendanceIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "attending":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "not_attending":
      case "not-attending":
        return <XCircle className="w-4 h-4 text-theme-romantic" />;
      case "maybe":
        return <HelpCircle className="w-4 h-4 text-theme-main-2" />;
      default:
        return null;
    }
  };

  return (
    <>
      <section
        id="wishes"
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: useAltBg ? "#F4F1EC" : "#FFFFFF" }}
      >
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block text-theme-main-2 font-medium"
            >
              {t("wishes.title")}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-serif text-theme-main-2"
            >
              {t("wishes.subtitle")}
            </motion.h2>

            {/* Decorative Divider */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 pt-4"
            >
              <div className="h-[1px] w-12 bg-theme-support-1/30" />
              <MessageCircle className="w-5 h-5 text-theme-support-1" />
              <div className="h-[1px] w-12 bg-theme-support-1/30" />
            </motion.div>
          </motion.div>

          {/* Wishes List */}
          <div className="max-w-4xl mx-auto space-y-6">
            {!isLoading && wishes && wishes.length > 0 && (
              <AnimatePresence>
                <Marquee
                  pauseOnHover={true}
                  repeat={2}
                  className="[--duration:60s] [--gap:1rem] py-2"
                >
                  {wishes.map((wish, index) => (
                    <motion.div
                      key={wish.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative w-[300px] h-[160px] flex-shrink-0 cursor-pointer"
                      onClick={() => setSelectedWish(wish)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Background - using theme-main-1 for card background */}
                      <div className="absolute inset-0 bg-theme-main-1 rounded-2xl transform transition-transform group-hover:scale-[1.02] duration-300 shadow-sm" />

                      {/* Card content */}
                      <div className="relative h-full backdrop-blur-sm bg-white/10 p-4 rounded-2xl border border-theme-support-1/20 shadow-md flex flex-col">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-theme-main-2 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {wish.name[0].toUpperCase()}
                            </div>
                          </div>

                          {/* Name, Time, and Attendance */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-theme-main-2 text-sm truncate max-w-[140px]">
                                {wish.name}
                              </h4>
                              {getAttendanceIcon(wish.attendance)}
                            </div>
                            <div className="flex items-center space-x-1 text-theme-main-3/40 text-xs mt-0.5">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <time className="truncate">
                                {formatEventDate(
                                  wish.created_at,
                                  "short",
                                  true,
                                )}
                              </time>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="flex-1 overflow-hidden">
                          <p className="text-theme-main-3 text-sm leading-relaxed line-clamp-3">
                            {wish.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Marquee>
              </AnimatePresence>
            )}
          </div>

          {/* Wishes Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-12"
          >
            {hasSubmittedWish ? (
              <div className="backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-theme-support-1/30 shadow-lg text-center">
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-theme-support-1" />
                  <h3 className="text-2xl font-serif text-theme-main-2">
                    {t("wishes.success.title")}
                  </h3>
                  <p className="text-theme-main-3">
                    {t("wishes.success.message")}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitWish} className="relative">
                <div className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl border border-theme-support-1/20 shadow-lg">
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-theme-main-3/50 text-sm mb-1">
                        <User className="w-4 h-4" />
                        <label htmlFor="guest-name">
                          {t("wishes.form.label_name")}
                        </label>
                      </div>
                      <input
                        type="text"
                        id="guest-name"
                        name="guestName"
                        autoComplete="name"
                        placeholder={t("wishes.form.placeholder_name")}
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          setIsNameFromInvitation(false);
                        }}
                        disabled={isNameFromInvitation}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 text-theme-main-3 placeholder-theme-main-3/30 ${
                          isNameFromInvitation
                            ? "bg-theme-support-3/50 border-theme-support-1/20 cursor-not-allowed opacity-75"
                            : "bg-white/10 border-theme-support-1/20 focus:border-theme-main-2"
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-theme-main-3/50 text-sm mb-1">
                        <MessageCircle className="w-4 h-4" />
                        <label htmlFor="wish-message">
                          {t("wishes.form.label_message")}
                        </label>
                      </div>
                      <textarea
                        id="wish-message"
                        name="message"
                        placeholder={t("wish.form.placeholder_message")}
                        value={newWish}
                        onChange={(e) => setNewWish(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl bg-white/10 border border-theme-support-1/20 focus:border-theme-main-2 resize-none transition-all duration-200 placeholder-theme-main-3/30 text-theme-main-3 shadow-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <motion.button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg bg-theme-main-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t("wishes.form.btn_send")}</span>
                    </motion.button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
