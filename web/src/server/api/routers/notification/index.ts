import { createTRPCRouter } from "~/server/api/trpc";
import { getAllNotificationProcedure } from "./notification.getAll";
import { markAsReadNotificationProcedure } from "./notification.markAsRead";
import { markAllAsReadNotificationProcedure } from "./notification.markAllAsRead";
import { createNotificationProcedure } from "./notification.create";
import { deleteNotificationProcedure } from "./notification.delete";

export const notificationRouter = createTRPCRouter({
  getAll: getAllNotificationProcedure,
  markAsRead: markAsReadNotificationProcedure,
  markAllAsRead: markAllAsReadNotificationProcedure,
  create: createNotificationProcedure,
  delete: deleteNotificationProcedure,
});

export * from "./notification.service";
