"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { MediaItem } from "@/modules/media/schema";
import { uploadImage } from "./upload";

/** The media library as an editor sees it; uploads are added as they finish. */
export function useMediaLibrary(initial: MediaItem[]) {
  const [items, setItems] = useState(initial);
  const add = (item: MediaItem) => setItems((current) => [item, ...current.filter((i) => i.id !== item.id)]);
  return { items, add, find: (id: number | null) => items.find((item) => item.id === id) ?? null };
}

const smallButton =
  "inline-flex min-h-9 items-center rounded-full border border-line px-3 text-sm transition hover:border-foreground disabled:cursor-wait disabled:opacity-60";

/**
 * Picks an image for one slot (a logo, a screenshot, the profile photo):
 * upload a new one, choose one already in the library, or remove it.
 */
export default function MediaPicker({
  label,
  hint,
  value,
  onChange,
  library,
  error,
  aspect = "aspect-square",
}: {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (id: number | null) => void;
  library: ReturnType<typeof useMediaLibrary>;
  error?: string;
  /** The thumbnail's shape, e.g. "aspect-video" for a screenshot */
  aspect?: string;
}) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const selected = library.find(value);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const item = await uploadImage(file);
      library.add(item);
      onChange(item.id);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "The upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const message = uploadError ?? error;
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-medium">
        {label}
      </p>
      <div className="flex flex-wrap items-start gap-4">
        <div className={`relative w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-background ${aspect}`}>
          {selected ? (
            <Image src={selected.url} alt={`${label}: current image`} fill sizes="112px" className="object-contain" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">None</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={smallButton} disabled={uploading} onClick={() => fileInput.current?.click()}>
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <button type="button" className={smallButton} disabled={uploading} onClick={() => dialog.current?.showModal()}>
              Choose
            </button>
            {selected && (
              <button
                type="button"
                className="inline-flex min-h-9 items-center px-2 text-sm text-muted transition hover:text-rose-400"
                onClick={() => onChange(null)}
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label={`Upload ${label}`}
            onChange={(event) => onFile(event.target.files?.[0])}
          />
          {hint && <p className="text-xs text-muted">{hint}</p>}
          {message && (
            <p role="alert" className="text-xs text-rose-400">
              {message}
            </p>
          )}
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label={`Choose ${label}`}
        className="m-auto max-h-[80vh] w-[min(40rem,calc(100vw-2rem))] rounded-2xl border border-line bg-background p-5 text-foreground backdrop:bg-black/60"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-medium">Choose {label.toLowerCase()}</p>
          <button type="button" className={smallButton} onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        {library.items.length ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {library.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-label={`Use image ${item.url.split("/").pop()}`}
                  aria-pressed={item.id === value}
                  onClick={() => {
                    onChange(item.id);
                    dialog.current?.close();
                  }}
                  className="relative block aspect-square w-full overflow-hidden rounded-xl border border-line bg-surface transition hover:border-foreground aria-pressed:border-accent aria-pressed:ring-2 aria-pressed:ring-accent/40"
                >
                  <Image src={item.url} alt="" fill sizes="150px" className="object-contain" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No images yet. Upload one instead.</p>
        )}
      </dialog>
    </div>
  );
}
