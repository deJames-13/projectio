"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastProps {
  type?: ToastType;
  title?: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = "error",
  title,
  message,
  onClose,
  duration = 6000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />,
  };

  const borders = {
    error: "border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 ring-1 ring-rose-500/10",
    success: "border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 ring-1 ring-emerald-500/10",
    warning: "border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 ring-1 ring-amber-500/10",
    info: "border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 ring-1 ring-blue-500/10",
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-auto min-w-[320px] p-4 rounded-xl border shadow-xl ${borders[type]} animate-in fade-in slide-in-from-top-4 duration-200 transition-all`}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1 min-w-0 pr-1">
          {title && (
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h4>
          )}
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
