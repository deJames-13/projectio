"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useScrollReveal } from "~/hooks/useParallax";

type FormState = "initial" | "loading" | "empty_error" | "server_error" | "success";

export const CtaSection: React.FC = () => {
  const { ref, isRevealed } = useScrollReveal(0.12);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormState>("initial");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check Empty State
    if (!email.trim()) {
      setStatus("empty_error");
      setErrorMessage("Please provide your work email to claim your workspace.");
      return;
    }

    // 2. Validate email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("empty_error");
      setErrorMessage("Please enter a valid work email address (e.g. name@company.com).");
      return;
    }

    // Simulate Server Error test scenario (e.g. error@test.com)
    if (email.includes("error@")) {
      setStatus("loading");
      setTimeout(() => {
        setStatus("server_error");
        setErrorMessage("Organization domain could not be verified. Please check for typos and try again.");
      }, 700);
      return;
    }

    // 3. Loading State
    setStatus("loading");

    // 4. Success State after short simulated async call
    setTimeout(() => {
      setStatus("success");
    }, 1100);
  };

  const handleReset = () => {
    setEmail("");
    setStatus("initial");
    setErrorMessage("");
  };

  return (
    <section
      id="contact"
      ref={ref}
      className={`w-full py-20 text-center parallax-reveal ${
        isRevealed ? "is-revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-14 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-all duration-500 loco-card ${
            isRevealed ? "is-inview" : ""
          }`}
        >
        {/* Subtle decorative technical grid background */}
        <div className="absolute inset-0 tech-grid-pattern opacity-40 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Instant Cloud Provisioning</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to accelerate your engineering velocity?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            Join hundreds of high-performing teams tracking sprints, linking Git branches, and shipping with precision on Projectio.
          </p>

          {/* 5-STATE FORM IMPLEMENTATION */}
          <div className="mt-8 max-w-md mx-auto">
            {/* SUCCESS STATE */}
            {status === "success" ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Reserved!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  We sent a confirmation invite to <strong className="font-semibold text-slate-900 dark:text-white">{email}</strong>.
                  Click the link in your email to launch your team board.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Go to Login
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    Provision Another Workspace
                  </button>
                </div>
              </div>
            ) : (
              /* INITIAL, LOADING, EMPTY, & ERROR STATES */
              <form onSubmit={handleSubmit} noValidate className="space-y-3 text-left">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <label htmlFor="cta-work-email" className="sr-only">
                      Work Email Address
                    </label>
                    <input
                      id="cta-work-email"
                      type="email"
                      value={email}
                      disabled={status === "loading"}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "empty_error" || status === "server_error") {
                          setStatus("initial");
                          setErrorMessage("");
                        }
                      }}
                      placeholder="Enter work email (e.g. dev@company.com)..."
                      className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all ${
                        status === "empty_error" || status === "server_error"
                          ? "border-rose-300 dark:border-rose-700 ring-1 ring-rose-300 dark:ring-rose-700 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500"
                          : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600"
                      } ${status === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-98 shrink-0 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                      status === "loading" ? "opacity-75 cursor-wait" : "cursor-pointer"
                    }`}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Provisioning...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* ERROR STATE FEEDBACK */}
                {(status === "empty_error" || status === "server_error") && (
                  <div
                    role="alert"
                    className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-fade-in-up"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{errorMessage}</p>
                      {status === "server_error" && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatus("initial");
                            setErrorMessage("");
                          }}
                          className="mt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry with a different email</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  No credit card required. Includes 20 seats and unlimited projects on our generous free tier.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
