import { protectedProcedure } from "~/server/api/trpc";
import { projectService } from "./project.service";

export const getAllProjectProcedure = protectedProcedure.query(async ({ ctx }) => {
  return projectService.getAll(ctx.db, ctx.workspace.id);
});
