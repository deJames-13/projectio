import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { activityService } from "./activity.service";

export const getAllActivityProcedure = protectedProcedure
  .input(
    z
      .object({
        limit: z.number().int().min(1).max(100).default(50),
        board: z.string().optional(),
        userId: z.string().optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    return activityService.getAll(ctx.db, ctx.workspace.id, input);
  });
