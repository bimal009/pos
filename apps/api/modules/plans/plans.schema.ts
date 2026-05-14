import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "../user/user.schema";

export const planTierEnum = pgEnum("plan_tier", ["starter", "pro", "business"]);

export interface PlanFeatures {
  maxProducts: number | null;
  maxStores: number | null;
  maxStaff: number | null;
  maxCofounders: number | null;
  maxBranches: number | null;
  creditLedger: boolean;
  automatedSmsReminders: boolean;
  whatsappReminders: boolean;
  salesReports: boolean;
  plReport: boolean;
  vatInvoice: boolean;
  productVariants: boolean;
  cashDrawer: boolean;
  offlineSync: boolean;
  customReceiptBranding: boolean;
  loyaltyPoints: boolean;
  multiStore: boolean;
  multiStaff: boolean;
  staffSalesReports: boolean;
  consolidatedReports: boolean;
  prioritySupport: boolean;
  exportPdf: boolean;
  partiesHandling: boolean;
}

export const plans = pgTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  tier: planTierEnum("tier").notNull().unique(),
  description: text("description"),
  monthlyPrice: integer("monthly_price").notNull().default(0),
  yearlyPrice: integer("yearly_price").notNull().default(0),
  features: jsonb("features").notNull().$type<PlanFeatures>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
