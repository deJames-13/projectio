import { createTRPCRouter } from "~/server/api/trpc";
import { getAllMilestoneProcedure } from "./milestone.getAll";
import { getByIdMilestoneProcedure } from "./milestone.getById";
import { createMilestoneProcedure } from "./milestone.create";
import { updateMilestoneProcedure } from "./milestone.update";
import { deleteMilestoneProcedure } from "./milestone.delete";

export const milestoneRouter = createTRPCRouter({
  getAll: getAllMilestoneProcedure,
  getById: getByIdMilestoneProcedure,
  create: createMilestoneProcedure,
  update: updateMilestoneProcedure,
  delete: deleteMilestoneProcedure,
});

export * from "./milestone.service";
