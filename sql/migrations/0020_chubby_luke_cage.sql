ALTER TABLE "market_memory_items" ADD COLUMN "countries" text[];--> statement-breakpoint
/*
DROP TYPE "public"."region";--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('EUROPE', 'APAC', 'ASIA', 'EMEA', 'AMERICAS', 'LATAM', 'MENA', 'ANZ', 'SEA', 'OCEANIA', 'AFRICA', 'MIDDLE_EAST', 'GLOBAL');
*/