"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal, useLocomotiveCards } from "~/hooks/useParallax";

interface FaqItem {
  id: string;
  category: "all" | "architecture" | "git" | "pricing";
  q: string;
  a: string;
}

export const FaqSection: React.FC = () => {
  const { ref, isRevealed } = useScrollReveal(0.12);
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const [activeCategory, setActiveCategory] = useState<"all" | "architecture" | "git" | "pricing">("all");
  const cardsRef = useLocomotiveCards(0.1, [activeCategory]);

  const faqs: FaqItem[] = [
    {
      id: "faq-1",
      category: "architecture",
      q: "How does Projectio achieve sub-40ms interaction latencies?",
      a: "Projectio is built from first principles with zero bloated legacy webviews or client-side telemetry overhead. State transitions, board sorting, and modal drawers execute with optimistic client updates and resilient WebSocket event syncing, delivering instant feedback on every keystroke and click.",
    },
    {
      id: "faq-2",
      category: "git",
      q: "Can we connect private Git branches, pull requests, and multi-repo architectures?",
      a: "Yes. Every task in Projectio natively attaches to Git branches, commit SHAs, and active pull requests. When a PR is approved and merged into your production branch, Projectio automatically updates task status, timestamps the release, and adjusts your sprint burndown pacing.",
    },
    {
      id: "faq-3",
      category: "git",
      q: "How does Projectio handle role-based access control (RBAC) and team permissions?",
      a: "Projectio provides granular workspace isolation. Administrators can assign scoped roles (Owner, Lead, Maintainer, Contributor, Guest) per workspace. Workspace data, documents, and sprint roadmaps are strictly partitioned to ensure sensitive platform code remains secure.",
    },
    {
      id: "faq-4",
      category: "architecture",
      q: "Can our team migrate from Jira, Linear, or GitHub Issues without losing history?",
      a: "Yes. Projectio includes one-click native import tools for Jira CSVs, Linear workspaces, and GitHub Issues. We preserve existing issue keys, markdown descriptions, assignee tags, and priority labels so your team doesn't skip a beat.",
    },
    {
      id: "faq-5",
      category: "pricing",
      q: "What is the pricing model for early-stage engineering teams?",
      a: "Projectio provides a comprehensive free tier for teams up to 20 members, including unlimited public and private projects, full Kanban views, ⌘K command palette, and standard Git linking. Enterprise tier plans add dedicated SAML/SSO enforcement, custom audit exports, and 99.99% SLA guarantees.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const toggle = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section
      id="faq"
      ref={ref}
      className={`w-full py-20 parallax-reveal ${
        isRevealed ? "is-revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
          Frequently Asked Questions
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
          Clear answers to common engineering questions.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Everything you need to know about adopting Projectio for your engineering org.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Questions
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("architecture")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === "architecture"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Architecture &amp; Speed
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("git")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === "git"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Git &amp; Security
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("pricing")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === "pricing"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Pricing &amp; Migration
          </button>
        </div>
      </div>

      {/* Accordion List with Locomotive Scroll Card Transition */}
      <div ref={cardsRef} className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openFaq === faq.id;
          const delayClass = `loco-delay-${(idx % 4) + 1}`;
          return (
            <div
              key={faq.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-all duration-200 loco-card ${delayClass}`}
            >
              <button
                type="button"
                id={`accordion-btn-${faq.id}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${faq.id}`}
                onClick={() => toggle(faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span>{faq.q}</span>
                <span
                  className={`p-1 rounded-md text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div
                  id={`accordion-panel-${faq.id}`}
                  role="region"
                  aria-labelledby={`accordion-btn-${faq.id}`}
                  className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-scale-in"
                >
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
      </div>
    </section>
  );
};
