import { createContext, useContext, useEffect, useState, useMemo } from "react";

const ThemeContext = createContext();

// Registry of available themes
export const THEMES = {
  BUTTERCREAM: "buttercream",
  EMBER_ASH: "ember-ash",
  KHAKI_ROMANTIC: "khaki-romantic",
  GRAPHITE_NOIR: "graphite-noir",
  CINEMATIC_BRICK: "cinematic-brick"
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || THEMES.BUTTERCREAM;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all classes that start with 'theme-'
    const themeClasses = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    themeClasses.forEach(c => root.classList.remove(c));
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Persist preference
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const themeValues = Object.values(THEMES);
    const currentIndex = themeValues.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeValues.length;
    setTheme(themeValues[nextIndex]);
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    cycleTheme,
    availableThemes: THEMES
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
