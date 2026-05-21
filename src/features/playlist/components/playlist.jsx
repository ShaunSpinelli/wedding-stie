import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useInvitation } from "@/features/invitation/invitation-context";
import { fetchSpotifyTrack, updateGuest } from "@/services/api";
import { Music, ExternalLink, X } from "lucide-react";
import SongSearch from "./song-search";

export default function Playlist({ useAltBg = false }) {
  const { t } = useLanguage();
  const { uid, guest, setGuest } = useInvitation();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch selected track details if exists
  useEffect(() => {
    if (guest?.spotify_song_id) {
      const loadTrack = async () => {
        try {
          const response = await fetchSpotifyTrack(guest.spotify_song_id);
          if (response.success) {
            setSelectedTrack(response.data);
          }
        } catch (error) {
          console.error("Failed to load track:", error);
        }
      };
      loadTrack();
    } else {
      setSelectedTrack(null);
    }
  }, [guest?.spotify_song_id]);

  const handleSelectSong = async (track) => {
    if (!guest?.id) return;

    try {
      const response = await updateGuest(uid, guest.id, {
        spotify_song_id: track.id,
      });
      if (response.success) {
        setGuest(response.data);
        setIsSearching(false);
      }
    } catch (error) {
      console.error("Error updating song choice:", error);
    }
  };

  const handleRemoveSong = async () => {
    if (!guest?.id) return;
    try {
      const response = await updateGuest(uid, guest.id, {
        spotify_song_id: null,
      });
      if (response.success) {
        setGuest(response.data);
        setSelectedTrack(null);
      }
    } catch (error) {
      console.error("Error removing song choice:", error);
    }
  };

  return (
    <section
      id="playlist"
      className="py-8 md:py-24 overflow-hidden"
      style={{ backgroundColor: useAltBg ? "#F4F1EC" : "#FFFFFF" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <motion.h2 className="text-5xl md:text-7xl font-handwritten text-theme-main-2">
            {t("playlist.title")}
          </motion.h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Guest's Song Request Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-theme-main-2/5 p-8 rounded-[2.5rem] border border-theme-main-2/10 shadow-sm"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-serif text-theme-main-2 mb-2">
                {t("playlist.request_title") || "Add to the Playlist"}
              </h3>
              <p className="text-sm text-theme-main-3/60">
                {t("playlist.request_description") ||
                  "Search for a song you'd love to hear at the wedding."}
              </p>
            </div>

            {selectedTrack && !isSearching ? (
              <div className="flex flex-col items-center">
                <div className="relative group w-48 h-48 mb-6 shadow-2xl rounded-2xl overflow-hidden ring-4 ring-white">
                  <img
                    src={selectedTrack.imageUrl}
                    alt={selectedTrack.album}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveSong}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold text-theme-main-3 leading-tight mb-1">
                    {selectedTrack.name}
                  </h4>
                  <p className="text-theme-main-3/60 text-sm mb-4">
                    {selectedTrack.artist}
                  </p>
                  <a
                    href={selectedTrack.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1DB954] uppercase tracking-widest hover:underline"
                  >
                    <Music className="w-3 h-3" />
                    Open in Spotify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button
                  onClick={() => setIsSearching(true)}
                  className="px-8 py-3 bg-white border border-theme-main-2/20 text-theme-main-2 rounded-full text-sm font-bold hover:bg-theme-main-2 hover:text-white transition-all shadow-sm"
                >
                  Change Song
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <SongSearch
                  onSelect={handleSelectSong}
                  selectedSongId={guest?.spotify_song_id}
                />
                {isSearching && (
                  <div className="text-center">
                    <button
                      onClick={() => setIsSearching(false)}
                      className="text-theme-main-3/40 text-xs hover:text-theme-main-3 transition-colors uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Existing Playlist Embed - Commented out as requested
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-bold text-theme-main-3/40 uppercase tracking-[0.3em]">
                Current Playlist
              </h3>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl border border-theme-support-1/10 bg-black"
            >
              <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: "12px" }}
                src="https://open.spotify.com/embed/playlist/3sofSMGZvlPaynJ03FdGX3?utm_source=generator&theme=0"
                width="100%"
                height="450"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </motion.div>
          </div>
          */}
        </div>
      </div>
    </section>
  );
}
