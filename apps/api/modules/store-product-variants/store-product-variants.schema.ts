import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { storeProducts } from "../store-products/store-products.schema";

export const storeProductVariants = pgTable("store_product_variants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  storeProductId: text("store_product_id")
    .notNull()
    .references(() => storeProducts.id, { onDelete: "cascade" }),

  variantLabel: text("variant_label").notNull(),
  barcode: text("barcode").unique(),
  sku: text("sku"),
  imageUrl: text("image_url"),

  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),

  stock: numeric("stock", { precision: 10, scale: 3 }).notNull().default("0"),
  lowStockThreshold: numeric("low_stock_threshold", {
    precision: 10,
    scale: 3,
  }),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const storeProductVariantsRelations = relations(
  storeProductVariants,
  ({ one }) => ({
    storeProduct: one(storeProducts, {
      fields: [storeProductVariants.storeProductId],
      references: [storeProducts.id],
    }),
  }),
);

export type StoreProductVariant = typeof storeProductVariants.$inferSelect;
export type NewStoreProductVariant = typeof storeProductVariants.$inferInsert;
