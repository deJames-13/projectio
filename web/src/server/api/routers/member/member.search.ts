import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const searchMemberProcedure = protectedProcedure
  .input(z.object({ query: z.string().default("") }))
  .query(async ({ ctx, input }) => {
    return memberService.search(ctx.db, input.query);
  });
