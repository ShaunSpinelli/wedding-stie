import { Calendar, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { getGuestName } from "@/lib/invitation-storage";
import { useLanguage } from "@/lib/language-context";

export default function Hero() {
  const config = useConfig(); // Use hook to get config from API or fallback to static
  const { t } = useLanguage();
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    // Get guest name from localStorage
    const storedGuestName = getGuestName();
    if (storedGuestName) {
      setGuestName(storedGuestName);
    }
  }, []);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {Object.keys(timeLeft).map((interval) => (
          <motion.div
            key={interval}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-rose-100"
          >
            <span className="text-xl sm:text-2xl font-bold text-rose-600">
              {timeLeft[interval]}
            </span>
            <span className="text-xs text-gray-500 capitalize">{interval}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  const FloatingHearts = () => {
    const [hearts] = useState(() =>
      [...Array(8)].map((_, i) => ({
        size: Math.floor(Math.random() * 2) + 8,
        color:
          i % 3 === 0
            ? "text-theme-main-2/40"
            : i % 3 === 1
              ? "text-theme-support-1/40"
              : "text-theme-accent/20",
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

  return (
    <>
      <section
        id="home"
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center relative overflow-hidden bg-theme-support-3/20"
      >
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
            <span className="px-4 py-1 text-sm bg-theme-support-1/10 text-theme-accent rounded-full border border-theme-support-1/20">
              {t("hero.save_the_date")}
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-theme-main-2 font-light italic text-base sm:text-lg"
            >
              {t("hero.married_announcement")}
            </motion.p>
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-3xl sm:text-5xl lg:text-7xl font-serif bg-clip-text text-transparent bg-gradient-to-r from-theme-accent via-theme-main-2 to-theme-accent"
            >
              {t("wedding.groomName")} & {t("wedding.brideName")}
            </motion.h2>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative max-w-md lg:max-w-2xl mx-auto"
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-2xl" />

            <div className="relative px-4 sm:px-8 py-8 sm:py-10 rounded-2xl border border-theme-support-1/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
                <div className="w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-theme-main-2/30 to-transparent" />
              </div>

              <div className="space-y-6 text-center">
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 text-theme-main-2" />
                    <span className="text-theme-accent font-medium text-sm sm:text-base">
                      {t("wedding.displayDate")}
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Clock className="w-4 h-4 text-theme-main-2" />
                    <span className="text-theme-accent font-medium text-sm sm:text-base">
                      {t("wedding.displayTime")}
                    </span>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-8 sm:w-12 bg-theme-support-1/30" />
                  <div className="w-2 h-2 rounded-full bg-theme-main-2" />
                  <div className="h-px w-8 sm:w-12 bg-theme-support-1/30" />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="space-y-2"
                >
                  <p className="text-theme-main-2/70 font-serif italic text-sm">
                    {t("hero.dear")}
                  </p>
                  <p className="text-theme-accent font-medium text-sm">
                    {t("hero.guest_title")}
                  </p>
                  <p className="text-theme-main-2 font-semibold text-lg">
                    {guestName || t("hero.guest_name_fallback")}
                  </p>
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-px">
                <div className="w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-theme-main-2/30 to-transparent" />
              </div>
            </div>

            <div className="absolute -top-2 -right-2 w-16 sm:w-24 h-16 sm:h-24 bg-theme-support-1/10 rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 w-16 sm:w-24 h-16 sm:h-24 bg-theme-main-1/20 rounded-full blur-xl" />
          </motion.div>

          <CountdownTimer targetDate={config.date} />

          <div className="pt-6 relative">
            <FloatingHearts />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart
                className="w-10 sm:w-12 h-10 sm:h-12 text-theme-main-2 mx-auto"
                fill="currentColor"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
