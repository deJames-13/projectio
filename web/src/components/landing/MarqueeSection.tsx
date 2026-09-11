"use client";

import React from "react";
import {
  GitBranch,
  Terminal,
  Shield,
  Layers,
  Database,
  Cpu,
  Workflow,
  Lock,
  Code2,
  Boxes,
  Zap
} from "lucide-react";

interface TechTool {
  name: string;
  category: string;
  icon: React.ElementType;
}

export const MarqueeSection: React.FC = () => {
  const tools: TechTool[] = [
    { name: "GitHub Enterprise", category: "Version Control", icon: GitBranch },
    { name: "GitLab CI/CD", category: "Pipelines", icon: Workflow },
    { name: "Okta SAML 2.0", category: "Authentication", icon: Lock },
    { name: "Jira Cloud", category: "Bidirectional Sync", icon: Layers },
    { name: "Linear API", category: "Issue Import", icon: Zap },
    { name: "VS Code Extension", category: "Developer Tools", icon: Code2 },
    { name: "Kubernetes Engine", category: "Cloud Orchestration", icon: Boxes },
    { name: "PostgreSQL & Prisma", category: "Persistence", icon: Database },
    { name: "Slack Workspaces", category: "Notifications", icon: Terminal },
    { name: "SOC2 Compliance", category: "Governance", icon: Shield },
    { name: "tRPC & Next.js", category: "Typed Protocols", icon: Cpu },
  ];

  // Duplicate for seamless 100% infinite loop
  const duplicatedTools = [...tools, ...tools];

  return (
    <div className="relative w-full overflow-hidden py-6 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40 backdrop-blur-xs">
      {/* Left and Right Fade Gradient Masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 dark:from-[#0B0F17] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 dark:from-[#0B0F17] to-transparent z-10" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-4">
        {duplicatedTools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0 cursor-default group"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {tool.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
