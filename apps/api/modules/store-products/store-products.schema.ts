import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { stores } from "../stores/stores.schema";
import { products } from "../products/products.schema";
import type { ProductWithRelations } from "../products/products.schema";
import { storeProductVariants } from "../store-product-variants/store-product-variants.schema";
import type { StoreProductVariant } from "../store-product-variants/store-product-variants.schema";

export const storeProducts = pgTable("store_products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  sku: text("sku"),
  barcode: text("barcode"),

  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("13"),

  stock: numeric("stock", { precision: 10, scale: 3 }).notNull().default("0"),
  lowStockThreshold: numeric("low_stock_threshold", {
    precision: 10,
    scale: 3,
  }),

  hasVariants: boolean("has_variants").notNull().default(false),
  trackInventory: boolean("track_inventory").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),

  attributes: jsonb("attributes").$type<{ name: string; values: string[] }[]>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const storeProductsRelations = relations(
  storeProducts,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [storeProducts.storeId],
      references: [stores.id],
    }),
    product: one(products, {
      fields: [storeProducts.productId],
      references: [products.id],
    }),
    variants: many(storeProductVariants),
  }),
);

export type StoreProduct = typeof storeProducts.$inferSelect;
export type NewStoreProduct = typeof storeProducts.$inferInsert;

export type StoreProductWithRelations = StoreProduct & {
  product: ProductWithRelations;
  variants: StoreProductVariant[];
};
