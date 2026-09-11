import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { analyticsService } from "./analytics.service";

export const getSprintBurndownProcedure = protectedProcedure
  .input(
    z
      .object({
        projectId: z.string().optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    return analyticsService.getSprintBurndown(ctx.db, ctx.workspace.id, input);
  });
