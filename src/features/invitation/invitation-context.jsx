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

const InvitationContext = createContext();

export function InvitationProvider({ children }) {
  const invitationUid = "shaun-manon-2027";

  const [config, setConfig] = useState(null);
  const [guest, setGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Set to false for FE-only test
  const [error, setError] = useState(null);

  // Debug log to check instantiation
  useEffect(() => {
    console.log(
      "[InvitationProvider] Context instantiated with UID (Fetches disabled):",
      invitationUid,
    );
  }, [invitationUid]);

  // 1. Initial Load: Fetch Wedding Config (DISABLED for FE-only deployment)
  useEffect(() => {
    /*
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
      } finally {
        if (!getGuestName()) setIsLoading(false);
      }
    };

    loadInvitation();
    */
    setIsLoading(false);
  }, [invitationUid]);

  // 2. Guest Identification & Features (DISABLED for FE-only deployment)
  useEffect(() => {
    /*
    const identifyGuest = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const guestParam = urlParams.get("guest");
      let nameToSearch = getGuestName();

      if (guestParam) {
        try {
          const decodedName = safeBase64.decode(guestParam);
          if (decodedName) {
            nameToSearch = decodedName;
            storeGuestName(decodedName);
            window.history.replaceState({}, "", window.location.pathname);
          }
        } catch (e) {
          console.error("Error decoding guest name", e);
        }
      }

      if (nameToSearch) {
        try {
          const response = await searchGuest(invitationUid, {
            name: nameToSearch,
          });
          if (response.success) {
            setGuest(response.data);
          }
        } catch {
          console.log("Guest record not found for:", nameToSearch);
        }
      }
      setIsLoading(false);
    };

    identifyGuest();
    */
    setIsLoading(false);
  }, [invitationUid]);

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
