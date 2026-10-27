// Portfolio content (profile, links, skills, experience, projects, SEO text)
// lives in the database; see modules/portfolio/public.ts. What's left here is
// part of the site's code rather than its content.

// Scroll-driven hero animation. The frames come from your hero videos via
// `yarn frames:video clip1.mp4 clip2.mp4 ...` (see the README). If you change
// the number of frames, update frameCount to match.
export const heroSequence = {
  frameCount: 240,
  frame: (index: number) =>
    `/sequence/hero/frame-${String(index).padStart(3, "0")}.jpg`,
};
