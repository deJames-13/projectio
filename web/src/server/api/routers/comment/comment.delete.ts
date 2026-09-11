import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { commentService } from "./comment.service";

export const deleteCommentProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return commentService.delete(ctx.db, ctx.workspace.id, input.id);
  });
