import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { stores } from "../stores/stores.schema";

export const storeBranches = pgTable(
  "store_branches",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id),
    name: text("name").notNull(),
    phone: text("phone"),
    address: text("address"),
    isMain: boolean("is_main").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_store_branches_store_id").on(table.storeId),
    index("idx_store_branches_is_active").on(table.isActive),
    index("idx_store_branches_deleted_at").on(table.deletedAt),
    index("idx_store_branches_unique_name").on(table.storeId, table.name),
  ],
);

export const storeBranchRelations = relations(storeBranches, ({ one }) => ({
  store: one(stores, {
    fields: [storeBranches.storeId],
    references: [stores.id],
  }),
}));

export type StoreBranch = typeof storeBranches.$inferSelect;
export type NewStoreBranch = typeof storeBranches.$inferInsert;
