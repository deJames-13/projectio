import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { taskService } from "./task.service";

export const updateStatusTaskProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(["backlog", "todo", "in-progress", "review", "done"]),
      completed: z.boolean().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return taskService.updateStatus(
      ctx.db,
      ctx.workspace.id,
      ctx.session.user.id,
      input.id,
      input.status,
      input.completed,
    );
  });
