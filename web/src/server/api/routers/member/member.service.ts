import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export interface CreateMemberInput {
  id?: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  workspaceId: string;
}

export interface UpdateMemberInput {
  id: string;
  name?: string;
  username?: string;
  role?: string;
  email?: string;
  avatar?: string;
  workspaceId: string;
}

export const memberService = {
  /**
   * List all members belonging to the current user's workspace
   */
  async getAll(db: PrismaClient, workspaceId: string) {
    return db.user.findMany({
      where: {
        workspaceMembers: {
          some: { workspaceId },
        },
      },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            projectMembers: true,
          },
        },
      },
    });
  },

  /**
   * Get a member by ID within workspace
   */
  async getById(db: PrismaClient, workspaceId: string, id: string) {
    const member = await db.user.findFirst({
      where: {
        id,
        workspaceMembers: {
          some: { workspaceId },
        },
      },
      include: {
        projectMembers: true,
        assignedTasks: {
          where: { workspaceId },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!member) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Member with id '${id}' not found in this workspace`,
      });
    }

    return member;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrent(db: PrismaClient, userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            projectMembers: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Current authenticated profile not found",
      });
    }

    return user;
  },

  /**
   * Add a colleague or new member to workspace
   */
  async create(db: PrismaClient, input: CreateMemberInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Upsert user
    const user = await db.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: input.name,
        role: input.role,
        avatar: input.avatar,
      },
      create: {
        name: input.name,
        email: normalizedEmail,
        role: input.role,
        avatar: input.avatar,
      },
    });

    // Link to workspace
    await db.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: user.id,
        },
      },
      update: { role: input.role },
      create: {
        workspaceId: input.workspaceId,
        userId: user.id,
        role: input.role,
      },
    });

    return user;
  },

  /**
   * Update member details within workspace
   */
  async update(db: PrismaClient, input: UpdateMemberInput) {
    const { id, workspaceId, ...data } = input;

    const existing = await db.user.findFirst({
      where: {
        id,
        workspaceMembers: { some: { workspaceId } },
      },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Member with id '${id}' not found in this workspace`,
      });
    }

    if (data.username) {
      const normalizedUsername = data.username.toLowerCase().trim().replace(/^@/, '');
      const conflict = await db.user.findFirst({
        where: {
          username: { equals: normalizedUsername, mode: "insensitive" },
          NOT: { id },
        },
      });
      if (conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Username '@${normalizedUsername}' is already taken. Please choose another.`,
        });
      }
      data.username = normalizedUsername;
    }

    if (data.role) {
      await db.workspaceMember.updateMany({
        where: { workspaceId, userId: id },
        data: { role: data.role },
      });
    }

    return db.user.update({
      where: { id },
      data,
    });
  },

  /**
   * Search users by username, display name, or email for project member invites
   */
  async search(db: PrismaClient, query: string) {
    const q = query.trim();
    if (!q) {
      return db.user.findMany({
        take: 8,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          avatar: true,
        },
      });
    }

    return db.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
  },

  /**
   * Remove member from workspace
   */
  async delete(db: PrismaClient, workspaceId: string, id: string) {
    return db.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: id,
        },
      },
    });
  },
};
