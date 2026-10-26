"use client";

import { useState } from "react";
import ThemeSwitcher from "../ThemeSwitcher";

/** The site's theme picker, which keeps its own open state here. */
export default function AdminThemeButton() {
  const [open, setOpen] = useState(false);
  return <ThemeSwitcher open={open} onOpenChange={setOpen} />;
}
