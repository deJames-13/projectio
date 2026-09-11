"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Home, 
  Inbox, 
  CheckSquare, 
  FolderOpen, 
  FileText, 
  Settings, 
  Plus, 
  Layers, 
  ChevronsUpDown,
  Compass,
  Users
} from 'lucide-react';
import type { Member } from '~/types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewTask: () => void;
  currentUser: Member;
  unreadCount?: number;
  workspaceName?: string;
  myTasksCount?: number;
  projectsCount?: number;
  membersCount?: number;
  docsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTask,
  currentUser,
  unreadCount = 2,
  workspaceName = 'Enterprise Workspace',
  myTasksCount,
  projectsCount,
  membersCount,
  docsCount,
}) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home, badge: undefined, href: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, badge: projectsCount, href: '/projects' },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: myTasksCount, href: '/tasks' },
    { id: 'members', label: 'Members', icon: Users, badge: membersCount, href: '/members' },
    { id: 'docs', label: 'Documentation', icon: FileText, badge: docsCount, href: '/docs' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadCount, href: '/inbox' },
  ];

  return (
    <aside 
      id="main-sidebar"
      aria-label="Main Navigation Sidebar"
      className="w-[250px] h-screen bg-white fixed left-0 top-0 flex flex-col p-4 z-30 border-r border-slate-200 select-none shadow-xs"
    >
      {/* Brand Header */}
      <div className="mb-4">
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-slate-900 cursor-pointer hover:opacity-90 transition-opacity px-2 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('home');
            }
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">Projectio</span>
            <span className="text-[11px] font-medium text-slate-500">Enterprise Workspace</span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div 
          id="workspace-switcher-btn"
          className="mt-3 flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-slate-200"
          role="button"
          tabIndex={0}
        >
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-slate-800 truncate leading-tight">{workspaceName}</div>
            <div className="text-[10px] text-slate-500 truncate">{currentUser.role || 'Team Member'}</div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Sidebar Primary Navigation">
        <div className="px-3 pt-2 pb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Main</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              id={`nav-link-${item.id}`}
              href={item.href}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        <div className="pt-2">
          <Link
            id="nav-link-landing"
            href="/"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Overview &amp; Tour</span>
          </Link>
        </div>

        {/* Settings at Bottom */}
        <div className="mt-auto pt-3 border-t border-slate-200">
          <button
            id="nav-link-settings"
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              currentTab === 'settings'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Primary + New Action Button */}
      <button
        id="sidebar-new-task-btn"
        onClick={onOpenNewTask}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Plus className="w-4 h-4 text-white" />
        <span>New Task</span>
      </button>
    </aside>
  );
};
