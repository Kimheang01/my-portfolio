// The portfolio content as it was before it moved to the database. The seed
// script (scripts/seed.ts) copies it into an empty database, together with the
// text in en.json and km.json next to this file. The site itself reads from
// the database, so editing this file changes nothing on a database that has
// already been seeded.

export type Project = {
  /** Key under Projects.items in en.json and km.json */
  id: "bsOne" | "bsDriver" | "camlube" | "scooter";
  tags: string[];
  href?: string;
  repo?: string;
  /** Optional screenshot in /public, e.g. "/images/projects/my-app.png" */
  image?: string;
  /** Optional square logo or app icon; the monogram is shown without one */
  logo?: string;
  /** Letters shown in place of a logo, e.g. "SE" */
  monogram?: string;
  /** Brand color used for the card's glow */
  color: string;
};

export type SocialLabel = "LinkedIn" | "Instagram" | "Telegram" | "GitHub";

export type Job = {
  /** Key under Experience.items in en.json and km.json */
  id: "bsExpress" | "fastOne" | "camlube" | "rupp";
  company: string;
  /** Start and end month as "YYYY-MM"; no end means it's the current role */
  start: string;
  end?: string;
  tags?: string[];
  /** "education" entries get an education label instead of the company name */
  kind?: "work" | "education";
};

export type SkillGroup = "frontend" | "backend" | "mobile" | "databases" | "tools";

export const site = {
  name: "Hen Kimheang",
  email: "skimheang63@gmail.com",
  photo: "/images/profile-about.jpg",
  // Shown as icons in the footer and as links in the Contact section.
  // A profile with an empty href is hidden until you fill it in.
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/hen-kimheang-b51715345",
      handle: "Hen Kimheang",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/he_xng?mdxt=aXBiamZscG40bmhs&utm_source=qr",
      handle: "@he_xng",
    },
    {
      label: "Telegram",
      href: "https://t.me/Hkim_heang",
      handle: "@Hkim_heang",
    },
    {
      label: "GitHub",
      href: "https://github.com/Kimheang01",
      handle: "Kimheang01",
    },
  ] as { label: SocialLabel; href: string; handle?: string }[],
  // Skill groups in display order; names and items are in About.skills.
  skills: ["frontend", "backend", "mobile", "databases", "tools"] as SkillGroup[],
  experience: [
    {
      id: "bsExpress",
      company: "BS Express Cambodia",
      start: "2026-05",
      tags: ["React Native", "Expo", "TypeScript", "REST APIs", "NestJS"],
    },
    {
      id: "fastOne",
      company: "FAST ONE (CAMBODIA) Co., Ltd.",
      start: "2025-09",
      end: "2026-03",
    },
    {
      id: "camlube",
      company: "Camlube (Cambodia) Co., Ltd.",
      start: "2024-06",
      end: "2025-08",
      tags: ["PHP", "MySQL", "JavaScript", "Tailwind CSS"],
    },
    {
      id: "rupp",
      company: "Royal University of Phnom Penh",
      start: "2022-03",
      end: "2025-05",
      kind: "education",
    },
  ] as Job[],
  projects: [
    {
      id: "bsOne",
      tags: ["React Native", "Expo", "TypeScript", "REST APIs"],
      logo: "/images/projects/bs-one-logo.png",
      color: "#2563eb",
    },
    {
      id: "bsDriver",
      tags: ["React Native", "Expo", "TypeScript", "REST APIs"],
      logo: "/images/projects/bs-driver-logo.png",
      color: "#ea580c",
    },
    {
      id: "camlube",
      tags: ["PHP", "MySQL", "JavaScript", "Tailwind CSS"],
      logo: "/images/projects/camlube-logo.jpg",
      color: "#dc2626",
    },
    {
      id: "scooter",
      tags: ["Vue.js", "RESTful APIs"],
      monogram: "SE",
      color: "#8b7cff",
    },
  ] as Project[],
};
