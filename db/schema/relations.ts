// Lets queries load related rows in one call, e.g.
// db.query.projects.findMany({ with: { translations: true, logo: true } }).
import { relations } from "drizzle-orm";
import {
  experiences,
  experienceTranslations,
  profile,
  profileTranslations,
  projects,
  projectTranslations,
  siteSettings,
  siteSettingsTranslations,
  skillCategories,
  skillCategoryTranslations,
  skills,
  skillTranslations,
} from "./content";
import { media } from "./media";

export const profileRelations = relations(profile, ({ one, many }) => ({
  photo: one(media, { fields: [profile.photoMediaId], references: [media.id] }),
  translations: many(profileTranslations),
}));

export const profileTranslationsRelations = relations(profileTranslations, ({ one }) => ({
  profile: one(profile, { fields: [profileTranslations.profileId], references: [profile.id] }),
}));

export const siteSettingsRelations = relations(siteSettings, ({ many }) => ({
  translations: many(siteSettingsTranslations),
}));

export const siteSettingsTranslationsRelations = relations(siteSettingsTranslations, ({ one }) => ({
  settings: one(siteSettings, {
    fields: [siteSettingsTranslations.settingsId],
    references: [siteSettings.id],
  }),
}));

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  translations: many(skillCategoryTranslations),
  skills: many(skills),
}));

export const skillCategoryTranslationsRelations = relations(skillCategoryTranslations, ({ one }) => ({
  category: one(skillCategories, {
    fields: [skillCategoryTranslations.categoryId],
    references: [skillCategories.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  category: one(skillCategories, { fields: [skills.categoryId], references: [skillCategories.id] }),
  translations: many(skillTranslations),
}));

export const skillTranslationsRelations = relations(skillTranslations, ({ one }) => ({
  skill: one(skills, { fields: [skillTranslations.skillId], references: [skills.id] }),
}));

export const experiencesRelations = relations(experiences, ({ many }) => ({
  translations: many(experienceTranslations),
}));

export const experienceTranslationsRelations = relations(experienceTranslations, ({ one }) => ({
  experience: one(experiences, {
    fields: [experienceTranslations.experienceId],
    references: [experiences.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  logo: one(media, {
    fields: [projects.logoMediaId],
    references: [media.id],
    relationName: "projectLogo",
  }),
  image: one(media, {
    fields: [projects.imageMediaId],
    references: [media.id],
    relationName: "projectImage",
  }),
  translations: many(projectTranslations),
}));

export const projectTranslationsRelations = relations(projectTranslations, ({ one }) => ({
  project: one(projects, { fields: [projectTranslations.projectId], references: [projects.id] }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  profilePhotos: many(profile),
  projectLogos: many(projects, { relationName: "projectLogo" }),
  projectImages: many(projects, { relationName: "projectImage" }),
}));
