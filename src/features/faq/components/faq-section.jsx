import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import translations from "@/lib/translations.json";
import { cn } from "@/lib/utils";

/**
 * FAQItem component handles the accordion logic for a single FAQ item.
 */
function FAQItem({ item, isOpen, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="mb-4"
    >
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between p-6 text-left transition-all duration-300 rounded-xl",
          "bg-gray-50 hover:bg-gray-100/80 border-none shadow-none",
        )}
      >
        <span className="text-lg md:text-xl font-serif text-gray-800 pr-8">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-theme-main-2 flex-shrink-0"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-gray-50 rounded-b-xl"
          >
            <div className="p-6 pt-0 text-gray-600 leading-relaxed text-base md:text-lg">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * FAQSection component displays a dynamically numbered list of frequently asked questions.
 * The list is filtered based on the guest's feature tags.
 */
export default function FAQSection() {
  const { t, language } = useLanguage();
  const { hasFeature } = useInvitation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = useMemo(() => {
    const allItems = translations[language]?.faq?.items || [];

    return allItems.filter((item) => {
      if (!item.tags || item.tags.length === 0) return true;
      return item.tags.some((tag) => hasFeature(tag));
    });
  }, [language, hasFeature]);

  if (faqItems.length === 0) return null;

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 md:py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="font-handwritten text-6xl md:text-8xl text-[#bc2c1a] leading-none"
          >
            {t("faq.title")}
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onClick={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
