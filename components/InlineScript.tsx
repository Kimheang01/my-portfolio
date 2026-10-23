"use client";

// An inline script that runs while the HTML is parsed. On the client it is
// rendered as inert text, which stops React warning that it won't execute.
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
