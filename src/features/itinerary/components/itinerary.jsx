import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { getAssetPath } from "@/utils/asset-path";
import ItineraryCard from "./itinerary-card";

export default function Itinerary() {
  const { t } = useLanguage();
  const [flippedCards, setFlippedCards] = useState({});

  const cardImage = getAssetPath("/images/itinerary-card-city-hall.jpeg");
  const cards = [1, 2, 3];

  const handleFlip = (num) => {
    setFlippedCards((prev) => ({ ...prev, [num]: true }));
  };

  return (
    <section
      id="itinerary"
      className="py-16 md:py-24 px-4 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center space-y-8">
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

        {/* 3 Flippable Playing Cards (3 Aligned on Mobile and Desktop) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 pt-4 px-1 sm:px-4 max-w-5xl mx-auto">
          {cards.map((num, index) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              <ItineraryCard
                index={num}
                frontImage={cardImage}
                isFlipped={Boolean(flippedCards[num])}
                onFlip={() => handleFlip(num)}
                alt={`Itinerary Event ${num}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
