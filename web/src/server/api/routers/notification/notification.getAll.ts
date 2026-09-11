import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { notificationService } from "./notification.service";

export const getAllNotificationProcedure = protectedProcedure
  .input(
    z
      .object({
        read: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    return notificationService.getAll(ctx.db, ctx.session.user.id, input);
  });
