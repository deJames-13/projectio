import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { docService } from "./doc.service";

export const toggleStarredDocProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return docService.toggleStarred(ctx.db, ctx.workspace.id, input.id);
  });
