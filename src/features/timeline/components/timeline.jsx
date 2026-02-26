import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function Timeline() {
  const { t } = useLanguage();
  const timelineData = t("wedding.timeline") || [];

  return (
    <section
      id="timeline"
      className="min-h-screen relative overflow-hidden py-20 bg-theme-support-3/5"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-block text-theme-main-2 font-medium"
          >
            {t("timeline.title")}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-theme-accent"
          >
            {t("timeline.subtitle")}
          </motion.h2>

          <div className="h-[1px] w-12 bg-theme-support-1/30 mx-auto pt-4" />
        </motion.div>

        {/* Timeline Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-0">
          {/* Vertical Line - Hidden on small mobile, shown on SM+ */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-px bg-theme-support-1/30" />

          <div className="space-y-12">
            {Array.isArray(timelineData) &&
              timelineData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center justify-between w-full mb-8 ${
                    index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                  } flex-row`}
                >
                  {/* Spacer for large screens */}
                  <div className="hidden md:block w-5/12" />

                  {/* Dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-theme-main-2 flex items-center justify-center shadow-md">
                      <Heart
                        className="w-4 h-4 md:w-5 md:h-5 text-theme-main-2"
                        fill="currentColor"
                      />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-[calc(100%-2rem)] ml-8 md:ml-0 md:w-5/12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-theme-support-1/20 shadow-lg relative z-10">
                    <span className="text-sm font-bold text-theme-main-2 mb-2 block">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-serif text-theme-accent mb-2">
                      {item.title}
                    </h3>
                    <p className="text-theme-accent/70 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
