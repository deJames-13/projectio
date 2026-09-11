import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export interface MilestoneFilterInput {
  team?: string;
  status?: "completed" | "current" | "upcoming";
}

export interface MilestoneCreateInput {
  id?: string;
  title: string;
  date: string;
  team: string;
  status?: "completed" | "current" | "upcoming";
  workspaceId: string;
}

export interface MilestoneUpdateInput {
  id: string;
  title?: string;
  date?: string;
  team?: string;
  status?: "completed" | "current" | "upcoming";
  workspaceId: string;
}

export const milestoneService = {
  /**
   * List milestones for workspace
   */
  async getAll(db: PrismaClient, workspaceId: string, input?: MilestoneFilterInput) {
    const whereClause: NonNullable<Parameters<typeof db.milestone.findMany>[0]>["where"] = {
      workspaceId,
    };

    if (input?.team) {
      whereClause.team = input.team;
    }

    if (input?.status) {
      whereClause.status = input.status;
    }

    return db.milestone.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Get milestone by ID
   */
  async getById(db: PrismaClient, workspaceId: string, id: string) {
    const milestone = await db.milestone.findFirst({
      where: { id, workspaceId },
    });

    if (!milestone) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Milestone with id '${id}' not found in this workspace`,
      });
    }

    return milestone;
  },

  /**
   * Create a milestone
   */
  async create(db: PrismaClient, input: MilestoneCreateInput) {
    const milestoneId = input.id ?? `ms-${Date.now()}`;

    return db.milestone.create({
      data: {
        id: milestoneId,
        workspaceId: input.workspaceId,
        title: input.title,
        date: input.date,
        team: input.team,
        status: input.status ?? "upcoming",
      },
    });
  },

  /**
   * Update a milestone
   */
  async update(db: PrismaClient, input: MilestoneUpdateInput) {
    const { id, workspaceId, ...data } = input;

    const existing = await db.milestone.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Milestone with id '${id}' not found in this workspace`,
      });
    }

    return db.milestone.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a milestone
   */
  async delete(db: PrismaClient, workspaceId: string, id: string) {
    const existing = await db.milestone.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Milestone with id '${id}' not found in this workspace`,
      });
    }

    return db.milestone.delete({
      where: { id },
    });
  },
};
