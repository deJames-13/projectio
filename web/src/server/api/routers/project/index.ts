import { createTRPCRouter } from "~/server/api/trpc";
import { getAllProjectProcedure } from "./project.getAll";
import { getByIdProjectProcedure } from "./project.getById";
import { createProjectProcedure } from "./project.create";
import { updateProjectProcedure } from "./project.update";
import { addMemberProjectProcedure } from "./project.addMember";
import { removeMemberProjectProcedure } from "./project.removeMember";
import { deleteProjectProcedure } from "./project.delete";

export const projectRouter = createTRPCRouter({
  getAll: getAllProjectProcedure,
  getById: getByIdProjectProcedure,
  create: createProjectProcedure,
  update: updateProjectProcedure,
  addMember: addMemberProjectProcedure,
  removeMember: removeMemberProjectProcedure,
  delete: deleteProjectProcedure,
});

export * from "./project.service";
