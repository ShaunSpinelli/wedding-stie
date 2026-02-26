import { useLanguage } from "@/lib/language-context";

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="fixed top-4 left-4 z-[100] flex bg-white/80 backdrop-blur-sm rounded-full p-1 border border-theme-support-1/30 shadow-lg">
      <button
        onClick={() => toggleLanguage("en")}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          language === "en"
            ? "bg-theme-main-2 text-white shadow-sm"
            : "text-theme-accent hover:bg-theme-main-1/30"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => toggleLanguage("fr")}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          language === "fr"
            ? "bg-theme-main-2 text-white shadow-sm"
            : "text-theme-accent hover:bg-theme-main-1/30"
        }`}
      >
        FR
      </button>
    </div>
  );
};
