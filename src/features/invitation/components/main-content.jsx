import { useState, useEffect } from "react";
import Hero from "@/features/invitation/components/hero";
import { LocationBanner, TravelGuide } from "@/features/location";
import { Itinerary } from "@/features/itinerary";
import { GuestRSVP } from "@/features/guests";
import { FeatureGate } from "@/components/ui/feature-gate";
import Funny from "@/features/funny/components/funny";
import FunnyCaptcha from "@/features/funny/components/funny-captcha";
import { useInvitation } from "@/features/invitation/invitation-context";
import { FAQSection } from "@/features/faq";
import { Playlist } from "@/features/playlist";

// Main Invitation Content
export default function MainContent() {
  const { hasFeature } = useInvitation();
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);
  const [hasShownCaptcha, setHasShownCaptcha] = useState(false);

  useEffect(() => {
    // If user has the 'funny' tag and we haven't shown it yet this session
    if (hasFeature("funny") && !hasShownCaptcha) {
      const timer = setTimeout(() => {
        setIsCaptchaOpen(true);
        setHasShownCaptcha(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasFeature, hasShownCaptcha]);

  return (
    <>
      <Hero useAltBg={false} />
      <LocationBanner />

      <FeatureGate feature="dev">
        <Itinerary />
      </FeatureGate>

      <TravelGuide />
      <GuestRSVP useAltBg={true} />

      {/* Proof of Concept: Conditional Component based on tags */}
      <FeatureGate feature="funny">
        <Funny />
      </FeatureGate>

      {/* Reusable feature-based popup */}
      <FunnyCaptcha
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
      />

      <Playlist useAltBg={false} />

      <FAQSection useAltBg={true} />
    </>
  );
}
