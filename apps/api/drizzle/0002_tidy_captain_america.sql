CREATE TYPE "public"."role" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"phone" text,
	"address" text,
	"logo" text,
	"category_id" text,
	"owner_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_onboarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_stores_owner_id" ON "stores" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_stores_category_id" ON "stores" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_stores_is_active" ON "stores" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_stores_deleted_at" ON "stores" USING btree ("deleted_at");