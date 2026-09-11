import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const getByIdMemberProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    return memberService.getById(ctx.db, ctx.workspace.id, input.id);
  });
