import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { projectService } from "./project.service";

export const removeMemberProjectProcedure = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      userId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return projectService.removeMember(
      ctx.db,
      ctx.workspace.id,
      ctx.session.user.id,
      ctx.workspace.ownerId,
      input.projectId,
      input.userId,
    );
  });
