import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { projectService } from "./project.service";

export const deleteProjectProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return projectService.delete(
      ctx.db,
      ctx.workspace.id,
      ctx.session.user.id,
      ctx.workspace.ownerId,
      input.id,
    );
  });
