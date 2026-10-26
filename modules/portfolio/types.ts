// The portfolio content the public site shows, in one language. Plain data
// only, so it can be cached and passed to Client Components.
import type {
  experienceKindEnum,
  HeroRole,
  skillIconEnum,
  socialPlatformEnum,
} from "@/db/schema/content";

export type { HeroRole };
export type SocialPlatform = (typeof socialPlatformEnum.enumValues)[number];
export type SkillIcon = (typeof skillIconEnum.enumValues)[number];

export type Profile = {
  name: string;
  email: string;
  /** Image URL, or null when there's no photo */
  photo: string | null;
  role: string;
  location: string;
  heroRoles: HeroRole[];
  heroIntroHeading: string;
  heroIntroText: string;
  heroStatement: string;
  aboutParagraphs: string[];
  spokenLanguages: string[];
};

export type Social = {
  platform: SocialPlatform;
  href: string;
  handle: string | null;
};

export type SkillGroup = {
  key: string;
  icon: SkillIcon;
  name: string;
  skills: string[];
};

export type Job = {
  slug: string;
  kind: (typeof experienceKindEnum.enumValues)[number];
  organization: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM"; null for the current role */
  end: string | null;
  tags: string[];
  title: string;
  /** Jobs list highlights; the education entry has a description */
  highlights: string[];
  description: string;
};

export type Project = {
  slug: string;
  /** "#rrggbb" */
  color: string;
  monogram: string | null;
  logo: string | null;
  image: string | null;
  href: string | null;
  repo: string | null;
  tags: string[];
  title: string;
  type: string;
  context: string;
  description: string;
};

export type Portfolio = {
  profile: Profile;
  seo: { title: string; description: string };
  socials: Social[];
  skillGroups: SkillGroup[];
  experience: Job[];
  projects: Project[];
};
