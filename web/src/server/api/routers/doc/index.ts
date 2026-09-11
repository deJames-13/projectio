import { createTRPCRouter } from "~/server/api/trpc";
import { getAllDocProcedure } from "./doc.getAll";
import { getByIdDocProcedure } from "./doc.getById";
import { createDocProcedure } from "./doc.create";
import { updateDocProcedure } from "./doc.update";
import { toggleStarredDocProcedure } from "./doc.toggleStarred";
import { deleteDocProcedure } from "./doc.delete";

export const docRouter = createTRPCRouter({
  getAll: getAllDocProcedure,
  getById: getByIdDocProcedure,
  create: createDocProcedure,
  update: updateDocProcedure,
  toggleStarred: toggleStarredDocProcedure,
  delete: deleteDocProcedure,
});

export * from "./doc.service";
