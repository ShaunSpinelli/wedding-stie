import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { getAssetPath } from "@/utils/asset-path";

import { MapPin } from "lucide-react";

export default function LocationBanner() {
  const { t } = useLanguage();

  const googleMapsUrl = "https://maps.app.goo.gl/UPDuxwLdwjGVyE2Q9";

  // --- CONFIGURATION: Adjust mobile image height here ---
  // Increase this value to make the image taller on mobile (e.g., "50vh", "400px")
  const mobileHeight = "45vh";
  // -----------------------------------------------------

  return (
    <section id="location" className="bg-white pt-10 md:pt-20">
      {/* Full-width Image Section */}
      <div
        className="relative w-full md:h-[95vh]"
        style={{ height: window.innerWidth < 768 ? mobileHeight : undefined }}
      >
        <div className="w-full h-full overflow-hidden">
          <img
            src={getAssetPath("/images/location-venue.png")}
            alt="Wedding Venue"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Overlay - Elevated and Slanted */}
        <div className="absolute -top-12 md:-top-16 inset-x-0 flex justify-center z-20 pointer-events-none">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-[#bc2c1a] text-3xl md:text-5xl lg:text-6xl font-handwritten text-center px-8 max-w-4xl leading-tight drop-shadow-sm"
          >
            {t("location.banner_text") ||
              "Celebrate with us in the beautiful south of France"}
          </motion.h2>
        </div>
      </div>
      {/* Address Text Section */}
      <div className="py-6 md:py-12 px-6 text-center bg-white">
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

          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="inline-flex items-center gap-2 text-[#bc2c1a] hover:text-[#bc2c1a]/80 transition-colors mt-6 group"
          >
            <MapPin className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-sm uppercase tracking-[0.2em] font-medium border-b border-[#bc2c1a]/20 group-hover:border-[#bc2c1a]/50 pb-0.5">
              {t("location.view_map")}
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
