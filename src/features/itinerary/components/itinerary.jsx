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
      day: "Friday, May 21",
      title: "Welcome Braai",
      time: "6:00 PM onwards",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.",
      image: getAssetPath("/images/friday-braai.png"),
    },
    {
      id: 2,
      day: "Saturday, May 22",
      title: "The Wedding Day",
      time: "3:30 PM until late",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nisi nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris fusce nec tellus sed augue.",
      image: getAssetPath("/images/saturday-wedding.png"),
    },
    {
      id: 3,
      day: "Sunday, May 23",
      title: "Pizza & Recovery",
      time: "12:00 PM - 4:00 PM",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
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

        {/* Alternating Zigzag Layout with Text & Cards */}
        <div className="flex flex-col space-y-12 sm:space-y-16 md:space-y-24 max-w-4xl mx-auto pt-6 px-2 sm:px-6">
          {itineraryEvents.map((event, index) => {
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
                <p className="text-gray-500 font-serif text-[9px] min-[360px]:text-[10px] sm:text-xs tracking-wider">
                  {event.time}
                </p>
                <p className="text-gray-600 font-serif text-[9px] min-[360px]:text-[11px] sm:text-sm md:text-base leading-relaxed pt-1 sm:pt-2 text-opacity-90">
                  {event.description}
                </p>
              </motion.div>
            );

            return (
              <div
                key={event.id}
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
