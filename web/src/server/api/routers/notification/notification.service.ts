import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export interface NotificationFilterInput {
  read?: boolean;
  limit?: number;
}

export interface NotificationCreateInput {
  id?: string;
  text: string;
  timeAgo?: string;
  type: "mention" | "assignment" | "milestone" | "comment";
  taskId?: string;
  userId: string;
}

export const notificationService = {
  /**
   * List notifications for a user
   */
  async getAll(db: PrismaClient, userId: string, input?: NotificationFilterInput) {
    const whereClause: NonNullable<Parameters<typeof db.notification.findMany>[0]>["where"] = {
      userId,
    };

    if (input?.read !== undefined) {
      whereClause.read = input.read;
    }

    return db.notification.findMany({
      where: whereClause,
      take: input?.limit ?? 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(db: PrismaClient, userId: string, id: string) {
    const existing = await db.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Notification with id '${id}' not found`,
      });
    }

    return db.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(db: PrismaClient, userId: string) {
    return db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  /**
   * Create notification
   */
  async create(db: PrismaClient, input: NotificationCreateInput) {
    const notifId = input.id ?? `notif-${Date.now()}`;

    return db.notification.create({
      data: {
        id: notifId,
        text: input.text,
        timeAgo: input.timeAgo ?? "Just now",
        read: false,
        type: input.type,
        taskId: input.taskId,
        user: { connect: { id: input.userId } },
      },
      include: {
        user: true,
      },
    });
  },

  /**
   * Delete notification
   */
  async delete(db: PrismaClient, userId: string, id: string) {
    const existing = await db.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Notification with id '${id}' not found`,
      });
    }

    return db.notification.delete({
      where: { id },
    });
  },
};
