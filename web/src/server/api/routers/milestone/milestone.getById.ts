import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { milestoneService } from "./milestone.service";

export const getByIdMilestoneProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    return milestoneService.getById(ctx.db, ctx.workspace.id, input.id);
  });
