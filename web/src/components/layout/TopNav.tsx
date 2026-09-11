"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, Plus, ChevronRight, Check, LogOut, Building2, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '~/contexts/ThemeContext';
import type { Member, NotificationItem, Project, Task } from '~/types';

interface TopNavProps {
  currentTab: string;
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
  currentUser: Member;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onSelectTaskFromNotification?: (taskId: string) => void;
  workspaceName?: string;
  onLogout?: () => void;
  currentProject?: Project | null;
  projectSubTab?: string;
  selectedTask?: Task | null;
  onNavigateBreadcrumb?: (target: 'user' | 'workspace' | 'project' | 'subTab' | 'task') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onOpenCommandPalette,
  onOpenNewTask,
  currentUser,
  notifications,
  onMarkNotificationRead,
  onSelectTaskFromNotification,
  workspaceName = "Workspace",
  onLogout,
  currentProject,
  projectSubTab = 'tasks',
  selectedTask,
  onNavigateBreadcrumb
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read);

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'home': return 'Dashboard';
      case 'inbox': return 'Inbox';
      case 'tasks': return 'My Tasks';
      case 'projects': return 'Projects';
      case 'members': return 'Members';
      case 'docs': return 'Documentation';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const userHandle = currentUser.username ? `@${currentUser.username}` : (currentUser.name.split(' ')[0]?.toLowerCase() ?? 'dej');

  return (
    <header 
      id="top-navbar"
      className="h-14 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200"
    >
      <div className="flex items-center gap-3 max-w-[65%]">
        {/* Topbar Brand Logo: perfectly fitted whole image */}
        <Link
          href="/dashboard"
          className="flex items-center shrink-0 rounded-lg p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group"
          aria-label="Projectio home"
        >
          <div className="flex items-center h-7 py-0.5">
            <Image
              src={isDark ? "/images/title-light-500.png" : "/images/title-dark-500.png"}
              alt="Projectio"
              width={98}
              height={30}
              className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
        </Link>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

        {/* Breadcrumb Trail: dej > Workspace > Project > Tasks > Task */}
        <nav aria-label="Breadcrumb Navigation" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium overflow-x-auto py-1">
        {/* 1. User Name Handle */}
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb?.('user')}
          className="hover:text-blue-600 cursor-pointer transition-colors font-semibold text-slate-700 truncate max-w-[100px] focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1"
          title={`User: ${currentUser.name}`}
        >
          {userHandle}
        </button>

        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

        {/* 2. Workspace Name */}
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb?.('workspace')}
          className="hover:text-blue-600 cursor-pointer transition-colors font-semibold text-slate-700 truncate max-w-[130px] focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1"
          title={`Workspace: ${workspaceName}`}
        >
          {workspaceName}
        </button>

        {/* 3. Project Name (if within project context) */}
        {currentProject && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => onNavigateBreadcrumb?.('project')}
              className="hover:text-blue-600 cursor-pointer transition-colors font-semibold text-slate-700 truncate max-w-[140px] focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1"
              title={`Project: ${currentProject.title}`}
            >
              {currentProject.title}
            </button>
          </>
        )}

        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

        {/* 4. SubTab / View Mode (Tasks, Members, Docs, Settings or top-level Tab) */}
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb?.('subTab')}
          className={`transition-colors font-semibold truncate max-w-[120px] focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1 ${
            selectedTask ? 'text-slate-600 hover:text-blue-600 cursor-pointer' : 'text-slate-900 cursor-default'
          }`}
        >
          {currentProject 
            ? (projectSubTab.charAt(0).toUpperCase() + projectSubTab.slice(1)) 
            : getBreadcrumbTitle(currentTab)}
        </button>

        {/* 5. Task (if selected) */}
        {selectedTask && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span 
              className="text-blue-700 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 font-bold truncate max-w-[160px]"
              title={`${selectedTask.id}: ${selectedTask.title}`}
            >
              {selectedTask.id}
            </span>
          </>
        )}
      </nav>
      </div>

      {/* Center Search / Command Palette Bar */}
      <div className="flex-1 max-w-md mx-6">
        <button
          id="global-search-btn"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 transition-all group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              id="notifications-popover"
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 px-1">
                <h4 className="font-semibold text-xs text-slate-900">Notifications</h4>
                <span className="text-[11px] font-medium text-slate-500">{unreadNotifications.length} unread</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar mt-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.taskId && onSelectTaskFromNotification) {
                          onSelectTaskFromNotification(n.taskId);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 my-0.5 ${
                        !n.read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0 opacity-80" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 leading-snug">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{n.timeAgo}</span>
                      </div>
                      {!n.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkNotificationRead(n.id);
                          }}
                          className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-900"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary + New Action */}
        <button
          id="top-nav-new-btn"
          onClick={onOpenNewTask}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Task</span>
        </button>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            id="user-profile-avatar-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full cursor-pointer"
          >
            <img
              id="user-profile-avatar"
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shadow-2xs hover:opacity-90 transition-opacity"
            />
          </button>

          {showProfileMenu && (
            <div
              id="profile-popover"
              className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{userHandle}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded w-fit">
                  <Building2 className="w-2.5 h-2.5" />
                  <span className="truncate">{workspaceName}</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings?tab=profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile &amp; Role</span>
                </Link>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
