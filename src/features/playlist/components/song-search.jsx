import { useState, useEffect, useRef } from "react";
import { Search, Music, Loader2, Check } from "lucide-react";
import { searchSpotifyTracks } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export default function SongSearch({ onSelect, selectedSongId }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          const response = await searchSpotifyTracks(query);
          if (response.success) {
            setResults(response.data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-theme-main-3/40" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-theme-support-1/20 rounded-2xl leading-5 bg-white placeholder-theme-main-3/30 focus:outline-none focus:ring-2 focus:ring-theme-main-2/20 focus:border-theme-main-2 transition-all text-theme-main-3"
          placeholder={t("playlist.search_placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-theme-main-2 animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-theme-support-1/10 overflow-hidden"
          >
            <ul className="max-h-80 overflow-y-auto">
              {results.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(track);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-theme-main-2/5 transition-colors text-left group"
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-theme-support-3/10">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={track.album}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-theme-main-3/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-theme-main-3 truncate group-hover:text-theme-main-2 transition-colors">
                        {track.name}
                      </p>
                      <p className="text-xs text-theme-main-3/60 truncate">
                        {track.artist} • {track.album}
                      </p>
                    </div>
                    {selectedSongId === track.id && (
                      <Check className="w-5 h-5 text-theme-main-2" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
