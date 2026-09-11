import type { PrismaClient } from "~/../generated/prisma";

export interface ActivityFilterInput {
  limit?: number;
  board?: string;
  userId?: string;
}

export interface ActivityCreateInput {
  id?: string;
  action: string;
  target: string;
  targetId?: string;
  timeAgo?: string;
  board: string;
  comment?: string;
  type: "move" | "comment" | "create" | "status_change";
  userId: string;
  workspaceId: string;
}

export const activityService = {
  /**
   * List recent activities within workspace
   */
  async getAll(db: PrismaClient, workspaceId: string, input?: ActivityFilterInput) {
    const whereClause: NonNullable<Parameters<typeof db.activity.findMany>[0]>["where"] = {
      workspaceId,
    };

    if (input?.board) {
      whereClause.board = input.board;
    }

    if (input?.userId) {
      whereClause.userId = input.userId;
    }

    return db.activity.findMany({
      where: whereClause,
      take: input?.limit ?? 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  },

  /**
   * Create an activity entry in workspace
   */
  async create(db: PrismaClient, input: ActivityCreateInput) {
    const activityId = input.id ?? `act-${Date.now()}`;

    return db.activity.create({
      data: {
        id: activityId,
        workspaceId: input.workspaceId,
        action: input.action,
        target: input.target,
        targetId: input.targetId,
        timeAgo: input.timeAgo ?? "Just now",
        board: input.board,
        comment: input.comment,
        type: input.type,
        userId: input.userId,
      },
      include: {
        user: true,
      },
    });
  },

  /**
   * Delete an activity entry
   */
  async delete(db: PrismaClient, workspaceId: string, id: string) {
    return db.activity.deleteMany({
      where: { id, workspaceId },
    });
  },
};
