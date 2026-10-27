"use client";

import { useFormStatus } from "react-dom";

/** A form's submit button that shows it's working while the action runs. */
export default function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "quiet";
}) {
  const { pending } = useFormStatus();
  const styles =
    variant === "primary"
      ? "min-h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-accent"
      : "min-h-10 rounded-full border border-line px-4 text-sm text-muted hover:border-foreground hover:text-foreground";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`inline-flex items-center justify-center gap-2 transition disabled:cursor-wait disabled:opacity-60 ${styles}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
