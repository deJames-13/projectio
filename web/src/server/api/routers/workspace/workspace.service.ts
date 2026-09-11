import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export const workspaceService = {
  /**
   * Get workspace by ID including owner, members, and counts
   */
  async getCurrent(db: PrismaClient, workspaceId: string) {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            projects: true,
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Active workspace not found",
      });
    }

    return workspace;
  },

  /**
   * List all workspaces accessible by the current user
   */
  async getAll(db: PrismaClient, userId: string) {
    return db.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        _count: {
          select: {
            projects: true,
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Update workspace details
   */
  async update(db: PrismaClient, workspaceId: string, name: string) {
    return db.workspace.update({
      where: { id: workspaceId },
      data: {
        name,
      },
    });
  },
};
