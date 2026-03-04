import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { storeGuestName, getGuestName } from "@/lib/invitation-storage";
import { safeBase64 } from "@/lib/base64";
import { fetchInvitation, searchGuest } from "@/services/api";
import { useLanguage } from "@/lib/language-context";

const InvitationContext = createContext();

export function InvitationProvider({ children }) {
  console.log("[InvitationProvider] Rendering Provider component");
  const invitationUid = "shaun-manon-2027";
  const { toggleLanguage } = useLanguage();

  const [config, setConfig] = useState(null);
  const [guest, setGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safety fallback: if everything hangs, stop loading after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn(
          "[InvitationProvider] Safety timeout reached, forcing isLoading to false",
        );
        setIsLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Debug log to check instantiation
  useEffect(() => {
    console.log(
      "[InvitationProvider] Context instantiated with UID:",
      invitationUid,
    );
  }, [invitationUid]);

  // 1. Initial Load: Fetch Wedding Config
  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const response = await fetchInvitation(invitationUid);
        if (response.success) {
          setConfig(response.data);
        } else {
          setError(response.error || "Failed to load invitation");
        }
      } catch {
        setError("Invitation not found");
      }
    };

    loadInvitation();
  }, [invitationUid]);

  // 2. Guest Identification & Features
  useEffect(() => {
    const identifyGuest = async () => {
      console.log("[InvitationProvider] Identifying guest...");
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const guestParam = urlParams.get("guest");
      let nameToSearch = getGuestName();

      console.log(
        "[InvitationProvider] Guest param:",
        guestParam,
        "Stored name:",
        nameToSearch,
      );

      if (guestParam) {
        try {
          const decodedName = safeBase64.decode(guestParam);
          console.log("[InvitationProvider] Decoded name:", decodedName);
          if (decodedName) {
            nameToSearch = decodedName;
            storeGuestName(decodedName);

            // Clean ONLY the guest param from the URL while keeping others
            urlParams.delete("guest");
            const newSearch = urlParams.toString();
            const newPath =
              window.location.pathname + (newSearch ? `?${newSearch}` : "");
            window.history.replaceState({}, "", newPath);
          }
        } catch (e) {
          console.error("[InvitationProvider] Error decoding guest name", e);
        }
      }

      if (nameToSearch) {
        console.log("[InvitationProvider] Searching for guest:", nameToSearch);
        try {
          const response = await searchGuest(invitationUid, {
            name: nameToSearch,
          });
          console.log("[InvitationProvider] Search response:", response);
          if (response.success) {
            setGuest(response.data);
            // Auto-set language if guest has a preference
            if (response.data.language) {
              toggleLanguage(response.data.language);
            }
          }
        } catch (err) {
          console.error("[InvitationProvider] Guest search failed:", err);
        }
      }
      setIsLoading(false);
    };

    identifyGuest();
  }, [invitationUid, toggleLanguage]);

  // Helper to check if guest has a specific feature tag
  const hasFeature = useCallback(
    (featureName) => {
      if (!guest || !guest.features) return false;
      return guest.features.some(
        (f) => f.toLowerCase() === featureName.toLowerCase(),
      );
    },
    [guest],
  );

  const value = useMemo(
    () => ({
      uid: invitationUid,
      config,
      guest,
      setGuest,
      hasFeature,
      isLoading,
      error,
    }),
    [config, guest, isLoading, error, hasFeature],
  );

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitation() {
  const context = useContext(InvitationContext);
  if (!context) {
    console.error(
      "[useInvitation] Error: Attempted to use context outside of Provider.",
    );
    throw new Error("useInvitation must be used within an InvitationProvider");
  }
  return context;
}
