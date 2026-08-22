import { useEffect } from "react";
import { ACTIVE_FEATURE_RELEASE } from "@/config/feature-highlight";
import { useInvitation } from "@/features/invitation";

const STORAGE_KEY = "sakeenah_last_seen_feature_release";

/**
 * useFeatureScrollHighlight
 *
 * Automatically scrolls a user to a newly released section ONCE upon opening the invitation.
 * Checks localStorage to prevent repeat scrolls on return visits or page refreshes.
 *
 * Compatible with mobile (iOS Safari/Android Chrome) and desktop viewports.
 */
export function useFeatureScrollHighlight() {
  const { hasFeature } = useInvitation();

  useEffect(() => {
    // 1. Check if a feature highlight release is currently active in config
    if (!ACTIVE_FEATURE_RELEASE || !ACTIVE_FEATURE_RELEASE.targetSectionId) {
      return;
    }

    // 2. If the user navigated via a specific direct anchor hash (e.g. #rsvp), respect their target
    if (window.location.hash && window.location.hash.length > 1) {
      return;
    }

    // 3. If the release requires a feature flag (e.g. 'dev'), verify guest has access
    if (
      ACTIVE_FEATURE_RELEASE.requiredFeature &&
      !hasFeature(ACTIVE_FEATURE_RELEASE.requiredFeature)
    ) {
      return;
    }

    // 4. Check localStorage to see if user has already seen this release
    try {
      const lastSeenRelease = localStorage.getItem(STORAGE_KEY);
      if (lastSeenRelease === ACTIVE_FEATURE_RELEASE.releaseId) {
        return; // Already seen, stay at top
      }
    } catch {
      // Fallback if localStorage is restricted (private browsing quota errors)
    }

    // 5. Delay slightly to allow the invitation opening animations & DOM layout to settle on mobile
    const delay = ACTIVE_FEATURE_RELEASE.scrollDelayMs || 700;

    const timer = setTimeout(() => {
      const targetElement = document.getElementById(
        ACTIVE_FEATURE_RELEASE.targetSectionId,
      );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // 6. Record release as seen in localStorage so it never re-triggers
        try {
          localStorage.setItem(STORAGE_KEY, ACTIVE_FEATURE_RELEASE.releaseId);
        } catch {
          // Ignore write errors in strict private browsing mode
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [hasFeature]);
}
