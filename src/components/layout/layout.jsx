import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, PauseCircle, PlayCircle } from "lucide-react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import BottomBar from "@/components/layout/bottom-bar";

/**
 * Layout component that wraps the main invitation content.
 * Handles music playback controls and navigation.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Object} props.audioControls - Audio controls from useAudio hook
 * @param {boolean} props.audioControls.isPlaying - Whether audio is playing
 * @param {Function} props.audioControls.toggle - Toggle audio play/pause
 */
const Layout = ({ children, audioControls }) => {
  const config = useConfig();
  const [showToast, setShowToast] = useState(false);

  const { isPlaying, toggle } = audioControls || {};

  // Show toast when audio starts playing
  useEffect(() => {
    if (isPlaying) {
      setShowToast(true);
      const timer = setTimeout(
        () => setShowToast(false),
        config.audio?.toastDuration || 3000,
      );
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [isPlaying, config.audio?.toastDuration]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-rose-50/30 to-pink-50/30">
      <motion.div
        className="mx-auto w-full lg:max-w-5xl xl:max-w-6xl min-h-screen bg-white relative overflow-hidden shadow-rose-100/50 shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Music Control Button with Status Indicator */}
        {toggle && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-rose-100/50"
          >
            {isPlaying ? (
              <div className="relative">
                <PauseCircle className="w-6 h-6 text-rose-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <PlayCircle className="w-6 h-6 text-rose-500" />
            )}
          </motion.button>
        )}

        <main className="relative h-full w-full pb-[100px]">{children}</main>
        <BottomBar />

        {/* Music Info Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-black/80 text-white transform -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-sm flex items-center space-x-2">
                <Music className="w-4 h-4 animate-pulse" />
                <span className="text-sm whitespace-nowrap">
                  {config.audio?.title || "Background Music"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Layout;
