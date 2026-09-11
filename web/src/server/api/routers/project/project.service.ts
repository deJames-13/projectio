import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

const statusLabelMap: Record<string, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  completed: "Completed",
  delayed: "Delayed",
};

export interface CreateProjectInput {
  id?: string;
  title: string;
  description?: string;
  status?: "on-track" | "at-risk" | "completed" | "delayed";
  statusLabel?: string;
  progress?: number;
  activeTasksCount?: number;
  iconType?: string;
  accentColor?: string;
  launchedDate?: string;
  memberIds?: string[];
  workspaceId: string;
  creatorId: string;
}

export interface UpdateProjectInput {
  id: string;
  title?: string;
  description?: string;
  status?: "on-track" | "at-risk" | "completed" | "delayed";
  statusLabel?: string;
  progress?: number;
  activeTasksCount?: number;
  iconType?: string;
  accentColor?: string;
  launchedDate?: string | null;
  memberIds?: string[];
  workspaceId: string;
}

export const projectService = {
  /**
   * List all projects belonging to workspace
   */
  async getAll(db: PrismaClient, workspaceId: string) {
    return db.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        creator: true,
        members: true,
        _count: {
          select: { tasks: true, docs: true },
        },
      },
    });
  },

  /**
   * Get single project by ID
   */
  async getById(db: PrismaClient, workspaceId: string, id: string) {
    const project = await db.project.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        creator: true,
        members: true,
        tasks: {
          include: {
            assignee: true,
            coAssignees: true,
          },
          orderBy: { createdAt: "desc" },
        },
        docs: {
          include: {
            author: true,
          },
          orderBy: { modifiedAt: "desc" },
        },
        _count: {
          select: { tasks: true, docs: true },
        },
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Project with id '${id}' not found in this workspace`,
      });
    }

    return project;
  },

  /**
   * Create a new project in workspace
   */
  async create(db: PrismaClient, input: CreateProjectInput) {
    const status = input.status ?? "on-track";
    const label = input.statusLabel ?? statusLabelMap[status] ?? "On Track";

    // Always include creator in members
    const memberIdsToConnect = Array.from(
      new Set([input.creatorId, ...(input.memberIds ?? [])]),
    );

    const created = await db.project.create({
      data: {
        id: input.id,
        workspaceId: input.workspaceId,
        creatorId: input.creatorId,
        title: input.title,
        description: input.description ?? "",
        status,
        statusLabel: label,
        progress: input.progress ?? 0,
        activeTasksCount: input.activeTasksCount ?? 0,
        iconType: input.iconType ?? "palette",
        accentColor: input.accentColor ?? "#4f46e5",
        launchedDate: input.launchedDate,
        members: {
          connect: memberIdsToConnect.map((id) => ({ id })),
        },
      },
      include: {
        creator: true,
        members: true,
        _count: {
          select: { tasks: true, docs: true },
        },
      },
    });

    // Record activity
    await db.activity.create({
      data: {
        workspaceId: input.workspaceId,
        action: "created project",
        target: created.title,
        targetId: created.id,
        timeAgo: "Just now",
        board: "Projects",
        type: "create",
        userId: input.creatorId,
      },
    });

    return created;
  },

  /**
   * Update an existing project
   */
  async update(db: PrismaClient, input: UpdateProjectInput) {
    const { id, memberIds, workspaceId, ...rest } = input;

    const existing = await db.project.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Project with id '${id}' not found in this workspace`,
      });
    }

    const updateData: NonNullable<Parameters<typeof db.project.update>[0]>["data"] = {
      ...rest,
      statusLabel:
        rest.statusLabel ??
        (rest.status ? statusLabelMap[rest.status] : undefined),
    };

    if (memberIds !== undefined) {
      updateData.members = {
        set: memberIds.map((memberId) => ({ id: memberId })),
      };
    }

    return db.project.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
        members: true,
        _count: {
          select: { tasks: true, docs: true },
        },
      },
    });
  },

  /**
   * Add a member to project (creator or workspace owner guarded)
   */
  async addMember(
    db: PrismaClient,
    workspaceId: string,
    callerId: string,
    workspaceOwnerId: string,
    projectId: string,
    userId: string,
  ) {
    const project = await db.project.findFirst({
      where: { id: projectId, workspaceId },
      include: { members: true },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found in this workspace",
      });
    }

    // Check permission
    const isCreator = project.creatorId === callerId;
    const isWorkspaceOwner = workspaceOwnerId === callerId;
    if (!isCreator && !isWorkspaceOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the project creator can manage project members",
      });
    }

    // Ensure target user is a workspace member
    await db.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      update: {},
      create: {
        workspaceId,
        userId,
        role: "Member",
      },
    });

    return db.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        creator: true,
        members: true,
        _count: { select: { tasks: true, docs: true } },
      },
    });
  },

  /**
   * Remove a member from project (creator or workspace owner guarded)
   */
  async removeMember(
    db: PrismaClient,
    workspaceId: string,
    callerId: string,
    workspaceOwnerId: string,
    projectId: string,
    userId: string,
  ) {
    const project = await db.project.findFirst({
      where: { id: projectId, workspaceId },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found in this workspace",
      });
    }

    // Check permission
    const isCreator = project.creatorId === callerId;
    const isWorkspaceOwner = workspaceOwnerId === callerId;
    if (!isCreator && !isWorkspaceOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the project creator can manage project members",
      });
    }

    // Cannot remove the creator themselves
    if (project.creatorId === userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot remove the project creator from the project",
      });
    }

    return db.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
      include: {
        creator: true,
        members: true,
        _count: { select: { tasks: true, docs: true } },
      },
    });
  },

  /**
   * Delete a project
   */
  async delete(
    db: PrismaClient,
    workspaceId: string,
    callerId: string,
    workspaceOwnerId: string,
    id: string,
  ) {
    const existing = await db.project.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Project with id '${id}' not found in this workspace`,
      });
    }

    const isCreator = existing.creatorId === callerId;
    const isWorkspaceOwner = workspaceOwnerId === callerId;
    if (existing.creatorId && !isCreator && !isWorkspaceOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the project creator or workspace owner can delete this project",
      });
    }

    return db.project.delete({
      where: { id },
    });
  },
};
