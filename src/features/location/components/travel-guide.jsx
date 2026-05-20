import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { getAssetPath } from "@/utils/asset-path";

export default function TravelGuide() {
  const { t } = useLanguage();

  return (
    <section id="travel" className="py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="font-handwritten text-3xl sm:text-5xl md:text-8xl text-[#bc2c1a] leading-tight px-4"
        >
          {t("travel.guide_title")}
        </motion.h2>

        {/* Travel Map Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative overflow-hidden">
            <img
              src={getAssetPath("/images/travel-map.png")}
              alt="How to get there map"
              className="w-full h-auto"
              style={{
                maskImage:
                  "radial-gradient(circle, black 60%, transparent 95%)",
                WebkitMaskImage:
                  "radial-gradient(circle, black 60%, transparent 95%)",
              }}
            />
          </div>
        </motion.div>

        {/* Travel Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-md mx-auto text-left space-y-8"
        >
          <div className="space-y-6">
            <h3 className="text-black uppercase tracking-[0.3em] text-xs font-bold text-center mb-8">
              {t("travel.quick_guide_label") || "The Easiest Way"}
            </h3>

            <div className="space-y-6 font-serif">
              <div className="flex gap-4 items-start">
                <span className="text-[#bc2c1a] font-bold">1.</span>
                <p className="text-black/80">
                  {t("travel.step_plane") || "Fly to Paris (CDG or ORY)"}
                </p>
              </div>

              <div className="flex gap-4 items-start">
                <span className="text-[#bc2c1a] font-bold">2.</span>
                <div>
                  <p className="text-black/80 mb-2">
                    {t("travel.step_train") ||
                      "Take the TGV train to Nîmes via"}{" "}
                    <a
                      href="https://www.sncf-connect.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#bc2c1a] underline hover:opacity-80 transition-opacity"
                    >
                      SNCF
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="text-[#bc2c1a] font-bold">3.</span>
                <p className="text-black/80">
                  {t("travel.step_accommodation") ||
                    "Let us know and we can help you organize the final part to the accommodation"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-black/5 text-center">
            <p className="text-black/40 text-sm italic font-serif">
              {t("travel.other_routes_note") ||
                "For other routes, please check the FAQ or reach out to us directly."}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
