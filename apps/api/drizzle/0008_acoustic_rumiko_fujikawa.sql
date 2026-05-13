CREATE TYPE "public"."plan_interval" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('starter', 'pro', 'business');--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('none', 'pan', 'vat');--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tier" "plan_tier" NOT NULL,
	"description" text,
	"monthly_price" integer DEFAULT 0 NOT NULL,
	"yearly_price" integer DEFAULT 0 NOT NULL,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "tax_type" "tax_type" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "tax_number" text;