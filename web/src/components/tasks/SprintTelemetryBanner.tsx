"use client";

import React from 'react';
import { Zap, Calendar, CheckCircle2, Clock, Plus, Flame } from 'lucide-react';
import type { SprintTelemetry } from '~/types';

interface SprintTelemetryBannerProps {
  telemetry: SprintTelemetry;
  onOpenNewTask?: () => void;
  className?: string;
}

export const SprintTelemetryBanner: React.FC<SprintTelemetryBannerProps> = ({
  telemetry,
  onOpenNewTask,
  className = '',
}) => {
  const isComplete = telemetry.totalTasks > 0 && telemetry.completedTasks === telemetry.totalTasks;
  const isEmpty = telemetry.totalTasks === 0;

  return (
    <div 
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all ${className}`}
      role="region"
      aria-label="Active Sprint Telemetry"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Sprint Title & Urgency */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              <Zap className="w-3 h-3 text-blue-600 fill-blue-600" />
              Active Sprint
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Ends {telemetry.targetDate}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              telemetry.daysRemaining <= 3 
                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              <Clock className="w-3 h-3" />
              {telemetry.daysRemaining} days left
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            {telemetry.name}
            {isComplete && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All tasks completed
              </span>
            )}
          </h3>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:justify-end">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{telemetry.velocityPercentage}% Velocity</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {telemetry.completedTasks} of {telemetry.totalTasks} tasks finished
            </span>
          </div>

          {onOpenNewTask && (
            <button
              type="button"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Sprint</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-Tone Burndown Progress Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Sprint Burndown Progress</span>
          <span className="font-mono text-slate-700">{telemetry.completedTasks} / {telemetry.totalTasks}</span>
        </div>
        <div 
          className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex"
          role="progressbar"
          aria-valuenow={telemetry.velocityPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Sprint progress: ${telemetry.velocityPercentage}%`}
        >
          <div 
            className={`h-full transition-all duration-500 ${
              isComplete ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${telemetry.velocityPercentage}%` }}
          />
        </div>
      </div>

      {/* Empty State Fallback (Tier 3 Anti-Slop) */}
      {isEmpty && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Sprint scope is currently empty. Add or groom tasks into this sprint.
          </p>
        </div>
      )}
    </div>
  );
};
