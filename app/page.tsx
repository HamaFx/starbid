import { ObservatoryStage } from "@/components/galaxy/ObservatoryStage";
import { HowItWorks } from "@/components/galaxy/HowItWorks";
import { LegalLinks } from "@/app/legal-links";
import { demoStars } from "@/lib/demoStars";

export const metadata = {
  title: "StarBid — The Living Project Galaxy",
  description: "An interactive living galaxy where projects compete for orbital position around the Singularity by cumulative gravity.",
};

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#05050a] p-2 text-[#fff4e0] sm:p-4 md:p-6">
      {/* Full-Viewport Living Observatory Arena */}
      <ObservatoryStage initialStars={demoStars} />

      {/* Secondary Content Below The Fold */}
      <div className="mx-auto max-w-5xl px-2 py-8">
        <HowItWorks />
      </div>

      <footer className="mx-auto max-w-5xl border-t border-white/10 px-2 py-6">
        <LegalLinks />
      </footer>
    </main>
  );
}
