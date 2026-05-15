import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const units = pgTable("units", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  nameNepali: text("name_nepali"),
  abbreviation: text("abbreviation").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
