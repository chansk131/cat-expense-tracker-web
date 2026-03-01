import type { Expense } from "../db/schema";

/**
 * Given a list of expenses, returns a map of category → boolean where
 * `true` marks every category that shares the highest total spend.
 */
export function computeTopCategories(
  rows: Pick<Expense, "category" | "amount">[],
): Record<string, boolean> {
  const totals = new Map<string, number>();
  for (const e of rows) {
    if (!e.category) {
      continue;
    }
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }

  if (totals.size === 0) {
    return {};
  }

  const max = Math.max(...totals.values());
  return Object.fromEntries(
    [...totals.entries()].map(([k, v]) => [k, v === max]),
  );
}
