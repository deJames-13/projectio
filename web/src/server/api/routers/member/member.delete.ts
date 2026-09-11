import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const deleteMemberProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return memberService.delete(ctx.db, ctx.workspace.id, input.id);
  });
