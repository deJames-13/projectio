import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { activityService } from "./activity.service";

export const deleteActivityProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return activityService.delete(ctx.db, ctx.workspace.id, input.id);
  });
