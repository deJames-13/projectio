import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { taskService } from "./task.service";

export const createTaskProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Task title is required"),
      description: z.string().optional(),
      status: z.enum(["backlog", "todo", "in-progress", "review", "done"]).default("todo"),
      priority: z.enum(["P0", "P1", "P2", "P3", "High", "Medium", "Low"]).default("Medium"),
      priorityLabel: z.string().optional(),
      team: z.string().default("Engineering"),
      dueTime: z.string().optional(),
      dateRange: z.string().optional(),
      completed: z.boolean().default(false),
      gitBranch: z.string().optional(),
      blocks: z.string().optional(),
      assigneeId: z.string(),
      coAssigneeIds: z.array(z.string()).optional(),
      projectId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return taskService.create(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
      userId: ctx.session.user.id,
    });
  });
