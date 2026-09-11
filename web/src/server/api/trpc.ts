/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { initializeUserWorkspace } from "~/server/db/workspace";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 * Attaches the current NextAuth session and the user's isolated workspace.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  let workspace = null;
  let activeSession = session;

  if (session?.user?.id) {
    try {
      const dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, avatar: true },
      });

      if (!dbUser) {
        // User does not exist in database; invalidate session context
        activeSession = null;
      } else {
        workspace = await db.workspace.findFirst({
          where: {
            OR: [
              { ownerId: dbUser.id },
              { members: { some: { userId: dbUser.id } } },
            ],
          },
        });

        workspace ??= await initializeUserWorkspace(db, dbUser);
      }
    } catch (err) {
      console.error("[TRPC Context] Failed to resolve or initialize workspace:", err);
    }
  }

  return {
    db,
    session: activeSession,
    workspace,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure.
 * Enforces session validity and guarantees an active isolated workspace.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be signed in to access this workspace." });
    }

    const dbUser = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!dbUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User account not found in database. Please register or sign in again.",
      });
    }

    let workspace = ctx.workspace;
    if (!workspace) {
      workspace = await ctx.db.workspace.findFirst({
        where: {
          OR: [
            { ownerId: dbUser.id },
            { members: { some: { userId: dbUser.id } } },
          ],
        },
      });

      workspace ??= await initializeUserWorkspace(ctx.db, dbUser);
    }

    if (!workspace) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Active workspace could not be found or initialized." });
    }

    return next({
      ctx: {
        session: {
          ...ctx.session,
          user: {
            ...ctx.session.user,
            id: dbUser.id,
          },
        },
        workspace,
      },
    });
  });
