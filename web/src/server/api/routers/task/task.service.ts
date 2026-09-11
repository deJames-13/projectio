import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export interface TaskFilterInput {
  projectId?: string;
  status?: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority?: "P0" | "P1" | "P2" | "P3" | "High" | "Medium" | "Low";
  assigneeId?: string;
  search?: string;
}

export interface CreateTaskInput {
  id?: string;
  title: string;
  description?: string;
  status?: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority?: "P0" | "P1" | "P2" | "P3" | "High" | "Medium" | "Low";
  priorityLabel?: string;
  team?: string;
  dueTime?: string;
  dateRange?: string;
  completed?: boolean;
  gitBranch?: string;
  blocks?: string;
  assigneeId: string;
  coAssigneeIds?: string[];
  projectId?: string;
  workspaceId: string;
  userId: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  status?: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority?: "P0" | "P1" | "P2" | "P3" | "High" | "Medium" | "Low";
  priorityLabel?: string;
  team?: string;
  dueTime?: string | null;
  dateRange?: string | null;
  completed?: boolean;
  gitBranch?: string | null;
  blocks?: string | null;
  assigneeId?: string;
  coAssigneeIds?: string[];
  projectId?: string | null;
  workspaceId: string;
}

export const taskService = {
  /**
   * List tasks within workspace
   */
  async getAll(db: PrismaClient, workspaceId: string, input?: TaskFilterInput) {
    const whereClause: NonNullable<Parameters<typeof db.task.findMany>[0]>["where"] = {
      workspaceId,
    };

    if (input?.projectId) {
      whereClause.projectId = input.projectId;
    }

    if (input?.status) {
      whereClause.status = input.status;
    }

    if (input?.priority) {
      whereClause.priority = input.priority;
    }

    if (input?.assigneeId) {
      whereClause.assigneeId = input.assigneeId;
    }

    if (input?.search) {
      whereClause.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
        { id: { contains: input.search, mode: "insensitive" } },
      ];
    }

    return db.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        assignee: true,
        coAssignees: true,
        project: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  /**
   * Get task by ID within workspace
   */
  async getById(db: PrismaClient, workspaceId: string, id: string) {
    const task = await db.task.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        assignee: true,
        coAssignees: true,
        project: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${id}' not found in this workspace`,
      });
    }

    return task;
  },

  /**
   * Create a new task in workspace
   */
  async create(db: PrismaClient, input: CreateTaskInput) {
    let taskId = input.id;
    if (!taskId) {
      let candidateNum = (await db.task.count()) + 140;
      while (await db.task.findUnique({ where: { id: `APP-${candidateNum}` } })) {
        candidateNum++;
      }
      taskId = `APP-${candidateNum}`;
    }

    const isCompleted = input.completed ?? input.status === "done";
    const priority = input.priority ?? "Medium";
    const priorityLabel = input.priorityLabel ?? priority;

    const createdTask = await db.task.create({
      data: {
        id: taskId,
        workspaceId: input.workspaceId,
        title: input.title,
        description: input.description,
        status: isCompleted ? "done" : (input.status ?? "todo"),
        priority,
        priorityLabel,
        team: input.team ?? "Engineering",
        dueTime: input.dueTime,
        dateRange: input.dateRange,
        completed: isCompleted,
        gitBranch: input.gitBranch,
        blocks: input.blocks,
        assigneeId: input.assigneeId,
        coAssignees: input.coAssigneeIds?.length
          ? { connect: input.coAssigneeIds.map((id) => ({ id })) }
          : undefined,
        projectId: input.projectId,
      },
      include: {
        assignee: true,
        coAssignees: true,
        project: true,
        comments: {
          include: { author: true },
        },
      },
    });

    // Record activity
    await db.activity
      .create({
        data: {
          id: `act-${Date.now()}`,
          workspaceId: input.workspaceId,
          action: "created",
          target: createdTask.title,
          targetId: createdTask.id,
          timeAgo: "Just now",
          board: createdTask.team,
          type: "create",
          userId: input.userId,
        },
      })
      .catch(() => null);

    return createdTask;
  },

  /**
   * Update task in workspace
   */
  async update(db: PrismaClient, input: UpdateTaskInput) {
    const { id, coAssigneeIds, assigneeId, projectId, workspaceId, ...rest } = input;

    const existing = await db.task.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${id}' not found in this workspace`,
      });
    }

    let nextStatus = rest.status ?? existing.status;
    let nextCompleted = rest.completed ?? existing.completed;

    if (rest.status !== undefined && rest.completed === undefined) {
      nextCompleted = rest.status === "done";
    } else if (rest.completed !== undefined && rest.status === undefined) {
      if (rest.completed) {
        nextStatus = "done";
      } else if (existing.status === "done") {
        nextStatus = "in-progress";
      }
    }

    const updateData: NonNullable<Parameters<typeof db.task.update>[0]>["data"] = {
      ...rest,
      status: nextStatus,
      completed: nextCompleted,
    };

    if (assigneeId) {
      updateData.assignee = { connect: { id: assigneeId } };
    }

    if (coAssigneeIds !== undefined) {
      updateData.coAssignees = {
        set: coAssigneeIds.map((memberId) => ({ id: memberId })),
      };
    }

    if (projectId !== undefined) {
      if (projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        updateData.project = { connect: { id: projectId } };
      }
    }

    return db.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: true,
        coAssignees: true,
        project: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  /**
   * Update task status (drag & drop)
   */
  async updateStatus(
    db: PrismaClient,
    workspaceId: string,
    userId: string,
    id: string,
    status: "backlog" | "todo" | "in-progress" | "review" | "done",
    completed?: boolean,
  ) {
    const existing = await db.task.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${id}' not found in this workspace`,
      });
    }

    const isCompleted = completed ?? status === "done";

    const task = await db.task.update({
      where: { id },
      data: {
        status,
        completed: isCompleted,
      },
      include: {
        assignee: true,
        coAssignees: true,
        project: true,
      },
    });

    // Record activity
    await db.activity
      .create({
        data: {
          id: `act-${Date.now()}`,
          workspaceId,
          action: "moved",
          target: task.title,
          targetId: task.id,
          timeAgo: "Just now",
          board: `${task.team} Board`,
          type: "move",
          userId,
        },
      })
      .catch(() => null);

    return task;
  },

  /**
   * Toggle completion status
   */
  async toggleComplete(db: PrismaClient, workspaceId: string, userId: string, id: string) {
    const existing = await db.task.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${id}' not found in this workspace`,
      });
    }

    const nextCompleted = !existing.completed;
    const nextStatus = nextCompleted ? "done" : "in-progress";

    const updated = await db.task.update({
      where: { id },
      data: {
        completed: nextCompleted,
        status: nextStatus,
      },
      include: {
        assignee: true,
        coAssignees: true,
        project: true,
      },
    });

    await db.activity
      .create({
        data: {
          id: `act-${Date.now()}`,
          workspaceId,
          action: nextCompleted ? "completed" : "reopened",
          target: updated.title,
          targetId: updated.id,
          timeAgo: "Just now",
          board: updated.team,
          type: "status_change",
          userId,
        },
      })
      .catch(() => null);

    return updated;
  },

  /**
   * Delete task
   */
  async delete(db: PrismaClient, workspaceId: string, id: string) {
    const existing = await db.task.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${id}' not found in this workspace`,
      });
    }

    return db.task.delete({
      where: { id },
    });
  },
};
