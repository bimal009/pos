import {
  boolean,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "../categories/categories.schema";
import { units } from "../units/units.schema";
import { storeProducts } from "../store-products/store-products.schema";

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  unitId: text("unit_id")
    .notNull()
    .references(() => units.id),

  name: text("name").notNull(),
  nameNepali: text("name_nepali"),
  description: text("description"),
  brand: text("brand"),
  manufacturer: text("manufacturer"),
  imageUrl: text("image_url"),
  barcode: text("barcode").unique(),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  unit: one(units, {
    fields: [products.unitId],
    references: [units.id],
  }),
  storeProducts: many(storeProducts),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductWithRelations = Product & {
  unit: { id: string; name: string; abbreviation: string };
  category: { id: string; name: string; icon: string } | null;
};
