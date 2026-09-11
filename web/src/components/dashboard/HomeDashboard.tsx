"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Check, 
  ChevronRight,
  Inbox,
  RefreshCw,
  Plus
} from 'lucide-react';
import { api } from '~/trpc/react';
import type { Task, ActivityItem, Milestone, Member } from '~/types';

interface HomeDashboardProps {
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onViewAllTasks: () => void;
  activities: ActivityItem[];
  milestones: Milestone[];
  currentUser: Member;
  onOpenNewTask?: () => void;
}

interface BurndownPointItem {
  dayIndex: number;
  dayNumber: number;
  date: string;
  idealRemaining: number;
  actualRemaining: number | null;
  completedCount: number;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Checks whether a task's dueTime falls within the current calendar week.
 */
function isTaskDueThisWeek(dueTimeStr?: string | null): boolean {
  if (!dueTimeStr || dueTimeStr === 'No date' || dueTimeStr === 'Scheduled' || dueTimeStr === '–') {
    return false;
  }
  const lower = dueTimeStr.toLowerCase().trim();
  if (lower.includes('today') || lower.includes('tomorrow')) return true;

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const parsed = new Date(dueTimeStr);
  if (!isNaN(parsed.getTime())) {
    return parsed >= startOfWeek && parsed <= endOfWeek;
  }
  const withYear = new Date(`${dueTimeStr}, ${now.getFullYear()}`);
  if (!isNaN(withYear.getTime())) {
    return withYear >= startOfWeek && withYear <= endOfWeek;
  }
  return false;
}

/**
 * Generates a smooth cubic bezier SVG path across coordinates.
 */
function getSmoothSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x.toFixed(1)} ${points[0]!.y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  tasks,
  onToggleTaskComplete,
  onSelectTask,
  onViewAllTasks,
  activities,
  milestones,
  currentUser,
  onOpenNewTask
}) => {
  const [activeFilter, setActiveFilter] = useState<'assigned' | 'due_week' | 'p0' | 'recent'>('assigned');
  const [hoveredPoint, setHoveredPoint] = useState<BurndownPointItem | null>(null);

  // Live real analytics queries from tRPC server
  const { 
    data: kpiData, 
    isLoading: isKpiLoading, 
    isError: isKpiError, 
    refetch: refetchKpi 
  } = api.analytics.getDashboardKPIs.useQuery(undefined, { 
    staleTime: 30000 
  });

  const { 
    data: burndownData, 
    isLoading: isBurndownLoading, 
    isError: isBurndownError, 
    refetch: refetchBurndown 
  } = api.analytics.getSprintBurndown.useQuery(undefined, { 
    staleTime: 30000 
  });

  // Filter tasks based on selected chip with strict criteria
  const filteredTasks = tasks
    .filter(task => {
      if (activeFilter === 'assigned') {
        return (
          task.assignee.id === currentUser.id ||
          task.assignee.email.toLowerCase() === currentUser.email.toLowerCase()
        );
      }
      if (activeFilter === 'due_week') {
        return isTaskDueThisWeek(task.dueTime);
      }
      if (activeFilter === 'p0') {
        return (
          task.priority === 'P0' || 
          task.priority === 'High' || 
          task.priorityLabel === 'P0' || 
          task.priorityLabel === 'High'
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (activeFilter === 'recent') {
        const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return timeB - timeA;
      }
      return 0;
    });

  // Derived metrics with server-first fallback to local workspace items
  const activeTasksCount = kpiData?.activeTasksCount ?? tasks.filter(t => !t.completed).length;
  const overdueCount = kpiData?.overdueCount ?? 0;
  const dueThisWeekCount = kpiData?.dueThisWeekCount ?? tasks.filter(t => isTaskDueThisWeek(t.dueTime)).length;
  const sprintProgress = kpiData?.sprintProgress ?? (tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0);

  // SVG dimensions for Sprint Burndown chart
  const svgWidth = 300;
  const svgHeight = 100;
  const padLeft = 14;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 16;
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const burndownPoints = burndownData?.points ?? [];
  const maxTasks = Math.max(1, burndownData?.totalTasks ?? 1);

  // Compute SVG coordinates for actual curve (days up to today)
  const actualSvgPoints = burndownPoints
    .filter(p => p.actualRemaining !== null)
    .map(p => {
      const x = padLeft + (p.dayIndex / 13) * chartWidth;
      const y = padTop + chartHeight - ((p.actualRemaining ?? 0) / maxTasks) * chartHeight;
      return { x, y, point: p };
    });

  const actualPathD = getSmoothSvgPath(actualSvgPoints);

  return (
    <div id="home-dashboard" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live telemetry and active sprint trajectory across your workspace today.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Task filters">
          <button
            id="filter-chip-assigned"
            onClick={() => setActiveFilter('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeFilter === 'assigned'
                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Assigned to me
          </button>

          <button
            id="filter-chip-due"
            onClick={() => setActiveFilter('due_week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeFilter === 'due_week'
                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Due this week
          </button>

          <button
            id="filter-chip-p0"
            onClick={() => setActiveFilter('p0')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeFilter === 'p0'
                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Priority P0</span>
          </button>

          <button
            id="filter-chip-recent"
            onClick={() => setActiveFilter('recent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeFilter === 'recent'
                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recent Updates
          </button>
        </div>
      </div>

      {/* ERROR STATE BANNER (if queries fail) */}
      {(isKpiError || isBurndownError) && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-200">Unable to load live workspace analytics</h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">Showing local cached workspace state while attempting to reconnect.</p>
            </div>
          </div>
          <button
            onClick={() => {
              void refetchKpi();
              void refetchBurndown();
            }}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-100/50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4 STAT METRIC CARDS (With Skeletons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isKpiLoading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between animate-pulse h-28"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Card 1: Active Tasks */}
            <div id="stat-card-active" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Tasks</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                  {activeTasksCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {activeTasksCount > 0 ? `${activeTasksCount} open` : "All clear"}
                </span>
              </div>
            </div>

            {/* Card 2: Due This Week */}
            <div id="stat-card-due" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Due This Week</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                  {dueThisWeekCount}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {dueThisWeekCount > 0 ? `${dueThisWeekCount} scheduled` : "None"}
                </span>
              </div>
            </div>

            {/* Card 3: Action Required / Overdue */}
            <div id="stat-card-overdue" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Action Required</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                  {overdueCount}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                  overdueCount > 0
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40"
                    : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                }`}>
                  {overdueCount > 0 ? `${overdueCount} urgent` : "All clear"}
                </span>
              </div>
            </div>

            {/* Card 4: Sprint Progress / Velocity */}
            <div id="stat-card-sprint" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sprint Velocity</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                    {sprintProgress}%
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                    {sprintProgress === 100 ? "Completed" : tasks.length > 0 ? "In Flight" : "Ready"}
                  </span>
                </div>
                <div 
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={sprintProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Sprint velocity: ${sprintProgress}%`}
                >
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${sprintProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Tasks (Left) & Sprint Overview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: My Tasks Today */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Assigned Tasks</h2>
            <button 
              id="btn-view-all-tasks"
              onClick={onViewAllTasks}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:underline"
            >
              <span>View all tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {filteredTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                id={`task-row-${task.id}`}
                onClick={() => onSelectTask(task)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTaskComplete(task.id);
                    }}
                    className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      task.completed 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                    aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}>
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {task.id} • {task.team} • {task.dueTime}
                    </p>
                  </div>
                </div>

                {/* Priority & Assignee avatars */}
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    task.priorityLabel === 'P0' || task.priority === 'High'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/40'
                      : task.priorityLabel === 'P1'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {task.priorityLabel ?? 'P1'}
                  </span>

                  <div className="flex -space-x-1.5 items-center">
                    <img 
                      src={task.assignee.avatar} 
                      alt={task.assignee.name} 
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                      title={task.assignee.name}
                    />
                    {task.coAssignees?.map((co, idx) => (
                      <img 
                        key={idx}
                        src={co.avatar} 
                        alt={co.name} 
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                        title={co.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <Inbox className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">No tasks in this view</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Try changing the filter or create a new task.</p>
                {onOpenNewTask && (
                  <button
                    type="button"
                    onClick={onOpenNewTask}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sprint Overview & Burndown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sprint Burndown</h2>
            <button 
              onClick={() => void refetchBurndown()}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" 
              title="Refresh sprint telemetry"
              aria-label="Refresh sprint telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBurndownLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            {/* Burndown Chart Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block animate-pulse"></span>
                  {burndownData?.sprintName ?? "Sprint Trajectory"}
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {burndownData?.daysRemaining ?? 0} days remaining
                </span>
              </div>

              {/* Burndown Graphic Box */}
              {isBurndownLoading ? (
                <div className="w-full h-36 bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-pulse">
                  <div className="text-xs text-slate-400">Calculating trajectory...</div>
                </div>
              ) : burndownData?.totalTasks === 0 ? (
                // Empty state when workspace has 0 tasks
                <div className="w-full h-36 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-4 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No active sprint tasks</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Create tasks to track your team burn rate.</p>
                  {onOpenNewTask && (
                    <button
                      type="button"
                      onClick={onOpenNewTask}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Task</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {/* Interactive SVG Chart Canvas */}
                  <div className="w-full h-36 relative bg-slate-50 dark:bg-slate-950 rounded-lg p-2 border border-slate-200 dark:border-slate-800 flex items-end">
                    <svg 
                      className="w-full h-full overflow-visible" 
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                      preserveAspectRatio="none"
                      aria-label={`Sprint Burndown chart for ${burndownData?.sprintName}`}
                    >
                      {/* Grid Lines */}
                      <line 
                        x1={padLeft} 
                        y1={svgHeight - padBottom} 
                        x2={svgWidth - padRight} 
                        y2={svgHeight - padBottom} 
                        className="stroke-slate-200 dark:stroke-slate-800" 
                        strokeWidth="1" 
                      />
                      <line 
                        x1={padLeft} 
                        y1={padTop + chartHeight / 2} 
                        x2={svgWidth - padRight} 
                        y2={padTop + chartHeight / 2} 
                        className="stroke-slate-100 dark:stroke-slate-850" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" 
                      />
                      
                      {/* Ideal Linear Burn-down guideline */}
                      <line 
                        x1={padLeft} 
                        y1={padTop} 
                        x2={svgWidth - padRight} 
                        y2={svgHeight - padBottom} 
                        className="stroke-slate-400 dark:stroke-slate-600 opacity-60" 
                        strokeWidth="1.5" 
                        strokeDasharray="4,4" 
                      />

                      {/* Actual velocity curve (Dynamic Smooth SVG path) */}
                      {actualPathD && (
                        <path
                          d={actualPathD}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Interactive Point Nodes & Invisible Touch Targets */}
                      {actualSvgPoints.map((pt, idx) => {
                        const isHovered = hoveredPoint?.dayIndex === pt.point.dayIndex;
                        const isCurrentDay = pt.point.isToday;

                        return (
                          <g key={idx}>
                            {/* Hover hit target */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="12"
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredPoint(pt.point)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />

                            {/* Outer ping on current day */}
                            {isCurrentDay && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="8"
                                fill="#2563EB"
                                opacity="0.25"
                                className="animate-ping"
                              />
                            )}

                            {/* Node Dot */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 5.5 : isCurrentDay ? 4.5 : 3}
                              fill="#2563EB"
                              className="stroke-white dark:stroke-slate-900 transition-all duration-150"
                              strokeWidth={isHovered ? 2.5 : 1.5}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Interactive Tooltip Overlay */}
                    {hoveredPoint && (
                      <div 
                        className="absolute z-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-medium py-1 px-2.5 rounded-md shadow-lg pointer-events-none transition-all duration-100 flex flex-col gap-0.5"
                        style={{
                          left: `${Math.min(75, Math.max(15, (hoveredPoint.dayIndex / 13) * 100))}%`,
                          bottom: '68%',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <span className="font-semibold">{hoveredPoint.date} (Day {hoveredPoint.dayNumber})</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300 dark:text-slate-600">
                          <span>Remaining: <strong className="text-white dark:text-slate-900">{hoveredPoint.actualRemaining}</strong></span>
                          <span>Ideal: {hoveredPoint.idealRemaining}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accessible Telemetry Summary for Screen Readers */}
                  <div className="sr-only">
                    <table>
                      <caption>Sprint Burndown 14-day Telemetry</caption>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Date</th>
                          <th>Ideal Remaining</th>
                          <th>Actual Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {burndownPoints.map(p => (
                          <tr key={p.dayIndex}>
                            <td>Day {p.dayNumber}</td>
                            <td>{p.date}</td>
                            <td>{p.idealRemaining}</td>
                            <td>{p.actualRemaining ?? 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Telemetry Footer Meta */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-blue-600 rounded-full inline-block"></span>
                      <span>Actual ({burndownData?.currentRemaining ?? 0} remaining)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-slate-400 dark:bg-slate-600 stroke-dasharray rounded-full inline-block"></span>
                      <span>Target ({burndownData?.targetDate})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Milestones */}
            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-3">
                Key Milestones
              </span>

              <div className="space-y-3">
                {milestones.length === 0 ? (
                  <div className="text-center py-6 px-4 text-slate-400 dark:text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-950/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    No upcoming milestones scheduled yet.
                  </div>
                ) : (
                  milestones.map((ms, idx) => (
                    <div key={ms.id} className="flex items-start gap-3 relative">
                      {/* Stem line */}
                      {idx < milestones.length - 1 && (
                        <div className="w-[1px] h-7 bg-slate-200 dark:bg-slate-800 absolute left-[6px] top-3.5"></div>
                      )}
                      
                      {/* Node Dot */}
                      <div className="mt-1">
                        {ms.status === 'current' ? (
                          <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/80"></div>
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-white leading-none truncate">
                          {ms.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {ms.date} • {ms.team}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Workspace Activity */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Workspace Activity</h2>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-1.5">
              <span className="font-medium text-slate-600 dark:text-slate-300">No workspace activity yet</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Events and audit trails will appear here as your team works.</span>
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                {/* User Avatar */}
                <img 
                  src={act.user.avatar} 
                  alt={act.user.name} 
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{act.user.name}</span>{' '}
                    {act.action}{' '}
                    <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      {act.target}
                    </span>
                  </p>
                  
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {act.timeAgo} • {act.board}
                  </span>

                  {/* Quoted Comment if applicable */}
                  {act.comment && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                      &quot;{act.comment}&quot;
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

