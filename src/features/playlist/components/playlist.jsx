import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export default function Playlist() {
  const { t } = useLanguage();

  return (
    <section id="playlist" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <motion.span className="inline-block text-theme-main-2 font-medium uppercase tracking-widest text-sm">
            {t("playlist.title")}
          </motion.span>
          <motion.h2 className="text-4xl md:text-5xl font-serif text-theme-accent">
            {t("playlist.subtitle")}
          </motion.h2>
          <p className="text-theme-accent/60 max-w-md mx-auto">
            {t("playlist.description")}
          </p>
        </motion.div>

        {/* Playlist Embed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-theme-support-1/10"
        >
          <iframe
            data-testid="embed-iframe"
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/3sofSMGZvlPaynJ03FdGX3?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
