import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export interface CreateCommentInput {
  taskId: string;
  authorId: string;
  text: string;
  timeAgo?: string;
  workspaceId: string;
}

export const commentService = {
  /**
   * Get comments for a task within workspace
   */
  async getByTaskId(db: PrismaClient, workspaceId: string, taskId: string) {
    const task = await db.task.findFirst({
      where: { id: taskId, workspaceId },
    });

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${taskId}' not found in this workspace`,
      });
    }

    return db.comment.findMany({
      where: { taskId },
      include: {
        author: true,
      },
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Create a comment on a task and log activity
   */
  async create(db: PrismaClient, input: CreateCommentInput) {
    const task = await db.task.findFirst({
      where: { id: input.taskId, workspaceId: input.workspaceId },
    });

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Task with id '${input.taskId}' not found in this workspace`,
      });
    }

    const comment = await db.comment.create({
      data: {
        text: input.text,
        timeAgo: input.timeAgo ?? "Just now",
        task: { connect: { id: input.taskId } },
        author: { connect: { id: input.authorId } },
      },
      include: {
        author: true,
      },
    });

    // Record activity
    await db.activity
      .create({
        data: {
          id: `act-${Date.now()}`,
          workspaceId: input.workspaceId,
          action: "commented on",
          target: task.title,
          targetId: task.id,
          timeAgo: "Just now",
          board: `${task.team} Board`,
          comment: input.text,
          type: "comment",
          userId: input.authorId,
        },
      })
      .catch(() => null);

    return comment;
  },

  /**
   * Delete a comment within workspace
   */
  async delete(db: PrismaClient, workspaceId: string, id: string) {
    const comment = await db.comment.findFirst({
      where: {
        id,
        task: { workspaceId },
      },
    });

    if (!comment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Comment with id '${id}' not found`,
      });
    }

    return db.comment.delete({
      where: { id },
    });
  },
};
