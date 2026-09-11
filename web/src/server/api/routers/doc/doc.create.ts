import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { docService } from "./doc.service";

export const createDocProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      category: z.string().min(1, "Category is required"),
      content: z.string().default(""),
      starred: z.boolean().default(false),
      updatedAt: z.string().default("Just now"),
      authorId: z.string().optional(),
      projectId: z.string().nullable().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return docService.create(ctx.db, {
      ...input,
      authorId: input.authorId ?? ctx.session.user.id,
      workspaceId: ctx.workspace.id,
    });
  });
