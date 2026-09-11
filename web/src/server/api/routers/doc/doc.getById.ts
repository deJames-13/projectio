import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { docService } from "./doc.service";

export const getByIdDocProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    return docService.getById(ctx.db, ctx.workspace.id, ctx.session.user.id, input.id);
  });
