import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Train, Car, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { travelData } from "../data/travel-data";

const IconMap = {
  plane: Plane,
  train: Train,
  car: Car,
};

export default function TravelInfo() {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  const countries = Object.keys(travelData);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    setSelectedOptionIndex(null);
    const cities = Object.keys(travelData[country].cities);
    if (cities.length === 1) {
      handleCitySelect(cities[0], country);
    }
  };

  const handleCitySelect = (city, country = selectedCountry) => {
    setSelectedCity(city);
    setSelectedOptionIndex(null);
    const options = travelData[country].cities[city].options;
    if (options.length === 1) {
      setSelectedOptionIndex(0);
    }
  };

  const SelectionCard = ({
    label,
    isSelected,
    onClick,
    isCompleted,
    subtitle,
  }) => (
    <button
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
        isSelected
          ? "border-theme-main-2 bg-theme-main-1 text-theme-main-2 shadow-sm"
          : "border-theme-support-1/10 bg-theme-support-3/5 hover:border-theme-main-1 text-theme-accent"
      }`}
    >
      <span className="font-bold text-sm sm:text-base leading-tight">
        {label}
      </span>
      {subtitle && (
        <span className="text-[10px] opacity-60 uppercase font-black">
          {subtitle}
        </span>
      )}
      {isCompleted && (
        <CheckCircle2 className="w-4 h-4 text-theme-main-2 mt-1" />
      )}
    </button>
  );

  return (
    <section id="travel" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <span className="inline-block text-theme-main-2 font-medium uppercase tracking-widest text-sm">
            {t("travel.title") || "Getting Here"}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-theme-accent">
            {t("travel.subtitle") || "Travel Options"}
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Step 1: Country Selection */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase font-black opacity-40 text-center tracking-widest">
              {t("travel.steps.country")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {countries.map((countryId) => (
                <SelectionCard
                  key={countryId}
                  label={t(travelData[countryId].labelKey)}
                  isSelected={selectedCountry === countryId}
                  isCompleted={selectedCountry === countryId}
                  onClick={() => handleCountrySelect(countryId)}
                />
              ))}
            </div>
          </div>

          {/* Step 2: City Selection */}
          <AnimatePresence>
            {selectedCountry &&
              Object.keys(travelData[selectedCountry].cities).length > 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-[10px] uppercase font-black opacity-40 text-center tracking-widest">
                    {t("travel.steps.city")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.keys(travelData[selectedCountry].cities).map(
                      (cityId) => (
                        <SelectionCard
                          key={cityId}
                          label={t(
                            travelData[selectedCountry].cities[cityId].labelKey,
                          )}
                          isSelected={selectedCity === cityId}
                          isCompleted={selectedCity === cityId}
                          onClick={() => handleCitySelect(cityId)}
                        />
                      ),
                    )}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Step 3: Option Selection */}
          <AnimatePresence>
            {selectedCity &&
              travelData[selectedCountry].cities[selectedCity].options.length >
                1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-[10px] uppercase font-black opacity-40 text-center tracking-widest">
                    {t("travel.steps.route")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {travelData[selectedCountry].cities[
                      selectedCity
                    ].options.map((option, idx) => (
                      <SelectionCard
                        key={idx}
                        label={t(option.nameKey)}
                        isSelected={selectedOptionIndex === idx}
                        isCompleted={selectedOptionIndex === idx}
                        onClick={() => setSelectedOptionIndex(idx)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Step 4: Final Timeline */}
          <AnimatePresence>
            {selectedOptionIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-support-3/5 rounded-[2rem] p-6 sm:p-10 border border-theme-support-1/10 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-theme-support-1/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-theme-main-1 flex items-center justify-center text-theme-main-2">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black opacity-40 mb-0.5">
                        {t("travel.labels.from")}
                      </p>
                      <h3 className="text-xl font-bold text-theme-accent">
                        {t(
                          travelData[selectedCountry].cities[selectedCity]
                            .labelKey,
                        )}
                        , {t(travelData[selectedCountry].labelKey)}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-theme-support-1/10 shadow-sm">
                      <Clock className="w-4 h-4 text-theme-main-2" />
                      <span className="text-xs font-bold text-theme-accent">
                        {t("travel.labels.est")}{" "}
                        {travelData[selectedCountry].cities[selectedCity].time}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCountry(null);
                        setSelectedCity(null);
                        setSelectedOptionIndex(null);
                      }}
                      className="text-xs font-bold text-theme-main-2 hover:underline"
                    >
                      {t("travel.labels.reset")}
                    </button>
                  </div>
                </div>

                <div className="relative space-y-8">
                  <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-theme-main-1/50" />

                  {travelData[selectedCountry].cities[selectedCity].options[
                    selectedOptionIndex
                  ].steps.map((step, index) => {
                    const StepIcon = IconMap[step.icon] || Plane;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-16 flex items-center group"
                      >
                        <div className="absolute left-0 w-12 h-12 rounded-full bg-white border-2 border-theme-main-1 flex items-center justify-center text-theme-main-2 shadow-sm z-10 group-hover:scale-110 transition-transform">
                          <StepIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 p-5 rounded-2xl bg-white/80 border border-theme-support-1/10 shadow-sm group-hover:border-theme-main-1 transition-colors">
                          <p className="text-theme-accent font-bold leading-tight">
                            {t(step.destKey)}
                          </p>
                          <p className="text-[10px] uppercase font-black text-theme-main-2 opacity-60 mt-1">
                            {t("travel.labels.via")} {t(step.modeKey)}
                          </p>
                          {step.detailKey && (
                            <p className="text-xs text-theme-accent/70 italic mt-2 border-t border-theme-support-1/5 pt-2">
                              {t(step.detailKey)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative pl-16 pt-4"
                  >
                    <div className="absolute left-0 w-12 h-12 rounded-full bg-theme-accent flex items-center justify-center text-white shadow-lg z-10">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="p-6 rounded-2xl bg-theme-accent text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <MapPin className="w-16 h-16" />
                      </div>
                      <p className="text-[10px] uppercase font-black opacity-60 mb-1 tracking-widest">
                        {t("travel.labels.arrival")}
                      </p>
                      <p className="text-2xl font-serif font-bold">
                        Comptoir St Hilaire
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
