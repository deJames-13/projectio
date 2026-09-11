"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskStatus, Priority, Member, Project } from '~/types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Task) => void;
  members: Member[];
  projects: Project[];
  defaultStatus?: TaskStatus;
  defaultProjectId?: string | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  members,
  projects,
  defaultStatus = 'todo',
  defaultProjectId
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>(members[0]?.id ?? '');
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? projects[0]?.id ?? '');
  const [gitBranch, setGitBranch] = useState('');
  const [dueTime, setDueTime] = useState('Tomorrow, 5:00 PM');

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (!projectId && projects.length > 0) {
      setProjectId(projects[0]!.id);
    }
  }, [defaultProjectId, projects, projectId]);

  useEffect(() => {
    if (!assigneeId && members.length > 0) {
      setAssigneeId(members[0]!.id);
    }
  }, [members, assigneeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle === '') return;

    const selectedAssignee = members.find(m => m.id === assigneeId) ?? members[0] ?? {
      id: 'unknown',
      name: 'Team Member',
      role: 'Member',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl',
      email: ''
    };
    const selectedProj = projects.find(p => p.id === projectId);
    const priorityLabel = priority === 'High' ? 'P0' : priority === 'Medium' ? 'P1' : 'P2';
    const trimmedDueTime = dueTime.trim();
    const trimmedGitBranch = gitBranch.trim();

    const newTask: Task = {
      id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      title: trimmedTitle,
      description: description.trim(),
      status,
      priority,
      priorityLabel,
      team: selectedProj?.title ?? 'General',
      projectId: selectedProj?.id ?? null,
      assignee: selectedAssignee,
      dueTime: trimmedDueTime !== '' ? trimmedDueTime : 'Scheduled',
      gitBranch: trimmedGitBranch !== '' ? trimmedGitBranch : undefined,
      completed: status === 'done',
      comments: [],
      createdAt: new Date().toISOString()
    };

    onCreateTask(newTask);
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setGitBranch('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-task-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 id="new-task-modal-title" className="text-base font-bold text-slate-900">Create New Task</h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="task-title-input" className="text-xs font-semibold text-slate-700 block mb-1">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth single sign-on flow"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="task-desc-input" className="text-xs font-semibold text-slate-700 block mb-1">
              Description & Specification
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Acceptance criteria, technical constraints, or edge cases..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg p-3 text-xs text-slate-900 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-project-select" className="text-xs font-semibold text-slate-700 block mb-1">
                Project
              </label>
              <select
                id="task-project-select"
                value={projectId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
              >
                <option value="">No Project (General)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-assignee-select" className="text-xs font-semibold text-slate-700 block mb-1">
                Assignee
              </label>
              <select
                id="task-assignee-select"
                value={assigneeId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-status-select" className="text-xs font-semibold text-slate-700 block mb-1">
                Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority-select" className="text-xs font-semibold text-slate-700 block mb-1">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
              >
                <option value="High">P0 - High</option>
                <option value="Medium">P1 - Medium</option>
                <option value="Low">P2 - Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-duetime-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Due Date
              </label>
              <input
                id="task-duetime-input"
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="task-gitbranch-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Git Branch (optional)
              </label>
              <input
                id="task-gitbranch-input"
                type="text"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                placeholder="feat/sso-auth"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
