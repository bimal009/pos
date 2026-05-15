import { boolean, numeric } from "drizzle-orm/pg-core";

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { units } from "../units/units.schema";
export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  nameNepali: text("name_nepali"),
  barcode: text("barcode").unique(),
  sku: text("sku"),
  description: text("description"),
  manufacturer: text("manufacturer"),
  brand: text("brand"),

  unitId: text("unit_id")
    .notNull()
    .references(() => units.id),

  imageUrl: text("image_url"),

  stock: numeric("stock", { precision: 10, scale: 3 }).notNull().default("0"),
  lowStockAlert: boolean("low_stock_alert").notNull().default(false),
  lowStockThreshold: numeric("low_stock_threshold", {
    precision: 10,
    scale: 3,
  }),

  hasVariants: boolean("has_variants").notNull().default(false),
  isUnbranded: boolean("is_unbranded").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const productVariants = pgTable("product_variants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  size: text("size"),
  color: text("color"),
  weight: text("weight"),
  flavor: text("flavor"),
  volume: text("volume"),
  other: text("other"),

  variantLabel: text("variant_label").notNull(),

  barcode: text("barcode").unique(),

  imageUrl: text("image_url"),

  stock: numeric("stock", { precision: 10, scale: 3 }).notNull().default("0"),
  lowStockAlert: boolean("low_stock_alert").notNull().default(false),
  lowStockThreshold: numeric("low_stock_threshold", {
    precision: 10,
    scale: 3,
  }),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
