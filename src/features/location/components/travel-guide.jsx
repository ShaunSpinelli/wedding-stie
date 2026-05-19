import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export default function TravelGuide() {
  const { t } = useLanguage();

  return (
    <section id="travel" className="py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="font-handwritten text-3xl sm:text-5xl md:text-8xl text-[#bc2c1a] leading-tight px-4"
        >
          {t("travel.guide_title")}
        </motion.h2>
        {/* Content to be added later */}
      </div>
    </section>
  );
}
