// All personal content lives here. Edit this file to make the portfolio yours.

export type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  /** Optional screenshot in /public, e.g. "/images/projects/my-app.png" */
  image?: string;
  /** Optional square logo or app icon; the title's initials are used without one */
  logo?: string;
  /** What kind of project it is, e.g. "iOS & Android app" or "Website" */
  type: string;
  /** Who it was for and when, e.g. "BS Express · 2026" */
  context: string;
  /** Brand color used for the card's glow */
  color: string;
};

export type SocialLabel = "LinkedIn" | "Instagram" | "Telegram" | "GitHub";

export type Job = {
  period: string;
  title: string;
  company: string;
  description?: string;
  highlights?: string[];
  tags?: string[];
  /** "education" entries get a graduation label instead of a job label */
  kind?: "work" | "education";
};

export const site = {
  name: "Hen Kimheang",
  role: "Full-Stack Developer",
  tagline:
    "I build websites, REST APIs and iOS & Android apps, from PHP and MySQL to Vue.js, React Native and TypeScript.",
  location: "Phnom Penh, Cambodia",
  dateOfBirth: "19 June 2003",
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
  // Hero headline: rotates through these every few seconds.
  // The first word is shown in the accent color.
  roles: [
    { first: "Full-Stack", second: "Developer" },
    { first: "Mobile", second: "Developer" },
  ],
  // Hero "~ Introduction" block, shown on the right when the page loads.
  intro: {
    heading: "I build websites, REST APIs and iOS & Android apps",
    text: "From database-driven PHP and MySQL sites to Vue.js front ends and cross-platform apps in React Native, Expo and TypeScript.",
  },
  // Revealed word by word at the end of the hero scroll.
  heroStatement:
    "Full-Stack Developer with hands-on experience across web, back-end and mobile. Right now I'm building the customer and driver apps for BS Express, a parcel delivery company in Cambodia.",
  about: [
    "I'm a Full-Stack Developer from Phnom Penh with hands-on experience across web, back-end and mobile: database-driven websites in PHP and MySQL, RESTful APIs connected to Vue.js front ends, and cross-platform iOS and Android apps built with React Native, Expo and TypeScript.",
    "As a Mobile Developer at BS Express, I build the BS One and BS Driver apps on top of the company's NestJS REST API, part of a wider platform covering branch-to-branch transport, proof of delivery, returns and cash-on-delivery.",
    "I studied Computer Science at the Royal University of Phnom Penh, and I'm keen to keep growing as an engineer across the full stack.",
  ],
  skills: [
    {
      group: "Front-end",
      items: [
        "React",
        "Vue.js",
        "JavaScript",
        "TypeScript",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "Bootstrap",
      ],
    },
    { group: "Back-end", items: ["PHP", "RESTful API design"] },
    { group: "Mobile", items: ["React Native", "Expo", "iOS & Android"] },
    { group: "Databases", items: ["MySQL", "PostgreSQL"] },
    { group: "Tools", items: ["Git", "GitHub"] },
  ],
  languages: ["Khmer (Native)", "English (Intermediate)"],
  // Short line under the Experience heading.
  experienceIntro:
    "From a database-driven product website to the iOS and Android apps that BS Express customers and drivers use every day.",
  experience: [
    {
      period: "May 2026 — Present",
      title: "Mobile Developer",
      company: "BS Express Cambodia",
      highlights: [
        "BS One (iOS & Android): customer app for booking and tracking parcel deliveries and booking bus tickets.",
        "BS Driver (iOS & Android): the app drivers use every day to collect parcels, create shipments between branches and deliver parcels to customers.",
        "Connect both apps to the BS Express NestJS back end through REST APIs, as part of a platform covering manifests and bags, proof of delivery, returns, cash-on-delivery and driver commission settlements.",
      ],
      tags: ["React Native", "Expo", "TypeScript", "REST APIs", "NestJS"],
    },
    {
      period: "Sep 2025 — Mar 2026",
      title: "IT Support Specialist",
      company: "FAST ONE (CAMBODIA) Co., Ltd.",
      highlights: [
        "Provided day-to-day desktop support, diagnosing and fixing hardware, software, network and operating system issues for staff.",
        "Installed and configured printers, network devices and business software, and set up computers for new users.",
        "Handled system updates, backups and antivirus management, and documented recurring issues in an internal knowledge base.",
      ],
    },
    {
      period: "Jun 2024 — Aug 2025",
      title: "Web Developer",
      company: "Camlube (Cambodia) Co., Ltd.",
      highlights: [
        "Built a dynamic, database-driven website for showcasing and selling the company's products.",
        "Developed product listing and detail pages organized by category, with content loaded from a MySQL database.",
        "Created back-end features in PHP so staff could add, update and remove products without editing code.",
      ],
      tags: ["PHP", "MySQL", "JavaScript", "Tailwind CSS"],
    },
    {
      period: "Mar 2022 — May 2025",
      title: "Computer Science",
      company: "Royal University of Phnom Penh",
      kind: "education",
      description:
        "Plus Udemy courses in front-end (HTML5, CSS, Bootstrap, Tailwind, JavaScript, jQuery) and back-end (PHP, MySQL) web development.",
    },
  ] as Job[],
  // Short line beside the Projects heading.
  projectsIntro:
    "A few things I've built at work and at university, from mobile apps used every day to database-driven websites.",
  projects: [
    {
      title: "BS One",
      description:
        "iOS & Android app for BS Express customers to book and track parcel deliveries and book bus tickets.",
      tags: ["React Native", "Expo", "TypeScript", "REST APIs"],
      logo: "/images/projects/bs-one-logo.png",
      type: "iOS & Android app",
      context: "BS Express · 2026",
      color: "#2563eb",
    },
    {
      title: "BS Driver",
      description:
        "The app BS Express drivers use every day to collect parcels, create shipments between branches and deliver parcels to customers.",
      tags: ["React Native", "Expo", "TypeScript", "REST APIs"],
      logo: "/images/projects/bs-driver-logo.png",
      type: "iOS & Android app",
      context: "BS Express · 2026",
      color: "#ea580c",
    },
    {
      title: "Camlube Product Website",
      description:
        "Database-driven website showcasing Camlube's products by category, with a PHP back end so staff can manage products without touching code.",
      tags: ["PHP", "MySQL", "JavaScript", "Tailwind CSS"],
      logo: "/images/projects/camlube-logo.jpg",
      type: "Website",
      context: "Camlube (Cambodia) · 2024–2025",
      color: "#dc2626",
    },
    {
      title: "Scooter E-commerce Platform",
      description:
        "University team project: an online scooter store with brand and color filters, sorting, color variants, a cart and customer accounts. I built the REST APIs and the Vue.js front end.",
      tags: ["Vue.js", "RESTful APIs"],
      type: "Web app",
      context: "University project · 2025",
      color: "#8b7cff",
    },
  ] as Project[],
};

// Scroll-driven hero animation. The frames come from your hero videos via
// `yarn frames:video clip1.mp4 clip2.mp4 ...` (see the README). If you change
// the number of frames, update frameCount to match.
export const heroSequence = {
  frameCount: 240,
  frame: (index: number) =>
    `/sequence/hero/frame-${String(index).padStart(3, "0")}.jpg`,
};
