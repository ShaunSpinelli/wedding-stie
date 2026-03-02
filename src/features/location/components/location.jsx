import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function Location() {
  const { t } = useLanguage();

  return (
    <>
      {/* Map & Venue Section */}
      <section id="location" className="min-h-screen relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py-20 relative z-10">
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
              className="inline-block text-theme-main-2 font-medium"
            >
              {t("location.title")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-serif text-theme-accent"
            >
              {t("location.subtitle")}
            </motion.h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Map and Address Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Map Iframe Wrapper */}
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-theme-support-1/20 relative group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.292292615672317!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sfr!4v1647871624581!5m2!1sen!2sfr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Wedding Venue Map"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-theme-support-1/10 rounded-3xl" />
              </div>

              {/* Address Card */}
              <div className="flex items-start gap-6 p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-theme-support-1/20 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-theme-main-1 flex items-center justify-center flex-shrink-0 text-theme-main-2 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-theme-accent mb-6">
                    {t("wedding.location")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-theme-main-2 mt-2 flex-shrink-0" />
                      <p className="text-theme-accent/80 flex-1">
                        {t("wedding.address")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
