import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { milestoneService } from "./milestone.service";

export const createMilestoneProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      date: z.string().min(1, "Date is required"),
      team: z.string().min(1, "Team is required"),
      status: z.enum(["completed", "current", "upcoming"]).default("upcoming"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return milestoneService.create(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
    });
  });
