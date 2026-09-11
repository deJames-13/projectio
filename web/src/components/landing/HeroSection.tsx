"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal, ShieldCheck, Zap, GitBranch } from "lucide-react";
import { useParallax } from "~/hooks/useParallax";
import { useAuth } from "~/contexts/AuthContext";

export const HeroSection: React.FC = () => {
  const parallaxOffset = useParallax(0.12);
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative w-full pt-12 sm:pt-16 pb-8 hero-glow-subtle overflow-hidden">
      {/* Parallax background subtle ambient depth layer */}
      <div
        className="absolute inset-0 pointer-events-none tech-grid-pattern opacity-40 dark:opacity-25"
        style={{
          transform: `translate3d(0, ${parallaxOffset}px, 0)`,
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-2xs hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Sprint Engine 2.4
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>Zero-latency agile orchestration</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
          Project management engineered for speed, clarity, and precision.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed">
          Eliminate sprint friction. Unify interactive Kanban boards, automated velocity telemetry, Git branch linking, and markdown specifications in one ultra-fast interface.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 max-w-md mx-auto">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all active:scale-98 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 group"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all active:scale-98 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <a
            href="#interactive-demo"
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg font-semibold text-sm transition-all shadow-2xs text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Try Interactive Demo
          </a>
        </div>

        {/* Trust & Architecture Telemetry Row */}
        <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Sub-40ms UI response</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Bi-directional Git branches</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>100% Keyboard navigable (⌘K)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WCAG AA High-Contrast</span>
          </div>
        </div>
      </div>
    </section>
  );
};
