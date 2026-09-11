import type { PrismaClient } from "~/../generated/prisma";
import { TRPCError } from "@trpc/server";

export interface DocFilterInput {
  category?: string;
  starred?: boolean;
  search?: string;
  projectId?: string | null;
}

export interface CreateDocInput {
  id?: string;
  title: string;
  category: string;
  content?: string;
  starred?: boolean;
  updatedAt?: string;
  authorId: string;
  projectId?: string | null;
  workspaceId: string;
}

export interface UpdateDocInput {
  id: string;
  title?: string;
  category?: string;
  content?: string;
  starred?: boolean;
  updatedAt?: string;
  projectId?: string | null;
  workspaceId: string;
  userId: string;
  workspaceOwnerId: string;
}

export const docService = {
  /**
   * List docs within current workspace with project awareness and personal privacy filtering
   */
  async getAll(db: PrismaClient, workspaceId: string, userId: string, input?: DocFilterInput) {
    // 1. Specific project requested
    if (input?.projectId) {
      return db.doc.findMany({
        where: {
          workspaceId,
          projectId: input.projectId,
          category: input.category && input.category !== "All" ? input.category : undefined,
          starred: input.starred,
          ...(input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { content: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { modifiedAt: "desc" },
        include: {
          author: true,
          project: { select: { id: true, title: true } },
        },
      });
    }

    // 2. Personal documents explicitly requested (projectId === null)
    if (input?.projectId === null) {
      return db.doc.findMany({
        where: {
          workspaceId,
          projectId: null,
          authorId: userId,
          category: input.category && input.category !== "All" ? input.category : undefined,
          starred: input.starred,
          ...(input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { content: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { modifiedAt: "desc" },
        include: {
          author: true,
          project: { select: { id: true, title: true } },
        },
      });
    }

    // 3. Default: All shared project docs in the workspace + current user's personal docs
    return db.doc.findMany({
      where: {
        workspaceId,
        category: input?.category && input.category !== "All" ? input.category : undefined,
        starred: input?.starred,
        OR: [
          { projectId: { not: null } },
          { projectId: null, authorId: userId },
        ],
        ...(input?.search
          ? {
              AND: [
                {
                  OR: [
                    { title: { contains: input.search, mode: "insensitive" } },
                    { content: { contains: input.search, mode: "insensitive" } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: { modifiedAt: "desc" },
      include: {
        author: true,
        project: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Get a doc by ID within workspace with confidential privacy check
   */
  async getById(db: PrismaClient, workspaceId: string, userId: string, id: string) {
    const doc = await db.doc.findFirst({
      where: { id, workspaceId },
      include: {
        author: true,
        project: { select: { id: true, title: true } },
      },
    });

    if (!doc) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Doc with id '${id}' not found in this workspace`,
      });
    }

    // If document is personal (projectId is null), only author can view
    if (!doc.projectId && doc.authorId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This is a personal document accessible only by its author",
      });
    }

    return doc;
  },

  /**
   * Create a new doc in workspace (optionally tied to a project)
   */
  async create(db: PrismaClient, input: CreateDocInput) {
    const docId = input.id ?? `doc-${Date.now()}`;

    return db.doc.create({
      data: {
        id: docId,
        workspaceId: input.workspaceId,
        projectId: input.projectId ?? null,
        title: input.title,
        category: input.category,
        content: input.content ?? "",
        starred: input.starred ?? false,
        updatedAt: input.updatedAt ?? "Just now",
        authorId: input.authorId,
      },
      include: {
        author: true,
        project: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Update an existing doc in workspace
   */
  async update(db: PrismaClient, input: UpdateDocInput) {
    const { id, workspaceId, userId, workspaceOwnerId, ...data } = input;

    const existing = await db.doc.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Doc with id '${id}' not found in this workspace`,
      });
    }

    // Check edit permission: author or workspace owner
    if (existing.authorId !== userId && workspaceOwnerId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the author or workspace owner can edit this document",
      });
    }

    return db.doc.update({
      where: { id },
      data: {
        ...data,
        updatedAt: data.updatedAt ?? "Just now",
      },
      include: {
        author: true,
        project: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Toggle starred status
   */
  async toggleStarred(db: PrismaClient, workspaceId: string, id: string) {
    const existing = await db.doc.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Doc with id '${id}' not found in this workspace`,
      });
    }

    return db.doc.update({
      where: { id },
      data: {
        starred: !existing.starred,
      },
    });
  },

  /**
   * Delete a doc
   */
  async delete(db: PrismaClient, workspaceId: string, id: string) {
    const existing = await db.doc.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Doc with id '${id}' not found in this workspace`,
      });
    }

    return db.doc.delete({
      where: { id },
    });
  },
};
