import { createTRPCRouter } from "~/server/api/trpc";
import { getAllActivityProcedure } from "./activity.getAll";
import { createActivityProcedure } from "./activity.create";
import { deleteActivityProcedure } from "./activity.delete";

export const activityRouter = createTRPCRouter({
  getAll: getAllActivityProcedure,
  create: createActivityProcedure,
  delete: deleteActivityProcedure,
});

export * from "./activity.service";
