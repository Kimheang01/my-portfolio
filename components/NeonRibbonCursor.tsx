"use client";

import { useEffect, useRef } from "react";

// How long a point of the trail lives before it has fully faded (ms).
const LIFETIME = 900;
// Ribbon width at the head and at the tail (px, before glow passes).
const HEAD_WIDTH = 7;
const TAIL_WIDTH = 1.5;
// How quickly the ribbon head catches up with the cursor each frame (0–1).
const FOLLOW = 0.45;
// Upper bound on stored points, so a very long fast swipe stays cheap.
const MAX_POINTS = 160;

// Cyan → Electric Blue → Violet, from the head to the tail.
const GRADIENT: [number, number, number][] = [
  [34, 211, 238],
  [59, 130, 246],
  [139, 92, 246],
];

// Each pass strokes the whole ribbon once: wide and faint for the outer glow,
// narrow and bright for the inner line. Alphas sum to roughly 40% glow.
const PASSES = [
  { width: 4, alpha: 0.05, white: 0 },
  { width: 2.2, alpha: 0.1, white: 0 },
  { width: 1, alpha: 0.35, white: 0.1 },
  { width: 0.28, alpha: 0.9, white: 0.65 },
];

type Point = { x: number; y: number; t: number };

/** Color along the ribbon: 0 = head (cyan) … 1 = tail (violet). */
function colorAt(position: number, white: number) {
  const scaled = position * (GRADIENT.length - 1);
  const i = Math.min(Math.floor(scaled), GRADIENT.length - 2);
  const f = scaled - i;
  const [a, b] = [GRADIENT[i], GRADIENT[i + 1]];
  return a.map((c, k) => {
    const mixed = c + (b[k] - c) * f;
    return Math.round(mixed + (255 - mixed) * white);
  });
}

const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * A glowing neon ribbon that follows the mouse and fades out ~900 ms after it
 * stops. Rendered on a fixed, click-through canvas above the page. Does
 * nothing on touch-only devices or when the user prefers reduced motion.
 */
export default function NeonRibbonCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let points: Point[] = [];
    let target: { x: number; y: number } | null = null;
    let head: { x: number; y: number } | null = null;
    let frame = 0;
    let width = 0;
    let height = 0;
    let enabled = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const n = points.length;
      if (n < 2) return;

      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";

      for (const pass of PASSES) {
        // Each segment runs midpoint → midpoint with the shared point as the
        // control, so consecutive segments meet with matching tangents.
        for (let i = 1; i < n; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const along = i / (n - 1); // 0 at the tail, 1 at the head
          const life = 1 - (now - p1.t) / LIFETIME;
          const strength = Math.max(0, life) * along;
          if (strength < 0.01) continue;

          const [r, g, b] = colorAt(1 - along, pass.white);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pass.alpha * strength})`;
          ctx.lineWidth = (TAIL_WIDTH + (HEAD_WIDTH - TAIL_WIDTH) * along) * pass.width * (0.5 + 0.5 * life);

          const start = i > 1 ? mid(points[i - 2], p0) : p0;
          const end = i < n - 1 ? mid(p0, p1) : p1;
          ctx.lineCap = i === n - 1 ? "round" : "butt";
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.quadraticCurveTo(p0.x, p0.y, end.x, end.y);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (now: number) => {
      frame = 0;

      if (target && head) {
        head.x += (target.x - head.x) * FOLLOW;
        head.y += (target.y - head.y) * FOLLOW;
        const last = points[points.length - 1];
        if (!last || Math.hypot(head.x - last.x, head.y - last.y) > 0.75) {
          points.push({ x: head.x, y: head.y, t: now });
        }
      }

      // Drop points that have fully faded, oldest first.
      let expired = 0;
      while (expired < points.length && now - points[expired].t >= LIFETIME) expired++;
      if (expired) points = points.slice(expired);
      if (points.length > MAX_POINTS) points = points.slice(-MAX_POINTS);

      draw(now);

      const settled = !target || !head || Math.hypot(target.x - head.x, target.y - head.y) < 0.5;
      // Keep animating while there is something to fade or the head is moving;
      // otherwise sleep until the next mouse move.
      if (points.length > 0 || !settled) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target = { x: event.clientX, y: event.clientY };
      if (!head) head = { ...target };
      wake();
    };

    const onLeave = () => {
      target = null;
      head = null;
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      frame = 0;
      points = [];
      target = null;
      head = null;
      ctx.clearRect(0, 0, width, height);
    };

    // Turn the effect on or off as the device or the motion setting changes.
    const update = () => (finePointer.matches && !reducedMotion.matches ? enable() : disable());
    update();
    finePointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);

    return () => {
      finePointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
      disable();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full mix-blend-screen"
    />
  );
}
