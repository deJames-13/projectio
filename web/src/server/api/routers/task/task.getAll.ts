import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { taskService } from "./task.service";

export const getAllTaskProcedure = protectedProcedure
  .input(
    z
      .object({
        projectId: z.string().optional(),
        status: z.enum(["backlog", "todo", "in-progress", "review", "done"]).optional(),
        priority: z.enum(["P0", "P1", "P2", "P3", "High", "Medium", "Low"]).optional(),
        assigneeId: z.string().optional(),
        search: z.string().optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    return taskService.getAll(ctx.db, ctx.workspace.id, input);
  });
