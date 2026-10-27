import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/authorization";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_FOLDER } from "@/modules/media/schema";
import { blobConfigured } from "@/modules/media/storage";

// Gives the browser a short-lived token to upload one image straight to
// Vercel Blob, so the file never passes through this server. Only the admin
// gets one, and only for an image of an allowed type and size under
// portfolio/. Blob itself enforces the type and size.
export async function POST(request: Request) {
  if (!blobConfigured()) {
    return NextResponse.json({ error: "Uploads aren't set up yet (BLOB_READ_WRITE_TOKEN is missing)." }, { status: 503 });
  }
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getAdmin())) throw new Error("Only the admin can upload.");
        if (!pathname.startsWith(UPLOAD_FOLDER) || pathname.includes("..")) throw new Error("Invalid file name.");
        return {
          allowedContentTypes: [...IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload refused." }, { status: 400 });
  }
}
