import EventCards from "@/features/events/components/events-card";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function Events() {
  const { t } = useLanguage();

  return (
    <>
      {/* Event Section */}
      <section id="event" className="min-h-screen relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 py-20"
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block text-theme-main-2 font-medium mb-2"
            >
              {t("hero.save_the_date")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-serif text-theme-accent leading-tight"
            >
              {t("events.title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-theme-accent/70 max-w-md mx-auto"
            >
              {t("events.description")}
            </motion.p>
            {/* Decorative Line */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mt-6"
            >
              <div className="h-[1px] w-12 bg-theme-support-1/30" />
              <div className="text-theme-support-1">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
              <div className="h-[1px] w-12 bg-theme-support-1/30" />
            </motion.div>
          </motion.div>

          {/* Events Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <EventCards events={t("wedding.agenda") || []} />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
