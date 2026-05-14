import { relations } from "drizzle-orm";
import { stores } from "../stores/stores.schema";
import { userPlans } from "../plans/user-plans.schema";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformRoleEnum = pgEnum("platform_role", ["superadmin", "user"]);
export const userTypeEnum = pgEnum("user_type", ["individual", "company"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  phoneNumber: text("phoneNumber").unique(),
  phoneNumberVerified: boolean("phoneNumberVerified"),
  image: text("image"),

  userType: userTypeEnum("user_type").notNull().default("individual"),
  platformRole: platformRoleEnum("platform_role"),
  isOnboarded: boolean("is_onboarded").notNull().default(false),

  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  stores: many(stores),
  plans: many(userPlans),
}));
