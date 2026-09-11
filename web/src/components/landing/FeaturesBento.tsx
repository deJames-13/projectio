"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Command,
  TrendingUp,
  Shield,
  CheckCircle2,
  GitCommit,
  ArrowRight,
  Lock,
  Layers
} from "lucide-react";
import { useScrollReveal, useLocomotiveCards } from "~/hooks/useParallax";

export const FeaturesBento: React.FC = () => {
  const { ref, isRevealed } = useScrollReveal(0.12);
  const cardsContainerRef = useLocomotiveCards(0.1);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  const shortcuts = [
    { key: "⌘K", name: "Command Palette", desc: "Open global workspace search and switcher" },
    { key: "N", name: "New Task", desc: "Quick-create task modal in any view" },
    { key: "J / K", name: "Navigate Tasks", desc: "Move selection up or down the board list" },
    { key: "X", name: "Mark Complete", desc: "Instantly toggle task status to Done" },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className={`w-full py-20 parallax-reveal ${
        isRevealed ? "is-revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
          Engineered Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
          Everything high-velocity engineering teams need. Nothing they don&apos;t.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          We audited legacy issue trackers and stripped away hundreds of unnecessary fields and slow menus. What remains is pure, responsive speed.
        </p>
      </div>

      {/* Bento Grid with Locomotive Scroll Card Detection */}
      <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Git Branch Traceability (Span 2 cols on md+) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all loco-card loco-delay-1">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center mb-5">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">Traceability</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Zero context switching</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Bi-Directional Git &amp; Pull Request Linking
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl leading-relaxed">
              Every task links directly to its Git branch and PR status. When your PR merges into main, Projectio automatically moves the ticket to Done and updates your burndown metrics.
            </p>
          </div>

          {/* Interactive Git Workflow Graphic */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Repository: projectio/core</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                PR #48 Merged
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                  P
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">feat/sso-saml-auth</span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Closed task PROJ-104 automatically</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 2 Reviews Passed
                </span>
                <span>4 commits</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Command Palette Shortcuts (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all loco-card loco-delay-2">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-5">
              <Command className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">Keyboard First</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ⌘K Command Palette
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Navigate your entire workspace without ever lifting your hands from the keyboard.
            </p>
          </div>

          {/* Shortcut Keys List */}
          <div className="mt-6 space-y-2">
            {shortcuts.map((sc) => (
              <button
                key={sc.key}
                type="button"
                onClick={() => setActiveShortcut(sc.name)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  activeShortcut === sc.name
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                    {sc.key}
                  </kbd>
                  <span className="text-xs font-semibold">{sc.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        {/* CARD 3: Sprint Burndown & Velocity Telemetry (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all loco-card loco-delay-3">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center mb-5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">Sprint Health</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Automated Velocity Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Real-time sprint pacing without manual spreadsheets. Projectio computes cycle times, story point burns, and blocker delays dynamically.
            </p>
          </div>

          {/* Telemetry Indicator */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Sprint Completion</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">84% (+2d)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full w-5/6" />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Planned: 42 pts</span>
              <span>Burned: 35 pts</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Enterprise RBAC & Workspace Partitions (Span 2 cols on md+) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all loco-card loco-delay-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 flex items-center justify-center mb-5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">Security &amp; Governance</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Enterprise Ready</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Role-Based Access Control &amp; Isolated Workspaces
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl leading-relaxed">
              Partition teams into dedicated workspaces with fine-grained RBAC permissions. Enforce SSO, track audit log records, and protect mission-critical repositories.
            </p>
          </div>

          {/* Security Permissions Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>SSO &amp; SAML 2.0</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Enforce Okta, Azure AD, or Google Workspace identity auth.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Workspace Silos</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Separate customer-facing work from internal platform code.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>SOC2 Compliant</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Granular immutable audit logs for all configuration events.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
