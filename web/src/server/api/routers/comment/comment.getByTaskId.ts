import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { commentService } from "./comment.service";

export const getByTaskIdCommentProcedure = protectedProcedure
  .input(z.object({ taskId: z.string() }))
  .query(async ({ ctx, input }) => {
    return commentService.getByTaskId(ctx.db, ctx.workspace.id, input.taskId);
  });
