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
import { useInvitation } from "@/context/invitation-context";
import { fetchWishes, createWish, checkWishSubmitted } from "@/services/api";
import { getGuestName } from "@/lib/invitation-storage";

export default function Wishes() {
  const { uid } = useInvitation();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [newWish, setNewWish] = useState("");
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isNameFromInvitation, setIsNameFromInvitation] = useState(false);
  const [hasSubmittedWish, setHasSubmittedWish] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get guest name from localStorage
  useEffect(() => {
    const storedGuestName = getGuestName();
    if (storedGuestName) {
      setGuestName(storedGuestName);
      setIsNameFromInvitation(true);
    }
  }, []);

  // Check if guest has already submitted a wish
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (uid && guestName && isNameFromInvitation) {
        try {
          const response = await checkWishSubmitted(uid, guestName);
          if (response.success && response.hasSubmitted) {
            setHasSubmittedWish(true);
          }
        } catch (error) {
          console.error("Error checking wish status:", error);
          // Don't show error to user, just let them try to submit
        }
      }
    };

    checkSubmissionStatus();
  }, [uid, guestName, isNameFromInvitation]);

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
    { value: "ATTENDING", label: "Ya, saya akan hadir" },
    { value: "NOT_ATTENDING", label: "Tidak, saya tidak bisa hadir" },
    { value: "MAYBE", label: "Mungkin, saya akan konfirmasi nanti" },
  ];

  // Fetch wishes using React Query
  const {
    data: wishes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishes", uid],
    queryFn: async () => {
      const response = await fetchWishes(uid);
      if (response.success) {
        return response.data;
      }
      throw new Error("Failed to load wishes");
    },
    enabled: !!uid,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for creating wishes
  const createWishMutation = useMutation({
    mutationFn: (wishData) => createWish(uid, wishData),
    onSuccess: (response) => {
      if (response.success) {
        // Optimistically update the cache
        queryClient.setQueryData(["wishes", uid], (old = []) => [
          response.data,
          ...old,
        ]);
        // Reset form (keep guest name)
        setNewWish("");
        setAttendance("");
        setHasSubmittedWish(true);
        setErrorMessage("");
        // Show confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
    onError: (err) => {
      console.error("Error submitting wish:", err);

      // Check if it's a duplicate wish error
      if (
        err.code === "DUPLICATE_WISH" ||
        err.message.includes("already submitted")
      ) {
        setHasSubmittedWish(true);
        setErrorMessage("");
      } else {
        setErrorMessage("Gagal mengirim pesan. Silakan coba lagi.");
        // Auto-hide error after 5 seconds
        setTimeout(() => setErrorMessage(""), 5000);
      }
    },
  });

  const handleSubmitWish = async (e) => {
    e.preventDefault();
    if (!newWish.trim() || !guestName.trim()) return;

    if (!uid) {
      setErrorMessage("Undangan tidak ditemukan. Silakan periksa URL Anda.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    // Clear any previous errors
    setErrorMessage("");

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
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case "maybe":
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };
  return (
    <>
      <section id="wishes" className="min-h-screen relative overflow-hidden">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block text-rose-500 font-medium"
            >
              Kirimkan Doa dan Harapan Terbaik Anda
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-serif text-gray-800"
            >
              Pesan dan Doa
            </motion.h2>

            {/* Decorative Divider */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 pt-4"
            >
              <div className="h-[1px] w-12 bg-rose-200" />
              <MessageCircle className="w-5 h-5 text-rose-400" />
              <div className="h-[1px] w-12 bg-rose-200" />
            </motion.div>
          </motion.div>

          {/* Wishes List */}
          <div className="max-w-2xl mx-auto space-y-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <span className="ml-3 text-gray-600">Memuat pesan...</span>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-rose-600">{error}</p>
              </div>
            )}

            {!isLoading && !error && (!wishes || wishes.length === 0) && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Belum ada pesan. Jadilah yang pertama!
                </p>
              </div>
            )}

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
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative w-[300px] h-[160px] flex-shrink-0"
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/60 to-pink-100/60 rounded-2xl transform transition-transform group-hover:scale-[1.02] duration-300" />

                      {/* Card content */}
                      <div className="relative h-full backdrop-blur-sm bg-white/90 p-4 rounded-2xl border border-rose-100/50 shadow-md flex flex-col">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {wish.name[0].toUpperCase()}
                            </div>
                          </div>

                          {/* Name, Time, and Attendance */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-800 text-sm truncate max-w-[140px]">
                                {wish.name}
                              </h4>
                              {getAttendanceIcon(wish.attendance)}
                            </div>
                            <div className="flex items-center space-x-1 text-gray-400 text-xs mt-0.5">
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

                          {/* New badge */}
                          {Date.now() - new Date(wish.created_at).getTime() <
                            3600000 && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>

                        {/* Message */}
                        <div className="flex-1 overflow-hidden">
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mt-12"
          >
            {hasSubmittedWish ? (
              <div className="backdrop-blur-sm bg-white/80 p-8 rounded-2xl border border-emerald-100 shadow-lg text-center">
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-emerald-500" />
                  <h3 className="text-2xl font-serif text-gray-800">
                    Terima Kasih!
                  </h3>
                  <p className="text-gray-600">
                    Pesan dan doa Anda telah terkirim. Kami sangat menghargai
                    ucapan Anda.
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    Setiap tamu hanya dapat mengirim satu pesan.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitWish} className="relative">
                <div className="backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-rose-100/50 shadow-lg">
                  {/* Error Message */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3"
                      >
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-rose-800 font-medium">
                            {errorMessage}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setErrorMessage("")}
                          className="text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    {/* Name Input - Pre-filled from URL or editable */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                        <User className="w-4 h-4" />
                        <span>Nama Kamu</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Masukan nama kamu..."
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          setIsNameFromInvitation(false);
                        }}
                        disabled={isNameFromInvitation}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                          isNameFromInvitation
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-75"
                            : "bg-white/50 border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                        }`}
                        required
                      />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2 relative"
                      ref={dropdownRef}
                    >
                      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Apakah kamu hadir?</span>
                      </div>

                      {/* Custom Select Button */}
                      <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 transition-all duration-200 text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            attendance ? "text-gray-700" : "text-gray-400"
                          }
                        >
                          {attendance
                            ? options.find((opt) => opt.value === attendance)
                                ?.label
                            : "Pilih kehadiran..."}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Options */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden"
                          >
                            {options.map((option) => (
                              <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setAttendance(option.value);
                                  setIsOpen(false);
                                }}
                                whileHover={{
                                  backgroundColor: "rgb(255, 241, 242)",
                                }}
                                className={`w-full px-4 py-2.5 text-left transition-colors
                                        ${
                                          attendance === option.value
                                            ? "bg-rose-50 text-rose-600"
                                            : "text-gray-700 hover:bg-rose-50"
                                        }`}
                              >
                                {option.label}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    {/* Wish Textarea */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>Harapan kamu</span>
                      </div>
                      <textarea
                        placeholder="Kirimkan harapan dan doa untuk kedua mempelai..."
                        value={newWish}
                        onChange={(e) => setNewWish(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl bg-white/50 border border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 resize-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <motion.button
                      type="submit"
                      disabled={createWishMutation.isPending}
                      whileHover={{
                        scale: createWishMutation.isPending ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: createWishMutation.isPending ? 1 : 0.98,
                      }}
                      className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200
                    ${
                      createWishMutation.isPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-rose-500 hover:bg-rose-600"
                    }`}
                    >
                      {createWishMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>
                        {createWishMutation.isPending
                          ? "Sedang Mengirim..."
                          : "Kirimkan Doa"}
                      </span>
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
