# My Portfolio

A personal portfolio built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**,
**GSAP ScrollTrigger**, **Framer Motion** and **Lenis** smooth scrolling.

The hero is a scroll-driven image sequence drawn on a `<canvas>`: as you scroll,
the section stays pinned and plays through the frames like a video.

## Getting started

```bash
yarn
yarn dev        # http://localhost:3000
```

## Making it yours

1. **Content** — edit `content/site.ts`. Your name, role, about text, skills,
   experience, projects and social links are all there.
2. **Project screenshots** — put images in `public/images/projects/` and set
   `image: "/images/projects/your-file.png"` on a project.
3. **Colors** — change the CSS variables at the top of `app/globals.css`
   (`--accent` is the highlight color).

## Replacing the hero frames

The frames in `public/sequence/hero/` are cut from video clips with
[ffmpeg](https://ffmpeg.org) (`brew install ffmpeg`). To replace them, pass
your clips in the order they should play. They are joined with cross-fades
and exported as 240 JPG frames:

```bash
yarn frames:video ~/Desktop/hero-3.mp4 ~/Desktop/hero-1.mp4 ~/Desktop/hero-2.mp4
```

Options: `FRAMES=300` for more frames, `QUALITY=5` for sharper (bigger)
frames, `CROP_BOTTOM=60` to trim a watermark. If you change `FRAMES`, set
`heroSequence.frameCount` in `content/site.ts` to match.

Every frame is downloaded when the page loads, so keep the total to a few MB
(240 frames at the default settings is about 7.6 MB).

`yarn frames` regenerates the original abstract placeholder frames (SVG); to
go back to those, set `frameCount: 120` and the `.svg` extension in
`content/site.ts`.

## Project structure

```
app/            layout, page and global styles
components/     ScrollHero, Navbar, About, Experience, Projects, Contact, …
content/site.ts all of your personal content
scripts/        placeholder frame generator
public/         images and hero frames
```

## Deploying

Push to GitHub and import the repo on [Vercel](https://vercel.com/new).
No configuration is needed.
