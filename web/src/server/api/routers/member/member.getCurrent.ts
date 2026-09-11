import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const getCurrentMemberProcedure = protectedProcedure.query(async ({ ctx }) => {
  return memberService.getCurrent(ctx.db, ctx.session.user.id);
});
