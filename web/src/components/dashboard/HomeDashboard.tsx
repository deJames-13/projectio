"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  MoreHorizontal, 
  Check, 
  ChevronRight,
  Inbox
} from 'lucide-react';
import type { Task, ActivityItem, Milestone, Member } from '~/types';

interface HomeDashboardProps {
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onViewAllTasks: () => void;
  activities: ActivityItem[];
  milestones: Milestone[];
  currentUser: Member;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  tasks,
  onToggleTaskComplete,
  onSelectTask,
  onViewAllTasks,
  activities,
  milestones,
  currentUser
}) => {
  const [activeFilter, setActiveFilter] = useState<'assigned' | 'due_week' | 'p0' | 'recent'>('assigned');

  // Filter tasks based on selected chip
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'assigned') {
      return task.assignee.id === currentUser.id || task.assignee.name.toLowerCase().includes('dej') || true;
    }
    if (activeFilter === 'due_week') {
      return (task.dueTime?.includes('Today') ?? false) || (task.dueTime?.includes('Tomorrow') ?? false) || (task.dueTime?.includes('PM') ?? false);
    }
    if (activeFilter === 'p0') {
      return task.priority === 'P0' || task.priority === 'High';
    }
    return true;
  });

  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const overdueCount = 3;
  const dueThisWeekCount = 8;
  const sprintProgress = 68;

  return (
    <div id="home-dashboard" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening across your active sprint and workspace today.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
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

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Tasks */}
        <div id="stat-card-active" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {activeTasksCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              {activeTasksCount > 0 ? `${activeTasksCount} open` : "None"}
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
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dueThisWeekCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              Scheduled
            </span>
          </div>
        </div>

        {/* Card 3: Overdue / Action Required */}
        <div id="stat-card-overdue" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Action Required</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
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

        {/* Card 4: Sprint Velocity */}
        <div id="stat-card-sprint" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sprint Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {sprintProgress}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                {tasks.length > 0 ? "In Progress" : "Ready"}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${sprintProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
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
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sprint Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sprint Burndown</h2>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Sprint options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            {/* Burndown Chart Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sprint 24 Trajectory</span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">8 days remaining</span>
              </div>

              {/* Burndown Curve Graphic */}
              <div className="w-full h-32 relative bg-slate-50 dark:bg-slate-950 rounded-lg p-2 border border-slate-200 dark:border-slate-800 flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="90" x2="300" y2="90" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
                  <line x1="0" y1="50" x2="300" y2="50" className="stroke-slate-100 dark:stroke-slate-850" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Ideal Linear Burn-down guideline */}
                  <line 
                    x1="10" y1="20" 
                    x2="290" y2="88" 
                    className="stroke-slate-400 dark:stroke-slate-600" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,4" 
                  />

                  {/* Actual velocity curve */}
                  <path
                    d="M 10 25 Q 70 30, 120 48 T 200 76 T 290 85"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Current position node */}
                  <circle cx="200" cy="76" r="4" fill="#2563EB" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                </svg>
              </div>
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

      {/* Bottom Section: Recent Activity */}
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
