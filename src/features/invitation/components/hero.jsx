import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { getGuestName } from "@/lib/invitation-storage";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { getAssetPath } from "@/utils/asset-path";

export default function Hero({ useAltBg = false }) {
  const config = useConfig();
  const { t } = useLanguage();
  const { guest } = useInvitation();

  const displayName = useMemo(() => {
    const mainName =
      guest?.name || getGuestName() || t("hero.guest_name_fallback");
    if (guest?.has_plus_one && guest?.plus_one_name) {
      return `${mainName} & ${guest.plus_one_name}`;
    }
    return mainName;
  }, [guest, t]);

  const CountdownTimer = ({ targetDate }) => {
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
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.keys(timeLeft).map((interval) => (
          <motion.div
            key={interval}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"
          >
            <span className="text-xl sm:text-2xl font-bold text-theme-main-2 drop-shadow-sm">
              {timeLeft[interval]}
            </span>
            <span className="text-xs text-theme-main-2/70 capitalize font-medium">
              {interval}
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  /*
  const FloatingHearts = () => {
    const [hearts] = useState(() =>
      [...Array(8)].map((_, i) => ({
        size: Math.floor(Math.random() * 2) + 8,
        color:
          i % 3 === 0
            ? "text-theme-romantic/40"
            : i % 3 === 1
              ? "text-theme-main-2/40"
              : "text-theme-main-3/20",
        initialX: Math.random() * 100,
        animateX: Math.random() * 100,
      })),
    );

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hearts.map((heart, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              left: `${heart.initialX}%`,
              bottom: "-10%",
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              left: `${heart.animateX}%`,
              bottom: "110%",
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
            className="absolute"
          >
            <Heart
              className={heart.color}
              style={{
                width: `${heart.size * 4}px`,
                height: `${heart.size * 4}px`,
              }}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>
    );
  };
  */

  return (
    <>
      <section
        id="home"
        className="min-h-[120vh] flex flex-col items-center justify-start px-4 pt-4 pb-20 sm:pt-16 sm:pb-32 text-center relative overflow-hidden"
        style={{ backgroundColor: useAltBg ? "#F4F1EC" : "#FFFFFF" }}
      >
        {/* Background Image with fixed 160vh height to preserve perspective */}
        <div className="absolute -top-10 left-0 right-0 h-[160vh] z-0 pointer-events-none">
          <img
            src={getAssetPath("/images/hero-bg.jpg")}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30"
            style={{
              objectPosition: "center top",
              maskImage:
                "linear-gradient(to bottom, black 50%, transparent 75%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 50%, transparent 75%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mx-auto"
          >
            <span className="px-4 py-1 text-sm bg-theme-support-1/10 text-theme-main-2 rounded-full border border-theme-support-1/20 font-serif italic backdrop-blur-sm">
              {t("hero.save_the_date")}
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-6xl lg:text-8xl font-serif text-theme-main-2 drop-shadow-sm"
            >
              {t("wedding.groomName")} & {t("wedding.brideName")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-theme-main-2 font-light italic text-xl sm:text-2xl drop-shadow-sm"
            >
              {t("hero.married_announcement")}
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative max-w-md lg:max-w-2xl mx-auto"
          >
            {/* Transparent background with lighter blur */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl" />

            <div className="relative px-4 sm:px-8 py-8 sm:py-10 rounded-2xl border border-white/20 shadow-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
                <div className="w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>

              <div className="space-y-0 text-center">
                <div className="space-y-3 mb-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 text-theme-main-2" />
                    <span className="text-theme-main-2 font-medium text-sm sm:text-base">
                      {t("wedding.displayDate")}
                    </span>
                  </motion.div>

                  {t("wedding.displayTime") && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Clock className="w-4 h-4 text-theme-main-2" />
                      <span className="text-theme-main-2 font-medium text-sm sm:text-base">
                        {t("wedding.displayTime")}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-theme-main-2/20 to-transparent" />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="space-y-0"
                >
                  <p className="text-theme-main-2 font-serif italic text-base opacity-80">
                    {t("hero.dear")}
                  </p>
                  <div className="space-y-2">
                    <p className="text-theme-main-2 font-semibold text-2xl drop-shadow-sm">
                      {displayName}
                    </p>
                    <p className="text-theme-main-2 text-sm sm:text-base leading-relaxed max-w-[250px] mx-auto opacity-90">
                      {t("hero.invitation_message")}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-px">
                <div className="w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Spacer to push content down - adjust h-[value] as needed */}
          {/* <div className="h-48 sm:h-32" aria-hidden="true" /> */}
          <div className="mt-auto w-full max-w-4xl px-4 relative z-10 mb-8 sm:mb-16">
            <CountdownTimer targetDate={config.date} />
          </div>
        </motion.div>
      </section>
    </>
  );
}
