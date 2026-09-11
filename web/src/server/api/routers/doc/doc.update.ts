import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { docService } from "./doc.service";

export const updateDocProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      category: z.string().optional(),
      content: z.string().optional(),
      starred: z.boolean().optional(),
      updatedAt: z.string().optional(),
      projectId: z.string().nullable().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return docService.update(ctx.db, {
      ...input,
      workspaceId: ctx.workspace.id,
      userId: ctx.session.user.id,
      workspaceOwnerId: ctx.workspace.ownerId,
    });
  });
