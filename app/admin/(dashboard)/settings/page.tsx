import type { Metadata } from "next";
import { Suspense } from "react";
import SettingsEditor from "@/components/admin/settings/SettingsEditor";
import { saveSettings } from "@/modules/settings/actions";
import { getSettings } from "@/modules/settings/service";

export const metadata: Metadata = { title: "Links & SEO" };

async function Editor() {
  return <SettingsEditor settings={await getSettings()} action={saveSettings} />;
}

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-h3 font-semibold">Links &amp; SEO</h1>
      <p className="mt-1 mb-8 text-sm text-muted">Saved changes are on the site straight away.</p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor />
      </Suspense>
    </>
  );
}
