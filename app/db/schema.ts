import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const CATEGORIES = ["Food", "Furniture", "Accessory"] as const;
export type Category = (typeof CATEGORIES)[number];

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  item: text("item").notNull(),
  category: text("category").$type<Category>(),
  amount: real("amount").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
