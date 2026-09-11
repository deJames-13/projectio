"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Kanban, 
  Layers, 
  Zap, 
  Command, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Check,
  LayoutDashboard
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const faqs = [
    {
      q: 'How does Projectio streamline team sprint management?',
      a: 'Projectio delivers a clean, high-performance interface with zero friction. You get interactive Kanban boards, sprint burndown telemetry, quick command palettes (⌘K), and instant task drawers without the slow bloat of legacy tools.'
    },
    {
      q: 'Can we connect Git branches and technical specifications?',
      a: 'Yes. Every task supports native Git branch tracking (e.g. feat/sso-oauth), dependency blockers, and full markdown specification notes.'
    },
    {
      q: 'Is Projectio suitable for growing engineering and design teams?',
      a: 'Absolutely. Projectio scales seamlessly with flexible workspaces, role-based access control (RBAC), and team-level initiative tracking.'
    },
    {
      q: 'What is the pricing model?',
      a: 'Projectio is currently available with a generous free tier for teams up to 20 members, including all core features and unlimited projects.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setEmail('');
    }, 4000);
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Projectio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600" aria-label="Landing Navigation">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-slate-900 transition-colors">Solutions</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Release Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Projectio 2.0 Enterprise Release</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Project management engineered for speed, clarity, and precision.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Streamline your product lifecycle with fast keyboard navigation, interactive Kanban boards, automated sprint velocity tracking, and centralized documentation.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all shadow-2xs text-center"
          >
            Explore Features
          </a>
        </div>

        {/* Interactive App Mockup Preview */}
        <div className="mt-14 relative max-w-5xl mx-auto bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-slate-200 text-left">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-semibold text-slate-500 ml-2">Executive Dashboard Preview</span>
            </div>
            <Link 
              href="/register"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 focus:outline-none focus-visible:underline"
            >
              <span>Try It Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500">Sprint Velocity</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">On Track</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">68% Completed</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full w-2/3"></div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500">Active Initiatives</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">3 Projects</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">24 Tasks Active</div>
              <p className="text-xs text-slate-500 mt-1">Design System &amp; Q3 Launch</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500">Next Milestone</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Oct 26</span>
              </div>
              <div className="text-xl font-bold text-slate-900 truncate">Design Freeze V2</div>
              <p className="text-xs text-slate-500 mt-1">Led by Sarah Chen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Features &amp; Capabilities</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Everything your team needs to deliver on time.
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Built for engineering and product teams that demand focus, speed, and real-time execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Interactive Kanban &amp; List Views</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seamlessly switch between visual Kanban boards and dense table lists. Update task status with 1-click controls.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Command className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">⌘K Global Command Palette</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Navigate anywhere in seconds. Jump to tasks, switch projects, search documents, or create items entirely from the keyboard.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Task Drawers &amp; Git Linking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Slide out complete task specifications, Git branch attachments, dependency blockers, and discussions without losing context.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions / Highlights Bento */}
      <section id="solutions" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-4 lg:p-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Enterprise Performance</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Built from first principles for modern agile teams.
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              We eliminated the clutter of legacy issue trackers. Projectio delivers a fast, responsive interface with clear accountability, automated milestone pacing, and clean typography.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-extrabold text-slate-900">99.9%</div>
                <div className="text-xs text-slate-500 mt-0.5">Uptime reliability</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-extrabold text-blue-600">&lt;50ms</div>
                <div className="text-xs text-slate-500 mt-0.5">Instant UI response</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Enterprise Standards</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero configuration required to start tracking sprints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>TypeScript tokenized with high-contrast WCAG AA standards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated sprint burndown trajectories &amp; milestone tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-1">Everything you need to know about getting started with Projectio.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact / Newsletter Section */}
      <section id="contact" className="py-16 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-lg">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Get Started</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Ready to optimize your sprint delivery?</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Join engineering and product teams delivering faster with Projectio.
          </p>

          <form onSubmit={handleContactSubmit} className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <label htmlFor="contact-email" className="sr-only">Work email</label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Get Started</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {contactSubmitted && (
            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center justify-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> You&apos;re registered! Check your email for workspace access.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-bold text-slate-900">Projectio</span>
            <span>© {new Date().getFullYear()} Projectio Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
