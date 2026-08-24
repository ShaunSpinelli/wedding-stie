import { useInvitation } from "@/features/invitation/invitation-context";

/**
 * FeatureGate Component
 *
 * Reusable wrapper that only renders children if the current guest
 * has the required feature tag.
 *
 * @param {string} feature - The name of the feature tag required
 * @param {React.ReactNode} children - The component to render if allowed
 */
export function FeatureGate({ feature, features, children }) {
  const { hasFeature } = useInvitation();

  if (feature && !hasFeature(feature)) {
    return null;
  }

  if (
    features &&
    Array.isArray(features) &&
    !features.every((f) => hasFeature(f))
  ) {
    return null;
  }

  return <>{children}</>;
}
