"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useScrollReveal, useLocomotiveCards } from "~/hooks/useParallax";

export const WorkflowTabs: React.FC = () => {
  const { ref, isRevealed } = useScrollReveal(0.12);
  const cardsRef = useLocomotiveCards(0.1);
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: "01",
      title: "Plan & Scope",
      subtitle: "Backlog grooming with zero friction",
      description:
        "Triage incoming requests into sprints with keyboard shortcuts. Set Fibonacci story points, define dependencies, and visualize sprint capacity limits before locking the sprint.",
      badges: ["Story point sizing", "Dependency blockers", "Sprint capacity"],
      preview: {
        headline: "Sprint 28 Planning Workspace",
        meta: "14 Engineers · 48 Story Points Committed",
        items: [
          { label: "PROJ-120: Auth token refresh race condition", pts: "3 pts", status: "Scoped" },
          { label: "PROJ-121: Redis connection failover strategy", pts: "5 pts", status: "Scoped" },
          { label: "PROJ-124: Audit log CSV export stream", pts: "2 pts", status: "Ready" },
        ],
      },
    },
    {
      id: "02",
      title: "Execute & Triage",
      subtitle: "Real-time, zero-lag task tracking",
      description:
        "Engineers work inside clean Kanban boards and table views. Update statuses with one keystroke, expand markdown specification drawers, and track active blockers without waiting on bloated webviews.",
      badges: ["<40ms response", "Interactive Kanban", "Full spec drawers"],
      preview: {
        headline: "Active Sprint Board",
        meta: "8 In-Flight · 4 Review · 18 Done",
        items: [
          { label: "PROJ-104: Implement SAML 2.0 Okta SSO", pts: "8 pts", status: "In Flight" },
          { label: "PROJ-109: WebSocket reconnect backoff", pts: "5 pts", status: "In Review" },
          { label: "PROJ-112: Global ⌘K command palette", pts: "3 pts", status: "Done" },
        ],
      },
    },
    {
      id: "03",
      title: "Verify & Review",
      subtitle: "Native Git branch and PR linkage",
      description:
        "Say goodbye to manual ticket updates. Pull requests automatically update task statuses, link reviewer approvals, and notify stakeholders directly on commit merges.",
      badges: ["Branch tracking", "CI/CD indicators", "Auto PR closing"],
      preview: {
        headline: "Git Integration Telemetry",
        meta: "Repository projectio/web · 3 Active Branches",
        items: [
          { label: "feat/sso-saml-auth → main (2 approvals)", pts: "PR #48", status: "CI Passed" },
          { label: "fix/ws-backoff-jitter → main (1 approval)", pts: "PR #51", status: "Testing" },
          { label: "feat/command-palette → main (Merged)", pts: "PR #42", status: "Shipped" },
        ],
      },
    },
    {
      id: "04",
      title: "Retrospect & Pace",
      subtitle: "Automated burndown and velocity insights",
      description:
        "Every sprint ends with auto-generated velocity insights. View your team's historical completion rate, identify recurring blocker bottlenecks, and calibrate future sprint commitments.",
      badges: ["Cycle time analytics", "Burndown charts", "Blocker retrospectives"],
      preview: {
        headline: "Sprint Retrospective & Velocity",
        meta: "Velocity: 42 pts/sprint · Cycle time: 1.8 days",
        items: [
          { label: "Historical throughput pacing: +14% vs Q2", pts: "98.5%", status: "On Pace" },
          { label: "Review queue latency dropped from 8h → 4.2h", pts: "-47%", status: "Optimized" },
          { label: "Zero unverified blockers carried over", pts: "100%", status: "Resolved" },
        ],
      },
    },
  ];

  const current = steps[activeStep]!;

  return (
    <section
      id="workflow"
      ref={ref}
      className={`w-full py-20 parallax-reveal ${
        isRevealed ? "is-revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
          End-to-End Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
          Engineered for every stage of your delivery cycle.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          From initial backlog scoping to production deployments, Projectio provides an uninterrupted flow for technical product teams.
        </p>
      </div>

      {/* Interactive Workflow Layout */}
      <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Step Selector Buttons (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer loco-card loco-delay-${idx + 1} ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-md ring-1 ring-blue-600/20"
                    : "bg-white/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span
                    className={`text-base font-bold ${
                      isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-9 leading-relaxed">
                  {step.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm animate-scale-in loco-card loco-delay-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Phase {current.id}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{current.title}</h3>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Projectio Telemetry</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            {current.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {current.badges.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{b}</span>
              </span>
            ))}
          </div>

          {/* Simulated Interface Preview Panel */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/70 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">{current.preview.headline}</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{current.preview.meta}</span>
            </div>

            <div className="space-y-2">
              {current.preview.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {item.pts}
                    </span>
                    <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
