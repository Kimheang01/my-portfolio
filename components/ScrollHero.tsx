"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroSequence, site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

const isReady = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

// Pins the hero and plays an image sequence on a canvas as you scroll.
// On load the headline and intro blur in from the sides; scrolling sends
// them back out and reveals the "Hello" statement word by word.
export default function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const headlineInnerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introInnerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const helloRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [role, setRole] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setRole((r) => (r + 1) % site.roles.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    const images = Array.from({ length: heroSequence.frameCount }, (_, i) => {
      const img = new Image();
      img.src = heroSequence.frame(i + 1);
      return img;
    });
    const state = { frame: 0 };

    // Draw the current frame, falling back to the nearest earlier frame
    // that has finished loading. Scales like CSS `object-fit: cover`.
    const draw = () => {
      let i = Math.round(state.frame);
      while (i > 0 && !isReady(images[i])) i--;
      const img = images[i];
      if (!isReady(img)) return;

      const { width, height } = canvas;
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };

    // Redraw when a frame at or before the current position finishes loading,
    // since it may be closer than the fallback frame currently shown.
    images.forEach((img, i) =>
      img.addEventListener(
        "load",
        () => {
          if (i <= Math.round(state.frame)) draw();
        },
        { once: true },
      ),
    );
    resize();
    window.addEventListener("resize", resize);

    // Phones and tablets get a shorter scroll and no blur: blurring many
    // layers every frame is costly on mobile GPUs. Reduced motion skips the
    // entrance and the blur; the frames still follow the scroll.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blur = (px: number) => (touch || reduced ? "blur(0px)" : `blur(${px}px)`);

    const css = getComputedStyle(document.documentElement);
    const muted = css.getPropertyValue("--muted").trim();
    const foreground = css.getPropertyValue("--foreground").trim();

    const gsapCtx = gsap.context(() => {
      // Entrance: the inner wrappers blur in from the sides. The outer
      // wrappers are left free for the scroll timeline below.
      if (!reduced) {
        gsap
          .timeline({ delay: 0.2, defaults: { ease: "power3.out" } })
          .from(headlineInnerRef.current, {
            autoAlpha: 0,
            x: -80,
            y: 30,
            filter: blur(14),
            duration: 1,
          })
          .from(
            introInnerRef.current,
            { autoAlpha: 0, x: 80, y: 30, filter: blur(14), duration: 1 },
            "-=0.7",
          );
      }

      gsap.set(helloRef.current, { autoAlpha: 0, filter: blur(18) });
      gsap.set(".hero-word", { opacity: 0.15, filter: blur(8), color: muted });
      gsap.set(buttonRef.current, { autoAlpha: 0, y: 30 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // How far you scroll while the hero is pinned (100% = one screen).
            // Re-measured whenever the window is resized.
            end: () =>
              window.innerWidth < 768 ? "+=100%" : window.innerWidth < 1024 ? "+=250%" : "+=400%",
            invalidateOnRefresh: true,
            pin: true,
            scrub: 0.5,
          },
        })
        .to(
          state,
          {
            frame: heroSequence.frameCount - 1,
            ease: "none",
            duration: 1,
            onUpdate: draw,
          },
          0,
        )
        .to(hintRef.current, { autoAlpha: 0, duration: 0.05 }, 0)
        .to(
          headlineRef.current,
          { autoAlpha: 0, x: -180, y: -40, scale: 0.9, filter: blur(14), ease: "none", duration: 0.2 },
          0.08,
        )
        .to(
          introRef.current,
          { autoAlpha: 0, x: 180, y: -30, scale: 0.92, filter: blur(14), ease: "none", duration: 0.2 },
          0.08,
        )
        .to(
          helloRef.current,
          { autoAlpha: 1, filter: blur(0), ease: "none", duration: 0.15 },
          0.4,
        )
        .to(
          ".hero-word",
          {
            opacity: 1,
            filter: blur(0),
            color: foreground,
            ease: "none",
            duration: 0.08,
            stagger: 0.25 / site.heroStatement.split(" ").length,
          },
          0.5,
        )
        .to(
          buttonRef.current,
          { autoAlpha: 1, y: 0, ease: "none", duration: 0.1 },
          0.85,
        );
    }, section);

    return () => {
      gsapCtx.revert();
      window.removeEventListener("resize", resize);
    };
  }, []);

  const current = site.roles[role];

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative h-svh overflow-hidden bg-background"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-background/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent" />

      <h1 className="sr-only">
        {site.name}, {site.role}
      </h1>

      {/* Left: rotating role headline */}
      <div
        ref={headlineRef}
        className="absolute top-24 left-6 min-[400px]:top-28 sm:top-36 short:top-20 lg:top-44 lg:left-16"
      >
        <div ref={headlineInnerRef} aria-hidden>
          <div className="relative h-[2.05em] w-[calc(100vw-48px)] max-w-[620px] text-display leading-[0.85] font-semibold tracking-[-0.05em] short:text-5xl short:leading-[0.85]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={role}
                className="absolute top-0 left-0"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25 }}
                transition={{ duration: 0.45 }}
              >
                <div className="text-accent [text-shadow:0_12px_24px_rgb(139_124_255/0.35)]">
                  {current.first}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.8, delay: 0.1 }}
                  className="[text-shadow:0_-10px_20px_rgb(0_0_0/0.9)]"
                >
                  {current.second}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="h-1 w-16 bg-accent md:h-1.5 md:w-24" />
        </div>
      </div>

      {/* Right: introduction */}
      <div
        ref={introRef}
        className="absolute right-6 bottom-24 left-6 max-w-[420px] short:hidden md:top-60 md:right-8 md:bottom-auto md:left-auto md:max-w-[330px] lg:top-52 lg:right-20 lg:max-w-[360px]"
      >
        <div ref={introInnerRef}>
          <p className="mb-3 text-xs text-muted italic md:mb-4 lg:mb-6 lg:text-sm">
            ~ Introduction
          </p>
          <h2 className="mb-3 text-intro leading-tight font-medium md:mb-4 lg:mb-6">
            {site.intro.heading}
          </h2>
          <p className="text-sm leading-6 text-muted min-[400px]:leading-7 lg:text-[15px] lg:leading-8">
            {site.intro.text}
          </p>
        </div>
      </div>

      {/* Bottom left: revealed while scrolling */}
      <div
        ref={helloRef}
        className="invisible absolute right-6 bottom-8 left-6 max-w-[680px] opacity-0 short:bottom-5 md:right-auto md:bottom-12 lg:bottom-16 lg:left-16"
      >
        <p className="text-hello font-light tracking-[0.18em] uppercase short:text-3xl md:tracking-[0.24em] lg:tracking-[0.3em]">
          Hello
        </p>
        <p className="mb-4 text-name leading-tight text-accent uppercase short:mb-2 short:text-xl md:mb-6">
          I&apos;m {site.name}
        </p>
        <p className="mb-6 max-w-xl text-sm leading-7 short:mb-3 short:leading-6 md:mb-8 md:text-[15px] md:leading-8">
          {site.heroStatement.split(" ").map((word, i) => (
            <span key={i} className="hero-word mr-[0.3em] inline-block">
              {word}
            </span>
          ))}
        </p>
        <a
          ref={buttonRef}
          href="#experience"
          className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-medium transition hover:border-accent hover:bg-accent/20 active:bg-accent/25 short:py-2"
        >
          View Experience
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>

      <div
        ref={hintRef}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-xs tracking-widest text-muted uppercase short:hidden md:bottom-8"
      >
        Scroll
        <span className="h-8 w-px animate-pulse bg-muted md:h-10" />
      </div>
    </section>
  );
}
