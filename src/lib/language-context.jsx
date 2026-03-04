import { createContext, useContext, useState, useEffect } from "react";
import translations from "./translations.json";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Initialize language from localStorage or browser locale
  useEffect(() => {
    const savedLang = localStorage.getItem("wedding_lang");
    if (savedLang && (savedLang === "en" || savedLang === "fr")) {
      setLanguage(savedLang);
    } else {
      // Check browser locale
      const browserLang = navigator.language || navigator.userLanguage || "en";
      const defaultLang = browserLang.toLowerCase().startsWith("fr")
        ? "fr"
        : "en";
      setLanguage(defaultLang);
    }
  }, []);

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("wedding_lang", lang);
  };

  const t = (path) => {
    const keys = path.split(".");
    let result = translations[language];
    for (const key of keys) {
      if (
        result === undefined ||
        result === null ||
        result[key] === undefined
      ) {
        return path;
      }
      result = result[key];
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
