import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Info } from "lucide-react";

// Placeholder image generator for the 4x4 grid
const generateImages = () => {
  const items = [];
  // 5 Good ones, 11 Bad ones = 16 total (4x4)
  for (let i = 1; i <= 5; i++)
    items.push({
      id: `good-${i}`,
      type: "good",
      src: `/images/captcha/good-${i}.jpg`,
    });
  for (let i = 1; i <= 11; i++)
    items.push({
      id: `bad-${i}`,
      type: "bad",
      src: `/images/captcha/bad-${i}.jpg`,
    });

  // Shuffle them
  return items.sort(() => Math.random() - 0.5);
};

export default function FunnyCaptcha({ isOpen, onClose }) {
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [status, setStatus] = useState("idle"); // idle, success, error

  useEffect(() => {
    if (isOpen) {
      setImages(generateImages());
      setSelectedIds(new Set());
      setStatus("idle");
    }
  }, [isOpen]);

  const toggleImage = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleVerify = () => {
    const correctCount = images.filter(
      (img) => img.type === "good" && selectedIds.has(img.id),
    ).length;
    const incorrectCount = images.filter(
      (img) => img.type === "bad" && selectedIds.has(img.id),
    ).length;
    const totalGood = images.filter((img) => img.type === "good").length;

    if (correctCount === totalGood && incorrectCount === 0) {
      setStatus("success");
      setTimeout(onClose, 1500);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1000);
    }
  };

  const handleReset = () => {
    setImages(generateImages());
    setSelectedIds(new Set());
    setStatus("idle");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#4A90E2] p-6 text-white space-y-1">
              <p className="text-xs uppercase font-medium opacity-90">
                Select all squares with
              </p>
              <h2 className="text-2xl font-bold leading-tight">
                the &quot;Funny&quot; Person
              </h2>
              <p className="text-xs opacity-80 italic">
                If there are none, click skip.
              </p>
            </div>

            {/* Grid */}
            <div className="p-2 grid grid-cols-4 gap-1 bg-[#f9f9f9]">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => toggleImage(img.id)}
                  className="relative aspect-square bg-gray-200 cursor-pointer group overflow-hidden"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 transition-all ${selectedIds.has(img.id) ? "scale-90 opacity-50" : "group-hover:opacity-80"}`}
                  >
                    {img.id}
                  </div>

                  <AnimatePresence>
                    {selectedIds.has(img.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-6 h-6 bg-[#4A90E2] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Check className="w-4 h-4 text-white stroke-[4px]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 flex items-center justify-between border-t border-gray-200 bg-white">
              <div className="flex gap-4 text-gray-400">
                <button
                  onClick={handleReset}
                  className="hover:text-gray-600 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button className="opacity-50 cursor-default">
                  <Info className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-3 items-center">
                {status === "error" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs font-bold uppercase"
                  >
                    Try again
                  </motion.span>
                )}
                {status === "success" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-500 text-xs font-bold uppercase"
                  >
                    Verified
                  </motion.span>
                )}
                <button
                  onClick={handleVerify}
                  disabled={status === "success"}
                  className={`px-6 py-2.5 rounded-sm font-bold text-sm transition-all uppercase tracking-wide ${
                    status === "success"
                      ? "bg-green-500 text-white"
                      : "bg-[#4A90E2] text-white hover:bg-[#357ABD] active:scale-95 shadow-sm"
                  }`}
                >
                  {selectedIds.size > 0 ? "Verify" : "Skip"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
