CREATE TABLE "store_categories" (
	"store_id" text NOT NULL,
	"category_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_category_id_categories_id_fk";
--> statement-breakpoint
DROP INDEX "idx_stores_category_id";--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_store_categories_store_id" ON "store_categories" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_categories_category_id" ON "store_categories" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "category_id";