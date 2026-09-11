import { createTRPCRouter } from "~/server/api/trpc";
import { getAllMemberProcedure } from "./member.getAll";
import { getByIdMemberProcedure } from "./member.getById";
import { getCurrentMemberProcedure } from "./member.getCurrent";
import { createMemberProcedure } from "./member.create";
import { updateMemberProcedure } from "./member.update";
import { searchMemberProcedure } from "./member.search";
import { deleteMemberProcedure } from "./member.delete";

export const memberRouter = createTRPCRouter({
  getAll: getAllMemberProcedure,
  getById: getByIdMemberProcedure,
  getCurrent: getCurrentMemberProcedure,
  create: createMemberProcedure,
  update: updateMemberProcedure,
  search: searchMemberProcedure,
  delete: deleteMemberProcedure,
});

export * from "./member.service";
