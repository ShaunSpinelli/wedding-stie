import Hero from "@/features/invitation/components/hero";
import { Events } from "@/features/events";
import { Location } from "@/features/location";
import { Wishes } from "@/features/wishes";
import { Timeline, Schedule } from "@/features/timeline";

// Main Invitation Content
export default function MainContent() {
  return (
    <>
      <Hero />
      <Timeline />
      <Schedule />
      <Events />
      <Location />
      <Wishes />
    </>
  );
}
