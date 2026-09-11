"use client";

import React, { type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '~/contexts/AuthContext';
import { useWorkspace } from '~/contexts/WorkspaceContext';
import { Sidebar } from '~/components/Sidebar';
import { TopNav } from '~/components/TopNav';
import { TaskDetailDrawer } from '~/components/TaskDetailDrawer';
import { CommandPalette } from '~/components/CommandPalette';
import { NewTaskModal } from '~/components/NewTaskModal';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { Project } from '~/types';

interface WorkspaceShellProps {
  children: ReactNode;
  currentProject?: Project | null;
  projectSubTab?: string;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ 
  children,
  currentProject,
  projectSubTab,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const workspace = useWorkspace();

  const effectiveProject = currentProject ?? workspace.activeProject;
  const effectiveProjectSubTab = projectSubTab ?? workspace.activeProjectSubTab ?? 'tasks';

  // Redirect to login if unauthenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Compute currentTab from pathname
  const currentTab = React.useMemo(() => {
    if (pathname.startsWith('/projects') || pathname.startsWith('/project')) return 'projects';
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/members')) return 'members';
    if (pathname.startsWith('/docs')) return 'docs';
    if (pathname.startsWith('/inbox')) return 'inbox';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'home';
  }, [pathname]);

  // 1. Auth Loading State
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Checking credentials…</span>
        </div>
      </div>
    );
  }

  // 2. Data Connection Error State
  if (workspace.hasError && workspace.tasks.length === 0 && workspace.projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-xl p-6 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Database Connection Error</h2>
            <p className="text-xs text-slate-500 mt-1">
              Could not retrieve workspace entities from the database. Please check your network and database credentials.
            </p>
          </div>
          <button
            onClick={() => void workspace.refetchAll()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 3. Initial Skeleton Loading State
  if (workspace.isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans animate-pulse">
        {/* Sidebar Skeleton */}
        <div className="w-[250px] bg-white border-r border-slate-200 p-4 flex flex-col justify-between fixed h-full">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 bg-slate-100 rounded-lg w-full" />
              ))}
            </div>
          </div>
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 ml-[250px] min-h-screen flex flex-col">
          <div className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-40 bg-slate-100 rounded-lg" />
              <div className="w-8 h-8 rounded-full bg-slate-200" />
            </div>
          </div>
          <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="h-8 w-64 bg-slate-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                  <div className="h-7 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleNavigateBreadcrumb = (target: 'user' | 'workspace' | 'project' | 'subTab' | 'task') => {
    if (target === 'user' || target === 'workspace') {
      router.push('/dashboard');
    } else if (target === 'project') {
      if (effectiveProject) {
        router.push(`/projects/${effectiveProject.id}`);
      } else {
        router.push('/projects');
      }
    } else if (target === 'subTab') {
      if (effectiveProject) {
        router.push(`/projects/${effectiveProject.id}?tab=${effectiveProjectSubTab}`);
      }
    } else if (target === 'task') {
      // Keep task drawer open
    }
  };

  const handleSelectTab = (tab: string) => {
    switch (tab) {
      case 'home':
        router.push('/dashboard');
        break;
      case 'projects':
        router.push('/projects');
        break;
      case 'tasks':
        router.push('/tasks');
        break;
      case 'members':
        router.push('/members');
        break;
      case 'docs':
        router.push('/docs');
        break;
      case 'inbox':
        router.push('/inbox');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenNewTask={() => workspace.openNewTaskModal('todo', effectiveProject?.id ?? null)}
        currentUser={workspace.currentUser}
        unreadCount={workspace.unreadNotificationsCount}
        workspaceName={workspace.currentWorkspace?.name ?? 'Enterprise Workspace'}
        myTasksCount={workspace.myTasks.length}
        projectsCount={workspace.projects.length}
        membersCount={workspace.members.length}
        docsCount={workspace.docs.length}
      />

      {/* Main Content Area (offset by sidebar width 250px) */}
      <div className="flex-1 ml-[250px] min-h-screen flex flex-col">
        {/* Sticky Top Navigation Bar */}
        <TopNav
          currentTab={currentTab}
          currentProject={effectiveProject}
          projectSubTab={effectiveProjectSubTab}
          selectedTask={workspace.selectedTask}
          onNavigateBreadcrumb={handleNavigateBreadcrumb}
          onOpenCommandPalette={() => workspace.setIsCommandPaletteOpen(true)}
          onOpenNewTask={() => workspace.openNewTaskModal('todo', effectiveProject?.id ?? null)}
          currentUser={workspace.currentUser}
          notifications={workspace.notifications}
          onMarkNotificationRead={workspace.handleMarkNotificationRead}
          onSelectTaskFromNotification={workspace.selectTaskById}
          workspaceName={workspace.currentWorkspace?.name ?? 'Enterprise Workspace'}
          onLogout={logout}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 pb-16">
          {children}
        </main>
      </div>

      {/* Global Task Detail Drawer */}
      {workspace.selectedTask && (
        <TaskDetailDrawer
          task={workspace.selectedTask}
          isOpen={true}
          onClose={() => workspace.setSelectedTask(null)}
          onUpdateTask={workspace.handleUpdateTask}
          onDeleteTask={workspace.handleDeleteTask}
          allTasks={workspace.tasks}
          members={workspace.members}
          projects={workspace.projects}
          currentUser={workspace.currentUser}
          onSelectAnotherTask={workspace.selectTaskById}
        />
      )}

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={workspace.isCommandPaletteOpen}
        onClose={() => workspace.setIsCommandPaletteOpen(false)}
        onSelectTask={(t) => workspace.setSelectedTask(t)}
        onSelectProject={(pId) => router.push(`/projects/${pId}`)}
        onSelectDoc={() => router.push('/docs')}
        onOpenNewTask={() => workspace.openNewTaskModal('todo', null)}
        onOpenNewDoc={() => router.push('/docs')}
        onNavigateTab={(tab) => handleSelectTab(tab)}
        tasks={workspace.tasks}
        docs={workspace.docs}
        projects={workspace.projects}
      />

      {/* Global New Task Creation Modal */}
      <NewTaskModal
        isOpen={workspace.isNewTaskModalOpen}
        onClose={workspace.closeNewTaskModal}
        onCreateTask={workspace.handleCreateTask}
        members={workspace.members}
        projects={workspace.projects}
        defaultStatus={workspace.newTaskDefaultStatus}
        defaultProjectId={workspace.newTaskDefaultProjectId}
      />
    </div>
  );
};
