import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { memberService } from "./member.service";

export const createMemberProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Name is required"),
      role: z.string().min(1, "Role is required"),
      email: z.string().email("Invalid email address"),
      avatar: z.string().min(1, "Avatar URL is required"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return memberService.create(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
    });
  });
