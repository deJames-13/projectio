import type { PrismaClient } from "~/../generated/prisma";

export interface AnalyticsFilterInput {
  projectId?: string;
}

export interface DashboardKPIsResult {
  activeTasksCount: number;
  dueThisWeekCount: number;
  overdueCount: number;
  sprintProgress: number;
  totalTasksCount: number;
  completedTasksCount: number;
  sprintName: string;
  daysRemaining: number;
  breakdown: {
    urgentP0Count: number;
    blockingCount: number;
    pastDueCount: number;
  };
}

export interface BurndownPoint {
  dayIndex: number; // 0 to 13
  dayNumber: number; // 1 to 14
  date: string; // "Sep 12"
  fullDate: string; // ISO date string
  idealRemaining: number;
  actualRemaining: number | null; // null for future days
  completedCount: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface SprintBurndownResult {
  sprintName: string;
  startDate: string;
  targetDate: string;
  daysRemaining: number;
  totalTasks: number;
  completedTasks: number;
  currentRemaining: number;
  velocityPercentage: number;
  points: BurndownPoint[];
}

export interface TaskDistributionResult {
  byStatus: {
    backlog: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
  byPriority: {
    p0: number;
    p1: number;
    p2: number;
    p3: number;
  };
  totalTasks: number;
}

/**
 * Robust date parser for user-defined task dueTime strings.
 */
function parseDueTime(
  dueTimeStr: string | null | undefined,
  now: Date = new Date()
): { dueDate: Date | null; isDueThisWeek: boolean; isOverdue: boolean } {
  if (!dueTimeStr || dueTimeStr === "No date" || dueTimeStr === "Scheduled" || dueTimeStr === "–") {
    return { dueDate: null, isDueThisWeek: false, isOverdue: false };
  }

  const lower = dueTimeStr.toLowerCase().trim();

  // Calculate current week window (Monday 00:00:00 to Sunday 23:59:59)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let targetDate: Date | null = null;

  if (lower.includes("today")) {
    targetDate = new Date(now);
    targetDate.setHours(23, 59, 59, 999);
  } else if (lower.includes("tomorrow")) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(23, 59, 59, 999);
  } else if (lower.includes("yesterday")) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - 1);
    targetDate.setHours(23, 59, 59, 999);
  } else {
    // Attempt standard parse
    const parsed = new Date(dueTimeStr);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    } else {
      // e.g. "Oct 24" or "Oct 24, 2:00 PM" -> append current year
      const withYear = new Date(`${dueTimeStr}, ${now.getFullYear()}`);
      if (!isNaN(withYear.getTime())) {
        targetDate = withYear;
      }
    }
  }

  if (!targetDate) {
    return { dueDate: null, isDueThisWeek: false, isOverdue: false };
  }

  const isDueThisWeek = targetDate >= startOfWeek && targetDate <= endOfWeek;
  const isOverdue = targetDate < now;

  return { dueDate: targetDate, isDueThisWeek, isOverdue };
}

/**
 * Calculates a bi-weekly 14-day sprint cycle anchored to calendar year weeks.
 */
function getSprintCycle(now: Date = new Date()) {
  const currentYear = now.getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const daysSinceStart = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const sprintNumber = Math.floor(daysSinceStart / 14) + 1;

  // Align start to the Monday of the current 2-week block
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentWeekMonday = new Date(now);
  currentWeekMonday.setDate(currentWeekMonday.getDate() + diffToMonday);
  currentWeekMonday.setHours(0, 0, 0, 0);

  // If the sprint cycle started the previous Monday, anchor there
  const sprintIndexInFortnight = Math.floor((daysSinceStart % 14) / 7);
  const sprintStartDate = new Date(currentWeekMonday);
  if (sprintIndexInFortnight === 1) {
    sprintStartDate.setDate(sprintStartDate.getDate() - 7);
  }

  const sprintEndDate = new Date(sprintStartDate);
  sprintEndDate.setDate(sprintEndDate.getDate() + 13);
  sprintEndDate.setHours(23, 59, 59, 999);

  const daysRemaining = Math.max(0, Math.ceil((sprintEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    sprintName: `Sprint ${sprintNumber}`,
    startDate: sprintStartDate,
    endDate: sprintEndDate,
    daysRemaining,
  };
}

export const analyticsService = {
  /**
   * Retrieves aggregated KPI stats for the dashboard stat cards.
   */
  async getDashboardKPIs(
    db: PrismaClient,
    workspaceId: string,
    input?: AnalyticsFilterInput
  ): Promise<DashboardKPIsResult> {
    const whereClause: Parameters<typeof db.task.findMany>[0] = {
      where: {
        workspaceId,
        ...(input?.projectId ? { projectId: input.projectId } : {}),
      },
      select: {
        id: true,
        status: true,
        completed: true,
        dueTime: true,
        priority: true,
        priorityLabel: true,
        blocks: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    const tasks = await db.task.findMany(whereClause);
    const now = new Date();
    const sprint = getSprintCycle(now);

    let activeTasksCount = 0;
    let dueThisWeekCount = 0;
    let overdueCount = 0;
    let urgentP0Count = 0;
    let blockingCount = 0;
    let pastDueCount = 0;
    let completedTasksCount = 0;

    for (const task of tasks) {
      const isCompleted = task.completed || task.status === "done";
      if (isCompleted) {
        completedTasksCount++;
      } else {
        activeTasksCount++;

        // Evaluate due dates
        const { isDueThisWeek, isOverdue } = parseDueTime(task.dueTime, now);
        if (isDueThisWeek) {
          dueThisWeekCount++;
        }
        if (isOverdue) {
          pastDueCount++;
        }

        // Evaluate priority & blocking
        const isUrgent =
          task.priority === "P0" ||
          task.priority === "High" ||
          task.priorityLabel === "P0" ||
          task.priorityLabel === "High";
        if (isUrgent) {
          urgentP0Count++;
        }

        const isBlocking = Boolean(task.blocks && task.blocks.trim() !== "");
        if (isBlocking) {
          blockingCount++;
        }

        // Action required if past due, urgent P0/High, or blocking other tasks
        if (isOverdue || isUrgent || isBlocking) {
          overdueCount++;
        }
      }
    }

    const totalTasksCount = tasks.length;
    const sprintProgress =
      totalTasksCount > 0 ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 100)) : 0;

    return {
      activeTasksCount,
      dueThisWeekCount,
      overdueCount,
      sprintProgress,
      totalTasksCount,
      completedTasksCount,
      sprintName: sprint.sprintName,
      daysRemaining: sprint.daysRemaining,
      breakdown: {
        urgentP0Count,
        blockingCount,
        pastDueCount,
      },
    };
  },

  /**
   * Generates a 14-day Sprint Burndown trajectory comparing ideal burn vs real completions.
   */
  async getSprintBurndown(
    db: PrismaClient,
    workspaceId: string,
    input?: AnalyticsFilterInput
  ): Promise<SprintBurndownResult> {
    const now = new Date();
    const sprint = getSprintCycle(now);

    const whereClause: Parameters<typeof db.task.findMany>[0] = {
      where: {
        workspaceId,
        ...(input?.projectId ? { projectId: input.projectId } : {}),
      },
      select: {
        id: true,
        status: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    const tasks = await db.task.findMany(whereClause);
    const totalTasks = tasks.length;

    // Filter completed tasks
    const completedTasks = tasks.filter((t) => t.completed || t.status === "done");
    const completedCount = completedTasks.length;
    const currentRemaining = Math.max(0, totalTasks - completedCount);
    const velocityPercentage =
      totalTasks > 0 ? Math.min(100, Math.round((completedCount / totalTasks) * 100)) : 0;

    // Build 14 daily points
    const points: BurndownPoint[] = [];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let dayIdx = 0; dayIdx < 14; dayIdx++) {
      const dayDate = new Date(sprint.startDate);
      dayDate.setDate(dayDate.getDate() + dayIdx);
      dayDate.setHours(23, 59, 59, 999);

      const dayStart = new Date(dayDate);
      dayStart.setHours(0, 0, 0, 0);

      const isToday =
        now >= dayStart &&
        now <= dayDate;

      const isFuture = dayStart > now;

      // Linear ideal burn from totalTasks down to 0 at day 13
      const idealRemaining =
        totalTasks > 0
          ? Math.max(0, Math.round(totalTasks * (1 - dayIdx / 13)))
          : 0;

      let actualRemaining: number | null = null;
      let completedToDay = 0;

      if (!isFuture) {
        // Count tasks completed on or before this day's end
        completedToDay = completedTasks.filter((t) => {
          const compDate = new Date(t.updatedAt || t.createdAt);
          return compDate <= dayDate;
        }).length;

        actualRemaining = Math.max(0, totalTasks - completedToDay);
      }

      points.push({
        dayIndex: dayIdx,
        dayNumber: dayIdx + 1,
        date: `${monthNames[dayDate.getMonth()]} ${dayDate.getDate()}`,
        fullDate: dayDate.toISOString(),
        idealRemaining,
        actualRemaining,
        completedCount: completedToDay,
        isToday,
        isFuture,
      });
    }

    const targetDateStr = `${monthNames[sprint.endDate.getMonth()]} ${sprint.endDate.getDate()}`;
    const startDateStr = `${monthNames[sprint.startDate.getMonth()]} ${sprint.startDate.getDate()}`;

    return {
      sprintName: `${sprint.sprintName} Trajectory`,
      startDate: startDateStr,
      targetDate: targetDateStr,
      daysRemaining: sprint.daysRemaining,
      totalTasks,
      completedTasks: completedCount,
      currentRemaining,
      velocityPercentage,
      points,
    };
  },

  /**
   * Aggregates task distribution by status and priority.
   */
  async getTaskDistribution(
    db: PrismaClient,
    workspaceId: string,
    input?: AnalyticsFilterInput
  ): Promise<TaskDistributionResult> {
    const tasks = await db.task.findMany({
      where: {
        workspaceId,
        ...(input?.projectId ? { projectId: input.projectId } : {}),
      },
      select: {
        status: true,
        priority: true,
        priorityLabel: true,
      },
    });

    const byStatus = {
      backlog: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
    };

    const byPriority = {
      p0: 0,
      p1: 0,
      p2: 0,
      p3: 0,
    };

    for (const task of tasks) {
      // Map status
      if (task.status === "backlog") byStatus.backlog++;
      else if (task.status === "todo") byStatus.todo++;
      else if (task.status === "in-progress") byStatus.inProgress++;
      else if (task.status === "review") byStatus.review++;
      else if (task.status === "done") byStatus.done++;

      // Map priority
      const p = (task.priority || task.priorityLabel || "").toUpperCase();
      if (p.includes("P0") || p.includes("HIGH")) byPriority.p0++;
      else if (p.includes("P1") || p.includes("MEDIUM")) byPriority.p1++;
      else if (p.includes("P2") || p.includes("LOW")) byPriority.p2++;
      else byPriority.p3++;
    }

    return {
      byStatus,
      byPriority,
      totalTasks: tasks.length,
    };
  },
};
