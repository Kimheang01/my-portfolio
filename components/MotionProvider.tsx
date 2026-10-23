"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Framer Motion skips movement (but keeps fades) for visitors who ask the
// system for reduced motion.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
