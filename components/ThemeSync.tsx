"use client";

import { useLayoutEffect } from "react";
import { applyTheme, useTheme } from "@/lib/use-theme";

// The inline script in <head> sets the theme before the first paint. This
// keeps <html> in sync afterwards: React's development remount clears the
// attributes, and "System" mode follows the device setting as it changes.
export default function ThemeSync() {
  const theme = useTheme();
  useLayoutEffect(() => applyTheme(), [theme]);
  return null;
}
