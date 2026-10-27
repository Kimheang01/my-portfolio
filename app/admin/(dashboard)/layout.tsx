import { Suspense } from "react";
import AdminIdentity from "@/components/admin/AdminIdentity";
import AdminNav, { AdminNavFallback } from "@/components/admin/AdminNav";
import AdminThemeButton from "@/components/admin/AdminThemeButton";

// Sidebar and header around every signed-in admin page. Only the part that
// reads the session waits for the request; the rest is a static shell.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-line px-4 py-3 md:sticky md:top-0 md:h-svh md:border-r md:border-b-0 md:px-4 md:py-6">
        <p className="mb-3 px-3 font-semibold tracking-tight md:mb-6">
          Portfolio <span className="text-muted">admin</span>
        </p>
        <Suspense fallback={<AdminNavFallback />}>
          <AdminNav />
        </Suspense>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-end gap-3 border-b border-line px-4 sm:px-6">
          <AdminThemeButton />
          <Suspense fallback={<div className="h-10 w-24 animate-pulse rounded-full bg-foreground/5" />}>
            <AdminIdentity />
          </Suspense>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
