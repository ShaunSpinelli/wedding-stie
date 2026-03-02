import { Palette } from "lucide-react";
import { useTheme, THEMES } from "@/lib/theme-context";
import { motion } from "framer-motion";

export const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();

  const getThemeColor = (t) => {
    switch(t) {
      case THEMES.BUTTERCREAM: return '#e0a93b';
      case THEMES.EMBER_ASH: return '#bc2c1a';
      case THEMES.KHAKI_ROMANTIC: return '#b09c82';
      case THEMES.GRAPHITE_NOIR: return '#2f2f2f';
      case THEMES.CINEMATIC_BRICK: return '#bc2c1a';
      default: return '#e0a93b';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="fixed top-4 right-32 sm:right-40 z-[100] flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-theme-support-1/30 shadow-lg text-theme-accent hover:bg-theme-main-1/50 transition-all text-xs font-bold"
      title="Cycle Theme"
    >
      <Palette className="w-3.5 h-3.5" />
      <span className="uppercase">{theme.replace('-', ' ')}</span>
      
      <motion.div 
        layoutId="theme-dot"
        animate={{ backgroundColor: getThemeColor(theme) }}
        className="w-2 h-2 rounded-full"
      />
    </button>
  );
};
