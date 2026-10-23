// Generates placeholder SVG frames for the scroll-driven hero animation.
// Replace them with frames exported from your own video when you have one.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const COUNT = 120;
const W = 1920;
const H = 1080;
const outDir = new URL("../public/sequence/hero/", import.meta.url);

// Deterministic pseudo-random numbers so every run produces identical frames.
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const rand = rng(42);
const particles = Array.from({ length: 70 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 0.8 + rand() * 2.2,
  depth: 0.3 + rand() * 0.7,
}));

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

function frame(t) {
  const e = ease(t);
  const hue = lerp(258, 190, e);
  const cx = lerp(1360, W / 2, e);
  const cy = lerp(H / 2, H / 2 + 40, e);
  const orb = lerp(170, 360, e);

  const rings = [0, 1, 2]
    .map((i) => {
      const rx = orb + 140 + i * 130;
      const angle = -18 + (i % 2 ? 1 : -1) * t * 140 + i * 25;
      const alpha = 0.55 - i * 0.12;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.32}" transform="rotate(${angle.toFixed(2)} ${cx} ${cy})" fill="none" stroke="hsla(${hue + i * 18},90%,75%,${alpha})" stroke-width="1.6"/>`;
    })
    .join("");

  const dots = particles
    .map((p) => {
      const y = (((p.y - t * 420 * p.depth) % H) + H) % H;
      const x = p.x + Math.sin(t * Math.PI * 2 + p.y) * 30 * p.depth;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="hsla(${hue},80%,85%,${(0.25 + p.depth * 0.5).toFixed(2)})"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<radialGradient id="bg" cx="${(cx / W).toFixed(3)}" cy="0.5" r="0.9">
<stop offset="0" stop-color="hsl(${hue},45%,14%)"/><stop offset="1" stop-color="#0b0b0f"/>
</radialGradient>
<radialGradient id="orb" cx="0.38" cy="0.32" r="0.75">
<stop offset="0" stop-color="hsl(${hue + 20},95%,88%)"/><stop offset="0.45" stop-color="hsl(${hue},85%,62%)"/><stop offset="1" stop-color="hsl(${hue - 20},70%,22%)"/>
</radialGradient>
<radialGradient id="glow"><stop offset="0" stop-color="hsla(${hue},90%,65%,0.45)"/><stop offset="1" stop-color="hsla(${hue},90%,65%,0)"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
${dots}
<circle cx="${cx}" cy="${cy}" r="${orb * 2.2}" fill="url(#glow)"/>
${rings}
<circle cx="${cx}" cy="${cy}" r="${orb}" fill="url(#orb)"/>
</svg>`;
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (let i = 1; i <= COUNT; i++) {
  const name = `frame-${String(i).padStart(3, "0")}.svg`;
  writeFileSync(new URL(name, outDir), frame((i - 1) / (COUNT - 1)));
}
console.log(`Wrote ${COUNT} frames to public/sequence/hero/`);
