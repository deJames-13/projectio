import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { projectService } from "./project.service";

export const getByIdProjectProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    return projectService.getById(ctx.db, ctx.workspace.id, input.id);
  });
