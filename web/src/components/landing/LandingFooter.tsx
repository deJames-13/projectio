"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "~/contexts/ThemeContext";
import { useAuth } from "~/contexts/AuthContext";

export const LandingFooter: React.FC = () => {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-slate-100 dark:border-slate-850">
          {/* Brand & System Status */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center h-8 py-0.5">
                <Image
                  src={isDark ? "/images/title-light-500.png" : "/images/title-dark-500.png"}
                  alt="Projectio"
                  width={114}
                  height={35}
                  className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              High-performance project management engineered for technical product teams that value speed and precision.
            </p>

            {/* Live Operational Health Status */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse-live" />
              <span>All Systems Operational (99.99%)</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#interactive-demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Interactive Demo
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Git &amp; PR Traceability
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sprint Workflow
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & Reliability */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                  Sub-40ms P99 Latency
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                  Bi-directional Event Streaming
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                  Role-Based Access Control
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                  SOC2 Compliance Posture
                </span>
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts Quick Reference */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Speed Navigation
            </h4>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <div className="flex items-center justify-between">
                <span>Command palette</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-sans">
                  ⌘K
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Create task</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-sans">
                  N
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Navigate items</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-sans">
                  J / K
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Quick filter</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-sans">
                  /
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} Projectio Technologies Inc. All rights reserved. Built with precision.
          </div>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <Link href="/dashboard" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
