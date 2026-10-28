ALTER TABLE "profile_translations" ADD COLUMN "name" text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Keep the existing name: copy it into every language before it is dropped.
UPDATE "profile_translations" AS pt SET "name" = p."name" FROM "profile" AS p WHERE pt."profile_id" = p."id";--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "name";