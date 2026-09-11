import { protectedProcedure } from "~/server/api/trpc";
import { workspaceService } from "./workspace.service";

export const getCurrentWorkspaceProcedure = protectedProcedure.query(async ({ ctx }) => {
  return workspaceService.getCurrent(ctx.db, ctx.workspace.id);
});
