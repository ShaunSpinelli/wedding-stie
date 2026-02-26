import Hero from "@/features/invitation/components/hero";
import { Events } from "@/features/events";
import { Location } from "@/features/location";
import { Timeline, Schedule } from "@/features/timeline";
import { GuestRSVP } from "@/features/guests";
import { FeatureGate } from "@/components/ui/feature-gate";
import Funny from "@/features/funny/components/funny";
import Playlist from "@/features/playlist/components/playlist";

// Main Invitation Content
export default function MainContent() {
  return (
    <>
      <Hero />
      <Timeline />
      <Schedule />
      <GuestRSVP />
      <Events />
      <Location />

      <Playlist />

      {/* Proof of Concept: Conditional Component based on tags */}
      <FeatureGate feature="funny">
        <Funny />
      </FeatureGate>
    </>
  );
}
