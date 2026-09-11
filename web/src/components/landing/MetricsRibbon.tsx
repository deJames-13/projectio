"use client";

import React, { useState, useEffect } from "react";
import { useScrollReveal } from "~/hooks/useParallax";

export const MetricsRibbon: React.FC = () => {
  const { ref, isRevealed } = useScrollReveal(0.2);

  // Animated values
  const [latency, setLatency] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [navigable, setNavigable] = useState(0);

  useEffect(() => {
    if (!isRevealed) return;

    // Smooth eased count-up duration: 1200ms
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic formula: 1 - Math.pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setLatency(Math.round(easeOut * 35));
      setUptime(Number((easeOut * 99.99).toFixed(2)));
      setNavigable(Math.round(easeOut * 100));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isRevealed]);

  const metrics = [
    {
      value: `<${latency}ms`,
      label: "P99 UI Latency",
      detail: "Client-side state transitions with zero webview overhead",
      barPercent: isRevealed ? "92%" : "0%",
    },
    {
      value: `${uptime}%`,
      label: "System Availability",
      detail: "Resilient real-time event streaming and data persistence",
      barPercent: isRevealed ? "99%" : "0%",
    },
    {
      value: `${navigable}%`,
      label: "Keyboard Navigable",
      detail: "Full ⌘K command palette, task triage, and quick drawers",
      barPercent: isRevealed ? "100%" : "0%",
    },
    {
      value: "0 Bloat",
      label: "Focused Architecture",
      detail: "Engineered from first principles with zero legacy configuration drag",
      barPercent: isRevealed ? "88%" : "0%",
    },
  ];

  return (
    <section
      ref={ref}
      className={`w-full py-12 parallax-reveal ${
        isRevealed ? "is-revealed" : ""
      }`}
      aria-label="Performance Metrics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 lg:p-8 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col loco-card loco-delay-${idx + 1} ${
                idx > 0 ? "pt-6 sm:pt-0 sm:pl-6 lg:pl-8" : ""
              }`}
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {item.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-2 font-mono">
                {item.label}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {item.detail}
              </p>

              {/* Animated filling telemetry bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: item.barPercent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
};
