"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '~/contexts/AuthContext';
import { api } from '~/trpc/react';
import type { 
  Task, 
  Project, 
  ActivityItem, 
  Milestone, 
  DocItem, 
  NotificationItem, 
  TaskStatus, 
  Priority,
  Member 
} from '~/types';

interface WorkspaceContextType {
  // Data
  currentWorkspace: { id: string; name: string; slug: string } | null;
  currentUser: Member;
  members: Member[];
  projects: Project[];
  tasks: Task[];
  myTasks: Task[];
  activities: ActivityItem[];
  milestones: Milestone[];
  docs: DocItem[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Statuses
  isLoading: boolean;
  isInitialLoading: boolean;
  hasError: boolean;
  refetchAll: () => Promise<void>;

  // Interactive drawer and modal controls
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  selectTaskById: (taskId: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
  newTaskDefaultStatus: TaskStatus;
  newTaskDefaultProjectId: string | null;
  openNewTaskModal: (defaultStatus?: TaskStatus, defaultProjectId?: string | null) => void;
  closeNewTaskModal: () => void;

  // Active Project & SubTab tracking for deep routing & breadcrumbs
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  activeProjectSubTab: string;
  setActiveProjectSubTab: (subTab: string) => void;

  // Task Mutations
  handleCreateTask: (task: Task) => void;
  handleUpdateTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  handleToggleTaskComplete: (taskId: string) => void;
  handleUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Project Mutations
  handleCreateProject: (project: {
    title: string;
    description: string;
    status: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType: string;
    accentColor: string;
    memberIds?: string[];
  }) => Promise<string | undefined>;
  handleUpdateProject: (p: {
    id: string;
    title?: string;
    description?: string;
    status?: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType?: string;
    accentColor?: string;
    progress?: number;
  }) => void;
  handleDeleteProject: (projectId: string) => void;
  handleAddProjectMember: (projectId: string, userId: string) => void;
  handleRemoveProjectMember: (projectId: string, userId: string) => void;

  // Doc Mutations
  handleCreateDoc: (doc: DocItem) => void;
  handleUpdateDoc: (doc: DocItem) => void;
  handleDeleteDoc: (docId: string) => void;

  // Member Mutations
  handleAddMember: (member: Member) => void;

  // Notification Mutations
  handleMarkNotificationRead: (id: string) => void;
  handleMarkAllRead: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl';

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const utils = api.useUtils();

  // Active Workspace
  const { data: currentWorkspace } = api.workspace.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Queries
  const { 
    data: membersData = [], 
    isLoading: membersLoading, 
    isError: membersError, 
    refetch: refetchMembers 
  } = api.member.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: currentUserData, 
  } = api.member.getCurrent.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: tasksData = [], 
    isLoading: tasksLoading, 
    isError: tasksError, 
    refetch: refetchTasks 
  } = api.task.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: projectsData = [], 
    isLoading: projectsLoading, 
    isError: projectsError, 
    refetch: refetchProjects 
  } = api.project.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: activitiesData = [], 
    refetch: refetchActivities
  } = api.activity.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: milestonesData = [], 
    refetch: refetchMilestones
  } = api.milestone.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: docsData = [], 
    isError: docsError, 
    refetch: refetchDocs 
  } = api.doc.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const { 
    data: notificationsData = [], 
    refetch: refetchNotifications
  } = api.notification.getAll.useQuery(undefined, { enabled: isAuthenticated });

  // Data mappings
  const toMember = (u?: {
    id?: string | null;
    name?: string | null;
    username?: string | null;
    role?: string | null;
    avatar?: string | null;
    image?: string | null;
    email?: string | null;
  } | null): Member => ({
    id: u?.id ?? 'unknown',
    name: u?.name ?? 'Team Member',
    username: u?.username ?? null,
    role: u?.role ?? 'Member',
    avatar: u?.avatar ?? u?.image ?? DEFAULT_AVATAR,
    email: u?.email ?? '',
  });

  const members: Member[] = useMemo(() => {
    return membersData.map((m) => toMember(m));
  }, [membersData]);

  const currentUser: Member = useMemo(() => {
    if (currentUserData) {
      return toMember(currentUserData);
    }
    return (
      members[0] ?? {
        id: 'user-dej',
        name: 'Dej Espinosa',
        username: 'dej',
        role: 'Product Lead',
        email: 'derickjames.espinosa@gmail.com',
        avatar: DEFAULT_AVATAR,
      }
    );
  }, [currentUserData, members]);

  const projects: Project[] = useMemo(() => {
    return projectsData.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status as Project['status'],
      statusLabel: p.statusLabel,
      progress: p.progress,
      activeTasksCount: p.activeTasksCount || p._count?.tasks || 0,
      creatorId: p.creatorId,
      creator: p.creator ? toMember(p.creator) : null,
      members: (p.members ?? []).map((m) => toMember(m)),
      iconType: p.iconType as Project['iconType'],
      accentColor: p.accentColor,
      launchedDate: p.launchedDate,
    }));
  }, [projectsData]);

  const tasks: Task[] = useMemo(() => {
    return tasksData.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as TaskStatus,
      priority: t.priority as Priority,
      priorityLabel: t.priorityLabel as Task['priorityLabel'],
      team: t.team,
      dueTime: t.dueTime,
      dateRange: t.dateRange,
      completed: t.completed,
      projectId: t.projectId,
      gitBranch: t.gitBranch,
      blocks: t.blocks,
      assignee: toMember(t.assignee),
      coAssignees: (t.coAssignees ?? []).map((c) => toMember(c)),
      comments: (t.comments ?? []).map((c) => ({
        id: c.id,
        text: c.text,
        timeAgo: c.timeAgo,
        author: toMember(c.author),
        createdAt: c.createdAt,
      })),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }, [tasksData]);

  const myTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.assignee?.id === currentUser.id ||
        t.coAssignees?.some((c) => c.id === currentUser.id)
    );
  }, [tasks, currentUser.id]);

  const activities: ActivityItem[] = useMemo(() => {
    return activitiesData.map((a) => ({
      id: a.id,
      user: toMember(a.user),
      action: a.action,
      target: a.target,
      targetId: a.targetId,
      timeAgo: a.timeAgo,
      board: a.board,
      comment: a.comment,
      type: a.type as ActivityItem['type'],
      createdAt: a.createdAt,
    }));
  }, [activitiesData]);

  const milestones: Milestone[] = useMemo(() => {
    return milestonesData.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      team: m.team,
      status: m.status as Milestone['status'],
    }));
  }, [milestonesData]);

  const docs: DocItem[] = useMemo(() => {
    return docsData.map((d) => ({
      id: d.id,
      title: d.title,
      author: toMember(d.author),
      updatedAt: d.updatedAt,
      category: d.category,
      content: d.content,
      starred: d.starred,
      projectId: d.projectId,
      projectName: d.project?.title,
    }));
  }, [docsData]);

  const notifications: NotificationItem[] = useMemo(() => {
    return notificationsData.map((n) => ({
      id: n.id,
      user: toMember(n.user),
      text: n.text,
      timeAgo: n.timeAgo,
      read: n.read,
      type: n.type as NotificationItem['type'],
      taskId: n.taskId,
      createdAt: n.createdAt,
    }));
  }, [notificationsData]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Interactive UI Drawer / Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState<TaskStatus>('todo');
  const [newTaskDefaultProjectId, setNewTaskDefaultProjectId] = useState<string | null>(null);

  // Active Project & SubTab tracking for deep routing & breadcrumbs
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeProjectSubTab, setActiveProjectSubTab] = useState<string>('tasks');

  // Keep selectedTask fresh
  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find((t) => t.id === selectedTask.id);
      if (fresh && fresh !== selectedTask) {
        setSelectedTask(fresh);
      }
    }
  }, [tasks, selectedTask]);

  const openNewTaskModal = (status: TaskStatus = 'todo', projectId: string | null = null) => {
    setNewTaskDefaultStatus(status);
    setNewTaskDefaultProjectId(projectId);
    setIsNewTaskModalOpen(true);
  };

  const closeNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
  };

  const selectTaskById = (taskId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      setSelectedTask(found);
    }
  };

  // Keyboard shortcut listener for Cmd+K and C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (
        e.key.toLowerCase() === 'c' && 
        !isCommandPaletteOpen && 
        !isNewTaskModalOpen && 
        !selectedTask &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        openNewTaskModal('todo', null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isNewTaskModalOpen, selectedTask]);

  // Mutations
  const createTaskMutation = api.task.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.task.invalidate(),
        utils.activity.invalidate(),
        utils.project.invalidate(),
      ]);
    },
  });

  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.task.invalidate(),
        utils.activity.invalidate(),
      ]);
    },
  });

  const updateTaskStatusMutation = api.task.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.task.invalidate(),
        utils.activity.invalidate(),
      ]);
    },
  });

  const toggleCompleteMutation = api.task.toggleComplete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.task.invalidate(),
        utils.activity.invalidate(),
      ]);
    },
  });

  const deleteTaskMutation = api.task.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.task.invalidate(),
        utils.activity.invalidate(),
        utils.project.invalidate(),
      ]);
      setSelectedTask(null);
    },
  });

  const createCommentMutation = api.comment.create.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
    },
  });

  const createProjectMutation = api.project.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.project.invalidate(),
        utils.activity.invalidate(),
      ]);
    },
  });

  const updateProjectMutation = api.project.update.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
    },
  });

  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.project.invalidate(),
        utils.task.invalidate(),
      ]);
    },
  });

  const addProjectMemberMutation = api.project.addMember.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
    },
  });

  const removeProjectMemberMutation = api.project.removeMember.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
    },
  });

  const createDocMutation = api.doc.create.useMutation({
    onSuccess: async () => {
      await utils.doc.invalidate();
    },
  });

  const updateDocMutation = api.doc.update.useMutation({
    onSuccess: async () => {
      await utils.doc.invalidate();
    },
  });

  const deleteDocMutation = api.doc.delete.useMutation({
    onSuccess: async () => {
      await utils.doc.invalidate();
    },
  });

  const markNotificationReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: async () => {
      await utils.notification.invalidate();
    },
  });

  const markAllNotificationsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: async () => {
      await utils.notification.invalidate();
    },
  });

  const createMemberMutation = api.member.create.useMutation({
    onSuccess: async () => {
      await utils.member.invalidate();
    },
  });

  // Action handlers
  const handleToggleTaskComplete = (taskId: string) => {
    toggleCompleteMutation.mutate({ id: taskId });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const previous = tasks.find((t) => t.id === updatedTask.id);
    const prevComments = previous?.comments ?? [];
    const newComments = updatedTask.comments ?? [];

    if (newComments.length > prevComments.length) {
      const addedComment = newComments[newComments.length - 1];
      if (addedComment) {
        createCommentMutation.mutate({
          taskId: updatedTask.id,
          authorId: addedComment.author.id,
          text: addedComment.text,
          timeAgo: addedComment.timeAgo,
        });
      }
    }

    updateTaskMutation.mutate({
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      priorityLabel: updatedTask.priorityLabel,
      team: updatedTask.team,
      dueTime: updatedTask.dueTime,
      completed: updatedTask.completed,
      assigneeId: updatedTask.assignee?.id,
      projectId: updatedTask.projectId,
    });

    setSelectedTask(updatedTask);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate({ id: taskId });
  };

  const handleCreateTask = (newTask: Task) => {
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description ?? undefined,
      status: newTask.status,
      priority: newTask.priority,
      priorityLabel: newTask.priorityLabel,
      team: newTask.team,
      dueTime: newTask.dueTime ?? undefined,
      dateRange: newTask.dateRange ?? undefined,
      completed: newTask.completed,
      assigneeId: newTask.assignee.id,
      projectId: newTask.projectId ?? undefined,
      gitBranch: newTask.gitBranch ?? undefined,
    });
    closeNewTaskModal();
  };

  const handleCreateProject = async (newProj: {
    title: string;
    description: string;
    status: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType: string;
    accentColor: string;
    memberIds?: string[];
  }) => {
    const created = await createProjectMutation.mutateAsync({
      title: newProj.title,
      description: newProj.description,
      status: newProj.status,
      iconType: newProj.iconType,
      accentColor: newProj.accentColor,
      memberIds: newProj.memberIds,
    });
    return created?.id;
  };

  const handleUpdateProject = (p: {
    id: string;
    title?: string;
    description?: string;
    status?: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType?: string;
    accentColor?: string;
    progress?: number;
  }) => {
    updateProjectMutation.mutate(p);
  };

  const handleDeleteProject = (id: string) => {
    deleteProjectMutation.mutate({ id });
    router.push('/projects');
  };

  const handleAddProjectMember = (projectId: string, userId: string) => {
    addProjectMemberMutation.mutate({ projectId, userId });
  };

  const handleRemoveProjectMember = (projectId: string, userId: string) => {
    removeProjectMemberMutation.mutate({ projectId, userId });
  };

  const handleCreateDoc = (newDoc: DocItem) => {
    createDocMutation.mutate({
      title: newDoc.title,
      category: newDoc.category,
      content: newDoc.content,
      starred: newDoc.starred,
      updatedAt: newDoc.updatedAt,
      authorId: newDoc.author.id,
      projectId: newDoc.projectId,
    });
  };

  const handleUpdateDoc = (updatedDoc: DocItem) => {
    updateDocMutation.mutate({
      id: updatedDoc.id,
      title: updatedDoc.title,
      category: updatedDoc.category,
      content: updatedDoc.content,
      starred: updatedDoc.starred,
      updatedAt: updatedDoc.updatedAt,
      projectId: updatedDoc.projectId,
    });
  };

  const handleDeleteDoc = (docId: string) => {
    deleteDocMutation.mutate({ id: docId });
  };

  const handleAddMember = (m: Member) => {
    createMemberMutation.mutate({
      id: m.id,
      name: m.name,
      role: m.role,
      email: m.email,
      avatar: m.avatar,
    });
  };

  const handleMarkNotificationRead = (id: string) => {
    markNotificationReadMutation.mutate({ id });
  };

  const handleMarkAllRead = () => {
    markAllNotificationsReadMutation.mutate();
  };

  const refetchAll = async () => {
    await Promise.all([
      refetchTasks(),
      refetchProjects(),
      refetchMembers(),
      refetchActivities(),
      refetchMilestones(),
      refetchDocs(),
      refetchNotifications(),
    ]);
  };

  const isInitialLoading = (tasksLoading || projectsLoading || membersLoading) && tasks.length === 0;
  const hasError = Boolean(tasksError || projectsError || membersError || docsError);

  const value: WorkspaceContextType = {
    currentWorkspace: currentWorkspace ?? null,
    currentUser,
    members,
    projects,
    tasks,
    myTasks,
    activities,
    milestones,
    docs,
    notifications,
    unreadNotificationsCount,

    isLoading: authLoading || tasksLoading || projectsLoading,
    isInitialLoading,
    hasError,
    refetchAll,

    selectedTask,
    setSelectedTask,
    selectTaskById,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    newTaskDefaultStatus,
    newTaskDefaultProjectId,
    openNewTaskModal,
    closeNewTaskModal,

    activeProject,
    setActiveProject,
    activeProjectSubTab,
    setActiveProjectSubTab,

    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleTaskComplete,
    handleUpdateTaskStatus,

    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleAddProjectMember,
    handleRemoveProjectMember,

    handleCreateDoc,
    handleUpdateDoc,
    handleDeleteDoc,

    handleAddMember,

    handleMarkNotificationRead,
    handleMarkAllRead,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
