import { motion } from "framer-motion";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { Clock } from "lucide-react";

export default function Schedule() {
  const config = useConfig();
  const scheduleData = config.schedule || [];

  return (
    <section id="schedule" className="relative overflow-hidden py-16 bg-white">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-block text-theme-main-2 font-medium"
          >
            Itinerary
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-theme-accent"
          >
            Wedding Weekend
          </motion.h2>

          <div className="h-[1px] w-12 bg-theme-support-1 mx-auto pt-4" />
        </motion.div>

        {/* Schedule Content */}
        <div className="max-w-5xl mx-auto relative">
          {scheduleData.map((dayPlan, dayIndex) => (
            <div key={dayIndex} className="mb-16 last:mb-0 relative">
              {/* Day Header */}
              <div className="text-center mb-12 relative">
                <motion.h3
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-block bg-white px-8 py-2 text-xl md:text-2xl font-serif text-theme-accent italic border-2 border-theme-support-1/30 rounded-full shadow-sm relative z-10"
                >
                  {dayPlan.day}
                </motion.h3>
                {/* Visual horizontal guide */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-theme-support-1/10 -z-0" />
              </div>

              <div className="relative pb-8">
                {/* THE VERTICAL LINE - DESKTOP */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 hidden md:block"
                  style={{
                    backgroundColor: "var(--theme-support-1)",
                    opacity: 0.4,
                  }}
                />

                {/* THE VERTICAL LINE - MOBILE */}
                <div
                  className="absolute left-4 top-0 bottom-0 w-0.5 md:hidden"
                  style={{
                    backgroundColor: "var(--theme-support-1)",
                    opacity: 0.4,
                  }}
                />

                <div className="space-y-12 md:space-y-0">
                  {dayPlan.events.map((event, eventIndex) => {
                    const isEven = eventIndex % 2 === 0;
                    return (
                      <motion.div
                        key={eventIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: eventIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="relative"
                      >
                        {/* DESKTOP ROW */}
                        <div className="hidden md:grid grid-cols-[1fr_100px_1fr] items-center w-full min-h-[100px]">
                          {/* Left Column */}
                          <div className="flex flex-col items-end text-right pr-8">
                            {isEven ? (
                              <div className="flex items-center gap-3 text-theme-main-2 font-bold text-sm tracking-widest uppercase">
                                <Clock className="w-4 h-4" />
                                <span>{event.time}</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <h4 className="text-xl font-bold text-theme-accent">
                                  {event.title}
                                </h4>
                                <p className="text-theme-accent/60 text-sm leading-relaxed max-w-sm ml-auto">
                                  {event.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Center Column (Dot) */}
                          <div className="relative flex justify-center items-center">
                            <div className="w-4 h-4 rounded-full bg-white border-2 border-theme-main-2 shadow-sm z-10" />
                          </div>

                          {/* Right Column */}
                          <div className="flex flex-col items-start text-left pl-8">
                            {isEven ? (
                              <div className="space-y-1">
                                <h4 className="text-xl font-bold text-theme-accent">
                                  {event.title}
                                </h4>
                                <p className="text-theme-accent/60 text-sm leading-relaxed max-w-sm">
                                  {event.description}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-theme-main-2 font-bold text-sm tracking-widest uppercase">
                                <Clock className="w-4 h-4" />
                                <span>{event.time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* MOBILE ROW */}
                        <div className="md:hidden flex flex-col pl-12 relative mb-10 last:mb-0">
                          {/* Dot */}
                          <div className="absolute left-[-4px] top-1.5 w-3.5 h-3.5 rounded-full bg-theme-main-2 z-10 border-2 border-white shadow-sm" />

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-theme-main-2 font-bold text-xs tracking-wider uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{event.time}</span>
                            </div>
                            <h4 className="text-lg font-bold text-theme-accent">
                              {event.title}
                            </h4>
                            <p className="text-theme-accent/60 text-sm leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
