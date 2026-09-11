import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { notificationService } from "./notification.service";

export const createNotificationProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      text: z.string().min(1, "Notification text is required"),
      timeAgo: z.string().default("Just now"),
      type: z.enum(["mention", "assignment", "milestone", "comment"]),
      taskId: z.string().optional(),
      userId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return notificationService.create(ctx.db, {
      ...input,
      userId: input.userId ?? ctx.session.user.id,
    });
  });
