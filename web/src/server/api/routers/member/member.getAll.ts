import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const getAllMemberProcedure = protectedProcedure.query(async ({ ctx }) => {
  return memberService.getAll(ctx.db, ctx.workspace.id);
});
