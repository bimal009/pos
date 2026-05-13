import { plans, planTierEnum } from "./../plans/plans.schema";
import { relations } from "drizzle-orm";
import { stores } from "../stores/stores.schema";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
export const roleEnum = pgEnum("role", [
  "individual",
  "company",
  "user",
  "admin",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  phoneNumber: text("phoneNumber").unique(),
  phoneNumberVerified: boolean("phoneNumberVerified"),
  image: text("image"),
  role: roleEnum("role").notNull().default("user"),
  isOnboarded: boolean("is_onboarded").notNull().default(false),
  plan: planTierEnum("plan").notNull().default("starter"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
export const userRelations = relations(user, ({ many, one }) => ({
  stores: many(stores),
  plan: one(plans, {
    fields: [user.plan],
    references: [plans.tier],
  }),
}));
