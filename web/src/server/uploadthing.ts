import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const f = createUploadthing();

/**
 * UploadThing File Router for Projectio.
 * Handlers are invoked for authenticated users only with strict file validations.
 */
export const ourFileRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "1MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError("You must be logged in to upload a profile picture.") as Error;
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // In UploadThing v7, file.ufsUrl is the standard CDN URL with fallback to file.url
      const fileUrl = (file as { ufsUrl?: string; url?: string }).ufsUrl ?? file.url;

      // Automatically persist to User record in database
      await db.user.update({
        where: { id: metadata.userId },
        data: { avatar: fileUrl },
      });

      return { uploadedBy: metadata.userId, url: fileUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
