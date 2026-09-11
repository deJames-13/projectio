import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { notificationService } from "./notification.service";

export const deleteNotificationProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return notificationService.delete(ctx.db, ctx.session.user.id, input.id);
  });
