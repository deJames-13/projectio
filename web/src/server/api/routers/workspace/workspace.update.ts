import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { workspaceService } from "./workspace.service";

export const updateWorkspaceProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, "Workspace name is required"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return workspaceService.update(ctx.db, ctx.workspace.id, input.name);
  });
