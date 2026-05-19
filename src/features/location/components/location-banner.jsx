import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { getAssetPath } from "@/utils/asset-path";

export default function LocationBanner() {
  const { t } = useLanguage();

  // --- CONFIGURATION: Adjust mobile image height here ---
  // Increase this value to make the image taller on mobile (e.g., "50vh", "400px")
  const mobileHeight = "35vh";
  // -----------------------------------------------------

  return (
    <section className="bg-white">
      {/* Full-width Image Section */}
      <div
        className="relative w-full overflow-hidden md:h-[80vh]"
        style={{ height: window.innerWidth < 768 ? mobileHeight : undefined }}
      >
        <img
          src={getAssetPath("/images/venue-drone.webp")}
          alt="Wedding Venue Drone View"
          className="w-full h-full object-cover"
        />
        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-20 bg-black/20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-white text-2xl md:text-5xl lg:text-6xl font-serif text-center px-8 max-w-4xl leading-tight"
          >
            {t("location.banner_text") ||
              "Celebrate with us in the beautiful south of France"}
          </motion.h2>
        </div>
      </div>

      {/* Address Text Section */}
      <div className="py-12 px-6 text-center bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-black uppercase tracking-[0.3em] text-xs font-semibold mb-4">
            {t("location.venue_address_label") || "Venue Address"}
          </p>
          <p className="text-black text-lg md:text-xl font-serif">
            {t("wedding.location")}
          </p>
          <p className="text-black/60 text-sm md:text-base font-serif italic">
            {t("wedding.address")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
