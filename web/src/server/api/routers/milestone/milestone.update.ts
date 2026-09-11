import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { milestoneService } from "./milestone.service";

export const updateMilestoneProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      date: z.string().optional(),
      team: z.string().optional(),
      status: z.enum(["completed", "current", "upcoming"]).optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return milestoneService.update(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
    });
  });
