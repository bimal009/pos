import {
  pgTable,
  text,
  boolean,
  timestamp,
  index,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "../categories/categories.schema";
import { user } from "../user/user.schema";
import { storeBranches } from "./branches.schema";
export const shopRoleEnum = pgEnum("shop_role", [
  "owner",
  "cofounder",
  "manager",
  "cashier",
]);
export const taxTypeEnum = pgEnum("tax_type", [
  "none", // no registration
  "pan", // PAN only — simple bill, no VAT
  "vat", // VAT registered — 13% VAT invoice
]);
export const stores = pgTable(
  "stores",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    phone: text("phone"),
    address: text("address"),
    logo: text("logo"),
    isActive: boolean("is_active").notNull().default(true),
    ownerId: text("owner_id").references(() => user.id),
    taxType: taxTypeEnum("tax_type").notNull().default("none"),
    taxNumber: text("tax_number"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_stores_owner_id").on(table.ownerId),
    index("idx_stores_is_active").on(table.isActive),
    index("idx_stores_deleted_at").on(table.deletedAt),
  ],
);

export const storeCategories = pgTable(
  "store_categories",
  {
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [
    primaryKey({ columns: [table.storeId, table.categoryId] }),
    index("idx_store_categories_store_id").on(table.storeId),
    index("idx_store_categories_category_id").on(table.categoryId),
  ],
);

export const storeCategoryRelations = relations(storeCategories, ({ one }) => ({
  store: one(stores, {
    fields: [storeCategories.storeId],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [storeCategories.categoryId],
    references: [categories.id],
  }),
}));

export const storeMembers = pgTable(
  "store_members",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    role: shopRoleEnum("role").notNull().default("cashier"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.storeId] }),
  }),
);

export const storeRelations = relations(stores, ({ one, many }) => ({
  owner: one(user, {
    fields: [stores.ownerId],
    references: [user.id],
  }),
  categories: many(storeCategories),
  branches: many(storeBranches),
}));

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
