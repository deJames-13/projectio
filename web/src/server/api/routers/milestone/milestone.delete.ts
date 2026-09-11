import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { milestoneService } from "./milestone.service";

export const deleteMilestoneProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return milestoneService.delete(ctx.db, ctx.workspace.id, input.id);
  });
