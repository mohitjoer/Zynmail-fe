"use client";

import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import InteractiveInboxPreview from "@/components/landing/InteractiveInboxPreview";
import WorkflowShowcase from "@/components/landing/WorkflowShowcase";
import FeatureGrid from "@/components/landing/FeatureGrid";
import SecurityBanner from "@/components/landing/SecurityBanner";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div
      className="relative w-full min-h-screen overflow-x-clip flex flex-col items-center bg-black text-white selection:bg-indigo-500/30 selection:text-indigo-200 scroll-smooth"
      style={{
        backgroundImage:
          "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Ambient Contrast Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/50 backdrop-blur-[0.5px]" />

      {/* ── 1. Navbar ── */}
      <LandingNavbar />

      {/* ── Main Landing Content ── */}
      <main className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* ── 2. Hero Section with Interactive Prompt Box ── */}
        <HeroSection />

        {/* ── 3. Interactive Inbox Preview with Live Threads ── */}
        <InteractiveInboxPreview />

        {/* ── 4. LangGraph Autonomous Workflow Studio Showcase ── */}
        <WorkflowShowcase />

        {/* ── 5. 6-Card Core Capabilities Feature Grid ── */}
        <FeatureGrid />

        {/* ── 6. Enterprise Prompt Injection & AI Safety Banner ── */}
        <SecurityBanner />

        {/* ── 7. High-Converting Call to Action ── */}
        <CTASection />
      </main>

      {/* ── 8. Footer ── */}
      <LandingFooter />
    </div>
  );
}