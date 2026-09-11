import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { taskService } from "./task.service";

export const deleteTaskProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return taskService.delete(ctx.db, ctx.workspace.id, input.id);
  });
