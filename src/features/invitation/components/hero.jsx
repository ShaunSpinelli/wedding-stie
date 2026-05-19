import { Calendar, Clock } from "lucide-react";
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
          <span className="text-2xl font-serif text-theme-main-2 leading-none">
            {timeLeft[interval]}
          </span>
          <span className="text-[9px] text-theme-main-2/50 uppercase tracking-[0.1em] mt-1">
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
    const mainName =
      guest?.name || getGuestName() || t("hero.guest_name_fallback");

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
    <div className="page-wrapper flex flex-col h-[100vh] bg-white overflow-hidden">
      {/* Top Section: Image + Overlaid Title */}
      <section className="relative flex-grow overflow-hidden">
        {/* Background Image */}
        <img
          src={getAssetPath("/images/hero-bg.jpg")}
          className="absolute w-full h-[120%] object-cover top-0 left-0 z-0"
          style={{
            /* 100% = Shifts image UP to show the bottom. 
               Adjust this value to fine-tune the shift. */
            objectPosition: "50% 100%",
          }}
          alt="Wedding Hero"
        />

        {/* Title Content Overlaid on Image */}
        <header className="relative z-10 pt-24 pb-6 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1 bg-white/30 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-sm sm:max-w-2xl mx-auto shadow-lg"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-theme-main-2 font-semibold">
              {t("hero.save_the_date")}
            </span>
            <h1 className="text-4xl sm:text-7xl font-serif text-theme-main-2 leading-tight">
              {t("wedding.groomName")}{" "}
              <span className="text-2xl italic font-light serif mx-1">&</span>{" "}
              {t("wedding.brideName")}
            </h1>
            <p className="text-theme-main-2/80 font-serif italic text-base">
              {t("hero.married_announcement")}
            </p>
          </motion.div>
        </header>

        {/* Bottom fade for transition to details card */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-[5]" />
      </section>

      {/* 3. Details Card (Fixed Bottom) */}
      <footer className="details-card relative z-20 bg-white px-8 pt-4 pb-10 text-center -mt-8 rounded-t-[2.5rem] shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.05)]">
        {/* Subtle decorative divider */}
        <div className="w-12 h-px bg-theme-main-2/10 mx-auto mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Guest Greeting */}
          <div className="space-y-1">
            <p className="text-theme-main-2/50 font-serif italic text-sm">
              {t("hero.dear")}
            </p>
            <h2 className="text-3xl font-serif text-theme-main-2 italic">
              {displayName}
            </h2>
          </div>

          {/* Invitation Text */}
          <div className="max-w-[280px] mx-auto">
            <p className="text-theme-main-2/70 text-sm leading-relaxed font-light italic">
              {t("hero.invitation_message")}
            </p>
          </div>

          {/* Date & Time */}
          <div className="flex flex-col items-center justify-center space-y-2 py-4 border-y border-theme-main-2/5">
            <div className="flex items-center space-x-3 text-theme-main-2">
              <Calendar className="w-4 h-4 opacity-40" />
              <span className="font-serif text-lg tracking-tight">
                {t("wedding.displayDate")}
              </span>
            </div>
            {t("wedding.displayTime") && (
              <div className="flex items-center space-x-2 text-theme-main-2/40 text-xs uppercase tracking-[0.1em]">
                <Clock className="w-3 h-3" />
                <span>{t("wedding.displayTime")}</span>
              </div>
            )}
          </div>

          {/* Countdown Section */}
          <div className="pt-2">
            <CountdownTimer targetDate={config.date} />
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
