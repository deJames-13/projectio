"use client";

import React from "react";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { MarqueeSection } from "./MarqueeSection";
import { InteractiveProductShowcase } from "./InteractiveProductShowcase";
import { MetricsRibbon } from "./MetricsRibbon";
import { FeaturesBento } from "./FeaturesBento";
import { WorkflowTabs } from "./WorkflowTabs";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white antialiased flex flex-col transition-colors duration-200">
      {/* Accessibility: Skip to main content landmark */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Global Navigation Header with theme toggle and logo swap */}
      <LandingHeader />

      {/* Main Landmark */}
      <main id="main-content" className="flex-1 w-full">
        {/* 1. Hero Section with subtle parallax depth */}
        <HeroSection />

        {/* 2. Developer Ecosystem & Integrations Marquee */}
        <MarqueeSection />

        {/* 3. Awwwards-Level Interactive Live Product Showcase */}
        <InteractiveProductShowcase />

        {/* 4. Engineering Telemetry Metrics Ribbon with Animated Stats */}
        <MetricsRibbon />

        {/* 5. Asymmetric Bento Grid of Core Capabilities */}
        <FeaturesBento />

        {/* 6. 4-Phase Developer Lifecycle Workflow */}
        <WorkflowTabs />

        {/* 7. Technical & Operational FAQ with Categories */}
        <FaqSection />

        {/* 8. Actionable Onboarding Terminal (5-state verified) */}
        <CtaSection />
      </main>

      {/* Editorial Footer with system status */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
