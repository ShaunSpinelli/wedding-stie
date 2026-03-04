import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function ComingSoon() {
  const { t } = useLanguage();

  return (
    <section id="info" className="py-20 bg-theme-support-3/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center space-y-6 bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-theme-support-1/10 shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-main-1 text-theme-main-2 mb-4">
            <Info className="w-8 h-8" />
          </div>

          <h2 className="text-3xl md:text-4xl font-serif text-theme-accent">
            {t("coming_soon.title")}
          </h2>

          <p className="text-lg text-theme-main-3/80 italic leading-relaxed">
            {t("coming_soon.message")}
          </p>

          <div className="pt-4">
            <div className="h-px w-24 bg-theme-main-1 mx-auto" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
