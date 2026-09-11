import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { projectService } from "./project.service";

export const updateProjectProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(["on-track", "at-risk", "completed", "delayed"]).optional(),
      statusLabel: z.string().optional(),
      progress: z.number().int().min(0).max(100).optional(),
      activeTasksCount: z.number().int().optional(),
      iconType: z.string().optional(),
      accentColor: z.string().optional(),
      launchedDate: z.string().nullable().optional(),
      memberIds: z.array(z.string()).optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return projectService.update(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
    });
  });
