CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."experience_kind" AS ENUM('work', 'education');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('en', 'km');--> statement-breakpoint
CREATE TYPE "public"."skill_icon" AS ENUM('frontend', 'backend', 'mobile', 'databases', 'tools');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('LinkedIn', 'Instagram', 'Telegram', 'GitHub');--> statement-breakpoint
CREATE TYPE "public"."media_provider" AS ENUM('local');--> statement-breakpoint
CREATE TABLE "experience_translations" (
	"experience_id" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "experience_translations_experience_id_locale_pk" PRIMARY KEY("experience_id","locale")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "experiences_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"kind" "experience_kind" DEFAULT 'work' NOT NULL,
	"organization" text NOT NULL,
	"start_month" text NOT NULL,
	"end_month" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_slug_unique" UNIQUE("slug"),
	CONSTRAINT "experiences_slug_format" CHECK ("experiences"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "experiences_start_month_format" CHECK ("experiences"."start_month" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
	CONSTRAINT "experiences_end_month_format" CHECK ("experiences"."end_month" is null or ("experiences"."end_month" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' and "experiences"."end_month" >= "experiences"."start_month"))
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"photo_media_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_single_row" CHECK ("profile"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "profile_translations" (
	"profile_id" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"hero_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hero_intro_heading" text DEFAULT '' NOT NULL,
	"hero_intro_text" text DEFAULT '' NOT NULL,
	"hero_statement" text DEFAULT '' NOT NULL,
	"about_paragraphs" text[] DEFAULT '{}'::text[] NOT NULL,
	"spoken_languages" text[] DEFAULT '{}'::text[] NOT NULL,
	CONSTRAINT "profile_translations_profile_id_locale_pk" PRIMARY KEY("profile_id","locale")
);
--> statement-breakpoint
CREATE TABLE "project_translations" (
	"project_id" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"type" text DEFAULT '' NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "project_translations_project_id_locale_pk" PRIMARY KEY("project_id","locale")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"color" text NOT NULL,
	"monogram" text,
	"logo_media_id" integer,
	"image_media_id" integer,
	"href" text,
	"repo" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_slug_format" CHECK ("projects"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "projects_color_format" CHECK ("projects"."color" ~ '^#[0-9a-fA-F]{6}$'),
	CONSTRAINT "projects_href_https" CHECK ("projects"."href" is null or "projects"."href" ~ '^https://'),
	CONSTRAINT "projects_repo_https" CHECK ("projects"."repo" is null or "projects"."repo" ~ '^https://')
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_single_row" CHECK ("site_settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "site_settings_translations" (
	"settings_id" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"meta_title" text DEFAULT '' NOT NULL,
	"meta_description" text DEFAULT '' NOT NULL,
	CONSTRAINT "site_settings_translations_settings_id_locale_pk" PRIMARY KEY("settings_id","locale")
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skill_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" text NOT NULL,
	"icon" "skill_icon" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "skill_category_translations" (
	"category_id" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	CONSTRAINT "skill_category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "skill_translations" (
	"skill_id" integer NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	CONSTRAINT "skill_translations_skill_id_locale_pk" PRIMARY KEY("skill_id","locale")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "socials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"platform" "social_platform" NOT NULL,
	"href" text NOT NULL,
	"handle" text,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "socials_platform_unique" UNIQUE("platform"),
	CONSTRAINT "socials_href_https" CHECK ("socials"."href" ~ '^https://')
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" "media_provider" DEFAULT 'local' NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storageKey_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "experience_translations" ADD CONSTRAINT "experience_translations_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_photo_media_id_media_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_translations" ADD CONSTRAINT "profile_translations_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_logo_media_id_media_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings_translations" ADD CONSTRAINT "site_settings_translations_settings_id_site_settings_id_fk" FOREIGN KEY ("settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_category_translations" ADD CONSTRAINT "skill_category_translations_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_translations" ADD CONSTRAINT "skill_translations_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiences_status_sort_order_index" ON "experiences" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "projects_status_sort_order_index" ON "projects" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "skills_category_id_sort_order_index" ON "skills" USING btree ("category_id","sort_order");