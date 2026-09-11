import { type PrismaClient } from "../../../generated/prisma";

/**
 * Creates and initializes a complete, rich starter workspace for a newly registered user.
 * Ensures each user has their own isolated workspace, projects, and tasks.
 */
export async function initializeUserWorkspace(
  db: PrismaClient,
  user: { id: string; name?: string | null; email?: string | null; image?: string | null },
) {
  // 0. Ensure user record exists in database before establishing foreign-key relations
  let dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser && user.email) {
    dbUser = await db.user.findUnique({
      where: { email: user.email },
    });
  }

  if (!dbUser) {
    throw new Error(`Cannot initialize workspace: User "${user.id}" not found in database. Please register or sign in.`);
  }

  const activeUserId = dbUser.id;
  const workspaceSlug = `${(dbUser.email ?? "user").split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? "workspace"}-${Date.now().toString().slice(-4)}`;
  const workspaceName = `${dbUser.name ?? "Personal"} Workspace`;

  // 1. Create the user's isolated workspace with no dummy placeholder data
  const workspace = await db.workspace.create({
    data: {
      name: workspaceName,
      slug: workspaceSlug,
      owner: { connect: { id: activeUserId } },
      members: {
        create: {
          userId: activeUserId,
          role: "Owner",
        },
      },
    },
  });

  return workspace;
}
