import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { docService } from "./doc.service";

export const getAllDocProcedure = protectedProcedure
  .input(
    z
      .object({
        category: z.string().optional(),
        starred: z.boolean().optional(),
        search: z.string().optional(),
        projectId: z.string().nullable().optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    return docService.getAll(ctx.db, ctx.workspace.id, ctx.session.user.id, input);
  });
