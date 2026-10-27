"use client";

import Image from "next/image";
import { startTransition, useRef, useState } from "react";
import { ConfirmButton } from "@/components/admin/form";
import { deleteMedia } from "@/modules/media/actions";
import { formatSize, type MediaItem } from "@/modules/media/schema";
import { uploadImage } from "./upload";

/** Every image, where it's used, and buttons to upload and delete. */
export default function MediaLibrary({ media }: { media: MediaItem[] }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  // New uploads show at once; the page refresh after a delete brings the rest.
  const [uploaded, setUploaded] = useState<MediaItem[]>([]);
  const items = [...uploaded.filter((u) => !media.some((m) => m.id === u.id)), ...media];

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    try {
      for (const file of Array.from(files)) {
        const item = await uploadImage(file);
        setUploaded((current) => [item, ...current]);
      }
      setMessage({ ok: true, text: files.length > 1 ? `${files.length} images uploaded.` : "Image uploaded." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "The upload failed. Please try again." });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = (item: MediaItem) =>
    startTransition(async () => {
      const result = await deleteMedia(item.id);
      setUploaded((current) => (result.ok ? current.filter((u) => u.id !== item.id) : current));
      setMessage({ ok: result.ok, text: result.message });
    });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-label="Upload images"
          onChange={(event) => onFiles(event.target.files)}
        />
        <p className="text-xs text-muted">JPG, PNG or WebP, up to 5 MB each.</p>
        <p role="status" className={`basis-full text-sm ${message?.ok ? "text-emerald-400" : "text-rose-400"}`}>
          {message?.text}
        </p>
      </div>

      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="relative aspect-video bg-background">
                <Image src={item.url} alt="" fill sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 90vw" className="object-contain" />
              </div>
              <div className="space-y-1 p-4 text-sm">
                <p className="truncate font-mono text-xs" title={item.url}>
                  {decodeURIComponent(item.url.split("/").pop() ?? "")}
                </p>
                <p className="text-xs text-muted">
                  {[item.mimeType.replace("image/", "").toUpperCase(), formatSize(item.sizeBytes), item.width && `${item.width}×${item.height}`, item.provider === "local" ? "in /public" : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-xs">
                  {item.usedBy.length ? (
                    <span className="text-emerald-400">Used as: {item.usedBy.join(", ")}</span>
                  ) : (
                    <span className="text-muted">Not used</span>
                  )}
                </p>
                <div className="-ml-4 pt-1">
                  {item.usedBy.length ? (
                    <p className="px-4 text-xs text-muted">Choose another image there to delete this one.</p>
                  ) : (
                    <ConfirmButton
                      label="Delete"
                      question={
                        item.provider === "local"
                          ? "Remove this image from the library? The file stays in /public."
                          : "Delete this image? This can't be undone."
                      }
                      confirmLabel="Delete"
                      onConfirm={() => remove(item)}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No images yet.</p>
      )}
    </>
  );
}
