import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { activityService } from "./activity.service";

export const createActivityProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      action: z.string().min(1),
      target: z.string().min(1),
      targetId: z.string().optional(),
      timeAgo: z.string().default("Just now"),
      board: z.string().min(1),
      comment: z.string().optional(),
      type: z.enum(["move", "comment", "create", "status_change"]),
      userId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return activityService.create(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
      userId: input.userId ?? ctx.session.user.id,
    });
  });
