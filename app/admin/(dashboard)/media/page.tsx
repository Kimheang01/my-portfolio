import type { Metadata } from "next";
import { Suspense } from "react";
import MediaLibrary from "@/components/admin/media/MediaLibrary";
import { getMediaLibrary } from "@/modules/media/service";

export const metadata: Metadata = { title: "Media" };

async function Library() {
  return <MediaLibrary media={await getMediaLibrary()} />;
}

export default function MediaPage() {
  return (
    <>
      <h1 className="text-h3 font-semibold">Media</h1>
      <p className="mt-1 mb-8 text-sm text-muted">
        Images for the profile photo and project logos and screenshots. Choose them on the Profile and project pages.
      </p>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Library />
      </Suspense>
    </>
  );
}
