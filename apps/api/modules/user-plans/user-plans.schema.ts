import { relations } from "drizzle-orm";
import { plans } from "../plans/plans.schema";
import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "../user/user.schema";

export const planIntervalEnum = pgEnum("plan_interval", ["monthly", "yearly"]);

export const planStatusEnum = pgEnum("plan_status", [
  "active",
  "expired",
  "cancelled",
  "grace_period",
]);

export const userPlans = pgTable("user_plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),

  interval: planIntervalEnum("plan_interval"),

  status: planStatusEnum("status").notNull().default("active"),

  startedAt: timestamp("started_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  cancelledAt: timestamp("cancelled_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPlanRelations = relations(userPlans, ({ one }) => ({
  user: one(user, {
    fields: [userPlans.userId],
    references: [user.id],
  }),
  plan: one(plans, {
    fields: [userPlans.planId],
    references: [plans.id],
  }),
}));

export type UserPlan = typeof userPlans.$inferSelect;
export type NewUserPlan = typeof userPlans.$inferInsert;
