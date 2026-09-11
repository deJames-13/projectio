import { protectedProcedure } from "~/server/api/trpc";
import { workspaceService } from "./workspace.service";

export const getAllWorkspaceProcedure = protectedProcedure.query(async ({ ctx }) => {
  return workspaceService.getAll(ctx.db, ctx.session.user.id);
});
