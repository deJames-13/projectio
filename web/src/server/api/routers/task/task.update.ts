import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { taskService } from "./task.service";

export const updateTaskProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      status: z.enum(["backlog", "todo", "in-progress", "review", "done"]).optional(),
      priority: z.enum(["P0", "P1", "P2", "P3", "High", "Medium", "Low"]).optional(),
      priorityLabel: z.string().optional(),
      team: z.string().optional(),
      dueTime: z.string().nullable().optional(),
      dateRange: z.string().nullable().optional(),
      completed: z.boolean().optional(),
      gitBranch: z.string().nullable().optional(),
      blocks: z.string().nullable().optional(),
      assigneeId: z.string().optional(),
      coAssigneeIds: z.array(z.string()).optional(),
      projectId: z.string().nullable().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return taskService.update(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
    });
  });
