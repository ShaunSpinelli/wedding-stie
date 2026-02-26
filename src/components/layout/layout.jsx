import { motion /*, AnimatePresence */ } from "framer-motion";
// import { Music, PauseCircle, PlayCircle } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useConfig } from "@/features/invitation/hooks/use-config";
import BottomBar from "@/components/layout/bottom-bar";

/**
 * Layout component that wraps the main invitation content.
 * Handles navigation and basic layout structure.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
const Layout = ({ children /*, audioControls */ }) => {
  /*
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
  */

  return (
    <div className="relative min-h-screen w-full bg-theme-support-3/30">
      <motion.div
        className="mx-auto w-full lg:max-w-5xl xl:max-w-6xl min-h-screen bg-white relative overflow-hidden shadow-theme-support-1/20 shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 
        Music Control Button with Status Indicator
        {toggle && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-theme-support-1/30"
          >
            {isPlaying ? (
              <div className="relative">
                <PauseCircle className="w-6 h-6 text-theme-main-2" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-theme-support-1 rounded-full animate-pulse" />
              </div>
            ) : (
              <PlayCircle className="w-6 h-6 text-theme-main-2" />
            )}
          </motion.button>
        )}
        */}

        <main className="relative h-full w-full pb-[100px]">{children}</main>
        <BottomBar />

        {/* 
        Music Info Toast
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-theme-main-2 text-white transform -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-sm flex items-center space-x-2 shadow-lg">
                <Music className="w-4 h-4 animate-pulse" />
                <span className="text-sm whitespace-nowrap">
                  {config.audio?.title || "Background Music"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        */}
      </motion.div>
    </div>
  );
};

export default Layout;
