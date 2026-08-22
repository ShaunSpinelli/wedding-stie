import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { getAssetPath } from "@/utils/asset-path";

export default function Itinerary() {
  const { t } = useLanguage();

  const cardImage = getAssetPath("/images/itinerary-card-city-hall.jpeg");
  const cards = [1, 2, 3];

  return (
    <section
      id="itinerary"
      className="py-16 md:py-24 px-4 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center space-y-6">
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.6, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-black uppercase tracking-[0.3em] text-xs font-semibold"
          >
            {t("itinerary.subtitle") || "Weekend Schedule"}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-handwritten text-5xl md:text-7xl lg:text-8xl text-[#bc2c1a] leading-tight"
          >
            {t("itinerary.title") || "Itinerary"}
          </motion.h2>
        </div>

        {/* 3 Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-6">
          {cards.map((num, index) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-black/5 bg-gray-50"
            >
              <img
                src={cardImage}
                alt={`Itinerary Event ${num}`}
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
