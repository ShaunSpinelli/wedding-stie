/**
 * ==============================================================================
 * FEATURE HIGHLIGHT & AUTO-SCROLL CONFIGURATION
 * ==============================================================================
 * This configuration controls the automated 1-time scroll to newly released
 * website features/sections (e.g. Itinerary, Accommodations, Photo Gallery, etc.).
 *
 * HOW IT WORKS:
 * - When a user opens the invitation, the app checks localStorage to see if they
 *   have already seen this specific `releaseId`.
 * - If not, it smoothly glides the viewport to the `targetSectionId` on both
 *   mobile and desktop, then saves the `releaseId` to localStorage.
 * - Each guest experiences the auto-scroll exactly ONCE per release.
 *
 * HOW TO USE FOR FUTURE RELEASES (e.g., In 1 Month):
 * ------------------------------------------------------------------------------
 * 1. When adding a new section (e.g. Accommodations with id="accommodations"):
 *    - Update `targetSectionId` to "accommodations"
 *    - Update `releaseId` to a new unique string: "release_2026_09_accommodations"
 *    - (Optional) Set `requiredFeature` if the section is gated (e.g., "dev"), or null if public.
 *
 * 2. To turn OFF auto-scrolling when no new section is being launched:
 *    - Set `ACTIVE_FEATURE_RELEASE` to `null` (or comment it out).
 * ==============================================================================
 */

export const ACTIVE_FEATURE_RELEASE = {
  /**
   * The HTML `id` attribute of the section DOM element to scroll into view.
   * e.g. "itinerary", "accommodations", "travel-guide", "faq"
   */
  targetSectionId: "itinerary",

  /**
   * Unique identifier for this feature release.
   * Increment/change this string whenever a new feature should be highlighted.
   */
  releaseId: "release_2026_08_itinerary_v1",

  /**
   * Delay in milliseconds before initiating scroll.
   * Gives mobile browsers time to complete the initial invitation open animation.
   */
  scrollDelayMs: 700,

  /**
   * Optional feature flag required to see this section (e.g. "dev", "weekend", "civil").
   * If set, only guests with this feature flag will be scrolled to it.
   * Set to `null` if the feature is visible to all guests.
   */
  requiredFeature: null,
};
