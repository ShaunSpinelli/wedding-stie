import { useState, useEffect } from "react";
import Hero from "@/features/invitation/components/hero";
import { Events } from "@/features/events";
import { Location } from "@/features/location";
import { Timeline, Schedule } from "@/features/timeline";
import { GuestRSVP } from "@/features/guests";
import { WeddingMenu } from "@/features/menu";
import { FeatureGate } from "@/components/ui/feature-gate";
import Funny from "@/features/funny/components/funny";
import Playlist from "@/features/playlist/components/playlist";
import FunnyCaptcha from "@/features/funny/components/funny-captcha";
import { useInvitation } from "@/features/invitation/invitation-context";

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
      <Hero />
      <Timeline />
      <Schedule />
      <GuestRSVP />
      <WeddingMenu />
      <Events />
      <Location />

      <Playlist />

      {/* Proof of Concept: Conditional Component based on tags */}
      <FeatureGate feature="funny">
        <Funny />
      </FeatureGate>

      {/* Reusable feature-based popup */}
      <FunnyCaptcha
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
      />
    </>
  );
}
