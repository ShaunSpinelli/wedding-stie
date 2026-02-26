import { motion } from "framer-motion";
import { Utensils, Wheat, Beef, IceCream } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function WeddingMenu() {
  const { t } = useLanguage();

  const menuSections = [
    { key: "starter", icon: Wheat },
    { key: "main", icon: Beef },
    { key: "dessert", icon: IceCream },
  ];

  return (
    <section id="menu" className="py-20 bg-theme-support-3/5 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <motion.span className="inline-block text-theme-main-2 font-medium uppercase tracking-widest text-sm">
            {t("menu.title")}
          </motion.span>
          <motion.h2 className="text-4xl md:text-5xl font-serif text-theme-accent">
            {t("menu.subtitle")}
          </motion.h2>
          <p className="text-theme-accent/60 max-w-md mx-auto">
            {t("menu.description")}
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuSections.map((section, index) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-theme-support-1/20 shadow-xl text-center space-y-6 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-theme-main-1 rounded-full flex items-center justify-center text-theme-main-2">
                <section.icon className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-theme-main-2">
                  {t(`menu.${section.key}.title`)}
                </h3>
                <h4 className="text-xl font-serif font-bold text-theme-accent">
                  {t(`menu.${section.key}.name`)}
                </h4>
              </div>

              <div className="h-[1px] w-12 bg-theme-support-1/20" />

              <p className="text-sm text-theme-accent/60 leading-relaxed italic">
                {t(`menu.${section.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Decorative Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <Utensils className="w-6 h-6 text-theme-support-1/30" />
        </motion.div>
      </div>
    </section>
  );
}
