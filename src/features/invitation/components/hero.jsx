import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { getGuestName } from "@/lib/invitation-storage";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { getAssetPath } from "@/utils/asset-path";

const CountdownTimer = ({ targetDate }) => {
  const { t } = useLanguage();
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        [t("hero.countdown.days")]: Math.floor(
          difference / (1000 * 60 * 60 * 24),
        ),
        [t("hero.countdown.hours")]: Math.floor(
          (difference / (1000 * 60 * 60)) % 24,
        ),
        [t("hero.countdown.minutes")]: Math.floor(
          (difference / 1000 / 60) % 60,
        ),
        [t("hero.countdown.seconds")]: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [targetDate, t]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="grid grid-cols-4 gap-4 w-full max-w-xs mx-auto">
      {Object.keys(timeLeft).map((interval) => (
        <div key={interval} className="flex flex-col items-center">
          <span className="text-2xl font-serif text-black leading-none">
            {timeLeft[interval]}
          </span>
          <span className="text-[9px] text-black/40 uppercase tracking-[0.1em] mt-1">
            {interval}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Hero() {
  const config = useConfig();
  const { t } = useLanguage();
  const { guest } = useInvitation();

  const displayName = useMemo(() => {
    const storedName = getGuestName();
    const isEmail = storedName?.includes("@");

    const mainName =
      guest?.name ||
      (!isEmail ? storedName : null) ||
      t("hero.guest_name_fallback");

    const safeParsePlusGuests = (data) => {
      if (Array.isArray(data)) return data;
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const plusNames = safeParsePlusGuests(
      guest?.plus_guests || (guest?.plus_one_name ? [guest.plus_one_name] : []),
    );
    const allNames = [mainName, ...plusNames].filter(Boolean);

    if (allNames.length <= 1) return mainName;
    if (allNames.length === 2) return allNames.join(" & ");

    return (
      allNames.slice(0, -1).join(", ") + " & " + allNames[allNames.length - 1]
    );
  }, [guest, t]);

  return (
    <div className="page-wrapper min-h-screen bg-white">
      {/* Main Hero Section: Shaun [Image] Manon */}
      <section
        id="home"
        className="flex flex-col items-center justify-center pt-12 pb-6 md:pt-24 md:pb-12 px-6 bg-white"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-20 w-full max-w-7xl"
        >
          {/* Groom's Name */}
          <div className="flex-1 flex justify-center lg:justify-end min-w-0">
            <h1 className="text-[72px] font-serif text-black uppercase tracking-[0.05em] leading-[0.9] text-center lg:text-right">
              {t("wedding.groomName")}
            </h1>
          </div>

          {/* Central Image with simple black border */}
          <div className="flex-shrink-0 border border-black p-1 bg-white shadow-sm mx-auto w-64 h-64 sm:w-80 sm:h-80 lg:w-72 lg:h-72 xl:w-80 xl:h-80 2xl:w-[28rem] 2xl:h-[28rem]">
            <img
              src={getAssetPath("/images/hero.gif")}
              className="w-full h-full object-cover"
              alt="Wedding Couple"
            />
          </div>

          {/* Bride's Name */}
          <div className="flex-1 flex justify-center lg:justify-start min-w-0">
            <h1 className="text-[72px] font-serif text-black uppercase tracking-[0.05em] leading-[0.9] text-center lg:text-left">
              {t("wedding.brideName")}
            </h1>
          </div>
        </motion.div>

        {/* Date & Location Line (Matches Screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0 text-xs sm:text-sm md:text-base text-black uppercase tracking-[0.2em] font-light">
            <span>{t("wedding.displayDate")}</span>
            <span className="hidden md:inline mx-4 opacity-20">|</span>
            <div className="w-8 h-px bg-black/20 md:hidden my-2" />
            <span>{t("wedding.location")}</span>
          </div>
        </motion.div>

        {/* Countdown Section (Moved to Hero) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-12"
        >
          <CountdownTimer targetDate={config.date} />
        </motion.div>

        {/* Handwritten Invitation Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="mt-12 text-center px-6"
        >
          <p className="font-handwritten text-3xl md:text-4xl lg:text-5xl text-[#bc2c1a] leading-none">
            {t("common.invitation_handwritten")}
          </p>
        </motion.div>
      </section>

      {/* Details Section (Greeting & Countdown) */}
      <footer className="bg-white px-8 pt-12 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-12"
        >
          {/* Subtle decorative divider */}
          <div className="w-16 h-px bg-black/10 mx-auto" />

          {/* Guest Greeting */}
          <div className="space-y-2">
            <p className="text-black/40 font-serif italic text-sm">
              {t("hero.dear")}
            </p>
            <h2 className="text-4xl font-serif text-black italic">
              {displayName}
            </h2>
          </div>

          {/* Invitation Text */}
          <div className="max-w-[400px] mx-auto">
            <p className="text-black/60 text-base leading-relaxed font-light italic">
              {t("hero.invitation_message")}
            </p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
