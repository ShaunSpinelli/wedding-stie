import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Funny() {
  const eyebrowPath1 = "M60 80 Q80 60 100 80 T140 80";
  const eyebrowPath2 = "M60 70 Q80 90 100 70 T140 70";

  return (
    <section className="py-20 bg-theme-support-3/5 overflow-hidden">
      <div className="container mx-auto px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative inline-block"
        >
          {/* Funny SVG Proof of Concept */}
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="text-theme-main-2 mx-auto drop-shadow-xl"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="currentColor"
              fillOpacity="0.1"
            />
            {/* Animated Eyebrows */}
            <motion.path
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ d: eyebrowPath1 }}
              animate={{
                d: [eyebrowPath1, eyebrowPath2, eyebrowPath1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />

            {/* Eyes */}
            <circle cx="70" cy="110" r="10" fill="currentColor" />
            <circle cx="130" cy="110" r="10" fill="currentColor" />

            {/* Animated Mouth */}
            <motion.path
              d="M60 140 Q100 170 140 140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              animate={{
                strokeWidth: [8, 12, 8],
                scaleY: [1, 1.1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          </svg>

          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-4 -right-4 bg-theme-accent text-white p-2 rounded-full shadow-lg"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-3xl font-serif text-theme-accent font-bold italic">
            Exclusive Content!
          </h2>
          <p className="text-theme-accent/60 max-w-md mx-auto font-medium">
            You are seeing this because you&apos;ve been tagged as{" "}
            <span className="text-theme-main-2 font-bold uppercase tracking-widest">
              funny
            </span>{" "}
            by the couple. Keep making them laugh!
          </p>
        </div>
      </div>
    </section>
  );
}
