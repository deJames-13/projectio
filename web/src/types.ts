export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface Member {
  id: string;
  name: string;
  username?: string | null;
  role: string;
  avatar: string;
  email: string;
  assignedTasksCount?: number;
  projectsCount?: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface SprintTelemetry {
  id: string;
  name: string;
  targetDate: string;
  daysRemaining: number;
  totalTasks: number;
  completedTasks: number;
  velocityPercentage: number;
}

export interface Task {
  id: string; // e.g. "APP-142"
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  priorityLabel: 'P0' | 'P1' | 'P2' | 'High' | 'Medium' | 'Low';
  team: string; // e.g. "Design Team", "Engineering", "Acme Corp"
  dueTime?: string | null; // e.g. "2:00 PM", "4:30 PM", "Tomorrow", "Oct 24"
  dateRange?: string | null; // e.g. "Oct 12 - Oct 24"
  assignee: Member;
  coAssignees?: Member[];
  completed: boolean;
  projectId?: string | null;
  gitBranch?: string | null; // e.g. "feat/cursor-sync"
  blocks?: string | null; // e.g. "APP-145"
  blockedBy?: string[];
  subtasks?: Subtask[];
  comments?: {
    id: string;
    author: Member;
    text: string;
    timeAgo: string;
    createdAt?: string | Date;
  }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'on-track' | 'at-risk' | 'completed' | 'delayed';
  statusLabel: string;
  progress: number;
  activeTasksCount: number;
  creatorId?: string | null;
  creator?: Member | null;
  members: Member[];
  iconType: 'palette' | 'rocket' | 'web' | 'layers' | 'code' | 'sparkles';
  accentColor: string;
  launchedDate?: string | null;
}

export interface ActivityItem {
  id: string;
  user: Member;
  action: string;
  target: string;
  targetId?: string | null;
  timeAgo: string;
  board: string;
  comment?: string | null;
  type: 'move' | 'comment' | 'create' | 'status_change';
  createdAt?: string | Date;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  team: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface DocItem {
  id: string;
  title: string;
  author: Member;
  updatedAt: string;
  category: string;
  content: string;
  starred?: boolean;
  projectId?: string | null;
  projectName?: string | null;
}

export interface NotificationItem {
  id: string;
  user: Member;
  text: string;
  timeAgo: string;
  read: boolean;
  type: 'mention' | 'assignment' | 'milestone' | 'comment';
  taskId?: string | null;
  createdAt?: string | Date;
}
