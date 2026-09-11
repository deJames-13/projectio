"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Kanban, 
  List, 
  GitBranch,
  ChevronRight,
  Inbox,
  AlertCircle,
  ShieldAlert,
  CheckSquare
} from 'lucide-react';
import type { Task, TaskStatus, Member, Project } from '~/types';
import { parseTaskSubtasks, calculateSprintTelemetry, getTaskBlockerStatus } from '~/lib/taskHelpers';
import { SprintTelemetryBanner } from './SprintTelemetryBanner';

interface TasksKanbanViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskWithStatus?: (status: TaskStatus) => void;
  projects: Project[];
  members: Member[];
  selectedProjectId?: string | null;
  isPersonalView?: boolean;
  currentUser?: Member;
}

export const TasksKanbanView: React.FC<TasksKanbanViewProps> = ({
  tasks,
  onSelectTask,
  onUpdateTaskStatus,
  onOpenNewTaskWithStatus,
  projects,
  members,
  selectedProjectId,
  isPersonalView = false,
  currentUser: _currentUser
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterProject, setSelectedFilterProject] = useState<string>(selectedProjectId ?? 'all');
  const [selectedFilterAssignee, setSelectedFilterAssignee] = useState<string>('all');

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: { id: TaskStatus; label: string; dot: string }[] = [
    { id: 'backlog', label: 'Backlog', dot: 'bg-slate-400' },
    { id: 'todo', label: 'To Do', dot: 'bg-amber-500' },
    { id: 'in-progress', label: 'In Progress', dot: 'bg-blue-600' },
    { id: 'review', label: 'In Review', dot: 'bg-purple-600' },
    { id: 'done', label: 'Done', dot: 'bg-emerald-600' }
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
                            task.title.toLowerCase().includes(q) || 
                            task.id.toLowerCase().includes(q) ||
                            task.team.toLowerCase().includes(q);
      const matchesProj = selectedFilterProject === 'all' || task.projectId === selectedFilterProject;
      const matchesAssignee = selectedFilterAssignee === 'all' || task.assignee.id === selectedFilterAssignee;
      return matchesSearch && matchesProj && matchesAssignee;
    });
  }, [tasks, searchQuery, selectedFilterProject, selectedFilterAssignee]);

  // Sprint Telemetry computation
  const sprintTelemetry = useMemo(() => {
    const activeTasks = selectedFilterProject === 'all' 
      ? filteredTasks 
      : filteredTasks.filter(t => t.projectId === selectedFilterProject);
    return calculateSprintTelemetry(activeTasks);
  }, [filteredTasks, selectedFilterProject]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: TaskStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    if (taskId) {
      onUpdateTaskStatus(taskId, colId);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div id="tasks-kanban-view" className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header with Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isPersonalView ? 'My Tasks' : 'Task Management'}
            </h1>
            {isPersonalView && (
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 rounded-full px-2.5 py-0.5">
                Personal Overview
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isPersonalView
              ? 'Consolidated overview of all tasks assigned to you across your active projects.'
              : 'Organize, prioritize, and track tasks across sprints and projects.'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center shadow-2xs">
            <button
              id="view-mode-board"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                viewMode === 'board' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                viewMode === 'list' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Sprint Telemetry Banner */}
      <SprintTelemetryBanner 
        telemetry={sprintTelemetry}
        onOpenNewTask={() => onOpenNewTaskWithStatus?.('todo')}
      />

      {/* Personal Workload Summary Cards */}
      {isPersonalView && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Assigned to You</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">{tasks.length}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400 mt-0.5 block">{tasks.filter(t => t.status === 'in-progress').length}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">High Priority</span>
            <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-0.5 block">{tasks.filter(t => t.priority === 'High' || t.priority === 'P0' || t.priority === 'P1').length}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 block">{tasks.filter(t => t.status === 'done' || t.completed).length}</span>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, IDs, tags..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Project Filter */}
          <select
            value={selectedFilterProject}
            onChange={(e) => setSelectedFilterProject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedFilterAssignee}
            onChange={(e) => setSelectedFilterAssignee(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Assignees</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Kanban Board View with Drag & Drop */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {columns.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            const isTargetColumn = dragOverColumn === col.id;

            return (
              <div 
                key={col.id}
                id={`kanban-col-${col.id}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-xl p-3 flex flex-col min-h-[420px] max-h-[calc(100vh-270px)] border transition-all ${
                  isTargetColumn 
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/40' 
                    : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 py-1.5 mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">{col.label}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenNewTaskWithStatus?.(col.id)}
                    className="w-5 h-5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title={`Add task to ${col.label}`}
                    aria-label={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-2.5 overflow-y-auto custom-scrollbar pr-0.5 flex-1">
                  {columnTasks.map(task => {
                    const { subtasks } = parseTaskSubtasks(task.description);
                    const completedSubtasks = subtasks.filter(st => st.completed).length;
                    const blockerStatus = getTaskBlockerStatus(task, tasks);
                    const isDraggingThis = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        id={`kanban-card-${task.id}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectTask(task)}
                        className={`bg-white dark:bg-slate-850 rounded-lg p-3.5 border shadow-2xs transition-all cursor-grab active:cursor-grabbing group flex flex-col gap-2 ${
                          isDraggingThis 
                            ? 'opacity-40 scale-95 border-blue-400 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-800' 
                            : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-650 hover:shadow-xs'
                        }`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Task ${task.id}: ${task.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectTask(task);
                          }
                        }}
                      >
                        {/* Top ID & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                            {task.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              task.priorityLabel === 'P0' || task.priority === 'High'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                                : task.priorityLabel === 'P1'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}>
                              {task.priorityLabel || 'P1'}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {/* Dependency / Blocker Badges */}
                        {blockerStatus.isBlocked && blockerStatus.blockerTask && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="truncate">Blocked by {blockerStatus.blockerTask.id}</span>
                          </div>
                        )}

                        {blockerStatus.blockingTasks.length > 0 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldAlert className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span className="truncate">Blocks {blockerStatus.blockingTasks.map(t => t.id).join(', ')}</span>
                          </div>
                        )}

                        {/* Subtasks Progress Counter Bar */}
                        {subtasks.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 text-[10px]">
                                <CheckSquare className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                                Subtasks
                              </span>
                              <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">{completedSubtasks}/{subtasks.length}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Branch tag if available */}
                        {task.gitBranch && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            <GitBranch className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                            <span className="truncate">{task.gitBranch}</span>
                          </div>
                        )}

                        {/* Footer: Due date & Assignee avatar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-1 text-xs">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {task.dueTime ?? 'No date'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <img 
                              src={task.assignee.avatar} 
                              alt={task.assignee.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                              title={task.assignee.name}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Column Drop Target (Tier 3 Anti-Slop) */}
                  {columnTasks.length === 0 && (
                    <div 
                      className={`p-6 text-center text-xs rounded-xl border border-dashed transition-all ${
                        isTargetColumn 
                          ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isTargetColumn ? 'Drop task here' : 'No tasks in this column'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs overflow-hidden border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.map(task => {
            const { subtasks } = parseTaskSubtasks(task.description);
            const completedSubtasks = subtasks.filter(st => st.completed).length;
            const blockerStatus = getTaskBlockerStatus(task, tasks);

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer group gap-3"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTask(task);
                  }
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-16 shrink-0">
                    {task.id}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{task.team}</span>
                      {blockerStatus.isBlocked && blockerStatus.blockerTask && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.2">
                          Blocked by {blockerStatus.blockerTask.id}
                        </span>
                      )}
                      {subtasks.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.2">
                          ✓ {completedSubtasks}/{subtasks.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateTaskStatus(task.id, e.target.value as TaskStatus);
                    }}
                    className="text-[10px] font-bold uppercase rounded px-2 py-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    task.priorityLabel === 'P0' || task.priority === 'High'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                      : task.priorityLabel === 'P1'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {task.priorityLabel || 'P1'}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400 w-24 text-right">
                    {task.dueTime ?? '–'}
                  </span>

                  <div className="flex items-center gap-2 w-28">
                    <img 
                      src={task.assignee.avatar} 
                      alt={task.assignee.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">{task.assignee.name.split(' ')[0]}</span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">No tasks found</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
