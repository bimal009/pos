CREATE TYPE "public"."plan_tier" AS ENUM('starter', 'pro', 'business');--> statement-breakpoint
CREATE TYPE "public"."plan_interval" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'expired', 'cancelled', 'grace_period');--> statement-breakpoint
CREATE TYPE "public"."shop_role" AS ENUM('owner', 'cofounder', 'manager', 'cashier');--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('none', 'pan', 'vat');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('superadmin', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"expiresAt" timestamp,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
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
CREATE TABLE "user_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"plan_interval" "plan_interval",
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "store_categories" (
	"store_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "store_categories_store_id_category_id_pk" PRIMARY KEY("store_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "store_members" (
	"user_id" text NOT NULL,
	"store_id" text NOT NULL,
	"role" "shop_role" DEFAULT 'cashier' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_members_user_id_store_id_pk" PRIMARY KEY("user_id","store_id")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"phone" text,
	"address" text,
	"logo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"owner_id" text,
	"tax_type" "tax_type" DEFAULT 'none' NOT NULL,
	"tax_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"phoneNumber" text,
	"phoneNumberVerified" boolean,
	"image" text,
	"user_type" "user_type" DEFAULT 'individual' NOT NULL,
	"platform_role" "platform_role",
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"plan_id" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phoneNumber_unique" UNIQUE("phoneNumber")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_branches" ADD CONSTRAINT "store_branches_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_store_branches_store_id" ON "store_branches" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_branches_is_active" ON "store_branches" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_store_branches_deleted_at" ON "store_branches" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_store_branches_unique_name" ON "store_branches" USING btree ("store_id","name");--> statement-breakpoint
CREATE INDEX "idx_store_categories_store_id" ON "store_categories" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_categories_category_id" ON "store_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_stores_owner_id" ON "stores" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_stores_is_active" ON "stores" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_stores_deleted_at" ON "stores" USING btree ("deleted_at");