import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { taskService } from "./task.service";

export const toggleCompleteTaskProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return taskService.toggleComplete(
      ctx.db,
      ctx.workspace.id,
      ctx.session.user.id,
      input.id,
    );
  });
