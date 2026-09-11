import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { notificationService } from "./notification.service";

export const markAsReadNotificationProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return notificationService.markAsRead(ctx.db, ctx.session.user.id, input.id);
  });
