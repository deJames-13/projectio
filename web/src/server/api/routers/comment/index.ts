import { createTRPCRouter } from "~/server/api/trpc";
import { getByTaskIdCommentProcedure } from "./comment.getByTaskId";
import { createCommentProcedure } from "./comment.create";
import { deleteCommentProcedure } from "./comment.delete";

export const commentRouter = createTRPCRouter({
  getByTaskId: getByTaskIdCommentProcedure,
  create: createCommentProcedure,
  delete: deleteCommentProcedure,
});

export * from "./comment.service";
