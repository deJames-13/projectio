import { protectedProcedure } from "~/server/api/trpc";
import { notificationService } from "./notification.service";

export const markAllAsReadNotificationProcedure = protectedProcedure.mutation(async ({ ctx }) => {
  return notificationService.markAllAsRead(ctx.db, ctx.session.user.id);
});
