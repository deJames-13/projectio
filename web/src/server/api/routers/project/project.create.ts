import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { projectService } from "./project.service";

export const createProjectProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      description: z.string().default(""),
      status: z.enum(["on-track", "at-risk", "completed", "delayed"]).default("on-track"),
      statusLabel: z.string().optional(),
      progress: z.number().int().min(0).max(100).default(0),
      activeTasksCount: z.number().int().default(0),
      iconType: z.string().default("palette"),
      accentColor: z.string().default("#4f46e5"),
      launchedDate: z.string().optional(),
      memberIds: z.array(z.string()).optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return projectService.create(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
      creatorId: ctx.session.user.id,
    });
  });
