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
  const [selectedWish, setSelectedWish] = useState(null);

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
    { value: "ATTENDING", label: "Yes, I will attend" },
    { value: "NOT_ATTENDING", label: "No, I cannot attend" },
    { value: "MAYBE", label: "Maybe, I will confirm later" },
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
        setErrorMessage("Failed to send message. Please try again.");
        // Auto-hide error after 5 seconds
        setTimeout(() => setErrorMessage(""), 5000);
      }
    },
  });

  const handleSubmitWish = async (e) => {
    e.preventDefault();
    if (!newWish.trim() || !guestName.trim()) return;

    if (!uid) {
      setErrorMessage("Invitation not found. Please check your URL.");
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
        return <XCircle className="w-4 h-4 text-theme-main-3" />;
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
        className="min-h-screen relative overflow-hidden bg-theme-support-3/10"
      >
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
              className="inline-block text-theme-main-2 font-medium"
            >
              Send Your Best Wishes and Prayers
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-serif text-theme-accent"
            >
              Messages & Wishes
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
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-theme-main-2 animate-spin" />
                <span className="ml-3 text-theme-accent/70">
                  Loading messages...
                </span>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-theme-main-3">{error}</p>
              </div>
            )}

            {!isLoading && !error && (!wishes || wishes.length === 0) && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-theme-support-1/50 mx-auto mb-4" />
                <p className="text-theme-accent/50">
                  No messages yet. Be the first to send one!
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
                      className="group relative w-[300px] h-[160px] flex-shrink-0 cursor-pointer"
                      onClick={() => setSelectedWish(wish)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-theme-main-1 to-theme-support-3 rounded-2xl transform transition-transform group-hover:scale-[1.02] duration-300 shadow-sm" />

                      {/* Card content */}
                      <div className="relative h-full backdrop-blur-sm bg-white/80 p-4 rounded-2xl border border-theme-support-1/20 shadow-md flex flex-col">
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
                              <h4 className="font-semibold text-theme-accent text-sm truncate max-w-[140px]">
                                {wish.name}
                              </h4>
                              {getAttendanceIcon(wish.attendance)}
                            </div>
                            <div className="flex items-center space-x-1 text-theme-accent/40 text-xs mt-0.5">
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
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-theme-support-1/20 text-theme-accent text-[10px] font-medium">
                              New
                            </span>
                          )}
                        </div>

                        {/* Message */}
                        <div className="flex-1 overflow-hidden">
                          <p className="text-theme-accent/70 text-sm leading-relaxed line-clamp-3">
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

          {/* Wish Detail Modal */}
          <AnimatePresence>
            {selectedWish && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedWish(null)}
                  className="fixed inset-0 bg-theme-accent/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                  {/* Modal Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                  >
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-gradient-to-br from-theme-main-1 to-theme-support-3/30 p-6 border-b border-theme-support-1/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className="w-16 h-16 rounded-full bg-theme-main-2 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                            {selectedWish.name[0].toUpperCase()}
                          </div>

                          {/* Name and Time */}
                          <div>
                            <h3 className="text-2xl font-serif text-theme-accent font-semibold">
                              {selectedWish.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-theme-accent/50 text-sm mt-1">
                              <Clock className="w-4 h-4" />
                              <time>
                                {formatEventDate(
                                  selectedWish.created_at,
                                  "long",
                                  true,
                                )}
                              </time>
                            </div>
                          </div>
                        </div>

                        {/* Close Button */}
                        <button
                          onClick={() => setSelectedWish(null)}
                          className="p-2 rounded-full hover:bg-theme-main-1 transition-colors"
                          aria-label="Close"
                        >
                          <XCircle className="w-6 h-6 text-theme-support-1 hover:text-theme-accent" />
                        </button>
                      </div>

                      {/* Attendance Badge */}
                      {selectedWish.attendance && (
                        <div className="mt-4 flex items-center space-x-2">
                          {getAttendanceIcon(selectedWish.attendance)}
                          <span className="text-sm font-medium text-theme-accent/70">
                            {selectedWish.attendance === "ATTENDING" &&
                              "Will attend"}
                            {selectedWish.attendance === "NOT_ATTENDING" &&
                              "Cannot attend"}
                            {selectedWish.attendance === "MAYBE" &&
                              "Might attend"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Modal Body - Full Message */}
                    <div className="p-6">
                      <div className="prose prose-gray max-w-none">
                        <p className="text-theme-accent text-base leading-relaxed whitespace-pre-wrap">
                          {selectedWish.message}
                        </p>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-theme-support-3/30 p-4 border-t border-theme-support-1/10 flex justify-end">
                      <button
                        onClick={() => setSelectedWish(null)}
                        className="px-6 py-2 bg-theme-main-2 hover:bg-theme-main-2/90 text-white rounded-lg font-medium transition-colors shadow-md"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Wishes Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto mt-12"
          >
            {hasSubmittedWish ? (
              <div className="backdrop-blur-sm bg-white/80 p-8 rounded-2xl border border-theme-support-1/30 shadow-lg text-center">
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-theme-support-1" />
                  <h3 className="text-2xl font-serif text-theme-accent">
                    Thank You!
                  </h3>
                  <p className="text-theme-accent/70">
                    Your message and wishes have been sent. We really appreciate
                    your words.
                  </p>
                  <p className="text-sm text-theme-accent/40 italic">
                    Each guest can only send one message.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitWish} className="relative">
                <div className="backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-theme-support-1/20 shadow-lg">
                  {/* Error Message */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 rounded-xl bg-theme-main-3/5 border border-theme-main-3/10 flex items-start space-x-3"
                      >
                        <AlertCircle className="w-5 h-5 text-theme-main-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-theme-main-3 font-medium">
                            {errorMessage}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setErrorMessage("")}
                          className="text-theme-support-1 hover:text-theme-main-3 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    {/* Name Input - Pre-filled from URL or editable */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-theme-accent/50 text-sm mb-1">
                        <User className="w-4 h-4" />
                        <label htmlFor="guest-name">Your Name</label>
                      </div>
                      <input
                        type="text"
                        id="guest-name"
                        name="guestName"
                        autoComplete="name"
                        placeholder="Enter your name..."
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          setIsNameFromInvitation(false);
                        }}
                        disabled={isNameFromInvitation}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 text-theme-accent placeholder-theme-accent/30 ${
                          isNameFromInvitation
                            ? "bg-theme-support-3/50 border-theme-support-1/20 cursor-not-allowed opacity-75"
                            : "bg-white/50 border-theme-support-1/20 focus:border-theme-main-2 focus:ring focus:ring-theme-main-2/20 focus:ring-opacity-50"
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
                      <div className="flex items-center space-x-2 text-theme-accent/50 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        <label htmlFor="attendance-select">
                          Will you attend?
                        </label>
                      </div>

                      {/* Hidden select for accessibility */}
                      <select
                        id="attendance-select"
                        name="attendance"
                        value={attendance}
                        onChange={(e) => setAttendance(e.target.value)}
                        className="sr-only"
                        aria-hidden="true"
                      >
                        <option value="">Select attendance...</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* Custom Select Button */}
                      <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Select attendance status"
                        aria-expanded={isOpen}
                        aria-controls="attendance-dropdown"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-theme-support-1/20 focus:border-theme-main-2 focus:ring focus:ring-theme-main-2/20 focus:ring-opacity-50 transition-all duration-200 text-left flex items-center justify-between shadow-sm"
                      >
                        <span
                          className={
                            attendance
                              ? "text-theme-accent"
                              : "text-theme-accent/30"
                          }
                        >
                          {attendance
                            ? options.find((opt) => opt.value === attendance)
                                ?.label
                            : "Select attendance..."}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-theme-support-1 transition-transform duration-200 ${
                            isOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Options */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            id="attendance-dropdown"
                            role="listbox"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-theme-support-1/20 overflow-hidden"
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
                                  backgroundColor: "var(--theme-main-1)",
                                }}
                                className={`w-full px-4 py-2.5 text-left transition-colors
                                        ${
                                          attendance === option.value
                                            ? "bg-theme-main-1 text-theme-accent font-medium"
                                            : "text-theme-accent/70 hover:text-theme-accent"
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
                      <div className="flex items-center space-x-2 text-theme-accent/50 text-sm mb-1">
                        <MessageCircle className="w-4 h-4" />
                        <label htmlFor="wish-message">Your wishes</label>
                      </div>
                      <textarea
                        id="wish-message"
                        name="message"
                        placeholder="Send your wishes and prayers for the couple..."
                        value={newWish}
                        onChange={(e) => setNewWish(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl bg-white/50 border border-theme-support-1/20 focus:border-theme-main-2 focus:ring focus:ring-theme-main-2/20 focus:ring-opacity-50 resize-none transition-all duration-200 placeholder-theme-accent/30 text-theme-accent shadow-sm"
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
                      className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg
                    ${
                      createWishMutation.isPending
                        ? "bg-theme-support-1 cursor-not-allowed"
                        : "bg-theme-main-2 hover:bg-theme-main-2/90"
                    }`}
                    >
                      {createWishMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>
                        {createWishMutation.isPending
                          ? "Sending..."
                          : "Send Wishes"}
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
