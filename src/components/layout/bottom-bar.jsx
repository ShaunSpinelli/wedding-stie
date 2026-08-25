import React, { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  HeartHandshake,
  MapPin,
  Calendar,
  Bed,
  Plane,
  HelpCircle,
  Music,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";

const allMenuItems = [
  {
    icon: Home,
    labelKey: "nav.home",
    href: "#home",
    id: "home",
    primaryMobile: true,
  },
  {
    icon: Calendar,
    labelKey: "nav.itinerary",
    href: "#itinerary",
    id: "itinerary",
    primaryMobile: true,
  },
  {
    icon: HeartHandshake,
    labelKey: "nav.rsvp",
    href: "#rsvp",
    id: "rsvp",
    primaryMobile: true,
  },
  { icon: MapPin, labelKey: "nav.location", href: "#location", id: "location" },
  {
    icon: Bed,
    labelKey: "nav.accommodation",
    href: "#accommodation",
    id: "accommodation",
    feature: "staying",
  },
  { icon: Plane, labelKey: "nav.travel", href: "#travel", id: "travel" },
  { icon: Music, labelKey: "nav.playlist", href: "#playlist", id: "playlist" },
  { icon: HelpCircle, labelKey: "nav.faq", href: "#faq", id: "faq" },
];

/**
 * BottomBar renders a fixed bottom navigation bar with automatic section detection.
 * On mobile, it displays key quick-access items alongside a hamburger Menu button
 * that opens an elegant slide-up drawer for all sections.
 * On desktop (md:), it displays the full horizontal bar.
 */
const BottomBar = () => {
  const [active, setActive] = useState("home");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useLanguage();
  const { hasFeature } = useInvitation();

  const visibleMenuItems = React.useMemo(() => {
    return allMenuItems.filter((item) => {
      if (item.feature && !hasFeature(item.feature)) return false;
      if (item.features && !item.features.every((f) => hasFeature(f))) {
        return false;
      }
      return true;
    });
  }, [hasFeature]);

  // Primary mobile tabs: Home, Program, RSVP
  const mobileTabs = React.useMemo(() => {
    return visibleMenuItems.filter((item) => item.primaryMobile);
  }, [visibleMenuItems]);

  // Check if current active section is inside the drawer (i.e. not in primary mobile tabs)
  const isSecondaryActive = React.useMemo(() => {
    return !mobileTabs.some((tab) => tab.id === active);
  }, [mobileTabs, active]);

  // Function to handle smooth scrolling when clicking menu items
  const handleMenuClick = useCallback((e, href, id) => {
    if (e) e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      setActive(id);
      setIsDrawerOpen(false);

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  // Set up Intersection Observer for automatic section detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const isValidSection = visibleMenuItems.some(
            (item) => item.id === sectionId,
          );
          if (isValidSection) {
            setActive(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    visibleMenuItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [visibleMenuItems]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  return (
    <>
      {/* Slide-Up Navigation Drawer for Mobile */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Bottom Sheet Menu */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-gray-200/80 p-5 pb-8 md:hidden"
            >
              {/* Top Handle / Close Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#bc2c1a]" />
                  <h3 className="font-serif text-lg font-medium text-gray-900">
                    {t("nav.menu") || "Menu"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-4">
                {visibleMenuItems.map((item) => {
                  const isActive = active === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.labelKey}
                      type="button"
                      onClick={(e) => handleMenuClick(e, item.href, item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                        isActive
                          ? "border-[#bc2c1a] bg-[#FAF8F5] shadow-sm text-[#bc2c1a]"
                          : "border-gray-100 bg-gray-50/60 hover:bg-gray-100 text-gray-700",
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                          isActive
                            ? "bg-[#bc2c1a] text-white"
                            : "bg-white text-gray-600 border border-gray-200/80",
                        )}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className="font-serif text-sm font-medium leading-tight">
                        {t(item.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <motion.div
          className="w-auto pointer-events-auto"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="backdrop-blur-md bg-white/92 border border-gray-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-2.5 sm:px-3 py-1.5 sm:py-2">
            {/* Desktop Navigation (md and up: all items) */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleMenuItems.map((item) => (
                <motion.a
                  key={item.labelKey}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-2.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer min-w-[62px]",
                    "hover:bg-[#FAF8F5]",
                    active === item.id
                      ? "text-[#bc2c1a] bg-[#FAF8F5] font-semibold"
                      : "text-gray-500",
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleMenuClick(e, item.href, item.id)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 mb-1 transition-all duration-300",
                      active === item.id
                        ? "stroke-[#bc2c1a] stroke-[2.5px]"
                        : "stroke-gray-500 stroke-2",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-300 line-clamp-1",
                      active === item.id ? "text-[#bc2c1a]" : "text-gray-500",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </motion.a>
              ))}
            </nav>

            {/* Mobile Navigation (under md: 3 quick tabs + Burger Menu button) */}
            <nav className="flex md:hidden items-center gap-1">
              {mobileTabs.map((item) => (
                <motion.a
                  key={item.labelKey}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer min-w-[64px]",
                    active === item.id
                      ? "text-[#bc2c1a] bg-[#FAF8F5] font-semibold"
                      : "text-gray-600",
                  )}
                  whileTap={{ scale: 0.94 }}
                  onClick={(e) => handleMenuClick(e, item.href, item.id)}
                >
                  <item.icon
                    className={cn(
                      "h-[19px] w-[19px] mb-0.5 transition-all",
                      active === item.id
                        ? "stroke-[#bc2c1a] stroke-[2.5px]"
                        : "stroke-gray-600 stroke-2",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all line-clamp-1",
                      active === item.id ? "text-[#bc2c1a]" : "text-gray-600",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </motion.a>
              ))}

              {/* Burger Menu Button on Mobile */}
              <motion.button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={cn(
                  "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer min-w-[64px]",
                  isDrawerOpen || isSecondaryActive
                    ? "text-[#bc2c1a] bg-[#FAF8F5] font-semibold"
                    : "text-gray-600",
                )}
                whileTap={{ scale: 0.94 }}
                aria-label="Toggle navigation menu"
              >
                {/* Notification indicator if active section is in drawer */}
                {isSecondaryActive && !isDrawerOpen && (
                  <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#bc2c1a] ring-2 ring-white" />
                )}
                {isDrawerOpen ? (
                  <X className="h-[19px] w-[19px] mb-0.5 stroke-[#bc2c1a] stroke-[2.5px]" />
                ) : (
                  <Menu
                    className={cn(
                      "h-[19px] w-[19px] mb-0.5 transition-all",
                      isSecondaryActive
                        ? "stroke-[#bc2c1a] stroke-[2.5px]"
                        : "stroke-gray-600 stroke-2",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all line-clamp-1",
                    isDrawerOpen || isSecondaryActive
                      ? "text-[#bc2c1a]"
                      : "text-gray-600",
                  )}
                >
                  {t("nav.menu") || "Menu"}
                </span>
              </motion.button>
            </nav>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default BottomBar;
