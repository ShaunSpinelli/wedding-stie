import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { getAssetPath } from "@/utils/asset-path";
import ItineraryCard from "./itinerary-card";

export default function Itinerary() {
  const { t } = useLanguage();
  const [flippedCards, setFlippedCards] = useState({});

  const itineraryEvents = [
    {
      id: 1,
      title: "Friday Braai",
      image: getAssetPath("/images/friday-braai.png"),
    },
    {
      id: 2,
      title: "Saturday Wedding",
      image: getAssetPath("/images/saturday-wedding.png"),
    },
    {
      id: 3,
      title: "Sunday Pizza",
      image: getAssetPath("/images/sunday-pizza.png"),
    },
  ];

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section
      id="itinerary"
      className="py-16 md:py-24 px-4 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <div className="space-y-2">
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

        {/* 3 Flippable Playing Cards (Friday, Saturday, Sunday) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 pt-4 px-1 sm:px-4 max-w-5xl mx-auto">
          {itineraryEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              <ItineraryCard
                index={event.id}
                frontImage={event.image}
                isFlipped={Boolean(flippedCards[event.id])}
                onFlip={() => handleFlip(event.id)}
                alt={event.title}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
