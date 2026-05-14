// src/db/schema/products.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  barcode: text("barcode").unique(),
  category: text("category"),
  manufacturer: text("manufacturer"),
  unit: text("unit"),
  imageUrl: text("image_url"),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const storeProducts = sqliteTable("store_products", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  productId: text("product_id").notNull(),
  price: real("price").notNull(),
  costPrice: real("cost_price"),
  stock: integer("stock").notNull().default(0),
  lowStockAlert: integer("low_stock_alert").default(10),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

// src/db/schema/sales.ts
export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  total: real("total").notNull(),
  discount: real("discount").default(0),
  vatAmount: real("vat_amount").default(0),
  paymentType: text("payment_type").notNull(), // cash | credit | esewa | khalti | split
  customerId: text("customer_id"),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const saleItems = sqliteTable("sale_items", {
  id: text("id").primaryKey(),
  saleId: text("sale_id").notNull(),
  storeProductId: text("store_product_id").notNull(),
  qty: integer("qty").notNull(),
  price: real("price").notNull(),
  costPrice: real("cost_price"),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

// src/db/schema/customers.ts
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  balance: real("balance").notNull().default(0),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const credits = sqliteTable("credits", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  customerId: text("customer_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // credit | payment
  note: text("note"),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

// src/db/schema/expenses.ts
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  note: text("note"),
  imageUrl: text("image_url"),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});
