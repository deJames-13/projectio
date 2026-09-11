"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckSquare, 
  FolderOpen, 
  FileText, 
  Plus, 
  Home, 
  Settings,
  X,
  CornerDownLeft
} from 'lucide-react';
import type { Task, Project, DocItem } from '~/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  docs: DocItem[];
  onSelectTask: (task: Task) => void;
  onSelectProject: (projectId: string) => void;
  onSelectDoc?: (doc: DocItem) => void;
  onSelectTab?: (tab: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenNewTask: () => void;
  onOpenNewDoc?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  docs,
  onSelectTask,
  onSelectProject,
  onSelectDoc,
  onSelectTab,
  onNavigateTab,
  onOpenNewTask,
  onOpenNewDoc
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigateToTab = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigateTab) onNavigateTab(tab);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

interface PaletteItem {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  handler: () => void;
}

  // Build items list
  const navActions: PaletteItem[] = [
    { type: 'action', id: 'new-task', title: 'Create new task', subtitle: 'Task management', icon: Plus, handler: () => { onClose(); onOpenNewTask(); } },
    { type: 'action', id: 'new-doc', title: 'Create new document', subtitle: 'Documentation', icon: Plus, handler: () => { onClose(); if (onOpenNewDoc) onOpenNewDoc(); else navigateToTab('docs'); } },
    { type: 'nav', id: 'home', title: 'Go to Dashboard', subtitle: 'Navigation', icon: Home, handler: () => { onClose(); navigateToTab('home'); } },
    { type: 'nav', id: 'tasks', title: 'Go to Tasks Board', subtitle: 'Navigation', icon: CheckSquare, handler: () => { onClose(); navigateToTab('tasks'); } },
    { type: 'nav', id: 'projects', title: 'Go to Projects', subtitle: 'Navigation', icon: FolderOpen, handler: () => { onClose(); navigateToTab('projects'); } },
    { type: 'nav', id: 'docs', title: 'Go to Documentation', subtitle: 'Navigation', icon: FileText, handler: () => { onClose(); navigateToTab('docs'); } },
    { type: 'nav', id: 'settings', title: 'Go to Settings', subtitle: 'Navigation', icon: Settings, handler: () => { onClose(); navigateToTab('settings'); } },
  ];

  const matchedTasks: PaletteItem[] = tasks
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map(t => ({
      type: 'task',
      id: t.id,
      title: `${t.id}: ${t.title}`,
      subtitle: `${t.team} • ${t.priorityLabel || t.priority}`,
      icon: CheckSquare,
      handler: () => { onClose(); onSelectTask(t); }
    }));

  const matchedProjects: PaletteItem[] = projects
    .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(p => ({
      type: 'project',
      id: p.id,
      title: `Project: ${p.title}`,
      subtitle: `${p.statusLabel} • ${p.progress}%`,
      icon: FolderOpen,
      handler: () => { onClose(); onSelectProject(p.id); }
    }));

  const matchedDocs: PaletteItem[] = docs
    .filter(d => d.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(d => ({
      type: 'doc',
      id: d.id,
      title: `Doc: ${d.title}`,
      subtitle: d.category,
      icon: FileText,
      handler: () => { 
        onClose(); 
        if (onSelectDoc) onSelectDoc(d); 
        else navigateToTab('docs'); 
      }
    }));

  const allItems: PaletteItem[] = query.trim() === '' 
    ? [...navActions, ...matchedTasks.slice(0, 2), ...matchedProjects.slice(0, 2)]
    : [...matchedTasks, ...matchedProjects, ...matchedDocs, ...navActions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))];

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        current.handler();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleListKeyDown}
            placeholder="Type a command or search tasks, projects, docs..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or resources found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={item.handler}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                      <span>Select</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with ↑ ↓ or mouse</span>
          <span className="font-mono">ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
