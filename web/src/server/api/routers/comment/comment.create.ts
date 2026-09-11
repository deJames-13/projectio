import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { commentService } from "./comment.service";

export const createCommentProcedure = protectedProcedure
  .input(
    z.object({
      taskId: z.string(),
      authorId: z.string().optional(),
      text: z.string().min(1, "Comment cannot be empty"),
      timeAgo: z.string().default("Just now"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return commentService.create(ctx.db, {
      taskId: input.taskId,
      text: input.text,
      timeAgo: input.timeAgo,
      authorId: input.authorId ?? ctx.session.user.id,
      workspaceId: ctx.workspace.id,
    });
  });
