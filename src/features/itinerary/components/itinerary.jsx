import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation";
import { getAssetPath } from "@/utils/asset-path";
import ItineraryCard from "./itinerary-card";

const EVENT_IMAGES = {
  welcome_braai: getAssetPath("/images/friday-braai.png"),
  big_day: getAssetPath("/images/saturday-wedding.png"),
  white_pizza_party: getAssetPath("/images/sunday-pizza.png"),
};

export default function Itinerary() {
  const { t, language } = useLanguage();
  const { hasFeature } = useInvitation();
  const [flippedCards, setFlippedCards] = useState({});
  const itemRefs = useRef({});

  const eventsData = useMemo(() => {
    const rawEvents = t("itinerary.events");
    if (!Array.isArray(rawEvents)) return [];
    return rawEvents.map((event) => ({
      ...event,
      image:
        event.image ||
        EVENT_IMAGES[event.id] ||
        getAssetPath(`/images/${event.id}.png`),
    }));
  }, [t, language]);

  const visibleEvents = useMemo(() => {
    return eventsData.filter(
      (event) => !event.feature || hasFeature(event.feature),
    );
  }, [eventsData, hasFeature]);

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: true }));

    // Smoothly scroll the card row into frame
    setTimeout(() => {
      const element = itemRefs.current[id];
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 150);
  };

  if (visibleEvents.length === 0) return null;

  return (
    <section
      id="itinerary"
      className="scroll-mt-12 md:scroll-mt-20 pt-0 pb-16 md:pb-24 px-4 bg-white overflow-hidden"
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

        {/* Alternating Zigzag Layout with Text & Cards */}
        <div className="flex flex-col space-y-12 sm:space-y-16 md:space-y-24 max-w-4xl mx-auto pt-6 px-2 sm:px-6">
          {visibleEvents.map((event, index) => {
            const isRight = index % 2 === 1; // 0: Left Card / Right Text, 1: Left Text / Right Card, 2: Left Card / Right Text

            const cardElement = (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[280px] sm:max-w-xs md:max-w-sm mx-auto"
              >
                <ItineraryCard
                  frontImage={event.image}
                  isFlipped={Boolean(flippedCards[event.id])}
                  onFlip={() => handleFlip(event.id)}
                  alt={event.title}
                />
              </motion.div>
            );

            const isCardFlipped = Boolean(flippedCards[event.id]);

            const textElement = (
              <motion.div
                initial={false}
                animate={{
                  opacity: isCardFlipped ? 1 : 0,
                  y: isCardFlipped ? 0 : 20,
                  scale: isCardFlipped ? 1 : 0.97,
                }}
                transition={{
                  duration: 0.7,
                  delay: isCardFlipped ? 0.3 : 0,
                  ease: "easeOut",
                }}
                className={`flex flex-col justify-center space-y-1 sm:space-y-2 transition-opacity duration-300 ${
                  isCardFlipped
                    ? "pointer-events-auto"
                    : "pointer-events-none select-none"
                } ${
                  isRight
                    ? "text-right sm:text-right pr-1 sm:pr-4"
                    : "text-left sm:text-left pl-1 sm:pl-4"
                }`}
              >
                <span className="text-[#bc2c1a] uppercase tracking-[0.2em] text-[8px] min-[360px]:text-[9px] sm:text-xs font-bold">
                  {event.day}
                </span>
                <h3 className="font-serif text-base min-[360px]:text-lg sm:text-2xl md:text-3xl text-gray-900 font-medium leading-snug">
                  {event.title}
                </h3>
                {event.subtitle && (
                  <p className="font-serif italic text-[10px] min-[360px]:text-xs sm:text-sm md:text-base text-gray-800 font-medium">
                    {event.subtitle}
                  </p>
                )}
                {event.description && (
                  <div className="text-gray-600 font-serif text-[9px] min-[360px]:text-[11px] sm:text-sm md:text-base leading-relaxed pt-1 sm:pt-2 text-opacity-90 space-y-1 sm:space-y-1.5 whitespace-pre-line">
                    {event.description}
                  </div>
                )}
                {event.dressCode && (
                  <div className="pt-2 sm:pt-3">
                    <p
                      className={`font-serif text-[8px] min-[360px]:text-[10px] sm:text-xs md:text-sm text-gray-700 italic border-t border-gray-200/80 pt-1.5 sm:pt-2 whitespace-pre-line ${
                        isRight ? "text-right" : "text-left"
                      }`}
                    >
                      {event.dressCode}
                    </p>
                  </div>
                )}
              </motion.div>
            );

            return (
              <div
                key={event.id}
                ref={(el) => {
                  if (el) itemRefs.current[event.id] = el;
                }}
                className="grid grid-cols-2 gap-3 sm:gap-8 md:gap-12 items-center w-full"
              >
                {isRight ? (
                  <>
                    <div className="col-span-1">{textElement}</div>
                    <div className="col-span-1">{cardElement}</div>
                  </>
                ) : (
                  <>
                    <div className="col-span-1">{cardElement}</div>
                    <div className="col-span-1">{textElement}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
