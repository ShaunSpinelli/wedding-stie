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

        {/* Alternating Zigzag Layout: Strictly 1 Card Per Row (Left, Right, Left) */}
        <div className="flex flex-col space-y-10 sm:space-y-16 md:space-y-20 max-w-4xl mx-auto pt-6 px-2 sm:px-6">
          {itineraryEvents.map((event, index) => {
            const isRight = index % 2 === 1; // 0: Left (Friday), 1: Right (Saturday), 2: Left (Sunday)
            return (
              <div
                key={event.id}
                className={`w-full flex ${isRight ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="w-[50%] max-w-[280px] sm:max-w-xs md:max-w-sm"
                >
                  <ItineraryCard
                    index={event.id}
                    frontImage={event.image}
                    isFlipped={Boolean(flippedCards[event.id])}
                    onFlip={() => handleFlip(event.id)}
                    alt={event.title}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
