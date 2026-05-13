CREATE TABLE "store_branches" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"address" text,
	"is_main" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "store_branches" ADD CONSTRAINT "store_branches_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_store_branches_store_id" ON "store_branches" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_branches_is_active" ON "store_branches" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_store_branches_deleted_at" ON "store_branches" USING btree ("deleted_at");