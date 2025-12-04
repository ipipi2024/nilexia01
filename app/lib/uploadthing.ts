import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAuthUser } from "./auth-helpers";

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
  // Image uploader for listings
  listingImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      // Check if user is authenticated
      const user = await getAuthUser();

      if (!user) {
        throw new UploadThingError("Unauthorized");
      }

      // Return user ID to be available in onUploadComplete
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This runs after upload is complete
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Return data that will be sent to client
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
