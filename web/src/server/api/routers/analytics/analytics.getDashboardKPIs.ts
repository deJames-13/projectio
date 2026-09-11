import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { analyticsService } from "./analytics.service";

export const getDashboardKPIsProcedure = protectedProcedure
  .input(
    z
      .object({
        projectId: z.string().optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    return analyticsService.getDashboardKPIs(ctx.db, ctx.workspace.id, input);
  });
