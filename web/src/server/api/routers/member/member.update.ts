import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const updateMemberProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      username: z.string().min(1).optional(),
      role: z.string().min(1).optional(),
      email: z.string().email().optional(),
      avatar: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return memberService.update(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
    });
  });
