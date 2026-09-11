"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Kanban,
  BarChart3,
  GitBranch,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCommit,
  Check,
  X,
  Plus,
  AlertCircle
} from "lucide-react";
import { useTheme } from "~/contexts/ThemeContext";
import { useScrollReveal } from "~/hooks/useParallax";

interface MockTask {
  id: string;
  title: string;
  category: string;
  points: number;
  priority: "urgent" | "high" | "medium";
  branch: string;
  assignee: { name: string; initials: string; bg: string };
  column: "backlog" | "in_flight" | "review" | "done";
}

export const InteractiveProductShowcase: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, isRevealed } = useScrollReveal(0.1);

  const [activeTab, setActiveTab] = useState<"kanban" | "telemetry" | "spec">("kanban");
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<MockTask[]>([
    {
      id: "PROJ-104",
      title: "Implement SAML 2.0 & Okta Enterprise SSO",
      category: "Security",
      points: 8,
      priority: "urgent",
      branch: "feat/sso-saml-auth",
      assignee: { name: "Sarah Chen", initials: "SC", bg: "bg-blue-600" },
      column: "in_flight",
    },
    {
      id: "PROJ-109",
      title: "WebSocket reconnect backoff & message deduplication",
      category: "Realtime",
      points: 5,
      priority: "high",
      branch: "fix/ws-backoff-jitter",
      assignee: { name: "Marcus Vance", initials: "MV", bg: "bg-emerald-600" },
      column: "review",
    },
    {
      id: "PROJ-112",
      title: "Global ⌘K command palette keyboard navigation",
      category: "UX Core",
      points: 3,
      priority: "medium",
      branch: "feat/command-palette",
      assignee: { name: "Aria Thorne", initials: "AT", bg: "bg-purple-600" },
      column: "done",
    },
    {
      id: "PROJ-115",
      title: "Prisma connection pool saturation telemetry alerts",
      category: "Infra",
      points: 5,
      priority: "high",
      branch: "perf/db-pool-metrics",
      assignee: { name: "Kenji Sato", initials: "KS", bg: "bg-amber-600" },
      column: "backlog",
    },
    {
      id: "PROJ-118",
      title: "Design tokens synchronization for Dark Mode v2",
      category: "Design System",
      points: 3,
      priority: "medium",
      branch: "style/theme-tokens-v2",
      assignee: { name: "Elena Rostova", initials: "ER", bg: "bg-rose-600" },
      column: "backlog",
    },
  ]);

  const [specChecklist, setSpecChecklist] = useState<{ id: number; text: string; done: boolean }[]>([
    { id: 1, text: "Parse and validate SP entity ID from identity provider metadata XML", done: true },
    { id: 2, text: "Enforce SHA-256 assertion signature verification", done: true },
    { id: 3, text: "Implement JIT (Just-In-Time) user provisioning in database", done: true },
    { id: 4, text: "Session expiration revocation via backchannel logout endpoint", done: false },
    { id: 5, text: "Audit log emission for every authorization claim match", done: false },
  ]);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Advance task to next status
  const advanceTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCol: Record<MockTask["column"], MockTask["column"]> = {
          backlog: "in_flight",
          in_flight: "review",
          review: "done",
          done: "backlog",
        };
        const next = nextCol[t.column];
        setActionFeedback(`Updated ${t.id} → ${next.replace("_", " ")}`);
        setTimeout(() => setActionFeedback(null), 2500);
        return { ...t, column: next };
      })
    );
  };

  const toggleChecklist = (id: number) => {
    setSpecChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // Calculate sprint completion
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const donePoints = tasks.filter((t) => t.column === "done").reduce((sum, t) => sum + t.points, 0);
  const completionPercentage = Math.round((donePoints / totalPoints) * 100);

  // Command palette commands
  const commands = [
    { title: "Switch view: Kanban Board", action: () => setActiveTab("kanban"), icon: Kanban },
    { title: "Switch view: Velocity Telemetry", action: () => setActiveTab("telemetry"), icon: BarChart3 },
    { title: "Switch view: Git Branch Spec Drawer", action: () => setActiveTab("spec"), icon: GitBranch },
    { title: "Create new engineering task (N)", action: () => advanceTask("PROJ-115"), icon: Plus },
    {
      title: "Filter by active sprint: Sprint 28",
      action: () => {
        setActionFeedback("Filtered view to Sprint 28");
        setTimeout(() => setActionFeedback(null), 2500);
      },
      icon: Clock,
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section
      id="interactive-demo"
      ref={ref}
      className={`relative w-full pt-8 pb-16 parallax-reveal ${
        isRevealed ? "is-revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workspace Frame Container */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-colors duration-200">
        {/* Frame Window Header */}
        <div className="bg-slate-100/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Window dots & workspace identity with theme-sensitive logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Image
                  src={isDark ? "/images/logo-light-500.png" : "/images/logo-dark-500.png"}
                  alt="Projectio emblem"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Projectio Workspace</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Core-Platform · Sprint 28</span>
            </div>
          </div>

          {/* Search bar simulation trigger */}
          <button
            type="button"
            onClick={() => setCmdPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 text-xs font-mono shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Open command palette"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search or jump to...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-600 dark:text-slate-300 font-sans">
              ⌘K
            </kbd>
          </button>

          {/* View Tab Switcher */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "kanban"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "telemetry"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Velocity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("spec")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "spec"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Git &amp; Specs</span>
            </button>
          </div>
        </div>

        {/* Live Action Toast Banner */}
        {actionFeedback && (
          <div className="bg-blue-50 dark:bg-blue-950/60 border-b border-blue-100 dark:border-blue-900/60 px-6 py-2 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 font-medium animate-fade-in-up">
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{actionFeedback}</span>
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">Live state updated</span>
          </div>
        )}

        {/* Live Tab View Content */}
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 min-h-[420px]">
          {/* TAB 1: KANBAN BOARD VIEW */}
          {activeTab === "kanban" && (
            <div className="space-y-4 animate-scale-in">
              {/* Sprint Telemetry Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sprint 28 Progress</span>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{completionPercentage}% Complete</span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Pacing +4d ahead
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 max-w-xs min-w-[160px]">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span>{donePoints} of {totalPoints} pts burned</span>
                    <span>5 days remaining</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse-live" />
                    Interactive: Click any card to advance stage
                  </span>
                </div>
              </div>

              {/* Columns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Backlog Column */}
                <div className="bg-slate-100/70 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[280px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Backlog</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {tasks.filter((t) => t.column === "backlog").length}
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {tasks
                      .filter((t) => t.column === "backlog")
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => advanceTask(task.id)}
                          className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">{task.id}</span>
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {task.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{task.points} pts</span>
                            <div className={`w-5 h-5 rounded-full ${task.assignee.bg} text-white font-bold text-[9px] flex items-center justify-center`}>
                              {task.assignee.initials}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* In Flight Column */}
                <div className="bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200/60 dark:border-blue-900/50 flex flex-col min-h-[280px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/50 dark:border-blue-900/50">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">In Flight</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {tasks.filter((t) => t.column === "in_flight").length}
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {tasks
                      .filter((t) => t.column === "in_flight")
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => advanceTask(task.id)}
                          className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-blue-300 dark:border-blue-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">{task.id}</span>
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              Active
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          <div className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                            <GitBranch className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{task.branch}</span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{task.points} pts</span>
                            <div className={`w-5 h-5 rounded-full ${task.assignee.bg} text-white font-bold text-[9px] flex items-center justify-center`}>
                              {task.assignee.initials}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Review Column */}
                <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/60 dark:border-amber-900/50 flex flex-col min-h-[280px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/50 dark:border-amber-900/50">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">Review</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      {tasks.filter((t) => t.column === "review").length}
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {tasks
                      .filter((t) => t.column === "review")
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => advanceTask(task.id)}
                          className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-amber-200 dark:border-amber-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-mono font-medium text-amber-700 dark:text-amber-400">{task.id}</span>
                            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                              PR Pending
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          <div className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                            <GitCommit className="w-3 h-3 text-slate-400" />
                            <span className="truncate">2 of 2 Approvals</span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{task.points} pts</span>
                            <div className={`w-5 h-5 rounded-full ${task.assignee.bg} text-white font-bold text-[9px] flex items-center justify-center`}>
                              {task.assignee.initials}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Done Column */}
                <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-200/60 dark:border-emerald-900/50 flex flex-col min-h-[280px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/50 dark:border-emerald-900/50">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Done</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {tasks.filter((t) => t.column === "done").length}
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {tasks
                      .filter((t) => t.column === "done")
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => advanceTask(task.id)}
                          className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400">{task.id}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-through group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{task.points} pts</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Shipped to Prod</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPRINT VELOCITY TELEMETRY */}
          {activeTab === "telemetry" && (
            <div className="space-y-4 animate-scale-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">P95 Cycle Time</span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">1.8 Days</div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">↓ 32% faster than last cycle</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sprint Throughput</span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">42 Story Points</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">98.5% estimation accuracy</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">PR Merge Latency</span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">4.2 Hours</div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Zero blocking review queues</p>
                </div>
              </div>

              {/* Visualized Burndown Curve */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sprint Burndown Telemetry</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Actual burn curve vs. ideal burn path</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="w-2.5 h-0.5 bg-slate-300 dark:bg-slate-700 inline-block" /> Ideal
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                      <span className="w-2.5 h-1 bg-blue-600 dark:bg-blue-400 rounded inline-block" /> Actual
                    </span>
                  </div>
                </div>

                {/* SVG Burndown graphic */}
                <div className="h-40 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="1" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="1" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="1" />

                    {/* Ideal trajectory (dashed) */}
                    <line x1="20" y1="10" x2="480" y2="110" stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* Actual trajectory curve */}
                    <path
                      d="M 20 10 Q 120 25, 200 45 T 350 85 T 480 105"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                    />

                    {/* Current point highlight */}
                    <circle cx="350" cy="85" r="5" fill="#3b82f6" className="animate-pulse-live" />
                  </svg>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                    <span>Day 1 (Kickoff)</span>
                    <span>Day 5</span>
                    <span>Day 10 (Today)</span>
                    <span>Day 14 (Release)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GIT & SPEC DRAWER */}
          {activeTab === "spec" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5 animate-scale-in">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      PROJ-104
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Security Architecture</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Implement SAML 2.0 &amp; Okta Enterprise SSO
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CI/CD Passed</span>
                  </span>
                </div>
              </div>

              {/* Linked Git Branch Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-mono text-slate-700 dark:text-slate-300">
                  <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">feat/sso-saml-auth</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400">commit 7f3b89e</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>+312 / -45 lines</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold">PR #48 open</span>
                </div>
              </div>

              {/* Interactive Specification Acceptance Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Specification Acceptance Criteria
                </h4>
                <div className="space-y-2">
                  {specChecklist.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                          item.done
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400"
                        }`}
                      >
                        {item.done && <Check className="w-3 h-3" />}
                      </div>
                      <span className={item.done ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200 font-medium"}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Interactive Command Palette Modal Simulation */}
      {cmdPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search sprint items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setCmdPaletteOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        cmd.action();
                        setCmdPaletteOpen(false);
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer group"
                    >
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 font-medium">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span>{cmd.title}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p>No commands found for &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-blue-600 dark:text-blue-400 hover:underline mt-1 font-semibold"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>Navigate with keyboard or click</span>
              <span>ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
