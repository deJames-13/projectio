import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { milestoneService } from "./milestone.service";

export const getAllMilestoneProcedure = protectedProcedure
  .input(
    z
      .object({
        team: z.string().optional(),
        status: z.enum(["completed", "current", "upcoming"]).optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    return milestoneService.getAll(ctx.db, ctx.workspace.id, input);
  });
