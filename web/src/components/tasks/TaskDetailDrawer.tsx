"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Check, 
  GitBranch, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  CheckSquare, 
  Plus, 
  ShieldAlert, 
  ExternalLink,
  Send,
  Link as LinkIcon
} from 'lucide-react';
import type { Task, TaskStatus, Member, Priority, Project, Subtask } from '~/types';
import { parseTaskSubtasks, serializeTaskDescription, getTaskBlockerStatus } from '~/lib/taskHelpers';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  allTasks?: Task[];
  members: Member[];
  projects?: Project[];
  currentUser?: Member;
  onSelectAnotherTask?: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen = true,
  onClose,
  onUpdateTask,
  onDeleteTask,
  allTasks = [],
  members,
  projects,
  currentUser,
  onSelectAnotherTask,
}) => {
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Escape key handler to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && task && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, isOpen, onClose]);

  // Parse subtasks & description
  const { cleanDescription, subtasks } = useMemo(() => {
    if (!task) return { cleanDescription: '', subtasks: [] };
    return parseTaskSubtasks(task.description);
  }, [task]);

  // Evaluate blocker status
  const blockerStatus = useMemo(() => {
    if (!task) return { isBlocked: false, blockerTask: null, blockingTasks: [] };
    return getTaskBlockerStatus(task, allTasks);
  }, [task, allTasks]);

  if (!isOpen || !task) return null;

  const completedSubtasksCount = subtasks.filter(s => s.completed).length;
  const subtasksPercent = subtasks.length > 0 
    ? Math.round((completedSubtasksCount / subtasks.length) * 100) 
    : 0;

  const handleStatusChange = (status: TaskStatus) => {
    onUpdateTask({ ...task, status, completed: status === 'done' });
  };

  const handlePriorityChange = (priority: Priority) => {
    const label = priority === 'High' ? 'P0' : priority === 'Medium' ? 'P1' : 'P2';
    onUpdateTask({ ...task, priority, priorityLabel: label });
  };

  const handleAssigneeChange = (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    if (mem) {
      onUpdateTask({ ...task, assignee: mem });
    }
  };

  // Subtask handlers
  const handleToggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const serialized = serializeTaskDescription(cleanDescription, updated);
    onUpdateTask({ ...task, description: serialized, subtasks: updated });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = subtasks.filter(st => st.id !== subtaskId);
    const serialized = serializeTaskDescription(cleanDescription, updated);
    onUpdateTask({ ...task, description: serialized, subtasks: updated });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const updated = [...subtasks, newSubtask];
    const serialized = serializeTaskDescription(cleanDescription, updated);
    onUpdateTask({ ...task, description: serialized, subtasks: updated });
    setNewSubtaskTitle('');
  };

  const handleDescriptionChange = (text: string) => {
    const serialized = serializeTaskDescription(text, subtasks);
    onUpdateTask({ ...task, description: serialized });
  };

  const handleBlocksTaskChange = (targetTaskId: string) => {
    const newBlocksVal = targetTaskId === 'none' ? null : targetTaskId;
    onUpdateTask({ ...task, blocks: newBlocksVal });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const commentAuthor = currentUser ?? members[0] ?? {
      id: 'user-dej',
      name: 'User',
      role: 'Member',
      email: '',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl'
    };

    const newComment = {
      id: `comm-${Date.now()}`,
      author: commentAuthor,
      text: commentText.trim(),
      timeAgo: 'Just now'
    };

    const updatedComments = [...(task.comments ?? []), newComment];
    onUpdateTask({ ...task, comments: updatedComments });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="task-drawer-title">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {task.id}
              </span>
              <span className="text-xs text-slate-400">• {task.team}</span>
            </div>

            <div className="flex items-center gap-2">
              {onDeleteTask && (
                <button
                  onClick={() => {
                    onDeleteTask(task.id);
                    onClose();
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Delete Task"
                  aria-label="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                aria-label="Close task drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {/* Title & Checkbox */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleStatusChange(task.status === 'done' ? 'in-progress' : 'done')}
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  task.status === 'done'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
                aria-label={`Mark task as ${task.status === 'done' ? 'incomplete' : 'done'}`}
              >
                {task.status === 'done' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div className="flex-1">
                <input
                  id="task-drawer-title"
                  type="text"
                  value={task.title}
                  onChange={(e) => onUpdateTask({ ...task, title: e.target.value })}
                  className="text-lg font-bold text-slate-900 w-full focus:outline-none focus:border-b focus:border-blue-500 bg-transparent"
                />
              </div>
            </div>

            {/* Key Properties Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Priority
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="High">P0 - High</option>
                  <option value="Medium">P1 - Medium</option>
                  <option value="Low">P2 - Low</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Assignee
                </label>
                <select
                  value={task.assignee.id}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Due Date
                </label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={task.dueTime ?? 'No date'}
                    onChange={(e) => onUpdateTask({ ...task, dueTime: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Project */}
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Project
                </label>
                <select
                  value={task.projectId ?? ''}
                  onChange={(e) => {
                    const selProj = projects?.find(p => p.id === e.target.value);
                    onUpdateTask({
                      ...task,
                      projectId: selProj?.id ?? null,
                      team: selProj?.title ?? 'General',
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">No Project (General)</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Git Branch Info */}
            {task.gitBranch && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <GitBranch className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Git Branch:</span>
                <span className="font-mono text-xs text-slate-800 font-semibold">{task.gitBranch}</span>
              </div>
            )}

            {/* Task Dependencies & Blockers Section */}
            <div className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  Dependencies & Blockers
                </span>
                {blockerStatus.isBlocked && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    BLOCKED
                  </span>
                )}
              </div>

              {/* If Blocked Alert */}
              {blockerStatus.blockerTask && (
                <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                  blockerStatus.isBlocked 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className={`w-4 h-4 shrink-0 ${blockerStatus.isBlocked ? 'text-amber-600' : 'text-emerald-600'}`} />
                    <span className="truncate">
                      Blocked by: <strong className="font-mono">{blockerStatus.blockerTask.id}</strong> — {blockerStatus.blockerTask.title}
                    </span>
                  </div>
                  {onSelectAnotherTask && (
                    <button
                      type="button"
                      onClick={() => onSelectAnotherTask(blockerStatus.blockerTask!.id)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] shrink-0 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Tasks This Task Blocks */}
              {blockerStatus.blockingTasks.length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-xs text-purple-900">
                  <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    Blocks: {blockerStatus.blockingTasks.map(t => `${t.id} (${t.title})`).join(', ')}
                  </span>
                </div>
              )}

              {/* Link what this task blocks */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  This task blocks:
                </label>
                <select
                  value={task.blocks ?? 'none'}
                  onChange={(e) => handleBlocksTaskChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="none">None (Doesn&apos;t block any task)</option>
                  {allTasks
                    .filter(t => t.id !== task.id)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} — {t.title} ({t.status})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Checklist Subtasks Section */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  Checklist Subtasks
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-500">
                  {completedSubtasksCount} of {subtasks.length} done ({subtasksPercent}%)
                </span>
              </div>

              {/* Subtask Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${subtasksPercent}%` }}
                  />
                </div>
              )}

              {/* Subtask items list */}
              <div className="space-y-1.5">
                {subtasks.map(st => (
                  <div 
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 transition-all group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs truncate ${st.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {st.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input Form */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a checklist item (press Enter)..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Sub-tabs: Details vs Discussion */}
            <div className="flex items-center gap-4 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Specification Notes
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'comments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Discussion ({task.comments?.length ?? 0})
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'details' ? (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={cleanDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Add detailed task specification, acceptance criteria, or technical details..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg p-3 text-xs text-slate-800 leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Comment list */}
                <div className="space-y-3">
                  {(task.comments ?? []).map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                      <img src={c.author.avatar} alt={c.author.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{c.author.name}</span>
                          <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-normal">{c.text}</p>
                      </div>
                    </div>
                  ))}

                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-xs text-slate-400 text-center py-4">No comments yet. Start the conversation!</p>
                  )}
                </div>

                {/* Comment input form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'recently'}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
