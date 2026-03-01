import { desc, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { expenses, type Category } from "../../../db/schema";

export async function getAllExpenses() {
  const rows = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.createdAt));
  return rows;
}

export async function deleteExpensesByIds(ids: number[]) {
  await db.delete(expenses).where(inArray(expenses.id, ids));
}

export async function createExpense({
  item,
  category,
  amount,
}: {
  item: string;
  category: Category | null;
  amount: number;
}) {
  await db
    .insert(expenses)
    .values({ item, category: category ?? undefined, amount });
}
