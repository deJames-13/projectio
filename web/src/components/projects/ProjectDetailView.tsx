"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  CheckSquare, 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Crown, 
  UserMinus, 
  UserPlus, 
  AlertCircle, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Loader2, 
  Kanban,
  List,
  ShieldAlert,
  GitBranch
} from 'lucide-react';
import { api } from '~/trpc/react';
import type { Project, Task, Member, DocItem, TaskStatus } from '~/types';
import { parseTaskSubtasks, calculateSprintTelemetry, getTaskBlockerStatus } from '~/lib/taskHelpers';
import { SprintTelemetryBanner } from '../tasks/SprintTelemetryBanner';
import { UserAvatar } from '~/components/ui/UserAvatar';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  docs: DocItem[];
  members: Member[];
  currentUser: Member;
  activeSubTab?: 'tasks' | 'members' | 'docs' | 'settings';
  onSubTabChange?: (tab: 'tasks' | 'members' | 'docs' | 'settings') => void;
  onBackToProjects: () => void;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: (defaultStatus?: TaskStatus, projectId?: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateProject: (p: {
    id: string;
    title?: string;
    description?: string;
    status?: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType?: string;
    accentColor?: string;
    progress?: number;
  }) => void;
  onDeleteProject: (projectId: string) => void;
  onAddProjectMember: (projectId: string, userId: string) => void;
  onRemoveProjectMember: (projectId: string, userId: string) => void;
  onCreateDoc?: (doc: DocItem) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  tasks,
  docs,
  members,
  currentUser,
  activeSubTab = 'tasks',
  onSubTabChange,
  onBackToProjects,
  onSelectTask,
  onOpenNewTask,
  onUpdateTaskStatus,
  onToggleTaskComplete,
  onUpdateProject,
  onDeleteProject,
  onAddProjectMember,
  onRemoveProjectMember,
  onCreateDoc,
}) => {
  const [subTab, setSubTab] = useState<'tasks' | 'members' | 'docs' | 'settings'>(activeSubTab);
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Search members for project add
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Settings form state
  const [settingsTitle, setSettingsTitle] = useState(project.title);
  const [settingsDesc, setSettingsDesc] = useState(project.description);
  const [settingsStatus, setSettingsStatus] = useState(project.status);
  const [settingsProgress, setSettingsProgress] = useState(project.progress);
  const [settingsColor, setSettingsColor] = useState(project.accentColor ?? '#4F46E5');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleTabSwitch = (t: 'tasks' | 'members' | 'docs' | 'settings') => {
    setSubTab(t);
    onSubTabChange?.(t);
  };

  // Live user search via tRPC
  const { data: searchResults = [], isLoading: isSearchingUsers } = api.member.search.useQuery(
    { query: memberSearchQuery },
    { enabled: subTab === 'members' || subTab === 'settings' }
  );

  // Available users to add into project (from search results or workspace member directory)
  const availableUsers = useMemo(() => {
    const pool = memberSearchQuery.trim() ? searchResults : members;
    return pool.filter((u) => !project.members.some((m) => m.id === u.id));
  }, [memberSearchQuery, searchResults, members, project.members]);

  // Filter tasks tied specifically to THIS project (including other members' tasks)
  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === project.id);
  }, [tasks, project.id]);

  // Filtered tasks by search, status, assignee
  const filteredProjectTasks = useMemo(() => {
    return projectTasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (assigneeFilter !== 'all' && t.assignee?.id !== assigneeFilter) return false;
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false) ||
          t.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projectTasks, statusFilter, assigneeFilter, taskSearch]);

  // Sprint telemetry for this project
  const projectSprintTelemetry = useMemo(() => {
    return calculateSprintTelemetry(projectTasks, `${project.title} Sprint`);
  }, [projectTasks, project.title]);

  // Drag and drop handlers
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

  // Filter docs tied specifically to this project
  const projectDocs = useMemo(() => {
    return docs.filter((d) => d.projectId === project.id);
  }, [docs, project.id]);

  const isCreator = project.creatorId === currentUser.id;
  const isWorkspaceOwner = currentUser.role?.toLowerCase() === 'owner';
  const canManage = isCreator || isWorkspaceOwner;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject({
      id: project.id,
      title: settingsTitle.trim(),
      description: settingsDesc.trim(),
      status: settingsStatus,
      progress: settingsProgress,
      accentColor: settingsColor,
    });
  };

  const handleAddMember = (userId: string) => {
    onAddProjectMember(project.id, userId);
    setMemberSearchQuery('');
  };

  const handleRemoveMember = (userId: string) => {
    onRemoveProjectMember(project.id, userId);
  };

  const handleDelete = () => {
    onDeleteProject(project.id);
    onBackToProjects();
  };

  // Kanban Column Config
  const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog', color: 'bg-slate-500' },
    { id: 'todo', label: 'To Do', color: 'bg-amber-500' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', label: 'In Review', color: 'bg-purple-500' },
    { id: 'done', label: 'Done', color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── 1. Breadcrumb & Back Action ──────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToProjects}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Projects Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400 dark:text-slate-500">Project ID:</span>
          <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {project.id}
          </span>
        </div>
      </div>

      {/* ─── 2. Project Hero Card ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Project Accent Badge */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: project.accentColor || '#4F46E5' }}
            >
              <Layers className="w-7 h-7 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {project.title}
                </h1>

                {/* Status Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    project.status === 'on-track'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                      : project.status === 'at-risk'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80'
                      : project.status === 'completed'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                  }`}
                >
                  {project.statusLabel || project.status}
                </span>

                {/* Creator Attribution */}
                {project.creator && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Owner: {project.creator.name}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {project.description || 'No detailed project description set. Configure details in Project Settings.'}
              </p>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenNewTask('todo', project.id)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg px-3.5 py-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Task in Project</span>
            </button>
          </div>
        </div>

        {/* Progress bar + Metadata Metrics */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Project Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: project.accentColor || '#4F46E5',
                }}
              />
            </div>
          </div>

          {/* Members Avatar Stack */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Team:</span>
            <div className="flex -space-x-2 overflow-hidden items-center">
              {project.members.map((m) => (
                <img
                  key={m.id}
                  src={m.avatar}
                  alt={m.name}
                  title={`${m.name} (${m.role})`}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Project Sub-Navigation Tabs ───────────────────── */}
      {/* ─── 3. Project Sub-Navigation Tabs ───────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleTabSwitch('tasks')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
            subTab === 'tasks'
              ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Project Tasks</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
            {projectTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('members')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
            subTab === 'members'
              ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Project Members</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
            {project.members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('docs')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
            subTab === 'docs'
              ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documentation</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
            {projectDocs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('settings')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
            subTab === 'settings'
              ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Project Settings</span>
        </button>
      </div>

      {/* ─── 4. SUB-TAB 1: Project Tasks ──────────────────────── */}
      {subTab === 'tasks' && (
        <div className="space-y-4">
          {/* Active Sprint Telemetry Banner */}
          <SprintTelemetryBanner
            telemetry={projectSprintTelemetry}
            onOpenNewTask={() => onOpenNewTask('todo', project.id)}
          />

          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search tasks in this project..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>

              {/* Assignee Filter */}
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Assignees</option>
                {project.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 p-0.5">
                <button
                  type="button"
                  onClick={() => setTaskViewMode('kanban')}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                    taskViewMode === 'kanban' ? 'bg-white dark:bg-slate-800 shadow-2xs text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Kanban Board"
                >
                  <Kanban className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTaskViewMode('list')}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                    taskViewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-2xs text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredProjectTasks.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No tasks in this project yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Tasks created here will be automatically assigned to this project and visible to all project members.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenNewTask('todo', project.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Project Task</span>
              </button>
            </div>
          ) : taskViewMode === 'kanban' ? (
            /* Kanban Board Columns */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {KANBAN_COLUMNS.map((col) => {
                const colTasks = filteredProjectTasks.filter((t) => t.status === col.id);
                const isTargetColumn = dragOverColumn === col.id;

                return (
                  <div
                    key={col.id}
                    id={`project-kanban-col-${col.id}`}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={(e) => handleDragLeave(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`rounded-xl p-3 border transition-all flex flex-col min-h-[420px] ${
                      isTargetColumn
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/40'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.color}`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{col.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.2">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {colTasks.map((task) => {
                        const { subtasks } = parseTaskSubtasks(task.description);
                        const completedSubtasks = subtasks.filter((st) => st.completed).length;
                        const blockerStatus = getTaskBlockerStatus(task, tasks);
                        const isDraggingThis = draggedTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            id={`project-kanban-card-${task.id}`}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onSelectTask(task)}
                            tabIndex={0}
                            role="button"
                            aria-label={`Task ${task.id}: ${task.title}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectTask(task);
                              }
                            }}
                            className={`p-3 bg-white dark:bg-slate-850 rounded-xl border transition-all cursor-grab active:cursor-grabbing group space-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              isDraggingThis
                                ? 'opacity-40 scale-95 border-blue-400 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-800'
                                : 'border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {task.id}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                  task.priority === 'High' || task.priority === 'P0'
                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                                    : task.priority === 'Medium' || task.priority === 'P1'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                              {task.title}
                            </h4>

                            {/* Blocker & Dependency Badges */}
                            {blockerStatus.isBlocked && blockerStatus.blockerTask && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="truncate">Blocked by {blockerStatus.blockerTask.id}</span>
                              </div>
                            )}

                            {blockerStatus.blockingTasks.length > 0 && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <ShieldAlert className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span className="truncate">Blocks {blockerStatus.blockingTasks.map((t) => t.id).join(', ')}</span>
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
                                  <span className="font-mono text-[10px]">{completedSubtasks}/{subtasks.length}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Git Branch Tag */}
                            {task.gitBranch && (
                              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                <GitBranch className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                                <span className="truncate">{task.gitBranch}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  title={`Assigned to ${task.assignee.name}`}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                />
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                                  {task.assignee.name}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleTaskComplete(task.id);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  task.completed
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                                title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Anti-slop empty column drop zone */}
                      {colTasks.length === 0 && (
                        <div
                          className={`p-6 text-center text-xs rounded-xl border border-dashed transition-all flex flex-col items-center justify-center flex-1 ${
                            isTargetColumn
                              ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span>{isTargetColumn ? 'Drop task here' : 'No tasks in this column'}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenNewTask(col.id, project.id)}
                      className="mt-3 w-full py-1.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjectTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskComplete(task.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        task.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0">
                      {task.id}
                    </span>

                    <span className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
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

                    <div className="flex items-center gap-1.5 min-w-[110px]">
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{task.assignee.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. SUB-TAB 2: Project Members ─────────────────────── */}
      {subTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Members &amp; Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Members have full visibility over project tasks and project-tied documentation.
              </p>
            </div>

            {canManage && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1">
                <Crown className="w-3.5 h-3.5" />
                <span>You can manage project members</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Members Column */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active Project Members ({project.members.length})
              </h4>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {project.members.map((member) => {
                  const isProjectCreator = member.id === project.creatorId;
                  const isSelf = member.id === currentUser.id;

                  return (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {member.name}
                            </span>
                            {isProjectCreator && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.2">
                                <Crown className="w-2.5 h-2.5" />
                                Project Creator
                              </span>
                            )}
                            {isSelf && (
                              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.2">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {member.email ?? member.role}
                          </span>
                        </div>
                      </div>

                      {canManage && !isProjectCreator && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title={`Remove ${member.name} from project`}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite / Add Member by Username Column */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 h-fit">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Add Member to Project
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search workspace members by @username or name to add them to this project.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Search @username or name..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {isSearchingUsers && (
                  <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 animate-spin" />
                )}
              </div>

              {/* Search Results / Available Workspace Members list */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar
                        name={user.name}
                        username={user.username}
                        email={user.email}
                        avatar={user.avatar}
                        size="xs"
                        className="w-6 h-6 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                          {user.name}
                        </span>
                        {user.username && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                            @{user.username}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddMember(user.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
                {availableUsers.length === 0 && !isSearchingUsers && (
                  <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">
                    {memberSearchQuery ? 'No matching users found.' : 'All workspace members are already added.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. SUB-TAB 3: Project Documentation ───────────────── */}
      {subTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Knowledge &amp; Docs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All documents tied to {project.title} are accessible and editable by project members.
              </p>
            </div>

            {onCreateDoc && (
              <button
                type="button"
                onClick={() => {
                  onCreateDoc({
                    id: `doc-${Date.now()}`,
                    title: `New Note - ${project.title}`,
                    category: 'Engineering',
                    content: '',
                    author: currentUser,
                    updatedAt: 'Just now',
                    projectId: project.id,
                    projectName: project.title,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project Doc</span>
              </button>
            )}
          </div>

          {projectDocs.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No project documents yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Create architectural specs, runbooks, or meeting notes tied directly to this project.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{doc.updatedAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.title}</h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {doc.content || 'Empty document content.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={doc.author.avatar}
                        alt={doc.author.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{doc.author.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 7. SUB-TAB 4: Project Settings (Includes Member Management) ── */}
      {subTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          {/* General Project Settings Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Project Configuration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update project title, description, operational status, and progress metrics.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={settingsDesc}
                  onChange={(e) => setSettingsDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={settingsStatus}
                    onChange={(e) => setSettingsStatus(e.target.value as Project['status'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Progress: {settingsProgress}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settingsProgress}
                    onChange={(e) => setSettingsProgress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  {['#4F46E5', '#2563EB', '#0D9488', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSettingsColor(color)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        settingsColor === color ? 'ring-2 ring-slate-900 dark:ring-slate-100 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Save Project Changes
                </button>
              </div>
            </form>
          </div>

          {/* Members in Project Settings as explicitly requested */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Project Members in Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage users with project access and privileges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('members')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
              >
                Go to full members view →
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {project.members.map((m) => (
                <div key={m.id} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850">
                  <div className="flex items-center gap-2.5">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{m.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{m.email ?? m.role}</span>
                    </div>
                  </div>

                  {m.id === project.creatorId ? (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Owner
                    </span>
                  ) : canManage ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Project Deletion */}
          {canManage && (
            <div className="bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold">Danger Zone</h3>
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                Deleting this project permanently cleans up its project configuration. All tasks associated with this project will be unassigned from it.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project Permanently</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Delete Confirmation Modal ───────────────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Delete &ldquo;{project.title}&rdquo;?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
