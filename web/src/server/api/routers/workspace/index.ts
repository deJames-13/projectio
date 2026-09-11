import { createTRPCRouter } from "~/server/api/trpc";
import { getCurrentWorkspaceProcedure } from "./workspace.getCurrent";
import { getAllWorkspaceProcedure } from "./workspace.getAll";
import { updateWorkspaceProcedure } from "./workspace.update";

export const workspaceRouter = createTRPCRouter({
  getCurrent: getCurrentWorkspaceProcedure,
  getAll: getAllWorkspaceProcedure,
  update: updateWorkspaceProcedure,
});

export * from "./workspace.service";
