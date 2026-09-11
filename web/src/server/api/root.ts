import { activityRouter } from "~/server/api/routers/activity";
import { authRouter } from "~/server/api/routers/auth";
import { commentRouter } from "~/server/api/routers/comment";
import { docRouter } from "~/server/api/routers/doc";
import { memberRouter } from "~/server/api/routers/member";
import { milestoneRouter } from "~/server/api/routers/milestone";
import { notificationRouter } from "~/server/api/routers/notification";
import { projectRouter } from "~/server/api/routers/project";
import { taskRouter } from "~/server/api/routers/task";
import { workspaceRouter } from "~/server/api/routers/workspace";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers are registered here in modular fashion,
 * adhering to Create-T3 Architecture.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  workspace: workspaceRouter,
  task: taskRouter,
  project: projectRouter,
  member: memberRouter,
  comment: commentRouter,
  activity: activityRouter,
  doc: docRouter,
  milestone: milestoneRouter,
  notification: notificationRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);
